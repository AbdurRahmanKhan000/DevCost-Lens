import { createClient } from "@supabase/supabase-js";
import { StoredApiKey, UsageRecord } from "../types";

/**
 * DevCost Lens — Supabase Data Layer
 * 
 * Supports both live Supabase connection (via VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY)
 * and secure local synced cache for preview mode and offline development.
 */

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || import.meta.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || import.meta.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";

export const isSupabaseConfigured = Boolean(
  supabaseUrl &&
  supabaseAnonKey &&
  !supabaseUrl.includes("your-project")
);

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Storage keys for persistent local storage
const LOCAL_KEYS_STORAGE = "devcost_lens_encrypted_keys_v1";
const LOCAL_USAGE_STORAGE = "devcost_lens_usage_logs_v2";
const LOCAL_BUDGET_STORAGE = "devcost_lens_budget_v1";

const INITIAL_USAGE_SEEDS: UsageRecord[] = [];

// Load stored keys
export function getStoredApiKeys(): StoredApiKey[] {
  try {
    const raw = localStorage.getItem(LOCAL_KEYS_STORAGE);
    if (!raw) return [];
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

// Save encrypted key to storage and Supabase if connected
export async function saveEncryptedApiKey(key: StoredApiKey): Promise<StoredApiKey[]> {
  const current = getStoredApiKeys();
  const updated = [key, ...current.filter((k) => k.id !== key.id)];
  localStorage.setItem(LOCAL_KEYS_STORAGE, JSON.stringify(updated));

  if (isSupabaseConfigured) {
    try {
      await supabase.from("encrypted_api_keys").insert({
        id: key.id,
        provider: key.provider,
        key_label: key.keyLabel,
        last_four_chars: key.lastFourChars,
        ciphertext: key.ciphertext,
        iv: key.iv,
        salt: key.salt,
        is_active: true,
      });
    } catch (e) {
      console.warn("Supabase insert encrypted key error (using local storage fallback):", e);
    }
  }

  return updated;
}

// Delete key
export async function deleteStoredApiKey(keyId: string): Promise<StoredApiKey[]> {
  const current = getStoredApiKeys();
  const updated = current.filter((k) => k.id !== keyId);
  localStorage.setItem(LOCAL_KEYS_STORAGE, JSON.stringify(updated));

  if (isSupabaseConfigured) {
    try {
      await supabase.from("encrypted_api_keys").delete().eq("id", keyId);
    } catch (e) {
      console.warn("Supabase delete key error:", e);
    }
  }

  return updated;
}

// Get usage logs
export function getUsageLogs(): UsageRecord[] {
  try {
    const raw = localStorage.getItem(LOCAL_USAGE_STORAGE);
    if (!raw) {
      localStorage.setItem(LOCAL_USAGE_STORAGE, JSON.stringify(INITIAL_USAGE_SEEDS));
      return INITIAL_USAGE_SEEDS;
    }
    return JSON.parse(raw);
  } catch {
    return INITIAL_USAGE_SEEDS;
  }
}

// Append new usage record (from API call or CSV upload)
export async function addUsageRecord(record: Omit<UsageRecord, "id">): Promise<UsageRecord[]> {
  const newRecord: UsageRecord = {
    ...record,
    id: `log-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
  };

  const current = getUsageLogs();
  const updated = [newRecord, ...current];
  localStorage.setItem(LOCAL_USAGE_STORAGE, JSON.stringify(updated));

  if (isSupabaseConfigured) {
    try {
      await supabase.from("usage_logs").insert({
        id: newRecord.id,
        provider: newRecord.provider,
        model_id: newRecord.modelId,
        prompt_tokens: newRecord.promptTokens,
        completion_tokens: newRecord.completionTokens,
        total_tokens: newRecord.totalTokens,
        cost_usd: newRecord.costUSD,
        latency_ms: newRecord.latencyMs,
        request_type: newRecord.requestType,
        project_tag: newRecord.projectTag,
        logged_at: newRecord.loggedAt,
      });
    } catch (e) {
      console.warn("Supabase usage log insert error (local fallback active):", e);
    }
  }

  return updated;
}

// Bulk insert usage records (e.g. from Cursor/Copilot CSV upload)
export async function bulkAddUsageRecords(records: Omit<UsageRecord, "id">[]): Promise<UsageRecord[]> {
  const fullRecords: UsageRecord[] = records.map((r, i) => ({
    ...r,
    id: `csv-${Date.now()}-${i}-${Math.random().toString(36).substring(2, 7)}`,
  }));

  const current = getUsageLogs();
  const updated = [...fullRecords, ...current];
  localStorage.setItem(LOCAL_USAGE_STORAGE, JSON.stringify(updated));

  if (isSupabaseConfigured) {
    try {
      await supabase.from("usage_logs").insert(
        fullRecords.map((r) => ({
          id: r.id,
          provider: r.provider,
          model_id: r.modelId,
          prompt_tokens: r.promptTokens,
          completion_tokens: r.completionTokens,
          total_tokens: r.totalTokens,
          cost_usd: r.costUSD,
          latency_ms: r.latencyMs,
          request_type: r.requestType,
          project_tag: r.projectTag,
          logged_at: r.loggedAt,
        }))
      );
    } catch (e) {
      console.warn("Supabase bulk insert error:", e);
    }
  }

  return updated;
}

// User Monthly Budget
export function getMonthlyBudget(): number {
  try {
    const saved = localStorage.getItem(LOCAL_BUDGET_STORAGE);
    return saved ? parseFloat(saved) : 50.0;
  } catch {
    return 50.0;
  }
}

export function setMonthlyBudget(amount: number) {
  try {
    localStorage.setItem(LOCAL_BUDGET_STORAGE, amount.toFixed(2));
  } catch {
    // ignore
  }
}

// ==========================================================
// PHASE 3: SUBSCRIPTIONS & MONETIZATION
// ==========================================================

const LOCAL_SUB_STORAGE = "devcost_lens_user_subscription_v1";

export interface StoredSubscription {
  planId: "free" | "pro_monthly" | "pro_6months" | "pro_annual";
  planName: string;
  amountPaidUSD: number;
  paymentMethod?: string;
  status: "active" | "pending_verification" | "expired";
  startsAt: string;
  expiresAt?: string;
  isVerified: boolean;
  maxApis: number;
  transactionRef?: string;
}

export async function getUserSubscription(clerkUserId?: string, userEmail?: string): Promise<StoredSubscription> {
  // First check local storage cache
  let currentSub: StoredSubscription = {
    planId: "free",
    planName: "Solo Starter",
    amountPaidUSD: 0,
    status: "active",
    startsAt: new Date().toISOString(),
    isVerified: true,
    maxApis: 2,
  };

  try {
    const raw = localStorage.getItem(LOCAL_SUB_STORAGE);
    if (raw) {
      currentSub = JSON.parse(raw);
    }
  } catch {
    // fallback
  }

  // Next query backend API
  try {
    const res = await fetch(`/api/user/subscription?clerkUserId=${encodeURIComponent(clerkUserId || '')}&userEmail=${encodeURIComponent(userEmail || '')}`);
    if (res.ok) {
      const data = await res.json();
      if (data && data.planId) {
        currentSub = {
          planId: data.planId,
          planName: data.planName,
          amountPaidUSD: data.amountPaidUSD || 0,
          paymentMethod: data.paymentMethod,
          status: data.status,
          startsAt: data.startsAt || new Date().toISOString(),
          expiresAt: data.expiresAt,
          isVerified: data.isVerified ?? (data.status === "active"),
          maxApis: data.maxApis || (data.planId.startsWith("pro") && data.status === "active" ? 999999 : 2),
          transactionRef: data.transactionRef,
        };
        localStorage.setItem(LOCAL_SUB_STORAGE, JSON.stringify(currentSub));
      }
    }
  } catch {
    // offline or static fallback
  }

  return currentSub;
}

export function saveLocalSubscription(sub: StoredSubscription) {
  localStorage.setItem(LOCAL_SUB_STORAGE, JSON.stringify(sub));
}

// Fetch payment instructions from secure backend (AES-GCM decrypted server-side)
export async function getPaymentInstructions(
  method: "easypaisa" | "mastercard" | "card" = "card",
  planId: string = "donation",
  region: "pakistan" | "international" = "pakistan"
) {
  const res = await fetch(`/api/payment/instructions?method=${method}&planId=${planId}&region=${region}`);
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || "Failed to fetch payment details from secure server.");
  }
  return res.json();
}

// Fetch card donation instructions from secure backend (Mastercard, Visa, SadaPay, NayaPay)
export async function getDonationInstructions() {
  const res = await fetch("/api/donation/instructions");
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || "Failed to fetch card donation details from secure server.");
  }
  return res.json();
}

// User submits voluntary card donation
export async function submitDonation(payload: {
  clerkUserId?: string;
  userEmail?: string;
  userName?: string;
  amountUSD: number;
  cardProvider?: string;
  transactionId: string;
  senderAccount?: string;
  message?: string;
}) {
  const res = await fetch("/api/donation/submit", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || "Donation submission failed.");
  }

  return res.json();
}

// User submits payment verification
export async function submitPaymentVerification(payload: {
  clerkUserId?: string;
  userEmail?: string;
  userName?: string;
  planId: string;
  planName: string;
  amountUSD: number;
  paymentMethod: string;
  transactionId: string;
  senderAccount: string;
  senderName: string;
  notesOrReceipt?: string;
}) {
  const res = await fetch("/api/payment/submit", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error || "Payment submission failed.");
  }

  // Update local subscription to pending_verification
  saveLocalSubscription({
    planId: payload.planId as any,
    planName: payload.planName,
    amountPaidUSD: payload.amountUSD,
    paymentMethod: payload.paymentMethod,
    status: "pending_verification",
    startsAt: new Date().toISOString(),
    isVerified: false,
    maxApis: 2,
    transactionRef: payload.transactionId,
  });

  return res.json();
}

// Admin: fetch settings
export async function getAdminPaymentSettings(adminEmail: string) {
  const res = await fetch("/api/admin/payment-settings", {
    headers: {
      "x-admin-email": adminEmail,
    },
  });
  if (!res.ok) {
    throw new Error("Failed to load admin payment settings.");
  }
  return res.json();
}

// Admin: save settings (AES-GCM encrypted on backend)
export async function saveAdminPaymentSettings(data: any, adminEmail: string) {
  const res = await fetch("/api/admin/payment-settings", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-admin-email": adminEmail,
    },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    throw new Error("Failed to save payment settings.");
  }
  return res.json();
}

// Admin: fetch verifications queue
export async function getAdminVerifications(adminEmail: string) {
  const res = await fetch("/api/admin/verifications", {
    headers: {
      "x-admin-email": adminEmail,
    },
  });
  if (!res.ok) {
    throw new Error("Failed to load verifications queue.");
  }
  return res.json();
}

// Admin: approve or reject verification
export async function processVerificationAction(
  id: string,
  action: "approve" | "reject",
  adminEmail: string,
  rejectionReason?: string
) {
  const res = await fetch(`/api/admin/verifications/${id}/action`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-admin-email": adminEmail,
    },
    body: JSON.stringify({ action, rejectionReason }),
  });
  if (!res.ok) {
    throw new Error("Failed to process verification.");
  }
  return res.json();
}

// Admin: direct upgrade user
export async function adminDirectUpgradeUser(
  targetEmail: string,
  targetClerkId: string,
  planId: string,
  adminEmail: string
) {
  const res = await fetch("/api/admin/upgrade-user", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-admin-email": adminEmail,
    },
    body: JSON.stringify({ targetEmail, targetClerkId, planId }),
  });
  if (!res.ok) {
    throw new Error("Failed to upgrade user.");
  }
  return res.json();
}

// Real-Time Supabase Channel Subscription Helper
export function subscribeToRealtimeUsage(onNewLog: (log: UsageRecord) => void) {
  if (!isSupabaseConfigured) return () => {};

  try {
    const channel = supabase
      .channel("public:usage_logs")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "usage_logs" },
        (payload: any) => {
          if (payload.new) {
            onNewLog({
              id: payload.new.id,
              provider: payload.new.provider,
              modelId: payload.new.model_id,
              promptTokens: payload.new.prompt_tokens,
              completionTokens: payload.new.completion_tokens,
              totalTokens: payload.new.total_tokens,
              costUSD: parseFloat(payload.new.cost_usd),
              latencyMs: payload.new.latency_ms,
              requestType: payload.new.request_type,
              projectTag: payload.new.project_tag,
              loggedAt: payload.new.logged_at,
            });
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  } catch (err) {
    console.warn("Realtime subscription error:", err);
    return () => {};
  }
}
