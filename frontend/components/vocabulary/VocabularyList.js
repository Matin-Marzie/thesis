import React, { useCallback } from 'react';
import { Animated } from 'react-native';
import VocabularyListItem from '@/components/vocabulary/VocabularyListItem';

export default function VocabularyList({ words }) {
  const renderWordItem = useCallback(
    ({ item }) => <VocabularyListItem item={item.written_form} />,
    []
  );

  return (
    <Animated.FlatList
      data={words}
      keyExtractor={item => `word-${item.id}`}
      renderItem={renderWordItem}
      keyboardShouldPersistTaps="handled"
    />
  );
}
