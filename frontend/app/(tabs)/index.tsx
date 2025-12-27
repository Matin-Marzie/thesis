import React, { useState, useEffect, useRef, useMemo } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TextInput, 
  Animated, 
  FlatList, 
  TouchableOpacity, 
  KeyboardAvoidingView,
  Platform
} from 'react-native';
import { useAppContext } from '@/context/AppContext';

export default function HomeScreen() {
  const { dictionary } = useAppContext();
  const [search, setSearch] = useState('');
  const [filteredWords, setFilteredWords] = useState([]);
  const debounceTimeout = useRef(null);

  const words = useMemo(() => dictionary.words || [], [dictionary]);

  // Debounced search effect
  useEffect(() => {
    if (debounceTimeout.current) clearTimeout(debounceTimeout.current);

    debounceTimeout.current = setTimeout(() => {
      const query = search.trim().toLowerCase();
      if (!query) {
        setFilteredWords([]);
        return;
      }

      const filtered = words.filter(word => {
        const writtenMatch = word.written_form?.toLowerCase().startsWith(query);
        const translationMatch = word.translations?.some(t => t?.toLowerCase().includes(query));
        return writtenMatch || translationMatch;
      });

      setFilteredWords(filtered);
    }, 500);

    return () => clearTimeout(debounceTimeout.current);
  }, [search, words]);

  // Render each word row
  const renderItem = ({ item }) => (
    <Animated.View style={styles.wordRow}>
      <View style={styles.wordTextContainer}>
        <Text style={styles.writtenForm}>{item.written_form}</Text>
        <Text style={styles.translations}>{(item.translations || []).join(', ')}</Text>
      </View>
      <Text>
        {item.level}
      </Text>
      <TouchableOpacity style={styles.addButton}>
        <Text style={styles.addButtonText}>+</Text>
      </TouchableOpacity>
    </Animated.View>
  );

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      {/* Fixed search input */}
      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="Search dictionary..."
          value={search}
          onChangeText={setSearch}
        />
      </View>

      <Animated.FlatList
        contentContainerStyle={{ padding: 20, paddingTop: 0 }}
        data={filteredWords}
        keyExtractor={item => `word-${item.id}`}
        renderItem={renderItem}
        keyboardShouldPersistTaps="handled"
      />
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  searchContainer: {
    padding: 10,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
  },
  searchInput: {
    height: 40,
    backgroundColor: '#f2f2f2',
    borderRadius: 8,
    paddingHorizontal: 10,
  },
  wordRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginVertical: 6,
    padding: 10,
    backgroundColor: '#f9f9f9',
    borderRadius: 6,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 2,
    shadowOffset: { width: 0, height: 1 },
  },
  wordTextContainer: {
    flex: 1,
    marginRight: 10,
  },
  writtenForm: {
    fontWeight: 'bold',
    fontSize: 16,
    marginBottom: 2,
  },
  translations: {
    fontSize: 14,
    color: '#555',
  },
  addButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#007bff',
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 20,
  },
  addButtonText: {
    color: '#fff',
    fontSize: 20,
    lineHeight: 20,
  },
});
