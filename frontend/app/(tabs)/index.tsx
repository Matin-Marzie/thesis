import React, { useState, useEffect, useRef, useMemo } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TextInput, 
  Animated, 
  TouchableOpacity,
  Modal,
  PanResponder,
  Dimensions,
  FlatList,
} from 'react-native';
import { useDictionary } from '@/hooks/useDictionary';
import { useAppContext } from '@/context/AppContext';

const SCREEN_HEIGHT = Dimensions.get('window').height;
const FILTER_MODAL_HEIGHT = 250;

export default function HomeScreen() {
  const { userVocabulary } = useAppContext();
  const { dictionary } = useDictionary();
  const [searchInput, setSearchInput] = useState('');
  const [filteredWords, setFilteredWords] = useState([]);
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [filterType, setFilterType] = useState('all'); // 'all', 'known', 'unknown'
  const debounceTimeout = useRef(null);
  const [translateY] = useState(new Animated.Value(FILTER_MODAL_HEIGHT));
  const panResponder = useRef(null);
  const panY = useRef(new Animated.Value(0)).current;

  const words = useMemo(() => dictionary?.words || [], [dictionary]);

  // Animate modal in/out
  useEffect(() => {
    if (showFilterModal) {
      Animated.spring(translateY, {
        toValue: 0,
        useNativeDriver: true,
      }).start();
    } else {
      Animated.timing(translateY, {
        toValue: FILTER_MODAL_HEIGHT,
        duration: 300,
        useNativeDriver: true,
      }).start();
    }
  }, [showFilterModal, translateY]);

  // PanResponder for swipe down gesture
  useEffect(() => {
    panResponder.current = PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: (evt, gestureState) => gestureState.dy > 10,
      onPanResponderMove: (evt, gestureState) => {
        panY.setValue(gestureState.dy);
      },
      onPanResponderRelease: (evt, gestureState) => {
        if (gestureState.dy > 50) {
          // User swiped down enough, close modal
          setShowFilterModal(false);
        }
        Animated.spring(panY, {
          toValue: 0,
          useNativeDriver: true,
        }).start();
      },
    });
  }, [panY]);

  // Debounced searchInput effect
  useEffect(() => {
    if (debounceTimeout.current) clearTimeout(debounceTimeout.current);

    debounceTimeout.current = setTimeout(() => {
      const query = searchInput.trim().toLowerCase();
      
      let filtered = words;

      // Apply search filter if query exists
      if (query) {
        filtered = words.filter(word => {
          const writtenMatch = word.written_form?.toLowerCase().startsWith(query);
          const translationMatch = word.translations?.some(t => t?.toLowerCase().includes(query));
          return writtenMatch || translationMatch;
        });
      }

      // Apply vocabulary filter (known/unknown)
      if (filterType === 'known') {
        filtered = filtered.filter(word => userVocabulary[word.id]);
      } else if (filterType === 'unknown') {
        filtered = filtered.filter(word => !userVocabulary[word.id]);
      }

      setFilteredWords(filtered);
    }, 300);

    return () => clearTimeout(debounceTimeout.current);
  }, [searchInput, words, filterType, userVocabulary]);

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
    <View style={styles.container}>
      {/* Fixed search input input */}
      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="Search dictionary..."
          value={searchInput}
          onChangeText={setSearchInput}
        />
      </View>

      {/* Filters Button */}
      <TouchableOpacity 
        style={styles.filterButton}
        onPress={() => setShowFilterModal(true)}
      >
        <Text style={styles.filterButtonText}>
          Filters {filterType !== 'all' ? `(${filterType})` : ''}
        </Text>
      </TouchableOpacity>

      <Animated.FlatList
        contentContainerStyle={{ padding: 20, paddingTop: 0 }}
        data={filteredWords}
        keyExtractor={item => `word-${item.id}`}
        renderItem={renderItem}
        keyboardShouldPersistTaps="handled"
      />

      {/* Filter Modal */}
      <Modal
        visible={showFilterModal}
        transparent={true}
        animationType="none"
        onRequestClose={() => setShowFilterModal(false)}
      >
        <View style={styles.modalOverlay}>
          <TouchableOpacity 
            style={styles.modalBackdrop}
            activeOpacity={1}
            onPress={() => setShowFilterModal(false)}
          />
          <Animated.View 
            style={[
              styles.filterModal,
              { 
                transform: [
                  { translateY: translateY },
                  { translateY: panY }
                ] 
              }
            ]}
            {...panResponder.current?.panHandlers}
          >
            {/* Drag Handle */}
            <View style={styles.dragHandle} />
            
            <Text style={styles.modalTitle}>Filter Words</Text>

            {/* Filter Options */}
            <TouchableOpacity 
              style={[
                styles.filterOption,
                filterType === 'all' && styles.filterOptionActive
              ]}
              onPress={() => {
                setFilterType('all');
                setShowFilterModal(false);
              }}
            >
              <Text style={[
                styles.filterOptionText,
                filterType === 'all' && styles.filterOptionTextActive
              ]}>
                All Words
              </Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={[
                styles.filterOption,
                filterType === 'known' && styles.filterOptionActive
              ]}
              onPress={() => {
                setFilterType('known');
                setShowFilterModal(false);
              }}
            >
              <Text style={[
                styles.filterOptionText,
                filterType === 'known' && styles.filterOptionTextActive
              ]}>
                Known Words
              </Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={[
                styles.filterOption,
                filterType === 'unknown' && styles.filterOptionActive
              ]}
              onPress={() => {
                setFilterType('unknown');
                setShowFilterModal(false);
              }}
            >
              <Text style={[
                styles.filterOptionText,
                filterType === 'unknown' && styles.filterOptionTextActive
              ]}>
                Unknown Words
              </Text>
            </TouchableOpacity>
          </Animated.View>
        </View>
      </Modal>
    </View>
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
  filterButton: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    backgroundColor: '#f0f0f0',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  filterButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#007bff',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalBackdrop: {
    flex: 1,
  },
  filterModal: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    paddingBottom: 20,
    paddingTop: 12,
    paddingHorizontal: 20,
    height: FILTER_MODAL_HEIGHT,
    shadowColor: '#000',
    shadowOpacity: 0.25,
    shadowRadius: 10,
    shadowOffset: { height: -3, width: 0 },
    elevation: 10,
  },
  dragHandle: {
    width: 40,
    height: 4,
    backgroundColor: '#ccc',
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: 12,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
    color: '#333',
  },
  filterOption: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    marginBottom: 8,
    borderRadius: 8,
    backgroundColor: '#f5f5f5',
  },
  filterOptionActive: {
    backgroundColor: '#007bff',
  },
  filterOptionText: {
    fontSize: 16,
    color: '#333',
  },
  filterOptionTextActive: {
    color: '#fff',
    fontWeight: '600',
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
