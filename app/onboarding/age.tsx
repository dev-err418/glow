import { Button } from '@/components/Button';
import { RadioGroup } from '@/components/RadioCard';
import { useColors } from '@/constants/Colors';
import * as Haptics from 'expo-haptics';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { Image, StyleSheet, Text, View } from 'react-native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-controller';
import { Typography } from '../../constants/Typography';
import { useOnboarding } from '../../contexts/OnboardingContext';

const AGE_OPTIONS = [
  { label: '18-24', value: '18-24' },
  { label: '25-34', value: '25-34' },
  { label: '35-44', value: '35-44' },
  { label: '45-54', value: '45-54' },
  { label: '55+', value: '55+' },
];

export default function AgeScreen() {
  const Colors = useColors();

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background.default,
  },
  scrollContent: {
    flexGrow: 1,
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
  const { onboardingData, updateOnboardingData } = useOnboarding();
  const [selectedAge, setSelectedAge] = useState(onboardingData.age || '');

  const handleNext = () => {
    if (!selectedAge) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    updateOnboardingData({ age: selectedAge });
    router.push('/onboarding/sex');
  };

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
          <Text style={styles.title}>How old are you?</Text>
          <Text style={styles.subtitle}>
            This helps me tailor your experience
          </Text>

          <RadioGroup
            options={AGE_OPTIONS}
            selectedValue={selectedAge}
            onValueChange={setSelectedAge}
            style={styles.radioGroup}
          />           
        </View>
      </KeyboardAwareScrollView>

      <View style={styles.buttonContainer}>
        <Button
          variant="primary"
          size="large"
          onPress={handleNext}
          disabled={!selectedAge}
          style={styles.button}
        >
          Next
        </Button>
      </View>
    </View>
  );
}
