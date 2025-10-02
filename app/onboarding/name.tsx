import * as Haptics from 'expo-haptics';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { Image, StyleSheet, Text, View } from 'react-native';
import { KeyboardAwareScrollView, KeyboardStickyView } from 'react-native-keyboard-controller';
import { Button } from '../../components/Button';
import { Input } from '../../components/Input';
import { Colors } from '../../constants/Colors';
import { Typography } from '../../constants/Typography';
import { useOnboarding } from '../../contexts/OnboardingContext';

export default function NameScreen() {
  const router = useRouter();
  const { updateOnboardingData } = useOnboarding();
  const [name, setName] = useState('');
  const [error, setError] = useState('');

  const handleNext = () => {
    if (name.trim().length < 2) {
      setError('Please enter your name');
      return;
    }
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    updateOnboardingData({ name: name.trim() });
    router.push('/onboarding/age');
  };

  return (
    <View style={styles.container}>
      <KeyboardAwareScrollView
        contentContainerStyle={styles.scrollContent}
        bottomOffset={24}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.mascotContainer}>
          <Image
            source={require('../../assets/images/mascot-alone.png')}
            style={styles.mascot}
            resizeMode="contain"
          />
        </View>

        <View style={styles.content}>
          <Text style={styles.title}>What's your name?</Text>
          <Text style={styles.subtitle}>
            I'd love to get to know you better!
          </Text>

          <Input
            placeholder="Enter your name"
            value={name}
            onChangeText={(text) => {
              setName(text);
              setError('');
            }}
            error={error}
            autoFocus
            autoCorrect={false}
            autoCapitalize="words"
            spellCheck={false}
            returnKeyType="done"
            onSubmitEditing={handleNext}
            containerStyle={styles.inputContainer}
          />
        </View>
      </KeyboardAwareScrollView>

      <KeyboardStickyView offset={{ closed: 0, opened: 15 }}>
        <View style={styles.buttonContainer}>
          <Button
            variant="primary"
            size="large"
            onPress={handleNext}
            style={styles.button}
          >
            Next
          </Button>
        </View>
      </KeyboardStickyView>
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
    paddingBottom: 40,
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
    marginBottom: 40,
  },
  inputContainer: {
    marginBottom: 24,
  },
  buttonContainer: {
    paddingHorizontal: 24,
    paddingVertical: 24,
  },
  button: {
    width: '100%',
  },
});
