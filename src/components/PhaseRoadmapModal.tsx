import React, { useState } from "react";
import { Badge } from "./ui/Badge";
import { Button } from "./ui/Button";
import { X, Copy, Check, Terminal, Database, KeyRound, Sparkles, ShieldCheck } from "lucide-react";

interface PhaseRoadmapModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const PhaseRoadmapModal: React.FC<PhaseRoadmapModalProps> = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState<"supabase-vercel" | "env" | "schema" | "clerk" | "crypto">("supabase-vercel");
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  if (!isOpen) return null;

  const envVariablesText = `# Clerk Authentication
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/dashboard
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/dashboard

# Database (Supabase or Neon Postgres)
DATABASE_URL=postgresql://postgres:[PASSWORD]@[HOST]:5432/postgres?sslmode=require
NEXT_PUBLIC_SUPABASE_URL=https://[YOUR_PROJECT_REF].supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsIn...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsIn...

# Web Crypto AES-GCM Master Key
APP_ENCRYPTION_MASTER_KEY=generate_32_byte_secret_key

# AI Provider API Keys (For live token pricing & verification)
OPENAI_API_KEY=sk-proj-...
ANTHROPIC_API_KEY=sk-ant-api03-...
GEMINI_API_KEY=AIzaSy...
DEEPSEEK_API_KEY=sk-...`;

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(label);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-3xl rounded-2xl border border-zinc-800 bg-zinc-950 p-6 shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-start justify-between pb-4 border-b border-zinc-800">
          <div>
            <div className="flex items-center gap-2">
              <Badge variant="cyan">Phase 3 Complete</Badge>
              <span className="text-xs font-mono text-emerald-400 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                Monetization & Admin Live
              </span>
            </div>
            <h3 className="text-xl font-bold text-white mt-1">
              DevCost Lens — Production Handover & Monetization Architecture
            </h3>
            <p className="text-xs text-zinc-400 mt-0.5">
              Zero-knowledge encrypted payment instructions (EasyPaisa & MasterCard), subscription verification queue, and Clerk + Supabase setup.
            </p>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg border border-zinc-800 text-zinc-400 hover:text-white hover:bg-zinc-900 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab selector */}
        <div className="flex gap-2 pt-4 pb-3 border-b border-zinc-900 font-mono text-xs overflow-x-auto">
          {[
            { id: "supabase-vercel", label: "Connect Supabase in Vercel", icon: <Database className="w-3.5 h-3.5 text-cyan-400" /> },
            { id: "env", label: "Vercel ENV Variables", icon: <KeyRound className="w-3.5 h-3.5" /> },
            { id: "schema", label: "Postgres Schema (SQL)", icon: <Database className="w-3.5 h-3.5" /> },
            { id: "clerk", label: "Clerk Setup Steps", icon: <Sparkles className="w-3.5 h-3.5" /> },
            { id: "crypto", label: "AES-GCM Web Crypto", icon: <ShieldCheck className="w-3.5 h-3.5" /> },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-colors shrink-0 cursor-pointer ${
                activeTab === tab.id
                  ? "bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 font-semibold"
                  : "bg-zinc-900 text-zinc-400 hover:text-white border border-zinc-800"
              }`}
            >
              {tab.icon}
              <span>{tab.label}</span>
            </button>
          ))}
        </div>

        {/* Tab Body */}
        <div className="flex-1 overflow-y-auto py-4 text-xs font-mono space-y-4">
          {activeTab === "supabase-vercel" && (
            <div className="space-y-4 text-zinc-300 leading-relaxed">
              <div className="p-3 rounded-xl bg-cyan-950/40 border border-cyan-500/30 text-cyan-200">
                <strong>How to Connect Supabase in Vercel (Two Options):</strong>
              </div>

              <div className="space-y-3">
                <h4 className="text-sm font-bold text-white flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-cyan-500 text-zinc-950 flex items-center justify-center text-xs font-bold">1</span>
                  <span>Option A: 1-Click Vercel Marketplace Integration (Recommended)</span>
                </h4>
                <ol className="list-decimal pl-5 space-y-1.5 text-zinc-400 text-xs">
                  <li>In your Vercel Dashboard, go to your <strong>DevCost Lens</strong> project.</li>
                  <li>Click on the <strong>Storage</strong> tab in the top navigation bar.</li>
                  <li>Click <strong>Connect Store</strong> and select <strong>Supabase</strong>.</li>
                  <li>Select your existing Supabase project or create a new one.</li>
                  <li>Vercel automatically provisions and injects <code>NEXT_PUBLIC_SUPABASE_URL</code>, <code>NEXT_PUBLIC_SUPABASE_ANON_KEY</code>, and <code>DATABASE_URL</code> directly into your environment!</li>
                </ol>
              </div>

              <div className="space-y-3 pt-3 border-t border-zinc-800">
                <h4 className="text-sm font-bold text-white flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-cyan-500 text-zinc-950 flex items-center justify-center text-xs font-bold">2</span>
                  <span>Option B: Manual Environment Variables Setup</span>
                </h4>
                <ol className="list-decimal pl-5 space-y-1.5 text-zinc-400 text-xs">
                  <li>Open <a href="https://supabase.com/dashboard" target="_blank" rel="noreferrer" className="text-cyan-400 underline">supabase.com/dashboard</a> and select your project.</li>
                  <li>Go to <strong>Project Settings → API</strong>.</li>
                  <li>Copy <strong>Project URL</strong> and paste it as <code>NEXT_PUBLIC_SUPABASE_URL</code> in Vercel (Project Settings → Environment Variables).</li>
                  <li>Copy <strong>anon / public key</strong> and paste it as <code>NEXT_PUBLIC_SUPABASE_ANON_KEY</code>.</li>
                  <li>Copy <strong>service_role key</strong> and paste it as <code>SUPABASE_SERVICE_ROLE_KEY</code> (keep this server-side only).</li>
                  <li>Go to <strong>Database Settings → Connection string (URI)</strong> and set <code>DATABASE_URL</code>.</li>
                </ol>
              </div>

              <div className="space-y-3 pt-3 border-t border-zinc-800">
                <h4 className="text-sm font-bold text-white flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-emerald-500 text-zinc-950 flex items-center justify-center text-xs font-bold">3</span>
                  <span>Run Database Schema</span>
                </h4>
                <p className="text-xs text-zinc-400">
                  In Supabase, open the <strong>SQL Editor</strong>, paste the contents of <code className="text-cyan-400">src/db/schema.sql</code>, and click <strong>Run</strong>.
                  This initializes the <code className="text-zinc-200">profiles</code>, <code className="text-zinc-200">encrypted_api_keys</code>, and <code className="text-zinc-200">usage_logs</code> tables with Row Level Security.
                </p>
              </div>
            </div>
          )}
          {activeTab === "env" && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-zinc-300 font-bold">
                  All Required Environment Variables for Vercel:
                </span>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => copyToClipboard(envVariablesText, "env")}
                  className="h-7 text-[11px] gap-1.5"
                >
                  {copiedKey === "env" ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedKey === "env" ? "Copied!" : "Copy All Variables"}</span>
                </Button>
              </div>

              <pre className="p-4 rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-300 overflow-x-auto text-[11px] leading-relaxed">
                {envVariablesText}
              </pre>

              <div className="p-3 rounded-lg bg-cyan-950/40 border border-cyan-800/60 text-cyan-300 text-xs">
                💡 <strong>Next Step in Vercel:</strong> Go to Project Settings → Environment Variables, paste these values, and deploy.
              </div>
            </div>
          )}

          {activeTab === "schema" && (
            <div className="space-y-3">
              <p className="text-zinc-300">
                Prepared inside <code className="text-cyan-400">src/db/schema.sql</code>. Paste directly into Supabase SQL Editor or Neon console:
              </p>
              <div className="p-3 rounded-xl bg-zinc-900 border border-zinc-800 space-y-2 text-zinc-300">
                <div className="text-cyan-400 font-bold">1. profiles (Clerk User ID linked)</div>
                <div className="text-emerald-400 font-bold">2. encrypted_api_keys (AES-GCM ciphertext, iv, salt)</div>
                <div className="text-purple-400 font-bold">3. usage_logs (Tokens, latency, cost_usd)</div>
                <div className="text-amber-400 font-bold">4. budget_alerts (Threshold notifications & cheaper alternative recommendations)</div>
                <div className="text-zinc-400 font-bold">5. Row Level Security (RLS) policies configured</div>
              </div>
            </div>
          )}

          {activeTab === "clerk" && (
            <div className="space-y-3 text-zinc-300 leading-relaxed">
              <div className="font-bold text-white text-sm">Clerk Integration Checklist for Phase 2:</div>
              <ol className="list-decimal pl-5 space-y-2">
                <li>Create an application at <a href="https://clerk.com" target="_blank" rel="noreferrer" className="text-cyan-400 underline">dashboard.clerk.com</a></li>
                <li>Enable <strong>Google</strong> and <strong>GitHub</strong> Social Connections under User & Authentication &gt; Social Connections.</li>
                <li>Copy <code>NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY</code> and <code>CLERK_SECRET_KEY</code> into Vercel and your <code>.env.local</code>.</li>
                <li>In Next.js App Router, wrap root layout in <code>&lt;ClerkProvider&gt;</code> and add <code>middleware.ts</code> with <code>clerkMiddleware()</code>.</li>
                <li>The Auth UI already features Google, GitHub, and Email input matching Clerk’s UX requirements!</li>
              </ol>
            </div>
          )}

          {activeTab === "crypto" && (
            <div className="space-y-3 text-zinc-300 leading-relaxed">
              <div className="font-bold text-white text-sm">Client & Edge Web Crypto AES-GCM Logic:</div>
              <p>
                Created in <code className="text-cyan-400">src/lib/crypto.ts</code> using browser-standard <code className="text-zinc-200">crypto.subtle</code>:
              </p>
              <ul className="list-disc pl-5 space-y-1.5 text-xs text-zinc-400">
                <li><strong className="text-white">PBKDF2 Key Derivation:</strong> 100,000 iterations of SHA-256 for cryptographically sound key derivation.</li>
                <li><strong className="text-white">AES-GCM 256-bit:</strong> Authenticated cipher protecting integrity and confidentiality.</li>
                <li><strong className="text-white">Zero Plaintext Exposure:</strong> Only the encrypted ciphertext, IV, salt, and last 4 characters are persisted.</li>
              </ul>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="pt-4 border-t border-zinc-800 flex items-center justify-between">
          <span className="text-zinc-400 text-xs font-mono">
            DevCost Lens v1.0 • Phase 1 Complete
          </span>
          <Button size="sm" onClick={onClose}>
            Close Handover
          </Button>
        </div>
      </div>
    </div>
  );
};
