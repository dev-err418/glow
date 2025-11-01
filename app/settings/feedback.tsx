import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { Alert, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { KeyboardAwareScrollView, KeyboardStickyView } from 'react-native-keyboard-controller';
import Purchases from 'react-native-purchases';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Button } from '../../components/Button';
import { useColors } from '../../constants/Colors';
import { Typography } from '../../constants/Typography';
import { submitFeedback } from '../../services/supabaseService';

export default function FeedbackScreen() {
  const Colors = useColors();

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background.default,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 16,
    backgroundColor: Colors.background.default,
  },
  headerButton: {
    minWidth: 80,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingTop: 20,
    paddingBottom: 40,
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
    textAlign: 'center',
    marginBottom: 40,
    color: Colors.text.secondary,
  },
  textArea: {
    ...Typography.body,
    backgroundColor: Colors.background.primary,
    borderRadius: 12,
    padding: 16,
    color: Colors.text.primary,
    minHeight: 180,
  },
  characterCount: {
    ...Typography.bodySmall,
    fontSize: 12,
    color: Colors.text.light,
    textAlign: 'right',
    marginTop: 8,
  },
  buttonContainer: {
    paddingHorizontal: 24,
    paddingVertical: 24,
  },
  button: {
    width: '100%',
  },
});

  const router = useRouter();
  const [feedback, setFeedback] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleClose = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.back();
  };

  const handleSend = async () => {
    if (!feedback.trim()) {
      Alert.alert('Empty feedback', 'Please enter your feedback before sending.');
      return;
    }

    setIsSubmitting(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    try {
      // Get RevenueCat user ID
      const customerInfo = await Purchases.getCustomerInfo();
      const revenueCatUserId = customerInfo.originalAppUserId;

      // Submit feedback
      const result = await submitFeedback(revenueCatUserId, feedback.trim());

      if (result.success) {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        Alert.alert(
          'Thank you!',
          'Your feedback has been sent successfully. We appreciate your input!',
          [
            {
              text: 'OK',
              onPress: () => router.back(),
            },
          ]
        );
      } else {
        throw new Error(result.error || 'Failed to submit feedback');
      }
    } catch (error) {
      console.error('Error submitting feedback:', error);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      Alert.alert(
        'Error',
        'Failed to send feedback. Please try again later.'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Close Button */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={handleClose}
          style={styles.headerButton}
        >
          <Ionicons name="close" size={28} color={Colors.text.primary} />
        </TouchableOpacity>
      </View>

      <KeyboardAwareScrollView
        contentContainerStyle={styles.scrollContent}
        bottomOffset={24}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.content}>
          <Text style={styles.title}>Send us your feedback</Text>
          <Text style={styles.subtitle}>
            We'd love to hear your thoughts, suggestions, or any issues you've encountered.
          </Text>

          <TextInput
            style={styles.textArea}
            value={feedback}
            onChangeText={setFeedback}
            placeholder="Write your feedback here..."
            placeholderTextColor={Colors.text.light}
            multiline
            numberOfLines={8}
            textAlignVertical="top"
            maxLength={1000}
          />

          <Text style={styles.characterCount}>
            {feedback.length}/1000
          </Text>
        </View>
      </KeyboardAwareScrollView>

      <KeyboardStickyView offset={{ closed: 0, opened: 15 }}>
        <View style={styles.buttonContainer}>
          <Button
            variant="primary"
            size="large"
            onPress={handleSend}
            disabled={isSubmitting}
            loading={isSubmitting}
            style={styles.button}
          >
            Send Feedback
          </Button>
        </View>
      </KeyboardStickyView>
    </SafeAreaView>
  );
}
