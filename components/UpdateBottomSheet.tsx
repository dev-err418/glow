import { Ionicons } from '@expo/vector-icons';
import BottomSheet, { BottomSheetBackdrop, BottomSheetView } from '@gorhom/bottom-sheet';
import type { BottomSheetDefaultBackdropProps } from '@gorhom/bottom-sheet/lib/typescript/components/bottomSheetBackdrop/types';
import React, { useCallback, useMemo } from 'react';
import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useColors } from '../constants/Colors';
import { Typography } from '../constants/Typography';

interface UpdateBottomSheetProps {
  isVisible: boolean;
  onUpdate: () => void;
  onLater: () => void;
  storeVersion?: string;
}

export function UpdateBottomSheet({ isVisible, onUpdate, onLater, storeVersion }: UpdateBottomSheetProps) {
  const Colors = useColors();
  const bottomSheetRef = React.useRef<BottomSheet>(null);
  const snapPoints = useMemo(() => [550], []);

  // Show/hide bottom sheet based on isVisible prop
  React.useEffect(() => {
    if (isVisible) {
      bottomSheetRef.current?.expand();
    } else {
      bottomSheetRef.current?.close();
    }
  }, [isVisible]);

  const renderBackdrop = useCallback(
    (props: BottomSheetDefaultBackdropProps) => (
      <BottomSheetBackdrop
        {...props}
        disappearsOnIndex={-1}
        appearsOnIndex={0}
        opacity={0.5}
      />
    ),
    []
  );

  const styles = StyleSheet.create({
  bottomSheetBackground: {
    backgroundColor: Colors.background.default,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
  },
  handleIndicator: {
    backgroundColor: Colors.secondary,
    width: 40,
    height: 4,
  },
  contentContainer: {
    paddingHorizontal: 24,
    paddingBottom: 40,
    paddingTop: 16,
    alignItems: 'center',
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 18,
    overflow: 'hidden',
    marginBottom: 20,
    shadowColor: Colors.shadow.medium,
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  appIcon: {
    width: '100%',
    height: '100%',
  },
  title: {
    ...Typography.h1,
    fontSize: 28,
    marginBottom: 12,
    textAlign: 'center',
  },
  description: {
    ...Typography.body,
    color: Colors.text.secondary,
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 22,
    paddingHorizontal: 8,
  },
  featuresList: {
    width: '100%',
    gap: 12,
    marginBottom: 32,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  featureText: {
    ...Typography.body,
    color: Colors.text.primary,
    fontSize: 15,
  },
  updateButton: {
    width: '100%',
    backgroundColor: Colors.primary,
    borderRadius: 16,
    paddingVertical: 18,
    paddingHorizontal: 24,
    marginBottom: 12,
    shadowColor: Colors.shadow.medium,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  updateButtonText: {
    ...Typography.body,
    color: Colors.text.white,
    fontSize: 17,
    fontWeight: '600',
    textAlign: 'center',
  },
  laterButton: {
    width: '100%',
    paddingVertical: 6,
  },
  laterButtonText: {
    ...Typography.body,
    color: Colors.text.secondary,
    fontSize: 15,
    textAlign: 'center',
  },
});

  return (
    <BottomSheet
      ref={bottomSheetRef}
      index={-1}
      snapPoints={snapPoints}
      enablePanDownToClose={true}
      backdropComponent={renderBackdrop}
      onClose={onLater}
      backgroundStyle={styles.bottomSheetBackground}
      handleIndicatorStyle={styles.handleIndicator}
    >
      <BottomSheetView style={styles.contentContainer}>
        {/* App Icon */}
        <View style={styles.iconContainer}>
          <Image
            source={require('../assets/images/icon.png')}
            style={styles.appIcon}
          />
        </View>

        {/* Title */}
        <Text style={styles.title}>Update Available</Text>

        {/* Description */}
        <Text style={styles.description}>
          A new version of Glow is available{storeVersion ? ` (v${storeVersion})` : ''}. Update now to enjoy the latest features, improvements, and bug fixes.
        </Text>

        {/* Features List */}
        <View style={styles.featuresList}>
          <View style={styles.featureItem}>
            <Ionicons name="sparkles" size={20} color={Colors.primary} />
            <Text style={styles.featureText}>New features & improvements</Text>
          </View>
          <View style={styles.featureItem}>
            <Ionicons name="shield-checkmark" size={20} color={Colors.primary} />
            <Text style={styles.featureText}>Bug fixes & performance</Text>
          </View>
          <View style={styles.featureItem}>
            <Ionicons name="heart" size={20} color={Colors.primary} />
            <Text style={styles.featureText}>Better user experience</Text>
          </View>
        </View>

        {/* Update Button */}
        <TouchableOpacity
          style={styles.updateButton}
          onPress={onUpdate}
          activeOpacity={0.8}
        >
          <Text style={styles.updateButtonText}>Update now</Text>
        </TouchableOpacity>

        {/* Later Button */}
        <TouchableOpacity
          style={styles.laterButton}
          onPress={onLater}
          activeOpacity={0.7}
        >
          <Text style={styles.laterButtonText}>Maybe Later</Text>
        </TouchableOpacity>
      </BottomSheetView>
    </BottomSheet>
  );
}
