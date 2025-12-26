import React from 'react';
import { Slot } from 'expo-router';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';

export default function OnboardingLayout() {
  return (
    <SafeAreaProvider>
      <SafeAreaView style={{ flex: 1, backgroundColor: '#fff' }} edges={['top', 'bottom']}>
        <Slot />
      </SafeAreaView>
    </SafeAreaProvider>
  );
}
