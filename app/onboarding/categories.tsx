import { useRouter, useNavigation } from 'expo-router';
import React, { useState, useLayoutEffect } from 'react';
import { Image, StyleSheet, Text, View, TouchableOpacity } from 'react-native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-controller';
import { Button } from '../../components/Button';
import { BadgeGroup } from '../../components/BadgeSelector';
import { Colors } from '../../constants/Colors';
import { Typography } from '../../constants/Typography';
import { useOnboarding } from '../../contexts/OnboardingContext';

const CATEGORY_OPTIONS = [
  { label: 'Self-care', value: 'self-care' },
  { label: 'Mindfulness', value: 'mindfulness' },
  { label: 'Motivation', value: 'motivation' },
  { label: 'Gratitude', value: 'gratitude' },
  { label: 'Confidence', value: 'confidence' },
  { label: 'Peace', value: 'peace' },
  { label: 'Growth', value: 'growth' },
  { label: 'Energy', value: 'energy' },
  { label: 'Overthinking', value: 'overthinking' },
  { label: 'Stress Relief', value: 'stress-relief' },
];

export default function CategoriesScreen() {
  const router = useRouter();
  const navigation = useNavigation();
  const { onboardingData, updateOnboardingData, completeOnboarding } = useOnboarding();
  const [selectedCategories, setSelectedCategories] = useState<string[]>(
    onboardingData.categories || []
  );

  const handleNext = () => {
    if (selectedCategories.length > 0) {
      updateOnboardingData({ categories: selectedCategories });
    }
    completeOnboarding();
    router.replace('/');
  };

  const handleSkip = () => {
    completeOnboarding();
    router.replace('/');
  };

  useLayoutEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <TouchableOpacity onPress={handleSkip} style={{ marginRight: 8 }}>
          <Text style={{ color: Colors.text.secondary, fontSize: 16 }}>
            Skip
          </Text>
        </TouchableOpacity>
      ),
    });
  }, [navigation]);

  return (
    <View style={styles.container}>
      <KeyboardAwareScrollView
        contentContainerStyle={styles.scrollContent}
        bottomOffset={40}
      >
        <View style={styles.mascotContainer}>
          <Image
            source={require('../../assets/images/mascot-alone.png')}
            style={styles.mascot}
            resizeMode="contain"
          />
        </View>

        <View style={styles.content}>
          <Text style={styles.title}>What brings you joy?</Text>
          <Text style={styles.subtitle}>
            We'll personalize your affirmations based on your interests
          </Text>

          <BadgeGroup
            options={CATEGORY_OPTIONS}
            selectedValues={selectedCategories}
            onValuesChange={setSelectedCategories}
            multiSelect={true}
            style={styles.badgeGroup}
          />
        </View>
      </KeyboardAwareScrollView>

      <View style={styles.buttonContainer}>
        <Button
          variant="primary"
          size="large"
          onPress={handleNext}
          style={styles.button}
        >
          Get Started
        </Button>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background.default,
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingTop: 20,
    paddingBottom: 40,
  },
  mascotContainer: {
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 30,
  },
  mascot: {
    width: 120,
    height: 120,
  },
  content: {
    flex: 1,
  },
  title: {
    ...Typography.h2,
    textAlign: 'center',
    marginBottom: 12,
  },
  subtitle: {
    ...Typography.subtitle,
    textAlign: 'center',
    marginBottom: 30,
  },
  badgeGroup: {
    marginBottom: 24,
  },
  buttonContainer: {
    padding: 24,
    backgroundColor: Colors.background.default,
  },
  button: {
    width: '100%',
  },
});
