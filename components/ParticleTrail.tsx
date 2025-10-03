import React, { useEffect, useRef } from 'react';
import { Animated, StyleSheet, View } from 'react-native';
import { Colors } from '../constants/Colors';

interface Particle {
  id: string;
  x: number;
  y: number;
  delay: number;
}

interface ParticleTrailProps {
  particles: Particle[];
  onComplete?: () => void;
}

function SingleParticle({ x, y, delay, onComplete }: Particle & { onComplete?: () => void }) {
  const opacity = useRef(new Animated.Value(0)).current;
  const scale = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Start animation with delay
    const timeout = setTimeout(() => {
      Animated.parallel([
        // Fade in then out
        Animated.sequence([
          Animated.timing(opacity, {
            toValue: 1,
            duration: 200,
            useNativeDriver: true,
          }),
          Animated.timing(opacity, {
            toValue: 0,
            duration: 600,
            useNativeDriver: true,
          }),
        ]),
        // Scale up
        Animated.timing(scale, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true,
        }),
        // Float up slightly
        Animated.timing(translateY, {
          toValue: -20,
          duration: 800,
          useNativeDriver: true,
        }),
      ]).start(() => {
        onComplete?.();
      });
    }, delay);

    return () => clearTimeout(timeout);
  }, []);

  return (
    <Animated.View
      style={[
        styles.particle,
        {
          left: x,
          top: y,
          opacity,
          transform: [
            { scale },
            { translateY },
          ],
        },
      ]}
    />
  );
}

export function ParticleTrail({ particles, onComplete }: ParticleTrailProps) {
  const completedCount = useRef(0);

  const handleParticleComplete = () => {
    completedCount.current += 1;
    if (completedCount.current === particles.length) {
      onComplete?.();
    }
  };

  return (
    <View style={styles.container} pointerEvents="none">
      {particles.map((particle) => (
        <SingleParticle
          key={particle.id}
          {...particle}
          onComplete={handleParticleComplete}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 5,
  },
  particle: {
    position: 'absolute',
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.primary,
    shadowColor: Colors.primary,
    shadowOffset: {
      width: 0,
      height: 0,
    },
    shadowOpacity: 0.8,
    shadowRadius: 4,
    elevation: 5,
  },
});
