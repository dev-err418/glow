import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Notifications from 'expo-notifications';
import React, { createContext, useContext, useEffect, useRef, useState } from 'react';
import { useCategories } from './CategoriesContext';
import { useStreak } from './StreakContext';

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
  scheduleNotifications: () => Promise<void>;
  cancelAllNotifications: () => Promise<void>;
  getAllScheduledNotifications: () => Promise<Notifications.NotificationRequest[]>;
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

// Streak reminder messages for early streaks (0-2 days)
const EARLY_STREAK_REMINDERS = [
  "Start your daily glow moment! ✨",
  "Don't forget your daily check-in 🌟",
  "Time for your daily dose of positivity 💫",
  "Keep the momentum going! 💪",
  "Your daily reminder is here 🌺"
];

// Helper function to get streak-aware reminder message and title
const getStreakReminderContent = (currentStreak: number): { title: string; body: string } => {
  // For early streaks (0-2 days), use generic friendly messages
  if (currentStreak < 3) {
    const message = EARLY_STREAK_REMINDERS[Math.floor(Math.random() * EARLY_STREAK_REMINDERS.length)];
    return {
      title: "Daily streak reminder",
      body: message
    };
  }

  // For established streaks (3+ days), use streak-count-aware messages
  const messages = [
    `Don't lose your ${currentStreak} day streak! 🔥`,
    `You're on a ${currentStreak} day streak! Keep it going 💪`,
    `${currentStreak} days strong! Don't break the chain ✨`,
    `Protect your ${currentStreak} day streak! One swipe keeps it alive 🌟`,
    `${currentStreak} days in a row! Keep the fire burning 🔥`,
    `Your ${currentStreak} day streak is waiting! ⭐`,
    `Amazing! ${currentStreak} days! Don't let it fade now 💫`
  ];

  const message = messages[Math.floor(Math.random() * messages.length)];
  return {
    title: "Don't lose your streak! 🔥",
    body: message
  };
};

// Helper function to get a random quote from selected categories
const getRandomQuote = (categories: string[]): { id: string; text: string } => {
  const allQuotes: { id: string; text: string }[] = [];

  categories.forEach((category) => {
    const categoryQuotes = quotesData[category];
    if (categoryQuotes && Array.isArray(categoryQuotes)) {
      allQuotes.push(...categoryQuotes);
    }
  });

  // Fallback to general quotes if no quotes found
  if (allQuotes.length === 0) {
    const generalQuotes = quotesData['general'];
    if (generalQuotes && Array.isArray(generalQuotes)) {
      allQuotes.push(...generalQuotes);
    }
  }

  return allQuotes.length > 0
    ? allQuotes[Math.floor(Math.random() * allQuotes.length)]
    : { id: 'general-1', text: "Take a moment to appreciate yourself 🌸" };
};

export function NotificationProvider({ children }: { children: React.ReactNode }) {
  const { selectedCategories } = useCategories();
  const { streakDays, currentStreak } = useStreak();
  const [notificationsPerDay, setNotificationsPerDay] = useState(3);
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);
  const [streakReminderEnabled, setStreakReminderEnabled] = useState(true);
  const [startHour, setStartHour] = useState(9);
  const [endHour, setEndHour] = useState(22);
  const [permissionStatus, setPermissionStatus] = useState('unknown');
  const [isInitialized, setIsInitialized] = useState(false);

  // Ref to prevent multiple simultaneous scheduling operations
  const schedulingInProgress = useRef(false);

  // Set up notification handler on mount
  useEffect(() => {
    Notifications.setNotificationHandler({
      handleNotification: async () => {
        return {
          shouldShowAlert: true,
          shouldShowBanner: true,
          shouldShowList: true,
          shouldPlaySound: true,
          shouldSetBadge: false,
        };
      },
    });
  }, []);

  // Load saved preferences on app start
  useEffect(() => {
    loadPreferences();
    checkPermissionStatus();
  }, []);

  // Save preferences when they change
  useEffect(() => {
    if (isInitialized) {
      savePreferences();
    }
  }, [notificationsPerDay, notificationsEnabled, streakReminderEnabled, startHour, endHour, isInitialized]);

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
    } finally {
      setIsInitialized(true);
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

  /**
   * Generate random notification times distributed evenly between start and end hours
   * with some randomization to feel natural
   */
  const generateRandomTimes = (count: number, start: number, end: number): { hour: number; minute: number }[] => {
    if (count <= 0) return [];

    const times: { hour: number; minute: number }[] = [];
    const totalMinutes = (end - start) * 60;
    const baseInterval = totalMinutes / count;

    for (let i = 0; i < count; i++) {
      // Calculate base time with even distribution
      const baseMinutes = start * 60 + (baseInterval * i) + (baseInterval / 2);

      // Add randomization: ±40% of the interval (max), ensuring we don't overlap too much
      const randomRange = Math.min(baseInterval * 0.4, 30); // Max 30 min randomization
      const randomOffset = (Math.random() - 0.5) * 2 * randomRange;

      let totalMinutesFromMidnight = Math.round(baseMinutes + randomOffset);

      // Ensure we stay within bounds
      totalMinutesFromMidnight = Math.max(start * 60, Math.min(end * 60 - 1, totalMinutesFromMidnight));

      const hour = Math.floor(totalMinutesFromMidnight / 60);
      const minute = totalMinutesFromMidnight % 60;

      times.push({ hour, minute });
    }

    // Sort times chronologically
    return times.sort((a, b) => {
      if (a.hour !== b.hour) return a.hour - b.hour;
      return a.minute - b.minute;
    });
  };

  const scheduleNotifications = async (): Promise<void> => {
    if (permissionStatus !== 'granted') {
      console.log('🔕 Notifications permission not granted, skipping scheduling');
      return;
    }

    if (schedulingInProgress.current) {
      console.log('⏳ Scheduling already in progress, skipping');
      return;
    }

    try {
      schedulingInProgress.current = true;

      // Step 1: Cancel all existing notifications
      await Notifications.cancelAllScheduledNotificationsAsync();
      console.log('🗑️ Cancelled all scheduled notifications');

      // Step 2: If notifications are disabled, we're done
      if (!notificationsEnabled) {
        console.log('🔕 Notifications disabled, not scheduling new ones');
        return;
      }

      // Step 3: Generate random times for notifications
      const times = generateRandomTimes(notificationsPerDay, startHour, endHour);
      console.log(`🔔 Scheduling ${times.length} notifications between ${startHour}:00 and ${endHour}:00`);

      // Step 4: Schedule each notification with daily repeat
      for (let i = 0; i < times.length; i++) {
        const { hour, minute } = times[i];

        // Get a random quote for this notification
        const quote = getRandomQuote(selectedCategories);

        await Notifications.scheduleNotificationAsync({
          content: {
            title: "⤵",
            body: quote.text,
            sound: true,
            data: {
              quoteId: quote.id,
              categories: selectedCategories,
              index: i,
            },
          },
          trigger: {
            type: Notifications.SchedulableTriggerInputTypes.CALENDAR,
            hour,
            minute,
            repeats: true,
          } as any,
        });

        console.log(`  ✅ Scheduled notification ${i + 1} at ${hour}:${minute.toString().padStart(2, '0')}`);
      }

      // Step 5: Schedule streak reminders if enabled (2 reminders)
      if (streakReminderEnabled) {
        // Check if today's streak is already completed
        const today = new Date().toISOString().split('T')[0];
        const hasCompletedToday = streakDays.includes(today);

        // Only schedule if streak NOT completed today
        if (!hasCompletedToday) {
          const totalHours = endHour - startHour;
          const lastQuarterStart = endHour - (totalHours * 0.25);

          // First reminder: Random time within the last quarter of time window
          const firstReminderHour = Math.floor(lastQuarterStart + Math.random() * (endHour - lastQuarterStart - 0.5));
          const firstReminderMinute = Math.floor(Math.random() * 60);

          // Second reminder: Random time in the last 30 minutes before end time
          const secondReminderHour = endHour - 1;
          const secondReminderMinute = 30 + Math.floor(Math.random() * 30); // Between :30 and :59 of the hour before end

          // Get streak-aware content (same for both reminders for consistency)
          const reminderContent = getStreakReminderContent(currentStreak);

          // Schedule first reminder
          await Notifications.scheduleNotificationAsync({
            content: {
              title: reminderContent.title,
              body: reminderContent.body,
              sound: true,
              data: {
                type: 'streak_reminder',
                reminderNumber: 1,
              },
            },
            trigger: {
              type: Notifications.SchedulableTriggerInputTypes.CALENDAR,
              hour: firstReminderHour,
              minute: firstReminderMinute,
              repeats: true,
            } as any,
          });

          console.log(`🔥 Scheduled first streak reminder at ${firstReminderHour}:${firstReminderMinute.toString().padStart(2, '0')}`);

          // Schedule second reminder (backup)
          await Notifications.scheduleNotificationAsync({
            content: {
              title: reminderContent.title,
              body: reminderContent.body,
              sound: true,
              data: {
                type: 'streak_reminder',
                reminderNumber: 2,
              },
            },
            trigger: {
              type: Notifications.SchedulableTriggerInputTypes.CALENDAR,
              hour: secondReminderHour,
              minute: secondReminderMinute,
              repeats: true,
            } as any,
          });

          console.log(`🔥 Scheduled second streak reminder at ${secondReminderHour}:${secondReminderMinute.toString().padStart(2, '0')}`);
        } else {
          console.log('✅ Streak already completed today, streak reminders will show tomorrow');
        }
      }

      // Step 6: Verify what was scheduled
      const scheduled = await Notifications.getAllScheduledNotificationsAsync();
      console.log(`✅ Total scheduled notifications: ${scheduled.length}`);

    } catch (error) {
      console.error('❌ Error scheduling notifications:', error);
    } finally {
      schedulingInProgress.current = false;
    }
  };

  const cancelAllNotifications = async (): Promise<void> => {
    await Notifications.cancelAllScheduledNotificationsAsync();
    console.log('🗑️ All notifications cancelled');
  };

  const getAllScheduledNotifications = async (): Promise<Notifications.NotificationRequest[]> => {
    return await Notifications.getAllScheduledNotificationsAsync();
  };

  // Single consolidated effect: reschedule when any relevant setting changes
  useEffect(() => {
    // Don't reschedule until initial preferences are loaded
    if (!isInitialized) {
      return;
    }

    // Debounce to prevent rapid rescheduling
    const timeoutId = setTimeout(async () => {
      console.log('📅 Notification settings changed, rescheduling...');
      console.log(`   - Enabled: ${notificationsEnabled}`);
      console.log(`   - Count: ${notificationsPerDay}`);
      console.log(`   - Streak Reminder: ${streakReminderEnabled}`);
      console.log(`   - Time: ${startHour}:00 - ${endHour}:00`);
      console.log(`   - Categories: ${selectedCategories.join(', ')}`);

      await scheduleNotifications();
    }, 500); // 500ms debounce

    return () => clearTimeout(timeoutId);
  }, [
    notificationsPerDay,
    notificationsEnabled,
    streakReminderEnabled,
    startHour,
    endHour,
    selectedCategories,
    streakDays,
    permissionStatus,
    isInitialized,
  ]);

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
    getAllScheduledNotifications,
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
