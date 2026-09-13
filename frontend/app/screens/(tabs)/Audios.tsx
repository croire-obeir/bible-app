import React, { useCallback, useMemo, useState } from 'react';
import { View, Text, StyleSheet, ImageBackground, SafeAreaView, ScrollView, TouchableOpacity, Alert, TextInput } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as WebBrowser from 'expo-web-browser';
import AppDrawer from '../../../components/AppDrawer';
import Header from '../../../components/CustomHeader';

type AudioItem = {
  id: string;
  title: string;
  author?: string;
  duration?: string;
  url: string;
};

export default function AudiosScreen() {
  const [drawerVisible, setDrawerVisible] = useState(false);
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
      <ImageBackground source={require('../../../assets/enregistrement.png')} style={styles.bg} imageStyle={{ opacity: 0.05 }}>
        {/* <SafeAreaView style={styles.header}>
          <TouchableOpacity onPress={() => setDrawerVisible(true)}><Ionicons name="menu" size={20} color="#0a2d55" /></TouchableOpacity>
          <Text style={styles.headerTitle}>Croire & Obéir</Text>
          <Ionicons name="search" size={19} color="#0a2d55" />
        </SafeAreaView> */}
        <Header
          title="Enseignements Audio"
        />

        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          <Text style={styles.pageTitle}>Enseignements Audio</Text>
          <Text style={styles.intro}>Plongez dans les enseignements profonds de la Parole à travers nos archives audio.</Text>
          <View style={styles.searchBox}><Ionicons name="search" size={15} color="#8a99ad" /><TextInput placeholder="Rechercher un sermon, un auteur..." placeholderTextColor="#9aa3b3" style={styles.searchInput} /></View>
          <View style={styles.filters}>{['Tous', 'Sermons', 'Méditations'].map((filter, index) => <View key={filter} style={[styles.filter, index === 0 && styles.activeFilter]}><Text style={[styles.filterText, index === 0 && styles.activeFilterText]}>{filter}</Text></View>)}</View>
          <ImageBackground source={require('../../../assets/bible.jpg')} style={styles.featuredCard} imageStyle={styles.roundedImage}>
            <View style={styles.featuredOverlay}><View style={styles.featuredPlay}><Ionicons name="play" size={18} color="#0a2d55" /></View><Text style={styles.featuredLabel}>EN VEDETTE</Text><Text style={styles.featuredTitle}>La Parole du dimanche</Text><Text style={styles.featuredText}>Une exploration profonde des textes anciens concernant la foi.</Text><Text style={styles.featuredMeta}>Dr. Jean Calvin  •  45:20</Text></View>
          </ImageBackground>
          <Text style={styles.collectionTitle}>Récentes</Text>

          {audios.map((a) => (
            <TouchableOpacity key={a.id} style={styles.itemCard} activeOpacity={0.85} onPress={() => openAudio(a)}>
              <View style={styles.left}>
                <View style={styles.iconWrap}><Ionicons name="volume-high-outline" size={19} color="#0a2d55" /></View>
                <View style={styles.textWrap}>
                  <Text style={styles.itemTitle}>{a.title}</Text>
                  <Text style={styles.itemMeta}>{[a.author, a.duration].filter(Boolean).join(' • ')}</Text>
                </View>
              </View>
              <Ionicons name="play" size={18} color="#D4AF37" />
            </TouchableOpacity>
          ))}

          <View style={styles.bottomPadding} />
        </ScrollView>
      </ImageBackground>
      <AppDrawer visible={drawerVisible} onClose={() => setDrawerVisible(false)} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  bg: { flex: 1 },
  header: { height: 100, backgroundColor: '#c7ba9d', paddingHorizontal: 14, paddingTop: 20, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }, headerTitle: { color: '#233A59', fontFamily: 'serif', fontStyle: 'italic', fontSize: 25, fontWeight: '400' }, scrollContent: { paddingHorizontal: 12, paddingTop: 13, paddingBottom: 160 }, pageTitle: { fontFamily: 'serif', fontSize: 30, color: '#0a2d55', marginTop: 10, marginBottom: 8 }, intro: { color: '#687080', fontSize: 13, lineHeight: 19, marginBottom: 16 }, searchBox: { height: 46, borderRadius: 23, backgroundColor: '#f7f7f8', flexDirection: 'row', alignItems: 'center', paddingHorizontal: 15, gap: 9 }, searchInput: { flex: 1, fontSize: 13 }, filters: { flexDirection: 'row', gap: 8, paddingVertical: 14 }, filter: { paddingHorizontal: 17, height: 32, borderRadius: 16, justifyContent: 'center', backgroundColor: '#fff' }, activeFilter: { backgroundColor: '#092d6b' }, filterText: { fontSize: 11, color: '#727887' }, activeFilterText: { color: '#fff' }, featuredCard: { height: 350, borderRadius: 18, overflow: 'hidden', marginBottom: 23 }, roundedImage: { borderRadius: 18 }, featuredOverlay: { flex: 1, padding: 21, justifyContent: 'flex-end', backgroundColor: 'rgba(4,28,65,.35)' }, featuredPlay: { position: 'absolute', top: 21, left: 21, width: 48, height: 48, borderRadius: 24, backgroundColor: '#fff', justifyContent: 'center', alignItems: 'center' }, featuredLabel: { color: '#f4d43d', fontSize: 11, fontWeight: '800', marginBottom: 8 }, featuredTitle: { color: '#fff', fontFamily: 'serif', fontSize: 25, fontWeight: '700' }, featuredText: { color: '#fff', fontSize: 14, lineHeight: 21, marginTop: 7 }, featuredMeta: { color: '#dbe4f4', fontSize: 11, marginTop: 16 }, collectionTitle: { color: '#0a2d55', fontFamily: 'serif', fontSize: 20, marginBottom: 12 }, itemCard: { backgroundColor: '#fff', borderRadius: 18, padding: 14, marginBottom: 10, borderWidth: 1, borderColor: '#edf0f4', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', elevation: 1 }, left: { flexDirection: 'row', alignItems: 'center', gap: 12, flex: 1, paddingRight: 10 },
  iconWrap: { width: 44, height: 44, borderRadius: 22, backgroundColor: '#e7edf7', justifyContent: 'center', alignItems: 'center' }, textWrap: { flex: 1 }, itemTitle: { fontSize: 14, fontWeight: '700', color: '#0a2d55' }, itemMeta: { marginTop: 4, fontSize: 11, color: '#8a92a1' }, bottomPadding: { height: 20 },
});
