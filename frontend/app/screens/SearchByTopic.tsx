import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TextInput, 
  TouchableOpacity, 
  ScrollView, 
  ActivityIndicator,
  ImageBackground
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSQLiteContext } from 'expo-sqlite';
import { useRouter } from 'expo-router';
import AppDrawer from '../../components/AppDrawer';

interface SuggestionResult {
  word: string;
}

interface VerseResult {
  canonical_id: number;
  book_name: string;
  chapter: number;
  verse_num: number;
  verse_text: string;
}

export default function SearchByTopicScreen() {
  const router = useRouter();
  const db = useSQLiteContext();

  const [searchQuery, setSearchQuery] = useState('');
  const [suggestions, setSuggestions] = useState<SuggestionResult[]>([]);
  const [verses, setVerses] = useState<VerseResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [drawerVisible, setDrawerVisible] = useState(false);
  
  const [searchPhase, setSearchPhase] = useState<'suggestions' | 'results'>('suggestions');

  const handleTextChange = async (text: string) => {
    setSearchQuery(text);
    
    if (text.trim().length === 0) {
      setSuggestions([]);
      setSearchPhase('suggestions');
      return;
    }

    try {
      setSearchPhase('suggestions');
      
      const sqlQuery = `SELECT word FROM search_suggestions WHERE word MATCH ? LIMIT 8;`;
      const searchParam = `${text}*`; 
      
      const rows = await db.getAllAsync<SuggestionResult>(sqlQuery, [searchParam]);
      setSuggestions(rows);
    } catch (error) {
      console.error("Suggestion parsing failure:", error);
    }
  };

  const handleSelectSuggestion = async (selectedWord: string) => {
    if (!selectedWord.trim()) return;

    setSearchQuery(selectedWord);
    setSuggestions([]);
    setLoading(true);
    setSearchPhase('results');

    try {
      const sql = `
        SELECT 
          b.name AS book_name, 
          v.chapter, 
          v.verse_num, 
          v.verse_text,
          v.canonical_id
        FROM verses v
        JOIN verses_fts fts ON v.canonical_id = fts.rowid
        JOIN books b ON v.book_id = b.id
        WHERE verses_fts MATCH ?
        ORDER BY v.canonical_id ASC;
      `;

      const verseRows = await db.getAllAsync<VerseResult>(sql, [selectedWord]);
      setVerses(verseRows);
    } catch (error) {
      console.error("Verse search execution failure:", error);
      setVerses([]);
    } finally {
      setLoading(false);
    }
  };

  const handleClearInput = () => {
    setSearchQuery('');
    setSuggestions([]);
    setVerses([]);
    setSearchPhase('suggestions');
  };

  return (
    <View style={styles.container}>
      {/* En-tête principal */}
      <View style={styles.appHeader}>
        <TouchableOpacity onPress={() => setDrawerVisible(true)}>
          <Ionicons name="menu" size={24} color="#0a2d55" />
        </TouchableOpacity>
        <Text style={styles.appTitle}>Croire & Obéir</Text>
        <TouchableOpacity onPress={() => {}}>
          <Ionicons name="search" size={22} color="#0a2d55" />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
        {/* En-tête de la page */}
        <View style={styles.heroContent}>
          <Text style={styles.pageTitle}>Explorer</Text>
          <Text style={styles.intro}>Que cherchez-vous dans Sa Parole{`\n`}aujourd'hui?</Text>
        </View>

        {/* Barre de recherche */}
        <View style={styles.searchHeader}>
          <View style={styles.inputWrapper}>
            <Ionicons name="search" size={20} color="#7c8ba1" style={styles.searchIcon} />
            <TextInput
              placeholder="Rechercher par thème, verset, ou mot-clé..."
              placeholderTextColor="#8a99ad"
              value={searchQuery}
              onChangeText={handleTextChange}
              style={styles.textInput}
              returnKeyType="search"
              onSubmitEditing={() => handleSelectSuggestion(searchQuery)}
            />
            {searchQuery.length > 0 ? (
              <TouchableOpacity onPress={handleClearInput} style={styles.clearButton}>
                <Ionicons name="close-circle" size={20} color="#94a3b8" />
              </TouchableOpacity>
            ) : (
              <TouchableOpacity style={styles.clearButton}>
                <Ionicons name="options-outline" size={20} color="#35629b" />
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* CONTENU DYNAMIQUE */}
        {loading ? (
          <View style={styles.centeredState}>
            <ActivityIndicator size="large" color="#0a2d55" />
          </View>
        ) : searchPhase === 'suggestions' ? (
          /* PHASES 1 : SUGGESTIONS ET THÈMES SACRÉS */
          <View>
            {searchQuery.length === 0 && (
              <>
                <Text style={styles.themeTitle}>Thèmes Sacrés</Text>
                
                {/* Carte Amour */}
                <TouchableOpacity style={styles.themeCard} activeOpacity={0.9} onPress={() => handleSelectSuggestion('amour')}>
                  <ImageBackground source={require('../../assets/Timage.jpg')} style={styles.themeImage} imageStyle={styles.themeImageRadius}>
                    <View style={styles.themeOverlay}>
                      <View>
                        <Text style={styles.themeName}>Amour</Text>
                        <Ionicons name="heart" size={22} color="rgba(255,255,255,0.8)" style={styles.themeIcon} />
                      </View>
                      <Text style={styles.themeCount}>124 VERSETS</Text>
                    </View>
                  </ImageBackground>
                </TouchableOpacity>

                {/* Carte Foi */}
                <TouchableOpacity style={styles.themeCard} activeOpacity={0.9} onPress={() => handleSelectSuggestion('foi')}>
                  <ImageBackground source={require('../../assets/Dimage.jpg')} style={styles.themeImage} imageStyle={styles.themeImageRadius}>
                    <View style={styles.themeOverlay}>
                      <View>
                        <Text style={styles.themeName}>Foi</Text>
                        <Ionicons name="water" size={22} color="rgba(255,255,255,0.8)" style={styles.themeIcon} />
                      </View>
                      <Text style={styles.themeCount}>86 VERSETS</Text>
                    </View>
                  </ImageBackground>
                </TouchableOpacity>
              </>
            )}

            {/* Liste de suggestions */}
            {suggestions.map((item, index) => (
              <TouchableOpacity 
                key={index} 
                style={styles.suggestionRow}
                onPress={() => handleSelectSuggestion(item.word)}
              >
                <Ionicons name="trending-up-outline" size={18} color="#8a99ad" style={styles.rowIcon} />
                <Text style={styles.suggestionText}>{item.word}</Text>
                <Ionicons name="chevron-forward" size={16} color="#cbd5e1" />
              </TouchableOpacity>
            ))}
          </View>
        ) : (
          /* PHASE 2 : RÉSULTATS DE VERSETS */
          <View>
            <Text style={styles.resultSummary}>
              {verses.length} {verses.length > 1 ? 'résultats trouvés' : 'résultat trouvé'}
            </Text>
            
            {verses.map((verse) => (
              <View key={verse.canonical_id} style={styles.verseCard}>
                <View style={styles.verseHeader}>
                  <Ionicons name="book-outline" size={16} color="#D4AF37" />
                  <Text style={styles.verseRef}>
                    {verse.book_name} {verse.chapter}:{verse.verse_num}
                  </Text>
                </View>
                <Text style={styles.verseText}>{verse.verse_text}</Text>
              </View>
            ))}

            {verses.length === 0 && (
              <View style={styles.centeredState}>
                <Ionicons name="search-outline" size={48} color="#cbd5e1" />
                <Text style={styles.emptyText}>Aucun verset ne correspond à ce mot.</Text>
              </View>
            )}
          </View>
        )}
        <View style={styles.bottomSpacer} />
      </ScrollView>

      {/* Navigation inférieure */}
      <View style={styles.bottomNav}>
        <TouchableOpacity style={styles.navItem} onPress={() => router.replace('/screens/(tabs)/Home')}>
          <Ionicons name="book-outline" size={20} color="#0a2d55" />
          <Text style={styles.activeNavText}>HOME</Text>
          <View style={styles.navDot} />
        </TouchableOpacity>
        <TouchableOpacity style={styles.navItem} onPress={() => router.replace('/screens/(tabs)/bible')}>
          <Ionicons name="book-outline" size={20} color="#8da0ba" />
          <Text style={styles.navText}>BIBLE</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.navItem} onPress={() => router.replace('/screens/(tabs)/Documents')}>
          <Ionicons name="library-outline" size={20} color="#8da0ba" />
          <Text style={styles.navText}>LIBRARY</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.navItem} onPress={() => router.replace('/screens/(tabs)/Profile')}>
          <Ionicons name="person-outline" size={20} color="#8da0ba" />
          <Text style={styles.navText}>PROFILE</Text>
        </TouchableOpacity>
      </View>

      <AppDrawer visible={drawerVisible} onClose={() => setDrawerVisible(false)} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: '#fff' 
  },
  appHeader: { 
    height: 60, 
    backgroundColor: '#f8f2e7', 
    paddingHorizontal: 20, 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center' 
  },
  appTitle: { 
    fontFamily: 'serif', 
    fontStyle: 'italic', 
    fontSize: 22, 
    color: '#0a2d55' 
  },
  heroContent: { 
    paddingHorizontal: 6, 
    paddingTop: 16, 
    paddingBottom: 16 
  },
  pageTitle: { 
    fontFamily: 'serif', 
    color: '#0d254c', 
    fontWeight: '700', 
    fontSize: 38,
    marginBottom: 8
  },
  intro: { 
    color: '#555b68', 
    fontSize: 16, 
    lineHeight: 22,
  },
  searchHeader: {
    paddingBottom: 24,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8f8f9',
    borderRadius: 25,
    paddingHorizontal: 16,
    height: 52,
    borderWidth: 1,
    borderColor: '#e8ecef',
  },
  searchIcon: {
    marginRight: 10,
  },
  textInput: {
    flex: 1,
    fontSize: 15,
    color: '#0a2d55',
    fontWeight: '400',
  },
  clearButton: {
    padding: 4,
  },

  scrollContent: { 
    paddingHorizontal: 22, 
    paddingTop: 10, 
    paddingBottom: 100 
  },
  themeTitle: { 
    color: '#0d254c', 
    fontFamily: 'serif', 
    fontStyle: 'italic', 
    fontWeight: '700', 
    fontSize: 26, 
    marginBottom: 20 
  },
  themeCard: { 
    height: 300, 
    marginBottom: 18, 
    borderRadius: 16, 
    overflow: 'hidden' 
  },
  themeImage: { 
    flex: 1 
  },
  themeImageRadius: { 
    borderRadius: 16 
  },
  themeOverlay: { 
    flex: 1, 
    padding: 20, 
    justifyContent: 'space-between', 
    backgroundColor: 'rgba(10, 45, 85, 0.35)' 
  },
  themeName: { 
    color: '#fff', 
    fontFamily: 'serif', 
    fontSize: 28, 
    fontWeight: '700',
    marginBottom: 10,
  },
  themeIcon: {
    marginTop: 2,
  },
  themeCount: { 
    color: 'rgba(255, 255, 255, 0.7)', 
    fontSize: 11, 
    fontWeight: '700', 
    letterSpacing: 1.2 
  },

  bottomNav: { 
    position: 'absolute', 
    left: 20, 
    right: 20, 
    bottom: 70, 
    height: 58, 
    backgroundColor: '#fff', 
    borderRadius: 30, 
    flexDirection: 'row', 
    justifyContent: 'space-around', 
    alignItems: 'center', 
    shadowColor: '#a0a0a0', 
    shadowOpacity: 0.15, 
    shadowRadius: 12, 
    shadowOffset: { width: 0, height: 4 }, 
    elevation: 4 
  }, 
  navItem: { 
    width: 50, 
    alignItems: 'center' 
  }, 
  navText: { 
    color: '#8da0ba', 
    fontSize: 9, 
    marginTop: 2,
    fontWeight: '600'
  }, 
  activeNavText: { 
    color: '#0a2d55', 
    fontSize: 9, 
    marginTop: 2,
    fontWeight: '700'
  }, 
  navDot: { 
    width: 4, 
    height: 4, 
    borderRadius: 2, 
    backgroundColor: '#d4af37', 
    marginTop: 3 
  },
  bottomSpacer: {
    height: 40,
  },

  suggestionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  rowIcon: {
    marginRight: 14,
  },
  suggestionText: {
    flex: 1,
    fontSize: 16,
    color: '#334155',
    fontWeight: '500',
  },

  resultSummary: {
    fontSize: 14,
    color: '#64748b',
    fontWeight: '600',
    marginBottom: 16,
  },
  verseCard: {
    backgroundColor: '#fff',
    borderRadius: 14,
    padding: 18,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: '#edf2f7',
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
  },
  verseHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 10,
  },
  verseRef: {
    fontSize: 15,
    fontWeight: '700',
    color: '#0a2d55',
  },
  verseText: {
    fontSize: 15,
    color: '#334155',
    lineHeight: 24,
  },

  centeredState: {
    paddingTop: 60,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    marginTop: 12,
    fontSize: 15,
    color: '#94a3b8',
    fontWeight: '500',
    textAlign: 'center',
  },
});