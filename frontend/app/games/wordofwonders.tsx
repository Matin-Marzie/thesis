import React from 'react';
import { Stack } from 'expo-router';
import GameLoader from '../../components/games/WordOfWonders/GameLoader';

export default function WordOfWondersGame() {
  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <GameLoader />
    </>
  );
}
