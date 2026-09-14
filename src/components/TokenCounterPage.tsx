import React, { useState, useMemo } from "react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "./ui/Card";
import { Button } from "./ui/Button";
import { Badge } from "./ui/Badge";
import {
  Calculator,
  Zap,
  Sparkles,
  Copy,
  Check,
  ArrowRight,
  TrendingDown,
  Code2,
  FileText,
  Flame,
  Scale,
  Brain,
  Layers,
  HelpCircle,
} from "lucide-react";
import { estimateTokens } from "../lib/tiktoken-util";
import { AI_MODELS_CATALOG, calculateModelCost } from "../lib/ai-providers";
import { analyzePromptAndRecommendAI } from "../lib/ai-recommender";
import { addUsageRecord } from "../lib/supabase";
import { formatCurrency, formatNumber } from "../lib/utils";

interface TokenCounterPageProps {
  onNavigateToDashboard?: () => void;
}

const QUICK_PROMPT_PRESETS = [
  {
    label: "💻 Code Refactor",
    prompt: `// Refactor this high-frequency TypeScript websocket handler
export async function handleStreamBatch(events: TelemetryEvent[]): Promise<BatchResult> {
  const aggregated = new Map<string, number>();
  for (const ev of events) {
    if (ev.type === "token_burn" && ev.userId) {
      const current = aggregated.get(ev.userId) || 0;
      aggregated.set(ev.userId, current + ev.tokens);
    }
  }
  return { processed: events.length, uniqueUsers: aggregated.size };
}`,
  },
  {
    label: "🧠 Math & Logic Reasoning",
    prompt: `Analyze step-by-step why the time complexity of building a heap with Floyd's algorithm is O(N) rather than O(N log N). Provide a mathematical proof with summation formulas and clear explanations.`,
  },
  {
    label: "⚡ Short Chat / Q&A",
    prompt: `What is the difference between Web Crypto AES-GCM and AES-CBC in modern browser environments? Keep the explanation concise in 3 bullet points.`,
  },
  {
    label: "📄 Long Architecture Prompt",
    prompt: `You are the lead cloud infrastructure architect. Review the following microservices specifications across Kubernetes pods, PostgreSQL connection pooling via PgBouncer, Redis caching invalidation policies, and edge CDN distribution. Explain potential bottlenecks and how to scale to 100k requests/sec while keeping cloud costs under $5,000/month.`,
  },
];

export const TokenCounterPage: React.FC<TokenCounterPageProps> = ({
  onNavigateToDashboard,
}) => {
  const [promptText, setPromptText] = useState<string>(QUICK_PROMPT_PRESETS[0].prompt);
  const [expectedOutputTokens, setExpectedOutputTokens] = useState<number>(500);
  const [copiedSummary, setCopiedSummary] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Exact BPE token calculation via tiktoken
  const tokenStats = useMemo(() => {
    return estimateTokens(promptText);
  }, [promptText]);

  // Intelligent AI Recommender based on prompt content & token volume
  const recommendation = useMemo(() => {
    return analyzePromptAndRecommendAI(promptText, tokenStats.estimatedTokens);
  }, [promptText, tokenStats.estimatedTokens]);

  // Pricing comparison across all models
  const modelComparisons = useMemo(() => {
    return AI_MODELS_CATALOG.map((model) => {
      const totalCost = calculateModelCost(model, tokenStats.estimatedTokens, expectedOutputTokens);
      const inputCost = (tokenStats.estimatedTokens / 1_000_000) * model.inputCostPer1M;
      const outputCost = totalCost - inputCost;

      return {
        model,
        inputCost,
        outputCost,
        totalCost,
      };
    }).sort((a, b) => a.totalCost - b.totalCost);
  }, [tokenStats.estimatedTokens, expectedOutputTokens]);

  const gpt4oCost = useMemo(() => {
    const gpt4o = modelComparisons.find((m) => m.model.id === "gpt-4o");
    return gpt4o ? gpt4o.totalCost : 0.01;
  }, [modelComparisons]);

  const handleCopySummary = () => {
    const text = `DevCost Lens Prompt Analysis:
- Tokens: ${formatNumber(tokenStats.estimatedTokens)} tokens (${tokenStats.characterCount} chars)
- Best AI to Use: ${recommendation.primaryModel.name}
- Reason: ${recommendation.reason}
- Estimated Cost: $${recommendation.recommendedCost.toFixed(4)} (vs GPT-4o $${gpt4oCost.toFixed(4)} — saves ${recommendation.savingsPercent}%)`;

    navigator.clipboard.writeText(text);
    setCopiedSummary(true);
    setTimeout(() => setCopiedSummary(false), 2000);
  };

  const handleLogToDashboard = async () => {
    await addUsageRecord({
      provider: recommendation.primaryModel.provider,
      modelId: recommendation.primaryModel.id,
      promptTokens: tokenStats.estimatedTokens,
      completionTokens: expectedOutputTokens,
      totalTokens: tokenStats.estimatedTokens + expectedOutputTokens,
      costUSD: recommendation.recommendedCost,
      latencyMs: 650,
      requestType: "chat",
      projectTag: "prompt-recommender",
      loggedAt: new Date().toISOString(),
    });

    setToastMessage(`✓ Logged ${recommendation.primaryModel.name} ($${recommendation.recommendedCost.toFixed(4)}) to Live Meter!`);
    setTimeout(() => setToastMessage(null), 3500);
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-zinc-800">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-extrabold tracking-tight text-white font-mono flex items-center gap-2">
              <Calculator className="w-7 h-7 text-cyan-400" />
              <span>Prompt Tokenizer & Best AI Suggester</span>
            </h1>
            <Badge variant="cyan" className="text-xs font-mono">
              tiktoken BPE
            </Badge>
          </div>
          <p className="mt-2 text-sm text-zinc-400 max-w-2xl">
            Paste any prompt or code snippet. DevCost Lens tells you the exact token count and immediately recommends the <strong>cheapest, highest-quality AI model</strong> to use for that prompt.
          </p>
        </div>

        {onNavigateToDashboard && (
          <Button
            variant="outline"
            onClick={onNavigateToDashboard}
            className="text-xs font-mono cursor-pointer border-zinc-800 hover:border-zinc-700"
          >
            <span>View Live Spend Dashboard →</span>
          </Button>
        )}
      </div>

      {toastMessage && (
        <div className="mt-4 p-3 rounded-xl bg-emerald-950/80 border border-emerald-500/50 text-emerald-300 text-xs font-mono flex items-center justify-between animate-in fade-in">
          <span>{toastMessage}</span>
          <button onClick={() => setToastMessage(null)} className="text-emerald-400 hover:text-white">
            ✕
          </button>
        </div>
      )}

      {/* Main Grid: Prompt Input on Left, Token Stats & Best AI on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mt-8">
        {/* Left Column: Prompt Textarea & Quick Presets (7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          <div className="flex items-center justify-between">
            <label className="text-xs font-mono font-bold text-zinc-300 uppercase tracking-wider flex items-center gap-1.5">
              <FileText className="w-3.5 h-3.5 text-cyan-400" />
              <span>Paste Your Prompt or Code:</span>
            </label>

            {/* Quick Presets */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
              {QUICK_PROMPT_PRESETS.map((preset, idx) => (
                <button
                  key={idx}
                  onClick={() => setPromptText(preset.prompt)}
                  className="px-2.5 py-1 rounded-lg text-[11px] font-mono bg-zinc-900 hover:bg-zinc-800 text-zinc-300 hover:text-white border border-zinc-800 whitespace-nowrap transition-colors cursor-pointer"
                >
                  {preset.label}
                </button>
              ))}
            </div>
          </div>

          <div className="relative">
            <textarea
              value={promptText}
              onChange={(e) => setPromptText(e.target.value)}
              rows={12}
              placeholder="Paste your prompt, instructions, question, or codebase snippet here..."
              className="w-full rounded-2xl bg-zinc-950 border border-zinc-800 p-4 font-mono text-xs text-zinc-200 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500/30 transition-all leading-relaxed placeholder:text-zinc-600 resize-y"
            />
            {promptText && (
              <button
                onClick={() => setPromptText("")}
                className="absolute top-3 right-3 text-[10px] font-mono text-zinc-500 hover:text-zinc-300 px-2 py-1 rounded bg-zinc-900 border border-zinc-800"
              >
                Clear
              </button>
            )}
          </div>

          {/* Quick Output Tokens Adjustment */}
          <div className="p-3.5 rounded-xl bg-zinc-900/60 border border-zinc-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs font-mono">
            <span className="text-zinc-400">
              Expected AI Output Length:
            </span>
            <div className="flex items-center gap-1.5">
              {[150, 500, 1000, 2000].map((tokens) => (
                <button
                  key={tokens}
                  onClick={() => setExpectedOutputTokens(tokens)}
                  className={`px-2.5 py-1 rounded-lg transition-colors cursor-pointer ${
                    expectedOutputTokens === tokens
                      ? "bg-cyan-500 text-zinc-950 font-bold"
                      : "bg-zinc-950 text-zinc-400 hover:text-white border border-zinc-800"
                  }`}
                >
                  {tokens} tokens
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Prominent Token Count & BEST AI RECOMMENDATION (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          {/* Token Metrics Tile */}
          <div className="p-5 rounded-2xl bg-zinc-900/80 border border-zinc-800 backdrop-blur-md">
            <div className="text-[11px] font-mono text-zinc-400 uppercase tracking-wider mb-1">
              Token Count (o200k / cl100k BPE)
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-4xl font-extrabold font-mono text-cyan-400">
                {formatNumber(tokenStats.estimatedTokens)}
              </span>
              <span className="text-xs font-mono text-zinc-400">tokens</span>
            </div>

            <div className="grid grid-cols-3 gap-2 mt-4 pt-3 border-t border-zinc-800 text-[11px] font-mono text-zinc-400">
              <div>
                Chars: <span className="text-white font-bold">{formatNumber(tokenStats.characterCount)}</span>
              </div>
              <div>
                Words: <span className="text-white font-bold">{formatNumber(tokenStats.wordCount)}</span>
              </div>
              <div>
                Lines: <span className="text-white font-bold">{formatNumber(tokenStats.lineCount)}</span>
              </div>
            </div>
          </div>

          {/* BEST AI SUGGESTION HERO CARD */}
          <div className="p-6 rounded-2xl bg-gradient-to-b from-cyan-950/40 via-zinc-900 to-zinc-950 border border-cyan-500/40 shadow-[0_0_30px_rgba(6,182,212,0.15)] relative overflow-hidden">
            <div className="flex items-start justify-between gap-3 mb-3">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-pulse" />
                <span className="text-xs font-mono font-bold text-cyan-300 uppercase tracking-wider">
                  Recommended AI for this Prompt
                </span>
              </div>
              <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full border ${recommendation.badgeColor}`}>
                {recommendation.badge}
              </span>
            </div>

            <div className="mt-1">
              <h3 className="text-2xl font-extrabold font-mono text-white flex items-center gap-2">
                <span>{recommendation.primaryModel.name}</span>
              </h3>
              <div className="text-xs font-mono text-cyan-400 mt-0.5">
                Provider: {recommendation.primaryModel.providerName}
              </div>
            </div>

            {/* Why this AI is best */}
            <div className="mt-4 p-3 rounded-xl bg-zinc-950/80 border border-zinc-800 text-xs font-mono text-zinc-300 leading-relaxed">
              <span className="text-cyan-300 font-bold block mb-1">💡 Why use this model:</span>
              {recommendation.reason}
            </div>

            {/* Cost & Savings Highlight */}
            <div className="grid grid-cols-2 gap-3 mt-4 pt-3 border-t border-zinc-800 font-mono">
              <div className="p-2.5 rounded-xl bg-zinc-950 border border-zinc-800">
                <div className="text-[10px] text-zinc-400 uppercase">Cost for this prompt</div>
                <div className="text-lg font-bold text-emerald-400">
                  ${recommendation.recommendedCost.toFixed(4)}
                </div>
              </div>

              <div className="p-2.5 rounded-xl bg-zinc-950 border border-zinc-800">
                <div className="text-[10px] text-zinc-400 uppercase">Savings vs GPT-4o</div>
                <div className="text-lg font-bold text-cyan-300">
                  {recommendation.savingsPercent}% Cheaper
                </div>
              </div>
            </div>

            {/* Runner-up alternative if available */}
            {recommendation.runnerUpModel && (
              <div className="mt-3 text-[11px] font-mono text-zinc-400 flex items-center justify-between">
                <span>Alternative option:</span>
                <span className="text-zinc-200 font-bold">{recommendation.runnerUpModel.name}</span>
              </div>
            )}

            {/* Action buttons */}
            <div className="mt-5 flex items-center gap-2 font-mono text-xs">
              <Button
                onClick={handleCopySummary}
                variant="outline"
                className="flex-1 h-9 text-xs border-zinc-700 hover:border-zinc-500"
              >
                {copiedSummary ? (
                  <>
                    <Check className="w-3.5 h-3.5 mr-1 text-emerald-400" />
                    <span>Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5 mr-1 text-cyan-400" />
                    <span>Copy Analysis</span>
                  </>
                )}
              </Button>

              <Button
                onClick={handleLogToDashboard}
                className="flex-1 h-9 text-xs shadow-md shadow-cyan-500/20"
              >
                <Zap className="w-3.5 h-3.5 mr-1" />
                <span>Log to Meter</span>
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Clean Model Rates Comparison Table */}
      <div className="mt-12">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold font-mono text-white flex items-center gap-2">
            <span>Price Comparison for this Prompt ({formatNumber(tokenStats.estimatedTokens)} in + {expectedOutputTokens} out)</span>
          </h3>
          <span className="text-xs font-mono text-zinc-400">Sorted cheapest to flagship</span>
        </div>

        <div className="overflow-x-auto rounded-2xl border border-zinc-800 bg-zinc-900/40">
          <table className="w-full text-left border-collapse font-mono text-xs">
            <thead>
              <tr className="border-b border-zinc-800 bg-zinc-950/60 text-zinc-400 text-[11px]">
                <th className="py-3 px-4">AI Model</th>
                <th className="py-3 px-4">Provider</th>
                <th className="py-3 px-4">Total Cost</th>
                <th className="py-3 px-4">Vs GPT-4o</th>
                <th className="py-3 px-4 text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800/60">
              {modelComparisons.slice(0, 8).map((item, idx) => {
                const isRecommended = item.model.id === recommendation.primaryModel.id;
                const savingsPct = gpt4oCost > 0 ? Math.round(((gpt4oCost - item.totalCost) / gpt4oCost) * 100) : 0;

                return (
                  <tr
                    key={item.model.id}
                    className={`hover:bg-zinc-800/40 transition-colors ${
                      isRecommended ? "bg-cyan-950/20" : ""
                    }`}
                  >
                    <td className="py-3 px-4 font-bold text-white flex items-center gap-2">
                      {isRecommended && <span className="w-2 h-2 rounded-full bg-cyan-400" />}
                      <span>{item.model.name}</span>
                    </td>
                    <td className="py-3 px-4 text-zinc-400">{item.model.providerName}</td>
                    <td className="py-3 px-4 font-bold text-emerald-400">
                      ${item.totalCost.toFixed(5)}
                    </td>
                    <td className="py-3 px-4">
                      {savingsPct > 0 ? (
                        <span className="text-cyan-400 font-bold">-{savingsPct}% cheaper</span>
                      ) : savingsPct === 0 ? (
                        <span className="text-zinc-500">Benchmark</span>
                      ) : (
                        <span className="text-rose-400">+{Math.abs(savingsPct)}% expensive</span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-right">
                      {isRecommended ? (
                        <span className="px-2 py-0.5 rounded text-[10px] bg-cyan-500/20 text-cyan-300 font-bold border border-cyan-500/40">
                          Recommended
                        </span>
                      ) : (
                        <span className="text-[10px] text-zinc-500">
                          {idx === 0 ? "Cheapest" : "Standard"}
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
