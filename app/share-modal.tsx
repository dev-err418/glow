import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Clipboard from 'expo-clipboard';
import * as Haptics from 'expo-haptics';
import * as MediaLibrary from 'expo-media-library';
import { useLocalSearchParams, useRouter } from 'expo-router';
import * as Sharing from 'expo-sharing';
import * as StoreReview from 'expo-store-review';
import React, { useEffect, useRef, useState } from 'react';
import {
  Alert,
  Image,
  Linking,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import ViewShot from 'react-native-view-shot';
import { useColors } from '../constants/Colors';
import { Typography } from '../constants/Typography';

export default function ShareModal() {
  const Colors = useColors();

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
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
    gap: 24,
  },
  viewShotWrapper: {
    shadowColor: '#000000',
    shadowOffset: {
      width: 0,
      height: 20,
    },
    shadowOpacity: 0.45,
    shadowRadius: 40,
    elevation: 24,
  },
  viewShotContainer: {
    backgroundColor: 'transparent',
  },
  shareableCard: {
    backgroundColor: Colors.background.default,
    borderRadius: 30,
    padding: 48,
    width: 340,
    height: 500,
    justifyContent: 'center',
    overflow: 'hidden',
  },
  quoteText: {
    ...Typography.h2,
    fontSize: 30,
    lineHeight: 42,
    textAlign: 'center',
    color: Colors.text.primary,
  },
  mascotImage: {
    width: 200,
    height: 200,
    position: 'absolute',
    left: -40,
    bottom: -60,
    transform: [{rotate: "10deg"}]
  },
  badgeScroll: {
    maxHeight: 50,
    paddingHorizontal: 28,    
    marginHorizontal: -20,
  },
  badgeScrollContent: {
    gap: 8,
    paddingRight: 28,
  },
  actionBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.background.primary,
    borderRadius: 30,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: Colors.border.light,
    gap: 8,
    shadowColor: Colors.shadow.light,
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 1,
  },
  actionBadgeSelected: {
    backgroundColor: Colors.background.primary,
    borderColor: Colors.secondary,
  },
  badgeLabel: {
    ...Typography.body,
    fontSize: 15,
    color: Colors.text.primary,
  },
  badgeLabelSelected: {
    color: Colors.secondary,
  },
  sharingRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 20,
    marginTop: 12,
  },
  shareIconButton: {
    alignItems: 'center',
    gap: 6,
  },
  shareIconCircle: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: Colors.background.primary,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.border.light,
    shadowColor: Colors.shadow.light,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3,
  },
  shareIconLabel: {
    ...Typography.body,
    fontSize: 11,
    color: Colors.text.primary,
    textAlign: 'center',
  },
});

  const router = useRouter();
  const params = useLocalSearchParams<{ text: string; category: string }>();
  const viewShotRef = useRef<ViewShot>(null);
  const [mascotReading, setMascotReading] = useState(false);

  // Request review on first share modal open
  useEffect(() => {
    const checkAndRequestReview = async () => {
      try {
        const hasRequestedReview = await AsyncStorage.getItem('hasRequestedReviewForShare');
        if (!hasRequestedReview) {
          // First time opening share modal - request review
          await AsyncStorage.setItem('hasRequestedReviewForShare', 'true');
          StoreReview.requestReview();
        }
      } catch (error) {
        console.error('Error checking/requesting review for share:', error);
      }
    };

    checkAndRequestReview();
  }, []);

  const handleSaveImage = async () => {
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

      // Request media library permissions
      const { status } = await MediaLibrary.requestPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission required', 'Please grant photo library access to save the image.');
        return;
      }

      // Capture the view as an image
      const uri = await viewShotRef.current?.capture?.();

      if (!uri) {
        throw new Error('Failed to capture image');
      }

      // Save to media library
      await MediaLibrary.saveToLibraryAsync(uri);

      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      Alert.alert('Success', 'Image saved to your photo library!');

    } catch (error) {
      console.error('Error saving image:', error);
      Alert.alert('Error', 'Failed to save the image. Please try again.');
    }
  };

  const handleToggleMascot = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setMascotReading(!mascotReading);
  };

  const handleCopyText = async () => {
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      await Clipboard.setStringAsync(params.text);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      Alert.alert('Copied!', 'Quote text copied to clipboard.');
    } catch (error) {
      console.error('Error copying text:', error);
      Alert.alert('Error', 'Failed to copy text. Please try again.');
    }
  };

  const handleShareMessages = async () => {
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      const messageText = `${params.text}\n\nFrom "Glow - Your daily light" app`;
      const smsUrl = `sms:&body=${encodeURIComponent(messageText)}`;
      const canOpen = await Linking.canOpenURL(smsUrl);
      if (canOpen) {
        await Linking.openURL(smsUrl);
      } else {
        Alert.alert('Error', 'Failed to share via Messages.');
      }
    } catch (error) {
      console.error('Error sharing via Messages:', error);
      Alert.alert('Error', 'Failed to share via Messages.');
    }
  };

  const handleShareWhatsApp = async () => {
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      const messageText = `${params.text}\n\nFrom "Glow - Your daily light" app`;
      const whatsappUrl = `whatsapp://send?text=${encodeURIComponent(messageText)}`;
      const canOpen = await Linking.canOpenURL(whatsappUrl);
      if (canOpen) {
        await Linking.openURL(whatsappUrl);
      } else {
        Alert.alert('WhatsApp not installed', 'Please install WhatsApp to use this feature.');
      }
    } catch (error) {
      console.error('Error sharing via WhatsApp:', error);
      Alert.alert('Error', 'Failed to share via WhatsApp.');
    }
  };

  const handleShareMore = async () => {
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

      const uri = await viewShotRef.current?.capture?.();
      if (!uri) {
        throw new Error('Failed to capture image');
      }

      const isAvailable = await Sharing.isAvailableAsync();
      if (!isAvailable) {
        Alert.alert('Sharing not available', 'Sharing is not available on this device');
        return;
      }

      await Sharing.shareAsync(uri, {
        mimeType: 'image/png',
        dialogTitle: 'Share your quote',
      });
    } catch (error) {
      console.error('Error sharing:', error);
      Alert.alert('Error', 'Failed to share the image.');
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
        <View style={styles.headerButton} />
      </View>

      {/* Quote Display - Shareable Image */}
      <View style={styles.content}>
        <View style={styles.viewShotWrapper}>
          <ViewShot
            ref={viewShotRef}
            options={{
              format: 'png',
              quality: 1.0,
            }}
            style={styles.viewShotContainer}
          >
            <View style={styles.shareableCard}>
              {/* Quote Text */}
              <Text style={styles.quoteText}>{params.text}</Text>

              {/* Mascot peeking from bottom-left (cropped by card border) */}
              <Image
                source={
                  mascotReading
                    ? require('../assets/images/mascot-alone-reading.png')
                    : require('../assets/images/mascot-alone.png')
                }
                style={styles.mascotImage}
                resizeMode="contain"
              />
            </View>
          </ViewShot>
        </View>

        {/* Badge Action Buttons - Horizontal Scroll */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.badgeScrollContent}
          style={styles.badgeScroll}
        >
          <TouchableOpacity
            style={styles.actionBadge}
            onPress={handleSaveImage}
            activeOpacity={0.7}
          >
            <Ionicons name="download-outline" size={18} color={Colors.text.primary} />
            <Text style={styles.badgeLabel}>Save Image</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.actionBadge, mascotReading && styles.actionBadgeSelected]}
            onPress={handleToggleMascot}
            activeOpacity={0.7}
          >
            <Ionicons
              name="shirt-outline"
              size={18}
              color={mascotReading ? Colors.secondary : Colors.text.primary}
            />
            <Text style={[styles.badgeLabel, mascotReading && styles.badgeLabelSelected]}>
              Change Glow outfit
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionBadge}
            onPress={handleCopyText}
            activeOpacity={0.7}
          >
            <Ionicons name="copy-outline" size={18} color={Colors.text.primary} />
            <Text style={styles.badgeLabel}>Copy text</Text>
          </TouchableOpacity>
        </ScrollView>

        {/* Native Sharing Buttons - Right Aligned */}
        <View style={styles.sharingRow}>
          <TouchableOpacity
            style={styles.shareIconButton}
            onPress={handleShareMessages}
            activeOpacity={0.7}
          >
            <View style={styles.shareIconCircle}>
              <Ionicons name="chatbubble-outline" size={22} color={Colors.text.primary} />
            </View>
            <Text style={styles.shareIconLabel}>Messages</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.shareIconButton}
            onPress={handleShareWhatsApp}
            activeOpacity={0.7}
          >
            <View style={styles.shareIconCircle}>
              <Ionicons name="logo-whatsapp" size={22} color="#25D366" />
            </View>
            <Text style={styles.shareIconLabel}>WhatsApp</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.shareIconButton}
            onPress={handleShareMore}
            activeOpacity={0.7}
          >
            <View style={styles.shareIconCircle}>
              <Ionicons name="share-outline" size={22} color={Colors.text.primary} />
            </View>
            <Text style={styles.shareIconLabel}>Share more</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}
