import React from "react";
import { Badge } from "./ui/Badge";
import { Zap, ShieldAlert, Cpu, Lock, BellRing, Sparkles } from "lucide-react";

export const FeaturesSection: React.FC = () => {
  const features = [
    {
      icon: <Zap className="w-5 h-5 text-cyan-400" />,
      title: "Real-time AI Electricity Meter",
      description:
        "Visualize prompt and completion token burn rate in real time. Never let an overnight crawler or rogue agent drain your wallet.",
      badge: "Core Feature",
    },
    {
      icon: <Cpu className="w-5 h-5 text-emerald-400" />,
      title: "Cheaper Alternative Recommender",
      description:
        "Powered by LiteLLM catalog logic. Instantly flags where switching from Claude 3.7 to DeepSeek V3 or Gemini 2.0 Flash cuts cost by 85-92%.",
      badge: "Save 80%+",
    },
    {
      icon: <Lock className="w-5 h-5 text-indigo-400" />,
      title: "Web Crypto AES-GCM Security",
      description:
        "Zero-trust security. Developer API keys are encrypted using browser-native Web Crypto API before hitting PostgreSQL/Supabase.",
      badge: "Zero-Knowledge",
    },
    {
      icon: <BellRing className="w-5 h-5 text-amber-400" />,
      title: "Automated Circuit Breaker Alerts",
      description:
        "Set hard monthly spending ceilings ($25, $50, $150). Get immediate alerts at 80% threshold to prevent surprise invoices.",
      badge: "Shock Prevention",
    },
    {
      icon: <ShieldAlert className="w-5 h-5 text-rose-400" />,
      title: "Multi-Provider Unification",
      description:
        "Monitor ChatGPT (OpenAI), Claude (Anthropic), Gemini (Google), DeepSeek, Moonshot Kimi, and Grok in one unified dashboard.",
      badge: "15+ Models",
    },
    {
      icon: <Sparkles className="w-5 h-5 text-teal-400" />,
      title: "Built for Solo Developers",
      description:
        "No complex enterprise sales calls. Instant self-serve setup with encrypted client storage and lightweight serverless telemetry.",
      badge: "Solo Dev First",
    },
  ];

  return (
    <section id="features" className="py-20 bg-zinc-950 border-t border-zinc-900 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <Badge variant="cyan" className="mb-3">
            Developer Architecture
          </Badge>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            Engineered to Eliminate AI Surprises
          </h2>
          <p className="mt-3 text-zinc-400 text-sm sm:text-base">
            Solo developers deserve the same financial observability that Fortune 500 engineering teams have.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, index) => (
            <div
              key={index}
              className="p-6 rounded-2xl bg-zinc-900/40 border border-zinc-800/80 hover:border-zinc-700 transition-all hover:bg-zinc-900/70 group"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="w-10 h-10 rounded-xl bg-zinc-900 border border-zinc-800 flex items-center justify-center group-hover:scale-105 transition-transform">
                  {feature.icon}
                </div>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-zinc-800/90 text-zinc-300 border border-zinc-700">
                  {feature.badge}
                </span>
              </div>
              <h3 className="text-base font-bold text-white mb-2 group-hover:text-cyan-300 transition-colors">
                {feature.title}
              </h3>
              <p className="text-sm text-zinc-400 leading-relaxed">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
