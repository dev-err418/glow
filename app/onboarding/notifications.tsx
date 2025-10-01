import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { Alert, Image, StyleSheet, Text, View } from 'react-native';
import { KeyboardAwareScrollView, KeyboardStickyView } from 'react-native-keyboard-controller';
import { Button } from '../../components/Button';
import { Input } from '../../components/Input';
import { Colors } from '../../constants/Colors';
import { Typography } from '../../constants/Typography';
import { useNotifications } from '../../contexts/NotificationContext';
import { useOnboarding } from '../../contexts/OnboardingContext';

export default function NotificationsScreen() {
  const router = useRouter();
  const { completeOnboarding } = useOnboarding();
  const {
    notificationsPerDay,
    setNotificationsPerDay,
    startHour,
    setStartHour,
    endHour,
    setEndHour,
    requestPermissions,
    setNotificationsEnabled,
  } = useNotifications();

  const [localCount, setLocalCount] = useState(notificationsPerDay.toString());
  const [localStartHour, setLocalStartHour] = useState(startHour.toString());
  const [localEndHour, setLocalEndHour] = useState(endHour.toString());
  const [errors, setErrors] = useState({ count: '', startHour: '', endHour: '' });

  const validateInputs = () => {
    const newErrors = { count: '', startHour: '', endHour: '' };
    let isValid = true;

    const count = parseInt(localCount);
    const start = parseInt(localStartHour);
    const end = parseInt(localEndHour);

    if (isNaN(count) || count < 1 || count > 10) {
      newErrors.count = 'Please enter a number between 1 and 10';
      isValid = false;
    }

    if (isNaN(start) || start < 0 || start > 23) {
      newErrors.startHour = 'Please enter a valid hour (0-23)';
      isValid = false;
    }

    if (isNaN(end) || end < 0 || end > 23) {
      newErrors.endHour = 'Please enter a valid hour (0-23)';
      isValid = false;
    }

    if (isValid && start >= end) {
      newErrors.endHour = 'End hour must be after start hour';
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleGetStarted = async () => {
    if (!validateInputs()) return;

    // Update notification settings
    setNotificationsPerDay(parseInt(localCount));
    setStartHour(parseInt(localStartHour));
    setEndHour(parseInt(localEndHour));

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
      <KeyboardAwareScrollView
        contentContainerStyle={styles.scrollContent}
        bottomOffset={24}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.mascotContainer}>
          <Image
            source={require('../../assets/images/mascot-alone.png')}
            style={styles.mascot}
            resizeMode="contain"
          />
        </View>

        <View style={styles.content}>
          <Text style={styles.title}>Get affirmations throughout the day</Text>
          <Text style={styles.subtitle}>
            Let me know when you'd like to hear from me
          </Text>

          <View style={styles.inputSection}>
            <Text style={styles.label}>Notifications per day</Text>
            <Input
              placeholder="3"
              value={localCount}
              onChangeText={setLocalCount}
              keyboardType="number-pad"
              autoCorrect={false}
              spellCheck={false}
              returnKeyType="done"
              error={errors.count}
              containerStyle={styles.inputContainer}
            />
          </View>

          <View style={styles.timeRangeSection}>
            <Text style={styles.label}>Time range</Text>
            <View style={styles.timeRow}>
              <View style={styles.timeInput}>
                <Text style={styles.timeLabel}>Start at</Text>
                <Input
                  placeholder="6"
                  value={localStartHour}
                  onChangeText={setLocalStartHour}
                  keyboardType="number-pad"
                  autoCorrect={false}
                  spellCheck={false}
                  returnKeyType="done"
                  error={errors.startHour}
                  containerStyle={styles.timeInputContainer}
                />
                <Text style={styles.timeHint}>Hour (0-23)</Text>
              </View>

              <View style={styles.timeInput}>
                <Text style={styles.timeLabel}>End at</Text>
                <Input
                  placeholder="22"
                  value={localEndHour}
                  onChangeText={setLocalEndHour}
                  keyboardType="number-pad"
                  autoCorrect={false}
                  spellCheck={false}
                  returnKeyType="done"
                  onSubmitEditing={handleGetStarted}
                  error={errors.endHour}
                  containerStyle={styles.timeInputContainer}
                />
                <Text style={styles.timeHint}>Hour (0-23)</Text>
              </View>
            </View>
          </View>

          <Text style={styles.info}>
            You'll receive {localCount} notification{parseInt(localCount) !== 1 ? 's' : ''} per day between {localStartHour}:00 and {localEndHour}:00
          </Text>
        </View>
      </KeyboardAwareScrollView>

      <KeyboardStickyView offset={{ closed: 0, opened: 0 }}>
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
      </KeyboardStickyView>
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
    paddingBottom: 40,
  },
  mascotContainer: {
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 30,
  },
  mascot: {
    width: 120,
    height: 120,
  },
  content: {
    flex: 1,
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
  inputSection: {
    marginBottom: 24,
  },
  label: {
    ...Typography.label,
    marginBottom: 8,
  },
  inputContainer: {
    marginBottom: 0,
  },
  timeRangeSection: {
    marginBottom: 20,
  },
  timeRow: {
    flexDirection: 'row',
    gap: 16,
  },
  timeInput: {
    flex: 1,
  },
  timeLabel: {
    ...Typography.bodySmall,
    marginBottom: 4,
    color: Colors.text.secondary,
  },
  timeInputContainer: {
    marginBottom: 4,
  },
  timeHint: {
    fontSize: 12,
    color: Colors.text.light,
  },
  info: {
    ...Typography.bodySmall,
    textAlign: 'center',
    color: Colors.text.secondary,
    fontStyle: 'italic',
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
