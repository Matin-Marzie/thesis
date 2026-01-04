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



// import React from 'react';
// import { Stack, useRouter } from 'expo-router';
// import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
// import Wordle from '@/components/games/Wordle/Wordle';

// export default function WordleGame() {
//   const router = useRouter();

//   return (
//     <SafeAreaProvider>
//       <SafeAreaView style={{ flex: 1, backgroundColor: '#fff' }} edges={['top']}>
//         <Stack.Screen options={{ headerShown: false }} />
//         <Wordle onClose={() => router.back()} />
//       </SafeAreaView>
//     </SafeAreaProvider>
//   );
// }

