import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useColors } from '../constants/Colors';
import { Typography } from '../constants/Typography';

export function WidgetSettings() {
  const Colors = useColors();

  const styles = StyleSheet.create({
  container: {
    gap: 12,
  },
  steps: {
    backgroundColor: Colors.background.primary,
    borderRadius: 12,
    padding: 16,
  },
  stepsTitle: {
    ...Typography.body,
    color: Colors.text.primary,
    marginBottom: 12,
  },
  step: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  stepNumber: {
    ...Typography.body,
    color: Colors.secondary,
    marginRight: 8,
    width: 20,
  },
  stepText: {
    ...Typography.body,
    fontSize: 14,
    color: Colors.text.secondary,
    flex: 1,
  },
});

  return (
    <View style={styles.container}>
      <View style={styles.steps}>
        <Text style={styles.stepsTitle}>How to add to home screen:</Text>
        <View style={styles.step}>
          <Text style={styles.stepNumber}>1.</Text>
          <Text style={styles.stepText}>Long press on your home screen</Text>
        </View>
        <View style={styles.step}>
          <Text style={styles.stepNumber}>2.</Text>
          <Text style={styles.stepText}>Tap the + button in the top corner</Text>
        </View>
        <View style={styles.step}>
          <Text style={styles.stepNumber}>3.</Text>
          <Text style={styles.stepText}>Search for "Glow" and add the widget</Text>
        </View>
      </View>

      <View style={styles.steps}>
        <Text style={styles.stepsTitle}>How to add to lock screen:</Text>
        <View style={styles.step}>
          <Text style={styles.stepNumber}>1.</Text>
          <Text style={styles.stepText}>Lock your device</Text>
        </View>
        <View style={styles.step}>
          <Text style={styles.stepNumber}>2.</Text>
          <Text style={styles.stepText}>Long press on the lock screen</Text>
        </View>
        <View style={styles.step}>
          <Text style={styles.stepNumber}>3.</Text>
          <Text style={styles.stepText}>Tap "Customize" or the + button</Text>
        </View>
        <View style={styles.step}>
          <Text style={styles.stepNumber}>4.</Text>
          <Text style={styles.stepText}>Search for "Glow" and add the widget</Text>
        </View>
      </View>
    </View>
  );
}
