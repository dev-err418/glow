import React from 'react';
import { View, Text, StyleSheet, Switch, Alert } from 'react-native';
import { useNotifications } from '../contexts/NotificationContext';

export default function Settings() {
  const {
    notificationsPerDay,
    setNotificationsPerDay,
    notificationsEnabled,
    setNotificationsEnabled,
    permissionStatus,
    requestPermissions,
  } = useNotifications();

  const handleToggleNotifications = async (enabled: boolean) => {
    if (enabled && permissionStatus !== 'granted') {
      const granted = await requestPermissions();
      if (!granted) {
        Alert.alert(
          'Permission Required',
          'Please enable notifications in your device settings to receive daily reminders.',
          [{ text: 'OK' }]
        );
        return;
      }
    }

    setNotificationsEnabled(enabled);
  };

  const handleCountChange = (count: number) => {
    setNotificationsPerDay(count);
  };

  const renderCountButton = (count: number) => (
    <Text
      key={count}
      style={[
        styles.countButton,
        notificationsPerDay === count && styles.countButtonSelected,
      ]}
      onPress={() => handleCountChange(count)}
    >
      {count}
    </Text>
  );

  const getPermissionStatusText = () => {
    switch (permissionStatus) {
      case 'granted':
        return '✅ Granted';
      case 'denied':
        return '❌ Denied';
      case 'undetermined':
        return '❓ Not requested yet';
      default:
        return '❓ Unknown';
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Notification Settings</Text>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Permission Status</Text>
        <Text style={styles.permissionStatus}>
          {getPermissionStatusText()}
        </Text>
      </View>

      <View style={styles.section}>
        <View style={styles.row}>
          <Text style={styles.label}>Enable Notifications</Text>
          <Switch
            value={notificationsEnabled}
            onValueChange={handleToggleNotifications}
            disabled={permissionStatus === 'denied'}
          />
        </View>
        {permissionStatus === 'denied' && (
          <Text style={styles.helpText}>
            Notifications are disabled. Please enable them in your device settings.
          </Text>
        )}
      </View>

      {notificationsEnabled && permissionStatus === 'granted' && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Daily Notifications</Text>
          <Text style={styles.description}>
            How many reminders would you like to receive per day?
          </Text>

          <View style={styles.countGrid}>
            {Array.from({ length: 10 }, (_, i) => i + 1).map(renderCountButton)}
          </View>

          <Text style={styles.selectedInfo}>
            You&apos;ll receive {notificationsPerDay} notification{notificationsPerDay !== 1 ? 's' : ''} per day
            between 6 AM and 10 PM
          </Text>
        </View>
      )}

      {!notificationsEnabled && (
        <View style={styles.section}>
          <Text style={styles.helpText}>
            Enable notifications to start receiving daily mindful reminders that will help you stay present throughout your day.
          </Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 30,
    textAlign: 'center',
    color: '#333',
  },
  section: {
    marginBottom: 30,
    padding: 20,
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 10,
    color: '#333',
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  label: {
    fontSize: 16,
    color: '#333',
    flex: 1,
  },
  permissionStatus: {
    fontSize: 16,
    fontWeight: '500',
    color: '#666',
  },
  description: {
    fontSize: 14,
    color: '#666',
    marginBottom: 15,
    lineHeight: 20,
  },
  countGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: 15,
  },
  countButton: {
    backgroundColor: '#e9ecef',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    fontSize: 16,
    fontWeight: '500',
    color: '#495057',
    minWidth: 40,
    textAlign: 'center',
  },
  countButtonSelected: {
    backgroundColor: '#007AFF',
    color: '#fff',
  },
  selectedInfo: {
    fontSize: 14,
    color: '#666',
    fontStyle: 'italic',
    textAlign: 'center',
  },
  helpText: {
    fontSize: 14,
    color: '#666',
    marginTop: 8,
    lineHeight: 20,
  },
});