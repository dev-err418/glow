import React from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { AnimatedMascot } from '../components/AnimatedMascot';
import { Colors } from '../constants/Colors';
import { Typography } from '../constants/Typography';

interface CategoryCardProps {
  title: string;
  icon: keyof typeof Ionicons.glyphMap;
  isLocked?: boolean;
  onPress?: () => void;
}

function CategoryCard({ title, icon, isLocked, onPress }: CategoryCardProps) {
  return (
    <TouchableOpacity
      style={styles.categoryCard}
      onPress={() => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        onPress?.();
      }}
      activeOpacity={0.7}
    >
      {isLocked && (
        <View style={styles.lockIconContainer}>
          <Ionicons name="lock-closed" size={16} color={Colors.text.light} />
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

  const handleUnlockAll = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    // TODO: Implement unlock all functionality
  };

  const mostPopular = [
    { title: 'General', icon: 'sparkles' as const, isLocked: false },
    { title: 'My own quotes', icon: 'create' as const, isLocked: false },
    { title: 'My favorites', icon: 'heart' as const, isLocked: false },
    { title: 'Winter', icon: 'snow' as const, isLocked: true },
  ];

  const forYou = [
    { title: 'Self-care', icon: 'flower' as const, isLocked: true },
    { title: 'Mindfulness', icon: 'leaf' as const, isLocked: true },
    { title: 'Motivation', icon: 'rocket' as const, isLocked: true },
    { title: 'Gratitude', icon: 'heart-circle' as const, isLocked: true },
    { title: 'Confidence', icon: 'star' as const, isLocked: true },
    { title: 'Peace', icon: 'sunny' as const, isLocked: true },
    { title: 'Growth', icon: 'trending-up' as const, isLocked: true },
    { title: 'Energy', icon: 'flash' as const, isLocked: true },
    { title: 'Overthinking', icon: 'infinite' as const, isLocked: true },
    { title: 'Stress relief', icon: 'happy' as const, isLocked: true },
  ];

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            router.back();
          }}
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
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                router.push('/mix-modal');
              }}
              activeOpacity={0.7}
            >
              <Ionicons name="add-circle" size={24} color={Colors.text.white} />
              <Text style={styles.createMixText}>Create my own mix</Text>
            </TouchableOpacity>

            {/* Most Popular Section */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Most Popular</Text>
              <View style={styles.grid}>
                {mostPopular.map((category, index) => (
                  <CategoryCard
                    key={index}
                    title={category.title}
                    icon={category.icon}
                    isLocked={category.isLocked}
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
                    icon={category.icon}
                    isLocked={category.isLocked}
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
