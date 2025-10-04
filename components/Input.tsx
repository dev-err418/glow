import React from 'react';
import { View, TextInput, Text, StyleSheet, ViewStyle, TextStyle, TextInputProps } from 'react-native';
import { Colors } from '../constants/Colors';
import { Typography } from '../constants/Typography';

interface InputProps extends TextInputProps {
  label?: string;
  error?: string;
  containerStyle?: ViewStyle;
  inputStyle?: TextStyle;
  labelStyle?: TextStyle;
}

export function Input({
  label,
  error,
  containerStyle,
  inputStyle,
  labelStyle,
  ...textInputProps
}: InputProps) {
  return (
    <View style={[styles.container, containerStyle]}>
      {label && (
        <Text style={[styles.label, labelStyle]}>{label}</Text>
      )}
      <TextInput
        style={[
          styles.input,
          error && styles.inputError,
          inputStyle,
        ]}
        placeholderTextColor={Colors.text.light}
        {...textInputProps}
      />
      {error && (
        <Text style={styles.errorText}>{error}</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  label: {
    ...Typography.label,
    marginBottom: 8,
    color: Colors.text.primary,
  },
  input: {
    backgroundColor: Colors.background.primary,
    borderWidth: 1,
    borderColor: Colors.border.light,
    borderRadius: 12,
    paddingVertical: 18,
    paddingHorizontal: 16,
    fontSize: 16,
    fontFamily: 'UncutSans',
    fontWeight: '400',
    color: Colors.text.primary,
  },
  inputError: {
    borderColor: Colors.status.error,
  },
  errorText: {
    ...Typography.errorText,
    marginTop: 4,
    fontSize: 12,
  },
});
