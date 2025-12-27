import { useAppContext } from '@/context/AppContext';
import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';

export default function HomeScreen() {

  const { user, dictionary } = useAppContext();

  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        <Text> id: {user?.id}</Text>
        <Text> first_name: {user?.first_name}</Text>
        <Text> last_name: {user?.last_name}</Text>
        <Text> email: {user?.email}</Text>
        <Text> username: {user?.username}</Text>
        <Text>
          {user?.languages?.map((lang) => {
            // generate a valid 6-digit hex color from ID
            const color = `#${((lang.id * 1235) % 0xffffff).toString(16).padStart(6, '0')}`;
            return (
              <Text
                key={`lang-${lang.learning_language_id}-${lang.native_language_id}`}
                style={{
                  backgroundColor: color,
                  padding: 4,        // add padding so bg is visible
                  marginVertical: 2, // spacing between items
                }}
              >
                id: {lang.id} {"\n"}
                {"\n"}
                language.learning_id: {lang.learning_language_id} {"\n"}
                language.learning_name: {lang.learning_language_name} {"\n"}
                language.learning_code: {lang.learning_language_code} {"\n"}
                {"\n"}
                language.native_id: {lang.native_language_id} {"\n"}
                language.native_name: {lang.native_language_name} {"\n"}
                language.native_code: {lang.native_language_code} {"\n"}
                {"\n"}
                is_current_language: {lang.is_current_language ? 'true' : 'false'} {"\n"}
                proficiency_level: {lang.proficiency_level} {"\n"}
                experience: {lang.experience} {"\n"}
                created_at: {lang.created_at} {"\n"}
              </Text>
            );
          })}
        </Text>

        <Text> Dictionary: </Text>
        
        <Text>
          {dictionary.words?.map((word) => (
            <Text key={`word-${word.id}`}>
              id: {word.id} - {word.written_form} {"\n"}
            </Text>
          ))}
        </Text>

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
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 18,
    color: '#666',
  },
});
