import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { PRIMARY_COLOR } from '@/constants/App';

interface WelcomeSlideProps {
  onNext: () => void;
}

export default function WelcomeSlide({ onNext }: WelcomeSlideProps) {
  return (
    <View style={styles.slideContainer}>
      <View style={styles.content}>
        <Image 
          source={require('../../../assets/images/cat.png')} 
          style={styles.catImage}
          resizeMode="contain"
        />
        <Text style={styles.title}>4 quick questions before we start</Text>
        <Text style={styles.subtitle}>Help us personalize your learning experience</Text>
      </View>
      <TouchableOpacity style={styles.continueButton} onPress={onNext}>
        <Text style={styles.continueButtonText}>Continue</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  slideContainer: {
    flex: 1,
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  catImage: {
    width: 200,
    height: 200,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 20,
  },
  continueButton: {
    backgroundColor: PRIMARY_COLOR,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 20,
  },
  continueButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
});
