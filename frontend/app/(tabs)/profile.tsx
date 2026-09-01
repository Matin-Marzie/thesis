import React, { useCallback, useRef, useState } from 'react';
import { View, StyleSheet, ScrollView, StatusBar, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import type { BottomSheetModal } from '@gorhom/bottom-sheet';
import * as ImagePicker from 'expo-image-picker';
import { useProfile } from '@/context/ProfileContext';
import { useProgress } from '@/context/ProgressContext';
import { useUserReels } from '@/context/UserReelsContext';
import { useAuth } from '@/context/AuthContext';
import { uploadProfilePicture, deleteProfilePicture } from '@/api/user';
import { LANGUAGES_META } from '@/constants/SupportedLanguages';
import { DARK_COLORS } from '@/constants/App';
import { useColorScheme } from '@/components/useColorScheme';
import { getMediaUrl } from '@/utils/mediaUrl';
import { ProfileHeader } from '@/components/profile/ProfileHeader';
import { ProfilePictureOptionsSheet } from '@/components/profile/ProfilePictureOptionsSheet';
import { ProfileStats } from '@/components/profile/ProfileStats';
import { ProfileReels } from '@/components/profile/ProfileReels';
import { ProfileAuthButtons } from '@/components/profile/ProfileAuthButtons';

export default function ProfileScreen() {
  const isDark = useColorScheme() === 'dark';
  const { userProfile, setUserProfile } = useProfile();
  const { userProgress } = useProgress();
  const { userReels, isFetchingUserReels } = useUserReels();
  const { isAuthenticated } = useAuth();
  const router = useRouter();
  const [changingPicture, setChangingPicture] = useState(false);
  const pictureOptionsSheetRef = useRef<BottomSheetModal>(null);

  const handlePickPicture = useCallback(async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      Alert.alert('Permission required', 'Allow access to your photos to change your profile picture.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (result.canceled || !result.assets?.length) return;
    const asset = result.assets[0];

    setChangingPicture(true);
    try {
      const { data } = await uploadProfilePicture({
        uri: asset.uri,
        mimeType: asset.mimeType ?? null,
        fileName: asset.fileName ?? null,
      });
      await setUserProfile((prev: typeof userProfile) => ({ ...prev, ...data.user }));
    } catch (err: any) {
      Alert.alert('Something went wrong', err.message || 'Could not update your profile picture.');
    } finally {
      setChangingPicture(false);
    }
  }, [setUserProfile]);

  const handleRemovePicture = useCallback(async () => {
    setChangingPicture(true);
    try {
      const { data } = await deleteProfilePicture();
      await setUserProfile((prev: typeof userProfile) => ({ ...prev, ...data.user }));
    } catch (err: any) {
      Alert.alert('Something went wrong', err.message || 'Could not remove your profile picture.');
    } finally {
      setChangingPicture(false);
    }
  }, [setUserProfile]);

  const handleChangePicture = useCallback(() => {
    if (!userProfile?.profile_picture) {
      handlePickPicture();
      return;
    }

    pictureOptionsSheetRef.current?.present();
  }, [userProfile?.profile_picture, handlePickPicture]);

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
                profilePicture={getMediaUrl(userProfile.profile_picture)}
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

              <ProfileReels isDark={isDark} reels={userReels} isLoading={isFetchingUserReels} />
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

      <ProfilePictureOptionsSheet
        ref={pictureOptionsSheetRef}
        onChoosePhoto={handlePickPicture}
        onRemovePhoto={handleRemovePicture}
      />
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
