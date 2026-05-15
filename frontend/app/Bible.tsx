import React, { useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Href, useRouter } from 'expo-router';
import { BibleBook, fetchBibleBooks, Testament } from '@/api/services/bibleServices';
import { SacredPage } from '@/components/sacred/SacredPage';
import { sacredColors } from '@/constants/sacredTheme';

type BookSection = {
  title: string;
  description: string;
  books: BibleBook[];
};

function getSections(books: BibleBook[], testament: Testament): BookSection[] {
  if (testament === 'AT') {
    return [
      {
        title: 'Le Pentateuque',
        description:
          "Les cinq livres de Moïse, fondant la loi et l'histoire des origines du peuple de l'alliance.",
        books: books.filter((book) => book.id >= 1 && book.id <= 5),
      },
      {
        title: 'Les Livres Historiques',
        description: 'La marche du peuple, des conquêtes aux royaumes.',
        books: books.filter((book) => book.id >= 6 && book.id <= 17),
      },
      {
        title: 'Poésie et Sagesse',
        description: 'Prières, louanges et sagesse pour la vie quotidienne.',
        books: books.filter((book) => book.id >= 18 && book.id <= 22),
      },
      {
        title: 'Les Prophètes',
        description: "L'appel de Dieu, la justice et l'espérance annoncée.",
        books: books.filter((book) => book.id >= 23 && book.id <= 39),
      },
    ].filter((section) => section.books.length > 0);
  }

  return [
    {
      title: 'Les Évangiles',
      description: 'La vie, les paroles et les œuvres de Jésus-Christ.',
      books: books.filter((book) => book.id >= 40 && book.id <= 43),
    },
    {
      title: 'Église et Mission',
      description: "Les débuts de l'Église et l'expansion de l'Évangile.",
      books: books.filter((book) => book.id === 44),
    },
    {
      title: 'Les Épîtres',
      description: 'Lettres apostoliques pour enseigner, corriger et fortifier.',
      books: books.filter((book) => book.id >= 45 && book.id <= 65),
    },
    {
      title: 'Révélation',
      description: "La victoire finale de Dieu et l'espérance de l'Église.",
      books: books.filter((book) => book.id === 66),
    },
  ].filter((section) => section.books.length > 0);
}

export default function BibleScreen() {
  const router = useRouter();
  const [testament, setTestament] = useState<Testament>('AT');
  const [books, setBooks] = useState<BibleBook[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let mounted = true;

    setLoading(true);
    fetchBibleBooks(testament)
      .then((data) => {
        if (mounted) {
          setBooks(data);
          setError('');
        }
      })
      .catch(() => {
        if (mounted) {
          setError("Impossible de charger les livres bibliques.");
        }
      })
      .finally(() => {
        if (mounted) {
          setLoading(false);
        }
      });

    return () => {
      mounted = false;
    };
  }, [testament]);

  const sections = useMemo(() => getSections(books, testament), [books, testament]);

  const openBook = (book: BibleBook) => {
    router.push({
      pathname: '/Reader',
      params: { bookId: String(book.id), chapter: '1' },
    } as Href);
  };

  return (
    <SacredPage activeTab="bible">
      <View style={styles.segment}>
        <TouchableOpacity
          activeOpacity={0.8}
          onPress={() => setTestament('AT')}
          style={[styles.segmentButton, testament === 'AT' && styles.segmentActive]}
        >
          <Text style={[styles.segmentText, testament === 'AT' && styles.segmentTextActive]}>
            Ancien Testament
          </Text>
          {testament === 'AT' ? <View style={styles.segmentDot} /> : null}
        </TouchableOpacity>
        <TouchableOpacity
          activeOpacity={0.8}
          onPress={() => setTestament('NT')}
          style={[styles.segmentButton, testament === 'NT' && styles.segmentActive]}
        >
          <Text style={[styles.segmentText, testament === 'NT' && styles.segmentTextActive]}>
            Nouveau Testament
          </Text>
          {testament === 'NT' ? <View style={styles.segmentDot} /> : null}
        </TouchableOpacity>
      </View>

      {loading ? (
        <View style={styles.stateBlock}>
          <ActivityIndicator color={sacredColors.navy} />
        </View>
      ) : error ? (
        <Text style={styles.errorText}>{error}</Text>
      ) : (
        sections.map((section) => (
          <View key={section.title} style={styles.section}>
            <Text style={styles.sectionTitle}>{section.title}</Text>
            <Text style={styles.sectionDescription}>{section.description}</Text>

            {section.books.map((book) => (
              <TouchableOpacity
                activeOpacity={0.86}
                key={book.id}
                onPress={() => openBook(book)}
                style={styles.bookCard}
              >
                <View>
                  <View style={styles.bookTopRow}>
                    <Text style={styles.bookLabel}>LIVRE {book.id}</Text>
                    <Ionicons name="book-outline" size={16} color="#CABD92" />
                  </View>
                  <Text style={styles.bookName}>{book.name}</Text>
                  <Text style={styles.chapterCount}>{book.chapterCount} Chapitres</Text>
                </View>
                <View style={styles.arrowCircle}>
                  <Ionicons name="arrow-forward" size={18} color={sacredColors.navy} />
                </View>
              </TouchableOpacity>
            ))}
          </View>
        ))
      )}
    </SacredPage>
  );
}

const styles = StyleSheet.create({
  segment: {
    height: 52,
    backgroundColor: '#F7F4F0',
    borderRadius: 26,
    flexDirection: 'row',
    marginBottom: 20,
    padding: 4,
  },
  segmentButton: {
    flex: 1,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  segmentActive: {
    backgroundColor: sacredColors.white,
  },
  segmentText: {
    color: '#2D3854',
    fontSize: 12,
    fontWeight: '700',
  },
  segmentTextActive: {
    color: sacredColors.navy,
  },
  segmentDot: {
    width: 3,
    height: 3,
    borderRadius: 2,
    backgroundColor: sacredColors.gold,
    marginTop: 5,
  },
  stateBlock: {
    alignItems: 'center',
    paddingVertical: 42,
  },
  errorText: {
    color: '#9A3C37',
    fontSize: 12,
    fontWeight: '700',
    paddingVertical: 20,
    textAlign: 'center',
  },
  section: {
    marginBottom: 18,
  },
  sectionTitle: {
    color: sacredColors.navy,
    fontFamily: 'serif',
    fontSize: 25,
    fontStyle: 'italic',
    marginBottom: 6,
  },
  sectionDescription: {
    color: '#5A6378',
    fontSize: 13,
    lineHeight: 19,
    marginBottom: 14,
    width: '100%',
  },
  bookCard: {
    minHeight: 92,
    backgroundColor: sacredColors.cream,
    borderRadius: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
    paddingHorizontal: 18,
    paddingVertical: 14,
  },
  bookTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 5,
  },
  bookLabel: {
    color: '#8FA2C7',
    fontSize: 10,
    fontWeight: '900',
  },
  bookName: {
    color: sacredColors.navy,
    fontFamily: 'serif',
    fontSize: 28,
    fontWeight: '700',
    lineHeight: 32,
  },
  chapterCount: {
    color: '#6A6670',
    fontSize: 12,
    fontWeight: '700',
    marginTop: 2,
  },
  arrowCircle: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: sacredColors.white,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
