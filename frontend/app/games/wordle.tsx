import React from 'react';
import { Stack, useRouter } from 'expo-router';
import Wordle from '@/components/games/Wordle/Wordle';

export default function WordleGame() {
  const router = useRouter();

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <Wordle onClose={() => router.back()} />
    </>
  );
}

