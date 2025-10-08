import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Animated, StyleSheet } from 'react-native';
import { Colors } from '../../constants/Colors';

interface LikeHeartAnimationProps {
  showLikeHeart: boolean;
  likeHeartOpacity: Animated.Value;
  likeHeartScale: Animated.Value;
  likeHeartRotationDeg: number;
}

export function LikeHeartAnimation({
  showLikeHeart,
  likeHeartOpacity,
  likeHeartScale,
  likeHeartRotationDeg,
}: LikeHeartAnimationProps) {
  if (!showLikeHeart) return null;

  return (
    <Animated.View
      style={[
        styles.likeHeartContainer,
        {
          opacity: likeHeartOpacity,
          transform: [
            { scale: likeHeartScale },
            { rotate: `${likeHeartRotationDeg}deg` },
          ],
        },
      ]}
      pointerEvents="none"
    >
      <Ionicons name="heart" size={140} color={Colors.primary} />
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  likeHeartContainer: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    marginTop: -70,
    marginLeft: -70,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 100,
  },
});