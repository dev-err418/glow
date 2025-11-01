import React from 'react';
import { ActivityIndicator, StyleSheet, Text, TextStyle, TouchableOpacity, ViewStyle } from 'react-native';
import { useColors } from '../constants/Colors';

export type ButtonVariant = 'primary' | 'secondary' | 'outline';
export type ButtonSize = 'small' | 'medium' | 'large';

interface ButtonProps {
  children: React.ReactNode;
  onPress: () => void;
  variant?: ButtonVariant;
  size?: ButtonSize;
  disabled?: boolean;
  loading?: boolean;
  style?: ViewStyle;
  textStyle?: TextStyle;
}

export function Button({
  children,
  onPress,
  variant = 'primary',
  size = 'medium',
  disabled = false,
  loading = false,
  style,
  textStyle,
}: ButtonProps) {
  const Colors = useColors();

  const styles = StyleSheet.create({
    button: {
      alignItems: 'center',
      justifyContent: 'center',
      borderRadius: 16,
      shadowColor: Colors.shadow.medium,
      shadowOffset: {
        width: 0,
        height: 2,
      },
      shadowOpacity: 0.2,
      shadowRadius: 4,
      elevation: 3,
    },

    // Variants
    buttonPrimary: {
      backgroundColor: Colors.secondary,
    },
    buttonSecondary: {
      backgroundColor: Colors.primary,
    },
    buttonOutline: {
      backgroundColor: 'transparent',
      borderWidth: 2,
      borderColor: Colors.primary,
      shadowOpacity: 0,
      elevation: 0,
    },

    // Sizes
    buttonSmall: {
      paddingVertical: 10,
      paddingHorizontal: 20,
    },
    buttonMedium: {
      paddingVertical: 18,
      paddingHorizontal: 24,
    },
    buttonLarge: {
      paddingVertical: 20,
      paddingHorizontal: 40,
    },

    // Disabled state
    buttonDisabled: {
      opacity: 0.5,
    },

    // Text styles
    text: {
      textAlign: 'center',
    },
    textPrimary: {
      color: Colors.text.white,
    },
    textSecondary: {
      color: Colors.text.white,
    },
    textOutline: {
      color: Colors.primary,
    },
    textSmall: {
      fontSize: 14,
    },
    textMedium: {
      fontSize: 16,
    },
    textLarge: {
      fontSize: 18,
      fontWeight: '600',
    },
    textDisabled: {
      opacity: 1,
    },
  });

  const buttonStyles: (ViewStyle | false | undefined)[] = [
    styles.button,
    styles[`button${variant.charAt(0).toUpperCase() + variant.slice(1)}` as keyof typeof styles] as ViewStyle,
    styles[`button${size.charAt(0).toUpperCase() + size.slice(1)}` as keyof typeof styles] as ViewStyle,
    disabled && styles.buttonDisabled,
    style,
  ];

  const textStyles: (TextStyle | false | undefined)[] = [
    styles.text,
    styles[`text${variant.charAt(0).toUpperCase() + variant.slice(1)}` as keyof typeof styles] as TextStyle,
    styles[`text${size.charAt(0).toUpperCase() + size.slice(1)}` as keyof typeof styles] as TextStyle,
    disabled && styles.textDisabled,
    textStyle,
  ];

  return (
    <TouchableOpacity
      style={buttonStyles}
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.7}
      hitSlop={{ top: 15, bottom: 15, left: 15, right: 15 }}
    >
      {loading ? (
        <ActivityIndicator
          color={variant === 'outline' ? Colors.primary : Colors.text.white}
        />
      ) : (
        <Text style={textStyles}>{children}</Text>
      )}
    </TouchableOpacity>
  );
}
