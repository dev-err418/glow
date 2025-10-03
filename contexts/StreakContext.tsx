import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface StreakContextType {
  streakDays: string[];
  currentStreak: number;
  recordActivity: () => Promise<void>;
  isLoading: boolean;
}

const StreakContext = createContext<StreakContextType | undefined>(undefined);

const STORAGE_KEY = 'streakData';

export function StreakProvider({ children }: { children: React.ReactNode }) {
  const [streakDays, setStreakDays] = useState<string[]>([]);
  const [currentStreak, setCurrentStreak] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  // Load saved streak data on app start
  useEffect(() => {
    loadStreakData();
  }, []);

  // Calculate current streak whenever streakDays changes
  useEffect(() => {
    calculateCurrentStreak();
  }, [streakDays]);

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

  const getTodayString = () => {
    const today = new Date();
    return today.toISOString().split('T')[0]; // YYYY-MM-DD format
  };

  const recordActivity = async () => {
    const today = getTodayString();

    // Check if today is already recorded
    if (!streakDays.includes(today)) {
      const updatedDays = [...streakDays, today];
      setStreakDays(updatedDays);
      await saveStreakData(updatedDays);
    }
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
    const yesterday = yesterdayDate.toISOString().split('T')[0];

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
      const expectedDate = previousDate.toISOString().split('T')[0];

      if (sortedDays[i] === expectedDate) {
        streak++;
        currentDate = previousDate;
      } else {
        break;
      }
    }

    setCurrentStreak(streak);
  };

  const value = {
    streakDays,
    currentStreak,
    recordActivity,
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
