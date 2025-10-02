import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { Platform } from 'react-native';
import Constants from 'expo-constants';

// Database types
export interface OnboardingResponse {
  revenuecat_user_id: string;
  name: string;
  age: string;
  sex: string;
  mental_health_methods?: string[];
  streak_goal?: number;
  categories?: string[];
  notifications_enabled?: boolean;
  notifications_per_day?: number;
  notification_start_time?: string;
  notification_end_time?: string;
  widget_installed?: boolean;
  premium_trial_start_date?: string;
  premium_paywall_action?: 'started_trial' | 'skipped' | 'dismissed';
  created_at?: string;
  updated_at?: string;
}

export interface FeedbackSubmission {
  revenuecat_user_id: string;
  rating: number; // 1-5
  comment?: string;
  context?: {
    app_version?: string;
    platform?: string;
    os_version?: string;
    [key: string]: any;
  };
}

// Supabase client singleton
let supabase: SupabaseClient | null = null;

/**
 * Initialize Supabase client
 * Make sure to set EXPO_PUBLIC_SUPABASE_URL and EXPO_PUBLIC_SUPABASE_ANON_KEY in your .env
 */
export function getSupabaseClient(): SupabaseClient {
  if (supabase) {
    return supabase;
  }

  const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

  console.log('🔧 Supabase URL:', supabaseUrl);
  console.log('🔧 Supabase Anon Key (first 20 chars):', supabaseAnonKey?.substring(0, 20) + '...');
  console.log('🔧 Anon Key length:', supabaseAnonKey?.length);

  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error(
      'Missing Supabase credentials. Please set EXPO_PUBLIC_SUPABASE_URL and EXPO_PUBLIC_SUPABASE_ANON_KEY in your .env file'
    );
  }

  supabase = createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
      detectSessionInUrl: false,
    },
    global: {
      headers: {
        'X-Client-Info': 'glow-app',
      },
    },
  });

  console.log('✅ Supabase client initialized');

  return supabase;
}

/**
 * Submit onboarding data to Supabase
 * Uses upsert to handle both new inserts and updates
 */
export async function submitOnboardingData(
  revenuecatUserId: string,
  data: Omit<OnboardingResponse, 'revenuecat_user_id' | 'created_at' | 'updated_at'>
): Promise<{ success: boolean; error?: string }> {
  try {
    const client = getSupabaseClient();

    const payload: OnboardingResponse = {
      revenuecat_user_id: revenuecatUserId,
      ...data,
    };

    console.log('🔍 DEBUG: Submitting payload to Supabase:', JSON.stringify(payload, null, 2));

    const { data: returnedData, error } = await client
      .from('onboarding_responses')
      .upsert(payload, {
        onConflict: 'revenuecat_user_id',
      })
      .select();

    if (error) {
      console.error('❌ Error submitting onboarding data:', error);
      console.error('❌ Error details:', JSON.stringify(error, null, 2));
      return { success: false, error: error.message };
    }

    console.log('✅ Onboarding data submitted successfully');
    console.log('✅ Returned data:', returnedData);
    return { success: true };
  } catch (error) {
    console.error('❌ Exception submitting onboarding data:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Submit user feedback to Supabase
 */
export async function submitFeedback(
  revenuecatUserId: string,
  rating: number,
  comment?: string,
  additionalContext?: Record<string, any>
): Promise<{ success: boolean; error?: string }> {
  try {
    const client = getSupabaseClient();

    // Validate rating
    if (rating < 1 || rating > 5) {
      return { success: false, error: 'Rating must be between 1 and 5' };
    }

    // Build context object with app info
    const context = {
      app_version: Constants.expoConfig?.version || 'unknown',
      platform: Platform.OS,
      os_version: Platform.Version?.toString() || 'unknown',
      ...additionalContext,
    };

    const payload: FeedbackSubmission = {
      revenuecat_user_id: revenuecatUserId,
      rating,
      comment,
      context,
    };

    const { error } = await client.from('feedback').insert(payload);

    if (error) {
      console.error('Error submitting feedback:', error);
      return { success: false, error: error.message };
    }

    console.log('Feedback submitted successfully');
    return { success: true };
  } catch (error) {
    console.error('Exception submitting feedback:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Update existing onboarding data
 * Note: Currently we only support insert, not updates
 */
export async function updateOnboardingData(
  revenuecatUserId: string,
  data: Partial<Omit<OnboardingResponse, 'revenuecat_user_id' | 'created_at' | 'updated_at'>>
): Promise<{ success: boolean; error?: string }> {
  try {
    const client = getSupabaseClient();

    const { data: returnedData, error } = await client
      .from('onboarding_responses')
      .update(data)
      .eq('revenuecat_user_id', revenuecatUserId)
      .select();

    if (error) {
      console.error('❌ Error updating onboarding data:', error);
      return { success: false, error: error.message };
    }

    console.log('✅ Onboarding data updated successfully');
    return { success: true };
  } catch (error) {
    console.error('❌ Exception updating onboarding data:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}
