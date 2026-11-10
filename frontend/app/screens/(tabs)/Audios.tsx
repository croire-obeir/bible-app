
import React, {
  useCallback,
  useEffect,
  useRef,
  useState,
} from 'react';
import {
  ActivityIndicator,
  ImageBackground,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useFocusEffect } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import * as WebBrowser from 'expo-web-browser';
import YoutubePlayer from 'react-native-youtube-iframe';
import { useTabBarScroll } from '../../../components/tab-bar-visibility';
import Header from '../../../components/CustomHeader';
import {
 fetchMediaClasses,
  fetchMediaPage,
  fetchNewMedia,
  getMediaErrorMessage,
  getYouTubeUrl,
  MediaItem,
} from '../../../api/services/mediaServices';
import { useNotifications } from '../../../components/notification-context';

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

export default function AudiosScreen() {

  const {
    hasNewAudios,
    lastSeenAudioId,
    markMediaSeen,
  } = useNotifications();

  const handleTabBarScroll = useTabBarScroll();
  const scrollViewRef = useRef<ScrollView>(null);

  const [classes, setClasses] = useState<string[]>([]);
  const [selectedClass, setSelectedClass] = useState('');
  const [audios, setAudios] = useState<MediaItem[]>([]);
  const [classesLoading, setClassesLoading] = useState(true);
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [classesError, setClassesError] = useState('');
  const [mediaError, setMediaError] = useState('');
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [retry, setRetry] = useState(0);
  const [newAudios, setNewAudios] = useState<MediaItem[]>([]);
  const [newAudiosLoading, setNewAudiosLoading] = useState(false);
  const [newAudiosError, setNewAudiosError] = useState('');

  // Only the selected video's card displays the active player.
  const [playingAudioId, setPlayingAudioId] = useState<string | null>(
    null
  );

  // Fetch categories.
  useEffect(() => {
    let active = true;

    setClassesLoading(true);
    setClassesError('');

    fetchMediaClasses('audios')
      .then((result) => {
        if (!active) return;

        setClasses(result);

        setSelectedClass((current) =>
          current && result.includes(current)
            ? current
            : result[0] ?? ''
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
    if (!hasNewAudios || lastSeenAudioId === null) {
      return;
    }

    let isActive = true;

    const loadNewAudios = async () => {
      try {
        setNewAudiosLoading(true);
        setNewAudiosError('');

        console.log('Fetching new audios after ID:', lastSeenAudioId);

        const result = await fetchNewMedia('audios', lastSeenAudioId);

        if (!isActive) return;

        console.log('New audios retrieved:', result.length);
        console.log('Retrieved audios:', result);

        setNewAudios(result);

        // Finish loading before updating notification state.
        setNewAudiosLoading(false);

        console.log('Marking audios as seen...');

        try {
          await markMediaSeen('audios');
        } catch (error) {
          console.error('Error updating audio marker:', error);
        }

      } catch (error) {
        console.error('NEW AUDIOS FETCH ERROR:', error);

        if (!isActive) return;

        setNewAudiosError(
          getMediaErrorMessage(
            error,
            'Impossible de récupérer les nouveaux audios.'
          )
        );
      } finally {
        if (isActive) {
          setNewAudiosLoading(false);
        }
      }
    };

    void loadNewAudios();

    return () => {
      isActive = false;
    };
  }, [hasNewAudios, lastSeenAudioId, markMediaSeen]);

  // Fetch the first page whenever the selected category changes.
  useEffect(() => {
    if (!selectedClass) {
      setAudios([]);
      setPage(0);
      setTotalPages(0);
      setPlayingAudioId(null);
      return;
    }



    let active = true;

    setLoading(true);
    setMediaError('');
    setAudios([]);
    setPage(0);
    setPlayingAudioId(null);

    fetchMediaPage('audios', selectedClass, 1, PAGE_SIZE)
      .then((result) => {
        if (!active) return;

        setAudios(result.data);
        setPage(result.pagination.page);
        setTotalPages(result.pagination.totalPages);
      })
      .catch((error: unknown) => {
        if (active) {
          setMediaError(
            getMediaErrorMessage(
              error,
              'Impossible de récupérer les audios.'
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

  // Load additional pages.
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
        'audios',
        selectedClass,
        page + 1,
        PAGE_SIZE
      );

      setAudios((current) => [...current, ...result.data]);
      setPage(result.pagination.page);
      setTotalPages(result.pagination.totalPages);
    } catch (error) {
      setMediaError(
        getMediaErrorMessage(
          error,
          'Impossible de charger la suite.'
        )
      );
    } finally {
      setLoadingMore(false);
    }
  }, [
    loading,
    loadingMore,
    page,
    selectedClass,
    totalPages,
  ]);

  

  // Activate or deactivate playback in the selected card.
  const openAudio = useCallback((item: MediaItem) => {
    setPlayingAudioId((current) =>
      current === item.youtube_video_id
        ? null
        : item.youtube_video_id
    );
  }, []);

  // Open the corresponding YouTube video for comments.
  const openYouTubeComments = useCallback(
    async (item: MediaItem) => {
      try {
        await WebBrowser.openBrowserAsync(
          getYouTubeUrl(item.youtube_video_id)
        );
      } catch {
        setMediaError("Impossible d'ouvrir YouTube.");
      }
    },
    []
  );

  useFocusEffect(
    useCallback(() => {
      return () => {
        setNewAudios([]);
        setNewAudiosError('');
        setNewAudiosLoading(false);
        setPlayingAudioId(null);
      };
    }, [])
  );

  return (
    <View style={styles.container}>
      <Header title="Enseignements Audio" />

      <ScrollView
        ref={scrollViewRef}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        onScroll={handleTabBarScroll}
        scrollEventThrottle={16}
      >
        {/* Page introduction */}
        <View style={styles.eyebrowRow}>
          <View style={styles.eyebrowLine} />
          <Text style={styles.eyebrow}>ÉCOUTER & MÉDITER</Text>
        </View>

        <Text style={styles.pageTitle}>
          Enseignements Audio
        </Text>

        <Text style={styles.intro}>
          Des paroles inspirantes et des enseignements bibliques à
          écouter où que vous soyez.
        </Text>


        {/* New audios section */}
        {(newAudiosLoading || newAudiosError || newAudios.length > 0) && (
          <View style={{ marginTop: 20 }}>

            <View style={styles.sectionHeading}>
              <View>
                <Text style={styles.sectionTitle}>
                  Nouveautés
                </Text>

                <Text style={styles.sectionCaption}>
                  {newAudiosLoading
                    ? 'Chargement des nouveaux audios…'
                    : `${newAudios.length} nouveaux ${newAudios.length > 1 ? 'enseignements' : 'enseignement'
                    }`}
                </Text>
              </View>

              <View style={styles.headingIcon}>
                <Ionicons
                  name="sparkles-outline"
                  size={19}
                  color="#A88632"
                />
              </View>
            </View>

            {newAudiosLoading && (
              <View style={styles.inlineLoading}>
                <ActivityIndicator color="#A88632" />
                <Text style={styles.mutedText}>
                  Chargement des nouveautés…
                </Text>
              </View>
            )}

            {!!newAudiosError && (
              <View style={styles.notice}>
                <Text style={styles.noticeText}>{newAudiosError}</Text>
              </View>
            )}

            {newAudios.map((audio) => {
              const isActive =
                playingAudioId === audio.youtube_video_id;

              return (
                <View
                  key={audio.youtube_video_id}
                  style={styles.inlineMediaCard}
                >
                  <View style={styles.inlinePlayerWrap}>
                    {isActive ? (
                      <YoutubePlayer
                        height={220}
                        videoId={audio.youtube_video_id}
                        play={true}
                        onChangeState={(state) => {
                          if (state === 'ended') {
                            setPlayingAudioId(null);
                          }
                        }}
                      />
                    ) : (
                      <TouchableOpacity
                        activeOpacity={0.9}
                        onPress={() => openAudio(audio)}
                      >
                        <ImageBackground
                          source={
                            audio.thumbnail
                              ? { uri: audio.thumbnail }
                              : require('../../../assets/pimage.jpg')
                          }
                          style={styles.inlinePlayerImage}
                          imageStyle={styles.inlinePlayerImageRadius}
                        >
                          <LinearGradient
                            colors={[
                              'rgba(8,24,48,0.02)',
                              'rgba(8,24,48,0.88)',
                            ]}
                            style={styles.inlinePlayerGradient}
                          >
                            <View style={styles.inlinePlayButton}>
                              <Ionicons
                                name="play"
                                size={24}
                                color="#12294B"
                              />
                            </View>

                            <View style={styles.inlinePlayerBottom}>
                              <Text
                                style={styles.inlinePlayerCategory}
                                numberOfLines={1}
                              >
                                {audio.classification}
                              </Text>

                              <Text
                                style={styles.inlinePlayerTitle}
                                numberOfLines={2}
                              >
                                {audio.title}
                              </Text>
                            </View>
                          </LinearGradient>
                        </ImageBackground>
                      </TouchableOpacity>
                    )}
                  </View>

                  <View style={styles.inlineMediaInfo}>
                    <View style={styles.inlineMediaText}>
                      <Text style={styles.mediaTitle} numberOfLines={2}>
                        {audio.title}
                      </Text>

                      <Text style={styles.mediaMeta}>
                        {audio.classification}
                        {formatPublishedDate(audio.published_at)
                          ? ` · ${formatPublishedDate(audio.published_at)}`
                          : ''}
                      </Text>
                    </View>

                    <TouchableOpacity
                      onPress={() => openYouTubeComments(audio)}
                      style={styles.inlineCommentsButton}
                    >
                      <Ionicons
                        name="logo-youtube"
                        size={19}
                        color="#FFFFFF"
                      />

                      <Text style={styles.inlineCommentsText}>
                        commenter sur YouTube
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
          </View>
        )}


        
        {/* Category heading */}
        <View style={styles.sectionHeading}>
          <View>
            <Text style={styles.sectionTitle}>
              Explorer par thème
            </Text>
            <Text style={styles.sectionCaption}>
              Trouvez une voix qui vous inspire
            </Text>
          </View>

          <View style={styles.headingIcon}>
            <Ionicons
              name="headset-outline"
              size={18}
              color="#A88632"
            />
          </View>
        </View>

        {/* Category filters */}
        {classesLoading ? (
          <View style={styles.inlineLoading}>
            <ActivityIndicator color="#A88632" />
            <Text style={styles.mutedText}>
              Chargement des thèmes…
            </Text>
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
              Aucune catégorie audio disponible pour le moment.
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

        {/* Collection heading */}
        <View style={styles.sectionHeadingList}>
          <View>
            <Text style={styles.sectionTitle}>
              {selectedClass || 'La collection'}
            </Text>

            <Text style={styles.sectionCaption}>
              {loading
                ? 'Mise à jour de la collection…'
                : `${audios.length} ${
                    audios.length > 1
                      ? 'enseignements affichés'
                      : 'enseignement affiché'
                  }`}
            </Text>
          </View>

          <View style={styles.headingIcon}>
            <Ionicons
              name="library-outline"
              size={19}
              color="#A88632"
            />
          </View>
        </View>

        {/* Loading */}
        {loading && (
          <View style={styles.loadingPanel}>
            <ActivityIndicator size="large" color="#A88632" />
            <Text style={styles.mutedText}>
              Nous préparons votre sélection…
            </Text>
          </View>
        )}

        {/* Error */}
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

        {/* Empty state */}
        {!loading &&
          !mediaError &&
          audios.length === 0 &&
          !!selectedClass && (
            <View style={styles.emptyState}>
              <View style={styles.emptyIcon}>
                <Ionicons
                  name="musical-notes-outline"
                  size={24}
                  color="#9C7B2E"
                />
              </View>

              <Text style={styles.emptyTitle}>
                 Collection en préparation
              </Text>

              <Text style={styles.emptyText}>
                Aucun audio trouvé dans cette catégorie pour le moment.
              </Text>
            </View>
          )}

        {/* Video cards with inline playback */}
        {!loading &&
          audios.map((audio) => {
            const isActive =
              playingAudioId === audio.youtube_video_id;

            return (
              <View
                key={audio.youtube_video_id}
                style={styles.inlineMediaCard}
              >
                {/* Thumbnail or embedded player */}
                <View style={styles.inlinePlayerWrap}>
                  {isActive ? (
                    <YoutubePlayer
                      height={220}
                      videoId={audio.youtube_video_id}
                      play={true}
                      onChangeState={(state) => {
                        if (state === 'ended') {
                          setPlayingAudioId(null);
                        }
                      }}
                    />
                  ) : (
                    <TouchableOpacity
                      activeOpacity={0.9}
                      onPress={() => openAudio(audio)}
                      accessibilityRole="button"
                      accessibilityLabel={`Lire ${audio.title}`}
                    >
                      <ImageBackground
                        source={
                          audio.thumbnail
                            ? { uri: audio.thumbnail }
                            : require('../../../assets/pimage.jpg')
                        }
                        style={styles.inlinePlayerImage}
                        imageStyle={styles.inlinePlayerImageRadius}
                      >
                        <LinearGradient
                          colors={[
                            'rgba(8,24,48,0.02)',
                            'rgba(8,24,48,0.88)',
                          ]}
                          style={styles.inlinePlayerGradient}
                        >
                          <View style={styles.inlinePlayButton}>
                            <Ionicons
                              name="play"
                              size={24}
                              color="#12294B"
                            />
                          </View>

                          <View style={styles.inlinePlayerBottom}>
                            <Text
                              style={styles.inlinePlayerCategory}
                              numberOfLines={1}
                            >
                              {audio.classification}
                            </Text>

                            <Text
                              style={styles.inlinePlayerTitle}
                              numberOfLines={2}
                            >
                              {audio.title}
                            </Text>
                          </View>
                        </LinearGradient>
                      </ImageBackground>
                    </TouchableOpacity>
                  )}
                </View>

                {/* Title and metadata */}
                <View style={styles.inlineMediaInfo}>
                  <View style={styles.inlineMediaText}>
                    <Text
                      style={styles.mediaTitle}
                      numberOfLines={2}
                    >
                      {audio.title}
                    </Text>

                    <Text
                      style={styles.mediaMeta}
                      numberOfLines={2}
                    >
                      {audio.classification}
                      {formatPublishedDate(audio.published_at)
                        ? `  ·  ${formatPublishedDate(
                            audio.published_at
                          )}`
                        : ''}
                    </Text>
                  </View>

                  {/* Comments button for this specific video */}
                  <TouchableOpacity
                    onPress={() => openYouTubeComments(audio)}
                    activeOpacity={0.8}
                    accessibilityRole="button"
                    accessibilityLabel={`Voir les commentaires de ${audio.title} sur YouTube`}
                    style={styles.inlineCommentsButton}
                  >
                    <Ionicons
                      name="logo-youtube"
                      size={19}
                      color="#FFFFFF"
                    />

                    <Text style={styles.inlineCommentsText}>
                       commenter sur YouTube
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

        {/* Load more */}
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
                  Charger plus d’audios
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

        {/* End of collection */}
        {!loading &&
          page > 0 &&
          page >= totalPages &&
          audios.length > 0 && (
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
  pageTitle: { color: '#102B50', fontFamily: 'serif', fontSize: 31, fontWeight: '700', marginTop: 9 },
  intro: { color: '#697587', fontSize: 14, lineHeight: 21, marginTop: 7, marginBottom: 18 },
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
  marginBottom: 20,
  backgroundColor: '#FFFFFF',
  borderRadius: 16,
  overflow: 'hidden',
  borderWidth: StyleSheet.hairlineWidth,
  borderColor: '#E4E7EC',
  shadowColor: '#12294B',
  shadowOffset: { width: 0, height: 3 },
  shadowOpacity: 0.07,
  shadowRadius: 8,
  elevation: 2,
},

inlinePlayerWrap: {
  width: '100%',
  overflow: 'hidden',
  backgroundColor: '#081830',
},

inlinePlayerImage: {
  width: '100%',
  height: 220,
  justifyContent: 'center',
},

inlinePlayerImageRadius: {
  borderTopLeftRadius: 16,
  borderTopRightRadius: 16,
},

inlinePlayerGradient: {
  flex: 1,
  justifyContent: 'center',
  padding: 18,
},

inlinePlayButton: {
  alignSelf: 'center',
  width: 56,
  height: 56,
  borderRadius: 28,
  backgroundColor: '#F6D984',
  alignItems: 'center',
  justifyContent: 'center',
  borderWidth: 2,
  borderColor: '#FFFFFF',
},

inlinePlayerBottom: {
  position: 'absolute',
  left: 16,
  right: 16,
  bottom: 14,
},

inlinePlayerCategory: {
  color: '#F6D984',
  fontSize: 11,
  fontWeight: '700',
  textTransform: 'uppercase',
  marginBottom: 5,
},

inlinePlayerTitle: {
  color: '#FFFFFF',
  fontSize: 17,
  fontWeight: '700',
  lineHeight: 23,
},

inlineMediaInfo: {
  padding: 14,
  gap: 12,
},

inlineMediaText: {
  gap: 5,
},

inlineCommentsButton: {
  flexDirection: 'row',
  alignItems: 'center',
  justifyContent: 'center',
  gap: 8,
  backgroundColor: '#C62828',
  paddingVertical: 13,
  paddingHorizontal: 12,
  borderRadius: 10,
  alignSelf: 'stretch',
},

inlineCommentsText: {
  color: '#FFFFFF',
  fontWeight: '600',
  fontSize: 13,
  flexShrink: 1,
},
});
