import * as Notifications from 'expo-notifications';
import { useNavigation, useRouter } from 'expo-router';
import React, { useLayoutEffect } from 'react';
import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Button } from '../../components/Button';
import { Colors } from '../../constants/Colors';
import { Typography } from '../../constants/Typography';
import { useOnboarding } from '../../contexts/OnboardingContext';

export default function PremiumScreen() {
  const router = useRouter();
  const navigation = useNavigation();
  const { completeOnboarding, updateOnboardingData } = useOnboarding();

  const schedulePremiumReminder = async () => {
    try {
      // Schedule notification for 2 days from now (48 hours)
      await Notifications.scheduleNotificationAsync({
        content: {
          title: "Your free trial ends tomorrow 💫",
          body: "No surprise, no pressure! Just a friendly reminder about your 3-day premium trial.",
          sound: true,
        },
        trigger: {
          type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
          seconds: 2 * 24 * 60 * 60, // 2 days in seconds
        },
      });
    } catch (error) {
      console.error('Error scheduling premium reminder:', error);
    }
  };

  const handleStartTrial = async () => {
    const trialStartDate = new Date().toISOString();
    updateOnboardingData({ premiumTrialStartDate: trialStartDate });
    await schedulePremiumReminder();
    completeOnboarding();
    router.replace('/');
  };

  const handleSkip = () => {
    completeOnboarding();
    router.replace('/');
  };

  useLayoutEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <TouchableOpacity onPress={handleSkip} style={{ marginRight: 8 }}>
          <Text style={{ color: Colors.text.secondary, fontSize: 16 }}>
            Skip
          </Text>
        </TouchableOpacity>
      ),
    });
  }, [navigation]);

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <View style={styles.mascotContainer}>
          <Image
            source={require('../../assets/images/mascot-alone.png')}
            style={styles.mascot}
            resizeMode="contain"
          />
        </View>

        <Text style={styles.title}>
          A special offer, just for you
        </Text>
        <Text style={styles.subtitle}>
          Because you're here, enjoy 3 days of Premium, on us. We'll remind you the day before it ends.
        </Text>
      </View>

      <View style={styles.buttonContainer}>
        <Button
          variant="primary"
          size="large"
          onPress={handleStartTrial}
          style={styles.button}
        >
          Start free trial
        </Button>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background.default,
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  mascotContainer: {
    marginBottom: 40,
  },
  mascot: {
    width: 150,
    height: 150,
  },
  title: {
    ...Typography.h2,
    textAlign: 'center',
    marginBottom: 16,
  },
  subtitle: {
    ...Typography.subtitle,
    textAlign: 'center',
    color: Colors.text.secondary,
    paddingHorizontal: 20,
  },
  buttonContainer: {
    padding: 24,
    backgroundColor: Colors.background.default,
  },
  button: {
    width: '100%',
  },
});
