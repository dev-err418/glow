import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Purchases from 'react-native-purchases';
import { usePostHog } from 'posthog-react-native';
import { submitOnboardingData } from '../services/supabaseService';

interface OnboardingData {
  name: string;
  age: string;
  sex: string;
  mentalHealthMethods?: string[];
  streakGoal?: number;
  categories?: string[];
  premiumTrialStartDate?: string;
  premiumPaywallAction?: 'started_trial' | 'skipped' | 'dismissed';
  subscriptionType?: 'yearly' | 'monthly' | null;
  notificationsEnabled?: boolean;
  notificationsPerDay?: number;
  notificationStartTime?: string;
  notificationEndTime?: string;
  widgetInstalled?: boolean;
  completed: boolean;
}

interface OnboardingContextType {
  onboardingData: OnboardingData;
  updateOnboardingData: (data: Partial<OnboardingData>) => void;
  completeOnboarding: () => void;
  isOnboardingComplete: boolean;
  isLoading: boolean;
}

const OnboardingContext = createContext<OnboardingContextType | undefined>(undefined);

const STORAGE_KEY = 'onboardingData';

const defaultOnboardingData: OnboardingData = {
  name: '',
  age: '',
  sex: '',
  completed: false,
};

export function OnboardingProvider({ children }: { children: React.ReactNode }) {
  const [onboardingData, setOnboardingData] = useState<OnboardingData>(defaultOnboardingData);
  const [isOnboardingComplete, setIsOnboardingComplete] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const posthog = usePostHog();

  // Load saved onboarding data on app start
  useEffect(() => {
    loadOnboardingData();
  }, []);

  // Save onboarding data when it changes
  useEffect(() => {
    saveOnboardingData();
    setIsOnboardingComplete(onboardingData.completed);
  }, [onboardingData]);

  const loadOnboardingData = async () => {
    try {
      const savedData = await AsyncStorage.getItem(STORAGE_KEY);
      if (savedData) {
        setOnboardingData(JSON.parse(savedData));
      }
    } catch (error) {
      console.error('Error loading onboarding data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const saveOnboardingData = async () => {
    try {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(onboardingData));
    } catch (error) {
      console.error('Error saving onboarding data:', error);
    }
  };

  const updateOnboardingData = (data: Partial<OnboardingData>) => {
    setOnboardingData((prev) => ({ ...prev, ...data }));
  };

  const completeOnboarding = async () => {
    setOnboardingData((prev) => ({ ...prev, completed: true }));

    // Track onboarding completion in PostHog
    posthog.capture('Onboarding Completed', {
      age: onboardingData.age,
      sex: onboardingData.sex,
      mentalHealthMethods: onboardingData.mentalHealthMethods,
      streakGoal: onboardingData.streakGoal,
      categoriesCount: onboardingData.categories?.length,
      notificationsEnabled: onboardingData.notificationsEnabled,
      notificationsPerDay: onboardingData.notificationsPerDay,
      widgetInstalled: onboardingData.widgetInstalled,
      premiumPaywallAction: onboardingData.premiumPaywallAction,
      subscriptionType: onboardingData.subscriptionType,
    });

    // Submit onboarding data to Supabase (non-blocking)
    try {
      const customerInfo = await Purchases.getCustomerInfo();
      const revenuecatUserId = customerInfo.originalAppUserId;

      // Convert camelCase to snake_case for Supabase
      await submitOnboardingData(revenuecatUserId, {
        name: onboardingData.name,
        age: onboardingData.age,
        sex: onboardingData.sex,
        mental_health_methods: onboardingData.mentalHealthMethods,
        streak_goal: onboardingData.streakGoal,
        categories: onboardingData.categories,
        notifications_enabled: onboardingData.notificationsEnabled,
        notifications_per_day: onboardingData.notificationsPerDay,
        notification_start_time: onboardingData.notificationStartTime,
        notification_end_time: onboardingData.notificationEndTime,
        widget_installed: onboardingData.widgetInstalled,
        premium_trial_start_date: onboardingData.premiumTrialStartDate,
        premium_paywall_action: onboardingData.premiumPaywallAction,
        subscription_type: onboardingData.subscriptionType,
      });
    } catch (error) {
      // Fail silently - don't block user flow if Supabase submission fails
      console.error('Failed to submit onboarding data to Supabase:', error);
    }
  };

  const value = {
    onboardingData,
    updateOnboardingData,
    completeOnboarding,
    isOnboardingComplete,
    isLoading,
  };

  return (
    <OnboardingContext.Provider value={value}>
      {children}
    </OnboardingContext.Provider>
  );
}

export function useOnboarding() {
  const context = useContext(OnboardingContext);
  if (context === undefined) {
    throw new Error('useOnboarding must be used within an OnboardingProvider');
  }
  return context;
}
