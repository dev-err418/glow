import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Notifications from 'expo-notifications';
import React, { createContext, useContext, useEffect, useRef, useState } from 'react';
import { AppState } from 'react-native';
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
  "Don't forget your daily streak check-in 🌟",
  "Time for your daily dose of positivity 💫",
  "Keep the streak momentum going! 💪",
  "Your daily streak reminder is here 🌺"
];

// Gentle opt-in messages (no streak pressure, inviting tone)
const GENTLE_OPT_IN_MESSAGES = [
  "Your daily affirmations are ready ✨",
  "Time for your moment of calm 💫",
  "A mindful reminder from Glow 🌸",
  "Your daily dose of positivity awaits 🌟",
  "Take a peaceful pause today 🌿",
  "Something uplifting is waiting for you ☀️",
  "Glow is here when you're ready 💝",
  "Your affirmations miss you 🌺",
  "A gentle nudge to check in 💭",
  "Time to shine a little brighter ✨",
  "Your daily inspiration is here 🌙",
  "Ready for today's affirmation? 💫",
  "Let's make today mindful 🌸",
  "Your moment of zen awaits 🧘",
  "Open for today's positivity 🌟"
];

// Helper function to get a random opt-in message
const getOptInMessage = (): { title: string; body: string } => {
  const message = GENTLE_OPT_IN_MESSAGES[Math.floor(Math.random() * GENTLE_OPT_IN_MESSAGES.length)];
  return {
    title: "🌟 Time to Glow",
    body: message
  };
};

// Helper function to format date to local timezone (matches StreakContext)
const formatDateToLocal = (date: Date): string => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`; // YYYY-MM-DD format using local timezone
};

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

// Creates a quote selector that ensures unique quotes across a scheduling session
const createUniqueQuoteSelector = (categories: string[]) => {
  let availableQuotes: { id: string; text: string }[] = [];
  const usedQuoteIds = new Set<string>();
  
  // Build the full quote pool based on selected categories
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

  const resetQuotePool = () => {
    // Filter out already used quotes and shuffle
    availableQuotes = allQuotes
      .filter(quote => !usedQuoteIds.has(quote.id))
      .sort(() => Math.random() - 0.5); // Shuffle for randomness
  };

  // Initialize available quotes
  resetQuotePool();

  return {
    getNextUniqueQuote: (): { id: string; text: string } => {
      // If we've used all quotes, reset and start over
      if (availableQuotes.length === 0) {
        console.log('📚 All quotes used, resetting pool');
        usedQuoteIds.clear();
        resetQuotePool();
      }

      // If still no quotes available (shouldn't happen), return fallback
      if (availableQuotes.length === 0) {
        return { id: 'general-1', text: "Take a moment to appreciate yourself 🌸" };
      }

      // Get the next quote
      const quote = availableQuotes.pop()!;
      usedQuoteIds.add(quote.id);
      
      return quote;
    },
    
    getQuotesRemaining: () => availableQuotes.length,
    getTotalQuotes: () => allQuotes.length,
  };
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
    try {
      const { status } = await Notifications.requestPermissionsAsync();
      setPermissionStatus(status);
      return status === 'granted';
    } catch (error) {
      // Mac Catalyst and some platforms throw errors instead of returning denied status
      // This prevents crashes on iPad Pro running Mac Catalyst apps
      console.error('Error requesting notification permissions:', error);
      setPermissionStatus('denied');
      return false;
    }
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
  
      // Step 3: Calculate how many days we can schedule ahead
      const quoteSelector = createUniqueQuoteSelector(selectedCategories);
      console.log(`📚 Quote pool: ${quoteSelector.getTotalQuotes()} unique quotes available`);

      const MAX_TOTAL_NOTIFICATIONS = 62;
      // Note: Streak reminders + opt-in messages are separate from quote notifications
      // Reserve: 2 for streak reminders, ~12 for opt-in reminders (2 per day × 6 days)
      const streakNotificationsCount = streakReminderEnabled ? 2 : 0;
      const optInNotificationsCount = streakReminderEnabled ? 12 : 0; // Up to 6 days of opt-in reminders

      // Calculate days to schedule for quotes (max 14 days to keep content fresh)
      const daysToSchedule = Math.min(
        Math.floor((MAX_TOTAL_NOTIFICATIONS - streakNotificationsCount - optInNotificationsCount) / notificationsPerDay),
        14
      );

      console.log(`📅 Scheduling notifications breakdown:`);
      console.log(`   - ${notificationsPerDay} quote notifications per day (${daysToSchedule} days)`);
      console.log(`   - ${streakReminderEnabled ? '2 streak reminders (1 day)' : 'No streak reminders'}`);
      console.log(`   - ${streakReminderEnabled ? '~12 gentle opt-in reminders (6 days)' : 'No opt-in reminders'}`);
  
      let totalScheduled = 0;
      const now = new Date();
  
      // Step 4: Schedule notifications for each day
      for (let dayOffset = 0; dayOffset < daysToSchedule; dayOffset++) {
        const targetDate = new Date(now);
        targetDate.setDate(targetDate.getDate() + dayOffset);
        targetDate.setHours(0, 0, 0, 0); // Reset to start of day
        
        // Generate random times for this specific day
        const times = generateRandomTimes(notificationsPerDay, startHour, endHour);
        
        console.log(`\n📆 Day ${dayOffset + 1} (${targetDate.toLocaleDateString()}):`);
  
        // Schedule quote notifications for this day
        for (let i = 0; i < times.length; i++) {
          const { hour, minute } = times[i];
          
          // Get a UNIQUE random quote for each notification
          const quote = quoteSelector.getNextUniqueQuote();
          
          const notificationDate = new Date(targetDate);
          notificationDate.setHours(hour, minute, 0, 0);
          
          // Only schedule if it's in the future
          if (notificationDate > now) {
            await Notifications.scheduleNotificationAsync({
              content: {
                title: "⤵",
                body: quote.text,
                sound: true,
                data: {
                  quoteId: quote.id,
                  categories: selectedCategories,
                  dayOffset,
                  notificationIndex: i,
                },
              },
              trigger: {
                type: Notifications.SchedulableTriggerInputTypes.CALENDAR,
                year: notificationDate.getFullYear(),
                month: notificationDate.getMonth() + 1, // JavaScript months are 0-indexed
                day: notificationDate.getDate(),
                hour,
                minute,
                repeats: false, // NO REPEAT - each is unique
              } as any,
            });
            
            totalScheduled++;
            console.log(`  ✅ Quote ${i + 1} at ${hour}:${minute.toString().padStart(2, '0')} - "${quote.text.substring(0, 30)}..."`);
          }
        }

        // Safety check: ensure we don't exceed max notifications
        if (totalScheduled >= MAX_TOTAL_NOTIFICATIONS) {
          console.log(`⚠️ Reached maximum of ${MAX_TOTAL_NOTIFICATIONS} notifications, stopping`);
          break;
        }
      }

      // Step 5: Schedule streak reminders (only for today or tomorrow)
      if (streakReminderEnabled) {
        // Check if today's streak is already completed
        const today = formatDateToLocal(new Date());
        const hasCompletedToday = streakDays.includes(today);

        // Determine target date for streak reminders
        const streakTargetDate = new Date(now);
        let dayLabel = 'today';

        if (hasCompletedToday) {
          // Streak completed today, schedule for tomorrow
          streakTargetDate.setDate(streakTargetDate.getDate() + 1);
          dayLabel = 'tomorrow';
          console.log('\n✅ Streak already completed today, scheduling reminders for tomorrow');
        } else {
          console.log('\n🔥 Streak not yet completed, scheduling reminders for today');
        }

        streakTargetDate.setHours(0, 0, 0, 0); // Reset to start of day

        const totalHours = endHour - startHour;
        const lastQuarterStart = endHour - (totalHours * 0.25);

        // First reminder: Random time within the last quarter of time window
        const firstReminderHour = Math.floor(lastQuarterStart + Math.random() * (endHour - lastQuarterStart - 0.5));
        const firstReminderMinute = Math.floor(Math.random() * 60);

        // Second reminder: Random time in the last 30 minutes before end time
        const secondReminderHour = endHour - 1;
        const secondReminderMinute = 30 + Math.floor(Math.random() * 30);

        // Get streak-aware content
        const reminderContent = getStreakReminderContent(currentStreak);

        // Schedule first streak reminder
        const firstReminderDate = new Date(streakTargetDate);
        firstReminderDate.setHours(firstReminderHour, firstReminderMinute, 0, 0);

        if (firstReminderDate > now) {
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
              year: firstReminderDate.getFullYear(),
              month: firstReminderDate.getMonth() + 1,
              day: firstReminderDate.getDate(),
              hour: firstReminderHour,
              minute: firstReminderMinute,
              repeats: false,
            } as any,
          });

          totalScheduled++;
          console.log(`🔥 Streak reminder 1 (${dayLabel}) at ${firstReminderHour}:${firstReminderMinute.toString().padStart(2, '0')}`);
        }

        // Schedule second streak reminder
        const secondReminderDate = new Date(streakTargetDate);
        secondReminderDate.setHours(secondReminderHour, secondReminderMinute, 0, 0);

        if (secondReminderDate > now) {
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
              year: secondReminderDate.getFullYear(),
              month: secondReminderDate.getMonth() + 1,
              day: secondReminderDate.getDate(),
              hour: secondReminderHour,
              minute: secondReminderMinute,
              repeats: false,
            } as any,
          });

          totalScheduled++;
          console.log(`🔥 Streak reminder 2 (${dayLabel}) at ${secondReminderHour}:${secondReminderMinute.toString().padStart(2, '0')}`);
        }
      }

      // Step 6: Schedule gentle opt-in reminders for remaining days
      if (streakReminderEnabled) {
        // Determine starting day for opt-in messages
        const today = formatDateToLocal(new Date());
        const hasCompletedToday = streakDays.includes(today);

        // Start opt-in messages from the day after streak reminders
        const optInStartDay = hasCompletedToday ? 2 : 1; // If streak for tomorrow, start Day 2; if for today, start tomorrow

        console.log(`\n💫 Scheduling gentle opt-in reminders starting from Day ${optInStartDay + 1}`);

        // Schedule opt-in messages for remaining days (up to day 7)
        const maxOptInDays = Math.min(7, daysToSchedule);

        for (let dayOffset = optInStartDay; dayOffset < maxOptInDays; dayOffset++) {
          const targetDate = new Date(now);
          targetDate.setDate(targetDate.getDate() + dayOffset);
          targetDate.setHours(0, 0, 0, 0);

          // Schedule 2 opt-in reminders per day (similar timing to streak reminders)
          const totalHours = endHour - startHour;
          const lastQuarterStart = endHour - (totalHours * 0.25);

          // First opt-in: Random time within the last quarter
          const firstOptInHour = Math.floor(lastQuarterStart + Math.random() * (endHour - lastQuarterStart - 0.5));
          const firstOptInMinute = Math.floor(Math.random() * 60);

          // Second opt-in: Random time in the last 30 minutes
          const secondOptInHour = endHour - 1;
          const secondOptInMinute = 30 + Math.floor(Math.random() * 30);

          // Schedule first opt-in reminder
          const firstOptInDate = new Date(targetDate);
          firstOptInDate.setHours(firstOptInHour, firstOptInMinute, 0, 0);

          if (firstOptInDate > now && totalScheduled < MAX_TOTAL_NOTIFICATIONS) {
            const optInContent = getOptInMessage();

            await Notifications.scheduleNotificationAsync({
              content: {
                title: optInContent.title,
                body: optInContent.body,
                sound: true,
                data: {
                  type: 'opt_in_reminder',
                  reminderNumber: 1,
                  dayOffset,
                },
              },
              trigger: {
                type: Notifications.SchedulableTriggerInputTypes.CALENDAR,
                year: firstOptInDate.getFullYear(),
                month: firstOptInDate.getMonth() + 1,
                day: firstOptInDate.getDate(),
                hour: firstOptInHour,
                minute: firstOptInMinute,
                repeats: false,
              } as any,
            });

            totalScheduled++;
            console.log(`  💫 Opt-in reminder 1 (Day ${dayOffset + 1}) at ${firstOptInHour}:${firstOptInMinute.toString().padStart(2, '0')}`);
          }

          // Schedule second opt-in reminder
          const secondOptInDate = new Date(targetDate);
          secondOptInDate.setHours(secondOptInHour, secondOptInMinute, 0, 0);

          if (secondOptInDate > now && totalScheduled < MAX_TOTAL_NOTIFICATIONS) {
            const optInContent = getOptInMessage();

            await Notifications.scheduleNotificationAsync({
              content: {
                title: optInContent.title,
                body: optInContent.body,
                sound: true,
                data: {
                  type: 'opt_in_reminder',
                  reminderNumber: 2,
                  dayOffset,
                },
              },
              trigger: {
                type: Notifications.SchedulableTriggerInputTypes.CALENDAR,
                year: secondOptInDate.getFullYear(),
                month: secondOptInDate.getMonth() + 1,
                day: secondOptInDate.getDate(),
                hour: secondOptInHour,
                minute: secondOptInMinute,
                repeats: false,
              } as any,
            });

            totalScheduled++;
            console.log(`  💫 Opt-in reminder 2 (Day ${dayOffset + 1}) at ${secondOptInHour}:${secondOptInMinute.toString().padStart(2, '0')}`);
          }

          // Safety check
          if (totalScheduled >= MAX_TOTAL_NOTIFICATIONS) {
            console.log(`⚠️ Reached maximum of ${MAX_TOTAL_NOTIFICATIONS} notifications`);
            break;
          }
        }
      }

      // Step 7: Verify what was scheduled
      const scheduled = await Notifications.getAllScheduledNotificationsAsync();
      console.log(`\n✅ Successfully scheduled ${scheduled.length} unique notifications`);
      console.log(`📊 Covering ${daysToSchedule} days with fresh quotes each time`);
      
      // Store last schedule date for reference
      await AsyncStorage.setItem('lastScheduledDate', new Date().toISOString());
  
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
    permissionStatus,
    isInitialized,
  ]);

  // Auto-rescheduling: Check every 24 hours and when running low on notifications
  useEffect(() => {
    const checkAndReschedule = async () => {
      if (!isInitialized || permissionStatus !== 'granted' || !notificationsEnabled) {
        return;
      }

      try {
        // Check when we last scheduled
        const lastScheduledDateStr = await AsyncStorage.getItem('lastScheduledDate');
        const lastScheduledDate = lastScheduledDateStr ? new Date(lastScheduledDateStr) : null;

        const now = new Date();
        const hoursSinceLastSchedule = lastScheduledDate
          ? (now.getTime() - lastScheduledDate.getTime()) / (1000 * 60 * 60)
          : 24; // If no date stored, assume we need to reschedule

        // Reschedule every 24 hours to ensure fresh content
        if (hoursSinceLastSchedule >= 24) {
          console.log('🔄 24+ hours since last schedule, refreshing notifications with new quotes');
          await scheduleNotifications();
          return;
        }

        // Also check if we're running low on scheduled notifications
        const scheduled = await Notifications.getAllScheduledNotificationsAsync();
        const quotesRemaining = scheduled.filter(n => !n.content.data?.type ||
                                                     n.content.data.type !== 'streak_reminder').length;

        if (quotesRemaining < notificationsPerDay * 2) { // Less than 2 days worth
          console.log(`⚠️ Only ${quotesRemaining} quote notifications left, rescheduling...`);
          await scheduleNotifications();
        }
      } catch (error) {
        console.error('❌ Error checking reschedule:', error);
      }
    };

    // Set up interval to check periodically (every hour while app is open)
    // Note: Don't check on mount - the "settings change" useEffect handles cold start
    const interval = setInterval(checkAndReschedule, 60 * 60 * 1000);

    return () => clearInterval(interval);
  }, [isInitialized, permissionStatus, notificationsEnabled, notificationsPerDay]);

  // AppState listener: Check and reschedule when app comes to foreground
  useEffect(() => {
    const subscription = AppState.addEventListener('change', async (nextAppState) => {
      if (nextAppState === 'active' && isInitialized && permissionStatus === 'granted' && notificationsEnabled) {
        console.log('📱 App came to foreground, checking notification schedule...');

        try {
          const scheduled = await Notifications.getAllScheduledNotificationsAsync();
          const quotesRemaining = scheduled.filter(n => !n.content.data?.type ||
                                                       n.content.data.type !== 'streak_reminder').length;

          // If running low, reschedule
          if (quotesRemaining < notificationsPerDay * 2) {
            console.log(`⚠️ Only ${quotesRemaining} quote notifications left, rescheduling on foreground...`);
            await scheduleNotifications();
          } else {
            console.log(`✅ ${quotesRemaining} quote notifications still scheduled`);
          }
        } catch (error) {
          console.error('❌ Error checking schedule on foreground:', error);
        }
      }
    });

    return () => subscription.remove();
  }, [isInitialized, permissionStatus, notificationsEnabled, notificationsPerDay]);

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
