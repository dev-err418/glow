import React, { useState } from 'react';
import { View, Text, StyleSheet, Image } from 'react-native';
import { useRouter } from 'expo-router';
import { KeyboardAwareScrollView } from 'react-native-keyboard-controller';
import * as Haptics from 'expo-haptics';
import { Colors } from '../../constants/Colors';
import { Typography } from '../../constants/Typography';
import { Button } from '../../components/Button';
import { RadioGroup } from '../../components/RadioCard';
import { useOnboarding } from '../../contexts/OnboardingContext';

const SEX_OPTIONS = [
  { label: 'Female', value: 'female' },
  { label: 'Male', value: 'male' },
  { label: 'Others', value: 'others' },
  { label: 'Prefer not to say', value: 'prefer-not-to-say' },
];

export default function SexScreen() {
  const router = useRouter();
  const { onboardingData, updateOnboardingData } = useOnboarding();
  const [selectedSex, setSelectedSex] = useState(onboardingData.sex || '');

  const handleNext = () => {
    if (!selectedSex) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    updateOnboardingData({ sex: selectedSex });
    router.push('/onboarding/mental-health');
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
          <Text style={styles.title}>How do you identify?</Text>
          <Text style={styles.subtitle}>
            Help me personalize your journey
          </Text>

          <RadioGroup
            options={SEX_OPTIONS}
            selectedValue={selectedSex}
            onValueChange={setSelectedSex}
            style={styles.radioGroup}
          />
        </View>
      </KeyboardAwareScrollView>

      <View style={styles.buttonContainer}>
        <Button
          variant="primary"
          size="large"
          onPress={handleNext}
          disabled={!selectedSex}
          style={styles.button}
        >
          Next
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
    textAlign: 'center',
    marginBottom: 12,
  },
  subtitle: {
    ...Typography.subtitle,
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
