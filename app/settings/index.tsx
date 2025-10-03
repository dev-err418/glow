import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { Alert, Linking, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import RevenueCatUI from 'react-native-purchases-ui';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AnimatedMascot } from '../../components/AnimatedMascot';
import { StreakDisplay } from '../../components/StreakDisplay';
import { Colors } from '../../constants/Colors';
import { Typography } from '../../constants/Typography';
import { useOnboarding } from '../../contexts/OnboardingContext';
import { useNotifications } from '../../contexts/NotificationContext';
import { useCategories } from '../../contexts/CategoriesContext';

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
  const { getAllScheduledNotifications, cancelAllNotifications, scheduleNotifications } = useNotifications();
  const { selectedCategories } = useCategories();
  const [showDebugInfo, setShowDebugInfo] = useState(false);
  const [debugNotifications, setDebugNotifications] = useState<any[]>([]);

  const handleClose = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.back();
  };

  const handleNavigate = (path: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.push(path as any);
  };

  const handleManageSubscription = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    try {
      await RevenueCatUI.presentCustomerCenter();
    } catch (error) {
      console.error('Error showing customer center:', error);
    }
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

  const handleViewNotifications = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    try {
      const notifications = await getAllScheduledNotifications();
      setDebugNotifications(notifications);
      setShowDebugInfo(!showDebugInfo);
    } catch (error) {
      console.error('Error fetching notifications:', error);
      Alert.alert('Error', 'Failed to fetch scheduled notifications');
    }
  };

  const handleClearAndReschedule = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    Alert.alert(
      'Clear & Reschedule Notifications',
      'This will cancel all existing notifications and create fresh ones based on your current settings. Continue?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Clear & Reschedule',
          style: 'destructive',
          onPress: async () => {
            try {
              await cancelAllNotifications();
              await scheduleNotifications(selectedCategories);
              Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
              Alert.alert('Success', 'Notifications have been rescheduled!');
              // Refresh the list
              const notifications = await getAllScheduledNotifications();
              setDebugNotifications(notifications);
            } catch (error) {
              console.error('Error rescheduling notifications:', error);
              Alert.alert('Error', 'Failed to reschedule notifications');
            }
          },
        },
      ]
    );
  };

  const formatTriggerTime = (trigger: any): string => {
    if (trigger.type === 'date') {
      const date = new Date(trigger.value);
      const now = new Date();

      // Calculate time difference
      const diffMs = date.getTime() - now.getTime();
      const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
      const diffDays = Math.floor(diffHours / 24);

      // Format the date with day of week
      const formattedDate = date.toLocaleString('en-US', {
        weekday: 'short',
        month: 'short',
        day: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
        hour12: true,
      });

      // Add relative time
      let relativeTime = '';
      if (diffHours < 1) {
        const diffMinutes = Math.floor(diffMs / (1000 * 60));
        relativeTime = ` (in ${diffMinutes}m)`;
      } else if (diffHours < 24) {
        relativeTime = ` (in ${diffHours}h)`;
      } else if (diffDays === 1) {
        relativeTime = ' (tomorrow)';
      } else if (diffDays < 7) {
        relativeTime = ` (in ${diffDays}d)`;
      }

      return formattedDate + relativeTime;
    } else if (trigger.type === 'daily' || trigger.type === 'timeInterval') {
      if (trigger.hour !== undefined && trigger.minute !== undefined) {
        // Calculate next occurrence
        const now = new Date();
        const nextOccurrence = new Date();
        nextOccurrence.setHours(trigger.hour, trigger.minute, 0, 0);

        // If time has passed today, set to tomorrow
        if (nextOccurrence <= now) {
          nextOccurrence.setDate(nextOccurrence.getDate() + 1);
        }

        const formattedTime = nextOccurrence.toLocaleString('en-US', {
          weekday: 'short',
          month: 'short',
          day: 'numeric',
          hour: 'numeric',
          minute: '2-digit',
          hour12: true,
        });

        return `${formattedTime} (repeats daily)`;
      }
      return 'Repeating';
    }
    return 'Unknown trigger';
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
              onPress={() => handleOpenURL('https://yourapp.com/privacy')}
            />
            <SettingsRow
              icon="document-text-outline"
              label="Terms of Use"
              onPress={() => handleOpenURL('https://yourapp.com/terms')}
              showDivider={false}
            />
          </View>
        </View>

        {/* Debug Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Debug</Text>
          <View style={styles.settingsCard}>
            <TouchableOpacity
              style={styles.settingRow}
              onPress={handleViewNotifications}
              activeOpacity={0.7}
            >
              <View style={styles.settingLeft}>
                <Ionicons name="bug-outline" size={20} color={Colors.secondary} />
                <Text style={styles.settingLabel}>View Notifications</Text>
              </View>
              <View style={styles.settingRight}>
                <Text style={styles.settingValue}>{debugNotifications.length} scheduled</Text>
                <Ionicons
                  name={showDebugInfo ? "chevron-up" : "chevron-down"}
                  size={20}
                  color={Colors.text.light}
                />
              </View>
            </TouchableOpacity>

            {/* Debug Info - Expandable */}
            {showDebugInfo && (
              <View style={styles.debugContainer}>
                {debugNotifications.length === 0 ? (
                  <Text style={styles.debugEmptyText}>No notifications scheduled</Text>
                ) : (
                  <>
                    <ScrollView style={styles.notificationsList} nestedScrollEnabled>
                      {debugNotifications.map((notif, index) => (
                        <View key={notif.identifier || index} style={styles.notificationItem}>
                          <View style={styles.notificationHeader}>
                            <Text style={styles.notificationTitle}>
                              {notif.content.title || 'No Title'}
                            </Text>
                            <Text style={styles.notificationTime}>
                              {formatTriggerTime(notif.trigger)}
                            </Text>
                          </View>
                          <Text style={styles.notificationBody} numberOfLines={2}>
                            {notif.content.body}
                          </Text>
                          <Text style={styles.notificationId}>ID: {notif.identifier}</Text>
                        </View>
                      ))}
                    </ScrollView>
                    <TouchableOpacity
                      style={styles.clearButton}
                      onPress={handleClearAndReschedule}
                      activeOpacity={0.7}
                    >
                      <Ionicons name="refresh-outline" size={20} color={Colors.text.white} />
                      <Text style={styles.clearButtonText}>Clear & Reschedule</Text>
                    </TouchableOpacity>
                  </>
                )}
              </View>
            )}
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
    fontWeight: '600',
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
  debugContainer: {
    paddingHorizontal: 16,
    paddingBottom: 16,
    backgroundColor: Colors.background.secondary,
  },
  debugEmptyText: {
    ...Typography.body,
    color: Colors.text.secondary,
    textAlign: 'center',
    paddingVertical: 20,
  },
  notificationsList: {
    maxHeight: 300,
    marginTop: 12,
  },
  notificationItem: {
    backgroundColor: Colors.background.primary,
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
    borderLeftWidth: 3,
    borderLeftColor: Colors.primary,
  },
  notificationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 6,
  },
  notificationTitle: {
    ...Typography.body,
    fontWeight: '600',
    color: Colors.text.primary,
    flex: 1,
    marginRight: 8,
  },
  notificationTime: {
    ...Typography.body,
    fontSize: 12,
    color: Colors.primary,
    fontWeight: '500',
  },
  notificationBody: {
    ...Typography.body,
    fontSize: 13,
    color: Colors.text.secondary,
    marginBottom: 6,
    lineHeight: 18,
  },
  notificationId: {
    ...Typography.body,
    fontSize: 10,
    color: Colors.text.light,
    fontFamily: 'monospace',
  },
  clearButton: {
    backgroundColor: Colors.primary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 10,
    marginTop: 16,
    gap: 8,
  },
  clearButtonText: {
    ...Typography.button,
    color: Colors.text.white,
    fontSize: 16,
    fontWeight: '600',
  },
});
