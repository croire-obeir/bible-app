import React, { useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { Href, useLocalSearchParams, useRouter } from 'expo-router';
import { BibleChapter, BibleVerse, fetchBibleChapter } from '@/api/services/bibleServices';
import { SacredPage } from '@/components/sacred/SacredPage';
import { sacredColors } from '@/constants/sacredTheme';

export default function ReaderScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ bookId?: string; chapter?: string }>();
  const [chapterData, setChapterData] = useState<BibleChapter | null>(null);
  const [chapter, setChapter] = useState(Number(params.chapter || 1));
  const [selectedVerse, setSelectedVerse] = useState(3);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const bookId = Number(params.bookId || 43);

  useEffect(() => {
    let mounted = true;

    setLoading(true);
    fetchBibleChapter(bookId, chapter)
      .then((data) => {
        if (mounted) {
          setChapterData(data);
          setError('');
        }
      })
      .catch(() => {
        if (mounted) {
          setError('Lecture indisponible pour ce chapitre.');
        }
      })
      .finally(() => {
        if (mounted) {
          setLoading(false);
        }
      });

    return () => {
      mounted = false;
    };
  }, [bookId, chapter]);

  const chapters = useMemo(() => {
    const count = chapterData?.book.chapterCount ?? 6;
    return Array.from({ length: count }, (_, index) => index + 1);
  }, [chapterData?.book.chapterCount]);

  const openShare = (verse: BibleVerse) => {
    router.push({
      pathname: '/ShareVerse',
      params: {
        bookName: verse.bookName,
        chapter: String(verse.chapter),
        verseNum: String(verse.verseNum),
        text: verse.text,
      },
    } as Href);
  };

  const title = chapterData?.book.name ?? 'Jean';

  return (
    <SacredPage
      activeTab="bible"
      centerTitle={title}
      rightLabel={`Ch. ${chapter}`}
      showSearch={false}
    >
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.chapterRow}
      >
        {chapters.map((item) => {
          const active = item === chapter;
          return (
            <TouchableOpacity
              key={item}
              activeOpacity={0.8}
              onPress={() => {
                setChapter(item);
                setSelectedVerse(1);
              }}
              style={[styles.chapterButton, active && styles.chapterButtonActive]}
            >
              <Text style={[styles.chapterText, active && styles.chapterTextActive]}>
                {String(item).padStart(2, '0')}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      {loading ? (
        <View style={styles.stateBlock}>
          <ActivityIndicator color={sacredColors.navy} />
        </View>
      ) : error ? (
        <Text style={styles.errorText}>{error}</Text>
      ) : (
        <View style={styles.verses}>
          {chapterData?.verses.map((verse) => {
            const active = selectedVerse === verse.verseNum;
            return (
              <TouchableOpacity
                key={verse.canonicalId}
                activeOpacity={0.86}
                onPress={() => setSelectedVerse(verse.verseNum)}
                onLongPress={() => openShare(verse)}
                style={styles.verseRow}
              >
                <View style={styles.verseRail}>
                  <View style={[styles.verseNumber, active && styles.verseNumberActive]}>
                    <Text style={[styles.verseNumberText, active && styles.verseNumberTextActive]}>
                      {verse.verseNum}
                    </Text>
                  </View>
                  <View style={styles.railLine} />
                </View>

                <View style={[styles.verseCard, active && styles.verseCardActive]}>
                  <Text style={[styles.verseText, active && styles.verseTextActive]}>
                    {verse.text}
                  </Text>
                </View>
              </TouchableOpacity>
            );
          })}
        </View>
      )}
    </SacredPage>
  );
}

const styles = StyleSheet.create({
  chapterRow: {
    alignItems: 'center',
    gap: 14,
    minHeight: 42,
    paddingHorizontal: 3,
    paddingBottom: 6,
  },
  chapterButton: {
    minWidth: 36,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  chapterButtonActive: {
    backgroundColor: sacredColors.navy,
  },
  chapterText: {
    color: '#5D6678',
    fontSize: 12,
    fontWeight: '700',
  },
  chapterTextActive: {
    color: sacredColors.white,
  },
  stateBlock: {
    alignItems: 'center',
    paddingVertical: 42,
  },
  errorText: {
    color: '#9A3C37',
    fontSize: 12,
    fontWeight: '700',
    paddingVertical: 20,
    textAlign: 'center',
  },
  verses: {
    marginTop: 4,
  },
  verseRow: {
    flexDirection: 'row',
    minHeight: 74,
  },
  verseRail: {
    width: 34,
    alignItems: 'center',
  },
  verseNumber: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderColor: '#D6C89D',
    borderWidth: 1,
    backgroundColor: sacredColors.white,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 2,
  },
  verseNumberActive: {
    backgroundColor: '#877C12',
    borderColor: '#877C12',
  },
  verseNumberText: {
    color: '#7B7F8D',
    fontSize: 11,
    fontWeight: '800',
  },
  verseNumberTextActive: {
    color: sacredColors.white,
  },
  railLine: {
    flex: 1,
    width: 1,
    backgroundColor: '#E9E1D5',
    marginTop: -1,
  },
  verseCard: {
    flex: 1,
    backgroundColor: '#F1F0EF',
    borderRadius: 10,
    marginBottom: 12,
    paddingHorizontal: 18,
    paddingVertical: 15,
  },
  verseCardActive: {
    backgroundColor: '#C7BD8E',
  },
  verseText: {
    color: '#101828',
    fontFamily: 'serif',
    fontSize: 17,
    lineHeight: 27,
  },
  verseTextActive: {
    color: '#060A12',
    fontWeight: '600',
  },
});
