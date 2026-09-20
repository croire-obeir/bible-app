import React, { useCallback, useMemo, useState } from 'react';
import { View, Text, StyleSheet, ImageBackground, SafeAreaView, ScrollView, TouchableOpacity, Alert, TextInput } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTabBarScroll } from '../../../components/tab-bar-visibility';
import * as WebBrowser from 'expo-web-browser';
import AppDrawer from '../../../components/AppDrawer';
import Header from '../../../components/CustomHeader';

type VideoItem = {
  id: string;
  title: string;
  speaker?: string;
  duration?: string;
  url: string;
};

export default function VideosScreen() {
  const handleTabBarScroll = useTabBarScroll();
  const [drawerVisible, setDrawerVisible] = useState(false);
  const videos: VideoItem[] = useMemo(
    () => [
      {
        id: 'video-1',
        title: 'Enseignement (YouTube) - Test',
        speaker: 'Temporaire',
        duration: '10:00',
        url: 'https://www.youtube.com/watch?v=ysz5S6PUM-U',
      },
      {
        id: 'video-2',
        title: 'Enseignement (YouTube) - Test #2',
        speaker: 'Temporaire',
        duration: '08:00',
        url: 'https://www.youtube.com/watch?v=jNQXAC9IVRw',
      },
    ],
    []
  );

  const openVideo = useCallback(async (item: VideoItem) => {
    try {
      await WebBrowser.openBrowserAsync(item.url);
    } catch (e) {
      Alert.alert('Erreur', "Impossible d'ouvrir la vidéo.");
    }
  }, []);

  return (
    <View style={styles.container}>
      <ImageBackground source={require('../../../assets/enregistrement.png')} style={styles.bg} imageStyle={{ opacity: 0.04 }}>
        {/* <SafeAreaView style={styles.header}>
          <TouchableOpacity onPress={() => setDrawerVisible(true)}><Ionicons name="menu" size={20} color="#0a2d55" /></TouchableOpacity>
          <Text style={styles.headerTitle}>Croire & Obéir</Text>
          <Ionicons name="search" size={19} color="#0a2d55" />
        </SafeAreaView> */}

        <Header
          title="Vidéos Sacrées"
        />

        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false} onScroll={handleTabBarScroll} scrollEventThrottle={16}>
          <Text style={styles.pageTitle}>Vidéos Sacrées</Text>
          <Text style={styles.intro}>Une collection éditoriale d&apos;enseignements visuels et de séries documentaires pour approfondir votre foi.</Text>
          <View style={styles.searchBox}><Ionicons name="search" size={15} color="#8a99ad" /><TextInput placeholder="Rechercher une vidéo..." placeholderTextColor="#9aa3b3" style={styles.searchInput} /></View>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filters}>
            {['Tout Parcourir', 'Nouve', 'Série', 'Enseign'].map((filter, index) => <View key={filter} style={[styles.filter, index === 0 && styles.activeFilter]}><Text style={[styles.filterText, index === 0 && styles.activeFilterText]}>{filter}</Text></View>)}
          </ScrollView>

          <TouchableOpacity style={styles.featuredCard} activeOpacity={0.9} onPress={() => openVideo(videos[0])}>
            <ImageBackground source={require('../../../assets/bible.jpg')} style={styles.featuredImage} imageStyle={styles.roundedImage}>
              <View style={styles.featuredOverlay}><Text style={styles.featuredTitle}>Psaumes: Un Voyage{`\n`}Poétique</Text><View style={styles.playRow}><View style={styles.playButton}><Ionicons name="play" size={17} color="#0a2d55" /></View><View><Text style={styles.watchText}>Regarder maintenant</Text><Text style={styles.metaText}>45 min • Documentaire</Text></View></View></View>
            </ImageBackground>
          </TouchableOpacity>
          <View style={styles.sectionRow}><Text style={styles.sectionTitle}>Ajouts Récents</Text><Text style={styles.seeAll}>Voir tout →</Text></View>

          {videos.map((v) => (
            <TouchableOpacity key={v.id} style={styles.itemCard} activeOpacity={0.85} onPress={() => openVideo(v)}>
              <View style={styles.left}>
                <ImageBackground source={require('../../../assets/pimage.jpg')} style={styles.thumb} imageStyle={styles.thumbImage}><View style={styles.thumbPlay}><Ionicons name="play" size={11} color="#fff" /></View></ImageBackground>
                <View style={styles.textWrap}>
                  <Text style={styles.itemTitle}>{v.title}</Text>
                  <Text style={styles.itemMeta}>{[v.speaker, v.duration].filter(Boolean).join(' • ')}</Text>
                </View>
              </View>
              <Ionicons name="open-outline" size={18} color="#D4AF37" />
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
  header: { height: 100, backgroundColor: '#c7ba9d', paddingHorizontal: 14, paddingTop: 20, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  headerTitle: { color: '#233A59', fontFamily: 'serif', fontStyle: 'normal', fontSize: 25, fontWeight: '700' },
  scrollContent: { paddingHorizontal: 12, paddingTop: 13, paddingBottom: 160 },
  pageTitle: { fontFamily: 'serif', fontSize: 30, fontWeight: '700', color: '#0a2d55', marginTop: 10, marginBottom: 8 },
  intro: { color: '#687080', fontSize: 13, lineHeight: 19, marginBottom: 16 },
  searchBox: { height: 46, borderRadius: 23, backgroundColor: '#f7f7f8', flexDirection: 'row', alignItems: 'center', paddingHorizontal: 15, gap: 9 },
  searchInput: { flex: 1, fontSize: 13, color: '#334155' },
  filters: { gap: 8, paddingVertical: 14 },
  filter: { paddingHorizontal: 16, height: 32, borderRadius: 16, justifyContent: 'center', backgroundColor: '#fff' },
  activeFilter: { backgroundColor: '#092d6b', elevation: 2 }, filterText: { fontSize: 11, color: '#727887' }, activeFilterText: { color: '#fff' },
  featuredCard: { height: 260, borderRadius: 18, overflow: 'hidden', marginBottom: 23 }, featuredImage: { flex: 1 }, roundedImage: { borderRadius: 18 }, featuredOverlay: { flex: 1, padding: 21, justifyContent: 'space-between', backgroundColor: 'rgba(4,28,65,.30)' }, featuredTitle: { color: '#fff', fontFamily: 'serif', fontSize: 25, lineHeight: 30, fontWeight: '700' }, playRow: { flexDirection: 'row', alignItems: 'center', gap: 12 }, playButton: { width: 48, height: 48, borderRadius: 24, backgroundColor: '#e0bc00', alignItems: 'center', justifyContent: 'center' }, watchText: { color: '#fff', fontWeight: '700', fontSize: 14 }, metaText: { color: '#d7deea', fontSize: 11, marginTop: 3 },
  sectionRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }, sectionTitle: { fontFamily: 'serif', fontSize: 20, color: '#0a2d55', marginBottom: 14 }, seeAll: { color: '#71809a', fontSize: 11 },
  itemCard: { backgroundColor: '#fff', borderRadius: 18, padding: 14, marginBottom: 10, borderWidth: 1, borderColor: '#edf0f4', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', elevation: 1 },
  left: { flexDirection: 'row', alignItems: 'center', gap: 12, flex: 1, paddingRight: 10 },
  thumb: { width: 64, height: 46, borderRadius: 6, overflow: 'hidden', justifyContent: 'center', alignItems: 'center' }, thumbImage: { borderRadius: 6 }, thumbPlay: { width: 24, height: 24, borderRadius: 12, backgroundColor: '#092d6b', alignItems: 'center', justifyContent: 'center' },
  textWrap: { flex: 1 },
  itemTitle: { fontSize: 14, fontWeight: '700', color: '#0a2d55' }, itemMeta: { marginTop: 4, fontSize: 11, color: '#8a92a1' }, bottomPadding: { height: 20 },
});
