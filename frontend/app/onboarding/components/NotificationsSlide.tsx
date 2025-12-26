import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { PRIMARY_COLOR } from '@/constants/App';

interface NotificationsSlideProps {
  onNext: () => void;
}

export default function NotificationsSlide({ onNext }: NotificationsSlideProps) {
  const handleRemindMe = async () => {
    // Request notification permissions
    // For now, just continue
    onNext();
  };

  const handleSkip = () => {
    onNext();
  };

  return (
    <View style={styles.slideContainer}>
      <View style={styles.content}>
        <Ionicons name="notifications-outline" size={80} color={PRIMARY_COLOR} />
        <Text style={styles.title}>I'll remind you to practice</Text>
        <Text style={styles.subtitle}>
          Allow notifications to help you stay on track with your learning goals
        </Text>
      </View>

      <View style={styles.buttonGroup}>
        <TouchableOpacity style={styles.continueButton} onPress={handleRemindMe}>
          <Text style={styles.continueButtonText}>Remind me</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.skipButton} onPress={handleSkip}>
          <Text style={styles.skipButtonText}>Skip</Text>
        </TouchableOpacity>
      </View>
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
    paddingHorizontal: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
    marginBottom: 12,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 20,
  },
  buttonGroup: {
    gap: 12,
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
  skipButton: {
    paddingVertical: 16,
    alignItems: 'center',
  },
  skipButtonText: {
    color: PRIMARY_COLOR,
    fontSize: 16,
    fontWeight: '600',
  },
});
