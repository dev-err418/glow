import * as Haptics from 'expo-haptics';
import { useRouter } from 'expo-router';
import React from 'react';
import { Image, StyleSheet, Text, View } from 'react-native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-controller';
import { Button } from '../../components/Button';
import { useColors } from '../../constants/Colors';
import { Typography } from '../../constants/Typography';
import { useNotifications } from '../../contexts/NotificationContext';
import { useOnboarding } from '../../contexts/OnboardingContext';

export default function NotificationPermissionScreen() {
  const Colors = useColors();

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
    color: Colors.text.primary,
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

  const router = useRouter();
  const { requestPermissions, setNotificationsEnabled } = useNotifications();
  const { updateOnboardingData } = useOnboarding();

  const handleEnableNotifications = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    // Request notification permission
    const granted = await requestPermissions();

    if (granted) {
      // Permission granted
      setNotificationsEnabled(true);
      updateOnboardingData({ notificationsEnabled: true });
      router.push('/onboarding/widget');
    } else {
      // Permission denied, go to encouragement screen
      updateOnboardingData({ notificationsEnabled: false });
      router.push('/onboarding/notification-denied');
    }
  };

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
            Glow works best with notifications
          </Text>
          <Text style={styles.subtitle}>
            Daily affirmations are most effective when they reach you throughout the day. Enable notifications to get the full Glow experience.
          </Text>

          <View style={styles.benefitsContainer}>
            <BenefitItem
              emoji="🔔"
              text="Gentle reminders to practice self-care"
            />
            <BenefitItem
              emoji="💫"
              text="Stay consistent with your daily streak"
            />
            <BenefitItem
              emoji="✨"
              text="Receive affirmations when you need them most"
            />
          </View>
        </View>
      </KeyboardAwareScrollView>

      <View style={styles.buttonContainer}>
        <Button
          variant="primary"
          size="large"
          onPress={handleEnableNotifications}
          style={styles.button}
        >
          Enable notifications
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
  const Colors = useColors();

  const benefitStyles = StyleSheet.create({
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
  });

  return (
    <View style={benefitStyles.benefitItem}>
      <Text style={benefitStyles.benefitEmoji}>{emoji}</Text>
      <Text style={benefitStyles.benefitText}>{text}</Text>
    </View>
  );
}
