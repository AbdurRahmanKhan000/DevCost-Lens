import { AI_MODELS_CATALOG } from "./ai-providers";
import { AIModelPrice } from "../types";

export interface AIRecommendation {
  primaryModel: AIModelPrice;
  runnerUpModel?: AIModelPrice;
  taskType: "code" | "reasoning" | "long_context" | "creative" | "quick_qa";
  taskTitle: string;
  reason: string;
  badge: string;
  badgeColor: string;
  recommendedCost: number;
  gpt4oCost: number;
  savingsDollar: number;
  savingsPercent: number;
  speedRating: "⚡ Ultra Fast (<500ms)" | "🚀 Fast (1-2s)" | "🧠 Deep Thinking (3-8s)";
}

/**
 * Intelligent prompt classifier and AI recommender.
 * Analyzes the user's prompt text and token volume to recommend the optimal AI model for cost vs quality.
 */
export function analyzePromptAndRecommendAI(prompt: string, tokenCount: number): AIRecommendation {
  const clean = prompt.toLowerCase();

  // 1. Code Detection heuristics
  const codeKeywords = [
    "function", "const ", "let ", "var ", "import ", "export ", "class ", "def ",
    "return ", "async ", "await ", "interface ", "type ", "select ", "from ", "where ",
    "<div", "public ", "private ", "void ", "=>", "print(", "console.log"
  ];
  const hasCodeKeywords = codeKeywords.some((kw) => clean.includes(kw));
  const hasCodeSyntax = (prompt.match(/[{};<>=()\[\]]/g) || []).length > 8;
  const isCoding = hasCodeKeywords || hasCodeSyntax || clean.includes("bug") || clean.includes("refactor") || clean.includes("typescript") || clean.includes("python");

  // 2. Reasoning / Math / Proof heuristics
  const reasoningKeywords = [
    "step by step", "reasoning", "prove", "theorem", "calculate", "solve", "why does",
    "derive", "mathematical", "logic puzzle", "compare trade-offs", "architectural decision"
  ];
  const isReasoning = reasoningKeywords.some((kw) => clean.includes(kw));

  // 3. Long Context heuristic
  const isLongContext = tokenCount > 5000 || clean.includes("transcript") || clean.includes("full document") || clean.includes("entire codebase");

  // 4. Creative / Copywriting heuristic
  const creativeKeywords = ["write a story", "blog post", "poem", "marketing copy", "newsletter", "rephrase", "tone of voice"];
  const isCreative = creativeKeywords.some((kw) => clean.includes(kw));

  // Models reference
  const deepseekV3 = AI_MODELS_CATALOG.find((m) => m.id === "deepseek-chat") || AI_MODELS_CATALOG[6];
  const deepseekR1 = AI_MODELS_CATALOG.find((m) => m.id === "deepseek-reasoner") || deepseekV3;
  const claudeSonnet = AI_MODELS_CATALOG.find((m) => m.id === "claude-3-5-sonnet") || AI_MODELS_CATALOG[2];
  const geminiFlash = AI_MODELS_CATALOG.find((m) => m.id === "gemini-1-5-flash") || AI_MODELS_CATALOG[8];
  const gpt4o = AI_MODELS_CATALOG.find((m) => m.id === "gpt-4o") || AI_MODELS_CATALOG[4];
  const gpt4oMini = AI_MODELS_CATALOG.find((m) => m.id === "gpt-4o-mini") || AI_MODELS_CATALOG[5];
  const claudeHaiku = AI_MODELS_CATALOG.find((m) => m.id === "claude-3-5-haiku") || AI_MODELS_CATALOG[3];

  let selectedModel: AIModelPrice = deepseekV3;
  let runnerUpModel: AIModelPrice | undefined = claudeSonnet;
  let taskType: AIRecommendation["taskType"] = "quick_qa";
  let taskTitle = "General Prompt & Quick Q&A";
  let reason = "For general inquiries, DeepSeek V3 and Gemini Flash give GPT-4-class answers at 95% lower cost.";
  let badge = "Best Value";
  let badgeColor = "bg-emerald-500/10 text-emerald-400 border-emerald-500/30";
  let speedRating: AIRecommendation["speedRating"] = "⚡ Ultra Fast (<500ms)";
  let estimatedOutputTokens = 350;

  if (isReasoning) {
    selectedModel = deepseekR1;
    runnerUpModel = claudeSonnet;
    taskType = "reasoning";
    taskTitle = "Complex Reasoning & Multi-Step Logic";
    reason = "DeepSeek R1 matches OpenAI o1 performance on math and coding benchmarks while costing 90% less.";
    badge = "Top Logic / Cost Ratio";
    badgeColor = "bg-cyan-500/10 text-cyan-400 border-cyan-500/30";
    speedRating = "🧠 Deep Thinking (3-8s)";
    estimatedOutputTokens = 800;
  } else if (isCoding) {
    selectedModel = deepseekV3;
    runnerUpModel = claudeSonnet;
    taskType = "code";
    taskTitle = "Code Generation & Debugging";
    reason = "DeepSeek V3 costs only $0.14 per 1M tokens with near-perfect code generation. For complex architectural refactors, Claude 3.5 Sonnet is the premium alternative.";
    badge = "95% Cheaper for Code";
    badgeColor = "bg-emerald-500/10 text-emerald-400 border-emerald-500/30";
    speedRating = "🚀 Fast (1-2s)";
    estimatedOutputTokens = 600;
  } else if (isLongContext) {
    selectedModel = geminiFlash;
    runnerUpModel = deepseekV3;
    taskType = "long_context";
    taskTitle = "Large Document & Long Context";
    reason = "Gemini 1.5 Flash features a massive 1M+ token window with near-instant caching and virtually zero bill shock ($0.075/1M).";
    badge = "1M+ Context King";
    badgeColor = "bg-blue-500/10 text-blue-400 border-blue-500/30";
    speedRating = "⚡ Ultra Fast (<500ms)";
    estimatedOutputTokens = 500;
  } else if (isCreative) {
    selectedModel = claudeHaiku;
    runnerUpModel = gpt4oMini;
    taskType = "creative";
    taskTitle = "Writing, Drafting & Tone";
    reason = "Claude 3.5 Haiku produces nuanced, natural writing without the robotic phrasing of generic models.";
    badge = "Best Tone & Flow";
    badgeColor = "bg-amber-500/10 text-amber-400 border-amber-500/30";
    speedRating = "⚡ Ultra Fast (<500ms)";
    estimatedOutputTokens = 450;
  } else {
    // Quick QA
    selectedModel = geminiFlash;
    runnerUpModel = gpt4oMini;
    taskType = "quick_qa";
    taskTitle = "Quick Query / Chat";
    reason = "Sub-second turnaround and costs less than $0.0001 for this request size.";
    badge = "Virtually Free (<$0.0001)";
    badgeColor = "bg-emerald-500/10 text-emerald-400 border-emerald-500/30";
    speedRating = "⚡ Ultra Fast (<500ms)";
    estimatedOutputTokens = 250;
  }

  // Cost calculation
  const recommendedCost =
    (tokenCount / 1_000_000) * selectedModel.inputCostPer1M +
    (estimatedOutputTokens / 1_000_000) * selectedModel.outputCostPer1M;

  const gpt4oCost =
    (tokenCount / 1_000_000) * gpt4o.inputCostPer1M +
    (estimatedOutputTokens / 1_000_000) * gpt4o.outputCostPer1M;

  const savingsDollar = Math.max(0, gpt4oCost - recommendedCost);
  const savingsPercent = gpt4oCost > 0 ? Math.round((savingsDollar / gpt4oCost) * 100) : 0;

  return {
    primaryModel: selectedModel,
    runnerUpModel,
    taskType,
    taskTitle,
    reason,
    badge,
    badgeColor,
    recommendedCost,
    gpt4oCost,
    savingsDollar,
    savingsPercent,
    speedRating,
  };
}
