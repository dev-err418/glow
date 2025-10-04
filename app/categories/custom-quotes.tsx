import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
  ActionSheetIOS,
  Alert,
  FlatList,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { PAYWALL_RESULT } from 'react-native-purchases-ui';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors } from '../../constants/Colors';
import { Typography } from '../../constants/Typography';
import { useCategories } from '../../contexts/CategoriesContext';
import { useCustomQuotes } from '../../contexts/CustomQuotesContext';
import { useFavorites } from '../../contexts/FavoritesContext';
import { usePremium } from '../../contexts/PremiumContext';

const MAX_QUOTE_LENGTH = 200;

export default function CustomQuotesScreen() {
  const router = useRouter();
  const { isPremium, showPaywall } = usePremium();
  const { customQuotes, addCustomQuote, removeCustomQuote, updateCustomQuote, toggleFavorite } = useCustomQuotes();
  const { updateSelectedCategories } = useCategories();
  const { addFavorite, removeFavorite } = useFavorites();
  const [isProcessing, setIsProcessing] = useState(false);

  const handleSelectCategory = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    if (!isPremium) {
      // Show paywall for non-premium users
      setIsProcessing(true);
      try {
        const result = await showPaywall();
        if (result === PAYWALL_RESULT.PURCHASED || result === PAYWALL_RESULT.RESTORED) {
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
          // Select custom category and close modal
          updateSelectedCategories(['custom']);
          router.back();
          router.back(); // Go back twice to close categories modal
        }
      } catch (error) {
        console.error('Error showing paywall:', error);
      } finally {
        setIsProcessing(false);
      }
    } else {
      // Premium users can select directly
      updateSelectedCategories(['custom']);
      router.back();
      router.back(); // Go back twice to close categories modal
    }
  };

  const handleAddQuote = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    Alert.prompt(
      'Add Custom Quote',
      `Enter your quote (max ${MAX_QUOTE_LENGTH} characters)`,
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Add',
          onPress: (text?: string) => {
            if (text && text.trim().length > 0) {
              if (text.trim().length > MAX_QUOTE_LENGTH) {
                Alert.alert('Quote Too Long', `Please keep your quote under ${MAX_QUOTE_LENGTH} characters.`);
                return;
              }
              addCustomQuote(text);
              Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            }
          },
        },
      ],
      'plain-text'
    );
  };

  const handleQuoteMenu = (quoteId: string, quoteText: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    if (Platform.OS === 'ios') {
      ActionSheetIOS.showActionSheetWithOptions(
        {
          options: ['Cancel', 'Edit', 'Delete'],
          destructiveButtonIndex: 2,
          cancelButtonIndex: 0,
        },
        (buttonIndex) => {
          if (buttonIndex === 1) {
            // Edit
            handleEditQuote(quoteId, quoteText);
          } else if (buttonIndex === 2) {
            // Delete
            handleDeleteQuote(quoteId);
          }
        }
      );
    } else {
      Alert.alert('Quote Options', '', [
        {
          text: 'Edit',
          onPress: () => handleEditQuote(quoteId, quoteText),
        },
        {
          text: 'Delete',
          onPress: () => handleDeleteQuote(quoteId),
          style: 'destructive',
        },
        {
          text: 'Cancel',
          style: 'cancel',
        },
      ]);
    }
  };

  const handleEditQuote = (quoteId: string, currentText: string) => {
    Alert.prompt(
      'Edit Quote',
      `Enter your quote (max ${MAX_QUOTE_LENGTH} characters)`,
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Save',
          onPress: (text?: string) => {
            if (text && text.trim().length > 0) {
              if (text.trim().length > MAX_QUOTE_LENGTH) {
                Alert.alert('Quote Too Long', `Please keep your quote under ${MAX_QUOTE_LENGTH} characters.`);
                return;
              }
              updateCustomQuote(quoteId, text);
              Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            }
          },
        },
      ],
      'plain-text',
      currentText
    );
  };

  const handleDeleteQuote = (quoteId: string) => {
    Alert.alert('Delete Quote', 'Are you sure you want to delete this quote?', [
      {
        text: 'Cancel',
        style: 'cancel',
      },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: () => {
          removeCustomQuote(quoteId);
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        },
      },
    ]);
  };

  const handleToggleFavorite = (quoteId: string, quoteText: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    // Get the current quote to check if it's favorited
    const quote = customQuotes.find(q => q.id === quoteId);
    if (!quote) return;

    // Toggle in custom quotes context
    toggleFavorite(quoteId);

    // Sync with global favorites
    if (quote.isFavorited) {
      // If currently favorited, remove from global favorites
      removeFavorite({ text: quoteText, category: 'custom' });
    } else {
      // If not favorited, add to global favorites
      addFavorite({ text: quoteText, category: 'custom' });
    }
  };

  const formatDate = (isoDate: string) => {
    const date = new Date(isoDate);
    const options: Intl.DateTimeFormatOptions = {
      weekday: 'short',
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    };
    return date.toLocaleDateString('en-US', options);
  };

  const renderQuoteCard = ({ item }: { item: typeof customQuotes[0] }) => (
    <View style={styles.quoteCard}>
      <View style={styles.quoteHeader}>
        <Text style={styles.quoteDate}>{formatDate(item.createdAt)}</Text>
        <View style={styles.quoteActions}>
          <TouchableOpacity
            onPress={() => handleToggleFavorite(item.id, item.text)}
            style={styles.actionButton}
            activeOpacity={0.7}
          >
            <Ionicons
              name={item.isFavorited ? 'heart' : 'heart-outline'}
              size={22}
              color={item.isFavorited ? Colors.primary : Colors.text.secondary}
            />
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => handleQuoteMenu(item.id, item.text)}
            style={styles.actionButton}
            activeOpacity={0.7}
          >
            <Ionicons name="ellipsis-horizontal" size={22} color={Colors.text.secondary} />
          </TouchableOpacity>
        </View>
      </View>
      <Text style={styles.quoteText}>{item.text}</Text>
    </View>
  );

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <Text style={styles.emptySubtitle}>Tap the + button to add your first affirmation</Text>
    </View>
  );

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      {/* Title */}
      <Text style={styles.pageTitle}>My own quotes</Text>

      {/* Subtitle */}
      <Text style={styles.pageSubtitle}>Create your own daily affirmations</Text>

      {/* Show in feed button - only show when there are custom quotes */}
      {customQuotes.length > 0 && (
        <TouchableOpacity
          style={styles.showInFeedButton}
          onPress={handleSelectCategory}
          disabled={isProcessing}
          activeOpacity={0.7}
        >
          <Ionicons name="play" size={24} color={Colors.text.white} />
          <Text style={styles.showInFeedText}>Show in feed</Text>
        </TouchableOpacity>
      )}

      {/* Quote List */}
      <FlatList
        data={customQuotes}
        renderItem={renderQuoteCard}
        keyExtractor={(item) => item.id}
        contentContainerStyle={[
          styles.listContent,
          customQuotes.length === 0 && styles.listContentEmpty,
        ]}
        ListEmptyComponent={renderEmptyState}
        showsVerticalScrollIndicator={false}
      />

      {/* Bottom Add Button */}
      <TouchableOpacity
        style={styles.addButton}
        onPress={handleAddQuote}
        activeOpacity={0.7}
      >
        <Text style={styles.addButtonText}>Add my own affirmation</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background.default,
  },
  pageTitle: {
    ...Typography.h1,
    textAlign: 'center',
    marginTop: 16,
    marginBottom: 8,
    paddingHorizontal: 20,
  },
  pageSubtitle: {
    ...Typography.body,
    color: Colors.text.secondary,
    textAlign: 'center',
    marginBottom: 16,
    paddingHorizontal: 40,
  },
  showInFeedButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.secondary,
    borderRadius: 16,
    paddingVertical: 18,
    paddingHorizontal: 24,
    marginHorizontal: 20,
    marginBottom: 24,
    shadowColor: Colors.shadow.medium,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  showInFeedText: {
    ...Typography.body,
    color: Colors.text.white,
    marginLeft: 8,
    fontSize: 16,
  },
  listContent: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  listContentEmpty: {
    flex: 1,
  },
  quoteCard: {
    backgroundColor: Colors.background.primary,
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    shadowColor: Colors.shadow.light,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  quoteHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  quoteDate: {
    fontSize: 12,
    color: Colors.text.secondary,
  },
  quoteActions: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    width: 32,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
  },
  quoteText: {
    ...Typography.body,
    color: Colors.text.primary,
    fontSize: 16,
    lineHeight: 24,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  emptyTitle: {
    ...Typography.h2,
    marginTop: 24,
    marginBottom: 8,
    textAlign: 'center',
  },
  emptySubtitle: {
    ...Typography.body,
    color: Colors.text.secondary,
    textAlign: 'center',
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.primary,
    borderRadius: 16,
    paddingVertical: 18,
    paddingHorizontal: 24,
    marginHorizontal: 20,
    marginBottom: 20,
    marginTop: 16,
    shadowColor: Colors.shadow.medium,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  addButtonText: {
    ...Typography.body,
    color: Colors.text.white,
    fontSize: 16,
  },
});
