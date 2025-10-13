import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { usePostHog } from 'posthog-react-native';

interface StreakContextType {
  streakDays: string[];
  currentStreak: number;
  recordActivity: () => Promise<boolean>;
  migrateAndFixDates: () => Promise<{ before: string[], after: string[] }>;
  isLoading: boolean;
}

const StreakContext = createContext<StreakContextType | undefined>(undefined);

const STORAGE_KEY = 'streakData';

export function StreakProvider({ children }: { children: React.ReactNode }) {
  const [streakDays, setStreakDays] = useState<string[]>([]);
  const [currentStreak, setCurrentStreak] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const posthog = usePostHog();
  const previousStreakRef = useRef(0);

  // Demo mode: Generate 17-day streak for store screenshots
  const isDemoMode = process.env.EXPO_PUBLIC_DEMO_STREAK === 'true';
  const DEMO_STREAK_DAYS = 17;

  // Load saved streak data on app start
  useEffect(() => {
    loadStreakData();
  }, []);

  // Calculate current streak whenever streakDays changes
  useEffect(() => {
    calculateCurrentStreak();
  }, [streakDays]);

  // Track streak milestones in PostHog
  useEffect(() => {
    const STREAK_MILESTONES = [1, 3, 7, 14, 30, 50, 100];
    const previousStreak = previousStreakRef.current;

    // Check if we hit a new milestone
    if (currentStreak > previousStreak) {
      for (const milestone of STREAK_MILESTONES) {
        if (currentStreak >= milestone && previousStreak < milestone) {
          posthog.capture('Streak Milestone Reached', {
            streakDays: milestone,
            currentStreak: currentStreak,
          });
        }
      }
    }

    // Update the previous streak reference
    previousStreakRef.current = currentStreak;
  }, [currentStreak, posthog]);

  const loadStreakData = async () => {
    try {
      const savedData = await AsyncStorage.getItem(STORAGE_KEY);
      if (savedData) {
        const parsed = JSON.parse(savedData);
        setStreakDays(parsed);
      }
    } catch (error) {
      console.error('Error loading streak data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const saveStreakData = async (days: string[]) => {
    try {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(days));
    } catch (error) {
      console.error('Error saving streak data:', error);
    }
  };

  const formatDateToLocal = (date: Date): string => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`; // YYYY-MM-DD format using local timezone
  };

  const getTodayString = () => {
    return formatDateToLocal(new Date());
  };

  const recordActivity = async (): Promise<boolean> => {
    const today = getTodayString();

    // Return a promise that resolves with the correct isNewDay value
    return new Promise((resolve) => {
      // Use functional update to ensure we work with latest state
      setStreakDays((prevDays) => {
        // Check if today is already recorded
        if (!prevDays.includes(today)) {
          const updatedDays = [...prevDays, today];
          // Save to AsyncStorage
          saveStreakData(updatedDays);
          // Resolve with true after state update
          setTimeout(() => resolve(true), 0);
          return updatedDays;
        }
        // Resolve with false if already recorded
        setTimeout(() => resolve(false), 0);
        return prevDays;
      });
    });
  };

  const calculateCurrentStreak = () => {
    if (streakDays.length === 0) {
      setCurrentStreak(0);
      return;
    }

    // Sort dates in descending order (most recent first)
    const sortedDays = [...streakDays].sort((a, b) => b.localeCompare(a));

    const today = getTodayString();
    let streak = 0;

    // Check if today or yesterday has activity
    const todayDate = new Date(today);
    const yesterdayDate = new Date(todayDate);
    yesterdayDate.setDate(yesterdayDate.getDate() - 1);
    const yesterday = formatDateToLocal(yesterdayDate);

    let currentDate: Date;
    if (sortedDays[0] === today) {
      currentDate = todayDate;
      streak = 1;
    } else if (sortedDays[0] === yesterday) {
      currentDate = yesterdayDate;
      streak = 1;
    } else {
      // No recent activity
      setCurrentStreak(0);
      return;
    }

    // Count consecutive days going backwards
    for (let i = 1; i < sortedDays.length; i++) {
      const previousDate = new Date(currentDate);
      previousDate.setDate(previousDate.getDate() - 1);
      const expectedDate = formatDateToLocal(previousDate);

      if (sortedDays[i] === expectedDate) {
        streak++;
        currentDate = previousDate;
      } else {
        break;
      }
    }

    setCurrentStreak(streak);
  };

  const migrateAndFixDates = async (): Promise<{ before: string[], after: string[] }> => {
    try {
      const savedData = await AsyncStorage.getItem(STORAGE_KEY);
      const beforeDates = savedData ? JSON.parse(savedData) : [];

      // Convert all dates to proper local format and remove duplicates
      const fixedDates = [...new Set(
        beforeDates.map((dateStr: string) => {
          try {
            // Parse the date string and convert to local format
            const date = new Date(dateStr);
            // Check if date is valid
            if (isNaN(date.getTime())) {
              return null;
            }
            return formatDateToLocal(date);
          } catch (error) {
            console.error('Error parsing date:', dateStr, error);
            return null;
          }
        }).filter((date: string | null) => date !== null)
      )].sort();

      // Save fixed dates
      await saveStreakData(fixedDates);
      setStreakDays(fixedDates);

      return { before: beforeDates, after: fixedDates };
    } catch (error) {
      console.error('Error migrating dates:', error);
      return { before: [], after: [] };
    }
  };

  // Generate demo streak data: 17 consecutive days ending today
  const generateDemoStreakDays = (): string[] => {
    const today = new Date();
    const demoDays: string[] = [];

    for (let i = DEMO_STREAK_DAYS - 1; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(today.getDate() - i);
      demoDays.push(formatDateToLocal(date));
    }

    return demoDays;
  };

  const value = {
    streakDays: isDemoMode ? generateDemoStreakDays() : streakDays,
    currentStreak: isDemoMode ? DEMO_STREAK_DAYS : currentStreak,
    recordActivity,
    migrateAndFixDates,
    isLoading,
  };

  return (
    <StreakContext.Provider value={value}>
      {children}
    </StreakContext.Provider>
  );
}

export function useStreak() {
  const context = useContext(StreakContext);
  if (context === undefined) {
    throw new Error('useStreak must be used within a StreakProvider');
  }
  return context;
}
