import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Colors } from '../constants/Colors';
import { Typography } from '../constants/Typography';
import { useOnboarding } from '../contexts/OnboardingContext';

export function WidgetSettings() {
  const { onboardingData } = useOnboarding();

  return (
    <View style={styles.container}>
      <View style={styles.infoCard}>
        <View style={styles.iconContainer}>
          <Ionicons name="apps" size={32} color={Colors.primary} />
        </View>
        <Text style={styles.title}>Home Screen Widget</Text>
        <Text style={styles.description}>
          Add the Glow widget to your home screen for quick access to daily affirmations
        </Text>
        {onboardingData.widgetInstalled && (
          <View style={styles.badge}>
            <Ionicons name="checkmark-circle" size={16} color={Colors.primary} />
            <Text style={styles.badgeText}>Widget Installed</Text>
          </View>
        )}
      </View>

      <View style={styles.steps}>
        <Text style={styles.stepsTitle}>How to add:</Text>
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
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 12,
  },
  infoCard: {
    backgroundColor: Colors.background.primary,
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
  },
  iconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: `${Colors.primary}20`,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  title: {
    ...Typography.h3,
    fontSize: 18,
    marginBottom: 8,
    textAlign: 'center',
  },
  description: {
    ...Typography.body,
    fontSize: 14,
    color: Colors.text.secondary,
    textAlign: 'center',
    marginBottom: 12,
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: `${Colors.primary}15`,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  badgeText: {
    ...Typography.bodySmall,
    fontSize: 13,
    color: Colors.primary,
    fontWeight: '600',
  },
  steps: {
    backgroundColor: Colors.background.primary,
    borderRadius: 12,
    padding: 16,
  },
  stepsTitle: {
    ...Typography.body,
    fontWeight: '600',
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
    fontWeight: '700',
    color: Colors.primary,
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
