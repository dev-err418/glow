import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Colors } from '../constants/Colors';
import { Typography } from '../constants/Typography';

interface NotificationSettingsProps {
  count: number;
  onCountChange: (count: number) => void;
  startDate: Date;
  endDate: Date;
  onStartTimeChange: (event: any, date?: Date) => void;
  onEndTimeChange: (event: any, date?: Date) => void;
}

export function NotificationSettings({
  count,
  onCountChange,
  startDate,
  endDate,
  onStartTimeChange,
  onEndTimeChange,
}: NotificationSettingsProps) {
  const handleIncrement = () => {
    if (count < 20) onCountChange(count + 1);
  };

  const handleDecrement = () => {
    if (count > 0) onCountChange(count - 1);
  };

  return (
    <View style={styles.container}>
      {/* How many section */}
      <View style={styles.card}>
        <View style={styles.counterRow}>
          <Text style={styles.label}>How many</Text>
          <View style={styles.counterControls}>
            <TouchableOpacity
              style={styles.button}
              onPress={handleDecrement}
              disabled={count <= 0}
            >
              <Ionicons
                name="remove"
                size={28}
                color={count <= 0 ? Colors.text.light : Colors.background.primary}
              />
            </TouchableOpacity>
            <Text style={styles.countText}>{count}x</Text>
            <TouchableOpacity
              style={styles.button}
              onPress={handleIncrement}
              disabled={count >= 20}
            >
              <Ionicons
                name="add"
                size={28}
                color={count >= 20 ? Colors.text.light : Colors.background.primary}
              />
            </TouchableOpacity>
          </View>
        </View>
      </View>

      {/* Time section */}
      {count > 0 && (
        <View style={styles.card}>
          <View style={styles.timeRow}>
            <Text style={styles.label}>Start at</Text>
            <DateTimePicker
              value={startDate}
              mode="time"
              is24Hour={false}
              onChange={onStartTimeChange}
              style={styles.timePicker}
            />
          </View>

          <View style={styles.divider} />

          <View style={styles.timeRow}>
            <Text style={styles.label}>End at</Text>
            <DateTimePicker
              value={endDate}
              mode="time"
              is24Hour={false}
              onChange={onEndTimeChange}
              style={styles.timePicker}
            />
          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    gap: 12,
  },
  card: {
    backgroundColor: Colors.background.primary,
    borderRadius: 20,
    padding: 20,
    shadowColor: Colors.shadow.light,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  label: {
    ...Typography.body,
    fontSize: 18,
    color: Colors.text.primary,
  },
  counterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  counterControls: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  button: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.secondary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  countText: {
    ...Typography.h3,
    fontSize: 32,
    color: Colors.text.primary,
    fontWeight: '600',
    minWidth: 75,
    textAlign: 'center',
  },
  timeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 4,
  },
  timePicker: {
    height: 40,
  },
  divider: {
    height: 1,
    backgroundColor: Colors.border.light,
    marginVertical: 16,
  },
});
