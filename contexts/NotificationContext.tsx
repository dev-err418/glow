import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Notifications from 'expo-notifications';

interface NotificationContextType {
  notificationsPerDay: number;
  setNotificationsPerDay: (count: number) => void;
  notificationsEnabled: boolean;
  setNotificationsEnabled: (enabled: boolean) => void;
  permissionStatus: string;
  requestPermissions: () => Promise<boolean>;
  scheduleNotifications: () => void;
  cancelAllNotifications: () => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

const STORAGE_KEYS = {
  NOTIFICATIONS_PER_DAY: 'notificationsPerDay',
  NOTIFICATIONS_ENABLED: 'notificationsEnabled',
};

export function NotificationProvider({ children }: { children: React.ReactNode }) {
  const [notificationsPerDay, setNotificationsPerDay] = useState(3);
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);
  const [permissionStatus, setPermissionStatus] = useState('unknown');

  // Load saved preferences on app start
  useEffect(() => {
    loadPreferences();
    checkPermissionStatus();
  }, []);

  // Save preferences when they change
  useEffect(() => {
    savePreferences();
  }, [notificationsPerDay, notificationsEnabled]);

  const loadPreferences = async () => {
    try {
      const savedCount = await AsyncStorage.getItem(STORAGE_KEYS.NOTIFICATIONS_PER_DAY);
      const savedEnabled = await AsyncStorage.getItem(STORAGE_KEYS.NOTIFICATIONS_ENABLED);

      if (savedCount) setNotificationsPerDay(parseInt(savedCount));
      if (savedEnabled) setNotificationsEnabled(savedEnabled === 'true');
    } catch (error) {
      console.error('Error loading preferences:', error);
    }
  };

  const savePreferences = async () => {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.NOTIFICATIONS_PER_DAY, notificationsPerDay.toString());
      await AsyncStorage.setItem(STORAGE_KEYS.NOTIFICATIONS_ENABLED, notificationsEnabled.toString());
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

  const scheduleNotifications = async () => {
    if (!notificationsEnabled || permissionStatus !== 'granted') return;

    // Cancel existing notifications first
    await Notifications.cancelAllScheduledNotificationsAsync();

    // Calculate intervals (distribute throughout 16 hour day: 6 AM to 10 PM)
    const startHour = 6; // 6 AM
    const endHour = 22; // 10 PM
    const totalMinutes = (endHour - startHour) * 60;
    const interval = Math.floor(totalMinutes / notificationsPerDay);

    const messages = [
      "Time for a mindful moment! 🌟",
      "Remember to take a deep breath 💫",
      "You're doing great today! ✨",
      "Take a moment to appreciate yourself 🌸",
      "A gentle reminder to stay present 🌿",
      "You matter and your efforts count 💝",
      "Time to pause and reflect 🌙",
      "Sending you positive vibes! ☀️"
    ];

    for (let i = 0; i < notificationsPerDay; i++) {
      const triggerTime = startHour * 60 + (interval * i) + Math.random() * 30; // Add some randomness
      const hours = Math.floor(triggerTime / 60);
      const minutes = Math.floor(triggerTime % 60);

      await Notifications.scheduleNotificationAsync({
        content: {
          title: "Glow App",
          body: messages[Math.floor(Math.random() * messages.length)],
          sound: true,
        },
        trigger: {
          hour: hours,
          minute: minutes,
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
    if (notificationsEnabled && permissionStatus === 'granted') {
      scheduleNotifications();
    } else {
      cancelAllNotifications();
    }
  }, [notificationsPerDay, notificationsEnabled, permissionStatus]);

  const value = {
    notificationsPerDay,
    setNotificationsPerDay,
    notificationsEnabled,
    setNotificationsEnabled,
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