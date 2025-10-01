import { useRouter } from 'expo-router';
import LottieView from 'lottie-react-native';
import React, { useState } from 'react';
import { Alert, StyleSheet, Text, View, ScrollView } from 'react-native';
import { Button } from '../../components/Button';
import { NotificationSettings } from '../../components/NotificationSettings';
import { Colors } from '../../constants/Colors';
import { Typography } from '../../constants/Typography';
import { useNotifications } from '../../contexts/NotificationContext';
import { useOnboarding } from '../../contexts/OnboardingContext';

export default function NotificationsScreen() {
  const router = useRouter();
  const { completeOnboarding } = useOnboarding();
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

    // Update notification settings
    setNotificationsPerDay(localCount);
    setStartHour(startHours);
    setEndHour(endHours);

    // Request permissions and enable notifications
    const granted = await requestPermissions();
    if (granted) {
      setNotificationsEnabled(true);
      completeOnboarding();
      router.replace('/');
    } else {
      Alert.alert(
        'Notification Permission',
        'To receive daily affirmations, please enable notifications in your device settings.',
        [
          { text: 'Later', onPress: () => { completeOnboarding(); router.replace('/'); } },
          { text: 'OK' },
        ]
      );
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
          Get Started
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
    paddingTop: 40,
    paddingBottom: 40,
  },
  title: {
    ...Typography.h2,
    textAlign: 'center',
    marginBottom: 12,
  },
  subtitle: {
    ...Typography.subtitle,
    textAlign: 'center',
    marginBottom: 30,
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
    paddingHorizontal: 24,
    paddingVertical: 24,
    backgroundColor: Colors.background.default,
  },
  button: {
    width: '100%',
  },
});
