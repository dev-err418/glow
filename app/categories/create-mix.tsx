import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors } from '../../constants/Colors';
import { Typography } from '../../constants/Typography';
import { useCategories } from '../../contexts/CategoriesContext';
import { useCustomQuotes } from '../../contexts/CustomQuotesContext';
import { useFavorites } from '../../contexts/FavoritesContext';

interface Category {
  title: string;
  value: string;
  icon: keyof typeof Ionicons.glyphMap;
  subtitle?: string;
}

interface CategoryCheckboxProps {
  category: Category;
  isSelected: boolean;
  onToggle: () => void;
}

function CategoryCheckbox({ category, isSelected, onToggle }: CategoryCheckboxProps) {
  return (
    <TouchableOpacity
      style={[styles.categoryCard, isSelected && styles.categoryCardSelected]}
      onPress={onToggle}
      activeOpacity={0.7}
    >
      {isSelected && (
        <View style={styles.checkIconContainer}>
          <Ionicons name="checkmark-circle" size={20} color={Colors.primary} />
        </View>
      )}
      <View style={styles.categoryContent}>
        <View>
          <Text style={styles.categoryTitle}>{category.title}</Text>
          {category.subtitle && (
            <Text style={styles.categorySubtitle}>{category.subtitle}</Text>
          )}
        </View>
        <View style={styles.iconContainer}>
          <Ionicons name={category.icon} size={24} color={Colors.primary} />
        </View>
      </View>
    </TouchableOpacity>
  );
}

export default function CreateMixScreen() {
  const router = useRouter();
  const { selectedCategories: currentCategories, updateSelectedCategories } = useCategories();
  const { favorites } = useFavorites();
  const { customQuotes } = useCustomQuotes();

  // Pre-populate with current mix if it exists (multiple categories)
  const [selectedCategories, setSelectedCategories] = useState<string[]>(
    currentCategories.length > 1 ? currentCategories : []
  );

  // Build categories list with dynamic counts
  const AVAILABLE_CATEGORIES: Category[] = [
    {
      title: 'My favorites',
      value: 'favorites',
      icon: 'heart',
      subtitle: `${favorites.length} ${favorites.length === 1 ? 'quote' : 'quotes'}`
    },
    {
      title: 'My own quotes',
      value: 'custom',
      icon: 'create',
      subtitle: `${customQuotes.length} ${customQuotes.length === 1 ? 'quote' : 'quotes'}`
    },
    { title: 'General', value: 'general', icon: 'sparkles' },
    { title: 'Winter', value: 'winter', icon: 'snow' },
    { title: 'Self-care', value: 'self-care', icon: 'flower' },
    { title: 'Mindfulness', value: 'mindfulness', icon: 'leaf' },
    { title: 'Motivation', value: 'motivation', icon: 'rocket' },
    { title: 'Gratitude', value: 'gratitude', icon: 'heart-circle' },
    { title: 'Confidence', value: 'confidence', icon: 'star' },
    { title: 'Peace', value: 'peace', icon: 'sunny' },
    { title: 'Growth', value: 'growth', icon: 'trending-up' },
    { title: 'Energy', value: 'energy', icon: 'flash' },
    { title: 'Overthinking', value: 'overthinking', icon: 'infinite' },
    { title: 'Stress relief', value: 'stress-relief', icon: 'happy' },
  ];

  const handleToggleCategory = (categoryValue: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    setSelectedCategories(prev => {
      if (prev.includes(categoryValue)) {
        return prev.filter(c => c !== categoryValue);
      } else {
        return [...prev, categoryValue];
      }
    });
  };

  const handleSaveMix = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    if (selectedCategories.length === 0) {
      // If no categories selected, just go back
      router.back();
      return;
    }

    // Save selection and go back
    updateSelectedCategories(selectedCategories);
    router.back();
    router.back(); // Go back twice to close categories modal
  };

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <Text style={styles.emptySubtitle}>Select categories to create your mix</Text>
    </View>
  );

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      {/* Title */}
      <Text style={styles.pageTitle}>Create my own mix</Text>

      {/* Subtitle */}
      <Text style={styles.pageSubtitle}>Select categories to mix together</Text>

      {/* Category List */}
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.grid}>
          {AVAILABLE_CATEGORIES.map((category) => (
            <CategoryCheckbox
              key={category.value}
              category={category}
              isSelected={selectedCategories.includes(category.value)}
              onToggle={() => handleToggleCategory(category.value)}
            />
          ))}
        </View>
      </ScrollView>

      {/* Bottom Save Button */}
      {/* <KeyboardStickyView offset={{ closed: 0, opened: 15 }}> */}
        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={[
              styles.saveButton,
              selectedCategories.length < 2 && styles.saveButtonDisabled
            ]}
            onPress={handleSaveMix}
            activeOpacity={0.7}
            disabled={selectedCategories.length < 2}
          >
            <Text style={styles.saveButtonText}>Save my mix</Text>
          </TouchableOpacity>
        </View>
      {/* </KeyboardStickyView> */}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background.default,
  },
  pageTitle: {
    ...Typography.h1,
    textAlign: 'center',
    marginTop: 16,
    marginBottom: 8,
    paddingHorizontal: 20,
  },
  pageSubtitle: {
    ...Typography.body,
    color: Colors.text.secondary,
    textAlign: 'center',
    marginBottom: 24,
    paddingHorizontal: 40,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  scrollContentEmpty: {
    flexGrow: 1,
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
  categoryCardSelected: {
    borderWidth: 2,
    borderColor: Colors.primary,
  },
  checkIconContainer: {
    position: 'absolute',
    top: 10,
    right: 10,
    zIndex: 1,
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
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  emptySubtitle: {
    ...Typography.body,
    color: Colors.text.secondary,
    textAlign: 'center',
  },
  buttonContainer: {
    paddingHorizontal: 24,
    paddingVertical: 24,
    position: "absolute",
    bottom: 0,
    width: "100%"
  },
  saveButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    width: "100%",
    backgroundColor: Colors.primary,
    borderRadius: 16,
    paddingVertical: 18,
    paddingHorizontal: 24,
    shadowColor: Colors.shadow.medium,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  saveButtonText: {
    ...Typography.body,
    color: Colors.text.white,
    fontFamily: 'UncutSans',
    fontWeight: '600',
    fontSize: 16,
  },
  saveButtonDisabled: {
    opacity: 0.5,
  },
});
