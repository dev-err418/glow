import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Haptics from 'expo-haptics';
import * as Notifications from 'expo-notifications';
import * as StoreReview from 'expo-store-review';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Animated,
  AppState,
  Dimensions,
  Easing,
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  ViewToken
} from 'react-native';
import { StreakAnimationPopup } from '../components/StreakAnimationPopup';
import { LikeHeartAnimation } from '../components/home/LikeHeartAnimation';
import { MascotSection, Particle } from '../components/home/MascotSection';
import { Quote } from '../components/home/QuoteCard';
import { QuoteFeed } from '../components/home/QuoteFeed';
import { SwipeHint } from '../components/home/SwipeHint';
import { UIControls } from '../components/home/UIControls';
import { Colors } from '../constants/Colors';
import { useCategories } from '../contexts/CategoriesContext';
import { useCustomQuotes } from '../contexts/CustomQuotesContext';
import { useFavorites } from '../contexts/FavoritesContext';
import { useNotifications } from '../contexts/NotificationContext';
import { useOnboarding } from '../contexts/OnboardingContext';
import { useStreak } from '../contexts/StreakContext';

const { height: screenHeight } = Dimensions.get('window');

// Import quotes
const quotesData = require('../assets/data/quotes.json');

// Mascot positions for toggle show/hide
const MASCOT_SIZE = 180;
const MASCOT_HIDDEN = { left: -50, bottom: -50 };      // Bottom-left corner, peeking
const MASCOT_VISIBLE = { left: -30, bottom: 250 };   // Upper-right, reading position
const ROTATION_HIDDEN = '15deg';   // Tilted right when hidden
const ROTATION_VISIBLE = '-30deg'; // Tilted left when visible

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
  const [likeHeartRotationDeg, setLikeHeartRotationDeg] = useState(0);
  const [showStreakPopup, setShowStreakPopup] = useState(false);
  const [hasCompletedFirstSwipe, setHasCompletedFirstSwipe] = useState(false);

  // Idle timer and animation values
  const idleTimerRef = useRef<NodeJS.Timeout | null>(null);
  const bounceAnimationRef = useRef<Animated.CompositeAnimation | null>(null);
  const hintOpacity = useRef(new Animated.Value(0)).current;
  const hintTranslateY = useRef(new Animated.Value(0)).current;

  // Like heart animation values
  const likeHeartScale = useRef(new Animated.Value(0)).current;
  const likeHeartOpacity = useRef(new Animated.Value(0)).current;

  // Store base pool of all available quotes
  const quotePoolRef = useRef<Quote[]>([]);

  // FlatList ref for scrolling to specific quote
  const flatListRef = useRef<FlatList<Quote>>(null);

  // Track if we've handled the initial deep link URL
  const hasHandledInitialUrl = useRef(false);

  // Store pending deep link quote to show as first card
  const pendingDeepLinkQuote = useRef<Quote | null>(null);

  // Animated values for mascot position (left and bottom)
  const mascotLeft = useRef(new Animated.Value(MASCOT_HIDDEN.left)).current;
  const mascotBottom = useRef(new Animated.Value(MASCOT_HIDDEN.bottom)).current;

  // Animated values for UI element fade-ins after first swipe
  const uiOpacity = useRef(new Animated.Value(0)).current;

  // Load first swipe state on mount
  useEffect(() => {
    const loadFirstSwipeState = async () => {
      try {
        const value = await AsyncStorage.getItem('firstSwipeCompleted');
        if (value === 'true') {
          setHasCompletedFirstSwipe(true);
          uiOpacity.setValue(1); // Set UI to visible if already completed
        }
      } catch (error) {
        console.error('Error loading first swipe state:', error);
      }
    };
    loadFirstSwipeState();
  }, []);

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

  // Handle notification taps to deep link to specific quote
  useEffect(() => {
    const subscription = Notifications.addNotificationResponseReceivedListener((response) => {
      const quoteId = response.notification.request.content.data?.quoteId as string | undefined;

      if (quoteId) {
        console.log('📬 Notification tapped with quote ID:', quoteId);
        // Replace entire navigation stack with index route including quote ID
        router.replace(`/?id=${quoteId}`);
      }
    });

    return () => {
      subscription.remove();
    };
  }, [router]);

  // Record streak activity when onboarding completes or when user views quotes
  useEffect(() => {
    if (!isOnboardingLoading && onboardingData.completed) {
      const checkAndRecordStreak = async () => {
        const isNewDay = await recordActivity();
        if (isNewDay) {
          // New day! Show the streak animation after a short delay
          setTimeout(() => {
            setShowStreakPopup(true);
          }, 1000);
        }
      };
      checkAndRecordStreak();
    }
  }, [isOnboardingLoading, onboardingData.completed]);

  // Check for new day when app comes to foreground
  useEffect(() => {
    const subscription = AppState.addEventListener('change', (nextAppState) => {
      if (nextAppState === 'active' && !isOnboardingLoading && onboardingData.completed) {
        const checkAndRecordStreak = async () => {
          const isNewDay = await recordActivity();
          if (isNewDay) {
            // New day! Show the streak animation after a short delay
            setTimeout(() => {
              setShowStreakPopup(true);
            }, 1000);
          }
        };
        checkAndRecordStreak();
      }
    });

    return () => {
      subscription.remove();
    };
  }, [isOnboardingLoading, onboardingData.completed, recordActivity]);

  // Load and shuffle quotes based on selected categories
  useEffect(() => {
    if (!isCategoriesLoading && selectedCategories.length > 0) {
      // Use pending deep link quote if available, otherwise initialize normally
      initializeQuotePool(pendingDeepLinkQuote.current);
      // Update notifications with new categories
      scheduleNotifications();
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
          allQuotes.push({ id: favorite.text, text: favorite.text, category: favorite.category });
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

  const completeFirstSwipe = async () => {
    if (!hasCompletedFirstSwipe) {
      // First, hide the swipe hint with its tutorial appearance
      if (showSwipeHint) {
        // Stop bounce animation
        if (bounceAnimationRef.current) {
          bounceAnimationRef.current.stop();
          bounceAnimationRef.current = null;
        }

        setShowSwipeHint(false);
        Animated.timing(hintOpacity, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }).start(() => {
          // After hint is hidden, update state and show UI
          setHasCompletedFirstSwipe(true);

          // Save to storage
          AsyncStorage.setItem('firstSwipeCompleted', 'true').catch((error) => {
            console.error('Error saving first swipe state:', error);
          });

          // Animate UI elements appearing with longer duration
          Animated.timing(uiOpacity, {
            toValue: 1,
            duration: 1200, // Increased from 500ms
            useNativeDriver: true,
          }).start();
        });
      } else {
        // If hint not showing, proceed immediately
        setHasCompletedFirstSwipe(true);

        try {
          await AsyncStorage.setItem('firstSwipeCompleted', 'true');
        } catch (error) {
          console.error('Error saving first swipe state:', error);
        }

        Animated.timing(uiOpacity, {
          toValue: 1,
          duration: 1200, // Increased from 500ms
          useNativeDriver: true,
        }).start();
      }
    }
  };

  const resetFirstSwipeState = async () => {
    setHasCompletedFirstSwipe(false);
    uiOpacity.setValue(0);
    try {
      await AsyncStorage.removeItem('firstSwipeCompleted');
    } catch (error) {
      console.error('Error resetting first swipe state:', error);
    }

    // Stop any existing animation
    if (bounceAnimationRef.current) {
      bounceAnimationRef.current.stop();
      bounceAnimationRef.current = null;
    }

    // Reset animation values
    hintTranslateY.setValue(0);
    hintOpacity.setValue(0);

    // Show swipe hint immediately
    setShowSwipeHint(true);

    // Start bounce animation for tutorial
    const bounceLoop = Animated.loop(
      Animated.sequence([
        Animated.timing(hintTranslateY, {
          toValue: -20,
          duration: 1000,
          easing: Easing.out(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(hintTranslateY, {
          toValue: 0,
          duration: 1000,
          easing: Easing.in(Easing.ease),
          useNativeDriver: true,
        }),
      ])
    );

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

      // Check if we hit a milestone and request review
      const newFavoritesCount = favorites.length + 1;
      if (newFavoritesCount >= 15 && newFavoritesCount % 15 === 0) {
        // Request review at milestones: 15, 30, 45, etc.
        StoreReview.requestReview();
      }

      // Show large heart animation
      setShowLikeHeart(true);

      // Random rotation between -15 and 15 degrees
      const randomRotation = (Math.random() - 0.5) * 30;
      setLikeHeartRotationDeg(randomRotation);

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
    // If first swipe not completed, don't use timer - keep hint visible
    if (!hasCompletedFirstSwipe) {
      return;
    }

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

      // Reset animation value to ensure clean start
      hintTranslateY.setValue(0);

      // Create and store bounce animation with easing
      const bounceLoop = Animated.loop(
        Animated.sequence([
          Animated.timing(hintTranslateY, {
            toValue: -15,
            duration: 800,
            easing: Easing.out(Easing.ease),
            useNativeDriver: true,
          }),
          Animated.timing(hintTranslateY, {
            toValue: 0,
            duration: 800,
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
    }, 8000) as unknown as NodeJS.Timeout;
  };

  // Start idle timer on mount and clean up on unmount
  useEffect(() => {
    // If first swipe not completed, show hint immediately
    if (!hasCompletedFirstSwipe && onboardingData.completed) {
      setShowSwipeHint(true);

      // Reset animation values
      hintTranslateY.setValue(0);
      hintOpacity.setValue(0);

      // Start bounce animation immediately for first-time users
      const bounceLoop = Animated.loop(
        Animated.sequence([
          Animated.timing(hintTranslateY, {
            toValue: -20, // Increased movement for better visibility
            duration: 1000,
            easing: Easing.out(Easing.ease),
            useNativeDriver: true,
          }),
          Animated.timing(hintTranslateY, {
            toValue: 0,
            duration: 1000,
            easing: Easing.in(Easing.ease),
            useNativeDriver: true,
          }),
        ])
      );

      bounceAnimationRef.current = bounceLoop;

      // Fade in hint
      Animated.parallel([
        Animated.timing(hintOpacity, {
          toValue: 1,
          duration: 500,
          useNativeDriver: true,
        }),
        bounceLoop,
      ]).start();
    } else {
      resetIdleTimer();
    }

    return () => {
      if (idleTimerRef.current) {
        clearTimeout(idleTimerRef.current);
      }
      if (bounceAnimationRef.current) {
        bounceAnimationRef.current.stop();
      }
    };
  }, [hasCompletedFirstSwipe, onboardingData.completed]);

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
        <ActivityIndicator color={Colors.primary} />
      </View>
    );
  }

  // If onboarding is completed, show the TikTok-style quote feed
  if (onboardingData.completed) {
    return (
      <View style={styles.container}>
        {/* Quote Feed */}
        <QuoteFeed
          quotes={quotes}
          hasCompletedFirstSwipe={hasCompletedFirstSwipe}
          onLike={handleLike}
          onShare={handleShare}
          onQuoteTap={handleQuoteTap}
          onScroll={resetIdleTimer}
          onMomentumScrollEnd={completeFirstSwipe}
          onViewableItemsChanged={({ viewableItems }: { viewableItems: ViewToken[] }) => {
            if (viewableItems.length > 0 && viewableItems[0].index !== null) {
              setCurrentViewIndex(viewableItems[0].index);
            }
          }}
          onEndReached={loadMoreQuotes}
          isFavorite={isFavorite}
          flatListRef={flatListRef}
        />

        {/* UI Controls */}
        <UIControls
          uiOpacity={uiOpacity}
          currentCategory={currentCategory}
          onCategoriesPress={() => router.push('/categories')}
          onSettingsPress={() => router.push('/settings')}
        />

        {/* Mascot Section */}
        <MascotSection
          uiOpacity={uiOpacity}
          mascotLeft={mascotLeft}
          mascotBottom={mascotBottom}
          mascotSize={MASCOT_SIZE}
          isMascotVisible={isMascotVisible}
          rotationVisible={ROTATION_VISIBLE}
          rotationHidden={ROTATION_HIDDEN}
          particles={particles}
          onMascotPress={handleMascotPress}
          onParticlesComplete={() => setParticles([])}
        />

        {/* Swipe Hint */}
        <SwipeHint
          showSwipeHint={showSwipeHint}
          hintOpacity={hintOpacity}
          hintTranslateY={hintTranslateY}
          hasCompletedFirstSwipe={hasCompletedFirstSwipe}
        />

        {/* Like Heart Animation */}
        <LikeHeartAnimation
          showLikeHeart={showLikeHeart}
          likeHeartOpacity={likeHeartOpacity}
          likeHeartScale={likeHeartScale}
          likeHeartRotationDeg={likeHeartRotationDeg}
        />

        {/* Streak Animation Popup */}
        <StreakAnimationPopup
          visible={showStreakPopup}
          onComplete={() => setShowStreakPopup(false)}
        />

        {/* Debug Button - Only in development */}
        {__DEV__ && (
          <TouchableOpacity
            style={styles.debugButton}
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
              resetFirstSwipeState();
            }}
          >
            <Ionicons name="bug-outline" size={24} color={Colors.text.white} />
            <Text style={styles.debugButtonText}>Reset Tutorial</Text>
          </TouchableOpacity>
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
  debugButton: {
    position: 'absolute',
    left: 20,
    top: '50%',
    marginTop: -40,
    backgroundColor: 'rgba(128, 128, 128, 0.8)',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 20,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    zIndex: 1000,
  },
  debugButtonText: {
    color: Colors.text.white,
    fontSize: 14,
    fontWeight: '600',
  },
});
