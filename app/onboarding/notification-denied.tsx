import * as Haptics from 'expo-haptics';
import * as Notifications from 'expo-notifications';
import { useNavigation, useRouter } from 'expo-router';
import React, { useEffect, useLayoutEffect } from 'react';
import { AppState, Image, Linking, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-controller';
import { Button } from '../../components/Button';
import { Colors } from '../../constants/Colors';
import { Typography } from '../../constants/Typography';
import { useNotifications } from '../../contexts/NotificationContext';
import { useOnboarding } from '../../contexts/OnboardingContext';

export default function NotificationDeniedScreen() {
  const router = useRouter();
  const navigation = useNavigation();
  const { setNotificationsEnabled } = useNotifications();
  const { updateOnboardingData } = useOnboarding();

  useEffect(() => {
    const subscription = AppState.addEventListener('change', async (nextAppState) => {
      if (nextAppState === 'active') {
        // Check if permissions were granted while in settings
        const { status } = await Notifications.getPermissionsAsync();
        if (status === 'granted') {
          setNotificationsEnabled(true);
          updateOnboardingData({ notificationsEnabled: true });
          router.push('/onboarding/streak-intro');
        }
      }
    });

    return () => {
      subscription.remove();
    };
  }, []);

  const handleGoToSettings = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    Linking.openSettings();
  };

  const handleSkip = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.push('/onboarding/streak-intro');
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
      <KeyboardAwareScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.mascotContainer}>
          <Image
            source={require('../../assets/images/mascot-alone.png')}
            style={styles.mascot}
            resizeMode="contain"
          />
        </View>

        <View style={styles.content}>
          <Text style={styles.title}>
            Here's what you'll miss
          </Text>
          <Text style={styles.subtitle}>
            Without notifications, you'll miss out on key features that make Glow truly powerful.
          </Text>

          <View style={styles.benefitsContainer}>
            <BenefitItem
              emoji="📱"
              text="Personalized timing - Affirmations delivered at YOUR perfect moments, not random times"
            />
            <BenefitItem
              emoji="🔥"
              text="Streak protection - Gentle nudges to keep your momentum going when life gets busy"
            />
            <BenefitItem
              emoji="💝"
              text="Surprise moments - Unexpected positivity throughout your day when you need it most"
            />
          </View>
        </View>
      </KeyboardAwareScrollView>

      <View style={styles.buttonContainer}>
        <Button
          variant="primary"
          size="large"
          onPress={handleGoToSettings}
          style={styles.button}
        >
          Go to settings
        </Button>
      </View>
    </View>
  );
}

interface BenefitItemProps {
  emoji: string;
  text: string;
}

function BenefitItem({ emoji, text }: BenefitItemProps) {
  return (
    <View style={styles.benefitItem}>
      <Text style={styles.benefitEmoji}>{emoji}</Text>
      <Text style={styles.benefitText}>{text}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background.default,
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingTop: 20,
    paddingBottom: 100,
  },
  mascotContainer: {
    alignItems: 'center',
    marginTop: 10,
    marginBottom: 30,
  },
  content: {
    flex: 1,
  },
  mascot: {
    width: 140,
    height: 140,
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
    marginBottom: 40,
    paddingHorizontal: 10,
  },
  benefitsContainer: {
    width: '100%',
    gap: 16,
  },
  benefitItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.background.primary,
    borderRadius: 16,
    padding: 16,
    shadowColor: Colors.shadow.light,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  benefitEmoji: {
    fontSize: 28,
    marginRight: 12,
  },
  benefitText: {
    ...Typography.body,
    flex: 1,
    color: Colors.text.primary,
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
