import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { PRIMARY_COLOR } from '@/constants/App';

export default function VocabularySearchField({ search, onSearchChange, onFilterPress, editable }) {
  return (
    <View style={styles.searchContainer}>
      <TextInput
        style={styles.searchInput}
        placeholder="Search dictionary..."
        value={search}
        onChangeText={onSearchChange}
        editable={editable}
      />

      {/* Filter Button */}
      <TouchableOpacity
        style={styles.filterButton}
        onPress={onFilterPress}
      >
        <Ionicons name="funnel" size={20} color={PRIMARY_COLOR} style={{ marginRight: 6 }} />
        <Text style={styles.filterButtonText}>Filters</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
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
