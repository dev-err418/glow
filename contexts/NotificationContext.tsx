import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Notifications from 'expo-notifications';

interface NotificationContextType {
  notificationsPerDay: number;
  setNotificationsPerDay: (count: number) => void;
  notificationsEnabled: boolean;
  setNotificationsEnabled: (enabled: boolean) => void;
  streakReminderEnabled: boolean;
  setStreakReminderEnabled: (enabled: boolean) => void;
  startHour: number;
  setStartHour: (hour: number) => void;
  endHour: number;
  setEndHour: (hour: number) => void;
  permissionStatus: string;
  requestPermissions: () => Promise<boolean>;
  scheduleNotifications: (selectedCategories?: string[]) => void;
  cancelAllNotifications: () => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

const STORAGE_KEYS = {
  NOTIFICATIONS_PER_DAY: 'notificationsPerDay',
  NOTIFICATIONS_ENABLED: 'notificationsEnabled',
  STREAK_REMINDER_ENABLED: 'streakReminderEnabled',
  START_HOUR: 'startHour',
  END_HOUR: 'endHour',
};

// Import quotes data
const quotesData = require('../assets/data/quotes.json');

// Streak reminder messages
const STREAK_REMINDERS = [
  "Don't break the streak! 🔥 Check in before bed",
  "Your streak is waiting! Keep the momentum going ✨",
  "End your day strong! Swipe a quote to keep your streak 💪",
  "Almost bedtime! Don't forget your daily dose of positivity 🌙",
  "5 minutes to maintain your streak! You've got this 🌟",
  "Keep that fire burning! 🔥 One swipe keeps your streak alive",
  "Your daily glow moment awaits! Don't let your streak fade ⭐",
  "Bedtime check-in! Maintain your beautiful streak tonight 💫",
  "Quick reminder: Your streak needs you! 💝 Take a moment",
  "End the day with intention! Keep your streak going strong 🌺"
];

export function NotificationProvider({ children }: { children: React.ReactNode }) {
  const [notificationsPerDay, setNotificationsPerDay] = useState(3);
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);
  const [streakReminderEnabled, setStreakReminderEnabled] = useState(true);
  const [startHour, setStartHour] = useState(9);
  const [endHour, setEndHour] = useState(22);
  const [permissionStatus, setPermissionStatus] = useState('unknown');

  // Load saved preferences on app start
  useEffect(() => {
    loadPreferences();
    checkPermissionStatus();
  }, []);

  // Save preferences when they change
  useEffect(() => {
    savePreferences();
  }, [notificationsPerDay, notificationsEnabled, streakReminderEnabled, startHour, endHour]);

  const loadPreferences = async () => {
    try {
      const savedCount = await AsyncStorage.getItem(STORAGE_KEYS.NOTIFICATIONS_PER_DAY);
      const savedEnabled = await AsyncStorage.getItem(STORAGE_KEYS.NOTIFICATIONS_ENABLED);
      const savedStreakReminder = await AsyncStorage.getItem(STORAGE_KEYS.STREAK_REMINDER_ENABLED);
      const savedStartHour = await AsyncStorage.getItem(STORAGE_KEYS.START_HOUR);
      const savedEndHour = await AsyncStorage.getItem(STORAGE_KEYS.END_HOUR);

      if (savedCount) setNotificationsPerDay(parseInt(savedCount));
      if (savedEnabled) setNotificationsEnabled(savedEnabled === 'true');
      if (savedStreakReminder) setStreakReminderEnabled(savedStreakReminder === 'true');
      if (savedStartHour) setStartHour(parseInt(savedStartHour));
      if (savedEndHour) setEndHour(parseInt(savedEndHour));
    } catch (error) {
      console.error('Error loading preferences:', error);
    }
  };

  const savePreferences = async () => {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.NOTIFICATIONS_PER_DAY, notificationsPerDay.toString());
      await AsyncStorage.setItem(STORAGE_KEYS.NOTIFICATIONS_ENABLED, notificationsEnabled.toString());
      await AsyncStorage.setItem(STORAGE_KEYS.STREAK_REMINDER_ENABLED, streakReminderEnabled.toString());
      await AsyncStorage.setItem(STORAGE_KEYS.START_HOUR, startHour.toString());
      await AsyncStorage.setItem(STORAGE_KEYS.END_HOUR, endHour.toString());
    } catch (error) {
      console.error('Error saving preferences:', error);
    }
  };

  const checkPermissionStatus = async () => {
    const { status } = await Notifications.getPermissionsAsync();
    setPermissionStatus(status);
  };

  const requestPermissions = async (): Promise<boolean> => {
    const { status } = await Notifications.requestPermissionsAsync();
    setPermissionStatus(status);
    return status === 'granted';
  };

  const getRandomQuote = (categories: string[] = ['general']): string => {
    const allQuotes: string[] = [];

    categories.forEach((category) => {
      const categoryQuotes = quotesData[category];
      if (categoryQuotes && Array.isArray(categoryQuotes)) {
        allQuotes.push(...categoryQuotes);
      }
    });

    if (allQuotes.length === 0) {
      // Fallback to general quotes
      const generalQuotes = quotesData['general'];
      if (generalQuotes && Array.isArray(generalQuotes)) {
        allQuotes.push(...generalQuotes);
      }
    }

    return allQuotes.length > 0
      ? allQuotes[Math.floor(Math.random() * allQuotes.length)]
      : "Take a moment to appreciate yourself 🌸";
  };

  const scheduleNotifications = async (selectedCategories: string[] = ['general']) => {
    if (permissionStatus !== 'granted') return;

    // Cancel existing notifications first
    await Notifications.cancelAllScheduledNotificationsAsync();

    // Schedule daily affirmation notifications
    if (notificationsEnabled && notificationsPerDay > 0) {
      const totalMinutes = (endHour - startHour) * 60;
      const interval = Math.floor(totalMinutes / notificationsPerDay);

      for (let i = 0; i < notificationsPerDay; i++) {
        const triggerTime = startHour * 60 + (interval * i) + Math.random() * 30;
        const hours = Math.floor(triggerTime / 60);
        const minutes = Math.floor(triggerTime % 60);

        await Notifications.scheduleNotificationAsync({
          content: {
            title: "✨ Daily Affirmation",
            body: getRandomQuote(selectedCategories),
            sound: true,
          },
          trigger: {
            hour: hours,
            minute: minutes,
            repeats: true,
          },
        });
      }
    }

    // Schedule evening streak reminder (8-9 PM)
    if (streakReminderEnabled) {
      const reminderHour = 20; // 8 PM
      const reminderMinute = Math.floor(Math.random() * 60); // Random minute

      await Notifications.scheduleNotificationAsync({
        content: {
          title: "🔥 Streak Reminder",
          body: STREAK_REMINDERS[Math.floor(Math.random() * STREAK_REMINDERS.length)],
          sound: true,
        },
        trigger: {
          hour: reminderHour,
          minute: reminderMinute,
          repeats: true,
        },
      });
    }
  };

  const cancelAllNotifications = async () => {
    await Notifications.cancelAllScheduledNotificationsAsync();
  };

  // Re-schedule when settings change
  useEffect(() => {
    if ((notificationsEnabled || streakReminderEnabled) && permissionStatus === 'granted') {
      scheduleNotifications();
    } else if (!notificationsEnabled && !streakReminderEnabled) {
      cancelAllNotifications();
    }
  }, [notificationsPerDay, notificationsEnabled, streakReminderEnabled, permissionStatus, startHour, endHour]);

  const value = {
    notificationsPerDay,
    setNotificationsPerDay,
    notificationsEnabled,
    setNotificationsEnabled,
    streakReminderEnabled,
    setStreakReminderEnabled,
    startHour,
    setStartHour,
    endHour,
    setEndHour,
    permissionStatus,
    requestPermissions,
    scheduleNotifications,
    cancelAllNotifications,
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotifications() {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
}