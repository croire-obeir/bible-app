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
import CustomHeader from '../../../../components/CustomHeader';
import { useSQLiteContext } from 'expo-sqlite';

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
      {/* Universal Shared Layout Header navigation bar */}
      <CustomHeader>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={22} color="#0a2d55" />
          <Text style={styles.backText}>Livres</Text>
        </TouchableOpacity>
      </CustomHeader>

      {/* Book Metadata Display Banner */}
      <View style={styles.titleBanner}>
        <Text style={styles.bookTitle}>{bookName || 'Livre'}</Text>
        <Text style={styles.subTitle}>Chapitre {activeChapter}</Text>
      </View>

      {/* HORIZONTAL SCROLLING CHAPTER SELECTOR TABS */}
      <View style={styles.chapterTrackContainer}>
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.horizontalScrollPadding}
        >
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
                  {chap}
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
              {/* Verse Numeric Identifier Marker */}
              <Text style={styles.verseNumber}>{verse.number}</Text>
              {/* Verse Text Payload Block */}
              <Text style={styles.verseText}>{verse.text}</Text>
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
    </View>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: '#f8fafc' 
  },
  backButton: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    marginRight: 'auto' 
  },
  backText: { 
    fontSize: 16, 
    fontWeight: '600', 
    color: '#0a2d55', 
    marginLeft: 5 
  },
  titleBanner: {
    paddingHorizontal: 20,
    paddingTop: 15,
    paddingBottom: 5,
  },
  bookTitle: { 
    fontSize: 24, 
    fontWeight: '800', 
    color: '#0a2d55' 
  },
  subTitle: { 
    fontSize: 14, 
    color: '#64748b', 
    fontWeight: '600',
    marginTop: 2 
  },

  // Horizontal Scrolling Chapter Track
  chapterTrackContainer: {
    borderBottomWidth: 1,
    borderBottomColor: '#edf2f7',
    paddingVertical: 12,
  },
  horizontalScrollPadding: {
    paddingHorizontal: 16,
    gap: 8,
  },
  chapterPill: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    // Material Shadow definitions
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 1,
  },
  activeChapterPill: {
    backgroundColor: '#0a2d55',
    borderColor: '#0a2d55',
  },
  chapterPillText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#64748b',
  },
  activeChapterPillText: {
    color: '#fff',
  },

  // Vertical Verses Stream Layout
  verseScrollContent: {
    padding: 20,
    gap: 16,
  },
  verseRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  verseNumber: {
    fontSize: 13,
    fontWeight: '800',
    color: '#D4AF37', // Gold standard script detailing accent
    width: 28,
    paddingTop: 2,
    textAlign: 'left',
  },
  verseText: {
    flex: 1,
    fontSize: 15,
    color: '#334155',
    lineHeight: 24,
    fontWeight: '500',
  },

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
