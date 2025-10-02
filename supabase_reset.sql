-- ============================================
-- RESET SCRIPT: Drop everything and recreate
-- WARNING: This will DELETE ALL DATA in these tables
-- Run this in your Supabase SQL Editor
-- ============================================

-- Drop all policies first
DROP POLICY IF EXISTS "Allow anonymous inserts" ON public.onboarding_responses;
DROP POLICY IF EXISTS "Allow anonymous updates" ON public.onboarding_responses;
DROP POLICY IF EXISTS "Allow anonymous feedback inserts" ON public.feedback;
DROP POLICY IF EXISTS "Allow service role full access to onboarding" ON public.onboarding_responses;
DROP POLICY IF EXISTS "Allow service role full access to feedback" ON public.feedback;

-- Drop triggers
DROP TRIGGER IF EXISTS update_onboarding_updated_at ON public.onboarding_responses;

-- Drop tables (CASCADE will drop dependent objects)
DROP TABLE IF EXISTS public.onboarding_responses CASCADE;
DROP TABLE IF EXISTS public.feedback CASCADE;

-- Drop function if exists
DROP FUNCTION IF EXISTS update_updated_at_column();

-- ============================================
-- Now recreate everything fresh
-- ============================================

-- Table: onboarding_responses
CREATE TABLE public.onboarding_responses (
  revenuecat_user_id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  age TEXT NOT NULL,
  sex TEXT NOT NULL,
  mental_health_methods JSONB,
  streak_goal INTEGER,
  categories JSONB,
  notifications_enabled BOOLEAN,
  notifications_per_day INTEGER,
  notification_start_time TEXT,
  notification_end_time TEXT,
  widget_installed BOOLEAN,
  premium_trial_start_date TIMESTAMPTZ,
  premium_paywall_action TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create index on created_at for faster queries
CREATE INDEX idx_onboarding_created_at ON public.onboarding_responses(created_at DESC);

-- Create function to automatically update updated_at timestamp
CREATE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to auto-update updated_at
CREATE TRIGGER update_onboarding_updated_at
  BEFORE UPDATE ON public.onboarding_responses
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Table: feedback
CREATE TABLE public.feedback (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  revenuecat_user_id TEXT NOT NULL,
  rating INTEGER CHECK (rating >= 1 AND rating <= 5),
  comment TEXT,
  context JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create index on revenuecat_user_id for faster user lookups
CREATE INDEX idx_feedback_user_id ON public.feedback(revenuecat_user_id);

-- Create index on created_at for faster queries
CREATE INDEX idx_feedback_created_at ON public.feedback(created_at DESC);

-- ============================================
-- Row Level Security (RLS) Policies
-- ============================================

-- Enable RLS on both tables
ALTER TABLE public.onboarding_responses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.feedback ENABLE ROW LEVEL SECURITY;

-- Policy: Allow anonymous inserts to onboarding_responses
CREATE POLICY "Allow anonymous inserts"
  ON public.onboarding_responses
  FOR INSERT
  TO anon
  WITH CHECK (true);

-- Policy: Allow anonymous updates to onboarding_responses
CREATE POLICY "Allow anonymous updates"
  ON public.onboarding_responses
  FOR UPDATE
  TO anon
  USING (true)
  WITH CHECK (true);

-- Policy: Allow anonymous inserts to feedback
CREATE POLICY "Allow anonymous feedback inserts"
  ON public.feedback
  FOR INSERT
  TO anon
  WITH CHECK (true);

-- Policy: Allow service role full access to onboarding
CREATE POLICY "Allow service role full access to onboarding"
  ON public.onboarding_responses
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- Policy: Allow service role full access to feedback
CREATE POLICY "Allow service role full access to feedback"
  ON public.feedback
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- ============================================
-- Grant permissions
-- ============================================
GRANT USAGE ON SCHEMA public TO anon;
GRANT INSERT, UPDATE ON public.onboarding_responses TO anon;
GRANT INSERT ON public.feedback TO anon;

-- ============================================
-- Verify everything was created successfully
-- ============================================
SELECT 'Tables created:' as status;
SELECT tablename FROM pg_tables WHERE schemaname = 'public' AND tablename IN ('onboarding_responses', 'feedback');

SELECT 'Policies created:' as status;
SELECT tablename, policyname FROM pg_policies WHERE schemaname = 'public';
