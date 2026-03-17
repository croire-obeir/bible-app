import React, { useCallback, useMemo } from 'react';
import { View, Text, StyleSheet, ImageBackground, SafeAreaView, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as WebBrowser from 'expo-web-browser';

type AudioItem = {
  id: string;
  title: string;
  author?: string;
  duration?: string;
  url: string;
};

export default function AudiosScreen() {
  const audios: AudioItem[] = useMemo(
    () => [
      {
        id: 'sample-audio-1',
        title: 'Audio de test (MP3)',
        author: 'Temporaire',
        duration: '00:30',
        url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3',
      },
      {
        id: 'sample-audio-2',
        title: 'Audio de test (MP3) #2',
        author: 'Temporaire',
        duration: '00:20',
        url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3',
      },
    ],
    []
  );

  const openAudio = useCallback(async (item: AudioItem) => {
    try {
      await WebBrowser.openBrowserAsync(item.url);
    } catch (e) {
      Alert.alert('Erreur', "Impossible d'ouvrir l'audio.");
    }
  }, []);

  return (
    <View style={styles.container}>
      <ImageBackground source={require('../assets/enregistrement.png')} style={styles.bg} imageStyle={{ opacity: 0.05 }}>
        <SafeAreaView style={styles.header}>
          <Text style={styles.headerTitle}>Audios</Text>
        </SafeAreaView>

        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          <Text style={styles.sectionTitle}>Liste</Text>

          {audios.map((a) => (
            <TouchableOpacity key={a.id} style={styles.itemCard} activeOpacity={0.85} onPress={() => openAudio(a)}>
              <View style={styles.left}>
                <View style={styles.iconWrap}>
                  <Ionicons name="volume-high-outline" size={22} color="#1565c0" />
                </View>
                <View style={styles.textWrap}>
                  <Text style={styles.itemTitle}>{a.title}</Text>
                  <Text style={styles.itemMeta}>{[a.author, a.duration].filter(Boolean).join(' • ')}</Text>
                </View>
              </View>
              <Ionicons name="play" size={18} color="#D4AF37" />
            </TouchableOpacity>
          ))}

          <View style={styles.tipCard}>
            <Ionicons name="information-circle-outline" size={18} color="#D4AF37" />
            <Text style={styles.tipText}>
              Pour le moment, les audios sont temporaires et s'ouvrent dans le navigateur pour tester l'écoute.
            </Text>
          </View>

          <View style={styles.bottomPadding} />
        </ScrollView>
      </ImageBackground>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5' },
  bg: { flex: 1 },
  header: { backgroundColor: '#0a2d55', paddingVertical: 20, alignItems: 'center' },
  headerTitle: { color: '#fff', fontSize: 20, fontWeight: '700', letterSpacing: 1 },
  scrollContent: { padding: 20 },
  sectionTitle: { fontSize: 16, fontWeight: '800', color: '#0a2d55', marginBottom: 12 },
  itemCard: {
    backgroundColor: '#fff',
    borderRadius: 14,
    padding: 16,
    marginBottom: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#1565c0',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 2,
  },
  left: { flexDirection: 'row', alignItems: 'center', gap: 12, flex: 1, paddingRight: 10 },
  iconWrap: {
    width: 42,
    height: 42,
    borderRadius: 12,
    backgroundColor: 'rgba(21,101,192,0.12)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  textWrap: { flex: 1 },
  itemTitle: { fontSize: 14, fontWeight: '800', color: '#0a2d55' },
  itemMeta: { marginTop: 4, fontSize: 12, color: '#777', fontWeight: '600' },
  tipCard: {
    marginTop: 8,
    backgroundColor: '#fff',
    borderRadius: 14,
    padding: 14,
    flexDirection: 'row',
    gap: 10,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(212,175,55,0.25)',
  },
  tipText: { flex: 1, color: '#333', fontWeight: '500', lineHeight: 18 },
  bottomPadding: { height: 20 },
});
