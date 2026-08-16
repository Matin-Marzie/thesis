import React, { useCallback, useState } from 'react';
import { View, StyleSheet, ScrollView, StatusBar, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import ImageCropPicker from 'react-native-image-crop-picker';
import { useProfile } from '@/context/ProfileContext';
import { useProgress } from '@/context/ProgressContext';
import { useUserReels } from '@/context/UserReelsContext';
import { useAuth } from '@/context/AuthContext';
import { uploadProfilePicture } from '@/api/user';
import { LANGUAGES_META } from '@/constants/SupportedLanguages';
import { DARK_COLORS } from '@/constants/App';
import { useColorScheme } from '@/components/useColorScheme';
import { ProfileHeader } from '@/components/profile/ProfileHeader';
import { ProfileStats } from '@/components/profile/ProfileStats';
import { ProfileReels } from '@/components/profile/ProfileReels';
import { ProfileAuthButtons } from '@/components/profile/ProfileAuthButtons';

export default function ProfileScreen() {
  const isDark = useColorScheme() === 'dark';
  const { userProfile, setUserProfile } = useProfile();
  const { userProgress } = useProgress();
  const { userReels } = useUserReels();
  const { isAuthenticated } = useAuth();
  const router = useRouter();
  const [changingPicture, setChangingPicture] = useState(false);

  const handleChangePicture = useCallback(async () => {
    // react-native-image-crop-picker (not expo-image-picker) here specifically
    // for its `cropperCircleOverlay` option - the profile picture is always
    // displayed as a circle, so the crop UI should show one too.
    let image;
    try {
      image = await ImageCropPicker.openPicker({
        width: 512,
        height: 512,
        cropping: true,
        cropperCircleOverlay: true,
        mediaType: 'photo',
        compressImageQuality: 0.8,
      });
    } catch (err: any) {
      if (err.code === 'E_PICKER_CANCELLED') return;
      if (err.code === 'E_NO_LIBRARY_PERMISSION') {
        Alert.alert('Permission required', 'Allow access to your photos to change your profile picture.');
        return;
      }
      Alert.alert('Something went wrong', 'Could not open the photo picker. Please try again.');
      return;
    }

    setChangingPicture(true);
    try {
      const { data } = await uploadProfilePicture({
        uri: image.path,
        mimeType: image.mime,
        fileName: image.filename,
      });
      await setUserProfile((prev: typeof userProfile) => ({ ...prev, ...data.user }));
    } catch (err: any) {
      Alert.alert('Something went wrong', err.message || 'Could not update your profile picture.');
    } finally {
      setChangingPicture(false);
    }
  }, [setUserProfile]);

  const currentLanguage = userProgress?.languages?.find((l) => l.is_current_language) || userProgress?.languages?.[0];
  const languageMeta = Object.values(LANGUAGES_META).find((l) => l.id === Number(currentLanguage?.learning_language?.id));

  return (
    <SafeAreaView
      edges={['top']}
      style={[styles.container, isDark && { backgroundColor: DARK_COLORS.background }]}
    >
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} />
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.content}>
          {userProfile && (
            <>
              <ProfileHeader
                isDark={isDark}
                firstName={userProfile.first_name}
                username={userProfile.username}
                profilePicture={userProfile.profile_picture}
                onChangePicture={isAuthenticated ? handleChangePicture : undefined}
                changingPicture={changingPicture}
              />

              <ProfileStats
                isDark={isDark}
                flag={languageMeta?.flag}
                level={currentLanguage?.proficiency_level || 'A1'}
                xp={currentLanguage?.experience || 0}
                coins={userProgress?.coins || 0}
                energy={userProgress?.energy || 0}
              />

              <ProfileReels isDark={isDark} reels={userReels} />
            </>
          )}

          {!isAuthenticated && (
            <ProfileAuthButtons
              isDark={isDark}
              onCreateAccount={() => router.push('/onboarding/register')}
              onLogin={() => router.push('/onboarding/login')}
            />
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  scrollView: {
    flex: 1,
  },
  content: {
  },
});
