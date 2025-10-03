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
  Easing,
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View
} from 'react-native';
import { InteractiveMascot } from '../components/InteractiveMascot';
import { ParticleTrail } from '../components/ParticleTrail';
import { Colors } from '../constants/Colors';
import { Typography } from '../constants/Typography';
import { useCategories } from '../contexts/CategoriesContext';
import { useCustomQuotes } from '../contexts/CustomQuotesContext';
import { useFavorites } from '../contexts/FavoritesContext';
import { useNotifications } from '../contexts/NotificationContext';
import { useOnboarding } from '../contexts/OnboardingContext';
import { useStreak } from '../contexts/StreakContext';
import { useLocalSearchParams } from 'expo-router';

const { height: screenHeight, width: screenWidth } = Dimensions.get('window');

// Import quotes
const quotesData = require('../assets/data/quotes.json');

interface Quote {
  id: string;
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
  onTap: () => void;
}

function QuoteItem({ item, onLike, onShare, isFavorite, onTap }: QuoteItemProps) {
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

export default function Index() {
  const router = useRouter();
  const { id: quoteId } = useLocalSearchParams<{ id?: string }>();
  const { onboardingData, isLoading: isOnboardingLoading } = useOnboarding();
  const { selectedCategories, isLoading: isCategoriesLoading } = useCategories();
  const { addFavorite, removeFavorite, isFavorite, favorites } = useFavorites();
  const { customQuotes } = useCustomQuotes();
  const { recordActivity } = useStreak();
  const { scheduleNotifications } = useNotifications();
  const [quotes, setQuotes] = useState<Quote[]>([]);
  const [isMascotVisible, setIsMascotVisible] = useState(false);
  const [particles, setParticles] = useState<Particle[]>([]);
  const [currentCategory, setCurrentCategory] = useState<string>('');
  const [showSwipeHint, setShowSwipeHint] = useState(false);
  const [showLikeHeart, setShowLikeHeart] = useState(false);
  const [currentViewIndex, setCurrentViewIndex] = useState(0);

  // Idle timer and animation values
  const idleTimerRef = useRef<NodeJS.Timeout | null>(null);
  const bounceAnimationRef = useRef<Animated.CompositeAnimation | null>(null);
  const hintOpacity = useRef(new Animated.Value(0)).current;
  const hintTranslateY = useRef(new Animated.Value(0)).current;

  // Like heart animation values
  const likeHeartScale = useRef(new Animated.Value(0)).current;
  const likeHeartOpacity = useRef(new Animated.Value(0)).current;
  const likeHeartRotation = useRef(new Animated.Value(0)).current;

  // Store base pool of all available quotes
  const quotePoolRef = useRef<Quote[]>([]);

  // FlatList ref for scrolling to specific quote
  const flatListRef = useRef<FlatList>(null);

  // Track if we've handled the initial deep link URL
  const hasHandledInitialUrl = useRef(false);

  // Store pending deep link quote to show as first card
  const pendingDeepLinkQuote = useRef<Quote | null>(null);

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

  // Record streak activity when onboarding completes or when user views quotes
  useEffect(() => {
    if (!isOnboardingLoading && onboardingData.completed) {
      recordActivity();
    }
  }, [isOnboardingLoading, onboardingData.completed]);

  // Load and shuffle quotes based on selected categories
  useEffect(() => {
    if (!isCategoriesLoading && selectedCategories.length > 0) {
      // Use pending deep link quote if available, otherwise initialize normally
      initializeQuotePool(pendingDeepLinkQuote.current);
      // Update notifications with new categories
      scheduleNotifications(selectedCategories);
    }
  }, [selectedCategories, isCategoriesLoading]);

  // Separate effect to handle favorites changes when viewing favorites category
  useEffect(() => {
    // Only reload quotes if currently viewing favorites category
    if (!isCategoriesLoading && selectedCategories.includes('favorites')) {
      console.log('♥️ Favorites changed while viewing favorites category, reloading quotes');
      initializeQuotePool();
    }
  }, [favorites]);

  // Separate effect to handle custom quotes changes when viewing custom category
  useEffect(() => {
    // Only reload quotes if currently viewing custom category
    if (!isCategoriesLoading && selectedCategories.includes('custom')) {
      console.log('📝 Custom quotes changed while viewing custom category, reloading quotes');
      initializeQuotePool();
    }
  }, [customQuotes]);

  const initializeQuotePool = (priorityQuote?: Quote | null) => {
    const allQuotes: Quote[] = [];

    // Gather quotes from selected categories
    selectedCategories.forEach((category) => {
      if (category === 'favorites') {
        // Special handling for favorites category
        favorites.forEach((favorite) => {
          allQuotes.push(favorite);
        });
      } else if (category === 'custom') {
        // Special handling for custom quotes category
        customQuotes.forEach((custom) => {
          allQuotes.push({ id: custom.id, text: custom.text, category: 'custom' });
        });
      } else {
        const categoryQuotes = quotesData[category];
        if (categoryQuotes && Array.isArray(categoryQuotes)) {
          categoryQuotes.forEach((quoteObj: { id: string; text: string }) => {
            allQuotes.push({ id: quoteObj.id, text: quoteObj.text, category });
          });
        }
      }
    });

    // Store the base pool
    quotePoolRef.current = allQuotes;

    // Initialize with 3-4 cycles of shuffled quotes for infinite scroll
    const initialQuotes: Quote[] = [];

    // If we have a priority quote (from deep link), add it first
    if (priorityQuote) {
      initialQuotes.push(priorityQuote);
      console.log('🎯 Added priority quote from deep link as first card:', priorityQuote.text);
    }

    for (let i = 0; i < 4; i++) {
      const shuffled = [...allQuotes].sort(() => Math.random() - 0.5);
      initialQuotes.push(...shuffled);
    }
    setQuotes(initialQuotes);

    // Clear the pending deep link quote after using it
    if (priorityQuote) {
      pendingDeepLinkQuote.current = null;
    }
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
      // Unliking - remove from favorites
      removeFavorite(quote);

      // Animate the button for unlike (simpler animation)
      Animated.sequence([
        Animated.spring(scaleAnim, {
          toValue: 0.8,
          useNativeDriver: true,
          bounciness: 20,
          speed: 15,
        }),
        Animated.spring(scaleAnim, {
          toValue: 1,
          useNativeDriver: true,
          bounciness: 15,
          speed: 12,
        }),
      ]).start();
    } else {
      // Liking - add to favorites
      addFavorite(quote);

      // Show large heart animation
      setShowLikeHeart(true);

      // Random rotation between -15 and 15 degrees
      const randomRotation = (Math.random() - 0.5) * 30;
      likeHeartRotation.setValue(randomRotation);

      // Reset animation values
      likeHeartScale.setValue(0);
      likeHeartOpacity.setValue(0);

      // Animate heart: scale up and fade in, then fade out
      Animated.parallel([
        Animated.sequence([
          Animated.spring(likeHeartScale, {
            toValue: 1,
            useNativeDriver: true,
            bounciness: 15,
            speed: 12,
          }),
          Animated.timing(likeHeartScale, {
            toValue: 1.1,
            duration: 100,
            useNativeDriver: true,
          }),
        ]),
        Animated.sequence([
          Animated.timing(likeHeartOpacity, {
            toValue: 1,
            duration: 200,
            useNativeDriver: true,
          }),
          Animated.delay(300),
          Animated.timing(likeHeartOpacity, {
            toValue: 0,
            duration: 300,
            useNativeDriver: true,
          }),
        ]),
      ]).start(() => {
        setShowLikeHeart(false);
      });

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
    }

    // Reset idle timer on like interaction
    resetIdleTimer();
  };

  const handleShare = (quote: Quote) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    console.log('Navigating to share modal with quote:', quote.text);
    try {
      router.push({
        pathname: 'share-modal' as any,
        params: {
          text: quote.text,
          category: quote.category,
        },
      });
    } catch (error) {
      console.error('Error navigating to share modal:', error);
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

    // Reset idle timer on mascot interaction
    resetIdleTimer();
  };

  const handleQuoteTap = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    router.push('/categories');
  };

  const renderQuote = ({ item }: { item: Quote; index: number }) => (
    <QuoteItem
      item={item}
      onLike={handleLike}
      onShare={handleShare}
      isFavorite={isFavorite(item)}
      onTap={handleQuoteTap}
    />
  );

  // Update category badge when selected category changes
  useEffect(() => {
    if (selectedCategories.length > 1) {
      // Multiple categories = mix mode
      setCurrentCategory('my mix');
    } else if (selectedCategories.length === 1) {
      const categoryName = selectedCategories[0];
      // Format for display: capitalize first letter and handle hyphens
      const formatted = categoryName
        .split('-')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');
      setCurrentCategory(formatted);
    }
  }, [selectedCategories]);

  const resetIdleTimer = () => {
    // Clear existing timer
    if (idleTimerRef.current) {
      clearTimeout(idleTimerRef.current);
    }

    // Stop bounce animation if running
    if (bounceAnimationRef.current) {
      bounceAnimationRef.current.stop();
      bounceAnimationRef.current = null;
    }

    // Reset translateY to 0
    hintTranslateY.setValue(0);

    // Hide hint if showing
    if (showSwipeHint) {
      setShowSwipeHint(false);
      Animated.timing(hintOpacity, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }).start();
    }

    // Start new 8-second timer
    idleTimerRef.current = setTimeout(() => {
      setShowSwipeHint(true);

      // Create and store bounce animation with easing
      const bounceLoop = Animated.loop(
        Animated.sequence([
          Animated.timing(hintTranslateY, {
            toValue: -10,
            duration: 600,
            easing: Easing.out(Easing.ease),
            useNativeDriver: true,
          }),
          Animated.timing(hintTranslateY, {
            toValue: 0,
            duration: 600,
            easing: Easing.in(Easing.ease),
            useNativeDriver: true,
          }),
        ])
      );

      // Store reference so we can stop it later
      bounceAnimationRef.current = bounceLoop;

      // Fade in hint and start bounce
      Animated.parallel([
        Animated.timing(hintOpacity, {
          toValue: 1,
          duration: 500,
          useNativeDriver: true,
        }),
        bounceLoop,
      ]).start();
    }, 8000);
  };

  // Start idle timer on mount and clean up on unmount
  useEffect(() => {
    resetIdleTimer();
    return () => {
      if (idleTimerRef.current) {
        clearTimeout(idleTimerRef.current);
      }
      if (bounceAnimationRef.current) {
        bounceAnimationRef.current.stop();
      }
    };
  }, []);

  // Handle deep link via URL params
  useEffect(() => {
    if (quoteId && quotes.length > 0) {
      console.log('📱 Deep link to quote ID:', quoteId);

      let targetQuote: Quote | null = null;

      // Check if quote already exists in feed
      const existingIndex = quotes.findIndex(q => q.id === quoteId);
      if (existingIndex !== -1) {
        console.log('✅ Quote already in feed at index:', existingIndex);
        targetQuote = quotes[existingIndex];
      } else {
        // Find the quote in quotesData by ID
        for (const category in quotesData) {
          const categoryQuotes = quotesData[category];
          if (Array.isArray(categoryQuotes)) {
            const quoteObj = categoryQuotes.find((q: any) => q.id === quoteId);
            if (quoteObj) {
              targetQuote = { id: quoteObj.id, text: quoteObj.text, category };
              console.log('✅ Found quote in quotesData:', targetQuote.text);
              break;
            }
          }
        }
      }

      if (targetQuote) {
        // Remove the quote from its current position if it exists
        const filteredQuotes = quotes.filter(q => q.id !== quoteId);

        // Insert it at the current viewing position (replace what's there)
        const newQuotes = [
          ...filteredQuotes.slice(0, currentViewIndex),
          targetQuote,
          ...filteredQuotes.slice(currentViewIndex)
        ];

        setQuotes(newQuotes);

        console.log('✅ Inserted quote at current position:', currentViewIndex);
        // No scrolling needed - quote is already at the visible position
      } else {
        console.log('⚠️ Quote ID not found');
      }

      // Clear the param without navigating
      router.setParams({ id: undefined });
    }
  }, [quoteId, quotes.length, router]);

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
        <Animated.View
          style={{
            flex: 1,
            transform: [{ translateY: hintTranslateY }],
          }}
        >
          <FlatList
            ref={flatListRef}
            data={quotes}
            renderItem={renderQuote}
            keyExtractor={(item, index) => `${item.text}-${index}`}
            pagingEnabled
            snapToInterval={screenHeight}
            snapToAlignment="start"
            decelerationRate="fast"
            showsVerticalScrollIndicator={false}
            bounces={true}
            onEndReached={loadMoreQuotes}
            onEndReachedThreshold={0.5}
            onScroll={resetIdleTimer}
            scrollEventThrottle={400}
            onViewableItemsChanged={({ viewableItems }) => {
              if (viewableItems.length > 0 && viewableItems[0].index !== null) {
                setCurrentViewIndex(viewableItems[0].index);
              }
            }}
            viewabilityConfig={{
              itemVisiblePercentThreshold: 50,
            }}
            onScrollToIndexFailed={(info) => {
              console.log('⚠️ Scroll to index failed:', info);
              // Retry after a delay
              setTimeout(() => {
                flatListRef.current?.scrollToIndex({
                  index: info.index,
                  animated: true,
                });
              }, 100);
            }}
          />
        </Animated.View>

        {/* Fixed Category Badge */}
        {currentCategory && (
          <TouchableOpacity
            style={styles.categoryBadge}
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
              router.push('/categories');
            }}
            activeOpacity={0.7}
          >
            <Text style={styles.categoryBadgeText}>{currentCategory}</Text>
          </TouchableOpacity>
        )}

        {/* Floating Categories Button */}
        <TouchableOpacity
          style={styles.categoriesButton}
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
            router.push('/categories');
          }}
        >
          <Ionicons name="grid-outline" size={18} color={Colors.text.white} />
        </TouchableOpacity>

        {/* Floating Settings Button */}
        <TouchableOpacity
          style={styles.settingsButton}
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
            router.push('/settings');
          }}
        >
          <Ionicons name="person-outline" size={18} color={Colors.text.white} />
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

        {/* Swipe Hint */}
        {showSwipeHint && (
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
            <Ionicons name="chevron-up" size={40} color={Colors.text.secondary} />
            <Animated.Text style={[styles.swipeHintText, { opacity: hintOpacity }]}>
              Swipe up for next quote
            </Animated.Text>
          </Animated.View>
        )}

        {/* Large Like Heart Animation */}
        {showLikeHeart && (
          <Animated.View
            style={[
              styles.likeHeartContainer,
              {
                opacity: likeHeartOpacity,
                transform: [
                  { scale: likeHeartScale },
                  { rotate: `${likeHeartRotation._value}deg` },
                ],
              },
            ]}
            pointerEvents="none"
          >
            <Ionicons name="heart" size={140} color={Colors.primary} />
          </Animated.View>
        )}
      </View>
    );
  }

  // Show loading while checking/redirecting
  return (
    <View style={styles.loadingContainer}>
      <ActivityIndicator color={Colors.primary} />
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
    paddingHorizontal: 20,
    justifyContent: "center"    ,
    height: 50,
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
    fontSize: 18,
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
    right: 25,
    bottom: 25,
    width: 55,
    height: 55,
    borderRadius: 30,
    backgroundColor: Colors.secondary,
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
  settingsButton: {
    position: 'absolute',
    right: 25,
    top: 80,
    width: 55,
    height: 55,
    borderRadius: 30,
    backgroundColor: Colors.secondary,
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
