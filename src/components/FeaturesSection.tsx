import React from "react";
import { Badge } from "./ui/Badge";
import { Zap, ShieldAlert, Cpu, Lock, BellRing, Sparkles } from "lucide-react";

export const FeaturesSection: React.FC = () => {
  const features = [
    {
      icon: <Zap className="w-5 h-5 text-cyan-400" />,
      title: "Real-Time Electricity Dial",
      description:
        "Watch tokens and cents tick as calls happen. If an automated script or background retry loops unexpectedly, you catch it in seconds, not next month.",
      badge: "Observability",
    },
    {
      icon: <Cpu className="w-5 h-5 text-emerald-400" />,
      title: "Pragmatic Model Suggester",
      description:
        "Don't default to o1 or Claude 3.7 for tasks that Gemini 2.0 Flash or DeepSeek V3 can solve for pennies. See the exact dollar difference for your specific prompt.",
      badge: "Save 70-90%",
    },
    {
      icon: <Lock className="w-5 h-5 text-indigo-400" />,
      title: "AES-GCM Key Encryption",
      description:
        "Your provider keys are sealed using Web Crypto AES-256-GCM right in your browser. We never store unencrypted keys anywhere.",
      badge: "Zero-Knowledge",
    },
    {
      icon: <BellRing className="w-5 h-5 text-amber-400" />,
      title: "Monthly Budget Circuit Breakers",
      description:
        "Set your own spending ceiling. When cumulative daily burn projects you to exceed your budget, clear visual warnings keep you ahead.",
      badge: "Spend Control",
    },
    {
      icon: <ShieldAlert className="w-5 h-5 text-rose-400" />,
      title: "One Unified Dashboard",
      description:
        "Instead of logging into five different provider billing consoles (OpenAI, Anthropic, Google, DeepSeek, xAI), see everything in one place.",
      badge: "Cross-Provider",
    },
    {
      icon: <Sparkles className="w-5 h-5 text-teal-400" />,
      title: "Free Community Project",
      description:
        "No monthly tier paywalls or locked features. Built as a transparent developer utility funded entirely by voluntary community donations.",
      badge: "100% Free",
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
