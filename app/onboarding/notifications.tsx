import * as Haptics from 'expo-haptics';
import { useRouter } from 'expo-router';
import LottieView from 'lottie-react-native';
import React, { useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Button } from '../../components/Button';
import { NotificationSettings } from '../../components/NotificationSettings';
import { Colors } from '../../constants/Colors';
import { Typography } from '../../constants/Typography';
import { useNotifications } from '../../contexts/NotificationContext';
import { useOnboarding } from '../../contexts/OnboardingContext';

export default function NotificationsScreen() {
  const router = useRouter();
  const { completeOnboarding, updateOnboardingData } = useOnboarding();
  const {
    setNotificationsPerDay,
    setStartHour,
    setEndHour,
    requestPermissions,
    setNotificationsEnabled,
  } = useNotifications();

  const [localCount, setLocalCount] = useState(3);
  const [localStartTime, setLocalStartTime] = useState(() => {
    const date = new Date();
    date.setHours(9, 0, 0, 0);
    return date;
  });
  const [localEndTime, setLocalEndTime] = useState(() => {
    const date = new Date();
    date.setHours(22, 0, 0, 0);
    return date;
  });

  // Helper to format time display
  const formatTime = (date: Date) => {
    const hours = date.getHours();
    const minutes = date.getMinutes();
    const period = hours >= 12 ? 'PM' : 'AM';
    const displayHour = hours === 0 ? 12 : hours > 12 ? hours - 12 : hours;
    const displayMinutes = minutes.toString().padStart(2, '0');
    return `${displayHour}:${displayMinutes}${period}`;
  };


  const handleGetStarted = async () => {
    const startHours = localStartTime.getHours();
    const endHours = localEndTime.getHours();

    if (startHours >= endHours) {
      Alert.alert('Invalid Time Range', 'End time must be after start time');
      return;
    }

    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    // Update notification settings
    setNotificationsPerDay(localCount);
    setStartHour(startHours);
    setEndHour(endHours);

    // Request permissions and enable notifications
    const granted = await requestPermissions();
    if (granted) {
      setNotificationsEnabled(true);
      // Save notification settings to onboarding data
      updateOnboardingData({
        notificationsEnabled: true,
        notificationsPerDay: localCount,
        notificationStartTime: localStartTime.toISOString(),
        notificationEndTime: localEndTime.toISOString(),
      });
      router.push('/onboarding/streak-intro');
    } else {
      // User denied permissions, show encouragement screen
      updateOnboardingData({
        notificationsEnabled: false,
        notificationsPerDay: localCount,
        notificationStartTime: localStartTime.toISOString(),
        notificationEndTime: localEndTime.toISOString(),
      });
      router.push('/onboarding/notification-permission');
    }
  };

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Text style={styles.title}>Get affirmations throughout the day</Text>
        <Text style={styles.subtitle}>
          Let me know when you'd like to hear from me
        </Text>

        <View style={styles.animationContainer}>
          <LottieView
            source={require('../../assets/animations/notifications.json')}
            autoPlay
            loop={false}
            style={styles.animation}
          />
        </View>

        <NotificationSettings
          count={localCount}
          onCountChange={setLocalCount}
          startDate={localStartTime}
          endDate={localEndTime}
          onStartTimeChange={(event, selectedDate) => {
            if (selectedDate) {
              setLocalStartTime(selectedDate);
            }
          }}
          onEndTimeChange={(event, selectedDate) => {
            if (selectedDate) {
              setLocalEndTime(selectedDate);
            }
          }}
        />

        {localCount > 0 && (
          <Text style={styles.info}>
            You'll receive {localCount} notification{localCount !== 1 ? 's' : ''} per day between {formatTime(localStartTime)} and {formatTime(localEndTime)}
          </Text>
        )}
      </ScrollView>

      <View style={styles.buttonContainer}>
        <Button
          variant="primary"
          size="large"
          onPress={handleGetStarted}
          style={styles.button}
        >
          Next
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
  scrollContent: {
    paddingHorizontal: 24,
    paddingTop: 20,
    paddingBottom: 50,
  },
  title: {
    ...Typography.h2,
    textAlign: 'center',
    marginBottom: 12,
  },
  subtitle: {
    ...Typography.subtitle,
    textAlign: 'center',
    marginBottom: 15,
  },
  animationContainer: {
    alignItems: 'center',
    marginBottom: 30,
  },
  animation: {
    width: '100%',
    height: 150,
  },
  info: {
    ...Typography.subtitle,
    fontSize: 14,
    fontStyle: 'italic',
    textAlign: 'center',
    marginTop: 16,
    color: Colors.text.secondary,
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
