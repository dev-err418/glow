import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useEffect, useRef } from 'react';
import { Animated, Dimensions, Image, StyleSheet, Text, View } from 'react-native';
import * as Haptics from 'expo-haptics';
import { Button } from '../../components/Button';
import { Colors } from '../../constants/Colors';
import { Typography } from '../../constants/Typography';

const { height: screenHeight, width: screenWidth } = Dimensions.get('window');

export default function StreakIntroScreen() {
  const router = useRouter();

  // Entrance animations
  const mascotAnimation = useRef(new Animated.Value(screenHeight * 0.2)).current;
  const horizontalAnimation = useRef(new Animated.Value(-screenWidth)).current;
  const rotationAnimation = useRef(new Animated.Value(0)).current;
  const scaleAnimation = useRef(new Animated.Value(0.8)).current;

  // Continuous gentle animations
  const breathingScale = useRef(new Animated.Value(1)).current;
  const breathingY = useRef(new Animated.Value(0)).current;
  const floatingY = useRef(new Animated.Value(0)).current;
  const swayX = useRef(new Animated.Value(0)).current;

  // Checkmark smash animation
  const checkmarkScale = useRef(new Animated.Value(0)).current;
  const dayBoxScale = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const timer = setTimeout(() => {
      playMascotAnimation();
      playCheckmarkSmashAnimation();
    }, 500);

    return () => {
      clearTimeout(timer);
    };
  }, []);

  const resetMascotPosition = () => {
    mascotAnimation.setValue(screenHeight * 0.2);
    horizontalAnimation.setValue(-screenWidth);
    rotationAnimation.setValue(0);
    scaleAnimation.setValue(0.8);
  };

  const startContinuousAnimation = () => {
    breathingScale.setValue(0);
    breathingY.setValue(0);

    const breathing = Animated.loop(
      Animated.timing(breathingScale, {
        toValue: 1,
        duration: 5000,
        useNativeDriver: true,
      })
    );

    const breathingMovement = Animated.loop(
      Animated.timing(breathingY, {
        toValue: 1,
        duration: 5000,
        useNativeDriver: true,
      })
    );

    floatingY.setValue(0);
    const floating = Animated.loop(
      Animated.timing(floatingY, {
        toValue: 1,
        duration: 6000,
        useNativeDriver: true,
      })
    );

    swayX.setValue(0);
    const swaying = Animated.loop(
      Animated.timing(swayX, {
        toValue: 1,
        duration: 8000,
        useNativeDriver: true,
      })
    );

    Animated.parallel([breathing, breathingMovement, floating, swaying]).start();
  };

  const playMascotAnimation = () => {
    resetMascotPosition();

    Animated.parallel([
      Animated.spring(mascotAnimation, {
        toValue: 0,
        useNativeDriver: true,
        bounciness: 8,
        speed: 2,
      }),
      Animated.spring(horizontalAnimation, {
        toValue: 0,
        useNativeDriver: true,
        bounciness: 10,
        speed: 2.5,
      }),
      Animated.spring(rotationAnimation, {
        toValue: 1,
        useNativeDriver: true,
        bounciness: 8,
        speed: 3,
      }),
      Animated.spring(scaleAnimation, {
        toValue: 1,
        useNativeDriver: true,
        bounciness: 15,
        speed: 2,
      }),
    ]).start(() => {
      startContinuousAnimation();
    });
  };

  const playCheckmarkSmashAnimation = () => {
    // Reset scales
    checkmarkScale.setValue(0);
    dayBoxScale.setValue(0);

    // Delay slightly to let mascot settle, then smash in
    setTimeout(() => {
      // Trigger haptic feedback
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);

      // Animate both together with high tension for smash effect
      Animated.parallel([
        Animated.spring(checkmarkScale, {
          toValue: 1,
          useNativeDriver: true,
          tension: 100,
          friction: 5,
          overshootClamping: false,
        }),
        Animated.spring(dayBoxScale, {
          toValue: 1,
          useNativeDriver: true,
          tension: 100,
          friction: 5,
          overshootClamping: false,
        }),
      ]).start();
    }, 300);
  };

  const handleContinue = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    router.push('/onboarding/streak-goal');
  };

  // Get current day of week (0=Sunday, 1=Monday, etc.)
  // Convert to array index where Monday=0, Sunday=6
  const today = new Date().getDay();
  const todayIndex = (today + 6) % 7;

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        {/* Animated Mascot */}
        <Animated.View
          style={[
            styles.mascotContainer,
            {
              transform: [
                {
                  translateY: Animated.add(
                    Animated.add(
                      mascotAnimation,
                      floatingY.interpolate({
                        inputRange: [0, 0.5, 1],
                        outputRange: [0, -4, 0]
                      })
                    ),
                    breathingY.interpolate({
                      inputRange: [0, 0.5, 1],
                      outputRange: [0, -1.5, 0]
                    })
                  )
                },
                {
                  translateX: Animated.add(
                    horizontalAnimation,
                    swayX.interpolate({
                      inputRange: [0, 0.25, 0.5, 0.75, 1],
                      outputRange: [0, -2, 0, 2, 0]
                    })
                  )
                },
                {
                  rotate: rotationAnimation.interpolate({
                    inputRange: [0, 1],
                    outputRange: ['0deg', '10deg']
                  })
                },
                {
                  scale: Animated.multiply(
                    scaleAnimation,
                    breathingScale.interpolate({
                      inputRange: [0, 0.5, 1],
                      outputRange: [1, 1.04, 1]
                    })
                  )
                }
              ],
            }
          ]}
        >
          <Image
            source={require('../../assets/images/mascot-alone.png')}
            style={styles.mascotImage}
            resizeMode="contain"
          />
        </Animated.View>

        <Text style={styles.title}>
          Build your daily habit
        </Text>
        <Text style={styles.subtitle}>
          Every streak starts with day 1, today is yours.
        </Text>

        {/* Weekly Calendar with Checkmarks */}
        <View style={styles.calendarCard}>
          <View style={styles.calendarContainer}>
            {['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su'].map((day, index) => (
              <View key={index} style={styles.dayColumn}>
                <Text style={[styles.dayLabel, index === todayIndex && styles.dayLabelActive]}>{day}</Text>
                {index === todayIndex ? (
                  <Animated.View
                    style={[
                      styles.dayBox,
                      styles.dayBoxActive,
                      { transform: [{ scale: dayBoxScale }] }
                    ]}
                  >
                    <Animated.View style={{ transform: [{ scale: checkmarkScale }] }}>
                      <Ionicons
                        name="checkmark"
                        size={24}
                        color={Colors.background.primary}
                      />
                    </Animated.View>
                  </Animated.View>
                ) : (
                  <View style={styles.dayBox} />
                )}
              </View>
            ))}
          </View>

          <Text style={styles.calendarText}>
            Start small and stay consistent
          </Text>
        </View>

        <View style={styles.statContainer}>
          <Text style={styles.statEmoji}>🔥</Text>
          <Text style={styles.statText}>
            87% of users reach their 7-day goal
          </Text>
        </View>
      </View>

      <View style={styles.buttonContainer}>
        <Button
          variant="primary"
          size="large"
          onPress={handleContinue}
          style={styles.button}
        >
          Next
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
    justifyContent: 'center',
    alignItems: 'center',
  },
  mascotImage: {
    width: 150,
    height: 150,
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
  calendarCard: {
    backgroundColor: Colors.background.primary,
    borderRadius: 20,
    paddingHorizontal: 20,
    paddingVertical: 20,
    shadowColor: Colors.shadow.light,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
    marginBottom: 40,
    width: '100%',
  },
  calendarContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
    marginBottom: 16,
  },
  dayColumn: {
    alignItems: 'center',
    gap: 8,
  },
  dayLabel: {
    ...Typography.bodySmall,
    fontSize: 14,
    color: Colors.text.light,
  },
  dayLabelActive: {
    color: Colors.text.primary,
  },
  dayBox: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.background.secondary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dayBoxActive: {
    backgroundColor: Colors.primary,
    shadowColor: Colors.shadow.light,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3,
  },
  calendarText: {
    ...Typography.body,
    fontSize: 14,
    textAlign: 'center',
    color: Colors.text.secondary,
  },
  statContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.background.primary,
    borderRadius: 16,
    padding: 20,
    shadowColor: Colors.shadow.light,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  statEmoji: {
    fontSize: 32,
    marginRight: 12,
  },
  statText: {
    ...Typography.bodySmall,
    flex: 1,
    color: Colors.text.secondary,
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
