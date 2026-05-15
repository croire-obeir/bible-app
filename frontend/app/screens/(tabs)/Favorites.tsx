import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SacredPage } from '@/components/sacred/SacredPage';
import { sacredColors } from '@/constants/sacredTheme';

const favoriteItems = [
  {
    id: 1,
    title: 'Psaume 23',
    content: "L'Éternel est mon berger: je ne manquerai de rien.",
    category: 'Verset',
  },
  {
    id: 2,
    title: "La marche par l'Esprit",
    content: 'Étude biblique sur Galates 5',
    category: 'Étude',
  },
];

export default function FavoritesScreen() {
  return (
    <SacredPage activeTab="library">
      <Text style={styles.title}>Favoris</Text>
      <Text style={styles.subtitle}>Les textes et ressources gardés pour plus tard.</Text>

      {favoriteItems.length > 0 ? (
        favoriteItems.map((item) => (
          <TouchableOpacity key={item.id} activeOpacity={0.86} style={styles.favoriteCard}>
            <View style={styles.favoriteText}>
              <Text style={styles.category}>{item.category}</Text>
              <Text style={styles.itemTitle}>{item.title}</Text>
              <Text style={styles.excerpt} numberOfLines={1}>
                {item.content}
              </Text>
            </View>
            <Ionicons name="heart" size={24} color="#9F3C36" />
          </TouchableOpacity>
        ))
      ) : (
        <View style={styles.emptyBlock}>
          <Ionicons name="heart-outline" size={42} color="#C5BDAC" />
          <Text style={styles.emptyText}>Aucun favori pour le moment</Text>
        </View>
      )}
    </SacredPage>
  );
}

const styles = StyleSheet.create({
  title: {
    color: sacredColors.navy,
    fontFamily: 'serif',
    fontSize: 30,
    fontStyle: 'italic',
    fontWeight: '800',
    marginBottom: 4,
  },
  subtitle: {
    color: '#5A6378',
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 18,
  },
  favoriteCard: {
    minHeight: 86,
    backgroundColor: sacredColors.cream,
    borderRadius: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  favoriteText: {
    flex: 1,
    paddingRight: 12,
  },
  category: {
    color: '#8FA2C7',
    fontSize: 10,
    fontWeight: '900',
    marginBottom: 3,
  },
  itemTitle: {
    color: sacredColors.navy,
    fontFamily: 'serif',
    fontSize: 22,
    fontWeight: '800',
  },
  excerpt: {
    color: '#6F7788',
    fontSize: 13,
    fontWeight: '600',
    marginTop: 4,
  },
  emptyBlock: {
    alignItems: 'center',
    paddingVertical: 52,
  },
  emptyText: {
    color: '#818898',
    fontSize: 14,
    fontWeight: '800',
    marginTop: 8,
  },
});
