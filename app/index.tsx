import React, { useEffect } from 'react';
import { Text, View, ActivityIndicator, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { useOnboarding } from '../contexts/OnboardingContext';
import { Colors } from '../constants/Colors';

export default function Index() {
  const router = useRouter();
  const { onboardingData } = useOnboarding();

  useEffect(() => {
    // Delay navigation to ensure Stack is mounted
    const timer = setTimeout(() => {
      if (!onboardingData.completed) {
        // User hasn't completed onboarding - go to welcome screen
        router.replace('/onboarding/welcome');
      }
    }, 100);

    return () => clearTimeout(timer);
  }, []);

  // If onboarding is completed, show home screen
  if (onboardingData.completed) {
    return (
      <View style={styles.container}>
        <View style={styles.content}>
          <Text style={styles.title}>Welcome back!</Text>
          <Text style={styles.subtitle}>Your daily affirmations await</Text>
        </View>
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
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
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
  },
});
