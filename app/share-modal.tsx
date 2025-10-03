import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React from 'react';
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors } from '../constants/Colors';
import { Typography } from '../constants/Typography';

export default function ShareModal() {
  const router = useRouter();
  const params = useLocalSearchParams<{ text: string; category: string }>();

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

      {/* Quote Display */}
      <View style={styles.content}>
        <View style={styles.quoteCard}>
          <Text style={styles.quoteText}>{params.text}</Text>
          <Text style={styles.categoryText}>{params.category}</Text>
        </View>
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
  },
  quoteCard: {
    backgroundColor: Colors.background.primary,
    borderRadius: 20,
    padding: 40,
    width: '100%',
    shadowColor: Colors.shadow.dark,
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
  },
  quoteText: {
    ...Typography.h2,
    fontSize: 28,
    lineHeight: 38,
    textAlign: 'center',
    color: Colors.text.primary,
    marginBottom: 20,
  },
  categoryText: {
    ...Typography.body,
    textAlign: 'center',
    color: Colors.text.secondary,
    textTransform: 'capitalize',
  },
});
