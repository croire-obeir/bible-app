import React, { useCallback, useMemo } from 'react';
import { Alert, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as WebBrowser from 'expo-web-browser';
import { SacredPage } from '@/components/sacred/SacredPage';
import { sacredColors } from '@/constants/sacredTheme';

type AudioItem = {
  id: string;
  title: string;
  author: string;
  duration: string;
  url: string;
};

export default function AudiosScreen() {
  const audios: AudioItem[] = useMemo(
    () => [
      {
        id: 'sample-audio-1',
        title: 'Méditation du matin',
        author: 'Croire & Obéir',
        duration: '30 min',
        url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3',
      },
      {
        id: 'sample-audio-2',
        title: 'Prière et confiance',
        author: 'Croire & Obéir',
        duration: '20 min',
        url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3',
      },
    ],
    []
  );

  const openAudio = useCallback(async (item: AudioItem) => {
    try {
      await WebBrowser.openBrowserAsync(item.url);
    } catch {
      Alert.alert('Erreur', "Impossible d'ouvrir l'audio.");
    }
  }, []);

  return (
    <SacredPage activeTab="library">
      <Text style={styles.title}>Enseignements Audio</Text>
      <Text style={styles.subtitle}>Écouter, méditer, reprendre souffle.</Text>

      {audios.map((audio) => (
        <TouchableOpacity
          key={audio.id}
          activeOpacity={0.86}
          onPress={() => openAudio(audio)}
          style={styles.itemCard}
        >
          <View style={styles.iconWrap}>
            <Ionicons name="headset" size={24} color={sacredColors.navy} />
          </View>
          <View style={styles.textWrap}>
            <Text style={styles.itemTitle}>{audio.title}</Text>
            <Text style={styles.itemMeta}>
              {audio.author} · {audio.duration}
            </Text>
          </View>
          <View style={styles.playButton}>
            <Ionicons name="play" size={17} color={sacredColors.white} />
          </View>
        </TouchableOpacity>
      ))}
    </SacredPage>
  );
}

const styles = StyleSheet.create({
  title: {
    color: sacredColors.navy,
    fontFamily: 'serif',
    fontSize: 29,
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
  itemCard: {
    minHeight: 88,
    backgroundColor: '#F1F0EF',
    borderRadius: 10,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    paddingHorizontal: 16,
    paddingVertical: 15,
  },
  iconWrap: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: sacredColors.white,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  textWrap: {
    flex: 1,
  },
  itemTitle: {
    color: sacredColors.navy,
    fontFamily: 'serif',
    fontSize: 20,
    fontWeight: '700',
  },
  itemMeta: {
    color: '#6F7788',
    fontSize: 12,
    fontWeight: '700',
    marginTop: 4,
  },
  playButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: sacredColors.navy,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
