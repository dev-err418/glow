import { Ionicons } from '@expo/vector-icons';
import React, { useEffect, useRef } from 'react';
import { Animated, StyleSheet, Text, View } from 'react-native';
import { Colors } from '../constants/Colors';
import { Typography } from '../constants/Typography';
import { useStreak } from '../contexts/StreakContext';

interface StreakDisplayProps {
  animateNewDay?: boolean;
}

export function StreakDisplay({ animateNewDay = false }: StreakDisplayProps) {
  const { streakDays, currentStreak } = useStreak();
  const checkmarkScale = useRef(new Animated.Value(1)).current;
  const dayBoxScale = useRef(new Animated.Value(1)).current;

  // Get current day of week (0=Sunday, 1=Monday, etc.)
  // Convert to array index where Monday=0, Sunday=6
  const today = new Date().getDay();
  const todayIndex = (today + 6) % 7;

  // Get dates for the current week (Monday to Sunday)
  const getWeekDates = () => {
    const today = new Date();
    const currentDay = today.getDay();
    const diff = currentDay === 0 ? -6 : 1 - currentDay; // Calculate days to Monday

    const monday = new Date(today);
    monday.setDate(today.getDate() + diff);

    const weekDates: string[] = [];
    for (let i = 0; i < 7; i++) {
      const date = new Date(monday);
      date.setDate(monday.getDate() + i);
      weekDates.push(date.toISOString().split('T')[0]);
    }

    return weekDates;
  };

  const weekDates = getWeekDates();

  // Check if a specific date has activity
  const hasActivity = (dateString: string) => {
    return streakDays.includes(dateString);
  };

  // Animate today's checkmark and day box when animateNewDay is true
  useEffect(() => {
    if (animateNewDay) {
      // Reset scales
      checkmarkScale.setValue(0);
      dayBoxScale.setValue(0);

      // Delay slightly to let popup settle, then smash in
      setTimeout(() => {
        // Animate both together
        Animated.parallel([
          Animated.spring(checkmarkScale, {
            toValue: 1,
            useNativeDriver: true,
            tension: 100,
            friction: 5,
            overshootClamping: false,
          }),
          Animated.spring(dayBoxScale, {
            toValue: 1,
            useNativeDriver: true,
            tension: 100,
            friction: 5,
            overshootClamping: false,
          }),
        ]).start();
      }, 300);
    }
  }, [animateNewDay]);

  return (
    <View style={styles.container}>
      {/* Streak count on the left */}
      <View style={styles.streakCountContainer}>
        <Text style={styles.streakCount}>{currentStreak}</Text>
        <Text style={styles.streakLabel}>days</Text>
      </View>

      {/* Weekly Calendar */}
      <View style={styles.calendarContainer}>
        {['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su'].map((day, index) => {
          const isToday = index === todayIndex;
          const isActive = hasActivity(weekDates[index]);

          return (
            <View key={index} style={styles.dayColumn}>
              <Text style={[styles.dayLabel, isToday && styles.dayLabelActive]}>
                {day}
              </Text>
              {isToday && animateNewDay ? (
                <Animated.View
                  style={[
                    styles.dayBox,
                    styles.dayBoxToday,
                    { transform: [{ scale: dayBoxScale }] }
                  ]}
                >
                  {isActive && (
                    <Animated.View style={{ transform: [{ scale: checkmarkScale }] }}>
                      <Ionicons
                        name="checkmark"
                        size={18}
                        color={Colors.background.primary}
                      />
                    </Animated.View>
                  )}
                </Animated.View>
              ) : (
                <View style={[styles.dayBox, isToday && styles.dayBoxToday]}>
                  {isActive && (
                    <Ionicons
                      name="checkmark"
                      size={18}
                      color={isToday ? Colors.background.primary : Colors.primary}
                    />
                  )}
                </View>
              )}
            </View>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.background.primary,
    borderRadius: 20,
    paddingHorizontal: 20,
    paddingVertical: 20,
    shadowColor: Colors.shadow.light,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  streakCountContainer: {
    alignItems: 'center',
    marginRight: 20,
    minWidth: 60,
  },
  streakCount: {
    ...Typography.h2,
    fontSize: 40,
    lineHeight: 45,
    fontWeight: '700',
    color: Colors.primary,
  },
  streakLabel: {
    ...Typography.bodySmall,
    fontSize: 14,
    color: Colors.primary,    
    lineHeight: 14
  },
  calendarContainer: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 6,
  },
  dayColumn: {
    alignItems: 'center',
    gap: 8,
    flex: 1,
  },
  dayLabel: {
    ...Typography.bodySmall,
    fontSize: 12,
    color: Colors.text.light,
    fontWeight: '500',
  },
  dayLabelActive: {
    color: Colors.text.primary,
    fontWeight: '600',
  },
  dayBox: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: Colors.background.secondary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dayBoxToday: {
    backgroundColor: Colors.primary,
    shadowColor: Colors.shadow.light,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3,
  },
});
