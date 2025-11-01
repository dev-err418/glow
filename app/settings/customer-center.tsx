import React from 'react';
import { StyleSheet, View } from 'react-native';
import RevenueCatUI from 'react-native-purchases-ui';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useColors } from '../../constants/Colors';

export default function CustomerCenterScreen() {
  const Colors = useColors();

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background.default,
  },
  content: {
    flex: 1,
  },
});

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <View style={styles.content}>
        <RevenueCatUI.CustomerCenterView
          style={{ flex: 1 }}
          shouldShowCloseButton={false}
          onCustomActionSelected={({ actionId }) => {
            console.log('Custom action:', actionId);
          }}
        />
      </View>
    </SafeAreaView>
  );
}
