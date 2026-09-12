import React, { useState } from "react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "./ui/Card";
import { Button } from "./ui/Button";
import { Badge } from "./ui/Badge";
import { Input } from "./ui/Input";
import {
  Check,
  Zap,
  Shield,
  ShieldCheck,
  CreditCard,
  Smartphone,
  ExternalLink,
  Copy,
  CheckCircle2,
  Clock,
  Sparkles,
  Lock,
  ArrowRight,
  AlertCircle,
  HelpCircle,
  TrendingDown,
  X,
} from "lucide-react";
import { useUser } from "@clerk/react";
import {
  getPaymentInstructions,
  submitPaymentVerification,
  getUserSubscription,
  StoredSubscription,
} from "../lib/supabase";

interface PricingPlansPageProps {
  onSelectPlan?: (planId: string) => void;
  onNavigateToVault?: () => void;
  onNavigateToDashboard?: () => void;
}

export const PricingPlansPage: React.FC<PricingPlansPageProps> = ({
  onSelectPlan,
  onNavigateToVault,
  onNavigateToDashboard,
}) => {
  const { user, isSignedIn } = useUser();

  // Active user subscription from local/server state
  const [currentSub, setCurrentSub] = useState<StoredSubscription | null>(null);

  // Upgrade Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedPlanId, setSelectedPlanId] = useState<"pro_monthly" | "pro_6months" | "pro_annual">("pro_annual");
  const [userRegion, setUserRegion] = useState<"pakistan" | "international">(() => {
    try {
      const tz = Intl.DateTimeFormat().resolvedOptions().timeZone.toLowerCase();
      if (tz.includes("karachi") || tz.includes("pakistan") || tz.includes("islamabad")) {
        return "pakistan";
      }
    } catch {
      // fallback
    }
    return "pakistan";
  });
  const [paymentMethod, setPaymentMethod] = useState<"easypaisa" | "mastercard">("easypaisa");

  // Payment Instructions fetched dynamically & securely from backend
  const [isLoadingInstructions, setIsLoadingInstructions] = useState(false);
  const [instructionsData, setInstructionsData] = useState<any>(null);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [hasCopiedAccount, setHasCopiedAccount] = useState(false);

  // Verification Form State
  const [transactionId, setTransactionId] = useState("");
  const [senderAccount, setSenderAccount] = useState("");
  const [senderName, setSenderName] = useState(user?.fullName || "");
  const [notesOrReceipt, setNotesOrReceipt] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState<any>(null);

  // Load user subscription
  React.useEffect(() => {
    getUserSubscription(user?.id, user?.primaryEmailAddress?.emailAddress).then(setCurrentSub);
  }, [user]);

  // Fetch secure instructions from backend whenever modal opens or payment method changes
  const fetchInstructions = async (
    method: "easypaisa" | "mastercard",
    planId: string,
    region: "pakistan" | "international" = userRegion
  ) => {
    setIsLoadingInstructions(true);
    setFetchError(null);
    try {
      const data = await getPaymentInstructions(method, planId, region);
      setInstructionsData(data);
    } catch (err: any) {
      setFetchError(err.message || "Failed to retrieve secure payment instructions.");
    } finally {
      setIsLoadingInstructions(false);
    }
  };

  const handleOpenUpgrade = (planId: "pro_monthly" | "pro_6months" | "pro_annual") => {
    setSelectedPlanId(planId);
    setIsModalOpen(true);
    setSubmitSuccess(null);
    setTransactionId("");
    setSenderAccount("");
    
    // If international, enforce mastercard
    const method = userRegion === "international" ? "mastercard" : paymentMethod;
    if (userRegion === "international") {
      setPaymentMethod("mastercard");
    }
    fetchInstructions(method, planId, userRegion);
  };

  const handleRegionChange = (region: "pakistan" | "international") => {
    setUserRegion(region);
    if (region === "international") {
      setPaymentMethod("mastercard");
      fetchInstructions("mastercard", selectedPlanId, "international");
    } else {
      fetchInstructions(paymentMethod, selectedPlanId, "pakistan");
    }
  };

  const handleMethodChange = (method: "easypaisa" | "mastercard") => {
    if (userRegion === "international" && method === "easypaisa") {
      alert("EasyPaisa is only available for Pakistani users. International users must pay via Card.");
      return;
    }
    setPaymentMethod(method);
    fetchInstructions(method, selectedPlanId, userRegion);
  };

  const handleCopyAccount = (text: string) => {
    navigator.clipboard.writeText(text);
    setHasCopiedAccount(true);
    setTimeout(() => setHasCopiedAccount(false), 2500);
  };

  const handleSubmitVerification = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!transactionId.trim() || !senderAccount.trim() || !senderName.trim()) {
      alert("Please fill in the Transaction ID, Sender Account, and your Name.");
      return;
    }

    setIsSubmitting(true);
    try {
      const result = await submitPaymentVerification({
        clerkUserId: user?.id,
        userEmail: user?.primaryEmailAddress?.emailAddress || "developer@domain.com",
        userName: senderName,
        planId: selectedPlanId,
        planName:
          selectedPlanId === "pro_annual"
            ? "Pro Annual ($100/yr)"
            : selectedPlanId === "pro_6months"
            ? "Pro 6-Months ($60)"
            : "Pro Monthly ($15/mo)",
        amountUSD: instructionsData?.amountUSD || (selectedPlanId === "pro_annual" ? 100 : selectedPlanId === "pro_6months" ? 60 : 15),
        paymentMethod,
        transactionId: transactionId.trim(),
        senderAccount: senderAccount.trim(),
        senderName: senderName.trim(),
        notesOrReceipt: notesOrReceipt.trim(),
      });

      setSubmitSuccess(result);
      getUserSubscription(user?.id, user?.primaryEmailAddress?.emailAddress).then(setCurrentSub);
    } catch (err: any) {
      alert(err.message || "Submission failed. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const isProActive = currentSub?.status === "active" && currentSub.planId.startsWith("pro");

  return (
    <div className="min-h-screen py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="text-center max-w-3xl mx-auto mb-16">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-cyan-500/30 bg-cyan-950/30 text-cyan-300 font-mono text-xs mb-4">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Fair, Transparent Developer Pricing</span>
        </div>
        <h1 className="text-4xl sm:text-5xl font-extrabold text-white tracking-tight font-mono">
          Stop AI Bill Shock. <br />
          <span className="bg-gradient-to-r from-cyan-400 via-teal-300 to-emerald-400 bg-clip-text text-transparent">
            One Model Switch Pays for Your Year.
          </span>
        </h1>
        <p className="mt-4 text-base text-zinc-400 max-w-2xl mx-auto leading-relaxed">
          Free tier covers essential usage for up to 2 API keys. Upgrade to Pro for <strong>unlimited API keys</strong>, live real-time electricity telemetry, shock circuit breakers, and automated model-switch savings.
        </p>

        {/* Current status banner if already pending or pro */}
        {currentSub && currentSub.status === "pending_verification" && (
          <div className="mt-6 p-4 rounded-xl bg-amber-950/40 border border-amber-500/40 text-amber-300 font-mono text-xs inline-flex items-center gap-2.5 shadow-lg">
            <Clock className="w-4 h-4 text-amber-400 animate-pulse" />
            <span>
              Your Pro upgrade verification (TRX #{currentSub.transactionRef || "..."}) is currently <strong>Pending Admin Approval</strong>.
            </span>
          </div>
        )}

        {isProActive && (
          <div className="mt-6 p-4 rounded-xl bg-emerald-950/40 border border-emerald-500/40 text-emerald-300 font-mono text-xs inline-flex items-center gap-2.5 shadow-lg">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>
              You are currently on <strong>{currentSub.planName}</strong> with <strong>Unlimited API Keys</strong> enabled!
            </span>
          </div>
        )}
      </div>

      {/* Pricing Cards Grid (Free + 3 Pro Plans) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 items-stretch">
        {/* FREE STARTER PLAN */}
        <Card className="flex flex-col justify-between border-zinc-800 bg-zinc-900/60 hover:border-zinc-700 transition-all p-6">
          <div>
            <div className="flex justify-between items-start mb-4">
              <div>
                <span className="text-xs font-mono font-bold uppercase tracking-wider text-zinc-400">
                  Starter
                </span>
                <CardTitle className="text-xl font-bold font-mono text-white mt-1">
                  Free Forever
                </CardTitle>
              </div>
              <Badge variant="outline" className="font-mono text-[10px] text-zinc-400 border-zinc-700">
                Solo Dev
              </Badge>
            </div>

            <div className="my-6">
              <div className="flex items-baseline font-mono">
                <span className="text-4xl font-extrabold text-white">$0</span>
                <span className="text-zinc-500 ml-2 text-xs">/ forever</span>
              </div>
              <p className="text-xs text-zinc-400 mt-2 leading-relaxed">
                Essential monitoring for solo tinkerers with up to 2 API providers.
              </p>
            </div>

            <div className="space-y-3 font-mono text-xs text-zinc-300 pt-4 border-t border-zinc-800/80">
              <div className="flex items-center gap-2">
                <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                <span><strong>2 API Keys</strong> maximum</span>
              </div>
              <div className="flex items-center gap-2">
                <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>AES-GCM Web Crypto storage</span>
              </div>
              <div className="flex items-center gap-2">
                <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Basic Token Counter</span>
              </div>
              <div className="flex items-center gap-2">
                <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>4 Core AI Models (OpenAI, Claude, Gemini, DeepSeek)</span>
              </div>
              <div className="flex items-center gap-2 text-zinc-500">
                <span className="w-4 h-4 text-center font-bold">✕</span>
                <span className="line-through">Realtime Live Meter Stream</span>
              </div>
              <div className="flex items-center gap-2 text-zinc-500">
                <span className="w-4 h-4 text-center font-bold">✕</span>
                <span className="line-through">Runaway Loop Circuit Breaker</span>
              </div>
            </div>
          </div>

          <div className="mt-8 pt-4 border-t border-zinc-800">
            <Button
              variant="outline"
              size="md"
              onClick={onNavigateToVault}
              className="w-full font-mono text-xs border-zinc-700 hover:text-white"
            >
              Current Starter Plan
            </Button>
          </div>
        </Card>

        {/* PRO PLAN 1: MONTHLY ($15) */}
        <Card className="flex flex-col justify-between border-zinc-800 bg-zinc-900/60 hover:border-cyan-500/50 transition-all p-6 relative group">
          <div>
            <div className="flex justify-between items-start mb-4">
              <div>
                <span className="text-xs font-mono font-bold uppercase tracking-wider text-cyan-400">
                  Pro Monthly
                </span>
                <CardTitle className="text-xl font-bold font-mono text-white mt-1">
                  Flexible Monthly
                </CardTitle>
              </div>
              <Badge variant="cyan" className="font-mono text-[10px]">
                Monthly
              </Badge>
            </div>

            <div className="my-6">
              <div className="flex items-baseline font-mono">
                <span className="text-4xl font-extrabold text-white">$15</span>
                <span className="text-zinc-500 ml-2 text-xs">/ month</span>
              </div>
              <p className="text-xs text-zinc-400 mt-2 leading-relaxed">
                Full power with no commitment. Cancel anytime.
              </p>
            </div>

            <div className="space-y-3 font-mono text-xs text-zinc-300 pt-4 border-t border-zinc-800/80">
              <div className="flex items-center gap-2">
                <Check className="w-4 h-4 text-cyan-400 shrink-0" />
                <span className="text-white font-bold">Unlimited API Keys</span>
              </div>
              <div className="flex items-center gap-2">
                <Check className="w-4 h-4 text-cyan-400 shrink-0" />
                <span>Continuous Live Electricity Meter</span>
              </div>
              <div className="flex items-center gap-2">
                <Check className="w-4 h-4 text-cyan-400 shrink-0" />
                <span>15+ Models Live Comparison</span>
              </div>
              <div className="flex items-center gap-2">
                <Check className="w-4 h-4 text-cyan-400 shrink-0" />
                <span>Runaway Loop Circuit Breaker</span>
              </div>
              <div className="flex items-center gap-2">
                <Check className="w-4 h-4 text-cyan-400 shrink-0" />
                <span>Automated Cheaper AI Suggester</span>
              </div>
              <div className="flex items-center gap-2">
                <Check className="w-4 h-4 text-cyan-400 shrink-0" />
                <span>Supabase Cloud Sync</span>
              </div>
            </div>
          </div>

          <div className="mt-8 pt-4 border-t border-zinc-800">
            <Button
              variant="default"
              size="md"
              onClick={() => handleOpenUpgrade("pro_monthly")}
              className="w-full font-mono text-xs bg-zinc-800 hover:bg-zinc-700 text-cyan-300 border border-cyan-500/30 font-bold cursor-pointer"
            >
              Upgrade $15 / mo →
            </Button>
          </div>
        </Card>

        {/* PRO PLAN 2: 6-MONTHS ($60 - $10/mo, Save 33%) */}
        <Card className="flex flex-col justify-between border-teal-500/40 bg-zinc-900/80 hover:border-teal-400 transition-all p-6 relative group">
          <div className="absolute -top-3 right-4">
            <span className="px-2.5 py-0.5 rounded-full bg-teal-500 text-zinc-950 font-bold font-mono text-[10px] shadow-md">
              SAVE 33% ($10/mo)
            </span>
          </div>

          <div>
            <div className="flex justify-between items-start mb-4">
              <div>
                <span className="text-xs font-mono font-bold uppercase tracking-wider text-teal-400">
                  Pro 6-Months
                </span>
                <CardTitle className="text-xl font-bold font-mono text-white mt-1">
                  Builder Pass
                </CardTitle>
              </div>
            </div>

            <div className="my-6">
              <div className="flex items-baseline font-mono">
                <span className="text-4xl font-extrabold text-white">$60</span>
                <span className="text-zinc-500 ml-2 text-xs">/ 6 months</span>
              </div>
              <p className="text-xs text-zinc-400 mt-2 leading-relaxed">
                6 months of uninterrupted token protection. Just $10/month.
              </p>
            </div>

            <div className="space-y-3 font-mono text-xs text-zinc-300 pt-4 border-t border-zinc-800/80">
              <div className="flex items-center gap-2">
                <Check className="w-4 h-4 text-teal-400 shrink-0" />
                <span className="text-white font-bold">Unlimited API Keys</span>
              </div>
              <div className="flex items-center gap-2">
                <Check className="w-4 h-4 text-teal-400 shrink-0" />
                <span>Continuous Live Electricity Meter</span>
              </div>
              <div className="flex items-center gap-2">
                <Check className="w-4 h-4 text-teal-400 shrink-0" />
                <span>15+ Models Live Comparison</span>
              </div>
              <div className="flex items-center gap-2">
                <Check className="w-4 h-4 text-teal-400 shrink-0" />
                <span>Runaway Loop Circuit Breaker</span>
              </div>
              <div className="flex items-center gap-2">
                <Check className="w-4 h-4 text-teal-400 shrink-0" />
                <span>Automated Cheaper AI Suggester</span>
              </div>
              <div className="flex items-center gap-2">
                <Check className="w-4 h-4 text-teal-400 shrink-0" />
                <span>Founder Priority Direct Support</span>
              </div>
            </div>
          </div>

          <div className="mt-8 pt-4 border-t border-zinc-800">
            <Button
              variant="default"
              size="md"
              onClick={() => handleOpenUpgrade("pro_6months")}
              className="w-full font-mono text-xs bg-teal-500 hover:bg-teal-400 text-zinc-950 font-bold cursor-pointer"
            >
              Get 6-Month Pass ($60) →
            </Button>
          </div>
        </Card>

        {/* PRO PLAN 3: ANNUAL ($100 - $8.33/mo, Save 45%, BEST VALUE) */}
        <Card className="flex flex-col justify-between border-cyan-500 bg-zinc-900/90 hover:border-cyan-400 shadow-2xl shadow-cyan-500/10 transition-all p-6 relative group ring-1 ring-cyan-500/50">
          <div className="absolute -top-3.5 left-1/2 -translate-x-1/2">
            <span className="px-3 py-1 rounded-full bg-gradient-to-r from-cyan-400 to-emerald-400 text-zinc-950 font-extrabold font-mono text-[10px] shadow-lg flex items-center gap-1">
              <Sparkles className="w-3 h-3" />
              <span>BEST VALUE • SAVE 45%</span>
            </span>
          </div>

          <div>
            <div className="flex justify-between items-start mb-4">
              <div>
                <span className="text-xs font-mono font-bold uppercase tracking-wider text-cyan-300">
                  Pro Annual
                </span>
                <CardTitle className="text-xl font-bold font-mono text-white mt-1">
                  Founder Annual
                </CardTitle>
              </div>
              <Badge variant="cyan" className="font-mono text-[10px]">
                $8.33/mo
              </Badge>
            </div>

            <div className="my-6">
              <div className="flex items-baseline font-mono">
                <span className="text-4xl font-extrabold text-white">$100</span>
                <span className="text-zinc-500 ml-2 text-xs">/ year</span>
              </div>
              <p className="text-xs text-zinc-400 mt-2 leading-relaxed">
                Full 365 days of unlimited API telemetry. The single best investment for AI builders.
              </p>
            </div>

            <div className="space-y-3 font-mono text-xs text-zinc-200 pt-4 border-t border-zinc-800/80">
              <div className="flex items-center gap-2">
                <Check className="w-4 h-4 text-cyan-400 shrink-0" />
                <span className="text-white font-bold">Unlimited API Keys (Any Provider)</span>
              </div>
              <div className="flex items-center gap-2">
                <Check className="w-4 h-4 text-cyan-400 shrink-0" />
                <span>Continuous Live Electricity Meter</span>
              </div>
              <div className="flex items-center gap-2">
                <Check className="w-4 h-4 text-cyan-400 shrink-0" />
                <span>15+ Models Live Comparison</span>
              </div>
              <div className="flex items-center gap-2">
                <Check className="w-4 h-4 text-cyan-400 shrink-0" />
                <span>Instant Runaway Circuit Breaker</span>
              </div>
              <div className="flex items-center gap-2">
                <Check className="w-4 h-4 text-cyan-400 shrink-0" />
                <span>Telegram / Slack / Discord Webhooks</span>
              </div>
              <div className="flex items-center gap-2">
                <Check className="w-4 h-4 text-cyan-400 shrink-0" />
                <span>Multi-Project Tagging & Tax CSV Export</span>
              </div>
              <div className="flex items-center gap-2">
                <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                <span className="text-emerald-300 font-bold">Direct Founder 1-on-1 Onboarding</span>
              </div>
            </div>
          </div>

          <div className="mt-8 pt-4 border-t border-zinc-800">
            <Button
              variant="default"
              size="md"
              onClick={() => handleOpenUpgrade("pro_annual")}
              className="w-full font-mono text-xs bg-gradient-to-r from-cyan-400 via-teal-300 to-emerald-400 hover:opacity-90 text-zinc-950 font-bold shadow-lg shadow-cyan-500/20 cursor-pointer"
            >
              Get Pro Annual ($100/yr) →
            </Button>
          </div>
        </Card>
      </div>

      {/* DETAILED COMPARISON TABLE */}
      <div className="mt-20">
        <div className="text-center mb-10">
          <h2 className="text-2xl sm:text-3xl font-bold font-mono text-white">
            Plan Feature Comparison Matrix
          </h2>
          <p className="text-xs text-zinc-400 mt-2 font-mono">
            Clear technical breakdown of Free vs Pro tiers.
          </p>
        </div>

        <div className="overflow-x-auto rounded-2xl border border-zinc-800 bg-zinc-950/60 shadow-xl">
          <table className="w-full text-left font-mono text-xs">
            <thead>
              <tr className="border-b border-zinc-800 bg-zinc-900/80">
                <th className="p-4 text-zinc-400 font-semibold w-2/5">Capability / Feature</th>
                <th className="p-4 text-zinc-300 font-semibold text-center w-1/5">Free Starter</th>
                <th className="p-4 text-cyan-300 font-semibold text-center w-1/5">Pro Monthly ($15)</th>
                <th className="p-4 text-emerald-400 font-semibold text-center w-1/5">Pro Annual ($100)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800/60 text-zinc-300">
              <tr>
                <td className="p-4 font-bold text-white">API Keys Capacity</td>
                <td className="p-4 text-center text-zinc-400">2 API Keys Max</td>
                <td className="p-4 text-center font-bold text-cyan-400">Unlimited</td>
                <td className="p-4 text-center font-bold text-emerald-400">Unlimited</td>
              </tr>
              <tr>
                <td className="p-4 font-bold text-white">AES-GCM Web Crypto Zero-Knowledge</td>
                <td className="p-4 text-center text-emerald-400">✓ Included</td>
                <td className="p-4 text-center text-emerald-400">✓ Included</td>
                <td className="p-4 text-center text-emerald-400">✓ Included</td>
              </tr>
              <tr>
                <td className="p-4 font-bold text-white">Live AI Electricity Meter Telemetry</td>
                <td className="p-4 text-center text-zinc-400">Basic refresh</td>
                <td className="p-4 text-center text-cyan-400">Continuous Stream</td>
                <td className="p-4 text-center text-emerald-400">Continuous Stream</td>
              </tr>
              <tr>
                <td className="p-4 font-bold text-white">AI Models Catalog & Pricing Calculator</td>
                <td className="p-4 text-center text-zinc-400">4 Base Models</td>
                <td className="p-4 text-center text-cyan-400">15+ Live Models</td>
                <td className="p-4 text-center text-emerald-400">15+ Live Models + Phase 4</td>
              </tr>
              <tr>
                <td className="p-4 font-bold text-white">Automated Cheaper Model Recommendation</td>
                <td className="p-4 text-center text-zinc-500">✕</td>
                <td className="p-4 text-center text-cyan-400">✓ Realtime Savings Diff</td>
                <td className="p-4 text-center text-emerald-400">✓ Realtime Savings Diff</td>
              </tr>
              <tr>
                <td className="p-4 font-bold text-white">Runaway Loop Circuit Breaker</td>
                <td className="p-4 text-center text-zinc-500">Manual Only</td>
                <td className="p-4 text-center text-cyan-400">✓ Velocity Threshold</td>
                <td className="p-4 text-center text-emerald-400">✓ Velocity Threshold</td>
              </tr>
              <tr>
                <td className="p-4 font-bold text-white">Webhooks (Telegram, Slack, Discord)</td>
                <td className="p-4 text-center text-zinc-500">✕</td>
                <td className="p-4 text-center text-cyan-400">✓ Webhook Dispatch</td>
                <td className="p-4 text-center text-emerald-400">✓ Webhook Dispatch</td>
              </tr>
              <tr>
                <td className="p-4 font-bold text-white">Multi-Project Tags & Tax CSV Export</td>
                <td className="p-4 text-center text-zinc-500">✕</td>
                <td className="p-4 text-center text-zinc-300">Basic CSV</td>
                <td className="p-4 text-center text-emerald-400">✓ Full Tax & Audit CSV</td>
              </tr>
              <tr>
                <td className="p-4 font-bold text-white">Founder Priority Support</td>
                <td className="p-4 text-center text-zinc-400">GitHub Community</td>
                <td className="p-4 text-center text-cyan-300">24-Hour Email</td>
                <td className="p-4 text-center text-emerald-400 font-bold">1-on-1 Founder Direct</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* SENSITIVE PAYMENT POPUP MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="relative w-full max-w-xl rounded-2xl bg-zinc-950 border border-zinc-800 shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-5 border-b border-zinc-800 bg-zinc-900/50">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold font-mono text-white">
                    Upgrade to {selectedPlanId === "pro_annual" ? "Pro Annual ($100)" : selectedPlanId === "pro_6months" ? "Pro 6-Months ($60)" : "Pro Monthly ($15)"}
                  </h3>
                  <p className="text-[11px] text-zinc-400 font-mono">
                    Instant Activation upon Verification
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-zinc-400 hover:text-white p-1 rounded-lg hover:bg-zinc-800 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6 max-h-[80vh] overflow-y-auto font-mono text-xs">
              {submitSuccess ? (
                <div className="text-center py-6 space-y-4">
                  <div className="w-16 h-16 rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center mx-auto text-emerald-400">
                    <CheckCircle2 className="w-10 h-10" />
                  </div>
                  <h4 className="text-lg font-bold text-white">Payment Proof Received!</h4>
                  <p className="text-zinc-300 text-xs leading-relaxed max-w-md mx-auto">
                    Your Transaction ID <strong className="text-emerald-400 font-mono">{transactionId}</strong> has been submitted to the Admin Verification Queue.
                  </p>

                  <div className="p-4 rounded-xl bg-zinc-900 border border-zinc-800 text-left space-y-2 text-xs">
                    <div><strong>Plan:</strong> {submitSuccess.submission?.planName}</div>
                    <div><strong>Amount:</strong> ${submitSuccess.submission?.amountUSD} USD</div>
                    <div><strong>Method:</strong> {submitSuccess.submission?.paymentMethod?.toUpperCase()}</div>
                    <div><strong>Status:</strong> <span className="text-amber-400 font-bold uppercase">Pending Verification</span></div>
                    <div className="text-[10px] text-zinc-500 pt-1">
                      Our administrator verifies submissions and upgrades your account to Unlimited API Keys.
                    </div>
                  </div>

                  <div className="pt-2">
                    <Button
                      onClick={() => setIsModalOpen(false)}
                      className="w-full bg-cyan-500 hover:bg-cyan-400 text-zinc-950 font-bold"
                    >
                      Done & Return to DevCost Lens
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="space-y-5">
                  {/* Step 1: Select Location */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <label className="text-zinc-300 font-semibold">
                        Step 1: Your Location
                      </label>
                      <span className="text-[10px] text-zinc-400">
                        {userRegion === "pakistan" ? "🇵🇰 Pakistan" : "🌐 Other Countries"}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-2.5">
                      <button
                        type="button"
                        onClick={() => handleRegionChange("pakistan")}
                        className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                          userRegion === "pakistan"
                            ? "border-emerald-500/80 bg-emerald-950/20 text-emerald-300 shadow-sm"
                            : "border-zinc-800 bg-zinc-900/60 text-zinc-400 hover:border-zinc-700"
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <span className="text-base">🇵🇰</span>
                          <span className="font-bold text-white text-xs">Pakistan</span>
                        </div>
                        <div className="text-[10px] text-emerald-400/90 mt-1">
                          EasyPaisa & Card
                        </div>
                      </button>

                      <button
                        type="button"
                        onClick={() => handleRegionChange("international")}
                        className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                          userRegion === "international"
                            ? "border-cyan-500/80 bg-cyan-950/20 text-cyan-300 shadow-sm"
                            : "border-zinc-800 bg-zinc-900/60 text-zinc-400 hover:border-zinc-700"
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <span className="text-base">🌐</span>
                          <span className="font-bold text-white text-xs">Other Countries</span>
                        </div>
                        <div className="text-[10px] text-amber-300/90 mt-1">
                          Card payments only
                        </div>
                      </button>
                    </div>
                  </div>

                  {/* Step 2: Choose Payment Method */}
                  <div>
                    <label className="block text-zinc-300 font-semibold mb-2">
                      Step 2: Payment Method
                    </label>
                    <div className="grid grid-cols-2 gap-3">
                      {/* EasyPaisa (Only enabled for Pakistani users) */}
                      <button
                        type="button"
                        disabled={userRegion === "international"}
                        onClick={() => handleMethodChange("easypaisa")}
                        className={`p-3 rounded-xl border text-left flex items-center gap-3 transition-all ${
                          userRegion === "international"
                            ? "opacity-40 cursor-not-allowed border-zinc-800 bg-zinc-950 text-zinc-600"
                            : paymentMethod === "easypaisa"
                            ? "border-emerald-500/80 bg-emerald-950/20 text-emerald-300 shadow-md cursor-pointer"
                            : "border-zinc-800 bg-zinc-900/60 text-zinc-400 hover:border-zinc-700 cursor-pointer"
                        }`}
                      >
                        <Smartphone className="w-5 h-5 text-emerald-400 shrink-0" />
                        <div>
                          <div className="font-bold text-white text-xs flex items-center gap-1.5">
                            <span>EasyPaisa</span>
                            <span className="text-[9px] px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                              PKR
                            </span>
                          </div>
                          <div className="text-[10px] text-zinc-400">
                            {userRegion === "international" ? "Pakistan only" : "Mobile App / PKR"}
                          </div>
                        </div>
                      </button>

                      {/* Card / Bank */}
                      <button
                        type="button"
                        onClick={() => handleMethodChange("mastercard")}
                        className={`p-3 rounded-xl border text-left flex items-center gap-3 transition-all cursor-pointer ${
                          paymentMethod === "mastercard"
                            ? "border-cyan-500/80 bg-cyan-950/20 text-cyan-300 shadow-md"
                            : "border-zinc-800 bg-zinc-900/60 text-zinc-400 hover:border-zinc-700"
                        }`}
                      >
                        <CreditCard className="w-5 h-5 text-amber-400 shrink-0" />
                        <div>
                          <div className="font-bold text-white text-xs flex items-center gap-1.5">
                            <span>Card</span>
                            <span className="text-[9px] px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">
                              USD
                            </span>
                          </div>
                          <div className="text-[10px] text-zinc-400">Debit / Credit Card</div>
                        </div>
                      </button>
                    </div>

                    {userRegion === "international" && (
                      <div className="mt-2 text-[11px] text-amber-400/90 flex items-center gap-1.5 bg-amber-950/20 border border-amber-500/20 p-2 rounded-lg">
                        <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                        <span>EasyPaisa is only for Pakistani users. International users please pay via Card.</span>
                      </div>
                    )}
                  </div>

                  {/* Step 3: Payment Instructions */}
                  <div>
                    <label className="block text-zinc-300 font-semibold mb-2">
                      Step 3: Payment Instructions
                    </label>

                    {isLoadingInstructions ? (
                      <div className="p-6 rounded-xl border border-zinc-800 bg-zinc-900/60 text-center text-zinc-400 animate-pulse">
                        Loading secure payment details...
                      </div>
                    ) : fetchError ? (
                      <div className="p-4 rounded-xl border border-rose-500/40 bg-rose-950/30 text-rose-400">
                        {fetchError}
                      </div>
                    ) : instructionsData ? (
                      <div className="p-4 rounded-xl border border-cyan-500/30 bg-zinc-900/90 space-y-3">
                        {/* Amount Bar */}
                        <div className="flex items-center justify-between pb-2 border-b border-zinc-800">
                          <span className="text-zinc-400 text-xs">Total Amount:</span>
                          <div className="text-right">
                            <span className="text-lg font-extrabold text-white">
                              ${instructionsData.amountUSD} USD
                            </span>
                            {instructionsData.approxPKR && paymentMethod === "easypaisa" && (
                              <span className="text-xs text-emerald-400 font-bold block">
                                (~Rs. {instructionsData.approxPKR.toLocaleString()} PKR)
                              </span>
                            )}
                          </div>
                        </div>

                        {/* If EasyPaisa: show recipient phone number and title */}
                        {paymentMethod === "easypaisa" && instructionsData.accountNumber && (
                          <div>
                            <span className="text-zinc-400 text-[11px] block">
                              EasyPaisa Receiving Number:
                            </span>
                            <div className="flex items-center justify-between mt-1 p-2.5 rounded-lg bg-zinc-950 border border-zinc-800">
                              <span className="text-sm font-extrabold text-emerald-300 tracking-wider select-all">
                                {instructionsData.accountNumber}
                              </span>
                              <button
                                type="button"
                                onClick={() => handleCopyAccount(instructionsData.accountNumber)}
                                className="px-2.5 py-1 rounded bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-[10px] flex items-center gap-1 transition-colors cursor-pointer"
                              >
                                {hasCopiedAccount ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                                <span>{hasCopiedAccount ? "Copied!" : "Copy"}</span>
                              </button>
                            </div>

                            <div className="mt-2 text-xs flex justify-between">
                              <span className="text-zinc-400">Account Title:</span>
                              <span className="font-bold text-white">{instructionsData.accountTitle}</span>
                            </div>

                            <div className="p-2.5 mt-2 rounded-lg bg-zinc-950/80 border border-zinc-800 text-[11px] text-zinc-300 space-y-1">
                              <div>1. Open your <strong>EasyPaisa App</strong> and tap <strong>Send Money</strong>.</div>
                              <div>2. Enter number <strong>{instructionsData.accountNumber}</strong> and transfer <strong>Rs. {instructionsData.approxPKR?.toLocaleString()}</strong>.</div>
                              <div>3. Copy the 11-digit <strong>Transaction ID (TRX ID)</strong> from the SMS or app and paste below.</div>
                            </div>
                          </div>
                        )}

                        {/* If Card: show card number if configured, or inform user */}
                        {paymentMethod === "mastercard" && (
                          <div>
                            {instructionsData.isConfigured ? (
                              <div className="space-y-2">
                                <span className="text-zinc-400 text-[11px] block">
                                  Card / Account Number:
                                </span>
                                <div className="flex items-center justify-between p-2.5 rounded-lg bg-zinc-950 border border-zinc-800">
                                  <span className="text-sm font-extrabold text-cyan-300 tracking-wider select-all">
                                    {instructionsData.accountNumber}
                                  </span>
                                  <button
                                    type="button"
                                    onClick={() => handleCopyAccount(instructionsData.accountNumber)}
                                    className="px-2.5 py-1 rounded bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-[10px] flex items-center gap-1 transition-colors cursor-pointer"
                                  >
                                    {hasCopiedAccount ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                                    <span>{hasCopiedAccount ? "Copied!" : "Copy"}</span>
                                  </button>
                                </div>
                                <div className="grid grid-cols-2 gap-2 text-xs">
                                  <div>
                                    <span className="text-zinc-400 text-[10px]">Cardholder:</span>
                                    <div className="font-bold text-white mt-0.5">{instructionsData.accountTitle}</div>
                                  </div>
                                  <div>
                                    <span className="text-zinc-400 text-[10px]">Bank:</span>
                                    <div className="font-bold text-white mt-0.5">{instructionsData.bankName}</div>
                                  </div>
                                </div>
                              </div>
                            ) : (
                              <div className="p-3 rounded-lg bg-amber-950/20 border border-amber-500/30 text-amber-200 text-xs space-y-1.5">
                                <div className="font-bold flex items-center gap-1.5 text-amber-300">
                                  <CreditCard className="w-4 h-4" />
                                  <span>Card Gateway Receiving Account</span>
                                </div>
                                <p className="text-zinc-300 text-[11px] leading-relaxed">
                                  The card receiving account number is currently being configured by the administrator.
                                </p>
                                {userRegion === "pakistan" && (
                                  <p className="text-emerald-300 text-[11px]">
                                    👉 Pakistani users: Switch to <strong>EasyPaisa</strong> above for instant activation.
                                  </p>
                                )}
                                <p className="text-zinc-400 text-[10px]">
                                  For direct invoice or bank wire inquiry, submit your details below or contact <strong>arkmfk27@gmail.com</strong>.
                                </p>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    ) : null}
                  </div>

                  {/* Step 4: Transaction Proof Form */}
                  <form onSubmit={handleSubmitVerification} className="space-y-3 pt-1">
                    <label className="block text-zinc-300 font-semibold">
                      Step 4: Enter Verification Details
                    </label>

                    <div>
                      <label className="block text-[11px] text-zinc-400 mb-1">
                        Transaction ID (TRX ID from SMS/Receipt) *
                      </label>
                      <Input
                        type="text"
                        required
                        placeholder="e.g. 29384910294 or REF-84920"
                        value={transactionId}
                        onChange={(e) => setTransactionId(e.target.value)}
                        className="bg-zinc-950 border-zinc-800 font-mono text-xs text-emerald-300"
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[11px] text-zinc-400 mb-1">
                          Sender Phone / Account *
                        </label>
                        <Input
                          type="text"
                          required
                          placeholder="e.g. 0321XXXXXX or Card 4242"
                          value={senderAccount}
                          onChange={(e) => setSenderAccount(e.target.value)}
                          className="bg-zinc-950 border-zinc-800 font-mono text-xs"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] text-zinc-400 mb-1">
                          Your Full Name *
                        </label>
                        <Input
                          type="text"
                          required
                          placeholder="e.g. John Doe"
                          value={senderName}
                          onChange={(e) => setSenderName(e.target.value)}
                          className="bg-zinc-950 border-zinc-800 font-mono text-xs"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-[11px] text-zinc-400 mb-1">
                        Optional Note or Screenshot Link
                      </label>
                      <Input
                        type="text"
                        placeholder="e.g. Paid via EasyPaisa screenshot or reference"
                        value={notesOrReceipt}
                        onChange={(e) => setNotesOrReceipt(e.target.value)}
                        className="bg-zinc-950 border-zinc-800 font-mono text-xs"
                      />
                    </div>

                    <div className="pt-2">
                      <Button
                        type="submit"
                        disabled={isSubmitting || isLoadingInstructions}
                        className="w-full font-mono text-xs bg-cyan-500 hover:bg-cyan-400 text-zinc-950 font-bold h-10 shadow-lg shadow-cyan-500/20 cursor-pointer"
                      >
                        {isSubmitting ? "Submitting for Verification..." : "Submit Payment for Instant Activation →"}
                      </Button>
                    </div>
                  </form>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
