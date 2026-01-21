import React from 'react';
import {
  View, Text, TouchableOpacity, ScrollView, SafeAreaView, StyleSheet, Dimensions
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';

const { width } = Dimensions.get('window');

export default function HomeScreen() {
  const categories = [
    { id: '1', title: 'Bibles', icon: 'book-open-variant', color: '#D4AF37' },
    { id: '2', title: 'Audios', icon: 'headphones', color: '#9c27b0' },
    { id: '3', title: 'Vidéos', icon: 'play-circle', color: '#e53935' },
    { id: '4', title: 'Documents', icon: 'file-document-outline', color: '#4caf50' },
  ];

  return (
    <View style={styles.container}>
      <SafeAreaView style={{ flex: 1 }}>
        <View style={styles.header}>
          <Ionicons name="person-circle-outline" size={32} color="#1565c0" />
          <Text style={styles.title}>Accueil</Text>
          <Ionicons name="search-outline" size={28} color="#1565c0" />
        </View>

        <ScrollView contentContainerStyle={styles.scroll}>
          <LinearGradient colors={['#D4AF37', '#f1c40f']} style={styles.verse}>
            <Text style={styles.verseTitle}>Verset du Jour</Text>
            <Text style={styles.verseText}>
              "Ta parole est une lampe à mes pieds, et une lumière sur mon sentier."
            </Text>
            <Text style={styles.verseRef}>Psaumes 119:105</Text>
          </LinearGradient>

          <View style={styles.grid}>
            {categories.map(cat => (
              <TouchableOpacity key={cat.id} style={styles.card}>
                <View style={[styles.icon, { backgroundColor: cat.color + '15' }]}>
                  <MaterialCommunityIcons name={cat.icon} size={32} color={cat.color} />
                </View>
                <Text style={styles.cardTitle}>{cat.title}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fcfcfc' },
  header: { flexDirection: 'row', justifyContent: 'space-between', padding: 20 },
  title: { fontSize: 18, fontWeight: 'bold' },
  scroll: { padding: 20 },
  verse: { padding: 25, borderRadius: 20, marginBottom: 30 },
  verseTitle: { color: '#fff', fontSize: 12, fontWeight: 'bold' },
  verseText: { color: '#fff', fontSize: 18, fontWeight: '700', marginVertical: 10 },
  verseRef: { color: '#fff', textAlign: 'right', fontWeight: 'bold' },
  grid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },
  card: {
    width: (width - 60) / 2,
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 20,
    marginBottom: 20,
    elevation: 3,
  },
  icon: { width: 60, height: 60, borderRadius: 30, justifyContent: 'center', alignItems: 'center' },
  cardTitle: { marginTop: 10, fontWeight: '700' },
});
