import React from 'react';
import { Animated, StyleSheet } from 'react-native';
import { InteractiveMascot } from '../InteractiveMascot';
import { ParticleTrail } from '../ParticleTrail';

export interface Particle {
  id: string;
  x: number;
  y: number;
  delay: number;
}

interface MascotSectionProps {
  uiOpacity: Animated.Value;
  mascotLeft: Animated.Value;
  mascotBottom: Animated.Value;
  mascotSize: number;
  isMascotVisible: boolean;
  rotationVisible: string;
  rotationHidden: string;
  particles: Particle[];
  onMascotPress: () => void;
  onParticlesComplete: () => void;
}

export function MascotSection({
  uiOpacity,
  mascotLeft,
  mascotBottom,
  mascotSize,
  isMascotVisible,
  rotationVisible,
  rotationHidden,
  particles,
  onMascotPress,
  onParticlesComplete,
}: MascotSectionProps) {
  return (
    <>
      {/* Particle Trail */}
      {particles.length > 0 && (
        <ParticleTrail particles={particles} onComplete={onParticlesComplete} />
      )}

      {/* Interactive Mascot */}
      <Animated.View style={{ opacity: uiOpacity }} pointerEvents="box-none">
        <Animated.View
          style={[
            styles.mascotContainer,
            {
              left: mascotLeft,
              bottom: mascotBottom,
            },
          ]}
          pointerEvents="box-none"
        >
          <InteractiveMascot
            size={mascotSize}
            onPress={onMascotPress}
            baseRotation={isMascotVisible ? rotationVisible : rotationHidden}
            isReading={isMascotVisible}
          />
        </Animated.View>
      </Animated.View>
    </>
  );
}

const styles = StyleSheet.create({
  mascotContainer: {
    position: 'absolute',
    zIndex: 10,
  },
});