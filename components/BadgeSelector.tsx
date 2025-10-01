import React from 'react';
import { TouchableOpacity, Text, View, StyleSheet, ViewStyle } from 'react-native';
import { Colors } from '../constants/Colors';
import { Typography } from '../constants/Typography';

interface BadgeSelectorProps {
  label: string;
  selected: boolean;
  onPress: () => void;
  style?: ViewStyle;
}

export function BadgeSelector({ label, selected, onPress, style }: BadgeSelectorProps) {
  return (
    <TouchableOpacity
      style={[
        styles.badge,
        selected && styles.badgeSelected,
        style,
      ]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <Text style={[styles.icon, selected && styles.iconSelected]}>
        {selected ? '✓' : '+'}
      </Text>
      <Text style={[styles.label, selected && styles.labelSelected]}>{label}</Text>
    </TouchableOpacity>
  );
}

interface BadgeOption {
  label: string;
  value: string;
}

interface BadgeGroupProps {
  options: BadgeOption[];
  selectedValues: string[];
  onValuesChange: (values: string[]) => void;
  multiSelect?: boolean;
  style?: ViewStyle;
  badgeStyle?: ViewStyle;
}

export function BadgeGroup({
  options,
  selectedValues,
  onValuesChange,
  multiSelect = true,
  style,
  badgeStyle,
}: BadgeGroupProps) {
  const handlePress = (value: string) => {
    if (multiSelect) {
      // Multi-select mode: toggle selection
      if (selectedValues.includes(value)) {
        onValuesChange(selectedValues.filter((v) => v !== value));
      } else {
        onValuesChange([...selectedValues, value]);
      }
    } else {
      // Single-select mode: replace selection
      if (selectedValues.includes(value)) {
        onValuesChange([]);
      } else {
        onValuesChange([value]);
      }
    }
  };

  return (
    <View style={[styles.group, style]}>
      {options.map((option) => (
        <BadgeSelector
          key={option.value}
          label={option.label}
          selected={selectedValues.includes(option.value)}
          onPress={() => handlePress(option.value)}
          style={badgeStyle}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.background.primary,
    borderRadius: 30,
    paddingVertical: 12,
    paddingHorizontal: 20,
    marginRight: 10,
    marginBottom: 10,
    shadowColor: Colors.shadow.light,
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 1,
  },
  badgeSelected: {
    backgroundColor: Colors.background.default,
  },
  icon: {
    fontSize: 18,
    color: Colors.text.light,
    marginRight: 8,
    fontWeight: '400',
  },
  iconSelected: {
    color: Colors.secondary,
    fontWeight: '600',
  },
  label: {
    ...Typography.body,
    fontSize: 16,
    color: Colors.text.primary,
    fontWeight: '400',
  },
  labelSelected: {
    fontWeight: '500',
    color: Colors.text.primary,
  },
  group: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    width: '100%',
  },
});
