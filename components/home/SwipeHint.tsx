import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Animated, StyleSheet, Text } from 'react-native';
import { useColors } from '../../constants/Colors';
import { Typography } from '../../constants/Typography';

interface SwipeHintProps {
  showSwipeHint: boolean;
  hintOpacity: Animated.Value;
  hintTranslateY: Animated.Value;
  hasCompletedFirstSwipe: boolean;
}

export function SwipeHint({
  showSwipeHint,
  hintOpacity,
  hintTranslateY,
  hasCompletedFirstSwipe,
}: SwipeHintProps) {
  const Colors = useColors();

  if (!showSwipeHint) return null;

  const styles = StyleSheet.create({
    swipeHintContainer: {
      position: 'absolute',
      bottom: 60,
      alignSelf: 'center',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 5,
    },
    swipeHintText: {
      ...Typography.body,
      color: Colors.text.secondary,
      fontSize: 16,
      marginTop: 8,
      textAlign: 'center',
    },
  });

  return (
    <Animated.View
      style={[
        styles.swipeHintContainer,
        {
          opacity: hintOpacity,
          transform: [{ translateY: hintTranslateY }],
        },
      ]}
      pointerEvents="none"
    >
      <Ionicons
        name="chevron-up"
        size={40}
        color={!hasCompletedFirstSwipe ? Colors.primary : Colors.text.secondary}
      />
      <Text
        style={[
          styles.swipeHintText,
          {
            color: !hasCompletedFirstSwipe ? Colors.primary : Colors.text.secondary,
            fontWeight: !hasCompletedFirstSwipe ? 'bold' : '400',
          },
        ]}
      >
        Swipe up for next quote
      </Text>
    </Animated.View>
  );
}