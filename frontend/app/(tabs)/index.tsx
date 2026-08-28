import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { View, StyleSheet, Keyboard, Text, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { FontAwesome } from '@expo/vector-icons';
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
  const router = useRouter();
  const { userVocabulary } = useVocabularyContext();
  const { userSentences } = useSentenceContext();
  const { dictionary } = useDictionaryContext();
  const [search, setSearch] = useState('');
  const [filteredWords, setFilteredWords] = useState([]); // To Do: don't duplicate state, remove filteredWords
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);
  // True only while a non-empty search query is debouncing/being computed -
  // the empty-query "my words" path is immediate, so it never sets this.
  const [isSearching, setIsSearching] = useState(false);
  // 'words' shows the vocabulary list (search/filter included); 'sentences'
  // shows sentences saved from reel subtitles.
  const [activeTab, setActiveTab] = useState('words');
  const debounceTimeout = useRef(null);

  // Sort by created_at descending without re-allocating Date objects inside
  // the comparator (decorate-sort-undecorate) - a plain `new Date(...)`
  // comparator allocates twice per comparison, which adds up fast at
  // dictionary scale and was blocking the JS thread long enough to trip
  // VirtualizedList's "slow to update" warning.
  const sortByCreatedAtDesc = useCallback((items, getCreatedAt) => {
    return items
      .map((item) => ({ item, ts: new Date(getCreatedAt(item) || 0).getTime() }))
      .sort((a, b) => b.ts - a.ts)
      .map(({ item }) => item);
  }, []);

  const sortedSentences = useMemo(() => {
    const items = Object.entries(userSentences || {}).map(([id, entry]) => ({ id: Number(id), entry }));
    return sortByCreatedAtDesc(items, (sentenceItem) => sentenceItem.entry?.created_at);
  }, [userSentences, sortByCreatedAtDesc]);

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

  // id -> word lookup, built once per dictionary fetch (not per vocabulary
  // change) so deriving "my saved words" never has to scan the full
  // dictionary - only Object.keys(userVocabulary), which is normally far
  // smaller than the dictionary itself.
  // Keys are normalized to strings: words.id is a Postgres bigint, which
  // node-postgres returns as a string (no numeric precision loss) - so
  // word.id is already a string here. Map, unlike plain object access or
  // the `in` operator, does NOT coerce number/string keys as equal, so both
  // sides must be strings or a lookup with the "wrong" type silently misses.
  const wordsById = useMemo(() => {
    const map = new Map();
    for (const word of words) map.set(String(word.id), word);
    return map;
  }, [words]);

  // Each word's normalized written_form, computed once per dictionary fetch
  // instead of on every keystroke. Search used to call normalizeQuery()
  // (trim + lowercase + diacritics-strip) on all ~11,000 words every single
  // time the debounce fired - the word's own text never changes, only the
  // query does, so there's no reason to redo that work per search.
  const normalizedWordEntries = useMemo(
    () => words.map((word) => ({ word, normalized: normalizeQuery(word.written_form ?? '') })),
    [words]
  );

  // Debounced search effect
  // TO DO: depending on query language, search written_form or translations
  useEffect(() => {
    const query = normalizeQuery(search);

    if (!query) {
      // Show user's vocabulary words when search is empty, sorted by
      // created_at (newest first). No debounce here - there's no typing to
      // wait out, so compute immediately instead of adding an artificial
      // delay before the screen shows anything.
      if (debounceTimeout.current) clearTimeout(debounceTimeout.current);
      setIsSearching(false);
      const vocabularyWords = userVocabulary
        ? Object.keys(userVocabulary)
          .map((id) => wordsById.get(id))
          .filter(Boolean)
        : [];
      setFilteredWords(sortByCreatedAtDesc(vocabularyWords, (word) => userVocabulary[word.id]?.created_at));
      return;
    }

    if (debounceTimeout.current) clearTimeout(debounceTimeout.current);
    // Show the spinner immediately (covers both the debounce wait and the
    // filter/sort itself), not just while the setTimeout callback runs.
    setIsSearching(true);

    debounceTimeout.current = setTimeout(() => {
      // Filter by search query using each word's precomputed normalized
      // form (see normalizedWordEntries) - only a cheap startsWith() per
      // word now, not a fresh normalize+compare on every keystroke.
      const filtered = normalizedWordEntries
        .filter((entry) => entry.normalized.startsWith(query))
        .map((entry) => entry.word);
      // const translationMatch = word.translations?.some(t => t?.toLowerCase().includes(query));
      // return writtenMatch || translationMatch;

      setFilteredWords(sortByCreatedAtDesc(filtered, (word) => userVocabulary?.[word.id]?.created_at));
      setIsSearching(false);
    }, 500);

    return () => clearTimeout(debounceTimeout.current);
  }, [search, normalizedWordEntries, wordsById, userVocabulary, sortByCreatedAtDesc]);

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
        <TouchableOpacity
          style={styles.lettersButton}
          onPress={() => router.push('/letters')}
          hitSlop={12}
        >
          <FontAwesome name="font" size={18} color={isDark ? DARK_COLORS.textSecondary : '#9ca3af'} />
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

          {isSearching ? (
            <View style={styles.searchingContainer}>
              <ActivityIndicator size="large" color={PRIMARY_COLOR} />
            </View>
          ) : (
            <VocabularyList words={filteredWords} />
          )}

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
  lettersButton: {
    paddingHorizontal: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  searchingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
