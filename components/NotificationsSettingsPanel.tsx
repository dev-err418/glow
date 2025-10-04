import * as Haptics from 'expo-haptics';
import * as Notifications from 'expo-notifications';
import React, { useEffect, useState } from 'react';
import { Alert, Linking, ScrollView, StyleSheet, Switch, Text, TouchableOpacity, View } from 'react-native';
import { Colors } from '../constants/Colors';
import { Typography } from '../constants/Typography';
import { useNotifications } from '../contexts/NotificationContext';
import { useCategories } from '../contexts/CategoriesContext';
import { NotificationSettings } from './NotificationSettings';

const quotesData = require('../assets/data/quotes.json');

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
    cancelAllNotifications,
  } = useNotifications();

  const { selectedCategories } = useCategories();

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

  const [showDebugPanel, setShowDebugPanel] = useState(false);
  const [scheduledNotifications, setScheduledNotifications] = useState<any[]>([]);

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

  const getTimeUntil = (targetDate: Date) => {
    const now = new Date();
    const diff = targetDate.getTime() - now.getTime();

    if (diff <= 0) return 'already passed';

    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

    const parts = [];
    if (days > 0) parts.push(`${days} jour${days > 1 ? 's' : ''}`);
    if (hours > 0) parts.push(`${hours} heure${hours > 1 ? 's' : ''}`);
    if (minutes > 0) parts.push(`${minutes} minute${minutes > 1 ? 's' : ''}`);

    return parts.join(' et ') || 'moins d\'une minute';
  };

  const getTriggerDate = (trigger: any): Date | null => {
    if (trigger.type === 'date' && trigger.date) {
      return new Date(trigger.date * 1000);
    } else if (trigger.type === 'timeInterval' && trigger.seconds) {
      const now = new Date();
      return new Date(now.getTime() + trigger.seconds * 1000);
    } else if (trigger.type === 'daily') {
      const now = new Date();
      const nextOccurrence = new Date();
      nextOccurrence.setHours(trigger.hour, trigger.minute, 0, 0);
      if (nextOccurrence <= now) {
        nextOccurrence.setDate(nextOccurrence.getDate() + 1);
      }
      return nextOccurrence;
    }
    return null;
  };

  const getRandomQuoteWithId = () => {
    const categoriesToUse = selectedCategories.length > 0 ? selectedCategories : ['general'];
    const allQuotes: any[] = [];

    categoriesToUse.forEach((category) => {
      const categoryQuotes = quotesData[category];
      if (categoryQuotes && Array.isArray(categoryQuotes)) {
        allQuotes.push(...categoryQuotes);
      }
    });

    if (allQuotes.length === 0) {
      const generalQuotes = quotesData['general'] || [];
      allQuotes.push(...generalQuotes);
    }

    return allQuotes.length > 0
      ? allQuotes[Math.floor(Math.random() * allQuotes.length)]
      : { id: 'test-1', text: 'Test notification' };
  };

  const handleTestNotification = async () => {
    const granted = await requestPermissions();
    if (!granted) {
      Alert.alert('Permission Denied', 'Please enable notifications to test.');
      return;
    }

    const quote = getRandomQuoteWithId();

    await Notifications.scheduleNotificationAsync({
      content: {
        title: '⤵ Test',
        body: quote.text,
        sound: true,
        data: { quoteId: quote.id },
      },
      trigger: {
        seconds: 1,
      },
    });

    // Also open the deep link to test it
    setTimeout(() => {
      console.log('🧪 Test notification sent with deep link:', `glow://?id=${quote.id}`);
    }, 100);

    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  };

  const handleDebugNotifications = async () => {
    const scheduled = await Notifications.getAllScheduledNotificationsAsync();

    // Process all notifications with trigger dates
    const processedNotifications = scheduled.map((notif) => {
      const trigger = notif.trigger as any;
      const triggerDate = getTriggerDate(trigger);

      return {
        ...notif,
        triggerDate,
        timeUntil: triggerDate ? getTimeUntil(triggerDate) : 'unknown',
      };
    });

    // Sort by trigger date (soonest first)
    processedNotifications.sort((a, b) => {
      if (!a.triggerDate) return 1;
      if (!b.triggerDate) return -1;
      return a.triggerDate.getTime() - b.triggerDate.getTime();
    });

    setScheduledNotifications(processedNotifications);
    setShowDebugPanel(!showDebugPanel);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  };

  const handleClearAllNotifications = async () => {
    Alert.alert(
      'Clear All Notifications',
      'Are you sure you want to cancel all scheduled notifications?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear All',
          style: 'destructive',
          onPress: async () => {
            await cancelAllNotifications();
            setScheduledNotifications([]);
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
          }
        }
      ]
    );
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

      {/* Test Notification Button */}
      <TouchableOpacity
        style={styles.testButton}
        onPress={handleTestNotification}
      >
        <Text style={styles.testButtonText}>Send Test Notification</Text>
      </TouchableOpacity>

      {/* Debug Button */}
      <TouchableOpacity
        style={styles.debugButton}
        onPress={handleDebugNotifications}
      >
        <Text style={styles.debugButtonText}>
          {showDebugPanel ? 'Hide' : 'Show'} Scheduled Notifications ({scheduledNotifications.length})
        </Text>
      </TouchableOpacity>

      {/* Clear All Notifications Button */}
      <TouchableOpacity
        style={styles.clearButton}
        onPress={handleClearAllNotifications}
      >
        <Text style={styles.clearButtonText}>Clear All Scheduled Notifications</Text>
      </TouchableOpacity>

      {/* Debug Panel */}
      {showDebugPanel && (
        <View style={styles.debugPanel}>
          <Text style={styles.debugTitle}>
            {scheduledNotifications.length} notification{scheduledNotifications.length !== 1 ? 's' : ''} scheduled
          </Text>
          {scheduledNotifications.length === 0 ? (
            <Text style={styles.debugEmptyText}>No notifications scheduled</Text>
          ) : (
            <ScrollView style={styles.debugScrollView} nestedScrollEnabled>
              {scheduledNotifications.map((notif, index) => (
                <View key={notif.identifier || index} style={styles.debugNotifCard}>
                  <View style={styles.debugNotifHeader}>
                    <Text style={styles.debugNotifTitle}>{notif.content.title || 'No Title'}</Text>
                    <Text style={styles.debugNotifTime}>
                      {notif.triggerDate ? notif.triggerDate.toLocaleString('fr-FR', {
                        weekday: 'short',
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      }) : 'Unknown'}
                    </Text>
                  </View>
                  <Text style={styles.debugNotifBody} numberOfLines={2}>
                    {notif.content.body}
                  </Text>
                  <Text style={styles.debugNotifCountdown}>in {notif.timeUntil}</Text>
                </View>
              ))}
            </ScrollView>
          )}
        </View>
      )}
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
    fontFamily: 'UncutSans',
    fontWeight: '600',
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
  testButton: {
    backgroundColor: Colors.primary,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginTop: 8,
  },
  testButtonText: {
    ...Typography.body,
    fontFamily: 'UncutSans',
    fontWeight: '600',
    color: Colors.text.white,
  },
  debugButton: {
    backgroundColor: Colors.background.primary,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginTop: 8,
  },
  debugButtonText: {
    ...Typography.body,
    fontFamily: 'UncutSans',
    fontWeight: '600',
    color: Colors.secondary,
  },
  clearButton: {
    backgroundColor: '#FF3B30',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginTop: 8,
  },
  clearButtonText: {
    ...Typography.body,
    fontFamily: 'UncutSans',
    fontWeight: '600',
    color: Colors.text.white,
  },
  debugPanel: {
    backgroundColor: Colors.background.secondary,
    borderRadius: 12,
    padding: 16,
    marginTop: 8,
  },
  debugTitle: {
    ...Typography.body,
    fontFamily: 'UncutSans',
    fontWeight: '600',
    color: Colors.text.primary,
    marginBottom: 12,
  },
  debugEmptyText: {
    ...Typography.body,
    color: Colors.text.secondary,
    textAlign: 'center',
    paddingVertical: 20,
  },
  debugScrollView: {
    maxHeight: 400,
  },
  debugNotifCard: {
    backgroundColor: Colors.background.primary,
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
    borderLeftWidth: 3,
    borderLeftColor: Colors.primary,
  },
  debugNotifHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 6,
  },
  debugNotifTitle: {
    ...Typography.body,
    fontFamily: 'UncutSans',
    fontWeight: '600',
    color: Colors.text.primary,
    flex: 1,
    marginRight: 8,
  },
  debugNotifTime: {
    ...Typography.body,
    fontSize: 11,
    color: Colors.primary,
    fontFamily: 'UncutSans',
    fontWeight: '500',
  },
  debugNotifBody: {
    ...Typography.body,
    fontSize: 13,
    color: Colors.text.secondary,
    marginBottom: 6,
    lineHeight: 18,
  },
  debugNotifCountdown: {
    ...Typography.body,
    fontSize: 11,
    color: Colors.text.light,
    fontStyle: 'italic',
  },
});
