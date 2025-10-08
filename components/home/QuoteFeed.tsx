import React from 'react';
import {
  Animated,
  FlatList,
  View,
  ViewToken
} from 'react-native';
import { Quote, QuoteCard } from './QuoteCard';

interface QuoteFeedProps {
  quotes: Quote[];
  hasCompletedFirstSwipe: boolean;
  onLike: (quote: Quote, scaleAnim: Animated.Value) => void;
  onShare: (quote: Quote) => void;
  onQuoteTap: () => void;
  onScroll: () => void;
  onMomentumScrollEnd: () => void;
  onViewableItemsChanged: (info: { viewableItems: ViewToken[] }) => void;
  onEndReached: () => void;
  isFavorite: (quote: Quote) => boolean;
  flatListRef: React.RefObject<FlatList<Quote> | null>;
}

export function QuoteFeed({
  quotes,
  hasCompletedFirstSwipe,
  onLike,
  onShare,
  onQuoteTap,
  onScroll,
  onMomentumScrollEnd,
  onViewableItemsChanged,
  onEndReached,
  isFavorite,
  flatListRef,
}: QuoteFeedProps) {
  const renderQuote = ({ item }: { item: Quote }) => (
    <QuoteCard
      item={item}
      onLike={onLike}
      onShare={onShare}
      isFavorite={isFavorite(item)}
      onTap={onQuoteTap}
    />
  );

  return (
    <View style={{ flex: 1 }}>
      <FlatList
        ref={flatListRef}
        data={quotes}
        renderItem={renderQuote}
        keyExtractor={(item, index) => `${item.text}-${index}`}
        pagingEnabled
        // snapToInterval={screenHeight}
        // snapToAlignment="start"
        decelerationRate={0}
        showsVerticalScrollIndicator={false}
        bounces={true}
        onEndReached={onEndReached}
        onEndReachedThreshold={0.5}
        onScroll={onScroll}
        scrollEventThrottle={400}
        onMomentumScrollEnd={() => {
          // Complete first swipe tutorial when user scrolls
          if (!hasCompletedFirstSwipe) {
            onMomentumScrollEnd();
          }
        }}
        onViewableItemsChanged={onViewableItemsChanged}
        viewabilityConfig={{
          itemVisiblePercentThreshold: 50,
        }}
        onScrollToIndexFailed={(info) => {
          console.log('⚠️ Scroll to index failed:', info);
          // Retry after a delay
          setTimeout(() => {
            flatListRef.current?.scrollToIndex({
              index: info.index,
              animated: true,
            });
          }, 100);
        }}
      />
    </View>
  );
}