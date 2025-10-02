import React, { useEffect, useRef } from 'react';
import { Animated, Dimensions, Image, StyleSheet } from 'react-native';

const { height: screenHeight, width: screenWidth } = Dimensions.get('window');

export function AnimatedMascot() {
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

  useEffect(() => {
    const timer = setTimeout(() => {
      playMascotAnimation();
    }, 500);
    return () => clearTimeout(timer);
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

  return (
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
        source={require('../assets/images/mascot-alone.png')}
        style={styles.mascotImage}
        resizeMode="contain"
      />
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  mascotContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  mascotImage: {
    width: 150,
    height: 150,
  },
});
