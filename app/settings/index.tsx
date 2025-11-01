import { Ionicons } from '@expo/vector-icons';
import * as Clipboard from 'expo-clipboard';
import * as Haptics from 'expo-haptics';
import { useRouter } from 'expo-router';
import React from 'react';
import { Alert, Linking, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AnimatedMascot } from '../../components/AnimatedMascot';
import { StreakDisplay } from '../../components/StreakDisplay';
import { useColors } from '../../constants/Colors';
import { Typography } from '../../constants/Typography';
import { useOnboarding } from '../../contexts/OnboardingContext';
import { usePremium } from '../../contexts/PremiumContext';
import { useTheme } from '../../contexts/ThemeContext';

interface SettingsRowProps {
  label: string;
  value?: string;
  icon: keyof typeof Ionicons.glyphMap;
  onPress: () => void;
  showDivider?: boolean;
}

function SettingsRow({ label, value, icon, onPress, showDivider = true }: SettingsRowProps) {
  const Colors = useColors();

  const rowStyles = StyleSheet.create({
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

  return (
    <>
      <TouchableOpacity
        style={rowStyles.settingRow}
        onPress={onPress}
        activeOpacity={0.7}
      >
        <View style={rowStyles.settingLeft}>
          <Ionicons name={icon} size={20} color={Colors.secondary} />
          <Text style={rowStyles.settingLabel}>{label}</Text>
        </View>
        <View style={rowStyles.settingRight}>
          {value && <Text style={rowStyles.settingValue}>{value}</Text>}
          <Ionicons name="chevron-forward" size={20} color={Colors.text.light} />
        </View>
      </TouchableOpacity>
      {showDivider && <View style={rowStyles.divider} />}
    </>
  );
}

export default function SettingsIndex() {
  const Colors = useColors();

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
    color: Colors.text.primary,
    marginBottom: 16,
  },
  pageTitle: {
    ...Typography.h1,
    color: Colors.text.primary,
    textAlign: 'center',
    marginTop: 16,
    marginBottom: 8,
  },
  settingsCard: {
    backgroundColor: Colors.background.primary,
    borderRadius: 12,
    overflow: 'hidden',
  },
  userIdContainer: {
    marginTop: 12,
    paddingVertical: 8,
    alignItems: 'center',
  },
  userIdText: {
    ...Typography.body,
    fontSize: 11,
    color: Colors.text.light,
    fontFamily: 'monospace',
    letterSpacing: 0.5,
  },
});

  const router = useRouter();
  const { onboardingData } = useOnboarding();
  const { customerInfo } = usePremium();
  const { themeMode } = useTheme();

  const handleClose = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.back();
  };

  const handleCopyUserId = async () => {
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      const userId = getCleanUserId();
      if (userId) {
        await Clipboard.setStringAsync(userId);
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        Alert.alert('Copied!', 'User ID copied to clipboard.');
      }
    } catch (error) {
      console.error('Error copying user ID:', error);
      Alert.alert('Error', 'Failed to copy user ID. Please try again.');
    }
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

  const getCleanUserId = () => {
    const userId = customerInfo?.originalAppUserId;
    if (!userId) return null;
    return userId.replace('$RCAnonymousID:', '');
  };

  const getThemeDisplay = () => {
    switch (themeMode) {
      case 'system':
        return 'System';
      case 'light':
        return 'Light';
      case 'dark':
        return 'Dark';
      default:
        return 'System';
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
              icon="contrast-outline"
              label="Theme"
              value={getThemeDisplay()}
              onPress={() => handleNavigate('/settings/theme')}
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

          {/* User ID */}
          {getCleanUserId() && (
            <TouchableOpacity
              onPress={handleCopyUserId}
              activeOpacity={0.7}
              style={styles.userIdContainer}
            >
              <Text style={styles.userIdText}>{getCleanUserId()}</Text>
            </TouchableOpacity>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
