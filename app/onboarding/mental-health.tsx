import * as Haptics from 'expo-haptics';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { Image, StyleSheet, Text, View } from 'react-native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-controller';
import { BadgeGroup } from '../../components/BadgeSelector';
import { Button } from '../../components/Button';
import { Colors } from '../../constants/Colors';
import { Typography } from '../../constants/Typography';
import { useOnboarding } from '../../contexts/OnboardingContext';

const MENTAL_HEALTH_OPTIONS = [
  { label: '🧘 Meditation', value: 'meditation' },
  { label: '💪 Exercise', value: 'exercise' },  
  { label: '👥 Socializing', value: 'socializing' },
  { label: '🌿 Nature', value: 'nature' },
  { label: '📝 Journaling', value: 'journaling' },
  { label: '🧠 Therapy', value: 'therapy' },
  { label: '📚 Reading', value: 'reading' },
  { label: '🎵 Music', value: 'music' },
  { label: '🎨 Art', value: 'art' },
  { label: '🌬️ Breathing exercises', value: 'breathing' },
  { label: '✨ Other', value: 'other' },
];

export default function MentalHealthScreen() {
  const router = useRouter();
  const { onboardingData, updateOnboardingData } = useOnboarding();
  const [selectedMethods, setSelectedMethods] = useState<string[]>(
    onboardingData.mentalHealthMethods || []
  );

  const handleNext = () => {
    if (selectedMethods.length === 0) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    updateOnboardingData({ mentalHealthMethods: selectedMethods });
    router.push('/onboarding/benefits');
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
          <Text style={styles.title}>How do you improve your mental health?</Text>
          <Text style={styles.subtitle}>
            Select all that work for you
          </Text>

          <BadgeGroup
            options={MENTAL_HEALTH_OPTIONS}
            selectedValues={selectedMethods}
            onValuesChange={setSelectedMethods}
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
          disabled={selectedMethods.length === 0}
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
    paddingHorizontal: 24,
    paddingTop: 20,
    paddingBottom: 70,
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
  badgeGroup: {
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
