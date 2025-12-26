import React from 'react';
import { Stack } from 'expo-router';
import WordOfWonders from '../../components/games/WordOfWonders/WordOfWonders';

export default function WordOfWondersGame() {
  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <WordOfWonders />
    </>
  );
}
