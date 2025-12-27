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
                Language ID: {lang.id} {"\n"}
                Language Name: {lang.learning_language_id} {"\n"}
                Language Code: {lang.native_language_id}
              </Text>
            );
          })}
        </Text>

        <Text> Dictionary: </Text>
        <Text>
          
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
