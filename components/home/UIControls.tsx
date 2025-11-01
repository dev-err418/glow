import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import React from 'react';
import {
  Animated,
  StyleSheet,
  Text,
  TouchableOpacity
} from 'react-native';
import { useColors } from '../../constants/Colors';

interface UIControlsProps {
  uiOpacity: Animated.Value;
  currentCategory: string;
  onCategoriesPress: () => void;
  onSettingsPress: () => void;
}

export function UIControls({
  uiOpacity,
  currentCategory,
  onCategoriesPress,
  onSettingsPress,
}: UIControlsProps) {
  const Colors = useColors();

  const handleCategoriesPress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    onCategoriesPress();
  };

  const handleSettingsPress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    onSettingsPress();
  };

  const styles = StyleSheet.create({
    categoryBadgeWrapper: {
      position: 'absolute',
      top: 80,
      alignSelf: 'center',
      zIndex: 10,
    },
    categoryBadge: {
      backgroundColor: '#f54e08',
      paddingHorizontal: 20,
      justifyContent: 'center',
      height: 50,
      borderRadius: 20,
      shadowColor: Colors.shadow.medium,
      shadowOffset: {
        width: 0,
        height: 2,
      },
      shadowOpacity: 0.2,
      shadowRadius: 4,
      elevation: 3,
    },
    categoryBadgeText: {
      color: Colors.text.white,
      fontSize: 18,
      textTransform: 'capitalize',
      fontWeight: '500',
    },
    categoriesButtonWrapper: {
      position: 'absolute',
      right: 25,
      bottom: 25,
      zIndex: 10,
    },
    categoriesButton: {
      width: 55,
      height: 55,
      borderRadius: 30,
      backgroundColor: '#f54e08',
      justifyContent: 'center',
      alignItems: 'center',
      shadowColor: Colors.shadow.dark,
      shadowOffset: {
        width: 0,
        height: 4,
      },
      shadowOpacity: 0.3,
      shadowRadius: 6,
      elevation: 8,
    },
    settingsButtonWrapper: {
      position: 'absolute',
      right: 25,
      top: 80,
      zIndex: 10,
    },
    settingsButton: {
      width: 55,
      height: 55,
      borderRadius: 30,
      backgroundColor: '#2C3E5B',
      justifyContent: 'center',
      alignItems: 'center',
      shadowColor: Colors.shadow.dark,
      shadowOffset: {
        width: 0,
        height: 4,
      },
      shadowOpacity: 0.3,
      shadowRadius: 6,
      elevation: 8,
    },
  });

  return (
    <>
      {/* Fixed Category Badge */}
      {currentCategory && (
        <Animated.View
          style={[styles.categoryBadgeWrapper, { opacity: uiOpacity }]}
          pointerEvents="box-none"
        >
          <TouchableOpacity
            style={styles.categoryBadge}
            onPress={handleCategoriesPress}
            activeOpacity={0.7}
          >
            <Text style={styles.categoryBadgeText}>{currentCategory}</Text>
          </TouchableOpacity>
        </Animated.View>
      )}

      {/* Floating Categories Button */}
      <Animated.View
        style={[styles.categoriesButtonWrapper, { opacity: uiOpacity }]}
        pointerEvents="box-none"
      >
        <TouchableOpacity
          style={styles.categoriesButton}
          onPress={handleCategoriesPress}
        >
          <Ionicons name="grid-outline" size={18} color={Colors.text.white} />
        </TouchableOpacity>
      </Animated.View>

      {/* Floating Settings Button */}
      <Animated.View
        style={[styles.settingsButtonWrapper, { opacity: uiOpacity }]}
        pointerEvents="box-none"
      >
        <TouchableOpacity
          style={styles.settingsButton}
          onPress={handleSettingsPress}
        >
          <Ionicons name="person-outline" size={18} color={Colors.text.white} />
        </TouchableOpacity>
      </Animated.View>
    </>
  );
}