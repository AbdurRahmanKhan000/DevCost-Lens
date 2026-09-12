import React, { useState } from "react";
import { AI_MODELS_CATALOG } from "../lib/ai-providers";
import { Badge } from "./ui/Badge";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "./ui/Card";
import { formatCurrency, formatNumber } from "../lib/utils";
import { Search, Filter, ArrowUpRight, Check, Sparkles, TrendingDown } from "lucide-react";

export const ModelPricingGrid: React.FC = () => {
  const [activeCategory, setActiveCategory] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");

  const filteredModels = AI_MODELS_CATALOG.filter((m) => {
    const matchesCategory = activeCategory === "all" || m.category === activeCategory;
    const matchesSearch =
      m.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.providerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <section id="pricing" className="py-16 md:py-24 border-t border-zinc-900 bg-zinc-950/40 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-6">
          <div>
            <Badge variant="cyan" className="mb-3">
              <Sparkles className="w-3 h-3 text-cyan-400" />
              Live Pricing Index
            </Badge>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
              GPT & Claude AI Model Rates & Telemetry
            </h2>
            <p className="mt-2 text-zinc-400 max-w-xl text-sm sm:text-base">
              Comparing official pricing per 1,000,000 tokens for OpenAI GPT (GPT-4.5, o1, GPT-4o, o3-mini) and Anthropic Claude (Opus, Sonnet 3.7 & 3.5, Haiku).
            </p>
          </div>

          {/* Search & Category Pills */}
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" />
              <input
                type="text"
                placeholder="Search models or providers..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 pr-4 py-2 text-xs rounded-lg border border-zinc-800 bg-zinc-900/90 text-zinc-200 placeholder:text-zinc-500 focus:outline-none focus:border-cyan-500 w-full sm:w-56"
              />
            </div>

            <div className="flex items-center gap-1.5 p-1 rounded-lg bg-zinc-900 border border-zinc-800">
              {[
                { id: "all", label: "All" },
                { id: "flagship", label: "Flagship" },
                { id: "fast", label: "Ultra-Fast" },
                { id: "reasoning", label: "Reasoning" },
              ].map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setActiveCategory(cat.id)}
                  className={`px-2.5 py-1 text-xs font-mono rounded-md transition-colors ${
                    activeCategory === cat.id
                      ? "bg-cyan-500/20 text-cyan-300 font-semibold"
                      : "text-zinc-400 hover:text-white"
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Grid of Models */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredModels.map((model) => (
            <Card
              key={model.id}
              className="bg-zinc-900/40 border-zinc-800/90 hover:border-zinc-700 transition-all hover:shadow-[0_0_25px_rgba(6,182,212,0.06)]"
            >
              <CardHeader className="p-5 pb-3">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <span className="text-[11px] font-mono uppercase tracking-wider text-cyan-400">
                      {model.providerName}
                    </span>
                    <CardTitle className="text-lg font-bold text-white mt-0.5">
                      {model.name}
                    </CardTitle>
                  </div>
                  {model.badge && (
                    <Badge
                      variant={
                        model.badge === "Cheapest"
                          ? "emerald"
                          : model.badge === "Reasoning"
                          ? "purple"
                          : model.badge === "Ultra-Fast"
                          ? "cyan"
                          : "secondary"
                      }
                      className="shrink-0 text-[10px]"
                    >
                      {model.badge}
                    </Badge>
                  )}
                </div>
                <CardDescription className="text-xs text-zinc-400 line-clamp-2 mt-1">
                  {model.description}
                </CardDescription>
              </CardHeader>

              <CardContent className="p-5 pt-2">
                {/* Cost Matrix Per 1M */}
                <div className="grid grid-cols-2 gap-2 p-3 rounded-xl bg-zinc-950/70 border border-zinc-800/80 font-mono">
                  <div>
                    <div className="text-[10px] text-zinc-500 uppercase">Input / 1M</div>
                    <div className="text-sm font-bold text-white">
                      ${model.inputCostPer1M.toFixed(2)}
                    </div>
                  </div>
                  <div>
                    <div className="text-[10px] text-zinc-500 uppercase">Output / 1M</div>
                    <div className="text-sm font-bold text-white">
                      ${model.outputCostPer1M.toFixed(2)}
                    </div>
                  </div>
                </div>

                {/* Context Window & Details */}
                <div className="mt-3 flex items-center justify-between text-xs text-zinc-400">
                  <span>Context Window:</span>
                  <span className="font-mono text-zinc-300 font-semibold">
                    {formatNumber(model.contextWindow)} tokens
                  </span>
                </div>

                {/* Savings Callout if available */}
                {model.recommendedAlternativeId && (
                  <div className="mt-3 pt-3 border-t border-zinc-800/60 flex items-center justify-between text-xs">
                    <span className="text-zinc-400 flex items-center gap-1">
                      <TrendingDown className="w-3.5 h-3.5 text-emerald-400" />
                      Alternative:
                    </span>
                    <span className="font-semibold text-emerald-400 font-mono">
                      Save up to {model.savingsPercentageVsAlternative}%
                    </span>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};
