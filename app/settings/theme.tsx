import * as Haptics from 'expo-haptics';
import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { RadioGroup } from '../../components/RadioCard';
import { useColors } from '../../constants/Colors';
import { Typography } from '../../constants/Typography';
import { useTheme } from '../../contexts/ThemeContext';

export default function ThemeSettings() {
  const Colors = useColors();
  const { themeMode, setThemeMode } = useTheme();

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
    section: {
      marginBottom: 24,
    },
  });

  const themeOptions = [
    { label: 'System', value: 'system' },
    { label: 'Light', value: 'light' },
    { label: 'Dark', value: 'dark' },
  ];

  const handleThemeChange = (value: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setThemeMode(value as 'system' | 'light' | 'dark');
  };

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        {/* Title */}
        <Text style={styles.pageTitle}>Theme</Text>
        <Text style={styles.subtitle}>
          Choose how Glow looks on your device
        </Text>

        {/* Theme Options */}
        <View style={styles.section}>
          <RadioGroup
            options={themeOptions}
            selectedValue={themeMode}
            onValueChange={handleThemeChange}
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
