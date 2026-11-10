
import React, { useCallback, useEffect,  useRef, useState } from 'react';
import {
  ActivityIndicator,
  ImageBackground,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import * as WebBrowser from 'expo-web-browser';
import YoutubePlayer from 'react-native-youtube-iframe';
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

  return date.toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

export default function VideosScreen() {
  const handleTabBarScroll = useTabBarScroll();
  const scrollViewRef = useRef<ScrollView>(null);

  const [classes, setClasses] = useState<string[]>([]);
  const [selectedClass, setSelectedClass] = useState('');
  const [videos, setVideos] = useState<MediaItem[]>([]);
  const [classesLoading, setClassesLoading] = useState(true);
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [classesError, setClassesError] = useState('');
  const [mediaError, setMediaError] = useState('');
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [retry, setRetry] = useState(0);

  // ID of the video currently playing inline.
  const [playingVideoId, setPlayingVideoId] = useState<string | null>(null);

  useEffect(() => {
    let active = true;

    setClassesLoading(true);
    setClassesError('');

    fetchMediaClasses('videos')
      .then((result) => {
        if (!active) return;

        setClasses(result);
        setSelectedClass((current) =>
          current && result.includes(current) ? current : result[0] ?? ''
        );
      })
      .catch((error: unknown) => {
        if (active) {
          setClassesError(
            getMediaErrorMessage(
              error,
              'Impossible de récupérer les catégories.'
            )
          );
        }
      })
      .finally(() => {
        if (active) setClassesLoading(false);
      });

    return () => {
      active = false;
    };
  }, [retry]);

  useEffect(() => {
    if (!selectedClass) {
      setVideos([]);
      setPage(0);
      setTotalPages(0);
      setPlayingVideoId(null);
      return;
    }

    let active = true;

    setLoading(true);
    setMediaError('');
    setVideos([]);
    setPage(0);
    setPlayingVideoId(null);

    fetchMediaPage('videos', selectedClass, 1, PAGE_SIZE)
      .then((result) => {
        if (!active) return;

        setVideos(result.data);
        setPage(result.pagination.page);
        setTotalPages(result.pagination.totalPages);
      })
      .catch((error: unknown) => {
        if (active) {
          setMediaError(
            getMediaErrorMessage(
              error,
              'Impossible de récupérer les vidéos.'
            )
          );
        }
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [selectedClass, retry]);

  const loadMore = useCallback(async () => {
    if (
      !selectedClass ||
      loadingMore ||
      loading ||
      page >= totalPages
    ) {
      return;
    }

    setLoadingMore(true);
    setMediaError('');

    try {
      const result = await fetchMediaPage(
        'videos',
        selectedClass,
        page + 1,
        PAGE_SIZE
      );

      setVideos((current) => [...current, ...result.data]);
      setPage(result.pagination.page);
      setTotalPages(result.pagination.totalPages);
    } catch (error) {
      setMediaError(
        getMediaErrorMessage(error, 'Impossible de charger la suite.')
      );
    } finally {
      setLoadingMore(false);
    }
  }, [loading, loadingMore, page, selectedClass, totalPages]);

  // Tap once to play inline; tap the same card again to close it.
  const openVideo = useCallback((item: MediaItem) => {
    setPlayingVideoId((current) =>
      current === item.youtube_video_id ? null : item.youtube_video_id
    );
    setMediaError('');
  }, []);

  // Open the corresponding YouTube video to view or post comments.
  const openYouTubeComments = useCallback(async (item: MediaItem) => {
    try {
      await WebBrowser.openBrowserAsync(
        getYouTubeUrl(item.youtube_video_id)
      );
    } catch {
      setMediaError("Impossible d'ouvrir YouTube.");
    }
  }, []);

  return (
    <View style={styles.container}>
      <Header title="Vidéos Sacrées" />

      <ScrollView
        ref={scrollViewRef}
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

        <Text style={styles.intro}>
          Enseignements, témoignages et découvertes bibliques pour nourrir
          votre foi, à votre rythme.
        </Text>

        <View style={styles.sectionHeading}>
          <View>
            <Text style={styles.sectionTitle}>Explorer par thème</Text>
            <Text style={styles.sectionCaption}>
              Choisissez une collection
            </Text>
          </View>

          <View style={styles.headingIcon}>
            <Ionicons name="albums-outline" size={18} color="#A88632" />
          </View>
        </View>

        {classesLoading ? (
          <View style={styles.inlineLoading}>
            <ActivityIndicator color="#A88632" />
            <Text style={styles.mutedText}>Chargement des thèmes…</Text>
          </View>
        ) : classesError ? (
          <View style={styles.notice}>
            <Text style={styles.noticeText}>{classesError}</Text>
            <TouchableOpacity
              onPress={() => setRetry((value) => value + 1)}
            >
              <Text style={styles.retryText}>Réessayer</Text>
            </TouchableOpacity>
          </View>
        ) : classes.length === 0 ? (
          <View style={styles.notice}>
            <Text style={styles.noticeText}>
              Aucune catégorie vidéo disponible pour le moment.
            </Text>
          </View>
        ) : (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.categoryList}
          >
            {classes.map((item) => {
              const active = item === selectedClass;

              return (
                <TouchableOpacity
                  key={item}
                  onPress={() => setSelectedClass(item)}
                  style={[
                    styles.categoryChip,
                    active && styles.categoryChipActive,
                  ]}
                  activeOpacity={0.8}
                >
                  <Text
                    style={[
                      styles.categoryText,
                      active && styles.categoryTextActive,
                    ]}
                    numberOfLines={1}
                  >
                    {item}
                  </Text>

                  {active && (
                    <Ionicons
                      name="checkmark-circle"
                      size={15}
                      color="#F4D787"
                    />
                  )}
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        )}

        <View style={styles.sectionHeadingList}>
          <View>
            <Text style={styles.sectionTitle}>
              {selectedClass || 'La collection'}
            </Text>

            <Text style={styles.sectionCaption}>
              {loading
                ? 'Mise à jour de la collection…'
                : `${videos.length} ${
                    videos.length > 1
                      ? 'vidéos affichées'
                      : 'vidéo affichée'
                  }`}
            </Text>
          </View>

          <View style={styles.headingIcon}>
            <Ionicons
              name="play-circle-outline"
              size={19}
              color="#A88632"
            />
          </View>
        </View>

        {loading && (
          <View style={styles.loadingPanel}>
            <ActivityIndicator size="large" color="#A88632" />
            <Text style={styles.mutedText}>
              Nous préparons votre sélection…
            </Text>
          </View>
        )}

        {!!mediaError && (
          <View style={styles.notice}>
            <Text style={styles.noticeText}>{mediaError}</Text>
            <TouchableOpacity
              onPress={() => setRetry((value) => value + 1)}
            >
              <Text style={styles.retryText}>Réessayer</Text>
            </TouchableOpacity>
          </View>
        )}

        {!loading &&
          !mediaError &&
          videos.length === 0 &&
          !!selectedClass && (
            <View style={styles.emptyState}>
              <View style={styles.emptyIcon}>
                <Ionicons
                  name="videocam-outline"
                  size={24}
                  color="#9C7B2E"
                />
              </View>

              <Text style={styles.emptyTitle}>
                Collection en préparation
              </Text>

              <Text style={styles.emptyText}>
                Aucune vidéo trouvée dans cette catégorie pour le moment.
              </Text>
            </View>
          )}

        {videos.map((video) => {
          const isActive =
            playingVideoId === video.youtube_video_id;

          return (
            <View
              key={video.youtube_video_id}
              style={styles.inlineMediaCard}
            >
              {isActive ? (
                <View style={styles.inlinePlayerWrap}>
                  <YoutubePlayer
                    height={220}
                    videoId={video.youtube_video_id}
                    play={true}
                    onChangeState={(state) => {
                      if (state === 'ended') {
                        setPlayingVideoId(null);
                      }
                    }}
                  />
                </View>
              ) : (
                <TouchableOpacity
                  activeOpacity={0.9}
                  onPress={() => openVideo(video)}
                >
                  <ImageBackground
                    source={
                      video.thumbnail
                        ? { uri: video.thumbnail }
                        : require('../../../assets/pimage.jpg')
                    }
                    style={styles.inlinePlayerImage}
                    imageStyle={styles.inlinePlayerImageRadius}
                  >
                    <LinearGradient
                      colors={[
                        'rgba(8,24,48,0.04)',
                        'rgba(8,24,48,0.88)',
                      ]}
                      style={styles.inlinePlayerGradient}
                    >
                      <View style={styles.inlinePlayButton}>
                        <Ionicons
                          name="play"
                          size={22}
                          color="#12294B"
                        />
                      </View>

                      <View style={styles.inlinePlayerBottom}>
                        <Text
                          style={styles.inlinePlayerCategory}
                          numberOfLines={1}
                        >
                          {video.classification}
                        </Text>

                        <Text
                          style={styles.inlinePlayerTitle}
                          numberOfLines={2}
                        >
                          {video.title}
                        </Text>
                      </View>
                    </LinearGradient>
                  </ImageBackground>
                </TouchableOpacity>
              )}

              <View style={styles.inlineMediaInfo}>
                <Text style={styles.mediaTitle} numberOfLines={2}>
                  {video.title}
                </Text>

                <Text style={styles.mediaMeta} numberOfLines={1}>
                  {video.classification}
                  {formatPublishedDate(video.published_at)
                    ? `  ·  ${formatPublishedDate(video.published_at)}`
                    : ''}
                </Text>

                <TouchableOpacity
                  onPress={() => openYouTubeComments(video)}
                  activeOpacity={0.8}
                  accessibilityRole="button"
                  accessibilityLabel={`Voir ou publier des commentaires sur ${video.title} sur YouTube`}
                  style={styles.inlineCommentsButton}
                >
                  <Ionicons
                    name="logo-youtube"
                    size={18}
                    color="#FFFFFF"
                  />

                  <Text style={styles.inlineCommentsText}>
                    Voir les commentaires sur YouTube
                  </Text>

                  <Ionicons
                    name="open-outline"
                    size={16}
                    color="#FFFFFF"
                  />
                </TouchableOpacity>
              </View>
            </View>
          );
        })}

        {!loading && page < totalPages && (
          <TouchableOpacity
            style={styles.loadMoreButton}
            onPress={loadMore}
            disabled={loadingMore}
            activeOpacity={0.8}
          >
            {loadingMore ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <>
                <Text style={styles.loadMoreText}>
                  Charger plus de vidéos
                </Text>
                <Ionicons
                  name="arrow-down"
                  size={16}
                  color="#FFFFFF"
                />
              </>
            )}
          </TouchableOpacity>
        )}

        {!loading &&
          page > 0 &&
          page >= totalPages &&
          videos.length > 0 && (
            <Text style={styles.endNote}>
              Vous êtes à jour sur cette collection.
            </Text>
          )}

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
  inlineMediaCard: {
  marginHorizontal: 16,
  marginBottom: 18,
  backgroundColor: '#FFFFFF',
  borderRadius: 16,
  borderWidth: StyleSheet.hairlineWidth,
  borderColor: '#E4E7EC',
  overflow: 'hidden',

  // Card shadow
  shadowColor: '#12294B',
  shadowOffset: { width: 0, height: 4 },
  shadowOpacity: 0.08,
  shadowRadius: 10,
  elevation: 3,
},

inlinePlayerWrap: {
  width: '100%',
  overflow: 'hidden',
},

inlinePlayerImage: {
  width: '100%',
  height: 220,
  justifyContent: 'flex-end',
},

inlinePlayerImageRadius: {
  borderTopLeftRadius: 15,
  borderTopRightRadius: 15,
},

inlinePlayerGradient: {
  flex: 1,
  justifyContent: 'center',
  alignItems: 'center',
  padding: 16,
},

inlinePlayButton: {
  alignSelf: 'center',
  alignItems: 'center',
  justifyContent: 'center',
  width: 54,
  height: 54,
  borderRadius: 27,
  backgroundColor: '#F6D984',
  borderWidth: 2,
  borderColor: 'rgba(255,255,255,0.9)',
},

inlinePlayerBottom: {
  position: 'absolute',
  bottom: 16,
  left: 16,
  right: 16,
},

inlinePlayerCategory: {
  color: '#F6D984',
  fontSize: 11,
  fontWeight: '700',
  textTransform: 'uppercase',
  letterSpacing: 1,
  marginBottom: 6,
},

inlinePlayerTitle: {
  color: '#FFFFFF',
  fontSize: 18,
  fontWeight: '700',
  lineHeight: 25,
  textShadowColor: 'rgba(0,0,0,0.35)',
  textShadowOffset: { width: 0, height: 1 },
  textShadowRadius: 4,
},

inlineMediaInfo: {
  padding: 14,
  backgroundColor: '#FFFFFF',
},

inlineCommentsButton: {
  flexDirection: 'row',
  alignItems: 'center',
  justifyContent: 'center',
  backgroundColor: '#C62828',
  paddingVertical: 12,
  paddingHorizontal: 12,
  borderRadius: 10,
  marginTop: 12,
},

inlineCommentsText: {
  color: '#FFFFFF',
  fontWeight: '600',
  fontSize: 13,
  marginHorizontal: 8,
  flexShrink: 1,
},


});
