import React, { useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Dimensions,
  ImageBackground,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { Href, useRouter } from 'expo-router';
import { BibleVerse, searchBibleVerses } from '@/api/services/bibleServices';
import { SacredPage } from '@/components/sacred/SacredPage';
import { sacredColors, sacredShadow } from '@/constants/sacredTheme';

const { height: screenHeight } = Dimensions.get('window');
const themeCardHeight = Math.min(Math.max(screenHeight * 0.23, 180), 240);

type ThemeCard = {
  title: string;
  tint: string;
  image: number;
};

const themeCards: ThemeCard[] = [
  {
    title: 'Amour',
    tint: 'rgba(7,47,111,0.72)',
    image: require('../../../assets/Timage.jpg'),
  },
  {
    title: 'Foi',
    tint: 'rgba(4,42,104,0.72)',
    image: require('../../../assets/bible.cross_.webp'),
  },
  {
    title: 'Paix',
    tint: 'rgba(47,79,144,0.68)',
    image: require('../../../assets/bible.jpg'),
  },
];

export default function SearchScreen() {
  const router = useRouter();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<BibleVerse[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const search = query.trim();

    if (search.length < 2) {
      setResults([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    const timeout = setTimeout(() => {
      searchBibleVerses(search)
        .then(setResults)
        .catch(() => setResults([]))
        .finally(() => setLoading(false));
    }, 280);

    return () => clearTimeout(timeout);
  }, [query]);

  const hasSearch = query.trim().length >= 2;

  const title = useMemo(() => (hasSearch ? 'Résultats' : 'Thèmes Sacrés'), [hasSearch]);

  const openVerse = (verse: BibleVerse) => {
    router.push({
      pathname: '/Reader',
      params: { bookId: String(verse.bookId), chapter: String(verse.chapter) },
    } as Href);
  };

  return (
    <SacredPage activeTab="library">
      <Text style={styles.title}>Explorer</Text>
      <Text style={styles.subtitle}>{"Que cherchez-vous dans Sa Parole aujourd'hui?"}</Text>

      <View style={styles.searchBar}>
        <Ionicons name="search-outline" size={20} color="#9CA3AF" />
        <TextInput
          value={query}
          onChangeText={setQuery}
          placeholder="Rechercher par thème, verset, ou mot-clé..."
          placeholderTextColor="#A1A7B3"
          style={styles.input}
        />
        <TouchableOpacity style={styles.filterButton}>
          <Ionicons name="options-outline" size={21} color={sacredColors.navy} />
        </TouchableOpacity>
      </View>

      <Text style={styles.sectionTitle}>{title}</Text>

      {loading ? (
        <View style={styles.stateBlock}>
          <ActivityIndicator color={sacredColors.navy} />
        </View>
      ) : hasSearch ? (
        <View>
          {results.map((verse) => (
            <TouchableOpacity
              key={verse.canonicalId}
              activeOpacity={0.85}
              onPress={() => openVerse(verse)}
              style={styles.resultCard}
            >
              <Text style={styles.resultRef}>
                {verse.bookName} {verse.chapter}:{verse.verseNum}
              </Text>
              <Text style={styles.resultText} numberOfLines={3}>
                {verse.text}
              </Text>
            </TouchableOpacity>
          ))}
          {results.length === 0 ? (
            <Text style={styles.emptyText}>Aucun verset trouvé.</Text>
          ) : null}
        </View>
      ) : (
        <View style={styles.themeList}>
          {themeCards.map((card) => (
            <TouchableOpacity key={card.title} activeOpacity={0.86} style={styles.themeCard}>
              <ImageBackground
                source={card.image}
                resizeMode="cover"
                style={styles.themeImage}
                imageStyle={styles.themeImageRadius}
              >
                <LinearGradient
                  colors={['rgba(255,255,255,0.35)', card.tint]}
                  style={styles.themeOverlay}
                >
                  <Text style={styles.themeTitle}>{card.title}</Text>
                  <Ionicons name="heart" size={22} color="#626623" style={styles.themeIcon} />
                </LinearGradient>
              </ImageBackground>
            </TouchableOpacity>
          ))}
        </View>
      )}
    </SacredPage>
  );
}

const styles = StyleSheet.create({
  title: {
    color: sacredColors.navy,
    fontFamily: 'serif',
    fontSize: 36,
    fontWeight: '800',
    lineHeight: 42,
    marginTop: 6,
  },
  subtitle: {
    color: '#4F5B70',
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 22,
    width: '100%', // ✅ Changé de 76% à 100%
  },
  searchBar: {
    ...sacredShadow,
    height: 50,
    backgroundColor: sacredColors.white,
    borderRadius: 25,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 26,
    paddingLeft: 16,
    paddingRight: 8,
  },
  input: {
    color: sacredColors.ink,
    flex: 1,
    fontSize: 14,
    paddingVertical: 0,
  },
  filterButton: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sectionTitle: {
    color: sacredColors.navy,
    fontFamily: 'serif',
    fontSize: 23,
    fontStyle: 'italic',
    fontWeight: '800',
    marginBottom: 18,
  },
  stateBlock: {
    alignItems: 'center',
    paddingVertical: 28,
  },
  themeList: {
    gap: 18,
  },
  themeCard: {
    height: themeCardHeight,
    borderRadius: 12,
    overflow: 'hidden',
  },
  themeImage: {
    flex: 1,
  },
  themeImageRadius: {
    borderRadius: 12,
  },
  themeOverlay: {
    flex: 1,
    padding: 22,
    justifyContent: 'flex-end',
  },
  themeTitle: {
    color: sacredColors.white,
    fontFamily: 'serif',
    fontSize: 32,
    fontWeight: '700',
  },
  themeIcon: {
    marginTop: 14,
  },
  resultCard: {
    backgroundColor: '#F1F0EF',
    borderRadius: 10,
    marginBottom: 14,
    padding: 18,
  },
  resultRef: {
    color: sacredColors.navy,
    fontSize: 13,
    fontWeight: '900',
    marginBottom: 8,
  },
  resultText: {
    color: '#151923',
    fontFamily: 'serif',
    fontSize: 17,
    lineHeight: 26,
  },
  emptyText: {
    color: '#737B8C',
    fontSize: 14,
    fontWeight: '700',
    paddingVertical: 28,
    textAlign: 'center',
  },
});
