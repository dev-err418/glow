import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface OnboardingData {
  name: string;
  age: string;
  sex: string;
  mentalHealthMethod: string;
  completed: boolean;
}

interface OnboardingContextType {
  onboardingData: OnboardingData;
  updateOnboardingData: (data: Partial<OnboardingData>) => void;
  completeOnboarding: () => void;
  isOnboardingComplete: boolean;
}

const OnboardingContext = createContext<OnboardingContextType | undefined>(undefined);

const STORAGE_KEY = 'onboardingData';

const defaultOnboardingData: OnboardingData = {
  name: '',
  age: '',
  sex: '',
  mentalHealthMethod: '',
  completed: false,
};

export function OnboardingProvider({ children }: { children: React.ReactNode }) {
  const [onboardingData, setOnboardingData] = useState<OnboardingData>(defaultOnboardingData);
  const [isOnboardingComplete, setIsOnboardingComplete] = useState(false);

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

  const completeOnboarding = () => {
    setOnboardingData((prev) => ({ ...prev, completed: true }));
  };

  const value = {
    onboardingData,
    updateOnboardingData,
    completeOnboarding,
    isOnboardingComplete,
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
