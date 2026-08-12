import React from 'react';
import { View, Text, StyleSheet, Image, Pressable } from 'react-native';
import { Link } from 'expo-router';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { DARK_COLORS, PRIMARY_COLOR } from '@/constants/App';

interface ProfileHeaderProps {
  isDark: boolean;
  firstName?: string;
  username?: string;
  profilePicture?: string;
}

export function ProfileHeader({ isDark, firstName, username, profilePicture }: ProfileHeaderProps) {
  const initial = (firstName || username || '?').charAt(0).toUpperCase();

  return (
    <View style={styles.userSection}>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12, flex: 1 }}>
        <View style={styles.avatarRing}>
          {profilePicture ? (
            <Image source={{ uri: profilePicture }} style={styles.avatarImage} />
          ) : (
            <View style={styles.avatarInitial}>
              <Text style={styles.avatarInitialText}>{initial}</Text>
            </View>
          )}
        </View>
        <View style={styles.userInfo}>
          <Text style={[styles.userName, isDark && { color: DARK_COLORS.text }]}>
            {firstName || username}
          </Text>
          <Text style={[styles.userHandle, isDark && { color: DARK_COLORS.textSecondary }]}>
            @{username}
          </Text>
        </View>
      </View>

      <Link href="/settings" asChild style={{padding: 10, justifyContent: 'start', alignSelf: 'flex-start' }}>
        <Pressable hitSlop={12}>
          {({ pressed }) => (
            <FontAwesome
              name="bars"
              size={25}
              color={isDark ? DARK_COLORS.text : '#333'}
              style={{ opacity: pressed ? 0.5 : 1 }}
            />
          )}
        </Pressable>
      </Link>
    </View>
  );
}

const styles = StyleSheet.create({
  userSection: {
    flexDirection: 'row',
    paddingVertical: 12,
    paddingHorizontal: 12,
    marginBottom: 4,
  },
  avatarRing: {
    width: 84,
    height: 84,
    borderRadius: 42,
    padding: 3,
    borderWidth: 2,
    borderColor: PRIMARY_COLOR,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarImage: {
    width: 76,
    height: 76,
    borderRadius: 38,
  },
  avatarInitial: {
    width: 76,
    height: 76,
    borderRadius: 38,
    backgroundColor: PRIMARY_COLOR,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarInitialText: {
    fontSize: 32,
    fontWeight: '700',
    color: '#fff',
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 22,
    fontWeight: '700',
    color: '#333',
    marginBottom: 2,
  },
  userHandle: {
    fontSize: 14,
    color: '#999',
  },
});
