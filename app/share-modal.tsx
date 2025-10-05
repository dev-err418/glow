import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import * as Sharing from 'expo-sharing';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
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
  const [isSharing, setIsSharing] = useState(false);

  const handleShare = async () => {
    try {
      setIsSharing(true);
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

      // Capture the view as an image
      const uri = await viewShotRef.current?.capture?.();

      if (!uri) {
        throw new Error('Failed to capture image');
      }

      // Check if sharing is available
      const isAvailable = await Sharing.isAvailableAsync();

      if (!isAvailable) {
        Alert.alert('Sharing not available', 'Sharing is not available on this device');
        return;
      }

      // Share the image
      await Sharing.shareAsync(uri, {
        mimeType: 'image/png',
        dialogTitle: 'Share your quote',
      });

    } catch (error) {
      console.error('Error sharing:', error);
      Alert.alert('Error', 'Failed to share the image. Please try again.');
    } finally {
      setIsSharing(false);
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

      {/* Quote Display - Shareable Image */}
      <View style={styles.content}>
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
            <View style={styles.quoteSection}>
              <Text style={styles.quoteText}>{params.text}</Text>
            </View>

            {/* Bottom Section with Mascot */}
            <View style={styles.bottomSection}>
              <Image
                source={require('../assets/images/mascot-alone.png')}
                style={styles.mascotImage}
                resizeMode="contain"
              />
              <View style={styles.brandingSection}>
                <Text style={styles.appName}>Glow</Text>
                {params.category && (
                  <Text style={styles.categoryText}>{params.category}</Text>
                )}
              </View>
            </View>
          </View>
        </ViewShot>

        {/* Share Button */}
        <TouchableOpacity
          style={styles.shareButton}
          onPress={handleShare}
          disabled={isSharing}
        >
          {isSharing ? (
            <ActivityIndicator color={Colors.text.white} />
          ) : (
            <>
              <Ionicons name="share-outline" size={24} color={Colors.text.white} />
              <Text style={styles.shareButtonText}>Share Image</Text>
            </>
          )}
        </TouchableOpacity>
      </View>
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
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
    gap: 24,
  },
  viewShotContainer: {
    backgroundColor: 'transparent',
  },
  shareableCard: {
    backgroundColor: Colors.background.primary,
    borderRadius: 30,
    padding: 40,
    width: 350,
    minHeight: 500,
    shadowColor: Colors.shadow.dark,
    shadowOffset: {
      width: 0,
      height: 8,
    },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 12,
  },
  quoteSection: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 20,
  },
  quoteText: {
    ...Typography.h2,
    fontSize: 26,
    lineHeight: 36,
    textAlign: 'center',
    color: Colors.text.primary,
  },
  bottomSection: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    marginTop: 20,
  },
  mascotImage: {
    width: 80,
    height: 80,
  },
  brandingSection: {
    flex: 1,
    alignItems: 'flex-end',
    justifyContent: 'flex-end',
    paddingBottom: 8,
  },
  appName: {
    ...Typography.h3,
    fontSize: 24,
    color: Colors.primary,
    fontWeight: '600',
  },
  categoryText: {
    ...Typography.body,
    fontSize: 14,
    color: Colors.text.secondary,
    textTransform: 'capitalize',
    marginTop: 4,
  },
  shareButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.primary,
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 30,
    gap: 12,
    minWidth: 200,
    shadowColor: Colors.shadow.dark,
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  shareButtonText: {
    ...Typography.h3,
    fontSize: 18,
    color: Colors.text.white,
  },
});
