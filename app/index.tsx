import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Haptics from 'expo-haptics';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Colors } from '../constants/Colors';
import { useOnboarding } from '../contexts/OnboardingContext';
import { usePremium } from '../contexts/PremiumContext';
import { submitOnboardingData } from '../services/supabaseService';

export default function Index() {
  const router = useRouter();
  const { onboardingData, isLoading } = useOnboarding();
  const { customerInfo } = usePremium();
  const [showData, setShowData] = useState(false);
  const [isSubmittingTest, setIsSubmittingTest] = useState(false);

  useEffect(() => {
    // Wait for data to load before making navigation decisions
    if (!isLoading && !onboardingData.completed) {
      // Delay navigation to ensure Stack is mounted
      const timer = setTimeout(() => {
        router.replace('/onboarding/welcome');
      }, 100);

      return () => clearTimeout(timer);
    }
  }, [isLoading, onboardingData.completed]);

  const handleResetOnboarding = async () => {
    await AsyncStorage.removeItem('onboardingData');
    router.replace('/onboarding/welcome');
  };

  const handleTestOnboarding = async () => {
    if (!customerInfo) {
      Alert.alert('Error', 'Customer info not available yet. Please wait.');
      return;
    }

    setIsSubmittingTest(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    try {
      console.log('🧪 Testing with RevenueCat User ID:', customerInfo.originalAppUserId);

      // Full onboarding data test
      const result = await submitOnboardingData(
        customerInfo.originalAppUserId,
        {
          name: 'Test User',
          age: '25-34',
          sex: 'female',
          mental_health_methods: ['meditation', 'exercise', 'yoga'],
          streak_goal: 7,
          categories: ['mindfulness', 'gratitude', 'self-care'],
          notifications_enabled: true,
          notifications_per_day: 3,
          notification_start_time: '09:00',
          notification_end_time: '21:00',
          widget_installed: true,
          premium_trial_start_date: new Date().toISOString(),
          premium_paywall_action: 'started_trial',
        }
      );

      if (result.success) {
        Alert.alert('Success!', 'Test onboarding data submitted successfully to Supabase!');
      } else {
        Alert.alert('Error', `Failed to submit onboarding: ${result.error}`);
      }
    } catch (error) {
      Alert.alert('Error', `Exception: ${error}`);
    } finally {
      setIsSubmittingTest(false);
    }
  };

  // Show loading spinner while data is loading
  if (isLoading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }

  // If onboarding is completed, show home screen
  if (onboardingData.completed) {
    return (
      <View style={styles.container}>
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <View style={styles.content}>
            <Text style={styles.title}>Welcome back!</Text>
            <Text style={styles.subtitle}>Your daily affirmations await</Text>

            <TouchableOpacity
              style={styles.categoriesButton}
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                router.push('/categories-modal');
              }}
            >
              <Ionicons name="grid" size={24} color={Colors.text.white} />
              <Text style={styles.categoriesButtonText}>Browse Categories</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.button}
              onPress={() => setShowData(!showData)}
            >
              <Text style={styles.buttonText}>
                {showData ? 'Hide' : 'Show'} Saved Data
              </Text>
            </TouchableOpacity>

            {showData && (
              <View style={styles.dataContainer}>
                <Text style={styles.dataTitle}>Saved Onboarding Data:</Text>
                <Text style={styles.dataText}>Name: {onboardingData.name || 'Not set'}</Text>
                <Text style={styles.dataText}>Age: {onboardingData.age || 'Not set'}</Text>
                <Text style={styles.dataText}>Sex: {onboardingData.sex || 'Not set'}</Text>
                <Text style={styles.dataText}>Mental Health: {onboardingData.mentalHealthMethods || 'Not set'}</Text>
                <Text style={styles.dataText}>Streak Goal: {onboardingData.streakGoal || 'Not set'}</Text>
                <Text style={styles.dataText}>Categories: {onboardingData.categories?.join(', ') || 'None'}</Text>
                <Text style={styles.dataText}>Notifications Enabled: {onboardingData.notificationsEnabled ? 'Yes' : 'No'}</Text>
                <Text style={styles.dataText}>Notifications Per Day: {onboardingData.notificationsPerDay || 'Not set'}</Text>
                <Text style={styles.dataText}>Start Time: {onboardingData.notificationStartTime ? new Date(onboardingData.notificationStartTime).toLocaleTimeString() : 'Not set'}</Text>
                <Text style={styles.dataText}>End Time: {onboardingData.notificationEndTime ? new Date(onboardingData.notificationEndTime).toLocaleTimeString() : 'Not set'}</Text>
                <Text style={styles.dataText}>Widget Installed: {onboardingData.widgetInstalled ? 'Yes' : 'No'}</Text>
                <Text style={styles.dataText}>Premium Paywall: {onboardingData.premiumPaywallAction || 'Not shown'}</Text>
                <Text style={styles.dataText}>Premium Trial Start: {onboardingData.premiumTrialStartDate || 'Not started'}</Text>
                <Text style={styles.dataText}>Completed: {onboardingData.completed ? 'Yes' : 'No'}</Text>
              </View>
            )}

            <TouchableOpacity
              style={[styles.button, styles.testButton]}
              onPress={handleTestOnboarding}
              disabled={isSubmittingTest}
            >
              {isSubmittingTest ? (
                <ActivityIndicator size="small" color={Colors.text.white} />
              ) : (
                <Text style={styles.buttonText}>Test Supabase Onboarding</Text>
              )}
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.button, styles.resetButton]}
              onPress={handleResetOnboarding}
            >
              <Text style={styles.buttonText}>Reset Onboarding</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </View>
    );
  }

  // Show loading while checking/redirecting
  return (
    <View style={styles.container}>
      <ActivityIndicator size="large" color={Colors.primary} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background.default,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  content: {
    alignItems: 'center',
    width: '100%',
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: Colors.text.primary,
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: Colors.text.secondary,
    textAlign: 'center',
    marginBottom: 30,
  },
  categoriesButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.primary,
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 16,
    marginBottom: 20,
    shadowColor: Colors.shadow.medium,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  categoriesButtonText: {
    color: Colors.text.white,
    fontSize: 18,
    fontWeight: '600',
    marginLeft: 8,
  },
  button: {
    backgroundColor: Colors.primary,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
    marginTop: 20,
  },
  testButton: {
    backgroundColor: Colors.secondary,
  },
  resetButton: {
    backgroundColor: Colors.status.error,
  },
  buttonText: {
    color: Colors.text.white,
    fontSize: 16,
    fontWeight: '600',
  },
  dataContainer: {
    backgroundColor: Colors.background.primary,
    borderRadius: 12,
    padding: 20,
    marginTop: 20,
    width: '100%',
  },
  dataTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.text.primary,
    marginBottom: 12,
  },
  dataText: {
    fontSize: 14,
    color: Colors.text.secondary,
    marginBottom: 8,
  },
});
