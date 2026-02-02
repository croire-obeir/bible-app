import React, { useState } from 'react';
import { View, Text, StyleSheet, ImageBackground, SafeAreaView, TextInput, ScrollView, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

export default function SearchScreen() {
  const [searchQuery, setSearchQuery] = useState('');

  return (
    <View style={styles.container}>
      <ImageBackground
        source={require('../../../assets/enregistrement.png')}
        style={styles.bg}
        imageStyle={{ opacity: 0.05 }}
      >
        <SafeAreaView style={styles.header}>
          <Text style={styles.headerTitle}>Recherche</Text>
        </SafeAreaView>

        <View style={styles.searchContainer}>
          <View style={styles.searchBar}>
            <Ionicons name="search-outline" size={20} color="#D4AF37" />
            <TextInput
              placeholder="Rechercher un verset, un thème..."
              placeholderTextColor="#999"
              style={styles.input}
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
          </View>
        </View>

        <ScrollView contentContainerStyle={styles.scrollContent}>
          <Text style={styles.sectionTitle}>Suggestions</Text>
          
          {['La Foi', 'Le Pardon', 'La Prière', 'L\'Obéissance'].map((item, index) => (
            <TouchableOpacity key={index} style={styles.suggestionItem}>
              <Ionicons name="trending-up-outline" size={18} color="#1565c0" />
              <Text style={styles.suggestionText}>{item}</Text>
              <Ionicons name="chevron-forward" size={18} color="#D4AF37" />
            </TouchableOpacity>
          ))}
        </ScrollView>
      </ImageBackground>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5' },
  bg: { flex: 1 },
  header: { backgroundColor: '#0a2d55', paddingVertical: 20, alignItems: 'center' },
  headerTitle: { color: '#fff', fontSize: 20, fontWeight: '700', letterSpacing: 1 },
  searchContainer: { padding: 20, backgroundColor: '#0a2d55', borderBottomLeftRadius: 20, borderBottomRightRadius: 20 },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 12,
    paddingHorizontal: 15,
    height: 50,
  },
  input: { flex: 1, marginLeft: 10, color: '#0a2d55', fontSize: 16 },
  scrollContent: { padding: 20 },
  sectionTitle: { fontSize: 16, fontWeight: '700', color: '#0a2d55', marginBottom: 15 },
  suggestionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 12,
    marginBottom: 10,
    elevation: 2,
  },
  suggestionText: { flex: 1, marginLeft: 15, fontSize: 15, color: '#333', fontWeight: '500' },
});