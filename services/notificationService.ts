import * as Notifications from 'expo-notifications';

// Configure notification behavior
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

export class NotificationService {
  private static readonly NOTIFICATION_MESSAGES = [
    "Time for a mindful moment! 🌟",
    "Remember to take a deep breath 💫",
    "You're doing great today! ✨",
    "Take a moment to appreciate yourself 🌸",
    "A gentle reminder to stay present 🌿",
    "You matter and your efforts count 💝",
    "Time to pause and reflect 🌙",
    "Sending you positive vibes! ☀️",
    "Remember to be kind to yourself 🤗",
    "Take a moment to smile 😊",
    "You're stronger than you think 💪",
    "Trust the process and keep going 🌱",
    "Your journey matters ✨",
    "Breathe in positivity, breathe out stress 🌸",
    "You are enough, just as you are 💕"
  ];

  static async requestPermissions(): Promise<boolean> {
    const { status: existingStatus } = await Notifications.getPermissionsAsync();

    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      return status === 'granted';
    }

    return true;
  }

  static async getPermissionStatus(): Promise<string> {
    const { status } = await Notifications.getPermissionsAsync();
    return status;
  }

  static async scheduleTestNotification(): Promise<void> {
    const hasPermission = await this.requestPermissions();

    if (!hasPermission) {
      throw new Error('Notification permissions not granted');
    }

    await Notifications.scheduleNotificationAsync({
      content: {
        title: "Glow App Test",
        body: "This is a test notification! 🎉",
        sound: true,
      },
      trigger: {
        seconds: 1,
      },
    });
  }

  static async scheduleDailyNotifications(notificationsPerDay: number): Promise<void> {
    const hasPermission = await this.requestPermissions();

    if (!hasPermission) {
      throw new Error('Notification permissions not granted');
    }

    // Cancel all existing notifications first
    await Notifications.cancelAllScheduledNotificationsAsync();

    if (notificationsPerDay === 0) {
      return;
    }

    // Define active hours (6 AM to 10 PM)
    const startHour = 6;
    const endHour = 22;
    const totalHours = endHour - startHour;
    const intervalHours = totalHours / notificationsPerDay;

    // Schedule notifications
    for (let i = 0; i < notificationsPerDay; i++) {
      // Calculate time for this notification
      const baseHour = startHour + (intervalHours * i);
      const hour = Math.floor(baseHour);
      const minute = Math.floor((baseHour - hour) * 60);

      // Add some randomness (±15 minutes)
      const randomOffset = Math.floor(Math.random() * 31) - 15; // -15 to +15 minutes
      let finalMinute = minute + randomOffset;
      let finalHour = hour;

      // Handle minute overflow/underflow
      if (finalMinute >= 60) {
        finalHour += 1;
        finalMinute -= 60;
      } else if (finalMinute < 0) {
        finalHour -= 1;
        finalMinute += 60;
      }

      // Ensure we stay within bounds
      if (finalHour < startHour) {
        finalHour = startHour;
        finalMinute = 0;
      } else if (finalHour >= endHour) {
        finalHour = endHour - 1;
        finalMinute = 59;
      }

      // Get random message
      const message = this.NOTIFICATION_MESSAGES[
        Math.floor(Math.random() * this.NOTIFICATION_MESSAGES.length)
      ];

      await Notifications.scheduleNotificationAsync({
        content: {
          title: "Glow App",
          body: message,
          sound: true,
        },
        trigger: {
          hour: finalHour,
          minute: finalMinute,
          repeats: true,
        },
      });
    }
  }

  static async cancelAllNotifications(): Promise<void> {
    await Notifications.cancelAllScheduledNotificationsAsync();
  }

  static async getScheduledNotifications(): Promise<Notifications.NotificationRequest[]> {
    return await Notifications.getAllScheduledNotificationsAsync();
  }

  static getRandomMessage(): string {
    return this.NOTIFICATION_MESSAGES[
      Math.floor(Math.random() * this.NOTIFICATION_MESSAGES.length)
    ];
  }
}