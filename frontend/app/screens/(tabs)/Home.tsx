import React, { ComponentProps, useEffect, useMemo, useState } from 'react';
import {
  Dimensions,
  ImageBackground,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { Href, useRouter } from 'expo-router';
import { SacredPage } from '@/components/sacred/SacredPage';
import { sacredColors, sacredShadow } from '@/constants/sacredTheme';
import { BibleVerse, fetchDailyVerse } from '@/api/services/bibleServices';

const { height: screenHeight } = Dimensions.get('window');
const heroHeight = Math.min(Math.max(screenHeight * 0.31, 240), 320);

type IconName = ComponentProps<typeof Ionicons>['name'];

type Feature = {
  title: string;
  subtitle: string;
  icon: IconName;
  route: Href;
  tone: 'light' | 'sage' | 'stone' | 'taupe';
};

const fallbackVerse: BibleVerse = {
  versionId: 1,
  bookId: 6,
  bookName: 'Josué',
  shortName: 'Jos',
  chapter: 1,
  verseNum: 8,
  text: "Que ce livre de la loi ne s'éloigne point de ta bouche; médite-le jour et nuit.",
  canonicalId: 6001008,
};

export default function HomeScreen() {
  const router = useRouter();
  const [dailyVerse, setDailyVerse] = useState<BibleVerse>(fallbackVerse);

  useEffect(() => {
    let mounted = true;

    fetchDailyVerse()
      .then((verse) => {
        if (mounted && verse) {
          setDailyVerse(verse);
        }
      })
      .catch(() => {
        setDailyVerse(fallbackVerse);
      });

    return () => {
      mounted = false;
    };
  }, []);

  const features = useMemo<Feature[]>(
    () => [
      {
        title: 'La Bible',
        subtitle: 'Lire',
        icon: 'book',
        route: '/Bible' as Href,
        tone: 'light',
      },
      {
        title: 'Enseignements',
        subtitle: 'Audio',
        icon: 'headset',
        route: '/Audios' as Href,
        tone: 'sage',
      },
      {
        title: 'Vidéos',
        subtitle: 'Sacrées',
        icon: 'play-circle',
        route: '/Enseignements' as Href,
        tone: 'stone',
      },
      {
        title: 'Documents',
        subtitle: 'PDF',
        icon: 'folder-open-outline',
        route: '/Documents' as Href,
        tone: 'taupe',
      },
    ],
    []
  );

  const openShare = () => {
    router.push({
      pathname: '/ShareVerse',
      params: {
        bookName: dailyVerse.bookName,
        chapter: String(dailyVerse.chapter),
        verseNum: String(dailyVerse.verseNum),
        text: dailyVerse.text,
      },
    } as Href);
  };

  return (
    <SacredPage activeTab="home">
      <TouchableOpacity activeOpacity={0.9} onPress={openShare} style={styles.hero}>
        <ImageBackground
          source={require('../../../assets/bible.cross_.webp')}
          resizeMode="cover"
          style={styles.heroImage}
          imageStyle={styles.heroImageRadius}
        >
          <LinearGradient
            colors={['rgba(5,16,38,0.18)', 'rgba(5,36,90,0.9)']}
            style={styles.heroOverlay}
          >
            <Text style={styles.kicker}>· VERSET DU JOUR</Text>
            <Text style={styles.heroText} numberOfLines={5}>
              {`"${dailyVerse.text}"`}
            </Text>
            <Text style={styles.heroRef}>
              {dailyVerse.bookName} {dailyVerse.chapter}: {dailyVerse.verseNum}
            </Text>
          </LinearGradient>
        </ImageBackground>
      </TouchableOpacity>

      <View style={styles.featureGrid}>
        {features.map((feature) => (
          <TouchableOpacity
            key={feature.title}
            activeOpacity={0.82}
            onPress={() => router.push(feature.route)}
            style={[styles.featureCard, cardToneStyles[feature.tone]]}
          >
            <View style={styles.decorOne} />
            <View style={styles.decorTwo} />
            <View style={styles.featureIcon}>
              <Ionicons name={feature.icon} size={22} color={sacredColors.navy} />
            </View>
            <Text style={styles.featureTitle}>{feature.title}</Text>
            <Text style={styles.featureSubtitle}>{feature.subtitle}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </SacredPage>
  );
}

const styles = StyleSheet.create({
  hero: {
    ...sacredShadow,
    height: heroHeight,
    borderRadius: 22,
    marginBottom: 22,
    overflow: 'hidden',
  },
  heroImage: {
    flex: 1,
  },
  heroImageRadius: {
    borderRadius: 22,
  },
  heroOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
    padding: 24,
  },
  kicker: {
    color: '#E6D170',
    fontSize: 11,
    fontWeight: '900',
    marginBottom: 10,
  },
  heroText: {
    color: sacredColors.white,
    fontFamily: 'serif',
    fontSize: 24,
    lineHeight: 31,
  },
  heroRef: {
    color: '#9FB4D8',
    fontSize: 12,
    fontWeight: '700',
    marginTop: 12,
  },
  featureGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  featureCard: {
    width: '48%',
    height: 126,
    borderRadius: 10,
    justifyContent: 'flex-end',
    overflow: 'hidden',
    padding: 14,
  },
  lightCard: {
    backgroundColor: '#FBFAEE',
  },
  sageCard: {
    backgroundColor: '#D3D1BF',
  },
  stoneCard: {
    backgroundColor: '#C9C6B4',
  },
  taupeCard: {
    backgroundColor: '#C4B6A7',
  },
  decorOne: {
    position: 'absolute',
    right: -12,
    top: -10,
    width: 62,
    height: 92,
    backgroundColor: 'rgba(255,255,255,0.36)',
    transform: [{ rotate: '38deg' }],
  },
  decorTwo: {
    position: 'absolute',
    right: 4,
    top: 8,
    width: 46,
    height: 72,
    backgroundColor: 'rgba(255,255,255,0.24)',
    transform: [{ rotate: '38deg' }],
  },
  featureIcon: {
    position: 'absolute',
    left: 14,
    top: 16,
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: sacredColors.white,
    alignItems: 'center',
    justifyContent: 'center',
  },
  featureTitle: {
    color: sacredColors.navy,
    fontFamily: 'serif',
    fontSize: 18,
    lineHeight: 22,
  },
  featureSubtitle: {
    color: '#1E2A3B',
    fontFamily: 'serif',
    fontSize: 14,
    lineHeight: 18,
  },
});

const cardToneStyles = {
  light: styles.lightCard,
  sage: styles.sageCard,
  stone: styles.stoneCard,
  taupe: styles.taupeCard,
};
