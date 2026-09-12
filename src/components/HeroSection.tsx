import React, { useState, useEffect } from "react";
import { Button } from "./ui/Button";
import { Badge } from "./ui/Badge";
import { ElectricityMeterWidget } from "./ElectricityMeterWidget";
import { ArrowRight, ShieldCheck, Zap, Sparkles, Terminal, Layers, UserPlus, Phone, Mail } from "lucide-react";
import { useUser, useAuth, SignUpButton } from "@clerk/react";

interface HeroSectionProps {
  onGetStarted: () => void;
  onPromptCheck: () => void;
  onExplorePricing: () => void;
}

export const HeroSection: React.FC<HeroSectionProps> = ({
  onGetStarted,
  onPromptCheck,
  onExplorePricing,
}) => {
  const { user, isSignedIn: userSignedIn } = useUser();
  const { isSignedIn: authSignedIn, userId } = useAuth();

  const [cachedUser, setCachedUser] = useState<{
    phoneNumber?: string;
    email?: string;
  } | null>(() => {
    try {
      const raw = localStorage.getItem("devcost_auth_user");
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  });

  const isAuthed = Boolean(
    userSignedIn ||
    authSignedIn ||
    Boolean(user) ||
    Boolean(userId) ||
    Boolean(cachedUser?.phoneNumber || cachedUser?.email)
  );

  const displayIdentifier =
    user?.primaryPhoneNumber?.phoneNumber ||
    user?.phoneNumbers?.[0]?.phoneNumber ||
    cachedUser?.phoneNumber ||
    user?.primaryEmailAddress?.emailAddress ||
    cachedUser?.email;
  return (
    <section className="relative pt-12 pb-20 md:pt-20 md:pb-28 overflow-hidden">
      {/* Background Ambient Radial Gradients */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-[600px] pointer-events-none opacity-40">
        <div className="absolute top-10 left-1/4 w-96 h-96 bg-cyan-500/20 rounded-full blur-3xl" />
        <div className="absolute top-20 right-1/4 w-96 h-96 bg-emerald-500/15 rounded-full blur-3xl" />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center max-w-3xl mx-auto mb-12">
          {/* Top Pill */}
          <div className="inline-flex items-center gap-2 mb-6">
            <Badge variant="cyan" className="py-1 px-3">
              <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
              <span>Smart Electricity Meter for AI</span>
            </Badge>
          </div>

          {/* Attractive Headline */}
          <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold tracking-tight text-white leading-[1.08]">
            Stop AI{" "}
            <span className="bg-gradient-to-r from-cyan-400 via-teal-300 to-emerald-400 bg-clip-text text-transparent">
              Bill Shock.
            </span>
          </h1>

          {/* Sub-headline */}
          <p className="mt-6 text-lg sm:text-xl text-zinc-300 leading-relaxed font-normal">
            Solo developers lose hundreds every month on unmonitored tokens, agent loops, and expensive reasoning calls.
            DevCost Lens acts as a real-time smart meter for OpenAI GPT (GPT-4.5, o1, GPT-4o) and Anthropic Claude (Opus, Sonnet, Haiku).
          </p>

          {/* Call-To-Action Group */}
          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
            {!isAuthed ? (
              <SignUpButton mode="modal">
                <Button
                  size="lg"
                  className="w-full sm:w-auto text-base px-8 h-12 shadow-lg shadow-cyan-500/25 cursor-pointer font-mono"
                >
                  <UserPlus className="w-4 h-4 mr-2" />
                  <span>Get Started Free with Clerk</span>
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </SignUpButton>
            ) : (
              <div className="flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto">
                <Button
                  size="lg"
                  onClick={onGetStarted}
                  className="w-full sm:w-auto text-base px-8 h-12 shadow-lg shadow-cyan-500/25 cursor-pointer font-mono bg-gradient-to-r from-cyan-500 to-emerald-500 hover:from-cyan-400 hover:to-emerald-400 text-zinc-950 font-bold"
                >
                  <span>Open API Vault & Live Telemetry</span>
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </div>
            )}

            <Button
              variant="outline"
              size="lg"
              onClick={onPromptCheck}
              className="w-full sm:w-auto h-12 text-zinc-200 border-zinc-700 hover:border-cyan-500/60 cursor-pointer font-mono"
            >
              <Sparkles className="w-4 h-4 mr-2 text-cyan-400" />
              <span>Paste Prompt & Suggest Best AI</span>
            </Button>

            <Button
              variant="ghost"
              size="lg"
              onClick={onExplorePricing}
              className="w-full sm:w-auto h-12 text-zinc-400 hover:text-white cursor-pointer font-mono text-xs"
            >
              <Zap className="w-3.5 h-3.5 mr-1 text-amber-400" />
              <span>Model Rates Index</span>
            </Button>
          </div>

          {/* Value Props Strip */}
          <div className="mt-10 flex flex-wrap items-center justify-center gap-y-2 gap-x-6 text-xs text-zinc-400 font-mono">
            <div className="flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>Web Crypto AES-GCM Encrypted</span>
            </div>
            <div className="hidden sm:inline-block text-zinc-700">•</div>
            <div className="flex items-center gap-1.5">
              <Layers className="w-4 h-4 text-cyan-400" />
              <span>Clerk Auth + Supabase Ready</span>
            </div>
            <div className="hidden sm:inline-block text-zinc-700">•</div>
            <div className="flex items-center gap-1.5">
              <Zap className="w-4 h-4 text-amber-400" />
              <span>Auto Cheaper-Alternative Alerts</span>
            </div>
          </div>
        </div>

        {/* The Live Interactive Smart Electricity Meter Showcase */}
        <div className="mt-6">
          <ElectricityMeterWidget />
        </div>
      </div>
    </section>
  );
};
