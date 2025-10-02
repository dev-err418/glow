-- ============================================
-- Fix RLS Policies - Final Working Version
-- ============================================

-- First, drop all existing policies to start fresh
DROP POLICY IF EXISTS "Allow anonymous inserts" ON public.onboarding_responses;
DROP POLICY IF EXISTS "Allow anonymous updates" ON public.onboarding_responses;
DROP POLICY IF EXISTS "Allow service role full access to onboarding" ON public.onboarding_responses;
DROP POLICY IF EXISTS "Allow anonymous feedback inserts" ON public.feedback;
DROP POLICY IF EXISTS "Allow service role full access to feedback" ON public.feedback;

-- Enable RLS on both tables
ALTER TABLE public.onboarding_responses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.feedback ENABLE ROW LEVEL SECURITY;

-- ============================================
-- Working RLS Policies
-- ============================================

-- Policy 1: Allow INSERT for anon role (no conditions)
CREATE POLICY "anon_insert_onboarding"
ON public.onboarding_responses
FOR INSERT
TO anon
WITH CHECK (true);

-- Policy 2: Allow UPDATE for anon role (no conditions)
CREATE POLICY "anon_update_onboarding"
ON public.onboarding_responses
FOR UPDATE
TO anon
USING (true)
WITH CHECK (true);

-- Policy 3: Allow SELECT for anon role (optional - if you want users to read their data)
CREATE POLICY "anon_select_onboarding"
ON public.onboarding_responses
FOR SELECT
TO anon
USING (true);

-- Policy 4: Service role has full access (for admin/backend)
CREATE POLICY "service_role_all_onboarding"
ON public.onboarding_responses
FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

-- Policy 5: Allow INSERT for feedback (anon role)
CREATE POLICY "anon_insert_feedback"
ON public.feedback
FOR INSERT
TO anon
WITH CHECK (true);

-- Policy 6: Service role has full access to feedback
CREATE POLICY "service_role_all_feedback"
ON public.feedback
FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

-- ============================================
-- Verify policies are created correctly
-- ============================================
SELECT
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM pg_policies
WHERE tablename IN ('onboarding_responses', 'feedback')
ORDER BY tablename, policyname;

-- Test that anon role can actually insert
-- Note: In SQL Editor you're using service_role, so you need to test from the app
-- But this query will show you what the anon role can theoretically do
SELECT
    grantee,
    table_name,
    privilege_type
FROM information_schema.role_table_grants
WHERE table_name IN ('onboarding_responses', 'feedback')
  AND grantee = 'anon';
