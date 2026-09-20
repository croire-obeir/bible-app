import React, { useEffect, useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity, 
  ActivityIndicator,
  Platform,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useSQLiteContext } from 'expo-sqlite';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import AppDrawer from '../../../../components/AppDrawer';
import { useTabBarScroll, useTabBarVisibilityContext } from '../../../../components/tab-bar-visibility';

// Structure for our verse elements
interface Verse {
  number: number;
  text: string;
}

export default function ChaptersScreen() {
  const router = useRouter();
  const db = useSQLiteContext();
  const insets = useSafeAreaInsets();
  
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
  const [selectedVerseNumbers, setSelectedVerseNumbers] = useState<number[]>([]);
  const [sharePanelVisible, setSharePanelVisible] = useState(false);
  const handleTabBarScroll = useTabBarScroll();
  const { setTabBarHidden } = useTabBarVisibilityContext();

  // Restore the navigation when this page is left, including if the share
  // panel was open at that moment.
  useEffect(() => () => setTabBarHidden(false), [setTabBarHidden]);

  const openSharePanel = () => {
    setSharePanelVisible(true);
    setTabBarHidden(true);
  };

  const closeSharePanel = () => {
    setSharePanelVisible(false);
    setTabBarHidden(false);
  };

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
          setVerses(rows.map((verse) => ({
            ...verse,
            text: verse.text.replace(/¶/g, ''),
          })));
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
    setSelectedVerseNumbers([]);
  };

  const toggleVerseSelection = (verseNumber: number) => {
    setSelectedVerseNumbers((currentSelection) => currentSelection.includes(verseNumber)
      ? currentSelection.filter((number) => number !== verseNumber)
      : [...currentSelection, verseNumber].sort((first, second) => first - second));
  };

  const openShareScreen = () => {
    const selectedVerses = verses.filter((verse) => selectedVerseNumbers.includes(verse.number));
    if (selectedVerses.length === 0) {
      return;
    }

    router.push({
      pathname: '/screens/ShareVerse',
      params: {
        selectedVerses: JSON.stringify(selectedVerses.map((verse) => ({
          text: verse.text,
          reference: `${bookName || 'Livre'} ${activeChapter}:${verse.number}`,
        }))),
      },
    });
  };

  return (
    <View style={styles.container}>
      <View style={styles.topHeader}>
        <TouchableOpacity style={styles.headerAction} onPress={() => setDrawerVisible(true)}><Ionicons name="menu" size={21} color="#0a2d55" /></TouchableOpacity>
        <Text style={styles.bookTitle}>{bookName || 'Livre'}</Text>
        <TouchableOpacity style={styles.shareHeaderButton} onPress={openSharePanel} disabled={selectedVerseNumbers.length === 0}>
          <Ionicons name="share-social-outline" size={15} color="#fff" />
          <Text style={styles.shareHeaderText}>Partager ({selectedVerseNumbers.length})</Text>
        </TouchableOpacity>
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
          // The underlying ScrollView can finish a momentum scroll after the
          // panel opens. Do not let that event make the navigation visible.
          onScroll={sharePanelVisible ? undefined : handleTabBarScroll}
          scrollEventThrottle={16}
        >
          <View style={styles.verseGuide}>
            {verses.map((verse) => (
            <View key={verse.number} style={styles.verseRow}>
              <TouchableOpacity
                style={[styles.verseNumber, selectedVerseNumbers.includes(verse.number) && styles.selectedVerseNumber]}
                onPress={() => toggleVerseSelection(verse.number)}
                accessibilityRole="checkbox"
                accessibilityState={{ checked: selectedVerseNumbers.includes(verse.number) }}
              >
                {selectedVerseNumbers.includes(verse.number) && <Ionicons name="checkmark" size={13} color="#fff" />}
                <Text style={styles.verseNumberText}>{verse.number}</Text>
              </TouchableOpacity>
              <TouchableOpacity
                activeOpacity={0.8}
                style={[styles.verseCard, selectedVerseNumbers.includes(verse.number) && styles.selectedVerseCard]}
                onPress={() => toggleVerseSelection(verse.number)}
              >
                <Text style={styles.verseText}>{verse.text}</Text>
              </TouchableOpacity>
            </View>
            ))}
          </View>
          <View style={styles.bottomSpacer} />
        </ScrollView>
      ) : (
        // Blank fallback display space shown for alternate chapters
        <View style={styles.centeredState}>
          <Ionicons name="book-outline" size={32} color="#cbd5e1" />
          <Text style={styles.emptyText}>Contenu vide</Text>
        </View>
      )}
      {sharePanelVisible && (
        <View style={[styles.sharePanelBackdrop, { paddingBottom: Math.max(insets.bottom, 16) }]}>
          <View style={styles.sharePanel}>
            <View style={styles.sharePanelHandle} />
            <View style={styles.sharePanelHeader}>
              <View>
                <Text style={styles.sharePanelEyebrow}>SÉLECTION</Text>
                <Text style={styles.sharePanelTitle}>Options de partage des versets</Text>
              </View>
              <TouchableOpacity onPress={closeSharePanel} style={styles.closePanelButton}>
                <Ionicons name="close" size={20} color="#0a2d55" />
              </TouchableOpacity>
            </View>
            <View style={styles.selectedReferences}>
              {verses.filter((verse) => selectedVerseNumbers.includes(verse.number)).map((verse) => (
                <View key={verse.number} style={styles.selectedReferenceRow}>
                  <Ionicons name="checkmark-circle" size={17} color="#b18a32" />
                  <Text style={styles.selectedReferenceText}>{bookName || 'Livre'} {activeChapter}:{verse.number}</Text>
                </View>
              ))}
            </View>
            <TouchableOpacity style={styles.panelPrimaryButton} onPress={openShareScreen}>
              <Ionicons name="create-outline" size={18} color="#fff" />
              <Text style={styles.panelPrimaryText}>Créer une image personnalisée</Text>
            </TouchableOpacity>
            <View style={styles.panelButtonRow}>
              <TouchableOpacity style={styles.panelSecondaryButton} onPress={openShareScreen}>
                <Ionicons name="copy-outline" size={17} color="#0a2d55" />
                <Text style={styles.panelSecondaryText}>Copier le texte</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.panelSecondaryButton} onPress={openShareScreen}>
                <Ionicons name="share-outline" size={17} color="#0a2d55" />
                <Text style={styles.panelSecondaryText}>Partager le texte</Text>
              </TouchableOpacity>
            </View>
            <TouchableOpacity style={styles.imageShareButton} onPress={openShareScreen}>
              <Ionicons name="image-outline" size={17} color="#7b6325" />
              <Text style={styles.imageShareText}>Partager sous forme d&apos;image</Text>
            </TouchableOpacity>
          </View>
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
  topHeader: {
    height: 58 + (Platform.OS === 'android' ? 24 : 0),
    paddingTop: Platform.OS === 'android' ? 24 : 0,
    paddingHorizontal: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerAction: { width: 42, alignItems: 'center' },
  shareHeaderButton: { minWidth: 112, height: 34, paddingHorizontal: 10, borderRadius: 17, backgroundColor: '#0a2d55', flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 5 },
  shareHeaderText: { color: '#fff', fontSize: 11, fontWeight: '700' },
  bookTitle: { 
    fontFamily: 'serif', fontStyle: 'normal', fontSize: 15, fontWeight: '700', color: '#0a2d55'
  },
  chapterHeader: { fontFamily: 'serif', fontStyle: 'normal', color: '#0a2d55', fontSize: 15, fontWeight: '700' },

  // Horizontal Scrolling Chapter Track
  chapterTrackContainer: {
    height: 48,
    paddingVertical: 0,
    justifyContent: 'center',
  },
  horizontalScrollPadding: {
    paddingHorizontal: 22,
    gap: 14,
    alignItems: 'center',
  },
  chapterPill: {
    width: 36,
    height: 30,
    borderRadius: 15,
    backgroundColor: 'transparent',
    justifyContent: 'center',
    alignItems: 'center',
  },
  activeChapterPill: {
    backgroundColor: '#092d6b',
    shadowColor: '#092d6b',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 3,
  },
  chapterPillText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#64748b',
  },
  activeChapterPillText: {
    color: '#fff',
  },

  // Vertical Verses Stream Layout
  verseScrollContent: {
    paddingTop: 12,
    paddingBottom: 104,
    paddingLeft: 0,
    paddingRight: 16,
    gap: 10,
  },
  verseGuide: {
    marginLeft: 35,
    borderLeftWidth: 2,
    borderLeftColor: '#e5e5e5',
    gap: 10,
  },
  verseRow: {
    flexDirection: 'row', alignItems: 'stretch', marginLeft: -30,
  },
  verseNumber: {
    width: 40, height: 23, marginTop: 14, marginRight: 10,
    borderRadius: 12, borderWidth: 2, borderColor: '#e7e7e7',
    backgroundColor: '#fff', alignItems: 'center', justifyContent: 'center',
  },
  selectedVerseNumber: { backgroundColor: '#b18a32', borderColor: '#b18a32', flexDirection: 'row', gap: 1 },
  verseNumberText: {
    fontSize: 10, fontWeight: '700', color: '#746422',
  },
  verseText: {
    fontFamily: 'serif', flex: 1, fontSize: 18, color: '#202020', lineHeight: 30, fontWeight: '400',
  },
  verseCard: { flex: 1, paddingHorizontal: 22, paddingVertical: 12, borderRadius: 12, backgroundColor: '#f1f1f1', minHeight: 72 },
  selectedVerseCard: { backgroundColor: '#f8f2df', borderWidth: 1, borderColor: '#d7bd78' },
  introTab: { color: '#777e8b', fontSize: 13, marginRight: 2 },

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
  sharePanelBackdrop: { position: 'absolute', left: 0, right: 0, top: 0, bottom: 0, backgroundColor: 'rgba(10, 45, 85, 0.28)', justifyContent: 'flex-end' },
  sharePanel: { backgroundColor: '#fff', borderTopLeftRadius: 26, borderTopRightRadius: 26, paddingHorizontal: 20, paddingTop: 10, paddingBottom: 20, shadowColor: '#0a2d55', shadowOpacity: 0.18, shadowRadius: 18, shadowOffset: { width: 0, height: -5 }, elevation: 12 },
  sharePanelHandle: { width: 42, height: 4, borderRadius: 2, backgroundColor: '#d9dce1', alignSelf: 'center', marginBottom: 16 },
  sharePanelHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  sharePanelEyebrow: { color: '#b18a32', fontSize: 10, fontWeight: '800', letterSpacing: 1.2, marginBottom: 5 },
  sharePanelTitle: { color: '#0a2d55', fontFamily: 'serif', fontSize: 21, fontWeight: '700', maxWidth: 280 },
  closePanelButton: { width: 34, height: 34, borderRadius: 17, backgroundColor: '#f3f5f7', alignItems: 'center', justifyContent: 'center' },
  selectedReferences: { marginTop: 16, padding: 12, borderRadius: 12, backgroundColor: '#f8f7f3', gap: 8 },
  selectedReferenceRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  selectedReferenceText: { color: '#35445a', fontSize: 14, fontWeight: '600' },
  panelPrimaryButton: { height: 48, borderRadius: 12, backgroundColor: '#0a2d55', marginTop: 14, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8 },
  panelPrimaryText: { color: '#fff', fontSize: 13, fontWeight: '700' },
  panelButtonRow: { flexDirection: 'row', gap: 10, marginTop: 10 },
  panelSecondaryButton: { flex: 1, minHeight: 45, borderRadius: 11, backgroundColor: '#eef2f5', alignItems: 'center', justifyContent: 'center', gap: 4 },
  panelSecondaryText: { color: '#0a2d55', fontSize: 11, fontWeight: '700' },
  imageShareButton: { minHeight: 44, borderRadius: 11, borderWidth: 1, borderColor: '#e1d4ad', marginTop: 10, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 7 },
  imageShareText: { color: '#7b6325', fontSize: 12, fontWeight: '700' },
});
