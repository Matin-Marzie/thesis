import React, { useCallback } from 'react';
import { Animated, RefreshControl } from 'react-native';
import VocabularyListItem from '@/components/vocabulary/VocabularyListItem';

export default function VocabularyList({ words, refreshedAt, refreshing, onRefresh }) {
  const renderWordItem = useCallback(
    ({ item }) => <VocabularyListItem item={item} refreshedAt={refreshedAt} />,
    [refreshedAt]
  );

  return (
    <Animated.FlatList
      data={words}
      keyExtractor={item => `word-${item.id}`}
      renderItem={renderWordItem}
      keyboardShouldPersistTaps="handled"
      extraData={refreshedAt}
      refreshControl={
        onRefresh ? (
          <RefreshControl refreshing={!!refreshing} onRefresh={onRefresh} />
        ) : undefined
      }
    />
  );
}
