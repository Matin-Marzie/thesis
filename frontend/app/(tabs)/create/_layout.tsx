import React from 'react';
import { Stack } from 'expo-router';
import { PRIMARY_COLOR } from '@/constants/App';
import { CreateReelWizardProvider } from '@/context/CreateReelWizardContext';

export default function CreateLayout() {
  return (
    <CreateReelWizardProvider>
      <Stack
        screenOptions={{
          headerStyle: { backgroundColor: PRIMARY_COLOR },
          headerTintColor: '#fff',
          headerTitleStyle: { fontWeight: 'bold' },
        }}
      >
        <Stack.Screen name="index" options={{ title: 'Create' }} />
        <Stack.Screen name="details" options={{ title: 'Details' }} />
        <Stack.Screen name="sync-subtitles" options={{ title: 'Sync & Publish' }} />
      </Stack>
    </CreateReelWizardProvider>
  );
}
