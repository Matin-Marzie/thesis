import React, { useCallback, useEffect } from 'react';
import { View, Text, TouchableOpacity, ActivityIndicator, StyleSheet, StatusBar } from 'react-native';
import { FontAwesome } from '@expo/vector-icons';
import { useReelsContext } from '@/context/ReelsContext';
import { PRIMARY_COLOR } from '@/constants/App';
import { ReelsList } from '@/components/reels/ReelsList';

// Entry-point screen for the Reels tab.
// Owns only the global loading / error states; the list itself lives in ReelsList.
export default function ReelsScreen() {
  const { reels, isLoading, error, fetchReels } = useReelsContext();

  // Fetch on mount — skip if the context already has data (e.g. returning to tab)
  useEffect(() => {
    if (reels.length === 0) {
      fetchReels(true);
    }
  }, []);

  const handleRetry = useCallback(() => fetchReels(true), [fetchReels]);

  // Full-screen spinner shown on the very first load
  if (isLoading && reels.length === 0) {
    return (
      <View style={styles.centeredContainer}>
        <StatusBar barStyle="light-content" backgroundColor="#000" />
        <ActivityIndicator size="large" color={PRIMARY_COLOR} />
        <Text style={styles.loadingText}>Loading reels...</Text>
      </View>
    );
  }

  // Full-screen error shown when the initial fetch fails and there is nothing to display
  if (error && reels.length === 0) {
    return (
      <View style={styles.centeredContainer}>
        <StatusBar barStyle="light-content" backgroundColor="#000" />
        <FontAwesome name="exclamation-triangle" size={64} color="#ff6b6b" />
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity style={styles.retryButton} onPress={handleRetry}>
          <Text style={styles.retryText}>Try Again</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <>
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />
      <ReelsList onRetry={handleRetry} />
    </>
  );
}

const styles = StyleSheet.create({
  // Shared base for loading and error full-screen states
  centeredContainer: {
    flex: 1,
    backgroundColor: '#000',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  loadingText: {
    color: '#fff',
    marginTop: 16,
    fontSize: 16,
  },
  errorText: {
    color: '#fff',
    marginTop: 16,
    fontSize: 16,
    textAlign: 'center',
  },
  retryButton: {
    marginTop: 20,
    paddingHorizontal: 24,
    paddingVertical: 12,
    backgroundColor: PRIMARY_COLOR,
    borderRadius: 25,
  },
  retryText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
