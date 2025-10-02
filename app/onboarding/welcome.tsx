import React, { useEffect, useRef } from 'react';
import { Animated, Dimensions, Image, StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { Colors } from '../../constants/Colors';
import { Typography } from '../../constants/Typography';
import { Button } from '../../components/Button';

const { height: screenHeight } = Dimensions.get('window');

export default function Welcome() {
  const router = useRouter();
  const mascotAnimation = useRef(new Animated.Value(screenHeight * 0.5)).current;
  const horizontalAnimation = useRef(new Animated.Value(0)).current;
  const rotationAnimation = useRef(new Animated.Value(0)).current;
  const scaleAnimation = useRef(new Animated.Value(1)).current;

  // Continuous gentle animations
  const breathingScale = useRef(new Animated.Value(1)).current;
  const breathingY = useRef(new Animated.Value(0)).current;
  const floatingY = useRef(new Animated.Value(0)).current;
  const swayX = useRef(new Animated.Value(0)).current;

  // Text fade-in animations
  const titleOpacity = useRef(new Animated.Value(0)).current;
  const subtitleOpacity = useRef(new Animated.Value(0)).current;
  const descriptionOpacity = useRef(new Animated.Value(0)).current;
  const buttonOpacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Start animation after component mounts
    const timer = setTimeout(() => {
      playMascotAnimation();
    }, 500); // Small delay for better effect

    return () => clearTimeout(timer);
  }, [mascotAnimation]);

  const resetMascotPosition = () => {
    mascotAnimation.setValue(screenHeight * 0.5);
    horizontalAnimation.setValue(-30);
    rotationAnimation.setValue(0);
    scaleAnimation.setValue(0.8);

    // Reset text opacity
    titleOpacity.setValue(0);
    subtitleOpacity.setValue(0);
    descriptionOpacity.setValue(0);
    buttonOpacity.setValue(0);
  };

  const startContinuousAnimation = () => {
    // Reset breathing animation values
    breathingScale.setValue(0);
    breathingY.setValue(0);

    // Breathing effect - smooth looped animation with scale and movement
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

    // Reset floating animation value
    floatingY.setValue(0);

    // Floating effect - smooth looped animation
    const floating = Animated.loop(
      Animated.timing(floatingY, {
        toValue: 1,
        duration: 6000,
        useNativeDriver: true,
      })
    );

    // Reset swaying animation value
    swayX.setValue(0);

    // Swaying effect - smooth looped animation
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

  const playMascotAnimation = () => {
    // Reset to starting position
    resetMascotPosition();

    // Start mascot entrance and title fade-in simultaneously
    Animated.parallel([
      // Mascot entrance animations
      Animated.spring(mascotAnimation, {
        toValue: 0,
        useNativeDriver: true,
        bounciness: 12,
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
      // Title fade-in simultaneously with mascot
      Animated.timing(titleOpacity, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      })
    ]).start(() => {
      // Start continuous gentle animation after entrance completes
      startContinuousAnimation();
    });

    // Start subtitle much sooner - while mascot is still animating
    setTimeout(() => {
      Animated.timing(subtitleOpacity, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }).start(() => {
        // After subtitle appears, show description
        Animated.timing(descriptionOpacity, {
          toValue: 1,
          duration: 600,
          useNativeDriver: true,
        }).start(() => {
          // After description appears, show button
          Animated.timing(buttonOpacity, {
            toValue: 1,
            duration: 600,
            useNativeDriver: true,
          }).start();
        });
      });
    }, 800); // Start subtitle 800ms after animation begins
  };

  const handleGetStarted = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.push('/onboarding/name');
  };

  return (
    <View style={styles.container}>
      {/* Top Colorful Section */}
      <View style={styles.topSection}>
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
              zIndex: 0,
            }
          ]}
        >
          <Image
            source={require('../../assets/images/mascot-alone.png')}
            style={styles.mascotImage}
            resizeMode="contain"            
          />
        </Animated.View>
      </View>

      <View style={{
        height: 1400, width: 1400, backgroundColor: Colors.background.default, zIndex: 1, borderRadius: 1000, position: "absolute", top: screenHeight * 0.5, alignSelf: "center", shadowColor: Colors.shadow.dark,
        shadowOffset: {
          width: 0,
          height: -2,
        },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 5,
      }} />

      {/* Bottom White Curved Section */}
      <View style={styles.bottomSection}>
        <View style={styles.contentContainer}>
          <Animated.Text style={[Typography.title, styles.title, { opacity: titleOpacity }]}>
            Hey, I&apos;m Glow !
          </Animated.Text>
          <Animated.Text style={[Typography.subtitle, styles.subtitle, { opacity: subtitleOpacity }]}>
            I&apos;m here to brighten your day
          </Animated.Text>
          <Animated.Text style={[Typography.description, styles.description, { opacity: descriptionOpacity }]}>
            Let&apos;s start your journey to mindfulness with gentle daily reminders that help you stay present.
          </Animated.Text>
        </View>

        <Animated.View style={[styles.buttonContainer, { opacity: buttonOpacity }]}>
          <Button
            variant="primary"
            size="large"
            onPress={handleGetStarted}
          >
            Let's get started
          </Button>
        </Animated.View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.primary,
  },
  topSection: {
    height: screenHeight * 0.6,
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  mascotContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 40
  },
  mascotImage: {
    width: screenHeight*0.35,
    height: screenHeight*0.35,
    zIndex: 0
  },
  bottomSection: {
    position: 'absolute',
    top: screenHeight * 0.55,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: Colors.background.default,
    paddingHorizontal: 24,    
    paddingBottom: 40,
    zIndex: 2
  },
  contentContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 16,
  },
  title: {
    marginBottom: 12,
    color: Colors.text.primary,
  },
  subtitle: {
    marginBottom: 20,
    color: Colors.text.secondary,
  },
  description: {
    textAlign: 'center',
    color: Colors.text.secondary,
    paddingHorizontal: 8,
  },
  buttonContainer: {
    paddingBottom: 16,
    backgroundColor: 'transparent',
  },
});