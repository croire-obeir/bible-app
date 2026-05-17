import React, { useMemo, useState , useEffect} from 'react';
import { View, Text, StyleSheet, ImageBackground, SafeAreaView, ScrollView, TouchableOpacity,ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, useLocalSearchParams } from 'expo-router';
import CustomHeader from '../../../../components/CustomHeader';
import { useSQLiteContext } from 'expo-sqlite';


interface BibleBook {
  id: number;
  testament: string;
  name: string;
  short_name: string;
  chapter_count: number;
}

export default function BibleScreen() {

  const router = useRouter();
  const params = useLocalSearchParams(); 
  const db = useSQLiteContext();

  const [currentVersion, setCurrentVersion] = useState('LSG 1910');
  const [books, setBooks] = useState<BibleBook[]>([]);
  const [activeTestament, setActiveTestament] = useState<'OT' | 'NT'>('OT');
  const [loading, setLoading] = useState<boolean>(true);
  
  // 2. Watch for param changes coming from the Select Screen
  useEffect(() => {
    if (params.selectedVersion) {
      setCurrentVersion(params.selectedVersion as string);
    }
  }, [params.selectedVersion]);

  
   // Initial fetch with empty string to show all books or no books based on your preference
  useEffect(() => {
   const fetchAllBooks = async () => {
      try {
        setLoading(true);
        const sqlQuery = `
          SELECT id, testament, name, short_name, chapter_count 
          FROM books 
          ORDER BY id ASC;
        `;
        const allRows = await db.getAllAsync<BibleBook>(sqlQuery, []);
        setBooks(allRows);
      } catch (error) {
        console.error("Error query execution on books table:", error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchAllBooks();
  }, []);

  // 4. Optimized Numeric Filtering Logic (1-39 is OT, 40-66 is NT)
  const filteredBooks = books.filter((book) => {
    if (activeTestament === 'OT') {
      return book.id <= 39;
    } else {
      return book.id > 39;
    }
  });

  const handleBookPress = (bookId: number, bookName: string, chapterCount: number) => {
    // Navigate deep into chapters view
    console.log(`Navigating to book: ${bookName} (ID: ${bookId})`);
    router.push({
      pathname: '/screens/(tabs)/bible/chapters', // Updated clean nested route path
      params: { 
        bookId: bookId.toString(), 
        bookName: bookName,
        chapterCount: chapterCount
      }
    });
  };

  



  return (
    <View style={styles.container}>
      <ImageBackground source={require('../../../../assets/enregistrement.png')} style={styles.bg} imageStyle={{ opacity: 0.05 }}>
      
        <CustomHeader>
          <TouchableOpacity
            style={styles.bibleVersionButton}
            onPress={() => router.push('/screens/VersionSelect')}
            activeOpacity={0.7}
          >
            <Ionicons name="globe-outline" size={18} color="#0a2d55" style={styles.iconSpacing} />
            <Text style={styles.versionText}>{currentVersion}</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => router.push('/screens/SearchByTopic') }>
            <Ionicons name="search" size={24} color="#0a2d55" />
          </TouchableOpacity>
        </CustomHeader>

       {/* Main Body Content layout */}
        {loading ? (
          <View style={styles.centeredState}>
            <ActivityIndicator size="large" color="#0a2d55" />
            <Text style={styles.loadingText}>Chargement des livres...</Text>
          </View>
        ) : currentVersion !== 'LSG 1910' ? (
          // Display this fallback message if any version other than LSG 1910 is chosen
          <View style={styles.centeredState}>
            <Ionicons name="cloud-download-outline" size={48} color="#8a99ad" style={{ marginBottom: 12 }} />
            <Text style={styles.comingSoonTitle}>Bientôt disponible</Text>
            <Text style={styles.comingSoonText}>
              La version "{currentVersion}" sera ajoutée dans une prochaine mise à jour.
            </Text>
          </View>
        ) : (
          // Standard list display when LSG 1910 is active
          <ScrollView
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
          >
            {/* Segmented Control Switch */}
            <View style={styles.toggleContainer}>
              <TouchableOpacity
                style={[styles.toggleTab, activeTestament === 'OT' && styles.activeToggleTab]}
                onPress={() => setActiveTestament('OT')}
                activeOpacity={0.9}
              >
                <Text style={[styles.toggleText, activeTestament === 'OT' && styles.activeToggleText]}>
                  Ancien Testament
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.toggleTab, activeTestament === 'NT' && styles.activeToggleTab]}
                onPress={() => setActiveTestament('NT')}
                activeOpacity={0.9}
              >
                <Text style={[styles.toggleText, activeTestament === 'NT' && styles.activeToggleText]}>
                  Nouveau Testament
                </Text>
              </TouchableOpacity>
            </View>

            {/* Modern Dynamic Grid Content List */}
            <View style={styles.booksContainer}>
              {filteredBooks.map((book) => (
                <TouchableOpacity
                  key={book.id}
                  style={styles.bookCard}
                  onPress={() => handleBookPress(book.id, book.name, book.chapter_count)}
                  activeOpacity={0.7}
                >
                  <View style={styles.bookInfo}>
                    <Text style={styles.bookName}>{book.name}</Text>
                    <Text style={styles.bookChapters}>
                      {book.chapter_count} {book.chapter_count > 1 ? 'chapitres' : 'chapitre'}
                    </Text>
                  </View>

                  <Ionicons name="chevron-forward" size={20} color="#8a99ad" />
                </TouchableOpacity>
              ))}
            </View>

            {/* Safety clearance padding space */}
            <View style={styles.bottomPadding} />
          </ScrollView>
        )}
      
      </ImageBackground>
    </View>
  );
}

const styles = StyleSheet.create({
  // Layout Base
  container: { 
    flex: 1, 
    backgroundColor: '#f5f5f5' 
  },
  bg: { 
    flex: 1 
  },
  scrollContent: { 
    padding: 20 
  },
  bottomPadding: { 
    height: 20 
  },

  // Custom Header Actions
  bibleVersionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f0f4f8',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,           
    borderWidth: 1,
    borderColor: '#d0daf0',
    marginRight: 15
  },
  iconSpacing: {
    marginRight: 6,             
  },
  versionText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#0a2d55',
  },

  // Loading States
  centeredState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 14,
    color: '#64748b',
    fontWeight: '500',
  },

  // Segmented Toggle Switch
  toggleContainer: {
    flexDirection: 'row',
    backgroundColor: '#e2e8f0', 
    borderRadius: 12,
    padding: 4,
    marginBottom: 20,
  },
  toggleTab: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 8,
  },
  activeToggleTab: {
    backgroundColor: '#0a2d55', 
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.15,
    shadowRadius: 2,
  },
  toggleText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#64748b',
  },
  activeToggleText: {
    color: '#fff',
  },

  // Books List Cards
  booksContainer: {
    gap: 10, 
  },
  bookCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#edf2f7',
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
  },
  bookInfo: {
    flex: 1,
  },
  bookName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0a2d55',
    marginBottom: 4,
  },
  bookChapters: {
    fontSize: 13,
    color: '#8a99ad',
    fontWeight: '500',
  },
  badgeContainer: {
    backgroundColor: '#f0f4f8',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
  },
  badgeText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#0a2d55',
  },
  comingSoonTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#0a2d55',
    marginBottom: 6,
    textAlign: 'center',
  },
  comingSoonText: {
    fontSize: 14,
    color: '#64748b',
    textAlign: 'center',
    paddingHorizontal: 40,
    lineHeight: 20,
  },
});
