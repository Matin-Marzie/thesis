import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { View, StyleSheet, Keyboard } from 'react-native';
import { useAppContext } from '@/context/AppContext';
import { useDictionary } from '@/hooks/useDictionary';
import FilterBottomSheetModal from '@/components/vocabulary/FilterBottomSheetModal';
import VocabularySearchField from '@/components/vocabulary/VocabularySearchField';
import VocabularyList from '@/components/vocabulary/VocabularyList';

export default function HomeScreen() {
  const { userVocabulary } = useAppContext();
  const { dictionary } = useDictionary();
  const [search, setSearch] = useState('');
  const [filteredWords, setFilteredWords] = useState([]); // To Do: don't duplicate state, remove filteredWords
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);
  const debounceTimeout = useRef(null);

  // Ref for filter bottom sheet modal
  const vocabularyFilterRef = useRef(null);

  // Callbacks
  const handleFilterOpen = useCallback(() => {
    Keyboard.dismiss();
    vocabularyFilterRef.current?.present();
  }, []);

  const handleFilterSheetChange = useCallback((index) => {
    setIsFilterModalOpen(index >= 0);
  }, []);

  const words = useMemo(() => dictionary?.words || [], [dictionary]);

  // Debounced search effect
  // TO DO: depending on query language, search written_form or translations
  useEffect(() => {
    if (debounceTimeout.current) clearTimeout(debounceTimeout.current);

    debounceTimeout.current = setTimeout(() => {
      const query = search.trim().toLowerCase();
      if (!query) {
        // Show user's vocabulary words when search is empty
        const vocabularyWords = words.filter(word => userVocabulary && word.id in userVocabulary);
        setFilteredWords(vocabularyWords);
        return;
      }

      const filtered = words.filter(word => {
        const writtenMatch = word.written_form?.toLowerCase().startsWith(query);
        // const translationMatch = word.translations?.some(t => t?.toLowerCase().includes(query));
        // return writtenMatch || translationMatch;
        return writtenMatch;
      });

      setFilteredWords(filtered);
    }, 500);

    return () => clearTimeout(debounceTimeout.current);
  }, [search, words, userVocabulary]);

  return (
    <View style={styles.container}>
      <VocabularySearchField
        search={search}
        onSearchChange={setSearch}
        onFilterPress={handleFilterOpen}
        editable={!isFilterModalOpen}
      />

      <VocabularyList words={filteredWords} />

      {/* Filter Bottom Sheet Modal */}
      <FilterBottomSheetModal ref={vocabularyFilterRef} onSheetChange={handleFilterSheetChange} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
});
