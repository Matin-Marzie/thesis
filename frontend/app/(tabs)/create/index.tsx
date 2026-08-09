import React, { useCallback, useState } from 'react';
import { View, Text, StyleSheet, Pressable, Alert, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import { FontAwesome } from '@expo/vector-icons';
import { useColorScheme } from '@/components/useColorScheme';
import { DARK_COLORS, PRIMARY_COLOR } from '@/constants/App';
import { MAX_REEL_DURATION_MS, MAX_REEL_FILE_SIZE_BYTES } from '@/constants/CreateReel';
import { useCreateReelWizard } from '@/context/CreateReelWizardContext';

const MAX_DURATION_SECONDS = MAX_REEL_DURATION_MS / 1000;
const MAX_FILE_SIZE_MB = MAX_REEL_FILE_SIZE_BYTES / (1024 * 1024);

export default function CreatePickVideoScreen() {
  const isDark = useColorScheme() === 'dark';
  const router = useRouter();
  const { setVideoAsset, reset } = useCreateReelWizard();
  const [isPicking, setIsPicking] = useState(false);

  const handlePickVideo = useCallback(async () => {
    setIsPicking(true);
    try {
      const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!permission.granted) {
        Alert.alert('Permission required', 'Allow access to your videos to create a reel.');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['videos'],
        videoMaxDuration: MAX_DURATION_SECONDS,
        quality: 1,
      });

      if (result.canceled || !result.assets?.length) {
        return;
      }

      const asset = result.assets[0];

      if (asset.duration && asset.duration > MAX_REEL_DURATION_MS) {
        Alert.alert('Video too long', `Please choose a video under ${MAX_DURATION_SECONDS} seconds.`);
        return;
      }

      if (asset.fileSize && asset.fileSize > MAX_REEL_FILE_SIZE_BYTES) {
        Alert.alert('Video too large', `Please choose a video under ${MAX_FILE_SIZE_MB}MB.`);
        return;
      }

      reset();
      setVideoAsset({
        uri: asset.uri,
        durationMs: asset.duration || 0,
        fileSizeBytes: asset.fileSize ?? null,
        mimeType: asset.mimeType ?? null,
        fileName: asset.fileName ?? null,
      });

      router.push('/(tabs)/create/details');
    } catch (error) {
      console.error('Pick video error:', error);
      Alert.alert('Something went wrong', 'Could not pick a video. Please try again.');
    } finally {
      setIsPicking(false);
    }
  }, [reset, setVideoAsset, router]);

  return (
    <View style={[styles.container, isDark && { backgroundColor: DARK_COLORS.background }]}>
      <FontAwesome name="video-camera" size={56} color={isDark ? DARK_COLORS.textSecondary : '#999'} />
      <Text style={[styles.title, isDark && { color: DARK_COLORS.text }]}>Create a Reel</Text>
      <Text style={[styles.subtitle, isDark && { color: DARK_COLORS.textSecondary }]}>
        Pick a video from your library, then sync subtitles to it.
      </Text>

      <Pressable style={styles.button} onPress={handlePickVideo} disabled={isPicking}>
        {isPicking ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.buttonText}>Choose Video</Text>
        )}
      </Pressable>

      <Text style={[styles.hint, isDark && { color: DARK_COLORS.textMuted }]}>
        Max {MAX_DURATION_SECONDS}s, up to {MAX_FILE_SIZE_MB}MB
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginTop: 16,
  },
  subtitle: {
    fontSize: 15,
    color: '#666',
    textAlign: 'center',
    marginTop: 8,
    marginBottom: 24,
  },
  button: {
    backgroundColor: PRIMARY_COLOR,
    paddingVertical: 14,
    paddingHorizontal: 32,
    borderRadius: 24,
    minWidth: 180,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  hint: {
    fontSize: 12,
    color: '#999',
    marginTop: 16,
  },
});
