import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useRouter } from 'expo-router';
import React from 'react';
import { Linking, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AnimatedMascot } from '../../components/AnimatedMascot';
import { StreakDisplay } from '../../components/StreakDisplay';
import { Colors } from '../../constants/Colors';
import { Typography } from '../../constants/Typography';
import { useOnboarding } from '../../contexts/OnboardingContext';

interface SettingsRowProps {
  label: string;
  value?: string;
  icon: keyof typeof Ionicons.glyphMap;
  onPress: () => void;
  showDivider?: boolean;
}

function SettingsRow({ label, value, icon, onPress, showDivider = true }: SettingsRowProps) {
  return (
    <>
      <TouchableOpacity
        style={styles.settingRow}
        onPress={onPress}
        activeOpacity={0.7}
      >
        <View style={styles.settingLeft}>
          <Ionicons name={icon} size={20} color={Colors.secondary} />
          <Text style={styles.settingLabel}>{label}</Text>
        </View>
        <View style={styles.settingRight}>
          {value && <Text style={styles.settingValue}>{value}</Text>}
          <Ionicons name="chevron-forward" size={20} color={Colors.text.light} />
        </View>
      </TouchableOpacity>
      {showDivider && <View style={styles.divider} />}
    </>
  );
}

export default function SettingsIndex() {
  const router = useRouter();
  const { onboardingData } = useOnboarding();

  const handleClose = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.back();
  };

  const handleNavigate = (path: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.push(path as any);
  };

  const handleManageSubscription = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    router.push('/settings/customer-center');
  };

  const handleOpenURL = async (url: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    try {
      await Linking.openURL(url);
    } catch (error) {
      console.error('Error opening URL:', error);
    }
  };

  const getGenderDisplay = () => {
    switch (onboardingData.sex) {
      case 'male':
        return 'Male';
      case 'female':
        return 'Female';
      case 'other':
      case 'others':
        return 'Other';
      case 'prefer-not-to-say':
        return 'Prefer not to say';
      default:
        return 'Not set';
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={handleClose}
          style={styles.headerButton}
        >
          <Ionicons name="close" size={28} color={Colors.text.primary} />
        </TouchableOpacity>
      </View>

      {/* Content */}
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        {/* Title */}
        <Text style={styles.pageTitle}>Glow app</Text>

        {/* Animated Mascot */}
        <View style={styles.mascotWrapper}>
          <AnimatedMascot />
        </View>

        {/* Streak Display */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Your streak</Text>
          <StreakDisplay />
        </View>

        {/* Settings Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Settings</Text>
          <View style={styles.settingsCard}>
            <SettingsRow
              icon="person-outline"
              label="Name"
              value={onboardingData.name || 'Not set'}
              onPress={() => handleNavigate('/settings/edit-name')}
            />
            <SettingsRow
              icon="male-female-outline"
              label="Gender"
              value={getGenderDisplay()}
              onPress={() => handleNavigate('/settings/edit-gender')}
            />
            <SettingsRow
              icon="notifications-outline"
              label="Notifications"
              onPress={() => handleNavigate('/settings/notifications')}
            />
            <SettingsRow
              icon="apps-outline"
              label="Widget"
              onPress={() => handleNavigate('/settings/widget')}
            />
            <SettingsRow
              icon="card-outline"
              label="Manage subscription"
              onPress={handleManageSubscription}
            />
            <SettingsRow
              icon="chatbubble-outline"
              label="Make a feedback"
              onPress={() => handleNavigate('/settings/feedback')}
              showDivider={false}
            />
          </View>
        </View>

        {/* Legal Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Legal</Text>
          <View style={styles.settingsCard}>
            <SettingsRow
              icon="shield-outline"
              label="Privacy Policy"
              onPress={() => handleOpenURL('https://app-glow.vercel.app/privacy')}
            />
            <SettingsRow
              icon="document-text-outline"
              label="Terms of Use"
              onPress={() => handleOpenURL('https://app-glow.vercel.app/terms')}
              showDivider={false}
            />
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background.default,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 16,
    backgroundColor: Colors.background.default,
  },
  headerButton: {
    minWidth: 80,
  },
  mascotWrapper: {
    alignItems: 'center',
    marginBottom: 20,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    ...Typography.h3,
    marginBottom: 16,
  },
  pageTitle: {
    ...Typography.h1,
    textAlign: 'center',
    marginTop: 16,
    marginBottom: 8,
  },
  settingsCard: {
    backgroundColor: Colors.background.primary,
    borderRadius: 12,
    overflow: 'hidden',
  },
  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  settingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  settingLabel: {
    ...Typography.body,
    color: Colors.text.primary,
  },
  settingRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  settingValue: {
    ...Typography.body,
    color: Colors.text.secondary,
  },
  divider: {
    height: 1,
    backgroundColor: Colors.border.light,
    marginLeft: 16,
  },
});
