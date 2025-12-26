import React from 'react';
import { Stack } from 'expo-router';
import { View, Text, StyleSheet } from 'react-native';

export default function WordleGame() {
  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <View style={styles.container}>
        <Text style={styles.title}>Wordle</Text>
        <Text style={styles.subtitle}>Coming Soon</Text>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#4CAF50',
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 20,
  },
  subtitle: {
    fontSize: 24,
    color: '#fff',
    opacity: 0.9,
  },
});
