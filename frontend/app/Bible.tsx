import React, { useMemo, useState } from 'react';
import { View, Text, StyleSheet, ImageBackground, SafeAreaView, ScrollView, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

type Verse = {
  id: string;
  book: string;
  reference: string;
  text: string;
};

export default function BibleScreen() {
  const verses: Verse[] = useMemo(
    () => [
      {
        id: 'jn-3-16',
        book: 'Jean',
        reference: 'Jean 3:16',
        text:
          "Car Dieu a tant aimé le monde qu'il a donné son Fils unique, afin que quiconque croit en lui ne périsse point, mais qu'il ait la vie éternelle.",
      },
      {
        id: 'ps-23-1',
        book: 'Psaumes',
        reference: 'Psaume 23:1',
        text: "L'Éternel est mon berger: je ne manquerai de rien.",
      },
      {
        id: 'pr-3-5',
        book: 'Proverbes',
        reference: 'Proverbes 3:5',
        text: "Confie-toi en l'Éternel de tout ton cœur, Et ne t'appuie pas sur ta sagesse.",
      },
      {
        id: 'rm-8-28',
        book: 'Romains',
        reference: 'Romains 8:28',
        text:
          "Nous savons, du reste, que toutes choses concourent au bien de ceux qui aiment Dieu, de ceux qui sont appelés selon son dessein.",
      },
    ],
    []
  );

  const books = useMemo(() => Array.from(new Set(verses.map((v) => v.book))), [verses]);
  const [selectedBook, setSelectedBook] = useState<string>(books[0] ?? '');

  const filtered = useMemo(() => verses.filter((v) => (selectedBook ? v.book === selectedBook : true)), [verses, selectedBook]);

  return (
    <View style={styles.container}>
      <ImageBackground source={require('../assets/enregistrement.png')} style={styles.bg} imageStyle={{ opacity: 0.05 }}>
        <SafeAreaView style={styles.header}>
          <Text style={styles.headerTitle}>Bible</Text>
        </SafeAreaView>

        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          <Text style={styles.sectionTitle}>Livres</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.booksRow}>
            {books.map((b) => {
              const active = b === selectedBook;
              return (
                <TouchableOpacity key={b} onPress={() => setSelectedBook(b)} style={[styles.bookChip, active && styles.bookChipActive]}>
                  <Text style={[styles.bookChipText, active && styles.bookChipTextActive]}>{b}</Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>

          <Text style={[styles.sectionTitle, { marginTop: 18 }]}>Versets</Text>
          {filtered.map((v) => (
            <View key={v.id} style={styles.verseCard}>
              <View style={styles.verseHeader}>
                <Ionicons name="book-outline" size={18} color="#D4AF37" />
                <Text style={styles.verseRef}>{v.reference}</Text>
              </View>
              <Text style={styles.verseText}>{v.text}</Text>
            </View>
          ))}

          <View style={styles.bottomPadding} />
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
  scrollContent: { padding: 20 },
  sectionTitle: { fontSize: 16, fontWeight: '800', color: '#0a2d55', marginBottom: 12 },
  booksRow: { gap: 10, paddingRight: 10 },
  bookChip: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 999,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: 'rgba(10,45,85,0.15)',
  },
  bookChipActive: { backgroundColor: '#0a2d55', borderColor: '#0a2d55' },
  bookChipText: { color: '#0a2d55', fontWeight: '700' },
  bookChipTextActive: { color: '#fff' },
  verseCard: {
    backgroundColor: '#fff',
    borderRadius: 14,
    padding: 16,
    marginBottom: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#D4AF37',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 2,
  },
  verseHeader: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 10 },
  verseRef: { fontSize: 14, fontWeight: '800', color: '#0a2d55' },
  verseText: { fontSize: 14, color: '#333', lineHeight: 20, fontWeight: '500' },
  bottomPadding: { height: 20 },
});
