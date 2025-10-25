import * as Haptics from 'expo-haptics';
import { useRouter } from 'expo-router';
import React, { useRef, useState } from 'react';
import { Animated, Image, StyleSheet, Text, View } from 'react-native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-controller';
import { Button } from '../../components/Button';
import { Colors } from '../../constants/Colors';
import { Typography } from '../../constants/Typography';

export default function BenefitsScreen() {
  const router = useRouter();
  const [visibleBenefits, setVisibleBenefits] = useState(1);
  const [isAnimating, setIsAnimating] = useState(false);

  // Animated values for benefits 2 and 3
  const benefit2Opacity = useRef(new Animated.Value(0)).current;
  const benefit2TranslateY = useRef(new Animated.Value(20)).current;
  const benefit3Opacity = useRef(new Animated.Value(0)).current;
  const benefit3TranslateY = useRef(new Animated.Value(20)).current;

  const handleContinue = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    if (isAnimating) return; // Prevent rapid tapping

    if (visibleBenefits < 3) {
      // Show next benefit
      setIsAnimating(true);
      const nextBenefit = visibleBenefits + 1;
      setVisibleBenefits(nextBenefit);

      // Select which benefit to animate
      const opacity = nextBenefit === 2 ? benefit2Opacity : benefit3Opacity;
      const translateY = nextBenefit === 2 ? benefit2TranslateY : benefit3TranslateY;

      Animated.parallel([
        Animated.timing(opacity, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(translateY, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start(() => {
        setIsAnimating(false);
      });
    } else {
      // All benefits shown, navigate to next screen
      router.push('/onboarding/notifications');
    }
  };

  return (
    <View style={styles.container}>
      <KeyboardAwareScrollView
        contentContainerStyle={styles.scrollContent}        
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
            {/* Benefit 1 - Always visible */}
            <BenefitItem
              emoji="🧘"
              title="Reduce stress"
              description="Mindful moments throughout the day help you stay grounded and manage anxiety"
            />

            {/* Benefit 2 - Animated reveal (winter/SAD focused) */}
            <Animated.View
              style={{
                opacity: benefit2Opacity,
                transform: [{ translateY: benefit2TranslateY }],
              }}
            >
              <BenefitItem
                emoji="☀️"
                title="Fight seasonal blues"
                description="Gentle support designed for those dark days when getting out of bed feels impossible"
              />
            </Animated.View>

            {/* Benefit 3 - Animated reveal */}
            <Animated.View
              style={{
                opacity: benefit3Opacity,
                transform: [{ translateY: benefit3TranslateY }],
              }}
            >
              <BenefitItem
                emoji="🎯"
                title="Achieve your goals"
                description="Positive self-talk reinforces your capabilities and motivates action"
              />
            </Animated.View>
          </View>
        </View>
      </KeyboardAwareScrollView>

      <View style={styles.buttonContainer}>
        <Button
          variant="primary"
          size="large"
          onPress={handleContinue}
          disabled={isAnimating}
          style={styles.button}
        >
          Next
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
    paddingBottom: 50,
  },
  mascotContainer: {
    alignItems: 'center',
    marginTop: 10,
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
