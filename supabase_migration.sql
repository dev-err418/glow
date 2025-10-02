-- Migration script to update mental_health_method column to mental_health_methods JSONB
-- Run this in your Supabase SQL Editor

-- Option 1: If you have existing data you want to keep
-- Convert the old TEXT column to JSONB array
ALTER TABLE public.onboarding_responses
  DROP COLUMN IF EXISTS mental_health_method;

ALTER TABLE public.onboarding_responses
  ADD COLUMN IF NOT EXISTS mental_health_methods JSONB;

-- Option 2: If you want a fresh start (WARNING: deletes all data)
-- DROP TABLE IF EXISTS public.onboarding_responses CASCADE;
-- Then run the full supabase_schema.sql file

-- Verify the change
SELECT column_name, data_type
FROM information_schema.columns
WHERE table_name = 'onboarding_responses'
  AND table_schema = 'public';
