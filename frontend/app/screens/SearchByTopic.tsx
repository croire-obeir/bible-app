import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TextInput, 
  TouchableOpacity, 
  ScrollView, 
  ActivityIndicator 
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useSQLiteContext } from 'expo-sqlite';

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
      {/* HEADER INPUT ROW */}
      <View style={styles.searchHeader}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="#0a2d55" />
        </TouchableOpacity>
        
        <View style={styles.inputWrapper}>
          <Ionicons name="search" size={18} color="#94a3b8" style={styles.searchIcon} />
          <TextInput
            placeholder="Rechercher un mot, un thème..."
            placeholderTextColor="#94a3b8"
            value={searchQuery}
            onChangeText={handleTextChange}
            style={styles.textInput}
            autoFocus
            returnKeyType="search"
            onSubmitEditing={() => handleSelectSuggestion(searchQuery)}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={handleClearInput} style={styles.clearButton}>
              <Ionicons name="close-circle" size={18} color="#94a3b8" />
            </TouchableOpacity>
          )}
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
    </View>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: '#f8fafc' 
  },
  // Search bar area setup
  searchHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    paddingTop: 50, // Pushes elements safely under device hardware status notches
    paddingBottom: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#edf2f7',
    gap: 12,
  },
  backButton: {
    padding: 4,
  },
  inputWrapper: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f1f5f9',
    borderRadius: 24,
    paddingHorizontal: 12,
    height: 40,
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
  scrollContent: {
    padding: 16,
  },
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