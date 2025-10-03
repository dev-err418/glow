import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Haptics from 'expo-haptics';
import { useRouter } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Animated,
  Dimensions,
  FlatList,
  Share,
  StyleSheet,
  Text,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from 'react-native';
import { InteractiveMascot } from '../components/InteractiveMascot';
import { ParticleTrail } from '../components/ParticleTrail';
import { Colors } from '../constants/Colors';
import { Typography } from '../constants/Typography';
import { useCategories } from '../contexts/CategoriesContext';
import { useFavorites } from '../contexts/FavoritesContext';
import { useOnboarding } from '../contexts/OnboardingContext';

const { height: screenHeight, width: screenWidth } = Dimensions.get('window');

// Import quotes
const quotesData = require('../assets/data/quotes.json');

interface Quote {
  text: string;
  category: string;
}

interface Particle {
  id: string;
  x: number;
  y: number;
  delay: number;
}

// Mascot positions for toggle show/hide
const MASCOT_SIZE = 180;
const MASCOT_HIDDEN = { left: -50, bottom: -50 };      // Bottom-left corner, peeking
const MASCOT_VISIBLE = { left: -30, bottom: 250 };   // Upper-right, reading position
const ROTATION_HIDDEN = '15deg';   // Tilted right when hidden
const ROTATION_VISIBLE = '-30deg'; // Tilted left when visible

interface QuoteItemProps {
  item: Quote;
  onLike: (quote: Quote, scaleAnim: Animated.Value) => void;
  onShare: (quote: Quote) => void;
  isFavorite: boolean;
}

function QuoteItem({ item, onLike, onShare, isFavorite }: QuoteItemProps) {
  const likeScaleAnim = useRef(new Animated.Value(1)).current;
  const lastTap = useRef<number>(0);

  const handleDoubleTap = () => {
    const now = Date.now();
    const DOUBLE_TAP_DELAY = 300;

    if (now - lastTap.current < DOUBLE_TAP_DELAY) {
      // Double tap detected
      onLike(item, likeScaleAnim);
    }
    lastTap.current = now;
  };

  return (
    <TouchableWithoutFeedback onPress={handleDoubleTap}>
      <View style={styles.quoteContainer}>
        {/* Quote Text */}
        <View style={styles.quoteTextContainer}>
          <Text style={styles.quoteText}>{item.text}</Text>
        </View>

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

export default function Index() {
  const router = useRouter();
  const { onboardingData, isLoading: isOnboardingLoading } = useOnboarding();
  const { selectedCategories, isLoading: isCategoriesLoading } = useCategories();
  const { addFavorite, removeFavorite, isFavorite } = useFavorites();
  const [quotes, setQuotes] = useState<Quote[]>([]);
  const [isMascotVisible, setIsMascotVisible] = useState(false);
  const [particles, setParticles] = useState<Particle[]>([]);
  const [currentCategory, setCurrentCategory] = useState<string>('');

  // Store base pool of all available quotes
  const quotePoolRef = useRef<Quote[]>([]);

  // Animated values for mascot position (left and bottom)
  const mascotLeft = useRef(new Animated.Value(MASCOT_HIDDEN.left)).current;
  const mascotBottom = useRef(new Animated.Value(MASCOT_HIDDEN.bottom)).current;

  useEffect(() => {
    // Wait for data to load before making navigation decisions
    if (!isOnboardingLoading && !onboardingData.completed) {
      // Delay navigation to ensure Stack is mounted
      const timer = setTimeout(() => {
        router.replace('/onboarding/welcome');
      }, 100);

      return () => clearTimeout(timer);
    }
  }, [isOnboardingLoading, onboardingData.completed]);

  // Load and shuffle quotes based on selected categories
  useEffect(() => {
    if (!isCategoriesLoading && selectedCategories.length > 0) {
      initializeQuotePool();
    }
  }, [selectedCategories, isCategoriesLoading]);

  const initializeQuotePool = () => {
    const allQuotes: Quote[] = [];

    // Gather quotes from selected categories
    selectedCategories.forEach((category) => {
      const categoryQuotes = quotesData[category];
      if (categoryQuotes && Array.isArray(categoryQuotes)) {
        categoryQuotes.forEach((text: string) => {
          allQuotes.push({ text, category });
        });
      }
    });

    // Store the base pool
    quotePoolRef.current = allQuotes;

    // Initialize with 3-4 cycles of shuffled quotes for infinite scroll
    const initialQuotes: Quote[] = [];
    for (let i = 0; i < 4; i++) {
      const shuffled = [...allQuotes].sort(() => Math.random() - 0.5);
      initialQuotes.push(...shuffled);
    }
    setQuotes(initialQuotes);
  };

  const loadMoreQuotes = () => {
    // Append another shuffled cycle of quotes
    const shuffled = [...quotePoolRef.current].sort(() => Math.random() - 0.5);
    setQuotes((prev) => [...prev, ...shuffled]);
  };

  const handleResetOnboarding = async () => {
    Alert.alert(
      'Reset Onboarding',
      'Are you sure you want to reset the onboarding process? This will clear all your saved data.',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Reset',
          style: 'destructive',
          onPress: async () => {
            await AsyncStorage.removeItem('onboardingData');
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            router.replace('/onboarding/welcome');
          },
        },
      ]
    );
  };

  const handleLike = (quote: Quote, scaleAnim: Animated.Value) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    const isCurrentlyFavorite = isFavorite(quote);

    if (isCurrentlyFavorite) {
      removeFavorite(quote);
    } else {
      addFavorite(quote);
    }

    // Animate scale: scale up to 1.2, then back to 1
    Animated.sequence([
      Animated.spring(scaleAnim, {
        toValue: 1.2,
        useNativeDriver: true,
        bounciness: 15,
        speed: 20,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        useNativeDriver: true,
        bounciness: 10,
        speed: 15,
      }),
    ]).start();
  };

  const handleShare = async (quote: Quote) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    try {
      await Share.share({
        message: `"${quote.text}"\n\n— ${quote.category}`,
      });
    } catch (error) {
      console.error('Error sharing quote:', error);
    }
  };

  const handleMascotPress = () => {
    // Get current position
    const currentPos = isMascotVisible ? MASCOT_VISIBLE : MASCOT_HIDDEN;
    const currentX = currentPos.left + MASCOT_SIZE / 2;
    const currentY = screenHeight - currentPos.bottom - MASCOT_SIZE / 2;

    // Create 25 particles with staggered delays for magical burst effect
    const newParticles: Particle[] = Array.from({ length: 25 }, (_, i) => ({
      id: `${Date.now()}-${i}`,
      x: currentX + (Math.random() - 0.5) * 60,
      y: currentY + (Math.random() - 0.5) * 60,
      delay: i * 20,
    }));

    setParticles(newParticles);

    // Toggle visibility
    const newVisibility = !isMascotVisible;
    setIsMascotVisible(newVisibility);

    // Get target position
    const targetPos = newVisibility ? MASCOT_VISIBLE : MASCOT_HIDDEN;

    // Animate mascot moving to new position (both left and bottom)
    Animated.parallel([
      Animated.spring(mascotLeft, {
        toValue: targetPos.left,
        useNativeDriver: false,
        bounciness: 12,
        speed: 8,
      }),
      Animated.spring(mascotBottom, {
        toValue: targetPos.bottom,
        useNativeDriver: false,
        bounciness: 12,
        speed: 8,
      }),
    ]).start();
  };

  const renderQuote = ({ item }: { item: Quote; index: number }) => (
    <QuoteItem
      item={item}
      onLike={handleLike}
      onShare={handleShare}
      isFavorite={isFavorite(item)}
    />
  );

  const onViewableItemsChanged = useRef(({ viewableItems }: any) => {
    if (viewableItems.length > 0 && viewableItems[0].item) {
      setCurrentCategory(viewableItems[0].item.category);
    }
  }).current;

  // Show loading spinner while data is loading
  if (isOnboardingLoading || isCategoriesLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }

  // If onboarding is completed, show the TikTok-style quote feed
  if (onboardingData.completed) {
    return (
      <View style={styles.container}>
        {/* Quote Feed */}
        <FlatList
          data={quotes}
          renderItem={renderQuote}
          keyExtractor={(item, index) => `quote-${index}`}
          pagingEnabled
          snapToInterval={screenHeight}
          snapToAlignment="start"
          decelerationRate="fast"
          showsVerticalScrollIndicator={false}
          bounces={true}
          onEndReached={loadMoreQuotes}
          onEndReachedThreshold={0.5}
          onViewableItemsChanged={onViewableItemsChanged}
          viewabilityConfig={{ viewAreaCoveragePercentThreshold: 50 }}
        />

        {/* Fixed Category Badge */}
        {currentCategory && (
          <View style={styles.categoryBadge}>
            <Text style={styles.categoryBadgeText}>{currentCategory}</Text>
          </View>
        )}

        {/* Floating Browse Categories Button */}
        <TouchableOpacity
          style={styles.categoriesButton}
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
            router.push('/categories-modal');
          }}
        >
          <Ionicons name="grid" size={24} color={Colors.text.white} />
        </TouchableOpacity>

        {/* Floating Menu Button */}
        <TouchableOpacity
          style={styles.menuButton}
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            Alert.alert(
              'Menu',
              'Choose an option',
              [
                {
                  text: 'Reset Onboarding',
                  onPress: handleResetOnboarding,
                  style: 'destructive',
                },
                {
                  text: 'Cancel',
                  style: 'cancel',
                },
              ]
            );
          }}
        >
          <Ionicons name="menu" size={28} color={Colors.text.primary} />
        </TouchableOpacity>

        {/* Particle Trail */}
        {particles.length > 0 && (
          <ParticleTrail
            particles={particles}
            onComplete={() => setParticles([])}
          />
        )}

        {/* Interactive Mascot */}
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
            size={MASCOT_SIZE}
            onPress={handleMascotPress}
            baseRotation={isMascotVisible ? ROTATION_VISIBLE : ROTATION_HIDDEN}
            isReading={isMascotVisible}
          />
        </Animated.View>
      </View>
    );
  }

  // Show loading while checking/redirecting
  return (
    <View style={styles.loadingContainer}>
      <ActivityIndicator size="large" color={Colors.primary} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background.default,
  },
  loadingContainer: {
    flex: 1,
    backgroundColor: Colors.background.default,
    justifyContent: 'center',
    alignItems: 'center',
  },
  quoteContainer: {
    height: screenHeight,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  categoryBadge: {
    position: 'absolute',
    top: 80,
    alignSelf: 'center',
    backgroundColor: Colors.primary,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    shadowColor: Colors.shadow.medium,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
    zIndex: 10,
  },
  categoryBadgeText: {
    color: Colors.text.white,
    fontSize: 14,
    fontWeight: '600',
    textTransform: 'capitalize',
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
  categoriesButton: {
    position: 'absolute',
    right: 20,
    bottom: 100,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: Colors.shadow.dark,
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 8,
    zIndex: 10,
  },
  menuButton: {
    position: 'absolute',
    right: 20,
    top: 60,
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.background.primary,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: Colors.shadow.medium,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 5,
    zIndex: 10,
  },
  mascotContainer: {
    position: 'absolute',
    zIndex: 10,
  },
});
