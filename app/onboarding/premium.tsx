import * as Haptics from 'expo-haptics';
import * as Notifications from 'expo-notifications';
import { useNavigation, useRouter } from 'expo-router';
import React, { useLayoutEffect, useState } from 'react';
import { ActivityIndicator, Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Purchases from 'react-native-purchases';
import { PAYWALL_RESULT } from 'react-native-purchases-ui';
import { Button } from '../../components/Button';
import { Colors } from '../../constants/Colors';
import { Typography } from '../../constants/Typography';
import { useOnboarding } from '../../contexts/OnboardingContext';
import { usePremium } from '../../contexts/PremiumContext';

export default function PremiumScreen() {
  const router = useRouter();
  const navigation = useNavigation();
  const { completeOnboarding, updateOnboardingData } = useOnboarding();
  const { showPaywall } = usePremium();
  const [isProcessing, setIsProcessing] = useState(false);

  const schedulePremiumReminder = async () => {
    try {
      // Schedule notification for 2 days from now (1 day before 3-day trial ends)
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
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      setIsProcessing(true);

      // Show RevenueCat paywall
      const result = await showPaywall();

      if (result === PAYWALL_RESULT.PURCHASED || result === PAYWALL_RESULT.RESTORED) {
        // User purchased or restored premium - check subscription type
        const customerInfo = await Purchases.getCustomerInfo();

        // Get subscription details
        const entitlement = customerInfo.entitlements.active['Premium'];
        const productId = entitlement?.productIdentifier;

        // Determine subscription type based on product identifier
        let subscriptionType: 'weekly' | 'monthly' | 'yearly' | 'lifetime' = 'monthly';
        if (productId === '$rc_weekly') {
          subscriptionType = 'weekly';
        } else if (productId === '$rc_monthly') {
          subscriptionType = 'monthly';
        } else if (productId === '$rc_annual') {
          subscriptionType = 'yearly';
        } else if (productId === '$rc_lifetime') {
          subscriptionType = 'lifetime';
        }

        const trialStartDate = new Date().toISOString();
        updateOnboardingData({
          premiumTrialStartDate: trialStartDate,
          premiumPaywallAction: 'started_trial',
          subscriptionType: subscriptionType
        });

        // Schedule trial reminder for any subscription with an introductory offer
        const hasTrialOrIntro = entitlement?.periodType === 'TRIAL' || entitlement?.periodType === 'INTRO';

        if (hasTrialOrIntro) {
          await schedulePremiumReminder();
          console.log(`📅 Trial reminder scheduled for ${subscriptionType} subscriber with introductory offer`);
        } else {
          console.log(`📅 Skipping trial reminder - ${subscriptionType} subscriber without trial`);
        }

        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        completeOnboarding();
        router.replace('/');
      } else if (result === PAYWALL_RESULT.CANCELLED) {
        // User cancelled the paywall - proceed anyway
        updateOnboardingData({ premiumPaywallAction: 'dismissed' });
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        completeOnboarding();
        router.replace('/');
      } else if (result === PAYWALL_RESULT.NOT_PRESENTED) {
        // User already has premium
        updateOnboardingData({
          premiumPaywallAction: 'started_trial'
        });
        completeOnboarding();
        router.replace('/');
      } else if (result === PAYWALL_RESULT.ERROR) {
        // Handle error
        console.error('Error showing paywall');
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      }
    } catch (error) {
      console.error('Error in handleStartTrial:', error);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleSkip = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    updateOnboardingData({ premiumPaywallAction: 'skipped' });
    completeOnboarding();
    router.replace('/');
  };

  useLayoutEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <TouchableOpacity onPress={handleSkip} style={{ marginHorizontal: 4 }}>
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
          Because you&apos;re here, enjoy 3 days of Premium, on us. We&apos;ll remind you the day before it ends.
        </Text>
      </View>

      <View style={styles.buttonContainer}>
        <Button
          variant="primary"
          size="large"
          onPress={handleStartTrial}
          style={styles.button}
          disabled={isProcessing}
        >
          {isProcessing ? (
            <ActivityIndicator color={Colors.text.white} />
          ) : (
            'Start free trial'
          )}
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
    paddingBottom: 100,
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
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 24,
  },
  button: {
    width: '100%',
  },
});
