import React, { useEffect, useState } from 'react';
import {
  AppState,
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  ImageBackground,
  StatusBar,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import AppDrawer from '../../../components/AppDrawer';
import { useSQLiteContext } from 'expo-sqlite';
import { useTabBarScroll } from '../../../components/tab-bar-visibility';

import GreetingSection from '../../../components/GreetingSection';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  getDailyVerseReference,
  getDailyVerseErrorMessage,
  type DailyVerseReference,
} from '../../../api/services/dailyVerseServices'; // adjust to your real path

type DailyVerse = {
  book_name: string;
  chapter: number;
  verse_start: number;
  verse_end: number;
  verses: { verse_num: number; verse_text: string }[];
};

// Adjust to your real values: what selectedVersion holds -> version_id in SQLite
const VERSION_IDS: Record<string, number> = {
  LSG: 1,
  Semeur: 2, // <-- check the real key and version_id
};

// interface DailyVerse {
//   verse_text: string;
//   book_name: string;
//   chapter: number;
//   verse_num: number;
// }

const dailyVerseImages = [
  require('../../../assets/bible.jpg'),
  require('../../../assets/pimage.jpg'),
  require('../../../assets/Timage.jpg'),
];

const getLocalDateKey = () => {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

type AppRoute =
  | '/screens/VersionSelect'
  | '/screens/(tabs)/bible'
  | '/screens/(tabs)/Audios'
  | '/screens/(tabs)/Videos'
  | '/screens/(tabs)/Documents';

export default function HomeScreen() {
  const router = useRouter();
  const db = useSQLiteContext();
  const [drawerVisible, setDrawerVisible] = useState(false);
  const [selectedVersion, setSelectedVersion] = useState('LSG');
  const [todayKey, setTodayKey] = useState(getLocalDateKey);
  const [verseReference, setVerseReference] = useState<DailyVerseReference | null>(null); // NEW
  const [dailyVerse, setDailyVerse] = useState<DailyVerse | null>(null);
  const [verseError, setVerseError] = useState<string | null>(null);
  const [verseLoading, setVerseLoading] = useState(true);
  const handleTabBarScroll = useTabBarScroll();
  const handleVersionChange = (version: string) => {
    setSelectedVersion(version);
  };
  const [year, month, day] = todayKey.split('-').map(Number);
  const dayNumber = Math.floor(Date.UTC(year, month - 1, day) / 86_400_000);
  const dailyVerseImage = dailyVerseImages[dayNumber % dailyVerseImages.length];

  useEffect(() => {
    let midnightTimeout: ReturnType<typeof setTimeout>;

    const refreshDate = () => setTodayKey(getLocalDateKey());
    const scheduleMidnightRefresh = () => {
      const now = new Date();
      const nextMidnight = new Date(
        now.getFullYear(),
        now.getMonth(),
        now.getDate() + 1
      ).getTime();

      midnightTimeout = setTimeout(() => {
        refreshDate();
        scheduleMidnightRefresh();
      }, Math.max(nextMidnight - Date.now() + 25, 25));
    };

    refreshDate();
    scheduleMidnightRefresh();

    const appStateSubscription = AppState.addEventListener('change', (state) => {
      if (state === 'active') {
        refreshDate();
      }
    });

    return () => {
      clearTimeout(midnightTimeout);
      appStateSubscription.remove();
    };
  }, []);


  useEffect(() => {
    let isActive = true;

    const loadReference = async () => {
      try {
        setVerseLoading(true);
        setVerseError(null);
        const reference = await getDailyVerseReference(todayKey);
        if (isActive) setVerseReference(reference);
      } catch (error) {
        console.warn('Daily verse reference failed:', error);
        if (isActive) {
          setVerseReference(null);
          setDailyVerse(null);
          setVerseError(getDailyVerseErrorMessage(error));
          setVerseLoading(false);
        }
      }
    };

    loadReference();
    return () => {
      isActive = false;
    };
  }, [todayKey]);

   // NEW B) text from SQLite, re-run when the translation changes
  useEffect(() => {
    if (!verseReference) return;
    let isActive = true;

    const loadVerseText = async () => {
      try {
        const versionId = VERSION_IDS[selectedVersion] ?? VERSION_IDS.LSG;

        const rows = await db.getAllAsync<{
          verse_num: number;
          verse_text: string;
          book_name: string;
        }>(
          `SELECT v.verse_num, v.verse_text, b.name AS book_name
           FROM verses v
           JOIN books b ON b.id = v.book_id
           WHERE v.version_id = ?
             AND v.book_id = ?
             AND v.chapter = ?
             AND v.verse_num BETWEEN ? AND ?
           ORDER BY v.verse_num ASC`,
          [
            versionId,
            Number(verseReference.book_code),
            verseReference.chapter,
            verseReference.verse_start,
            verseReference.verse_end,
          ]
        );

        if (!isActive) return;

        if (rows.length === 0) {
          setDailyVerse(null);
          setVerseError('Le verset du jour est introuvable dans cette traduction.');
          return;
        }

        setVerseError(null);
        setDailyVerse({
          book_name: rows[0].book_name,
          chapter: verseReference.chapter,
          verse_start: verseReference.verse_start,
          verse_end: verseReference.verse_end,
          verses: rows.map((r) => ({
            verse_num: r.verse_num,
            verse_text: r.verse_text.replace(/¶/g, '').trim(),
          })),
        });
      } catch (error) {
        console.error('Error loading daily verse from SQLite:', error);
        if (isActive) {
          setDailyVerse(null);
          setVerseError('Impossible de lire le verset du jour.');
        }
      } finally {
        if (isActive) setVerseLoading(false);
      }
    };

    loadVerseText();
    return () => {
      isActive = false;
    };
  }, [db, verseReference, selectedVersion]);

  // NEW: helpers for the JSX
  const verseRange = dailyVerse
    ? dailyVerse.verse_start === dailyVerse.verse_end
      ? `${dailyVerse.verse_start}`
      : `${dailyVerse.verse_start}-${dailyVerse.verse_end}`
    : '';
  const referenceLabel = dailyVerse
    ? `${dailyVerse.book_name} ${dailyVerse.chapter}:${verseRange}`
    : '';
  const isMultiVerse = (dailyVerse?.verses.length ?? 0) > 1;


  // useEffect(() => {
  //   let isActive = true;

  //   const loadDailyVerse = async () => {
  //     try {
  //       setVerseLoading(true);
  //       const countRow = await db.getFirstAsync<{ total: number }>(
  //         'SELECT COUNT(*) AS total FROM verses WHERE version_id = ?',
  //         [1]
  //       );
  //       const total = countRow?.total ?? 0;

  //       if (total === 0) {
  //         if (isActive) setDailyVerse(null);
  //         return;
  //       }

  //       const verseIndex = dayNumber % total;
  //       console.log(`Loading daily verse for day number ${dayNumber}, verse index ${verseIndex} (total verses: ${total})`);
  //       const verse = await db.getFirstAsync<DailyVerse>(
  //         `SELECT v.verse_text, b.name AS book_name, v.chapter, v.verse_num
  //          FROM verses v
  //          JOIN books b ON b.id = v.book_id
  //          WHERE v.version_id = ?
  //          ORDER BY v.canonical_id ASC
  //          LIMIT 1 OFFSET ?`,
  //         [1, verseIndex]
  //       );

  //       if (isActive) {
  //         setDailyVerse(verse
  //           ? { ...verse, verse_text: verse.verse_text.replace(/¶/g, '') }
  //           : null);
  //       }
  //     } catch (error) {
  //       console.error('Error loading daily verse from SQLite:', error);
  //       if (isActive) setDailyVerse(null);
  //     } finally {
  //       if (isActive) setVerseLoading(false);
  //     }
  //   };

  //   loadDailyVerse();
  //   return () => {
  //     isActive = false;
  //   };
  // }, [db, todayKey, dayNumber]);

  const features: Array<{
    id: string;
    title: string;
    subtitle: string;
    icon: string;
    route: AppRoute;
    backgroundColor: string;
    iconBackground: string;
    iconColor: string;
    titleColor: string;
  }> = [
    {
      id: '1',
      title: 'La Bible',
      subtitle: '',
      icon: 'book',
      route: '/screens/(tabs)/bible',
      backgroundColor: '#EDE8D3',
      iconBackground: '#FFFFFF',
      iconColor: '#0A2D55',
      titleColor: '#0A2D55',
    },
    {
      id: '2',
      title: 'Enseignements\nAudio',
      subtitle: '',
      icon: 'headset',
      route: '/screens/(tabs)/Audios',
      backgroundColor: '#B7B190',
      iconBackground: '#FFFFFF',
      iconColor: '#0A2D55',
      titleColor: '#0A2D55',
    },
    {
      id: '3',
      title: 'Vidéos\nSacrées',
      subtitle: '',
      icon: 'play-circle',
      route: '/screens/(tabs)/Videos',
      backgroundColor: '#B7B190',
      iconBackground: '#FFFFFF',
      iconColor: '#0A2D55',
      titleColor: '#0A2D55',
    },
    {
      id: '4',
      title: 'Documents',
      subtitle: '',
      icon: 'folder-open-outline',
      route: '/screens/(tabs)/Documents',
      backgroundColor: '#EDE8D3',
      iconBackground: '#FFFFFF',
      iconColor: '#0A2D55',
      titleColor: '#0A2D55',
    },
  ];

  

  return (
    <View style={styles.container}>
      <StatusBar
        barStyle="dark-content"
        backgroundColor="#F8F3E7"
        translucent={false}
      />

      {/* ==================================================
          HEADER
      ================================================== */}

      <View style={styles.header}>
        <TouchableOpacity
          style={styles.headerButton}
          activeOpacity={0.7}
          onPress={() => setDrawerVisible(true)}
        >
          <Ionicons
            name="menu"
            size={21}
            color="#0A2D55"
          />
        </TouchableOpacity>

        <Text style={styles.logo}>
          Croire & Obéir
        </Text>

        <View style={styles.headerButton} />
      </View>

        {/* ==================================================
          CONTENU
      ================================================== */}

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        bounces={false}
        onScroll={handleTabBarScroll}
        scrollEventThrottle={16}
      >

        <GreetingSection />

        {/* ==================================================
            VERSET DU JOUR
        ================================================== */}

       
        <TouchableOpacity
          activeOpacity={0.95}
          style={styles.verseCard}
        >
          <ImageBackground
            source={dailyVerseImage}
            resizeMode="cover"
            style={styles.verseBackground}
            imageStyle={styles.verseImage}
          >
            <LinearGradient
              colors={[
                'rgba(10, 45, 85, 0.30)',
                'rgba(10, 45, 85, 0.60)',
                'rgba(10, 45, 85, 0.95)',
              ]}
              locations={[0, 0.48, 1]}
              style={styles.verseGradient}
            >
              <View style={styles.verseContent}>

                <View style={styles.verseLabelRow}>
                  <Ionicons name="star" size={8} color="#D4AF37" />
                  <Text style={styles.verseLabel}>VERSET DU JOUR</Text>
                </View>

                <Text style={styles.verseText}>
                  {dailyVerse
                    ? `“${dailyVerse.verses
                      .map((v) =>
                        isMultiVerse ? `${v.verse_num} ${v.verse_text}` : v.verse_text
                      )
                      .join(' ')}”`
                    : verseLoading
                      ? 'Chargement du verset...'
                      : verseError ?? 'Verset indisponible'}
                </Text>

                <Text style={styles.verseReference}>
                  {dailyVerse ? `${referenceLabel} →` : '→'}
                </Text>

              </View>
            </LinearGradient>
          </ImageBackground>
        </TouchableOpacity>

        {/* ==================================================
            GRILLE DES 4 CARTES
        ================================================== */}

        <View style={styles.featuresGrid}>
          {features.map((feature) => (
            <TouchableOpacity
              key={feature.id}
              activeOpacity={0.82}
              style={[
                styles.featureCard,
                {
                  backgroundColor: feature.backgroundColor,
                },
              ]}
              onPress={() => router.push(feature.route)}
            >
              <View
                style={[
                  styles.featureIcon,
                  {
                    backgroundColor: feature.iconBackground,
                  },
                ]}
              >
                <Ionicons
                  name={feature.icon as any}
                  size={18}
                  color={feature.iconColor}
                />
              </View>

              <Text style={[styles.featureTitle, { color: feature.titleColor }]}>
                {feature.title}
              </Text>

            </TouchableOpacity>
          ))}
        </View>

        {/* Petit espace avant la tabBar native */}
        <View style={styles.bottomSpace} />

      </ScrollView>

      {/* ==================================================
          DRAWER
          IMPORTANT :
          aucune bottom navigation ici.
          Expo Router gère la tabBar.
      ================================================== */}

      <AppDrawer
        visible={drawerVisible}
        onClose={() => setDrawerVisible(false)}
        selectedVersion={selectedVersion}
        setSelectedVersion={handleVersionChange}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },

  header: {
    height: 100,
    width: '100%',
    backgroundColor: '#c7ba9d',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 14,
    paddingTop: 20,
  },

  headerButton: {
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },

  logo: {
    fontFamily: 'serif',
    fontSize: 25,
    fontWeight: '700',
    color: '#233A59',
  },

  // ======================================================
  // HEADER
  // ======================================================

 
 

  headerGreeting: {
    flex: 1,
    justifyContent: 'center',
  },

  greetingTitle: {
    fontSize: 25,
    fontWeight: '700',
    color: '#1F2937',
    letterSpacing: -0.6,
  },

  greetingSubtitle: {
    fontSize: 13,
    color: '#8A8F98',
    marginTop: 4,
    fontWeight: '400',
  },

 



  // ======================================================
  // SCROLL
  // ======================================================

  scrollView: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },

  scrollContent: {
    paddingHorizontal: 12,
    paddingTop: 13,
    paddingBottom: 0,
  },

  // ======================================================
  // VERSET
  // ======================================================

  verseCard: {
     width: '100%',
    minHeight: 300,
    borderRadius: 24,
    overflow: 'hidden',
    marginBottom: 13,
    marginTop: 9,
  },

  verseBackground: {
    flex: 1,
  },

  verseImage: {
    borderRadius: 24,
  },

  verseGradient: {
    flex: 1,
    justifyContent: 'flex-end',
  },

  verseContent: {
    flex: 1,
  justifyContent: 'flex-end',
  padding: 22,
  paddingTop: 40,
  paddingBottom: 24,
  },

  verseLabel: {
    color: '#D4AF37',
    fontSize: 8,
    lineHeight: 10,
    fontWeight: '700',
    letterSpacing: 0.9,
  },
  verseLabelRow: { flexDirection: 'row', alignItems: 'center', gap: 5, marginBottom: 10 },

  verseText: {
    color: '#FFFFFF',
    fontFamily: 'serif',
    fontSize: 22,
    lineHeight: 27,
    fontWeight: '700',
    marginBottom: 12,
  },

  verseReference: {
    color: '#D4AF37',
    fontSize: 9,
    lineHeight: 11,
    fontWeight: '600',
  },

  // ======================================================
  // CARTES
  // ======================================================

  featuresGrid: {
    width: '100%',
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },

  featureCard: {
    width: '48.4%',
    height: 160,
    borderRadius: 18,
    paddingHorizontal: 13,
    paddingTop: 11,
    marginBottom: 8,
  },

  featureIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 6,
  },

  featureTitle: {
    color: '#173456',
    fontFamily: 'serif',
    fontSize: 14,
    lineHeight: 20,
    fontWeight: '700',
  },

  featureSubtitle: {
    color: '#173456',
    fontFamily: 'serif',
    fontSize: 14,
    lineHeight: 20,
    fontWeight: '400',
  },

  bottomSpace: {
    height: 10,
  },
});
