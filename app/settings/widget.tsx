import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { WidgetSettings } from '../../components/WidgetSettings';
import { useColors } from '../../constants/Colors';
import { Typography } from '../../constants/Typography';

export default function WidgetSettingsScreen() {
  const Colors = useColors();

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background.default,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 40,
  },
  pageTitle: {
    ...Typography.h1,
    color: Colors.text.primary,
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    ...Typography.bodySmall,
    fontSize: 13,
    color: Colors.text.secondary,
    textAlign: 'center',
    marginBottom: 32,
    paddingHorizontal: 24,
  },
});

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        <Text style={styles.pageTitle}>Widget</Text>
        <Text style={styles.subtitle}>
          Add the Glow widget to your home screen for quick access to daily affirmations
        </Text>
        <WidgetSettings />
      </ScrollView>
    </SafeAreaView>
  );
}
