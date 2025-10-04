import * as Haptics from 'expo-haptics';
import * as Notifications from 'expo-notifications';
import React, { useEffect, useState } from 'react';
import { Alert, Linking, StyleSheet, Switch, Text, View } from 'react-native';
import { Colors } from '../constants/Colors';
import { Typography } from '../constants/Typography';
import { useNotifications } from '../contexts/NotificationContext';
import { NotificationSettings } from './NotificationSettings';

export function NotificationsSettingsPanel() {
  const {
    notificationsPerDay,
    setNotificationsPerDay,
    notificationsEnabled,
    setNotificationsEnabled,
    startHour,
    setStartHour,
    endHour,
    setEndHour,
    streakReminderEnabled,
    setStreakReminderEnabled,
    requestPermissions,
  } = useNotifications();

  const [localStartTime, setLocalStartTime] = useState(() => {
    const date = new Date();
    date.setHours(startHour, 0, 0, 0);
    return date;
  });

  const [localEndTime, setLocalEndTime] = useState(() => {
    const date = new Date();
    date.setHours(endHour, 0, 0, 0);
    return date;
  });

  const handleNotificationsToggle = async (value: boolean) => {
    if (value) {
      const granted = await requestPermissions();
      if (granted) {
        setNotificationsEnabled(true);
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      } else {
        Alert.alert(
          'Notifications Disabled',
          'Please enable notifications in your device settings to use this feature.',
          [
            { text: 'Cancel', style: 'cancel' },
            {
              text: 'Open Settings',
              onPress: () => Linking.openSettings()
            }
          ]
        );
      }
    } else {
      setNotificationsEnabled(false);
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
  };

  const handleStreakReminderToggle = async (value: boolean) => {
    if (value && !notificationsEnabled) {
      const granted = await requestPermissions();
      if (granted) {
        setNotificationsEnabled(true);
        setStreakReminderEnabled(true);
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      } else {
        Alert.alert(
          'Notifications Disabled',
          'Please enable notifications in your device settings to use this feature.',
          [
            { text: 'Cancel', style: 'cancel' },
            {
              text: 'Open Settings',
              onPress: () => Linking.openSettings()
            }
          ]
        );
      }
    } else {
      setStreakReminderEnabled(value);
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
  };

  const handleStartTimeChange = (event: any, selectedDate?: Date) => {
    if (selectedDate) {
      setLocalStartTime(selectedDate);
      setStartHour(selectedDate.getHours());
    }
  };

  const handleEndTimeChange = (event: any, selectedDate?: Date) => {
    if (selectedDate) {
      setLocalEndTime(selectedDate);
      setEndHour(selectedDate.getHours());
    }
  };

  const formatTime = (date: Date) => {
    const hours = date.getHours();
    const minutes = date.getMinutes();
    const period = hours >= 12 ? 'PM' : 'AM';
    const displayHour = hours === 0 ? 12 : hours > 12 ? hours - 12 : hours;
    const displayMinutes = minutes.toString().padStart(2, '0');
    return `${displayHour}:${displayMinutes}${period}`;
  };

  // Check permission status on mount and auto-disable if denied
  useEffect(() => {
    const checkPermissions = async () => {
      const { status } = await Notifications.getPermissionsAsync();
      if (status === 'denied' && notificationsEnabled) {
        // Auto-disable if system permissions are denied
        setNotificationsEnabled(false);
      }
    };
    checkPermissions();
  }, []);

  return (
    <View style={styles.container}>
      {/* Daily Notifications Toggle */}
      <View style={styles.settingRow}>
        <View style={styles.settingInfo}>
          <Text style={styles.settingLabel}>Daily notifications</Text>
          <Text style={styles.settingDescription}>
            Receive affirmations throughout the day
          </Text>
        </View>
        <Switch
          value={notificationsEnabled}
          onValueChange={handleNotificationsToggle}
          trackColor={{ false: Colors.background.secondary, true: Colors.secondary }}
          thumbColor={Colors.background.primary}
        />
      </View>

      {/* Notification Settings (only shown when enabled) */}
      {notificationsEnabled && (
        <View style={styles.settingsCard}>
          <NotificationSettings
            count={notificationsPerDay}
            onCountChange={setNotificationsPerDay}
            startDate={localStartTime}
            endDate={localEndTime}
            onStartTimeChange={handleStartTimeChange}
            onEndTimeChange={handleEndTimeChange}
          />
          {notificationsPerDay > 0 && (
            <Text style={styles.info}>
              You'll receive {notificationsPerDay} notification{notificationsPerDay !== 1 ? 's' : ''} per day between {formatTime(localStartTime)} and {formatTime(localEndTime)}
            </Text>
          )}
        </View>
      )}

      {/* Streak Reminder Toggle */}
      <View style={styles.settingRow}>
        <View style={styles.settingInfo}>
          <Text style={styles.settingLabel}>Daily streak reminder</Text>
          <Text style={styles.settingDescription}>
            Evening reminder to maintain your streak
          </Text>
        </View>
        <Switch
          value={streakReminderEnabled}
          onValueChange={handleStreakReminderToggle}
          trackColor={{ false: Colors.background.secondary, true: Colors.secondary }}
          thumbColor={Colors.background.primary}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 12,
  },
  settingRow: {
    backgroundColor: Colors.background.primary,
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  settingInfo: {
    flex: 1,
    marginRight: 12,
  },
  settingLabel: {
    ...Typography.body,
    color: Colors.text.primary,
    marginBottom: 4,
  },
  settingDescription: {
    ...Typography.bodySmall,
    fontSize: 13,
    color: Colors.text.secondary,
  },
  settingsCard: {
    backgroundColor: Colors.background.primary,
    borderRadius: 12,
    padding: 16,
  },
  info: {
    ...Typography.subtitle,
    fontSize: 13,
    fontStyle: 'italic',
    textAlign: 'center',
    marginTop: 12,
    color: Colors.text.secondary,
  },
});
