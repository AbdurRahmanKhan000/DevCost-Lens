/**
 * Tiktoken Real Token Counting Utility
 * Uses js-tiktoken (BPE tokenizer) for exact token counting across OpenAI (o200k_base, cl100k_base),
 * Claude, Gemini, DeepSeek, Kimi, and Meta Llama prompts.
 */

import type { Tiktoken } from "js-tiktoken/lite";

// Perf: js-tiktoken's main entry bundles EVERY encoding's rank table
// (~5.6 MB) into whoever imports it, and building an encoder parses the
// rank table synchronously (~1s for o200k_base alone). That made the Prompt
// page chunk huge and blocked its first paint. So the encoders are loaded
// lazily, after first paint, from the package's per-encoding rank modules
// (js-tiktoken/lite + js-tiktoken/ranks/*) via dynamic import(). Until they
// arrive, estimateTokens() falls back to the heuristic below (its existing
// fallback path) and callers re-run once ensureTokenizersLoaded() resolves.
// Final counts are identical to before — same BPE tables, same encoder.
let o200kEncoder: Tiktoken | null = null;
let cl100kEncoder: Tiktoken | null = null;
let loadPromise: Promise<void> | null = null;

async function loadO200k(): Promise<void> {
  if (o200kEncoder) return;
  try {
    const [{ Tiktoken }, ranksModule] = await Promise.all([
      import("js-tiktoken/lite"),
      import("js-tiktoken/ranks/o200k_base"),
    ]);
    o200kEncoder = new Tiktoken(ranksModule.default);
  } catch (e) {
    console.warn("Could not init o200k_base, fallback to cl100k_base", e);
  }
}

async function loadCl100k(): Promise<void> {
  if (cl100kEncoder) return;
  try {
    const [{ Tiktoken }, ranksModule] = await Promise.all([
      import("js-tiktoken/lite"),
      import("js-tiktoken/ranks/cl100k_base"),
    ]);
    cl100kEncoder = new Tiktoken(ranksModule.default);
  } catch (e) {
    console.warn("Could not init cl100k_base", e);
  }
}

/**
 * Loads the BPE encoders in the background (after first paint). Resolves
 * once both encoders are ready (or have failed, in which case callers keep
 * using the heuristic fallback). Safe to call repeatedly — loads only once.
 */
export function ensureTokenizersLoaded(): Promise<void> {
  if (!loadPromise) {
    loadPromise = Promise.all([loadO200k(), loadCl100k()]).then(() => {});
  }
  return loadPromise;
}

function getO200k() {
  return o200kEncoder;
}

function getCl100k() {
  return cl100kEncoder;
}

export interface TokenCountEstimate {
  estimatedTokens: number;
  characters: number;
  words: number;
  lines: number;
  encoding: "o200k_base" | "cl100k_base" | "gemini_tokenizer" | "llama_tokenizer";
  tokensPerWord: number;
  characterCount: number;
  wordCount: number;
  lineCount: number;
}

/**
 * Counts REAL tokens using tiktoken (o200k_base for GPT-4o, cl100k_base for GPT-4/Claude,
 * calibrated scaling for Gemini & DeepSeek).
 */
export function estimateTokens(
  text: string,
  modelFamily: "openai" | "anthropic" | "google" | "deepseek" | "meta" | "moonshot" | "xai" = "openai"
): TokenCountEstimate {
  if (!text || text.length === 0) {
    return {
      estimatedTokens: 0,
      characters: 0,
      words: 0,
      lines: 0,
      characterCount: 0,
      wordCount: 0,
      lineCount: 0,
      encoding: "o200k_base",
      tokensPerWord: 0,
    };
  }

  const characters = text.length;
  const words = text.trim().split(/\s+/).filter(Boolean).length || 1;
  const lines = text.split("\n").length;

  let tokenCount = 0;
  let encodingUsed: TokenCountEstimate["encoding"] = "o200k_base";

  try {
    if (modelFamily === "openai" || modelFamily === "xai") {
      const enc = getO200k() || getCl100k();
      if (enc) {
        tokenCount = enc.encode(text).length;
        encodingUsed = "o200k_base";
      }
    } else if (modelFamily === "anthropic" || modelFamily === "moonshot") {
      const enc = getCl100k();
      if (enc) {
        tokenCount = enc.encode(text).length;
        encodingUsed = "cl100k_base";
      }
    } else if (modelFamily === "google") {
      // Gemini's SentencePiece tokenizer is ~1.05x the density of cl100k on code/multilingual
      const enc = getCl100k();
      if (enc) {
        tokenCount = Math.ceil(enc.encode(text).length * 1.02);
        encodingUsed = "gemini_tokenizer";
      }
    } else if (modelFamily === "deepseek" || modelFamily === "meta") {
      // DeepSeek & Llama byte-level BPE tokenizers
      const enc = getCl100k();
      if (enc) {
        tokenCount = enc.encode(text).length;
        encodingUsed = "llama_tokenizer";
      }
    }
  } catch (err) {
    console.warn("BPE encoding error, using heuristic fallback:", err);
  }

  // Safe fallback if BPE tokenizer fails
  if (!tokenCount || tokenCount === 0) {
    const codeMarkers = (text.match(/[{}[\]()<>=;:/*+\-&|^%#$@!~]/g) || []).length;
    const codeRatio = characters > 0 ? codeMarkers / characters : 0;
    const multiplier = codeRatio > 0.15 ? 0.38 : 0.25;
    tokenCount = Math.max(1, Math.ceil(characters * multiplier));
  }

  return {
    estimatedTokens: tokenCount,
    characters,
    words,
    lines,
    characterCount: characters,
    wordCount: words,
    lineCount: lines,
    encoding: encodingUsed,
    tokensPerWord: Number((tokenCount / words).toFixed(2)),
  };
}
