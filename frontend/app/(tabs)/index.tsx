import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  Animated,
  TouchableOpacity,
  Keyboard,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAppContext } from '@/context/AppContext';
import { useDictionary } from '@/hooks/useDictionary';
import FilterBottomSheetModal from '@/components/vocabulary/FilterBottomSheetModal';
import { PRIMARY_COLOR } from '@/constants/App';
import WordItem from '@/components/vocabulary/WordItem';

export default function HomeScreen() {
  const { userVocabulary } = useAppContext();
  const { dictionary } = useDictionary();
  const [search, setSearch] = useState('');
  const [filteredWords, setFilteredWords] = useState([]);
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
      {/* Fixed search input */}
      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="Search dictionary..."
          value={search}
          onChangeText={setSearch}
          editable={!isFilterModalOpen}
        />

      {/* Filter Button */}
      <TouchableOpacity 
        style={styles.filterButton}
        onPress={handleFilterOpen}
      >
        <Ionicons name="funnel" size={20} color={PRIMARY_COLOR} style={{ marginRight: 6 }} />
        <Text style={styles.filterButtonText}>Filters</Text>
      </TouchableOpacity>
      </View>

      <Animated.FlatList
        contentContainerStyle={{ padding: 4 }}
        data={filteredWords}
        keyExtractor={item => `word-${item.id}`}
        renderItem={({ item }) => <WordItem item={item.written_form} />}
        keyboardShouldPersistTaps="handled"
      />

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
  searchContainer: {
    display: 'flex',
    flexDirection: 'row',
    padding: 10,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
    gap: 6,
  },
  searchInput: {
    flex: 1,
    height: 50,
    backgroundColor: '#f2f2f2',
    paddingHorizontal: 10,
    borderTopLeftRadius: 8,
    borderBottomLeftRadius: 8,

  },
  filterButton: {
    flexDirection: 'row',
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
    borderTopRightRadius: 8,
    borderBottomRightRadius: 8,
    paddingHorizontal: 4,
    backgroundColor: '#f0f0f0',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  filterButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: PRIMARY_COLOR,
  },
});
