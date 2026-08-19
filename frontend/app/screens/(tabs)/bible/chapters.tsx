import React, { useEffect, useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity, 
  ActivityIndicator 
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useSQLiteContext } from 'expo-sqlite';
import AppDrawer from '../../../../components/AppDrawer';

// Structure for our verse elements
interface Verse {
  number: number;
  text: string;
}

export default function ChaptersScreen() {
  const router = useRouter();
  const db = useSQLiteContext();
  
  // 1. Retrieve the metadata forwarded from the books index page
  const { bookId, bookName, chapterCount } = useLocalSearchParams<{
    bookId: string;
    bookName: string;
    chapterCount: string;
  }>();

  // 2. Local State Management
  const [activeChapter, setActiveChapter] = useState<number>(1);
  const [loadingVerses, setLoadingVerses] = useState<boolean>(true);
  const [verses, setVerses] = useState<Verse[]>([]);
  const [drawerVisible, setDrawerVisible] = useState(false);

  // Generate an array containing indices from 1 up to total chapters count
  const totalChapters = chapterCount ? parseInt(chapterCount, 10) : 0;
  const chaptersArray = Array.from({ length: totalChapters }, (_, i) => i + 1);

  useEffect(() => {
    let isActive = true;

    const loadVerses = async () => {
      const numericBookId = Number(bookId);
      if (!Number.isInteger(numericBookId) || numericBookId < 1) {
        if (isActive) {
          setVerses([]);
          setLoadingVerses(false);
        }
        return;
      }

      try {
        setLoadingVerses(true);
        const rows = await db.getAllAsync<Verse>(
          `SELECT verse_num AS number, verse_text AS text
           FROM verses
           WHERE version_id = ? AND book_id = ? AND chapter = ?
           ORDER BY verse_num ASC`,
          [1, numericBookId, activeChapter]
        );

        if (isActive) {
          setVerses(rows);
        }
      } catch (error) {
        console.error('Error loading verses from SQLite:', error);
        if (isActive) {
          setVerses([]);
        }
      } finally {
        if (isActive) {
          setLoadingVerses(false);
        }
      }
    };

    loadVerses();
    return () => {
      isActive = false;
    };
  }, [activeChapter, bookId, db]);

  const handleChapterChange = (chapterNumber: number) => {
    setActiveChapter(chapterNumber);
  };

  return (
    <View style={styles.container}>
      <View style={styles.topHeader}>
        <TouchableOpacity style={styles.headerAction} onPress={() => setDrawerVisible(true)}><Ionicons name="menu" size={20} color="#0a2d55" /></TouchableOpacity>
        <Text style={styles.bookTitle}>{bookName || 'Livre'}</Text>
        <TouchableOpacity style={styles.headerAction} onPress={() => router.push('/screens/ShareVerse')}><Text style={styles.chapterHeader}>Ch. {activeChapter}</Text></TouchableOpacity>
      </View>

      {/* HORIZONTAL SCROLLING CHAPTER SELECTOR TABS */}
      <View style={styles.chapterTrackContainer}>
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.horizontalScrollPadding}
        >
          <Text style={styles.introTab}>Intro</Text>
          {chaptersArray.map((chap) => {
            const isSelected = chap === activeChapter;
            return (
              <TouchableOpacity
                key={chap}
                style={[styles.chapterPill, isSelected && styles.activeChapterPill]}
                onPress={() => handleChapterChange(chap)}
                activeOpacity={0.8}
              >
                <Text style={[styles.chapterPillText, isSelected && styles.activeChapterPillText]}>
                  {chap.toString().padStart(2, '0')}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      {/* VERTICAL SCROLLING VERSES CONTENT STREAM */}
      {loadingVerses ? (
        <View style={styles.centeredState}>
          <ActivityIndicator size="small" color="#0a2d55" />
        </View>
      ) : verses.length > 0 ? (
        <ScrollView 
          contentContainerStyle={styles.verseScrollContent}
          showsVerticalScrollIndicator={false}
        >
          {verses.map((verse) => (
            <View key={verse.number} style={styles.verseRow}>
              <Text style={styles.verseNumber}>{verse.number}</Text>
              <View style={[styles.verseCard, verse.number === 3 && styles.activeVerseCard]}><Text style={styles.verseText}>{verse.text}</Text></View>
            </View>
          ))}
          <View style={styles.bottomSpacer} />
        </ScrollView>
      ) : (
        // Blank fallback display space shown for alternate chapters
        <View style={styles.centeredState}>
          <Ionicons name="book-outline" size={32} color="#cbd5e1" />
          <Text style={styles.emptyText}>Contenu vide</Text>
        </View>
      )}
      <AppDrawer visible={drawerVisible} onClose={() => setDrawerVisible(false)} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: '#fff'
  },
  topHeader: { height: 54, paddingHorizontal: 16, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  headerAction: { width: 42, alignItems: 'center' },
  bookTitle: { 
    fontFamily: 'serif', fontStyle: 'italic', fontSize: 15, fontWeight: '700', color: '#0a2d55'
  },
  chapterHeader: { fontFamily: 'serif', fontStyle: 'italic', color: '#0a2d55', fontSize: 15 },

  // Horizontal Scrolling Chapter Track
  chapterTrackContainer: {
    borderBottomWidth: 0,
    paddingVertical: 4,
  },
  horizontalScrollPadding: {
    paddingHorizontal: 22,
    gap: 16,
    alignItems: 'center',
  },
  chapterPill: {
    width: 28,
    height: 24,
    borderRadius: 12,
    backgroundColor: 'transparent',
    justifyContent: 'center',
    alignItems: 'center',
  },
  activeChapterPill: {
    backgroundColor: '#0a2d55',
    borderColor: '#0a2d55',
  },
  chapterPillText: {
    fontSize: 10,
    fontWeight: '500',
    color: '#64748b',
  },
  activeChapterPillText: {
    color: '#fff',
  },

  // Vertical Verses Stream Layout
  verseScrollContent: {
    paddingTop: 14,
    paddingBottom: 104,
    paddingLeft: 4,
    paddingRight: 20,
    gap: 10,
  },
  verseRow: {
    flexDirection: 'row', alignItems: 'stretch',
  },
  verseNumber: {
    fontSize: 9, fontWeight: '700', color: '#746422', width: 37, textAlign: 'center', paddingTop: 14,
  },
  verseText: {
    fontFamily: 'serif', flex: 1, fontSize: 14, color: '#202020', lineHeight: 22, fontWeight: '400',
  },
  verseCard: { flex: 1, paddingHorizontal: 16, paddingVertical: 12, borderRadius: 9, backgroundColor: '#f1f1f1', minHeight: 72 },
  activeVerseCard: { backgroundColor: '#bbb38d' },
  introTab: { color: '#777e8b', fontSize: 10, marginRight: 2 },

  // Fallback / Loading structural frameworks
  centeredState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    marginTop: 8,
    fontSize: 14,
    color: '#94a3b8',
    fontWeight: '500',
  },
  bottomSpacer: {
    height: 40,
  },
});
