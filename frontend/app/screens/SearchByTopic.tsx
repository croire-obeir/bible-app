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

// Define structures matching your existing queries
interface SuggestionResult {
  word: string;
}

interface VerseResult {
  canonical_id: number; // Unique identifier for the verse
  book_name: string;
  chapter: number;
  verse_num: number;
  verse_text: string;
}

export default function SearchByTopicScreen() {
  const router = useRouter();
  const db = useSQLiteContext();

  // State Management
  const [searchQuery, setSearchQuery] = useState('');
  const [suggestions, setSuggestions] = useState<SuggestionResult[]>([]);
  const [verses, setVerses] = useState<VerseResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [drawerVisible, setDrawerVisible] = useState(false);
  
  // Controls display logic: 'suggestions' or 'results'
  const [searchPhase, setSearchPhase] = useState<'suggestions' | 'results'>('suggestions');

  // 1. Phase 1: Live Query Suggestions as user types
  const handleTextChange = async (text: string) => {
    setSearchQuery(text);
    
    if (text.trim().length === 0) {
      setSuggestions([]);
      setSearchPhase('suggestions');
      return;
    }

    try {
      setSearchPhase('suggestions'); // Always revert to suggestion mode while typing
      
      // Your existing suggestion query structure
      const sqlQuery = `SELECT word FROM search_suggestions WHERE word MATCH ? LIMIT 8;`;
      const searchParam = `${text}*`; 
      
      const rows = await db.getAllAsync<SuggestionResult>(sqlQuery, [searchParam]);
      setSuggestions(rows);
    } catch (error) {
      console.error("Suggestion parsing failure:", error);
    }
  };

  // 2. Phase 2: Execute Verse Query when suggestion is clicked
 // app/screens/search.tsx (Inside your SearchScreen component)

    const handleSelectSuggestion = async (selectedWord: string) => {
        // Guard clause against empty submissions
        if (!selectedWord.trim()) return;

        setSearchQuery(selectedWord);
        setSuggestions([]);         // Hide/clear the suggestion list dropdown
        setLoading(true);           // Show the ActivityIndicator spinner
        setSearchPhase('results');   // Flip the state phase to render verse cards instead

        try {
            // Your exact full-text search relational query
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

            // Query the expo-sqlite instance context using the active suggestion string
            const verseRows = await db.getAllAsync<VerseResult>(sql, [selectedWord]);
            setVerses(verseRows);
        } catch (error) {
            console.error("Verse search execution failure:", error);
            setVerses([]); // Safely reset array on errors
        } finally {
            setLoading(false); // Dismantle the loading state to reveal results
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
      <View style={styles.appHeader}>
        <TouchableOpacity onPress={() => setDrawerVisible(true)}><Ionicons name="menu" size={20} color="#0a2d55" /></TouchableOpacity>
        <Text style={styles.appTitle}>Croire & Obéir</Text>
        <Ionicons name="search" size={20} color="#0a2d55" />
      </View>
      <View style={styles.heroContent}>
        <Text style={styles.pageTitle}>Explorer</Text>
        <Text style={styles.intro}>Que cherchez-vous dans Sa Parole{`\n`}aujourd’hui?</Text>
      </View>
      <View style={styles.searchHeader}>
        <View style={styles.inputWrapper}>
          <Ionicons name="search" size={18} color="#94a3b8" style={styles.searchIcon} />
          <TextInput
            placeholder="Rechercher un mot, un thème..."
            placeholderTextColor="#94a3b8"
            value={searchQuery}
            onChangeText={handleTextChange}
            style={styles.textInput}
            returnKeyType="search"
            onSubmitEditing={() => handleSelectSuggestion(searchQuery)}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={handleClearInput} style={styles.clearButton}>
              <Ionicons name="close-circle" size={18} color="#94a3b8" />
            </TouchableOpacity>
          )}
          {searchQuery.length === 0 && <Ionicons name="options-outline" size={18} color="#35629b" />}
        </View>
      </View>

      {/* DYNAMIC DISPLAY CONTENT LOGIC */}
      {loading ? (
        <View style={styles.centeredState}>
          <ActivityIndicator size="large" color="#0a2d55" />
        </View>
      ) : searchPhase === 'suggestions' ? (
        /* PHASE 1 VIEW: SUGGESTIONS DROPDOWN LIST */
        <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
          {searchQuery.length === 0 && (
            <>
              <Text style={styles.themeTitle}>Thèmes Sacrés</Text>
              <TouchableOpacity style={styles.themeCard} activeOpacity={0.9} onPress={() => handleSelectSuggestion('amour')}>
                <ImageBackground source={require('../../assets/Timage.jpg')} style={styles.themeImage} imageStyle={styles.themeImageRadius}>
                  <View style={styles.themeOverlay}>
                    <Text style={styles.themeName}>Amour</Text>
                    <Ionicons name="heart" size={17} color="#5f5720" />
                    <Text style={styles.themeCount}>124 VERSETS</Text>
                  </View>
                </ImageBackground>
              </TouchableOpacity>
              <TouchableOpacity style={styles.themeCard} activeOpacity={0.9} onPress={() => handleSelectSuggestion('foi')}>
                <ImageBackground source={require('../../assets/Dimage.jpg')} style={styles.themeImage} imageStyle={styles.themeImageRadius}>
                  <View style={styles.themeOverlay}>
                    <Text style={styles.themeName}>Foi</Text>
                    <Ionicons name="flame" size={17} color="#5f5720" />
                    <Text style={styles.themeCount}>89 VERSETS</Text>
                  </View>
                </ImageBackground>
              </TouchableOpacity>
            </>
          )}
          {suggestions.map((item, index) => (
            <TouchableOpacity 
              key={index} 
              style={styles.suggestionRow}
              onPress={() => handleSelectSuggestion(item.word)}
            >
              <Ionicons name="trending-up-outline" size={16} color="#8a99ad" style={styles.rowIcon} />
              <Text style={styles.suggestionText}>{item.word}</Text>
              <Ionicons name="chevron-forward" size={14} color="#cbd5e1" />
            </TouchableOpacity>
          ))}
        </ScrollView>
      ) : (
        /* PHASE 2 VIEW: VERSE RESULT CARDS */
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <Text style={styles.resultSummary}>
            {verses.length} {verses.length > 1 ? 'résultats trouvés' : 'résultat trouvé'}
          </Text>
          
          {verses.map((verse) => (
            <View key={verse.canonical_id} style={styles.verseCard}>
              <View style={styles.verseHeader}>
                <Ionicons name="book-outline" size={14} color="#D4AF37" />
                <Text style={styles.verseRef}>
                  {verse.book_name} {verse.chapter}:{verse.verse_num}
                </Text>
              </View>
              <Text style={styles.verseText}>{verse.verse_text}</Text>
            </View>
          ))}

          {verses.length === 0 && (
            <View style={styles.centeredState}>
              <Ionicons name="search-outline" size={40} color="#cbd5e1" />
              <Text style={styles.emptyText}>Aucun verset ne correspond à ce mot.</Text>
            </View>
          )}
          <View style={styles.bottomSpacer} />
        </ScrollView>
      )}
      <View style={styles.bottomNav}>
        <TouchableOpacity style={styles.navItem} onPress={() => router.replace('/screens/(tabs)/Home')}><Ionicons name="book-outline" size={18} color="#0a2d55" /><Text style={styles.activeNavText}>HOME</Text><View style={styles.navDot} /></TouchableOpacity>
        <TouchableOpacity style={styles.navItem} onPress={() => router.replace('/screens/(tabs)/bible')}><Ionicons name="book-outline" size={18} color="#8da0ba" /><Text style={styles.navText}>BIBLE</Text></TouchableOpacity>
        <TouchableOpacity style={styles.navItem} onPress={() => router.replace('/screens/(tabs)/Documents')}><Ionicons name="library-outline" size={18} color="#8da0ba" /><Text style={styles.navText}>LIBRARY</Text></TouchableOpacity>
        <TouchableOpacity style={styles.navItem} onPress={() => router.replace('/screens/(tabs)/Profile')}><Ionicons name="person-outline" size={18} color="#8da0ba" /><Text style={styles.navText}>PROFILE</Text></TouchableOpacity>
      </View>
      <AppDrawer visible={drawerVisible} onClose={() => setDrawerVisible(false)} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  appHeader: { height: 53, backgroundColor: '#f8f3e7', paddingHorizontal: 16, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  appTitle: { fontFamily: 'serif', fontStyle: 'italic', fontSize: 16, color: '#0a2d55' },
  heroContent: { paddingHorizontal: 27, paddingTop: 14, paddingBottom: 12 },
  pageTitle: { fontFamily: 'serif', color: '#092d70', fontWeight: '700', fontSize: 28 },
  intro: { color: '#555b68', fontSize: 12, lineHeight: 16, marginTop: 6 },
  // Search bar area setup
  searchHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    paddingBottom: 9,
    paddingHorizontal: 27,
  },
  backButton: {
    padding: 4,
  },
  inputWrapper: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 20,
    paddingHorizontal: 12,
    height: 39,
    shadowColor: '#b6b9c4',
    shadowOpacity: 0.16,
    shadowOffset: { width: 0, height: 5 },
    shadowRadius: 12,
    elevation: 3,
  },
  searchIcon: {
    marginRight: 8,
  },
  textInput: {
    flex: 1,
    fontSize: 15,
    color: '#0a2d55',
    fontWeight: '500',
    padding: 0, // Strips standard platform field shifts
  },
  clearButton: {
    padding: 4,
  },

  // Layout Streams
  scrollContent: { paddingHorizontal: 15, paddingTop: 4, paddingBottom: 95 },
  themeTitle: { color: '#092d70', fontFamily: 'serif', fontStyle: 'italic', fontWeight: '700', fontSize: 17, marginLeft: 18, marginBottom: 20 },
  themeCard: { height: 126, marginBottom: 13, borderRadius: 6, overflow: 'hidden' },
  themeImage: { flex: 1 },
  themeImageRadius: { borderRadius: 6 },
  themeOverlay: { flex: 1, padding: 13, justifyContent: 'space-between', backgroundColor: 'rgba(10,45,85,.28)' },
  themeName: { color: '#fff', fontFamily: 'serif', fontSize: 18, fontWeight: '700' },
  themeCount: { color: '#082d70', fontSize: 8, fontWeight: '700', opacity: .5 },
  bottomNav: { position: 'absolute', left: 16, right: 16, bottom: 12, height: 48, backgroundColor: '#fff', borderRadius: 24, flexDirection: 'row', justifyContent: 'space-around', alignItems: 'center', shadowColor: '#adb2bf', shadowOpacity: .1, shadowRadius: 14, shadowOffset: { width: 0, height: 3 }, elevation: 2 }, navItem: { width: 45, alignItems: 'center' }, navText: { color: '#8da0ba', fontSize: 7, marginTop: 1 }, activeNavText: { color: '#0a2d55', fontSize: 7, marginTop: 1 }, navDot: { width: 3, height: 3, borderRadius: 2, backgroundColor: '#d4af37', marginTop: 2 },
  bottomSpacer: {
    height: 40,
  },

  // Suggestion Rows Design (Phase 1)
  suggestionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  rowIcon: {
    marginRight: 12,
  },
  suggestionText: {
    flex: 1,
    fontSize: 15,
    color: '#334155',
    fontWeight: '600',
  },

  // Verse Card Design (Phase 2)
  resultSummary: {
    fontSize: 13,
    color: '#64748b',
    fontWeight: '600',
    marginBottom: 12,
    paddingLeft: 4,
  },
  verseCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#edf2f7',
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 2,
  },
  verseHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 8,
  },
  verseRef: {
    fontSize: 13,
    fontWeight: '700',
    color: '#0a2d55',
  },
  verseText: {
    fontSize: 14,
    color: '#334155',
    lineHeight: 22,
    fontWeight: '400',
  },

  // Fallbacks
  centeredState: {
    paddingTop: 60,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    marginTop: 10,
    fontSize: 14,
    color: '#94a3b8',
    fontWeight: '500',
    textAlign: 'center',
  },
});
