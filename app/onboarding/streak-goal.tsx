import * as Haptics from 'expo-haptics';
import { useNavigation, useRouter } from 'expo-router';
import React, { useLayoutEffect, useState } from 'react';
import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-controller';
import { Button } from '../../components/Button';
import { RadioGroup } from '../../components/RadioCard';
import { useColors } from '../../constants/Colors';
import { Typography } from '../../constants/Typography';
import { useOnboarding } from '../../contexts/OnboardingContext';

const STREAK_GOAL_OPTIONS = [
  { label: '3 days in a row - Small start', value: '3' },
  { label: '7 days in a row - One week', value: '7' },
  { label: '14 days in a row - Two weeks', value: '14' },
  { label: '30 days in a row - One month', value: '30' },
];

export default function StreakGoalScreen() {
  const Colors = useColors();

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background.default,
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingTop: 20,
    paddingBottom: 100,
  },
  mascotContainer: {
    alignItems: 'center',
    marginTop: 10,
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
    color: Colors.text.primary,
    textAlign: 'center',
    marginBottom: 12,
  },
  subtitle: {
    ...Typography.subtitle,
    color: Colors.text.secondary,
    textAlign: 'center',
    marginBottom: 30,
  },
  radioGroup: {
    marginBottom: 24,
  },
  buttonContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 24,
  },
  button: {
    width: '100%',
  },
});

  const router = useRouter();
  const navigation = useNavigation();
  const { onboardingData, updateOnboardingData, completeOnboarding } = useOnboarding();
  const [selectedGoal, setSelectedGoal] = useState(onboardingData.streakGoal?.toString() || '');

  const handleNext = () => {
    if (selectedGoal) {
      updateOnboardingData({ streakGoal: parseInt(selectedGoal) });
    }
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    router.push('/onboarding/categories');
  };

  const handleSkip = () => {
    router.push('/onboarding/categories');
  };

  useLayoutEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <TouchableOpacity onPress={handleSkip} style={{ marginHorizontal: 4 }}>
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
          <Text style={styles.title}>What's your streak goal?</Text>
          <Text style={styles.subtitle}>
            Choose your daily commitment to self-care
          </Text>

          <RadioGroup
            options={STREAK_GOAL_OPTIONS}
            selectedValue={selectedGoal}
            onValueChange={setSelectedGoal}
            style={styles.radioGroup}
          />
        </View>
      </KeyboardAwareScrollView>

      <View style={styles.buttonContainer}>
        <Button
          variant="primary"
          size="large"
          onPress={handleNext}
          disabled={!selectedGoal}
          style={styles.button}
        >
          Next
        </Button>
      </View>
    </View>
  );
}
