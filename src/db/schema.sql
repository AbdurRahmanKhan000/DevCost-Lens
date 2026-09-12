-- ==========================================================
-- DevCost Lens — PostgreSQL Schema for Supabase or Neon
-- Phase 1 & 2: Profiles, Encrypted Keys, Usage Logs, Alerts
-- Phase 3: Monetization, AES-GCM Encrypted Payment Gateways,
--          Subscriptions & Admin Verification Queue
-- ==========================================================

-- 1. Enable UUID Extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. User Profiles (Synced from Clerk Webhooks: user.created, user.updated)
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  clerk_user_id TEXT UNIQUE NOT NULL,
  email TEXT NOT NULL,
  full_name TEXT,
  avatar_url TEXT,
  monthly_budget_usd NUMERIC(10, 2) DEFAULT 50.00,
  alert_threshold_pct INTEGER DEFAULT 80, -- Alert at 80% of budget
  notification_email TEXT,
  currency TEXT DEFAULT 'USD',
  subscription_tier TEXT DEFAULT 'free', -- 'free', 'pro_monthly', 'pro_6months', 'pro_annual'
  subscription_status TEXT DEFAULT 'active', -- 'active', 'pending_verification', 'expired'
  max_api_keys INTEGER DEFAULT 2, -- Free: 2, Pro: 999999
  subscription_expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for Clerk lookups
CREATE INDEX IF NOT EXISTS idx_profiles_clerk_id ON public.profiles(clerk_user_id);

-- 3. Encrypted User API Keys (AES-GCM encrypted on client/edge)
CREATE TABLE IF NOT EXISTS public.encrypted_api_keys (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  clerk_user_id TEXT,
  provider TEXT NOT NULL, -- 'openai', 'anthropic', 'google', 'deepseek', 'xai', etc.
  key_label TEXT NOT NULL,
  last_four_chars VARCHAR(8) NOT NULL,
  ciphertext TEXT NOT NULL, -- Base64 AES-GCM encrypted string
  iv TEXT NOT NULL,         -- Base64 initialization vector
  salt TEXT NOT NULL,       -- Base64 salt
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_keys_user_provider ON public.encrypted_api_keys(user_id, provider);

-- 4. AI Usage Logs (Smart Electricity Meter log items)
CREATE TABLE IF NOT EXISTS public.usage_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  clerk_user_id TEXT,
  provider TEXT NOT NULL,
  model_id TEXT NOT NULL,
  prompt_tokens INTEGER NOT NULL DEFAULT 0,
  completion_tokens INTEGER NOT NULL DEFAULT 0,
  total_tokens INTEGER NOT NULL DEFAULT 0,
  cost_usd NUMERIC(12, 6) NOT NULL DEFAULT 0,
  latency_ms INTEGER,
  request_type TEXT DEFAULT 'chat', -- 'chat', 'completion', 'embedding', 'reasoning'
  project_tag TEXT DEFAULT 'default',
  logged_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_usage_user_date ON public.usage_logs(user_id, logged_at DESC);
CREATE INDEX IF NOT EXISTS idx_usage_model ON public.usage_logs(model_id);

-- 5. Budget Alerts & Shock Prevention Triggers
CREATE TABLE IF NOT EXISTS public.budget_alerts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  alert_type TEXT NOT NULL, -- 'threshold_reached', 'unusual_spike', 'cheaper_alternative'
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  suggested_alternative_model TEXT,
  estimated_savings_usd NUMERIC(10, 2),
  is_read BOOLEAN DEFAULT FALSE,
  triggered_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_alerts_user ON public.budget_alerts(user_id, is_read);

-- ==========================================================
-- PHASE 3: ADMIN PAYMENT GATEWAYS & MONETIZATION
-- ==========================================================

-- 6. Encrypted Admin Payment Credentials (AES-GCM encrypted)
-- Phone numbers & card details are encrypted on backend and NEVER exposed in frontend code!
CREATE TABLE IF NOT EXISTS public.admin_payment_settings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  -- EasyPaisa credentials (AES-GCM encrypted)
  easypaisa_number_ciphertext TEXT NOT NULL,
  easypaisa_number_iv TEXT NOT NULL,
  easypaisa_title_ciphertext TEXT NOT NULL,
  easypaisa_title_iv TEXT NOT NULL,
  easypaisa_instructions TEXT,
  -- MasterCard / Bank credentials (AES-GCM encrypted)
  mastercard_number_ciphertext TEXT NOT NULL,
  mastercard_number_iv TEXT NOT NULL,
  mastercard_holder_ciphertext TEXT NOT NULL,
  mastercard_holder_iv TEXT NOT NULL,
  mastercard_bank_name TEXT,
  mastercard_instructions TEXT,
  -- Salt & metadata
  encryption_salt TEXT NOT NULL,
  updated_by_clerk_id TEXT NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. User Subscriptions (Free, Pro Monthly $15, Pro 6-Months $60, Pro Annual $100)
CREATE TABLE IF NOT EXISTS public.user_subscriptions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  clerk_user_id TEXT NOT NULL,
  user_email TEXT NOT NULL,
  plan_id TEXT NOT NULL, -- 'free', 'pro_monthly', 'pro_6months', 'pro_annual'
  plan_name TEXT NOT NULL,
  amount_paid_usd NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
  payment_method TEXT, -- 'easypaisa', 'mastercard', 'admin_manual'
  transaction_ref TEXT,
  status TEXT NOT NULL DEFAULT 'active', -- 'active', 'pending_verification', 'expired'
  starts_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ,
  is_verified BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_sub_clerk_user ON public.user_subscriptions(clerk_user_id);

-- 8. Payment Verification Submissions (User pays via EasyPaisa or Card -> Submits TRX ID)
CREATE TABLE IF NOT EXISTS public.payment_verifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  clerk_user_id TEXT NOT NULL,
  user_email TEXT NOT NULL,
  user_name TEXT,
  plan_id TEXT NOT NULL, -- 'pro_monthly', 'pro_6months', 'pro_annual'
  plan_name TEXT NOT NULL,
  amount_usd NUMERIC(10, 2) NOT NULL,
  payment_method TEXT NOT NULL, -- 'easypaisa', 'mastercard'
  transaction_id TEXT NOT NULL,
  sender_account TEXT NOT NULL, -- EasyPaisa mobile number or Card last 4
  sender_name TEXT NOT NULL,
  notes_or_receipt TEXT,
  status TEXT NOT NULL DEFAULT 'pending', -- 'pending', 'approved', 'rejected'
  submitted_at TIMESTAMPTZ DEFAULT NOW(),
  reviewed_at TIMESTAMPTZ,
  reviewed_by_admin_id TEXT
);

CREATE INDEX IF NOT EXISTS idx_verifications_status ON public.payment_verifications(status);
CREATE INDEX IF NOT EXISTS idx_verifications_clerk ON public.payment_verifications(clerk_user_id);

-- 9. Row Level Security (RLS) for Supabase
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.encrypted_api_keys ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.usage_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.budget_alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payment_verifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_payment_settings ENABLE ROW LEVEL SECURITY;

-- Policies for Profiles & Keys
CREATE POLICY "Users can manage their own profile"
  ON public.profiles
  FOR ALL
  USING (clerk_user_id = auth.jwt() ->> 'sub');

CREATE POLICY "Users can manage their own encrypted keys"
  ON public.encrypted_api_keys
  FOR ALL
  USING (clerk_user_id = auth.jwt() ->> 'sub');

CREATE POLICY "Users can view their usage logs"
  ON public.usage_logs
  FOR SELECT
  USING (clerk_user_id = auth.jwt() ->> 'sub');

CREATE POLICY "Users can view their alerts"
  ON public.budget_alerts
  FOR ALL
  USING (clerk_user_id = auth.jwt() ->> 'sub');

CREATE POLICY "Users can view their subscriptions"
  ON public.user_subscriptions
  FOR SELECT
  USING (clerk_user_id = auth.jwt() ->> 'sub');

CREATE POLICY "Users can submit their payment verification"
  ON public.payment_verifications
  FOR INSERT
  WITH CHECK (clerk_user_id = auth.jwt() ->> 'sub');

CREATE POLICY "Users can view their own payment verification"
  ON public.payment_verifications
  FOR SELECT
  USING (clerk_user_id = auth.jwt() ->> 'sub');
