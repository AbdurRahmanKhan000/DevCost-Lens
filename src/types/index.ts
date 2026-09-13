export type AIProvider = 
  | 'openai' 
  | 'anthropic' 
  | 'google' 
  | 'deepseek' 
  | 'xai' 
  | 'moonshot' 
  | 'meta' 
  | 'mistral' 
  | 'cohere' 
  | 'perplexity';

export interface AIModelPrice {
  id: string;
  name: string;
  provider: AIProvider;
  providerName: string;
  inputCostPer1M: number; // in USD
  outputCostPer1M: number; // in USD
  cachedInputCostPer1M?: number;
  contextWindow: number;
  badge?: 'Popular' | 'Cheapest' | 'Flagship' | 'Reasoning' | 'Ultra-Fast';
  description: string;
  category: 'flagship' | 'fast' | 'reasoning' | 'embedding';
  recommendedAlternativeId?: string;
  savingsPercentageVsAlternative?: number;
}

export interface CostCalculationResult {
  modelId: string;
  inputTokens: number;
  outputTokens: number;
  inputCost: number;
  outputCost: number;
  totalCost: number;
  alternative?: {
    modelId: string;
    modelName: string;
    alternativeTotalCost: number;
    savingsAmount: number;
    savingsPercentage: number;
  };
}

export interface EncryptedApiKeyPayload {
  ciphertext: string; // base64
  iv: string; // base64
  salt: string; // base64
  provider: AIProvider;
  keyLabel: string;
  lastFourChars: string;
  createdAt: string;
}

export interface StoredApiKey extends EncryptedApiKeyPayload {
  id: string;
  userId?: string;
  lastUsedAt?: string;
  totalSpendUSD: number;
  status: 'active' | 'revoked' | 'error';
  rateLimitRPM?: number;
  tier?: string;
  tokensLimit?: number;
  tokensRemaining?: number;
  tokensUsed?: number;
  modelsAccessible?: string;
  lastExaminedAt?: string;
}

export interface UsageRecord {
  id: string;
  userId?: string;
  provider: AIProvider;
  modelId: string;
  promptTokens: number;
  completionTokens: number;
  totalTokens: number;
  costUSD: number;
  latencyMs?: number;
  requestType: 'chat' | 'completion' | 'embedding' | 'reasoning' | 'csv_import';
  projectTag: string;
  loggedAt: string;
}

export interface UsageUploadResult {
  fileName: string;
  recordsCount: number;
  totalTokens: number;
  totalCostUSD: number;
  providers: string[];
}

export interface UserProfile {
  id: string;
  clerkId: string;
  email: string;
  fullName: string;
  avatarUrl?: string;
  monthlyBudgetUSD: number;
  currentMonthSpendUSD: number;
  createdAt: string;
}

export type ActiveView = 
  | 'landing' 
  | 'login' 
  | 'signup' 
  | 'about' 
  | 'schema'
  | 'apis'
  | 'token-counter'
  | 'dashboard'
  | 'donation'
  | 'admin';

export type ThemeMode = 'dark' | 'light';

export type SubscriptionPlanId = 'free' | 'pro_monthly' | 'pro_6months' | 'pro_annual';

export interface UserSubscription {
  id: string;
  clerkUserId: string;
  userEmail: string;
  planId: SubscriptionPlanId;
  planName: string;
  amountPaidUSD: number;
  paymentMethod?: 'easypaisa' | 'mastercard' | 'admin_manual';
  status: 'active' | 'pending_verification' | 'expired';
  startsAt: string;
  expiresAt?: string;
  isVerified: boolean;
  maxApis: number;
}

export interface PaymentVerificationSubmission {
  id: string;
  clerkUserId: string;
  userEmail: string;
  userName?: string;
  planId: SubscriptionPlanId;
  planName: string;
  amountUSD: number;
  paymentMethod: 'easypaisa' | 'mastercard';
  transactionId: string;
  senderAccount: string;
  senderName: string;
  notesOrReceipt?: string;
  status: 'pending' | 'approved' | 'rejected';
  submittedAt: string;
  reviewedAt?: string;
  reviewedByAdminId?: string;
}

export interface PaymentInstructionResponse {
  method: 'easypaisa' | 'mastercard';
  accountNumber: string;
  accountTitle: string;
  bankName?: string;
  instructions: string;
  amountUSD: number;
  approxPKR?: number;
  planId: SubscriptionPlanId;
  planName: string;
}

export interface AdminPaymentConfig {
  easypaisaNumber: string;
  easypaisaTitle: string;
  easypaisaInstructions: string;
  mastercardNumber: string;
  mastercardHolder: string;
  mastercardBankName: string;
  mastercardInstructions: string;
  updatedAt?: string;
}
