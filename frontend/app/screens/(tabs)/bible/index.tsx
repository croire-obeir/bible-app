import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ImageBackground, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, useLocalSearchParams } from 'expo-router';
import CustomHeader from '../../../../components/CustomHeader';
import { useSQLiteContext } from 'expo-sqlite';
import AppDrawer from '../../../../components/AppDrawer';

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
  const [drawerVisible, setDrawerVisible] = useState(false);
  
  useEffect(() => {
    if (params.selectedVersion) {
      setCurrentVersion(params.selectedVersion as string);
    }
  }, [params.selectedVersion]);

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
  }, [db]);

  const filteredBooks = books.filter((book) => {
    if (activeTestament === 'OT') {
      return book.id <= 39;
    } else {
      return book.id > 39;
    }
  });

  const handleBookPress = (bookId: number, bookName: string, chapterCount: number) => {
    console.log(`Navigating to book: ${bookName} (ID: ${bookId})`);
    router.push({
      pathname: '/screens/(tabs)/bible/chapters',
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
      
        <CustomHeader
          leftSlot={<TouchableOpacity onPress={() => setDrawerVisible(true)}><Ionicons name="menu" size={24} color="#0a2d55" /></TouchableOpacity>}
          centerSlot="Croire & Obéir"
          rightSlot={<TouchableOpacity onPress={() => router.push('/screens/SearchByTopic')}><Ionicons name="search" size={24} color="#0a2d55" /></TouchableOpacity>}
        />

        {loading ? (
          <View style={styles.centeredState}>
            <ActivityIndicator size="large" color="#0a2d55" />
            <Text style={styles.loadingText}>Chargement des livres...</Text>
          </View>
        ) : currentVersion !== 'LSG 1910' ? (
          <View style={styles.centeredState}>
            <Ionicons name="cloud-download-outline" size={48} color="#8a99ad" style={{ marginBottom: 12 }} />
            <Text style={styles.comingSoonTitle}>Bientôt disponible</Text>
            <Text style={styles.comingSoonText}>
              La version « {currentVersion} » sera ajoutée dans une prochaine mise à jour.
            </Text>
          </View>
        ) : (
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
                {activeTestament === 'OT' && <View style={styles.activeDot} />}
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.toggleTab, activeTestament === 'NT' && styles.activeToggleTab]}
                onPress={() => setActiveTestament('NT')}
                activeOpacity={0.9}
              >
                <Text style={[styles.toggleText, activeTestament === 'NT' && styles.activeToggleText]}>
                  Nouveau{'\n'}Testament
                </Text>
                {activeTestament === 'NT' && <View style={styles.activeDot} />}
              </TouchableOpacity>
            </View>

            <Text style={styles.collectionTitle}>
              {activeTestament === 'OT' ? 'Le Pentateuque' : 'Le Nouveau Testament'}
            </Text>
            <Text style={styles.collectionDescription}>
              {activeTestament === 'OT' 
                ? 'Les cinq livres de Moïse, fondant la loi et l’histoire des origines du peuple de l’alliance.' 
                : 'Les livres qui racontent la vie de Jésus et l’histoire de l’Église.'}
            </Text>

            {/* Books List */}
            <View style={styles.booksContainer}>
              {filteredBooks.map((book) => (
                <TouchableOpacity
                  key={book.id}
                  style={styles.bookCard}
                  onPress={() => handleBookPress(book.id, book.name, book.chapter_count)}
                  activeOpacity={0.7}
                >
                  <View style={styles.bookHeaderRow}>
                    <Ionicons name="book-outline" size={22} color="#b3aa99" />
                    <Text style={styles.bookIndex}>LIVRE {book.id}</Text>
                  </View>

                  <Text style={styles.bookName}>{book.name}</Text>

                  <View style={styles.bookFooterRow}>
                    <Text style={styles.bookChapters}>
                      {book.chapter_count} {book.chapter_count > 1 ? 'Chapitres' : 'Chapitre'}
                    </Text>
                    {book.id === 1 && (
                      <View style={styles.bookArrow}>
                        <Ionicons name="arrow-forward" size={18} color="#000" />
                      </View>
                    )}
                  </View>
                </TouchableOpacity>
              ))}
            </View>

            <View style={styles.bottomPadding} />
          </ScrollView>
        )}
      
      </ImageBackground>
      <AppDrawer visible={drawerVisible} onClose={() => setDrawerVisible(false)} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: '#fff'
  },
  bg: { 
    flex: 1 
  },
  scrollContent: { 
    paddingHorizontal: 18,
    paddingTop: 16,
    paddingBottom: 100,
  },
  bottomPadding: { 
    height: 30 
  },

  centeredState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#64748b',
    fontWeight: '500',
  },

  // Segmented Toggle Switch
  toggleContainer: {
    flexDirection: 'row',
    backgroundColor: '#ebebeb',
    borderRadius: 30,
    padding: 5,
    marginBottom: 24,
  },
  toggleTab: {
    flex: 1,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 25,
  },
  activeToggleTab: {
    backgroundColor: '#fff',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
  },
  toggleText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#5c6470',
    textAlign: 'center',
  },
  activeToggleText: {
    color: '#0d254c',
    fontWeight: '700',
  },
  activeDot: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
    backgroundColor: '#a37e2c',
    marginTop: 4,
  },

  // Titles
  collectionTitle: { 
    color: '#28467b', 
    fontFamily: 'serif', 
    fontStyle: 'italic', 
    fontSize: 30, 
    marginBottom: 8,
  },
  collectionDescription: { 
    color: '#596170', 
    fontSize: 15, 
    lineHeight: 22, 
    marginBottom: 20,
  },

  // Book Cards
  booksContainer: {
    gap: 16, 
  },
  bookCard: {
    backgroundColor: '#f8f4e9',
    borderRadius: 16,
    padding: 20,
    justifyContent: 'space-between',
  },
  bookHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 6,
  },
  bookIndex: { 
    color: '#8c6d23', 
    fontSize: 13, 
    fontWeight: '800', 
    letterSpacing: 0.8,
  },
  
  
  
  bookName: {
    fontFamily: 'serif',
    fontSize: 32,
    fontWeight: '500',
    color: '#0a2d55',
    marginBottom: 10,
  },
  bookFooterRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  bookChapters: {
    fontSize: 15,
    color: '#556070',
    fontWeight: '500',
  },
  bookArrow: { 
    width: 36, 
    height: 36, 
    borderRadius: 18, 
    backgroundColor: '#f0ede6', 
    alignItems: 'center', 
    justifyContent: 'center',
  },

  comingSoonTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#0a2d55',
    marginBottom: 6,
    textAlign: 'center',
  },
  comingSoonText: {
    fontSize: 15,
    color: '#64748b',
    textAlign: 'center',
    paddingHorizontal: 40,
    lineHeight: 22,
  },
});