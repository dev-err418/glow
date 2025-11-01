import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View, ViewStyle } from 'react-native';
import { useColors } from '../constants/Colors';
import { Typography } from '../constants/Typography';

interface BadgeSelectorProps {
  label: string;
  selected: boolean;
  onPress: () => void;
  style?: ViewStyle;
}

export function BadgeSelector({ label, selected, onPress, style }: BadgeSelectorProps) {
  const Colors = useColors();

  const styles = StyleSheet.create({
    badge: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: Colors.background.primary,
      borderRadius: 30,
      paddingVertical: 14,
      paddingRight: 20,
      paddingLeft: 14,
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
    badgeSelected: {
      borderColor: Colors.secondary,
    },
    iconContainer: {
      width: 24,
      height: 24,
      borderRadius: 12,
      alignItems: 'center',
      justifyContent: 'center',
      marginRight: 4,
    },
    icon: {
      color: Colors.text.light,
      fontSize: 14,
      fontWeight: 'bold',
    },
    iconSelected: {
      color: Colors.secondary,
    },
    label: {
      ...Typography.body,
      fontSize: 16,
      color: Colors.text.primary,
    },
    labelSelected: {
    },
  });

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
      <View style={styles.iconContainer}>
        <Text style={[styles.icon, selected && styles.iconSelected]}>
          {selected ? '✓' : '+'}
        </Text>
      </View>
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
  const groupStyles = StyleSheet.create({
    group: {
      width: '100%',
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 8,
    },
  });

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
    <View style={[groupStyles.group, style]}>
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
