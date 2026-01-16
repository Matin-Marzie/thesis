import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useAppContext } from '@/context/AppContext';
import { PRIMARY_COLOR } from '@/constants/App';

export default function ProfileScreen() {
  const { userProfile, isAuthenticated } = useAppContext();
  const router = useRouter();

  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        {/* User Info Section */}
        {userProfile && (
          <View style={styles.userSection}>
            <View style={styles.avatarContainer}>
              { userProfile?.profile_picture ? (
                <Image
                  source={{ uri: userProfile.profile_picture }}
                  style={styles.avatarImage}
                />
              ) : (
                <Ionicons name="person-circle" size={80} color="#fff" />
              )
              }
            </View>
            <Text style={styles.userName}>{userProfile.first_name || userProfile.username}</Text>
            <Text style={styles.userEmail}>{userProfile.email || `@${userProfile.username}`}</Text>
          </View>
        )}

        {/* Auth Buttons - Show only when not authenticated */}
        {!isAuthenticated && (
          <View style={styles.authSection}>
            <TouchableOpacity 
              style={styles.createAccountButton}
              onPress={() => router.push('/onboarding/register')}
            >
              <Text style={styles.createAccountText}>CREATE ACCOUNT</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.loginButton}
              onPress={() => router.push('/onboarding/login')}
            >
              <Text style={styles.loginText}>LOGIN</Text>
            </TouchableOpacity>
          </View>
        )}
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
    padding: 20,
  },
  userSection: {
    alignItems: 'center',
    paddingVertical: 30,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
    marginBottom: 20,
  },
  avatarContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#4CAF50',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 15,
  },
  avatarImage: {
    width: 80,
    height: 80,
    borderRadius: 40,
  },
  userName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
  },
  userEmail: {
    fontSize: 16,
    color: '#666',
  },
  authSection: {
    paddingVertical: 20,
    gap: 16,
  },
  createAccountButton: {
    backgroundColor: PRIMARY_COLOR,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  createAccountText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    letterSpacing: 1,
  },
  loginButton: {
    backgroundColor: '#fff',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: PRIMARY_COLOR,
  },
  loginText: {
    color: PRIMARY_COLOR,
    fontSize: 16,
    fontWeight: 'bold',
    letterSpacing: 1,
  },
});
