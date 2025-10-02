-- Test INSERT command to run directly in Supabase SQL Editor
-- This will help us diagnose if it's an RLS issue or data/table structure issue

-- First, check if the table exists and view its structure
SELECT
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name = 'onboarding_responses'
ORDER BY ordinal_position;

-- Check current RLS policies
SELECT
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM pg_policies
WHERE tablename = 'onboarding_responses';

-- Check if RLS is enabled
SELECT
    schemaname,
    tablename,
    rowsecurity
FROM pg_tables
WHERE tablename = 'onboarding_responses';

-- Try the exact INSERT that the app is attempting
-- This uses service_role which bypasses RLS
INSERT INTO public.onboarding_responses (
    revenuecat_user_id,
    name,
    age,
    sex
) VALUES (
    '$RCAnonymousID:07309fad1bb44e87b6ebe77c4492e168',
    'Test User',
    '25-34',
    'female'
);

-- Verify the insert worked
SELECT * FROM public.onboarding_responses
WHERE revenuecat_user_id = '$RCAnonymousID:07309fad1bb44e87b6ebe77c4492e168';

-- Now test if we can insert using anon role (simulating the app)
-- First, let's see what the current user role is
SELECT current_user, session_user;

-- To truly test as anon role, you'd need to switch roles
-- SET ROLE anon;
-- Then try the insert again (this will likely fail with RLS error)

-- To disable RLS temporarily for testing:
-- ALTER TABLE public.onboarding_responses DISABLE ROW LEVEL SECURITY;

-- To re-enable RLS after testing:
-- ALTER TABLE public.onboarding_responses ENABLE ROW LEVEL SECURITY;
