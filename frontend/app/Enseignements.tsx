import React, { useCallback, useMemo } from 'react';
import { Alert, Dimensions, ImageBackground, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import * as WebBrowser from 'expo-web-browser';
import { SacredPage } from '@/components/sacred/SacredPage';
import { sacredColors } from '@/constants/sacredTheme';

const { height: screenHeight } = Dimensions.get('window');
const videoCardHeight = Math.min(Math.max(screenHeight * 0.25, 190), 260);

type VideoItem = {
  id: string;
  title: string;
  speaker: string;
  duration: string;
  image: number;
  url: string;
};

export default function EnseignementsScreen() {
  const videos: VideoItem[] = useMemo(
    () => [
      {
        id: 'video-1',
        title: 'Marcher avec foi',
        speaker: 'Croire & Obéir',
        duration: '10 min',
        image: require('../assets/Dimage.jpg'),
        url: 'https://www.youtube.com/watch?v=ysz5S6PUM-U',
      },
      {
        id: 'video-2',
        title: 'Demeurer dans la Parole',
        speaker: 'Croire & Obéir',
        duration: '8 min',
        image: require('../assets/Timage.jpg'),
        url: 'https://www.youtube.com/watch?v=jNQXAC9IVRw',
      },
    ],
    []
  );

  const openVideo = useCallback(async (item: VideoItem) => {
    try {
      await WebBrowser.openBrowserAsync(item.url);
    } catch {
      Alert.alert('Erreur', "Impossible d'ouvrir la vidéo.");
    }
  }, []);

  return (
    <SacredPage activeTab="library">
      <Text style={styles.title}>Vidéos Sacrées</Text>
      <Text style={styles.subtitle}>Des enseignements courts pour nourrir la semaine.</Text>

      {videos.map((video) => (
        <TouchableOpacity
          key={video.id}
          activeOpacity={0.86}
          onPress={() => openVideo(video)}
          style={styles.videoCard}
        >
          <ImageBackground
            source={video.image}
            resizeMode="cover"
            style={styles.videoImage}
            imageStyle={styles.videoImageRadius}
          >
            <LinearGradient
              colors={['rgba(5,19,44,0.12)', 'rgba(2,36,90,0.78)']}
              style={styles.videoOverlay}
            >
              <View style={styles.playCircle}>
                <Ionicons name="play" size={20} color={sacredColors.navy} />
              </View>
              <Text style={styles.videoTitle}>{video.title}</Text>
              <Text style={styles.videoMeta}>
                {video.speaker} · {video.duration}
              </Text>
            </LinearGradient>
          </ImageBackground>
        </TouchableOpacity>
      ))}
    </SacredPage>
  );
}

const styles = StyleSheet.create({
  title: {
    color: sacredColors.navy,
    fontFamily: 'serif',
    fontSize: 25,
    fontStyle: 'italic',
    fontWeight: '800',
    marginBottom: 4,
  },
  subtitle: {
    color: '#5A6378',
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 18,
  },
  videoCard: {
    height: videoCardHeight,
    borderRadius: 12,
    marginBottom: 18,
    overflow: 'hidden',
  },
  videoImage: {
    flex: 1,
  },
  videoImageRadius: {
    borderRadius: 12,
  },
  videoOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
    padding: 20,
  },
  playCircle: {
    position: 'absolute',
    right: 16,
    top: 16,
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: sacredColors.white,
    alignItems: 'center',
    justifyContent: 'center',
  },
  videoTitle: {
    color: sacredColors.white,
    fontFamily: 'serif',
    fontSize: 24,
    fontWeight: '800',
  },
  videoMeta: {
    color: '#D8E0EF',
    fontSize: 12,
    fontWeight: '800',
    marginTop: 6,
  },
});
