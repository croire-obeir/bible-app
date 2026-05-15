import React, { useMemo, useState } from 'react';
import {
  Alert,
  Dimensions,
  ImageBackground,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { SacredBottomNav } from '@/components/sacred/SacredBottomNav';
import { sacredColors, sacredShadow } from '@/constants/sacredTheme';

const { height: screenHeight } = Dimensions.get('window');
const previewHeight = Math.min(Math.max(screenHeight * 0.46, 340), 470);

const backgrounds = [
  require('../assets/bible.cross_.webp'),
  require('../assets/Timage.jpg'),
  require('../assets/bible.jpg'),
  require('../assets/pimage.jpg'),
];

function first(value: string | string[] | undefined, fallback: string) {
  if (Array.isArray(value)) {
    return value[0] ?? fallback;
  }

  return value ?? fallback;
}

export default function ShareVerseScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams<{
    bookName?: string;
    chapter?: string;
    verseNum?: string;
    text?: string;
  }>();
  const [backgroundIndex, setBackgroundIndex] = useState(0);
  const [align, setAlign] = useState<'left' | 'center' | 'right'>('center');
  const [serif, setSerif] = useState(true);

  const verse = useMemo(
    () => ({
      bookName: first(params.bookName, 'Jérémie'),
      chapter: first(params.chapter, '29'),
      verseNum: first(params.verseNum, '11'),
      text: first(
        params.text,
        "Car je connais les projets que j'ai formés sur vous, dit l'Éternel, projets de paix et non de malheur."
      ),
    }),
    [params.bookName, params.chapter, params.text, params.verseNum]
  );

  return (
    <View style={styles.root}>
      <View style={[styles.header, { height: 58 + insets.top, paddingTop: insets.top }]}>
        <TouchableOpacity
          accessibilityLabel="Fermer"
          onPress={() => router.back()}
          style={styles.headerButton}
        >
          <Ionicons name="close" size={24} color={sacredColors.navy} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Sacred Scripture</Text>
        <TouchableOpacity accessibilityLabel="Options" style={styles.headerButton}>
          <Ionicons name="ellipsis-vertical" size={23} color={sacredColors.navy} />
        </TouchableOpacity>
      </View>

      <View style={[styles.content, { paddingBottom: 108 + insets.bottom }]}>
        <ImageBackground
          source={backgrounds[backgroundIndex]}
          resizeMode="cover"
          style={styles.preview}
          imageStyle={styles.previewImage}
        >
          <LinearGradient
            colors={['rgba(3,12,28,0.15)', 'rgba(2,28,70,0.72)']}
            style={styles.previewOverlay}
          >
            <Text
              style={[
                styles.previewText,
                { textAlign: align, fontFamily: serif ? 'serif' : undefined },
              ]}
            >
              {`"${verse.text}"`}
            </Text>
            <Text style={[styles.previewRef, { textAlign: align }]}>
              {verse.bookName.toUpperCase()} {verse.chapter}:{verse.verseNum}
            </Text>
          </LinearGradient>
        </ImageBackground>

        <View style={styles.panel}>
          <Text style={styles.panelLabel}>BACKGROUND</Text>
          <View style={styles.swatches}>
            {backgrounds.map((bg, index) => (
              <TouchableOpacity
                key={index}
                activeOpacity={0.8}
                onPress={() => setBackgroundIndex(index)}
                style={[styles.swatch, backgroundIndex === index && styles.swatchActive]}
              >
                <ImageBackground source={bg} style={styles.swatchImage} imageStyle={styles.swatchImage} />
              </TouchableOpacity>
            ))}
            <TouchableOpacity style={styles.addSwatch}>
              <Ionicons name="add" size={16} color="#7B8191" />
            </TouchableOpacity>
          </View>

          <View style={styles.controlsRow}>
            <View>
              <Text style={styles.panelLabel}>TYPOGRAPHY</Text>
              <View style={styles.segmentControl}>
                <TouchableOpacity
                  onPress={() => setSerif(true)}
                  style={[styles.controlButton, serif && styles.controlButtonActive]}
                >
                  <Text style={styles.controlText}>A</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => setSerif(false)}
                  style={[styles.controlButton, !serif && styles.controlButtonActive]}
                >
                  <Text style={[styles.controlText, styles.sansText]}>A</Text>
                </TouchableOpacity>
              </View>
            </View>

            <View>
              <Text style={styles.panelLabel}>ALIGNMENT</Text>
              <View style={styles.segmentControl}>
                {(['left', 'center', 'right'] as const).map((item) => (
                  <TouchableOpacity
                    key={item}
                    onPress={() => setAlign(item)}
                    style={[styles.alignButton, align === item && styles.controlButtonActive]}
                  >
                    <Ionicons
                      name={
                        item === 'left'
                          ? 'reorder-three-outline'
                          : item === 'center'
                            ? 'menu-outline'
                            : 'reorder-four-outline'
                      }
                      size={16}
                      color={align === item ? sacredColors.navy : '#7B8191'}
                    />
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          </View>

          <TouchableOpacity
            activeOpacity={0.86}
            onPress={() => Alert.alert('Verset', 'Le partage natif sera branché ensuite.')}
            style={styles.shareButton}
          >
            <Ionicons name="share-social-outline" size={14} color={sacredColors.white} />
            <Text style={styles.shareText}>SHARE VERSE</Text>
          </TouchableOpacity>
        </View>
      </View>

      <SacredBottomNav activeTab="home" />
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: sacredColors.page,
  },
  header: {
    height: 58,
    backgroundColor: '#DAD777',
    borderBottomColor: '#C4C058',
    borderBottomWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
  },
  headerButton: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    color: sacredColors.navy,
    fontFamily: 'serif',
    fontSize: 18,
    fontStyle: 'italic',
  },
  content: {
    paddingHorizontal: 20,
    paddingTop: 18,
    paddingBottom: 108,
  },
  preview: {
    height: previewHeight,
    borderRadius: 12,
    overflow: 'hidden',
  },
  previewImage: {
    borderRadius: 12,
  },
  previewOverlay: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 26,
  },
  previewText: {
    color: sacredColors.white,
    fontSize: 28,
    lineHeight: 36,
  },
  previewRef: {
    color: '#E6D170',
    fontSize: 12,
    fontWeight: '900',
    marginTop: 18,
  },
  panel: {
    ...sacredShadow,
    backgroundColor: sacredColors.white,
    borderRadius: 8,
    marginTop: 12,
    padding: 12,
  },
  panelLabel: {
    color: '#9BA1AD',
    fontSize: 7,
    fontWeight: '900',
    marginBottom: 7,
  },
  swatches: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 12,
  },
  swatch: {
    width: 24,
    height: 24,
    borderRadius: 12,
    overflow: 'hidden',
    borderColor: 'transparent',
    borderWidth: 2,
  },
  swatchActive: {
    borderColor: sacredColors.gold,
  },
  swatchImage: {
    width: '100%',
    height: '100%',
    borderRadius: 12,
  },
  addSwatch: {
    width: 26,
    height: 26,
    borderRadius: 13,
    borderColor: '#E0E1E6',
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  controlsRow: {
    flexDirection: 'row',
    gap: 18,
    alignItems: 'flex-start',
  },
  segmentControl: {
    flexDirection: 'row',
    backgroundColor: '#F5F3F0',
    borderRadius: 6,
    padding: 3,
  },
  controlButton: {
    width: 37,
    height: 26,
    borderRadius: 5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  alignButton: {
    width: 25,
    height: 26,
    borderRadius: 5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  controlButtonActive: {
    backgroundColor: sacredColors.white,
  },
  controlText: {
    color: sacredColors.navy,
    fontFamily: 'serif',
    fontSize: 13,
    fontWeight: '700',
  },
  sansText: {
    fontFamily: undefined,
  },
  shareButton: {
    alignSelf: 'center',
    minWidth: 118,
    height: 28,
    backgroundColor: sacredColors.navy,
    borderRadius: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    marginTop: 12,
  },
  shareText: {
    color: sacredColors.white,
    fontSize: 8,
    fontWeight: '900',
  },
});
