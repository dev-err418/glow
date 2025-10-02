import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View, ViewStyle } from 'react-native';
import * as Haptics from 'expo-haptics';
import { Colors } from '../constants/Colors';
import { Typography } from '../constants/Typography';

interface RadioCardProps {
  label: string;
  selected: boolean;
  onPress: () => void;
  style?: ViewStyle;
}

export function RadioCard({ label, selected, onPress, style }: RadioCardProps) {
  const parts = label.split(' - ');
  const hasTwoParts = parts.length === 2;

  const handlePress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onPress();
  };

  return (
    <TouchableOpacity
      style={[
        styles.card,
        selected && styles.cardSelected,
        style,
      ]}
      onPress={handlePress}
      activeOpacity={0.7}
    >
      {hasTwoParts ? (
        <Text style={[styles.label, selected && styles.labelSelected]}>
          {parts[0]}
          <Text style={styles.labelSecondary}> - {parts[1]}</Text>
        </Text>
      ) : (
        <Text style={[styles.label, selected && styles.labelSelected]}>{label}</Text>
      )}
      <View style={[styles.radio, selected && styles.radioSelected]}>
        {selected && <View style={styles.radioInner} />}
      </View>
    </TouchableOpacity>
  );
}

interface RadioOption {
  label: string;
  value: string;
}

interface RadioGroupProps {
  options: RadioOption[];
  selectedValue: string;
  onValueChange: (value: string) => void;
  style?: ViewStyle;
  cardStyle?: ViewStyle;
}

export function RadioGroup({
  options,
  selectedValue,
  onValueChange,
  style,
  cardStyle,
}: RadioGroupProps) {
  return (
    <View style={[styles.group, style]}>
      {options.map((option) => (
        <RadioCard
          key={option.value}
          label={option.label}
          selected={selectedValue === option.value}
          onPress={() => onValueChange(option.value)}
          style={cardStyle}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: Colors.background.primary,
    borderRadius: 30,
    paddingVertical: 20,
    paddingHorizontal: 24,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: 'transparent',
    shadowColor: Colors.shadow.light,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  cardSelected: {
    borderColor: Colors.secondary,
  },
  label: {
    ...Typography.body,
    fontSize: 16,
    lineHeight: 20,
    color: Colors.text.primary,
    flex: 1,
  },
  labelSelected: {
    fontWeight: '500',
  },
  labelSecondary: {
    color: Colors.text.secondary,
    fontWeight: '400',
  },
  radio: {
    width: 28,
    height: 28,
    borderRadius: 14,
    borderWidth: 2,
    borderColor: Colors.border.medium,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.background.primary,
  },
  radioSelected: {
    borderColor: Colors.secondary,
  },
  radioInner: {
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: Colors.secondary,
  },
  group: {
    flex: 1,
    width: '100%',
  },
});
