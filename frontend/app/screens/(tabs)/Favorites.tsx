import React from 'react';
import { View, Text, StyleSheet, ImageBackground, SafeAreaView, ScrollView, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

export default function FavoritesScreen() {
  const favoriteItems = [
    { id: 1, title: 'Psaume 23', content: 'L\'Éternel est mon berger...', category: 'Verset' },
    { id: 2, title: 'La Marche par l\'Esprit', content: 'Étude biblique sur Galates 5', category: 'Étude' },
  ];

  return (
    <View style={styles.container}>
      <ImageBackground
        source={require('../../../assets/enregistrement.png')}
        style={styles.bg}
        imageStyle={{ opacity: 0.05 }}
      >
        <SafeAreaView style={styles.header}>
          <Text style={styles.headerTitle}>Mes Favoris</Text>
        </SafeAreaView>

        <ScrollView contentContainerStyle={styles.scrollContent}>
          {favoriteItems.length > 0 ? (
            favoriteItems.map((item) => (
              <TouchableOpacity key={item.id} style={styles.favCard}>
                <View style={styles.favInfo}>
                  <Text style={styles.favCategory}>{item.category}</Text>
                  <Text style={styles.favTitle}>{item.title}</Text>
                  <Text style={styles.favExcerpt} numberOfLines={1}>{item.content}</Text>
                </View>
                <Ionicons name="heart" size={24} color="#E74C3C" />
              </TouchableOpacity>
            ))
          ) : (
            <View style={styles.emptyContainer}>
              <Ionicons name="heart-outline" size={80} color="#ccc" />
              <Text style={styles.emptyText}>Aucun favori pour le moment</Text>
            </View>
          )}
        </ScrollView>
      </ImageBackground>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5' },
  bg: { flex: 1 },
  header: { backgroundColor: '#0a2d55', paddingVertical: 20, alignItems: 'center' },
  headerTitle: { color: '#fff', fontSize: 20, fontWeight: '700' },
  scrollContent: { padding: 20 },
  favCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 15,
    marginBottom: 15,
    borderLeftWidth: 5,
    borderLeftColor: '#D4AF37', // Or
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  favInfo: { flex: 1 },
  favCategory: { fontSize: 10, color: '#D4AF37', fontWeight: 'bold', textTransform: 'uppercase' },
  favTitle: { fontSize: 16, fontWeight: '700', color: '#0a2d55', marginVertical: 2 },
  favExcerpt: { fontSize: 13, color: '#666' },
  emptyContainer: { alignItems: 'center', marginTop: 100 },
  emptyText: { color: '#999', marginTop: 10, fontSize: 16 },
});