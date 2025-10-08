import { Ionicons } from '@expo/vector-icons';
import React, { useRef } from 'react';
import {
  Animated,
  Dimensions,
  StyleSheet,
  Text,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View
} from 'react-native';
import { Colors } from '../../constants/Colors';
import { Typography } from '../../constants/Typography';

const { height: screenHeight } = Dimensions.get('window');

export interface Quote {
  id: string;
  text: string;
  category: string;
}

interface QuoteCardProps {
  item: Quote;
  onLike: (quote: Quote, scaleAnim: Animated.Value) => void;
  onShare: (quote: Quote) => void;
  isFavorite: boolean;
  onTap: () => void;
}

export function QuoteCard({ item, onLike, onShare, isFavorite, onTap }: QuoteCardProps) {
  const likeScaleAnim = useRef(new Animated.Value(1)).current;
  const lastTap = useRef<number>(0);

  const handleDoubleTap = () => {
    const now = Date.now();
    const DOUBLE_TAP_DELAY = 300;

    if (now - lastTap.current < DOUBLE_TAP_DELAY) {
      // Double tap detected - like the quote
      onLike(item, likeScaleAnim);
    }
    lastTap.current = now;
  };

  return (
    <TouchableWithoutFeedback onPress={handleDoubleTap}>
      <View style={styles.quoteContainer}>
        {/* Quote Text */}
        <TouchableOpacity
          style={styles.quoteTextContainer}
          onPress={onTap}
          activeOpacity={0.7}
        >
          <Text style={styles.quoteText}>{item.text}</Text>
        </TouchableOpacity>

        {/* Action Buttons */}
        <View style={styles.actionButtonsContainer}>
          {/* Share Button (left) */}
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => onShare(item)}
            activeOpacity={0.7}
          >
            <Ionicons name="share-outline" size={36} color={Colors.text.primary} />
          </TouchableOpacity>

          {/* Like Button (right) */}
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => onLike(item, likeScaleAnim)}
            activeOpacity={0.7}
          >
            <Animated.View style={{ transform: [{ scale: likeScaleAnim }] }}>
              <Ionicons
                name={isFavorite ? 'heart' : 'heart-outline'}
                size={36}
                color={isFavorite ? Colors.primary : Colors.text.primary}
              />
            </Animated.View>
          </TouchableOpacity>
        </View>
      </View>
    </TouchableWithoutFeedback>
  );
}

const styles = StyleSheet.create({
  quoteContainer: {
    height: screenHeight,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  quoteTextContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  quoteText: {
    ...Typography.h2,
    textAlign: 'center',
    fontSize: 32,
    lineHeight: 44,
    color: Colors.text.primary,
  },
  actionButtonsContainer: {
    position: 'absolute',
    bottom: 180,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionButton: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
});