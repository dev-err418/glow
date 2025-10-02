import * as Haptics from 'expo-haptics';
import { useNavigation, useRouter } from 'expo-router';
import React, { useLayoutEffect } from 'react';
import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Button } from '../../components/Button';
import { Colors } from '../../constants/Colors';
import { Typography } from '../../constants/Typography';

export default function WidgetScreen() {
  const router = useRouter();
  const navigation = useNavigation();

  const handleInstallWidget = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    router.push('/onboarding/premium');
  };

  const handleSkip = () => {
    router.push('/onboarding/premium');
  };

  useLayoutEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <TouchableOpacity onPress={handleSkip} style={{ marginHorizontal: 4 }}>
          <Text style={{ color: Colors.text.secondary, fontSize: 16 }}>
            Skip
          </Text>
        </TouchableOpacity>
      ),
    });
  }, [navigation]);

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <View style={styles.mascotContainer}>
          <Image
            source={require('../../assets/images/mascot-alone.png')}
            style={styles.mascot}
            resizeMode="contain"
          />
        </View>

        <Text style={styles.title}>
          Add a widget to your home screen
        </Text>
        <Text style={styles.subtitle}>
          Keep your affirmations visible throughout the day with our beautiful home screen widgets
        </Text>

        {/* Phone Illustration */}
        <View style={styles.phoneFrame}>
          <View style={styles.phoneContent}>
            {/* Notch */}
            <View style={styles.notch} />

            {/* Widget Card */}
            <View style={styles.widgetCardShadow}>
              <View style={styles.widgetCard}>
                <Text style={styles.widgetText}>Your light matters</Text>
                <Image
                  source={require('../../assets/images/mascot-alone.png')}
                  style={styles.widgetMascot}
                  resizeMode="contain"
                />
              </View>
            </View>

            {/* App Icons */}
            <View style={styles.iconsContainer}>
              <View style={styles.iconRow}>
                <View style={styles.appIcon} />
                <View style={styles.appIcon} />
                <View style={styles.appIcon} />
                <View style={styles.appIcon} />
              </View>
              <View style={styles.iconRow}>
                <View style={styles.appIcon} />
                <View style={styles.appIcon} />
                <View style={styles.appIcon} />
                <View style={styles.appIcon} />
              </View>
            </View>
          </View>
        </View>
      </View>

      <View style={styles.buttonContainer}>
        <Button
          variant="primary"
          size="large"
          onPress={handleInstallWidget}
          style={styles.button}
        >
          Install widget
        </Button>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background.default,
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 40,
    alignItems: 'center',
  },
  mascotContainer: {
    marginBottom: 30,
  },
  mascot: {
    width: 120,
    height: 120,
  },
  title: {
    ...Typography.h2,
    textAlign: 'center',
    marginBottom: 12,
  },
  subtitle: {
    ...Typography.subtitle,
    textAlign: 'center',
    marginBottom: 40,
    color: Colors.text.secondary,
  },
  phoneFrame: {
    width: '90%',
    aspectRatio: 0.68,
    borderRadius: 44,
    borderWidth: 8,
    borderColor: '#E8E3DD',
    overflow: 'hidden',
    shadowColor: Colors.shadow.light,
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
    position: 'relative',
  },
  phoneContent: {
    flex: 1,
    padding: 20,
  },
  notch: {
    width: 80,
    height: 24,
    backgroundColor: '#E8E3DD',
    borderRadius: 20,
    alignSelf: 'center',
    marginBottom: 20,
  },
  widgetCardShadow: {
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: {
      width: 4,
      height: 4,
    },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 6,
    borderRadius: 20,
  },
  widgetCard: {
    backgroundColor: '#F9F6F3',
    borderRadius: 20,
    padding: 24,
    borderWidth: 2,
    borderColor: '#E8E3DD',
    overflow: 'hidden',
    position: 'relative',
  },
  widgetText: {
    ...Typography.h3,
    fontSize: 20,
    textAlign: 'center',
    color: Colors.text.primary,
  },
  widgetMascot: {
    position: 'absolute',
    bottom: -20,
    left: -10,
    width: 70,
    height: 70,
    transform: [{ rotate: '-15deg' }],
  },
  iconsContainer: {
    gap: 16,
  },
  iconRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 16,
  },
  appIcon: {
    width: 50,
    height: 50,
    backgroundColor: '#E8E3DD',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#DDD8D2',
  },
  buttonContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 24,
  },
  button: {
    width: '100%',
  },
});
