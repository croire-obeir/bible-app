import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  TextInput, 
  FlatList, 
  StyleSheet, 
  TouchableOpacity 
} from 'react-native';

import { useSQLiteContext } from 'expo-sqlite';



interface SearchResult {
  word: string;
}

interface VerseResult {
  book_name: string;
  chapter: number;
  verse_num: number;
  verse_text: string;
}

const SearchScreen = () => {
  const db = useSQLiteContext();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [verses, setVerses] = useState<VerseResult[]>([]);
  const [showVerses, setShowVerses] = useState(false);


    const performSearch= async(text:string)=>{
        if(text.length===0){
            setResults([]);
            return;
        }
        try{
            const sqlQuery = `SELECT word FROM search_suggestions WHERE word MATCH ? LIMIT 8;`;
            const searchParam = `${text}*`; // Using wildcard for prefix search
            // Execute the query
            const allRows = await db.getAllAsync<SearchResult>(sqlQuery, [searchParam]);
            setResults(allRows);
        }catch (error) {
            console.error("Search error:", error);
            setResults([]);
        }
    }


    const handleVerseSearch = async (selectedWord: string) => {
        try {
            // Note: We use the exact word clicked, usually without the '*' 
            // unless you want partial matches for the full verses too.
            const sql = `
                SELECT 
                    b.name AS book_name, 
                    v.chapter, 
                    v.verse_num, 
                    v.verse_text
                FROM verses v
                JOIN verses_fts fts ON v.canonical_id = fts.rowid
                JOIN books b ON v.book_id = b.id  -- Join the books table here
                WHERE verses_fts MATCH ?
                ORDER BY v.canonical_id ASC;
            `;

            const verseRows = await db.getAllAsync<VerseResult>(sql, [selectedWord]);
            setVerses(verseRows);
            setShowVerses(true); // Hide the suggestion list, show the verses
        } catch (error) {
            console.error("Verse search error:", error);
        }
    };

        // Debouncing logic: Wait 300ms after user stops typing to query DB
    useEffect(() => {
        const delayDebounceFn = setTimeout(() => {
        performSearch(query);
        }, 300);

        return () => clearTimeout(delayDebounceFn);
    }, [query]);

  return (
    <View style={{ flex: 1, padding: 16, backgroundColor: '#fff' }}>
        <TextInput
        style={styles.input}
        placeholder="Search words..."
        onChangeText={(text) => {
            setQuery(text);
            setShowVerses(false); // Switch back to suggestions when user types
        }}
        value={query}
        />

        {!showVerses ? (
        /* --- SUGGESTION LIST --- */
        <FlatList<SearchResult>
            data={results}
            keyExtractor={(_, index) => `sug-${index}`}
            renderItem={({ item }) => (
            <TouchableOpacity 
                style={styles.suggestionItem} 
                onPress={() => handleVerseSearch(item.word)} // <--- TRiggers the Verse query
            >
                <Text style={{ fontSize: 16 }}>{item.word}</Text>
            </TouchableOpacity>
            )}
        />
        ) : (
        /* --- VERSE RESULTS LIST --- */
        <FlatList<VerseResult>
            data={verses}
            keyExtractor={(_, index) => `verse-${index}`}
            renderItem={({ item }) => (
            <View style={styles.verseContainer}>
                <Text style={styles.verseReference}>
               {item.book_name} {item.chapter}:{item.verse_num}
                </Text>
                <Text style={styles.verseText}>{item.verse_text}</Text>
            </View>
            )}
        />
        )}
    </View>
    );
};


const styles = StyleSheet.create({
  input: { height: 50, borderBottomWidth: 1, marginBottom: 15 },
  suggestionItem: { paddingVertical: 12, borderBottomWidth: 0.5, borderColor: '#eee' },
  verseContainer: { marginBottom: 20, padding: 10, backgroundColor: '#f9f9f9', borderRadius: 8 },
  verseReference: { fontWeight: 'bold', color: '#007AFF', marginBottom: 4 },
  verseText: { fontSize: 15, lineHeight: 22 }
});
// const styles = StyleSheet.create({
//   container: { flex: 1, backgroundColor: '#fff', padding: 16 },
//   searchInput: {
//     height: 50,
//     borderWidth: 1,
//     borderColor: '#ddd',
//     borderRadius: 8,
//     paddingHorizontal: 15,
//     marginBottom: 20,
//     fontSize: 16,
//   },
//   item: {
//     padding: 15,
//     borderBottomWidth: 1,
//     borderBottomColor: '#eee',
//   },
//   emptyText: { textAlign: 'center', marginTop: 20, color: '#888' }
// });

export default SearchScreen;