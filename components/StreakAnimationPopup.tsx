import * as Haptics from 'expo-haptics';
import React, { useEffect, useRef } from 'react';
import { Animated, Dimensions, StyleSheet } from 'react-native';
import { StreakDisplay } from './StreakDisplay';

const { width: screenWidth } = Dimensions.get('window');

interface StreakAnimationPopupProps {
  visible: boolean;
  onComplete: () => void;
}

export function StreakAnimationPopup({ visible, onComplete }: StreakAnimationPopupProps) {
  const translateY = useRef(new Animated.Value(-200)).current;
  const scale = useRef(new Animated.Value(0.8)).current;
  const opacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      // Reset values
      translateY.setValue(-200);
      scale.setValue(0.8);
      opacity.setValue(0);

      // Animate in
      Animated.parallel([
        Animated.spring(translateY, {
          toValue: 0,
          useNativeDriver: true,
          bounciness: 8,
          speed: 12,
        }),
        Animated.spring(scale, {
          toValue: 1,
          useNativeDriver: true,
          bounciness: 10,
          speed: 12,
        }),
        Animated.timing(opacity, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();

      // Trigger haptic feedback when smash animation starts (300ms delay)
      const hapticTimer = setTimeout(() => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
      }, 300);

      // Hold for 2.5 seconds, then animate out
      const timer = setTimeout(() => {
        Animated.parallel([
          Animated.timing(translateY, {
            toValue: -200,
            duration: 400,
            useNativeDriver: true,
          }),
          Animated.timing(opacity, {
            toValue: 0,
            duration: 400,
            useNativeDriver: true,
          }),
        ]).start(() => {
          onComplete();
        });
      }, 2500);

      return () => {
        clearTimeout(timer);
        clearTimeout(hapticTimer);
      };
    }
  }, [visible]);

  if (!visible) return null;

  return (
    <Animated.View
      style={[
        styles.container,
        {
          opacity,
          transform: [{ translateY }, { scale }],
        },
      ]}
      pointerEvents="none"
    >
      <StreakDisplay animateNewDay={true} />
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {    
    position: 'absolute',
    top: 60,
    left: 20,
    right: 20,
    zIndex: 100,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,    
    elevation: 10,
  },
});
