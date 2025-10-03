import { Ionicons } from '@expo/vector-icons';
import * as Clipboard from 'expo-clipboard';
import * as Haptics from 'expo-haptics';
import * as MediaLibrary from 'expo-media-library';
import { Image } from 'expo-image';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useRef, useState } from 'react';
import {
  Alert,
  Linking,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import ViewShot from 'react-native-view-shot';
import { Colors } from '../constants/Colors';
import { Typography } from '../constants/Typography';

export default function ShareModal() {
  const router = useRouter();
  const params = useLocalSearchParams<{ text: string; category: string }>();
  const viewShotRef = useRef<ViewShot>(null);
  const [capturedImageUri, setCapturedImageUri] = useState<string | null>(null);
  const [isCapturing, setIsCapturing] = useState(false);

  const captureImage = async () => {
    if (!viewShotRef.current) return null;

    try {
      setIsCapturing(true);
      const uri = await viewShotRef.current.capture();
      setCapturedImageUri(uri);
      return uri;
    } catch (error) {
      console.error('Error capturing image:', error);
      Alert.alert('Error', 'Failed to create image');
      return null;
    } finally {
      setIsCapturing(false);
    }
  };

  const handleSaveImage = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    try {
      // Request permissions
      const { status } = await MediaLibrary.requestPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Required', 'Please allow access to save images to your photo library.');
        return;
      }

      // Capture or use existing image
      const imageUri = capturedImageUri || await captureImage();
      if (!imageUri) return;

      // Save to media library
      await MediaLibrary.saveToLibraryAsync(imageUri);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      Alert.alert('Success', 'Image saved to your photo library!');
    } catch (error) {
      console.error('Error saving image:', error);
      Alert.alert('Error', 'Failed to save image');
    }
  };

  const handleCopyText = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    try {
      await Clipboard.setStringAsync(params.text);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      Alert.alert('Copied', 'Quote copied to clipboard!');
    } catch (error) {
      console.error('Error copying text:', error);
      Alert.alert('Error', 'Failed to copy text');
    }
  };

  const handleShareToMessages = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    try {
      const imageUri = capturedImageUri || await captureImage();
      if (!imageUri) return;

      // iOS Messages URL scheme
      if (Platform.OS === 'ios') {
        const canOpen = await Linking.canOpenURL('sms:');
        if (canOpen) {
          await Linking.openURL('sms:');
        } else {
          Alert.alert('Not Available', 'Messages app is not available');
        }
      } else {
        // Android SMS
        const canOpen = await Linking.canOpenURL('sms:');
        if (canOpen) {
          await Linking.openURL('sms:');
        } else {
          Alert.alert('Not Available', 'Messages app is not available');
        }
      }
    } catch (error) {
      console.error('Error opening Messages:', error);
      Alert.alert('Error', 'Failed to open Messages');
    }
  };

  const handleShareToWhatsApp = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    try {
      const imageUri = capturedImageUri || await captureImage();
      if (!imageUri) return;

      // WhatsApp URL scheme
      const whatsappUrl = 'whatsapp://send';
      const canOpen = await Linking.canOpenURL(whatsappUrl);

      if (canOpen) {
        await Linking.openURL(whatsappUrl);
      } else {
        Alert.alert('Not Available', 'WhatsApp is not installed on this device');
      }
    } catch (error) {
      console.error('Error opening WhatsApp:', error);
      Alert.alert('Error', 'Failed to open WhatsApp');
    }
  };

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
        <Text style={styles.modalTitle}>Share Quote</Text>
        <View style={styles.headerButton} />
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Quote Card - This will be captured as an image */}
        <View style={styles.previewContainer}>
          <ViewShot
            ref={viewShotRef}
            options={{
              format: 'png',
              quality: 1.0,
            }}
          >
            <View style={styles.quoteCard}>
              {/* Quote Text */}
              <View style={styles.quoteTextContainer}>
                <Text style={styles.quoteText}>{params.text}</Text>
              </View>

              {/* Branding Section */}
              <View style={styles.brandingContainer}>
                <View style={styles.brandingContent}>
                  <Image
                    source={require('../assets/images/icon.png')}
                    style={styles.appIcon}
                    contentFit="contain"
                  />
                  <Text style={styles.appName}>Glow</Text>
                </View>
              </View>
            </View>
          </ViewShot>
        </View>

        {/* Action Buttons */}
        <View style={styles.actionsContainer}>
          {/* Save Image Button */}
          <TouchableOpacity
            style={styles.primaryButton}
            onPress={handleSaveImage}
            disabled={isCapturing}
            activeOpacity={0.7}
          >
            <Ionicons name="download-outline" size={24} color={Colors.text.white} />
            <Text style={styles.primaryButtonText}>Save Image</Text>
          </TouchableOpacity>

          {/* Copy Text Button */}
          <TouchableOpacity
            style={styles.primaryButton}
            onPress={handleCopyText}
            activeOpacity={0.7}
          >
            <Ionicons name="copy-outline" size={24} color={Colors.text.white} />
            <Text style={styles.primaryButtonText}>Copy Text</Text>
          </TouchableOpacity>

          {/* Share Buttons Row */}
          <View style={styles.shareButtonsRow}>
            {/* Message Button */}
            <TouchableOpacity
              style={styles.shareButton}
              onPress={handleShareToMessages}
              disabled={isCapturing}
              activeOpacity={0.7}
            >
              <View style={styles.shareButtonIcon}>
                <Ionicons name="chatbubble-outline" size={28} color={Colors.primary} />
              </View>
              <Text style={styles.shareButtonText}>Message</Text>
            </TouchableOpacity>

            {/* WhatsApp Button */}
            <TouchableOpacity
              style={styles.shareButton}
              onPress={handleShareToWhatsApp}
              disabled={isCapturing}
              activeOpacity={0.7}
            >
              <View style={styles.shareButtonIcon}>
                <Ionicons name="logo-whatsapp" size={28} color="#25D366" />
              </View>
              <Text style={styles.shareButtonText}>WhatsApp</Text>
            </TouchableOpacity>
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
  modalTitle: {
    ...Typography.h3,
    flex: 1,
    textAlign: 'center',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  previewContainer: {
    marginTop: 20,
    marginBottom: 30,
  },
  quoteCard: {
    backgroundColor: Colors.background.primary,
    borderRadius: 20,
    padding: 40,
    minHeight: 400,
    justifyContent: 'space-between',
    shadowColor: Colors.shadow.dark,
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
  },
  quoteTextContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 20,
  },
  quoteText: {
    ...Typography.h2,
    fontSize: 28,
    lineHeight: 38,
    textAlign: 'center',
    color: Colors.text.primary,
  },
  brandingContainer: {
    marginTop: 40,
    paddingTop: 20,
    borderTopWidth: 2,
    borderTopColor: Colors.border.light,
  },
  brandingContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  appIcon: {
    width: 40,
    height: 40,
    marginRight: 12,
  },
  appName: {
    fontSize: 24,
    fontWeight: '700',
    color: Colors.primary,
    letterSpacing: 0.5,
  },
  actionsContainer: {
    gap: 16,
  },
  primaryButton: {
    backgroundColor: Colors.primary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 18,
    paddingHorizontal: 24,
    borderRadius: 16,
    gap: 10,
    shadowColor: Colors.shadow.dark,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  primaryButtonText: {
    ...Typography.button,
    color: Colors.text.white,
    fontSize: 18,
    fontWeight: '600',
  },
  shareButtonsRow: {
    flexDirection: 'row',
    gap: 16,
    marginTop: 8,
  },
  shareButton: {
    flex: 1,
    alignItems: 'center',
    gap: 8,
  },
  shareButtonIcon: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: Colors.background.primary,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: Colors.shadow.medium,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3,
  },
  shareButtonText: {
    ...Typography.body,
    fontSize: 14,
    fontWeight: '600',
    color: Colors.text.secondary,
  },
});
