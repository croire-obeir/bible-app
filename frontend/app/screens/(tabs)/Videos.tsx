import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Image,
  ImageBackground,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import * as WebBrowser from 'expo-web-browser';
import { useTabBarScroll } from '../../../components/tab-bar-visibility';
import Header from '../../../components/CustomHeader';
import {
  fetchMediaClasses,
  fetchMediaPage,
  getMediaErrorMessage,
  getYouTubeUrl,
  MediaItem,
} from '../../../api/services/mediaServices';

const PAGE_SIZE = 10;

function formatPublishedDate(value: string): string {
  const date = new Date(value.replace(' ', 'T'));
  if (Number.isNaN(date.getTime())) return '';
  return date.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' });
}

export default function VideosScreen() {
  const handleTabBarScroll = useTabBarScroll();
  const [classes, setClasses] = useState<string[]>([]);
  const [selectedClass, setSelectedClass] = useState('');
  const [videos, setVideos] = useState<MediaItem[]>([]);
  const [search, setSearch] = useState('');
  const [classesLoading, setClassesLoading] = useState(true);
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [classesError, setClassesError] = useState('');
  const [mediaError, setMediaError] = useState('');
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [retry, setRetry] = useState(0);

  useEffect(() => {
    let active = true;
    setClassesLoading(true);
    setClassesError('');
    fetchMediaClasses('videos')
      .then((result) => {
        if (!active) return;
        setClasses(result);
        setSelectedClass((current) => current && result.includes(current) ? current : result[0] ?? '');
      })
      .catch((error: unknown) => {
        if (active) setClassesError(getMediaErrorMessage(error, 'Impossible de récupérer les catégories.'));
      })
      .finally(() => {
        if (active) setClassesLoading(false);
      });
    return () => { active = false; };
  }, [retry]);

  useEffect(() => {
    if (!selectedClass) {
      setVideos([]);
      setPage(0);
      setTotalPages(0);
      return;
    }
    let active = true;
    setLoading(true);
    setMediaError('');
    setVideos([]);
    setPage(0);
    fetchMediaPage('videos', selectedClass, 1, PAGE_SIZE)
      .then((result) => {
        if (!active) return;
        setVideos(result.data);
        setPage(result.pagination.page);
        setTotalPages(result.pagination.totalPages);
      })
      .catch((error: unknown) => {
        if (active) setMediaError(getMediaErrorMessage(error, 'Impossible de récupérer les vidéos.'));
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => { active = false; };
  }, [selectedClass, retry]);

  const loadMore = useCallback(async () => {
    if (!selectedClass || loadingMore || loading || page >= totalPages) return;
    setLoadingMore(true);
    setMediaError('');
    try {
      const result = await fetchMediaPage('videos', selectedClass, page + 1, PAGE_SIZE);
      setVideos((current) => [...current, ...result.data]);
      setPage(result.pagination.page);
      setTotalPages(result.pagination.totalPages);
    } catch (error) {
      setMediaError(getMediaErrorMessage(error, 'Impossible de charger la suite.'));
    } finally {
      setLoadingMore(false);
    }
  }, [loading, loadingMore, page, selectedClass, totalPages]);

  const filteredVideos = useMemo(() => {
    const term = search.trim().toLocaleLowerCase('fr');
    return term ? videos.filter((video) => video.title.toLocaleLowerCase('fr').includes(term)) : videos;
  }, [search, videos]);
  const featured = filteredVideos[0];

  const openVideo = useCallback(async (item: MediaItem) => {
    try {
      await WebBrowser.openBrowserAsync(getYouTubeUrl(item.youtube_video_id));
    } catch {
      setMediaError("Impossible d'ouvrir cette vidéo.");
    }
  }, []);

  return (
    <View style={styles.container}>
      <Header title="Vidéos Sacrées" />
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        onScroll={handleTabBarScroll}
        scrollEventThrottle={16}
      >
        <View style={styles.eyebrowRow}>
          <View style={styles.eyebrowLine} />
          <Text style={styles.eyebrow}>LA MÉDIATHÈQUE</Text>
        </View>
        <Text style={styles.pageTitle}>Vidéos Sacrées</Text>
        <Text style={styles.intro}>Enseignements, témoignages et découvertes bibliques pour nourrir votre foi, à votre rythme.</Text>

        <View style={styles.searchBox}>
          <Ionicons name="search" size={18} color="#8792A3" />
          <TextInput
            value={search}
            onChangeText={setSearch}
            placeholder="Rechercher une vidéo..."
            placeholderTextColor="#98A1AF"
            style={styles.searchInput}
            returnKeyType="search"
          />
          {!!search && <TouchableOpacity onPress={() => setSearch('')} accessibilityLabel="Effacer la recherche"><Ionicons name="close-circle" size={18} color="#98A1AF" /></TouchableOpacity>}
        </View>

        <View style={styles.sectionHeading}>
          <View><Text style={styles.sectionTitle}>Explorer par thème</Text><Text style={styles.sectionCaption}>Choisissez une collection</Text></View>
          <View style={styles.headingIcon}><Ionicons name="albums-outline" size={18} color="#A88632" /></View>
        </View>
        {classesLoading ? (
          <View style={styles.inlineLoading}><ActivityIndicator color="#A88632" /><Text style={styles.mutedText}>Chargement des thèmes…</Text></View>
        ) : classesError ? (
          <View style={styles.notice}><Text style={styles.noticeText}>{classesError}</Text><TouchableOpacity onPress={() => setRetry((value) => value + 1)}><Text style={styles.retryText}>Réessayer</Text></TouchableOpacity></View>
        ) : classes.length === 0 ? (
          <View style={styles.notice}><Text style={styles.noticeText}>Aucune catégorie vidéo disponible pour le moment.</Text></View>
        ) : (
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.categoryList}>
            {classes.map((item) => {
              const active = item === selectedClass;
              return <TouchableOpacity key={item} onPress={() => setSelectedClass(item)} style={[styles.categoryChip, active && styles.categoryChipActive]} activeOpacity={0.8}><Text style={[styles.categoryText, active && styles.categoryTextActive]} numberOfLines={1}>{item}</Text>{active && <Ionicons name="checkmark-circle" size={15} color="#F4D787" />}</TouchableOpacity>;
            })}
          </ScrollView>
        )}

        {featured && !loading && (
          <TouchableOpacity activeOpacity={0.92} onPress={() => openVideo(featured)} style={styles.featuredCard}>
            <ImageBackground
              source={featured.thumbnail ? { uri: featured.thumbnail } : require('../../../assets/bible.jpg')}
              style={styles.featuredImage}
              imageStyle={styles.featuredImageRadius}
            >
              <LinearGradient colors={['rgba(8,24,48,0.02)', 'rgba(8,24,48,0.88)']} style={styles.featuredGradient}>
                <View style={styles.featuredBadge}><Ionicons name="sparkles" size={12} color="#F6D984" /><Text style={styles.featuredBadgeText}>À DÉCOUVRIR</Text></View>
                <View style={styles.featuredBottom}>
                  <Text style={styles.featuredCategory}>{featured.classification}</Text>
                  <Text style={styles.featuredTitle} numberOfLines={2}>{featured.title}</Text>
                  <View style={styles.featuredAction}><View style={styles.playButton}><Ionicons name="play" size={16} color="#12294B" /></View><Text style={styles.watchText}>Regarder la vidéo</Text><Ionicons name="arrow-forward" size={16} color="#F6D984" /></View>
                </View>
              </LinearGradient>
            </ImageBackground>
          </TouchableOpacity>
        )}

        <View style={styles.sectionHeadingList}>
          <View><Text style={styles.sectionTitle}>{selectedClass || 'La collection'}</Text><Text style={styles.sectionCaption}>{loading ? 'Mise à jour de la collection…' : `${filteredVideos.length} ${filteredVideos.length > 1 ? 'vidéos affichées' : 'vidéo affichée'}`}</Text></View>
          <View style={styles.headingIcon}><Ionicons name="play-circle-outline" size={19} color="#A88632" /></View>
        </View>

        {loading && <View style={styles.loadingPanel}><ActivityIndicator size="large" color="#A88632" /><Text style={styles.mutedText}>Nous préparons votre sélection…</Text></View>}
        {!!mediaError && <View style={styles.notice}><Text style={styles.noticeText}>{mediaError}</Text><TouchableOpacity onPress={() => setRetry((value) => value + 1)}><Text style={styles.retryText}>Réessayer</Text></TouchableOpacity></View>}
        {!loading && !mediaError && filteredVideos.length === 0 && !!selectedClass && <View style={styles.emptyState}><View style={styles.emptyIcon}><Ionicons name="videocam-outline" size={24} color="#9C7B2E" /></View><Text style={styles.emptyTitle}>{search ? 'Aucun résultat' : 'Collection en préparation'}</Text><Text style={styles.emptyText}>{search ? 'Essayez un autre mot-clé.' : 'Aucune vidéo trouvée dans cette catégorie pour le moment.'}</Text></View>}

        {filteredVideos.map((video) => (
          <TouchableOpacity key={video.youtube_video_id} style={styles.mediaCard} onPress={() => openVideo(video)} activeOpacity={0.82}>
            <View style={styles.thumbnailWrap}>
              <Image source={video.thumbnail ? { uri: video.thumbnail } : require('../../../assets/pimage.jpg')} style={styles.thumbnail} />
              <View style={styles.thumbnailPlay}><Ionicons name="play" size={12} color="#fff" /></View>
            </View>
            <View style={styles.mediaInfo}><Text style={styles.mediaTitle} numberOfLines={2}>{video.title}</Text><Text style={styles.mediaMeta} numberOfLines={1}>{video.classification}{formatPublishedDate(video.published_at) ? `  ·  ${formatPublishedDate(video.published_at)}` : ''}</Text></View>
            <Ionicons name="chevron-forward" size={18} color="#B2BBC7" />
          </TouchableOpacity>
        ))}

        {!loading && page < totalPages && <TouchableOpacity style={styles.loadMoreButton} onPress={loadMore} disabled={loadingMore} activeOpacity={0.8}>{loadingMore ? <ActivityIndicator color="#fff" /> : <><Text style={styles.loadMoreText}>Charger plus de vidéos</Text><Ionicons name="arrow-down" size={16} color="#fff" /></>}</TouchableOpacity>}
        {!loading && page > 0 && page >= totalPages && videos.length > 0 && <Text style={styles.endNote}>Vous êtes à jour sur cette collection.</Text>}
        <View style={styles.bottomPadding} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8F7F3' },
  scrollContent: { paddingHorizontal: 20, paddingTop: 20, paddingBottom: 130 },
  eyebrowRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 4 },
  eyebrowLine: { width: 22, height: 2, backgroundColor: '#B18A32' },
  eyebrow: { color: '#A17C2C', fontSize: 10, letterSpacing: 2, fontWeight: '800' },
  pageTitle: { color: '#102B50', fontFamily: 'serif', fontSize: 32, fontWeight: '700', marginTop: 9 },
  intro: { color: '#697587', fontSize: 14, lineHeight: 21, marginTop: 7, marginBottom: 18 },
  searchBox: { minHeight: 50, borderRadius: 15, backgroundColor: '#fff', borderWidth: 1, borderColor: '#E9E7E0', flexDirection: 'row', alignItems: 'center', paddingHorizontal: 15, gap: 10, shadowColor: '#1F3554', shadowOpacity: 0.04, shadowRadius: 9, elevation: 1 },
  searchInput: { flex: 1, color: '#233A59', fontSize: 14, paddingVertical: 10 },
  sectionHeading: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 25, marginBottom: 12 },
  sectionHeadingList: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 26, marginBottom: 13 },
  sectionTitle: { color: '#102B50', fontSize: 18, fontWeight: '700' },
  sectionCaption: { color: '#929AA6', fontSize: 12, marginTop: 3 },
  headingIcon: { width: 36, height: 36, borderRadius: 12, backgroundColor: '#F1EBDD', alignItems: 'center', justifyContent: 'center' },
  categoryList: { gap: 8, paddingBottom: 3 },
  categoryChip: { minHeight: 38, maxWidth: 240, paddingHorizontal: 14, borderRadius: 20, flexDirection: 'row', alignItems: 'center', gap: 7, backgroundColor: '#fff', borderWidth: 1, borderColor: '#E9E7E0' },
  categoryChipActive: { backgroundColor: '#102B50', borderColor: '#102B50' },
  categoryText: { color: '#657184', fontSize: 12, fontWeight: '600' },
  categoryTextActive: { color: '#fff' },
  inlineLoading: { minHeight: 52, flexDirection: 'row', alignItems: 'center', gap: 10 },
  mutedText: { color: '#8A94A3', fontSize: 13 },
  featuredCard: { height: 250, marginTop: 23, borderRadius: 20, overflow: 'hidden', backgroundColor: '#183354', shadowColor: '#102B50', shadowOpacity: 0.14, shadowRadius: 12, elevation: 4 },
  featuredImage: { flex: 1 },
  featuredImageRadius: { borderRadius: 20 },
  featuredGradient: { flex: 1, padding: 18, justifyContent: 'space-between' },
  featuredBadge: { alignSelf: 'flex-start', flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 10, paddingVertical: 7, borderRadius: 20, backgroundColor: 'rgba(16,43,80,0.82)' },
  featuredBadgeText: { color: '#F6D984', fontSize: 9, fontWeight: '800', letterSpacing: 1.2 },
  featuredBottom: { gap: 7 },
  featuredCategory: { color: '#F4D787', fontSize: 10, fontWeight: '800', letterSpacing: 1 },
  featuredTitle: { color: '#fff', fontSize: 21, lineHeight: 27, fontWeight: '700' },
  featuredAction: { flexDirection: 'row', alignItems: 'center', gap: 9, marginTop: 3 },
  playButton: { width: 34, height: 34, borderRadius: 17, backgroundColor: '#F4D787', alignItems: 'center', justifyContent: 'center' },
  watchText: { color: '#fff', fontSize: 12, fontWeight: '700', flex: 1 },
  loadingPanel: { minHeight: 150, alignItems: 'center', justifyContent: 'center', gap: 12 },
  notice: { padding: 15, backgroundColor: '#FFF8E7', borderColor: '#F0DDAA', borderWidth: 1, borderRadius: 14, gap: 8, marginTop: 10 },
  noticeText: { color: '#725C2D', fontSize: 13, lineHeight: 19 },
  retryText: { color: '#102B50', fontWeight: '800', fontSize: 13 },
  emptyState: { alignItems: 'center', backgroundColor: '#fff', borderRadius: 18, padding: 24, borderWidth: 1, borderColor: '#ECEAE4' },
  emptyIcon: { width: 48, height: 48, borderRadius: 16, backgroundColor: '#F5F0E3', alignItems: 'center', justifyContent: 'center', marginBottom: 10 },
  emptyTitle: { color: '#102B50', fontWeight: '700', fontSize: 15 },
  emptyText: { color: '#8993A1', fontSize: 12, lineHeight: 18, textAlign: 'center', marginTop: 5 },
  mediaCard: { minHeight: 88, flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: '#fff', borderWidth: 1, borderColor: '#ECEAE4', borderRadius: 16, padding: 10, marginBottom: 9 },
  thumbnailWrap: { width: 90, height: 64, borderRadius: 11, overflow: 'hidden', backgroundColor: '#E7E9EC', alignItems: 'center', justifyContent: 'center' },
  thumbnail: { width: '100%', height: '100%' },
  thumbnailPlay: { position: 'absolute', width: 27, height: 27, borderRadius: 14, backgroundColor: 'rgba(16,43,80,0.9)', alignItems: 'center', justifyContent: 'center' },
  mediaInfo: { flex: 1 },
  mediaTitle: { color: '#193452', fontWeight: '700', fontSize: 13, lineHeight: 18 },
  mediaMeta: { color: '#929AA6', fontSize: 10, marginTop: 5 },
  loadMoreButton: { minHeight: 48, marginTop: 7, borderRadius: 14, backgroundColor: '#102B50', flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 9 },
  loadMoreText: { color: '#fff', fontSize: 13, fontWeight: '700' },
  endNote: { color: '#9BA3AE', fontSize: 11, textAlign: 'center', marginTop: 14 },
  bottomPadding: { height: 20 },
});
