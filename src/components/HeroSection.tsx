import React, { useState, useEffect } from "react";
import { Button } from "./ui/Button";
import { Badge } from "./ui/Badge";
import { ElectricityMeterWidget } from "./ElectricityMeterWidget";
import { ShieldCheck, Zap, Sparkles, Layers } from "lucide-react";

interface HeroSectionProps {
  onPromptCheck: () => void;
  onExplorePricing: () => void;
}

export const HeroSection: React.FC<HeroSectionProps> = ({
  onPromptCheck,
  onExplorePricing,
}) => {
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
              <span>Real-Time AI Token & Cost Meter</span>
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
            Most developers only discover what their AI calls cost when the credit card invoice hits at month's end. DevCost Lens works like a live power meter for your API keys: see token burn rates as they happen, compare models side by side, and stop runaway agent loops before they drain your balance.
          </p>

          {/* Call-To-Action Group */}
          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
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
