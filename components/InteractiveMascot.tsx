import * as Haptics from 'expo-haptics';
import React, { useEffect, useRef } from 'react';
import { Animated, Image, StyleSheet, TouchableOpacity, ViewStyle } from 'react-native';

interface InteractiveMascotProps {
  size?: number;
  onPress?: () => void;
  style?: ViewStyle;
  baseRotation?: string;
  isReading?: boolean;
}

export function InteractiveMascot({ size = 200, onPress, style, baseRotation = '0deg', isReading = false }: InteractiveMascotProps) {
  // Continuous gentle animations
  const breathingScale = useRef(new Animated.Value(0)).current;
  const breathingY = useRef(new Animated.Value(0)).current;
  const floatingY = useRef(new Animated.Value(0)).current;
  const swayX = useRef(new Animated.Value(0)).current;

  // Interaction animation
  const bounceScale = useRef(new Animated.Value(1)).current;
  const bounceRotate = useRef(new Animated.Value(0)).current;

  // Glasses fade animation
  const glassesOpacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    startContinuousAnimation();
  }, []);

  // Animate glasses fade when isReading changes
  useEffect(() => {
    Animated.timing(glassesOpacity, {
      toValue: isReading ? 1 : 0,
      duration: 300,
      useNativeDriver: true,
    }).start();
  }, [isReading]);

  const startContinuousAnimation = () => {
    // Breathing effect - smooth looped animation with scale
    const breathing = Animated.loop(
      Animated.timing(breathingScale, {
        toValue: 1,
        duration: 5000,
        useNativeDriver: true,
      })
    );

    // Breathing movement
    const breathingMovement = Animated.loop(
      Animated.timing(breathingY, {
        toValue: 1,
        duration: 5000,
        useNativeDriver: true,
      })
    );

    // Floating effect
    const floating = Animated.loop(
      Animated.timing(floatingY, {
        toValue: 1,
        duration: 6000,
        useNativeDriver: true,
      })
    );

    // Swaying effect
    const swaying = Animated.loop(
      Animated.timing(swayX, {
        toValue: 1,
        duration: 8000,
        useNativeDriver: true,
      })
    );

    // Start all continuous animations
    Animated.parallel([breathing, breathingMovement, floating, swaying]).start();
  };

  const handlePress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    // Cute bounce animation
    Animated.sequence([
      Animated.parallel([
        Animated.spring(bounceScale, {
          toValue: 1.5,
          useNativeDriver: true,
          bounciness: 20,
          speed: 15,
        }),
        Animated.spring(bounceRotate, {
          toValue: 1,
          useNativeDriver: true,
          bounciness: 15,
          speed: 12,
        }),
      ]),
      Animated.parallel([
        Animated.spring(bounceScale, {
          toValue: 1,
          useNativeDriver: true,
          bounciness: 15,
          speed: 10,
        }),
        Animated.spring(bounceRotate, {
          toValue: 0,
          useNativeDriver: true,
          bounciness: 12,
          speed: 8,
        }),
      ]),
    ]).start();

    onPress?.();
  };

  return (
    <TouchableOpacity
      onPress={handlePress}
      activeOpacity={0.8}
      style={[styles.container, style]}
    >
      <Animated.View
        style={[
          {
            width: size,
            height: size,
            transform: [
              {
                translateY: Animated.add(
                  floatingY.interpolate({
                    inputRange: [0, 0.5, 1],
                    outputRange: [0, -3, 0],
                  }),
                  breathingY.interpolate({
                    inputRange: [0, 0.5, 1],
                    outputRange: [0, -1, 0],
                  })
                ),
              },
              {
                translateX: swayX.interpolate({
                  inputRange: [0, 0.25, 0.5, 0.75, 1],
                  outputRange: [0, -1.5, 0, 1.5, 0],
                }),
              },
              {
                rotate: bounceRotate.interpolate({
                  inputRange: [0, 1],
                  outputRange: [baseRotation, baseRotation], // Base rotation pointing to center, no change on bounce
                }),
              },
              {
                scale: Animated.multiply(
                  bounceScale,
                  breathingScale.interpolate({
                    inputRange: [0, 0.5, 1],
                    outputRange: [1, 1.03, 1],
                  })
                ),
              },
            ],
          },
        ]}
      >
        {/* Base mascot without glasses */}
        <Image
          source={require('../assets/images/mascot-alone.png')}
          style={styles.mascotImage}
          resizeMode="contain"
        />
        {/* Glasses overlay that fades in/out */}
        <Animated.Image
          source={require('../assets/images/mascot-alone-reading.png')}
          style={[styles.mascotImage, styles.glassesOverlay, { opacity: glassesOpacity }]}
          resizeMode="contain"
        />
      </Animated.View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  mascotImage: {
    width: '100%',
    height: '100%',
  },
  glassesOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
  },
});
