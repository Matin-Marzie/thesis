import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { useColorScheme } from '@/components/useColorScheme';
import { DARK_COLORS } from '@/constants/App';

export default function CreateScreen() {
  const isDark = useColorScheme() === 'dark';

  return (
    <ScrollView style={[styles.container, isDark && { backgroundColor: DARK_COLORS.background }]}>
      <View style={styles.content}>
        <Text style={[styles.subtitle, isDark && { color: DARK_COLORS.textSecondary }]}>Create your own content</Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  content: {
    padding: 20,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 18,
    color: '#666',
  },
});
