import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { View, StyleSheet, Keyboard, Text, TouchableOpacity } from 'react-native';
import { useVocabularyContext } from '@/context/VocabularyContext';
import { useSentenceContext } from '@/context/SentenceContext';
import { useDictionaryContext } from '@/context/DictionaryContext';
import FilterBottomSheetModal from '@/components/vocabulary/FilterBottomSheetModal';
import VocabularySearchField from '@/components/vocabulary/VocabularySearchField';
import VocabularyList from '@/components/vocabulary/VocabularyList';
import SentenceList from '@/components/sentences/SentenceList';
import { normalizeQuery } from '@/utils/normalize';
import { useColorScheme } from '@/components/useColorScheme';
import { DARK_COLORS, PRIMARY_COLOR } from '@/constants/App';

export default function HomeScreen() {
  const isDark = useColorScheme() === 'dark';
  const { userVocabulary } = useVocabularyContext();
  const { userSentences } = useSentenceContext();
  const { dictionary } = useDictionaryContext();
  const [search, setSearch] = useState('');
  const [filteredWords, setFilteredWords] = useState([]); // To Do: don't duplicate state, remove filteredWords
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);
  // 'words' shows the vocabulary list (search/filter included); 'sentences'
  // shows sentences saved from reel subtitles.
  const [activeTab, setActiveTab] = useState('words');
  const debounceTimeout = useRef(null);

  const sortedSentences = useMemo(() => {
    return Object.entries(userSentences || {})
      .map(([id, entry]) => ({ id: Number(id), entry }))
      .sort((a, b) => new Date(b.entry?.created_at || 0).getTime() - new Date(a.entry?.created_at || 0).getTime());
  }, [userSentences]);

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
      const query = normalizeQuery(search);
      if (!query) {
        // Show user's vocabulary words when search is empty, sorted by created_at (newest first)
        const vocabularyWords = words
          .filter(word => userVocabulary && word.id in userVocabulary)
          .sort((a, b) => {
            const dateA = new Date(userVocabulary[a.id]?.created_at || 0);
            const dateB = new Date(userVocabulary[b.id]?.created_at || 0);
            return dateB - dateA;
          });
        setFilteredWords(vocabularyWords);
        return;
      }

      // Filter words by search query and sort by created_at (newest first)
      const filtered = words
        .filter(word => {
          const writtenMatch = normalizeQuery(word.written_form ?? '').startsWith(query);
          // const translationMatch = word.translations?.some(t => t?.toLowerCase().includes(query));
          // return writtenMatch || translationMatch;
          return writtenMatch;
        })
        .sort((a, b) => {
          const dateA = new Date(userVocabulary?.[a.id]?.created_at || 0);
          const dateB = new Date(userVocabulary?.[b.id]?.created_at || 0);
          return dateB - dateA;
        });

      setFilteredWords(filtered);
    }, 500);

    return () => clearTimeout(debounceTimeout.current);
  }, [search, words, userVocabulary]);

  return (
    <View style={[styles.container, isDark && { backgroundColor: DARK_COLORS.background }]}>
      <View style={[styles.tabBar, isDark && { borderBottomColor: DARK_COLORS.border }]}>
        <TouchableOpacity
          style={[styles.tabButton, activeTab === 'words' && styles.tabButtonActive]}
          onPress={() => setActiveTab('words')}
        >
          <Text style={[styles.tabButtonText, isDark && { color: DARK_COLORS.textSecondary }, activeTab === 'words' && styles.tabButtonTextActive]}>
            Words
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tabButton, activeTab === 'sentences' && styles.tabButtonActive]}
          onPress={() => setActiveTab('sentences')}
        >
          <Text style={[styles.tabButtonText, isDark && { color: DARK_COLORS.textSecondary }, activeTab === 'sentences' && styles.tabButtonTextActive]}>
            Sentences
          </Text>
        </TouchableOpacity>
      </View>

      {activeTab === 'words' ? (
        <>
          <VocabularySearchField
            search={search}
            onSearchChange={setSearch}
            onFilterPress={handleFilterOpen}
            editable={!isFilterModalOpen}
          />

          <VocabularyList words={filteredWords} />

          {/* Filter Bottom Sheet Modal */}
          <FilterBottomSheetModal ref={vocabularyFilterRef} onSheetChange={handleFilterSheetChange} />
        </>
      ) : (
        <SentenceList sentences={sortedSentences} />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  tabBar: {
    flexDirection: 'row',
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#e5e7eb',
  },
  tabButton: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  tabButtonActive: {
    borderBottomColor: PRIMARY_COLOR,
  },
  tabButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#9ca3af',
  },
  tabButtonTextActive: {
    color: PRIMARY_COLOR,
  },
});
