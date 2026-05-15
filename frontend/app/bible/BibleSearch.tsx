import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons'; // Assuming Expo; use react-native-vector-icons otherwise
import { useRouter } from 'expo-router';

const BibleSearch = () => {
  const router = useRouter();

  return (
    <View style={styles.container}>
      {/* Option A: Floating Search Button in the Body */}
      <TouchableOpacity 
        style={styles.searchButton}
         onPress={() => router.push('/bible/SearchScreen')}
      >
        <Ionicons name="search" size={24} color="white" />
        <Text style={styles.buttonText}>Recherche par thème</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  text: { fontSize: 18, marginBottom: 20 },
  searchButton: {
    flexDirection: 'row',
    backgroundColor: '#007AFF',
    padding: 12,
    borderRadius: 25,
    alignItems: 'center',
  },
  buttonText: { color: 'white', marginLeft: 8, fontWeight: '600' }
});

export default BibleSearch;