import React from 'react';
import { Slot } from 'expo-router';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';

export default function OnboardingLayout() {
  return (
    <SafeAreaProvider>
      <SafeAreaView style={{ flex: 1, backgroundColor: '#fff', marginBottom: 48 }} edges={['top']}>
        <Slot />
      </SafeAreaView>
    </SafeAreaProvider>
  );
}
