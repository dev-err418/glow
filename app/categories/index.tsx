import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { PAYWALL_RESULT } from 'react-native-purchases-ui';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AnimatedMascot } from '../../components/AnimatedMascot';
import { Colors } from '../../constants/Colors';
import { Typography } from '../../constants/Typography';
import { useCategories } from '../../contexts/CategoriesContext';
import { useCustomQuotes } from '../../contexts/CustomQuotesContext';
import { useFavorites } from '../../contexts/FavoritesContext';
import { usePremium } from '../../contexts/PremiumContext';

interface CategoryCardProps {
  title: string;
  value: string;
  icon: keyof typeof Ionicons.glyphMap;
  isLocked?: boolean;
  isSelected?: boolean;
  onPress?: () => void;
  subtitle?: string;
}

function CategoryCard({ title, value, icon, isLocked, isSelected, onPress, subtitle }: CategoryCardProps) {
  const { isPremium, showPaywall } = usePremium();
  const shouldShowLock = isLocked && !isPremium;

  const handlePress = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    if (shouldShowLock) {
      // Show paywall for locked categories
      try {
        const result = await showPaywall();
        if (result === PAYWALL_RESULT.PURCHASED || result === PAYWALL_RESULT.RESTORED) {
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
          // Category will be unlocked after premium status updates
          onPress?.();
        }
      } catch (error) {
        console.error('Error showing paywall:', error);
      }
    } else {
      onPress?.();
    }
  };

  return (
    <TouchableOpacity
      style={[styles.categoryCard, isSelected && styles.categoryCardSelected]}
      onPress={handlePress}
      activeOpacity={0.7}
    >
      {shouldShowLock && (
        <View style={styles.lockIconContainer}>
          <Ionicons name="lock-closed" size={16} color={Colors.text.light} />
        </View>
      )}
      {isSelected && !shouldShowLock && (
        <View style={styles.checkIconContainer}>
          <Ionicons name="checkmark-circle" size={20} color={Colors.primary} />
        </View>
      )}
      <View style={styles.categoryContent}>
        <View>
          <Text style={styles.categoryTitle}>{title}</Text>
          {subtitle && (
            <Text style={styles.categorySubtitle}>{subtitle}</Text>
          )}
        </View>
        <View style={styles.iconContainer}>
          <Ionicons name={icon} size={24} color={Colors.primary} />
        </View>
      </View>
    </TouchableOpacity>
  );
}

export default function CategoriesIndex() {
  const router = useRouter();
  const { isPremium, showPaywall } = usePremium();
  const { selectedCategories, updateSelectedCategories } = useCategories();
  const { favorites } = useFavorites();
  const { customQuotes } = useCustomQuotes();
  const [isProcessingPaywall, setIsProcessingPaywall] = useState(false);
  const [localSelectedCategories, setLocalSelectedCategories] = useState<string[]>(selectedCategories);

  // Sync with context when it changes
  useEffect(() => {
    setLocalSelectedCategories(selectedCategories);
  }, [selectedCategories]);

  const handleUnlockAll = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    if (!isPremium) {
      // Show paywall for non-premium users
      setIsProcessingPaywall(true);
      try {
        const result = await showPaywall();
        if (result === PAYWALL_RESULT.PURCHASED || result === PAYWALL_RESULT.RESTORED) {
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        }
      } catch (error) {
        console.error('Error showing paywall:', error);
      } finally {
        setIsProcessingPaywall(false);
      }
    }
  };

  const handleCategoryToggle = (categoryValue: string, isLocked: boolean) => {
    console.log('🔍 Category toggle:', categoryValue, 'Locked:', isLocked, 'Favorites count:', favorites.length);

    if (isLocked && !isPremium) {
      // Already handled in CategoryCard
      console.log('⚠️ Category is locked and user is not premium');
      return;
    }

    // Check if favorites has minimum required quotes
    if (categoryValue === 'favorites' && favorites.length < 5) {
      console.log('⚠️ Not enough favorites:', favorites.length, '< 5');
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
      Alert.alert(
        'Not enough favorites',
        'You need at least 5 favorite quotes to use this category. Keep liking quotes you love!',
        [{ text: 'OK', style: 'default' }]
      );
      return;
    }

    console.log('✅ Category check passed, proceeding with selection');

    // Single selection mode: replace with new selection
    const newSelection = [categoryValue];
    setLocalSelectedCategories(newSelection);

    // Auto-save and close modal
    updateSelectedCategories(newSelection);
    setTimeout(() => {
      router.back();
    }, 150); // Small delay for visual feedback
  };

  const handleClose = () => {
    // Save selections before closing
    updateSelectedCategories(localSelectedCategories);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.back();
  };

  const mostPopular = [
    { title: 'General', value: 'general', icon: 'sparkles' as const, isLocked: false },
    {
      title: 'My own quotes',
      value: 'custom',
      icon: 'create' as const,
      isLocked: false,
      subtitle: `${customQuotes.length} ${customQuotes.length === 1 ? 'quote' : 'quotes'}`,
      navigateTo: '/categories/custom-quotes'
    },
    {
      title: 'My favorites',
      value: 'favorites',
      icon: 'heart' as const,
      isLocked: false,
      subtitle: `${favorites.length} ${favorites.length === 1 ? 'quote' : 'quotes'}`
    },
    { title: 'Winter', value: 'winter', icon: 'snow' as const, isLocked: true },
  ];

  const forYou = [
    { title: 'Self-care', value: 'self-care', icon: 'flower' as const, isLocked: true },
    { title: 'Mindfulness', value: 'mindfulness', icon: 'leaf' as const, isLocked: true },
    { title: 'Motivation', value: 'motivation', icon: 'rocket' as const, isLocked: true },
    { title: 'Gratitude', value: 'gratitude', icon: 'heart-circle' as const, isLocked: true },
    { title: 'Confidence', value: 'confidence', icon: 'star' as const, isLocked: true },
    { title: 'Peace', value: 'peace', icon: 'sunny' as const, isLocked: true },
    { title: 'Growth', value: 'growth', icon: 'trending-up' as const, isLocked: true },
    { title: 'Energy', value: 'energy', icon: 'flash' as const, isLocked: true },
    { title: 'Overthinking', value: 'overthinking', icon: 'infinite' as const, isLocked: true },
    { title: 'Stress relief', value: 'stress-relief', icon: 'happy' as const, isLocked: true },
  ];

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={handleClose}
          style={styles.headerButton}
        >
          <Ionicons name="close" size={28} color={Colors.text.primary} />
        </TouchableOpacity>

        {!isPremium && (
          <TouchableOpacity
            onPress={handleUnlockAll}
            style={styles.headerButton}
          >
            <Text style={styles.unlockText}>Unlock all</Text>
          </TouchableOpacity>
        )}
      </View>

          {/* Title */}
          <Text style={styles.pageTitle}>Categories</Text>

          {/* Animated Mascot */}
          <View style={styles.mascotWrapper}>
            <AnimatedMascot />
          </View>

          {/* Content */}
          <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
            {/* Create My Own Mix Button */}
            <TouchableOpacity
              style={styles.createMixButton}
              onPress={async () => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

                if (!isPremium) {
                  // Show paywall for non-premium users
                  setIsProcessingPaywall(true);
                  try {
                    const result = await showPaywall();
                    if (result === PAYWALL_RESULT.PURCHASED || result === PAYWALL_RESULT.RESTORED) {
                      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
                      router.push('/categories/create-mix');
                    }
                  } catch (error) {
                    console.error('Error showing paywall:', error);
                  } finally {
                    setIsProcessingPaywall(false);
                  }
                } else {
                  // Premium users can access directly
                  router.push('/categories/create-mix');
                }
              }}
              activeOpacity={0.7}
              disabled={isProcessingPaywall}
            >
              {isProcessingPaywall ? (
                <ActivityIndicator color={Colors.text.white} size="small" />
              ) : (
                <>
                  <Ionicons
                    name={selectedCategories.length > 1 ? "create" : "add-circle"}
                    size={24}
                    color={Colors.text.white}
                  />
                  <Text style={styles.createMixText}>
                    {selectedCategories.length > 1 ? "Edit my mix" : "Create my own mix"}
                  </Text>
                </>
              )}
            </TouchableOpacity>

            {/* Mix Info Text */}
            {selectedCategories.length > 1 && (
              <Text style={styles.mixInfoText}>
                Your feed is currently showing your mix. Select a category below to switch.
              </Text>
            )}

            {/* Most Popular Section */}
            <View style={[styles.section, selectedCategories.length === 1 && { marginTop: 16 }]}>
              <Text style={styles.sectionTitle}>Most Popular</Text>
              <View style={styles.grid}>
                {mostPopular.map((category, index) => (
                  <CategoryCard
                    key={index}
                    title={category.title}
                    value={category.value}
                    icon={category.icon}
                    isLocked={category.isLocked}
                    isSelected={
                      // Only show as selected if NOT in mix mode (single category)
                      localSelectedCategories.length === 1 &&
                      localSelectedCategories.includes(category.value)
                    }
                    onPress={() => {
                      // Navigate to custom screen if it has navigateTo
                      if ('navigateTo' in category && category.navigateTo) {
                        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                        router.push(category.navigateTo as any);
                      } else {
                        handleCategoryToggle(category.value, category.isLocked);
                      }
                    }}
                    subtitle={'subtitle' in category ? category.subtitle : undefined}
                  />
                ))}
              </View>
            </View>

            {/* For You Section */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>For you</Text>
              <View style={styles.grid}>
                {forYou.map((category, index) => (
                  <CategoryCard
                    key={index}
                    title={category.title}
                    value={category.value}
                    icon={category.icon}
                    isLocked={category.isLocked}
                    isSelected={
                      // Only show as selected if NOT in mix mode (single category)
                      localSelectedCategories.length === 1 &&
                      localSelectedCategories.includes(category.value)
                    }
                    onPress={() => handleCategoryToggle(category.value, category.isLocked)}
                  />
                ))}
              </View>
            </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background.default,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 16,
    backgroundColor: Colors.background.default,
  },
  headerButton: {
    minWidth: 80,
  },
  unlockText: {
    ...Typography.body,
    color: Colors.primary,
    fontFamily: 'UncutSans',
    fontWeight: '600',
    textAlign: 'right',
  },
  mascotWrapper: {
    alignItems: 'center',
    marginBottom: 20,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  createMixButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.primary,
    borderRadius: 16,
    paddingVertical: 18,
    paddingHorizontal: 24,
    marginBottom: 16,
    shadowColor: Colors.shadow.medium,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  createMixText: {
    ...Typography.body,
    color: Colors.text.white,
    fontFamily: 'UncutSans',
    fontWeight: '600',
    marginLeft: 8,
    fontSize: 16,
  },
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    ...Typography.h3,
    marginBottom: 16,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    justifyContent: 'space-between',
  },
  categoryCard: {
    width: '48%',
    backgroundColor: Colors.background.primary,
    borderRadius: 16,
    padding: 16,
    minHeight: 100,
    shadowColor: Colors.shadow.light,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
    position: 'relative',
  },
  lockIconContainer: {
    position: 'absolute',
    top: 10,
    right: 10,
    zIndex: 1,
  },
  checkIconContainer: {
    position: 'absolute',
    top: 10,
    right: 10,
    zIndex: 1,
  },
  categoryCardSelected: {
    borderWidth: 2,
    borderColor: Colors.primary,
  },
  categoryContent: {
    flex: 1,
    justifyContent: 'space-between',
  },
  categoryTitle: {
    ...Typography.body,
    fontFamily: 'UncutSans',
    fontWeight: '600',
    color: Colors.text.primary,
    marginBottom: 4,
    flexWrap: 'wrap',
  },
  categorySubtitle: {
    fontSize: 12,
    fontFamily: 'UncutSans',
    fontWeight: '400',
    color: Colors.text.secondary,
    marginTop: 2,
  },
  iconContainer: {
    alignSelf: 'flex-end',
  },
  pageTitle: {
    ...Typography.h1,
    textAlign: 'center',
    marginTop: 16,
    marginBottom: 8,
  },
  mixInfoText: {
    ...Typography.bodySmall,
    fontSize: 13,
    color: Colors.text.secondary,
    textAlign: 'center',
    // marginTop: 12,
    marginBottom: 32,
    paddingHorizontal: 24,
  },
});
