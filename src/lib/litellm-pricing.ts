/**
 * LiteLLM Cost Calculation Utility
 * Calculates token pricing across 100+ models, with smart recommendation of cheaper alternatives.
 */

import { AI_MODELS_CATALOG, getModelById } from "./ai-providers";
import { CostCalculationResult } from "../types";

export function calculateModelCost(
  modelId: string,
  inputTokens: number,
  outputTokens: number
): CostCalculationResult {
  const model = getModelById(modelId) || AI_MODELS_CATALOG[0];

  const inputCost = (inputTokens / 1_000_000) * model.inputCostPer1M;
  const outputCost = (outputTokens / 1_000_000) * model.outputCostPer1M;
  const totalCost = inputCost + outputCost;

  let alternativeResult: CostCalculationResult["alternative"] | undefined;

  if (model.recommendedAlternativeId) {
    const altModel = getModelById(model.recommendedAlternativeId);
    if (altModel) {
      const altInputCost = (inputTokens / 1_000_000) * altModel.inputCostPer1M;
      const altOutputCost = (outputTokens / 1_000_000) * altModel.outputCostPer1M;
      const altTotalCost = altInputCost + altOutputCost;

      const savingsAmount = Math.max(0, totalCost - altTotalCost);
      const savingsPercentage = totalCost > 0 ? (savingsAmount / totalCost) * 100 : 0;

      alternativeResult = {
        modelId: altModel.id,
        modelName: altModel.name,
        alternativeTotalCost: altTotalCost,
        savingsAmount,
        savingsPercentage: Math.round(savingsPercentage),
      };
    }
  }

  return {
    modelId: model.id,
    inputTokens,
    outputTokens,
    inputCost,
    outputCost,
    totalCost,
    alternative: alternativeResult,
  };
}

/**
 * Compare all models for a given token payload to find best budget vs performance options
 */
export function rankCheapestAlternatives(inputTokens: number, outputTokens: number) {
  return AI_MODELS_CATALOG.map((m) => {
    const inCost = (inputTokens / 1_000_000) * m.inputCostPer1M;
    const outCost = (outputTokens / 1_000_000) * m.outputCostPer1M;
    const total = inCost + outCost;
    return {
      model: m,
      inputCost: inCost,
      outputCost: outCost,
      totalCost: total,
    };
  }).sort((a, b) => a.totalCost - b.totalCost);
}
