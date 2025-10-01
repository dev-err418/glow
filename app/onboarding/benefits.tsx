import { useRouter } from 'expo-router';
import React from 'react';
import { Image, StyleSheet, Text, View } from 'react-native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-controller';
import { Button } from '../../components/Button';
import { Colors } from '../../constants/Colors';
import { Typography } from '../../constants/Typography';

export default function BenefitsScreen() {
  const router = useRouter();

  const handleContinue = () => {
    router.push('/onboarding/notifications');
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
          <Text style={styles.title}>The benefits of daily affirmations</Text>

          <View style={styles.benefitsContainer}>
            <BenefitItem
              emoji="💪"
              title="Boost Self-Confidence"
              description="Regular affirmations help build a positive self-image and strengthen your belief in yourself"
            />
            <BenefitItem
              emoji="🧘"
              title="Reduce Stress"
              description="Mindful moments throughout the day help you stay grounded and manage anxiety"
            />
            <BenefitItem
              emoji="✨"
              title="Increase Positivity"
              description="Daily reminders shift your mindset toward gratitude and optimism"
            />
            <BenefitItem
              emoji="🎯"
              title="Achieve Your Goals"
              description="Positive self-talk reinforces your capabilities and motivates action"
            />
          </View>
        </View>
      </KeyboardAwareScrollView>

      <View style={styles.buttonContainer}>
        <Button
          variant="primary"
          size="large"
          onPress={handleContinue}
          style={styles.button}
        >
          Continue
        </Button>
      </View>
    </View>
  );
}

interface BenefitItemProps {
  emoji: string;
  title: string;
  description: string;
}

function BenefitItem({ emoji, title, description }: BenefitItemProps) {
  return (
    <View style={styles.benefitItem}>
      <Text style={styles.benefitEmoji}>{emoji}</Text>
      <View style={styles.benefitTextContainer}>
        <Text style={styles.benefitTitle}>{title}</Text>
        <Text style={styles.benefitDescription}>{description}</Text>
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
    width: 140,
    height: 140,
  },
  content: {
    flex: 1,
  },
  title: {
    ...Typography.h2,
    textAlign: 'center',
    marginBottom: 30,
  },
  benefitsContainer: {
    marginBottom: 32,
  },
  benefitItem: {
    flexDirection: 'row',
    backgroundColor: Colors.background.primary,
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: Colors.shadow.light,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  benefitEmoji: {
    fontSize: 32,
    marginRight: 16,
  },
  benefitTextContainer: {
    flex: 1,
  },
  benefitTitle: {
    ...Typography.h5,
    marginBottom: 4,
  },
  benefitDescription: {
    ...Typography.bodySmall,
    color: Colors.text.secondary,
  },
  buttonContainer: {
    padding: 24,
    backgroundColor: Colors.background.default,
  },
  button: {
    width: '100%',
  },
});
