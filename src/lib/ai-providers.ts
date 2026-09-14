import { AIModelPrice } from "../types";

export const AI_MODELS_CATALOG: AIModelPrice[] = [
  // ==========================================
  // Anthropic Claude Family (Sonnet, Opus, Haiku)
  // ==========================================
  {
    id: "claude-3-opus",
    name: "Claude 3 Opus",
    provider: "anthropic",
    providerName: "Anthropic Claude",
    inputCostPer1M: 15.0,
    outputCostPer1M: 75.0,
    cachedInputCostPer1M: 1.50,
    contextWindow: 200000,
    badge: "Flagship",
    description: "Highest capability foundation model for deep technical analysis and complex research",
    category: "flagship",
    recommendedAlternativeId: "claude-3-7-sonnet",
    savingsPercentageVsAlternative: 80,
  },
  {
    id: "claude-3-7-sonnet",
    name: "Claude 3.7 Sonnet (Hybrid)",
    provider: "anthropic",
    providerName: "Anthropic Claude",
    inputCostPer1M: 3.0,
    outputCostPer1M: 15.0,
    cachedInputCostPer1M: 0.30,
    contextWindow: 200000,
    badge: "Reasoning",
    description: "Hybrid reasoning model delivering state-of-the-art coding and adaptive thinking",
    category: "reasoning",
    recommendedAlternativeId: "claude-3-5-sonnet",
    savingsPercentageVsAlternative: 0,
  },
  {
    id: "claude-3-5-sonnet",
    name: "Claude 3.5 Sonnet",
    provider: "anthropic",
    providerName: "Anthropic Claude",
    inputCostPer1M: 3.0,
    outputCostPer1M: 15.0,
    cachedInputCostPer1M: 0.30,
    contextWindow: 200000,
    badge: "Popular",
    description: "Industry-standard coding and analytical model outperforming older Opus at 1/5 the price",
    category: "flagship",
    recommendedAlternativeId: "claude-3-5-haiku",
    savingsPercentageVsAlternative: 73,
  },
  {
    id: "claude-3-sonnet",
    name: "Claude 3 Sonnet",
    provider: "anthropic",
    providerName: "Anthropic Claude",
    inputCostPer1M: 3.0,
    outputCostPer1M: 15.0,
    contextWindow: 200000,
    badge: "Flagship",
    description: "Balanced speed and intelligence for enterprise workloads and scaled processing",
    category: "flagship",
    recommendedAlternativeId: "claude-3-5-haiku",
    savingsPercentageVsAlternative: 73,
  },
  {
    id: "claude-3-5-haiku",
    name: "Claude 3.5 Haiku",
    provider: "anthropic",
    providerName: "Anthropic Claude",
    inputCostPer1M: 0.80,
    outputCostPer1M: 4.0,
    cachedInputCostPer1M: 0.08,
    contextWindow: 200000,
    badge: "Ultra-Fast",
    description: "Ultra-fast, cost-efficient model delivering Claude 3 Opus level intelligence on rapid tasks",
    category: "fast",
    recommendedAlternativeId: "gpt-4o-mini",
    savingsPercentageVsAlternative: 81,
  },

  // ==========================================
  // OpenAI GPT Family (GPT-4.5, GPT-4o, o1, o3)
  // ==========================================
  {
    id: "gpt-4-5-preview",
    name: "GPT-4.5 (Preview)",
    provider: "openai",
    providerName: "OpenAI GPT",
    inputCostPer1M: 75.0,
    outputCostPer1M: 150.0,
    cachedInputCostPer1M: 37.50,
    contextWindow: 128000,
    badge: "Flagship",
    description: "OpenAI's largest foundation model with vast world knowledge and nuance",
    category: "flagship",
    recommendedAlternativeId: "gpt-4o",
    savingsPercentageVsAlternative: 96,
  },
  {
    id: "openai-o1",
    name: "OpenAI o1 (Full Reasoning)",
    provider: "openai",
    providerName: "OpenAI GPT",
    inputCostPer1M: 15.0,
    outputCostPer1M: 60.0,
    cachedInputCostPer1M: 7.50,
    contextWindow: 200000,
    badge: "Reasoning",
    description: "Deep reasoning model for math, coding, and multi-step scientific deduction",
    category: "reasoning",
    recommendedAlternativeId: "o3-mini",
    savingsPercentageVsAlternative: 92,
  },
  {
    id: "gpt-4o",
    name: "GPT-4o (Omni)",
    provider: "openai",
    providerName: "OpenAI GPT",
    inputCostPer1M: 2.50,
    outputCostPer1M: 10.0,
    cachedInputCostPer1M: 1.25,
    contextWindow: 128000,
    badge: "Popular",
    description: "High-speed multimodal flagship powering ChatGPT Plus with vision and audio support",
    category: "flagship",
    recommendedAlternativeId: "gpt-4o-mini",
    savingsPercentageVsAlternative: 94,
  },
  {
    id: "o3-mini",
    name: "OpenAI o3-mini",
    provider: "openai",
    providerName: "OpenAI GPT",
    inputCostPer1M: 1.10,
    outputCostPer1M: 4.40,
    cachedInputCostPer1M: 0.55,
    contextWindow: 200000,
    badge: "Reasoning",
    description: "Cost-optimized reasoning model matching o1 performance on coding and STEM benchmarks",
    category: "reasoning",
    recommendedAlternativeId: "gpt-4o-mini",
    savingsPercentageVsAlternative: 86,
  },
  {
    id: "gpt-4o-mini",
    name: "GPT-4o mini",
    provider: "openai",
    providerName: "OpenAI GPT",
    inputCostPer1M: 0.15,
    outputCostPer1M: 0.60,
    cachedInputCostPer1M: 0.075,
    contextWindow: 128000,
    badge: "Cheapest",
    description: "Extremely affordable lightweight model for chat, classification, and summarization",
    category: "fast",
  },

  // ==========================================
  // Google Gemini Family (2.0 Flash, 1.5 Pro, 1.5 Flash)
  // ==========================================
  {
    id: "gemini-2-0-flash",
    name: "Gemini 2.0 Flash",
    provider: "google",
    providerName: "Google Gemini",
    inputCostPer1M: 0.10,
    outputCostPer1M: 0.40,
    cachedInputCostPer1M: 0.025,
    contextWindow: 1048576,
    badge: "Popular",
    description: "Next-gen multimodal workhorse with sub-second latency and massive 1M token context",
    category: "fast",
    recommendedAlternativeId: "gemini-1-5-flash",
    savingsPercentageVsAlternative: 25,
  },
  {
    id: "gemini-1-5-flash",
    name: "Gemini 1.5 Flash",
    provider: "google",
    providerName: "Google Gemini",
    inputCostPer1M: 0.075,
    outputCostPer1M: 0.30,
    cachedInputCostPer1M: 0.01875,
    contextWindow: 1048576,
    badge: "Cheapest",
    description: "Ultra-budget multimodal intelligence with 1M context window for high-volume logs",
    category: "fast",
  },
  {
    id: "gemini-1-5-pro",
    name: "Gemini 1.5 Pro",
    provider: "google",
    providerName: "Google Gemini",
    inputCostPer1M: 1.25,
    outputCostPer1M: 5.0,
    cachedInputCostPer1M: 0.3125,
    contextWindow: 2097152,
    badge: "Flagship",
    description: "Deep reasoning across audio, video, codebases, with up to 2M tokens context",
    category: "flagship",
    recommendedAlternativeId: "gemini-2-0-flash",
    savingsPercentageVsAlternative: 92,
  },

  // ==========================================
  // DeepSeek Family (V3, R1)
  // ==========================================
  {
    id: "deepseek-v3",
    name: "DeepSeek V3",
    provider: "deepseek",
    providerName: "DeepSeek",
    inputCostPer1M: 0.14,
    outputCostPer1M: 0.28,
    cachedInputCostPer1M: 0.014,
    contextWindow: 64000,
    badge: "Cheapest",
    description: "Open-weights 671B MoE model delivering GPT-4o intelligence at fraction of cost",
    category: "fast",
  },
  {
    id: "deepseek-r1",
    name: "DeepSeek R1 (Reasoning)",
    provider: "deepseek",
    providerName: "DeepSeek",
    inputCostPer1M: 0.55,
    outputCostPer1M: 2.19,
    cachedInputCostPer1M: 0.14,
    contextWindow: 64000,
    badge: "Reasoning",
    description: "Reinforcement-learning reasoning model competing with OpenAI o1 at 95% lower cost",
    category: "reasoning",
    recommendedAlternativeId: "deepseek-v3",
    savingsPercentageVsAlternative: 74,
  },

  // ==========================================
  // Moonshot Kimi Family
  // ==========================================
  {
    id: "kimi-moonshot-v1-128k",
    name: "Kimi (Moonshot v1 128k)",
    provider: "moonshot",
    providerName: "Moonshot Kimi",
    inputCostPer1M: 1.68,
    outputCostPer1M: 1.68,
    contextWindow: 128000,
    badge: "Popular",
    description: "Specialized long-context and document parsing model with symmetrical token pricing",
    category: "flagship",
    recommendedAlternativeId: "deepseek-v3",
    savingsPercentageVsAlternative: 91,
  },

  // ==========================================
  // xAI Grok Family (Grok 2)
  // ==========================================
  {
    id: "grok-2",
    name: "xAI Grok 2",
    provider: "xai",
    providerName: "xAI Grok",
    inputCostPer1M: 2.0,
    outputCostPer1M: 10.0,
    contextWindow: 131072,
    badge: "Flagship",
    description: "State-of-the-art conversational and reasoning AI from xAI with real-time web awareness",
    category: "flagship",
    recommendedAlternativeId: "gpt-4o",
    savingsPercentageVsAlternative: 0,
  },

  // ==========================================
  // Meta AI / Llama Family
  // ==========================================
  {
    id: "meta-llama-3-3-70b",
    name: "Meta Llama 3.3 70B",
    provider: "meta",
    providerName: "Meta AI",
    inputCostPer1M: 0.13,
    outputCostPer1M: 0.40,
    contextWindow: 128000,
    badge: "Cheapest",
    description: "Meta's flagship open-weights model matching 405B capabilities at 70B latency & cost",
    category: "fast",
  },
  {
    id: "meta-llama-3-1-405b",
    name: "Meta Llama 3.1 405B",
    provider: "meta",
    providerName: "Meta AI",
    inputCostPer1M: 1.80,
    outputCostPer1M: 1.80,
    contextWindow: 128000,
    badge: "Flagship",
    description: "Massive frontier open model for high-fidelity synthetic data, code, and fine-tuning",
    category: "flagship",
    recommendedAlternativeId: "meta-llama-3-3-70b",
    savingsPercentageVsAlternative: 92,
  },
];

export interface ProviderMeta {
  provider: string;
  name: string;
  prefix: string;
  keyPlaceholder: string;
  color: string;
  accentBorder: string;
  accentBg: string;
  docsUrl: string;
  pricingNote: string;
}

export const PROVIDER_METAS: Record<string, ProviderMeta> = {
  openai: {
    provider: "openai",
    name: "OpenAI",
    prefix: "sk-proj-",
    keyPlaceholder: "sk-proj-...",
    color: "#10a37f",
    accentBorder: "border-emerald-500/40",
    accentBg: "bg-emerald-500/10",
    docsUrl: "https://platform.openai.com/api-keys",
    pricingNote: "GPT-4o, GPT-4o mini, o1, o3-mini",
  },
  anthropic: {
    provider: "anthropic",
    name: "Anthropic Claude",
    prefix: "sk-ant-",
    keyPlaceholder: "sk-ant-api03-...",
    color: "#d97706",
    accentBorder: "border-amber-500/40",
    accentBg: "bg-amber-500/10",
    docsUrl: "https://console.anthropic.com/settings/keys",
    pricingNote: "Claude 3.7 Sonnet, 3.5 Sonnet, Haiku, Opus",
  },
  google: {
    provider: "google",
    name: "Google Gemini",
    prefix: "AIzaSy",
    keyPlaceholder: "AIzaSy...",
    color: "#3b82f6",
    accentBorder: "border-blue-500/40",
    accentBg: "bg-blue-500/10",
    docsUrl: "https://aistudio.google.com/app/apikey",
    pricingNote: "Gemini 2.0 Flash, 1.5 Pro, 1.5 Flash",
  },
  deepseek: {
    provider: "deepseek",
    name: "DeepSeek",
    prefix: "sk-",
    keyPlaceholder: "sk-...",
    color: "#06b6d4",
    accentBorder: "border-cyan-500/40",
    accentBg: "bg-cyan-500/10",
    docsUrl: "https://platform.deepseek.com/api_keys",
    pricingNote: "DeepSeek V3 ($0.14/1M), R1 ($0.55/1M)",
  },
  moonshot: {
    provider: "moonshot",
    name: "Moonshot Kimi",
    prefix: "sk-",
    keyPlaceholder: "sk-...",
    color: "#8b5cf6",
    accentBorder: "border-purple-500/40",
    accentBg: "bg-purple-500/10",
    docsUrl: "https://platform.moonshot.cn/console/api-keys",
    pricingNote: "Kimi v1 128k long-context",
  },
  xai: {
    provider: "xai",
    name: "xAI Grok",
    prefix: "xai-",
    keyPlaceholder: "xai-...",
    color: "#f43f5e",
    accentBorder: "border-rose-500/40",
    accentBg: "bg-rose-500/10",
    docsUrl: "https://console.x.ai/",
    pricingNote: "Grok 2, Grok 2 Vision",
  },
  meta: {
    provider: "meta",
    name: "Meta AI (Llama)",
    prefix: "meta-",
    keyPlaceholder: "Together / Groq / Fireworks key for Llama...",
    color: "#0284c7",
    accentBorder: "border-sky-500/40",
    accentBg: "bg-sky-500/10",
    docsUrl: "https://llama.meta.com/",
    pricingNote: "Llama 3.3 70B ($0.13/1M), Llama 3.1 405B",
  },
};

export function getModelById(id: string): AIModelPrice | undefined {
  return AI_MODELS_CATALOG.find((m) => m.id === id);
}

export function calculateModelCost(
  model: AIModelPrice,
  inputTokens: number,
  outputTokens: number,
  cachedInputTokens = 0,
): number {
  const safeInput = Math.max(0, inputTokens);
  const safeOutput = Math.max(0, outputTokens);
  const safeCached = Math.min(safeInput, Math.max(0, cachedInputTokens));
  const regularInput = safeInput - safeCached;
  const inputCost = (regularInput / 1_000_000) * model.inputCostPer1M;
  const cachedCost = (safeCached / 1_000_000) * (model.cachedInputCostPer1M ?? model.inputCostPer1M);
  const outputCost = (safeOutput / 1_000_000) * model.outputCostPer1M;
  return Number((inputCost + cachedCost + outputCost).toFixed(8));
}
