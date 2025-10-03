import React, { useState, useEffect } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { PAYWALL_RESULT } from 'react-native-purchases-ui';
import { AnimatedMascot } from '../components/AnimatedMascot';
import { Colors } from '../constants/Colors';
import { Typography } from '../constants/Typography';
import { usePremium } from '../contexts/PremiumContext';
import { useCategories } from '../contexts/CategoriesContext';

interface CategoryCardProps {
  title: string;
  value: string;
  icon: keyof typeof Ionicons.glyphMap;
  isLocked?: boolean;
  isSelected?: boolean;
  onPress?: () => void;
}

function CategoryCard({ title, value, icon, isLocked, isSelected, onPress }: CategoryCardProps) {
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
        <Text style={styles.categoryTitle}>{title}</Text>
        <View style={styles.iconContainer}>
          <Ionicons name={icon} size={24} color={Colors.primary} />
        </View>
      </View>
    </TouchableOpacity>
  );
}

export default function CategoriesModal() {
  const router = useRouter();
  const { isPremium, showPaywall } = usePremium();
  const { selectedCategories, updateSelectedCategories } = useCategories();
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
    if (isLocked && !isPremium) {
      // Already handled in CategoryCard
      return;
    }

    setLocalSelectedCategories((prev) => {
      if (prev.includes(categoryValue)) {
        // Remove if already selected (unless it's the last one)
        if (prev.length === 1) {
          return prev; // Keep at least one category selected
        }
        return prev.filter((c) => c !== categoryValue);
      } else {
        // Add if not selected
        return [...prev, categoryValue];
      }
    });
  };

  const handleClose = () => {
    // Save selections before closing
    updateSelectedCategories(localSelectedCategories);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.back();
  };

  const mostPopular = [
    { title: 'General', value: 'general', icon: 'sparkles' as const, isLocked: false },
    { title: 'My own quotes', value: 'custom', icon: 'create' as const, isLocked: false },
    { title: 'My favorites', value: 'favorites', icon: 'heart' as const, isLocked: false },
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

            <TouchableOpacity
              onPress={handleUnlockAll}
              style={styles.headerButton}
            >
              <Text style={styles.unlockText}>Unlock all</Text>
            </TouchableOpacity>
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
                      router.push('/mix-modal');
                    }
                  } catch (error) {
                    console.error('Error showing paywall:', error);
                  } finally {
                    setIsProcessingPaywall(false);
                  }
                } else {
                  // Premium users can access directly
                  router.push('/mix-modal');
                }
              }}
              activeOpacity={0.7}
              disabled={isProcessingPaywall}
            >
              {isProcessingPaywall ? (
                <ActivityIndicator color={Colors.text.white} size="small" />
              ) : (
                <>
                  <Ionicons name="add-circle" size={24} color={Colors.text.white} />
                  <Text style={styles.createMixText}>Create my own mix</Text>
                </>
              )}
            </TouchableOpacity>

            {/* Most Popular Section */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Most Popular</Text>
              <View style={styles.grid}>
                {mostPopular.map((category, index) => (
                  <CategoryCard
                    key={index}
                    title={category.title}
                    value={category.value}
                    icon={category.icon}
                    isLocked={category.isLocked}
                    isSelected={localSelectedCategories.includes(category.value)}
                    onPress={() => handleCategoryToggle(category.value, category.isLocked)}
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
                    isSelected={localSelectedCategories.includes(category.value)}
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
    marginBottom: 32,
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
    fontWeight: '600',
    color: Colors.text.primary,
    marginBottom: 8,
    flexWrap: 'wrap',
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
});
