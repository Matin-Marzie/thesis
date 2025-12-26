import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image } from 'react-native';
import { useRouter } from 'expo-router';

export default function PracticeScreen() {
  const router = useRouter();

  const handlePlayWordOfWonders = () => {
    router.push('/games/wordofwonders');
  };

  const handlePlayWordle = () => {
    router.push('/games/wordle');
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>games</Text>
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          style={styles.gamesScroll}
        >
          <TouchableOpacity style={styles.gameThumbnail} onPress={handlePlayWordOfWonders}>
            <Image 
              source={require('../../assets/images/games/thumbnail-wordofwonders.png')}
              style={styles.thumbnailImage}
              resizeMode="cover"
            />
            <View style={styles.thumbnailOverlay}>
              <Text style={styles.gameName}>Word of Wonders</Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity style={styles.gameThumbnail} onPress={handlePlayWordle}>
            <Image 
              source={require('../../assets/images/games/wordle-thumbnail.jpeg')}
              style={styles.thumbnailImage}
              resizeMode="cover"
            />
            <View style={styles.thumbnailOverlay}>
              <Text style={styles.gameName}>Wordle</Text>
            </View>
          </TouchableOpacity>
        </ScrollView>
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
    padding: 10,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
  },
  gamesScroll: {
    marginTop: 10,
  },
  gameThumbnail: {
    width: 180,
    height: 280,
    marginRight: 15,
    borderRadius: 15,
    overflow: 'hidden',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  thumbnailImage: {
    width: '100%',
    height: '100%',
  },
  wordlePlaceholder: {
    width: '100%',
    height: '100%',
    backgroundColor: '#4CAF50',
    justifyContent: 'center',
    alignItems: 'center',
  },
  wordlePlaceholderText: {
    color: '#fff',
    fontSize: 32,
    fontWeight: 'bold',
  },
  devText: {
    color: '#fff',
    fontSize: 14,
    marginTop: 10,
    opacity: 0.9,
  },
  thumbnailOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    padding: 15,
  },
  gameName: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
  },
});
