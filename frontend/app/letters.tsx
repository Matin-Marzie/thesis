import React, { useEffect, useMemo, useState, useCallback } from 'react';
import { View, Text, StyleSheet, SectionList, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useProgress } from '@/context/ProgressContext';
import { getLettersByCode } from '@/api/letters';
import { useColorScheme } from '@/components/useColorScheme';
import { DARK_COLORS, PRIMARY_COLOR } from '@/constants/App';

export default function LettersScreen() {
  const isDark = useColorScheme() === 'dark';
  const { userProgress } = useProgress();
  const [letters, setLetters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const currentLang = useMemo(() => {
    return userProgress?.languages?.find((l) => l.is_current_language) || null;
  }, [userProgress?.languages]);

  const learningLanguageCode = currentLang?.learning_language?.code;

  useEffect(() => {
    if (!learningLanguageCode) {
      setLoading(false);
      return;
    }

    let cancelled = false;
    setLoading(true);
    setError(null);

    getLettersByCode(learningLanguageCode)
      .then((res) => {
        if (cancelled) return;
        setLetters(res?.letters || []);
      })
      .catch((err) => {
        if (cancelled) return;
        setError(err.message);
      })
      .finally(() => {
        if (cancelled) return;
        setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [learningLanguageCode]);

  const LETTERS_PER_ROW = 4;

  // Group letters into vowel/consonant sections, in the order returned by
  // the API, then chunk each section's letters into fixed-size rows -
  // SectionList has no built-in grid/numColumns support like FlatList does,
  // so the grid has to be built by hand as rows of items.
  const sections = useMemo(() => {
    const byType = { vowel: [], consonant: [] };
    for (const letter of letters) {
      if (byType[letter.type]) byType[letter.type].push(letter);
    }
    const chunk = (items) => {
      const rows = [];
      for (let i = 0; i < items.length; i += LETTERS_PER_ROW) {
        rows.push(items.slice(i, i + LETTERS_PER_ROW));
      }
      return rows;
    };
    return [
      { title: 'Vowels', data: chunk(byType.vowel) },
      { title: 'Consonants', data: chunk(byType.consonant) },
    ].filter((section) => section.data.length > 0);
  }, [letters]);

  const renderItem = useCallback(
    ({ item: row }) => (
      <View style={styles.row}>
        {row.map((letter) => (
          <View
            key={letter.id}
            style={[styles.letterCard, isDark && { backgroundColor: DARK_COLORS.surface, borderColor: DARK_COLORS.border }]}
          >
            <Text style={[styles.letterSign, isDark && { color: DARK_COLORS.text }]}>{letter.letter_sign}</Text>
            {!!letter.writing_style && (
              <Text style={[styles.writingStyle, isDark && { color: DARK_COLORS.textSecondary }]}>{letter.writing_style}</Text>
            )}
          </View>
        ))}
        {/* Pad the last row so trailing cards don't stretch to fill the row */}
        {row.length < LETTERS_PER_ROW &&
          Array.from({ length: LETTERS_PER_ROW - row.length }).map((_, i) => (
            <View key={`spacer-${i}`} style={[styles.letterCard, styles.letterCardSpacer]} pointerEvents="none" />
          ))}
      </View>
    ),
    [isDark]
  );

  const renderSectionHeader = useCallback(
    ({ section }) => (
      <Text style={[styles.sectionHeader, isDark && { color: DARK_COLORS.textSecondary, backgroundColor: DARK_COLORS.background }]}>
        {section.title}
      </Text>
    ),
    [isDark]
  );

  let content;
  if (loading) {
    content = (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={PRIMARY_COLOR} />
      </View>
    );
  } else if (error) {
    content = (
      <View style={styles.centered}>
        <Text style={[styles.errorText, isDark && { color: DARK_COLORS.text }]}>{error}</Text>
      </View>
    );
  } else if (!learningLanguageCode) {
    content = (
      <View style={styles.centered}>
        <Text style={[styles.errorText, isDark && { color: DARK_COLORS.text }]}>No learning language selected.</Text>
      </View>
    );
  } else {
    content = (
      <SectionList
        style={styles.container}
        sections={sections}
        keyExtractor={(row) => `row-${row[0]?.id}`}
        renderItem={renderItem}
        renderSectionHeader={renderSectionHeader}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <Text style={[styles.errorText, isDark && { color: DARK_COLORS.text }]}>No letters found for this language yet.</Text>
        }
      />
    );
  }

  return (
    <SafeAreaView edges={['bottom']} style={[styles.container, isDark && { backgroundColor: DARK_COLORS.background }]}>
      {content}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  listContent: {
    padding: 12,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    fontSize: 15,
    color: '#333',
    textAlign: 'center',
    paddingHorizontal: 24,
  },
  sectionHeader: {
    fontSize: 14,
    fontWeight: '700',
    color: '#6b7280',
    textTransform: 'uppercase',
    paddingVertical: 8,
  },
  row: {
    flexDirection: 'row',
  },
  letterCard: {
    flex: 1,
    margin: 6,
    aspectRatio: 1,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: '#e5e7eb',
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
  },
  letterCardSpacer: {
    borderColor: 'transparent',
    backgroundColor: 'transparent',
  },
  letterSign: {
    fontSize: 28,
    fontWeight: '700',
    color: '#111827',
  },
  writingStyle: {
    fontSize: 11,
    color: '#9ca3af',
    marginTop: 4,
  },
});
