
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import { AppState } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

import {
  fetchLatestMediaId,
  type MediaKind,
} from '../api/services/mediaServices';

const LAST_SEEN_VIDEO_KEY = 'lastSeenVideoId';
const LAST_SEEN_AUDIO_KEY = 'lastSeenAudioId';

type NotificationContextType = {
  hasNewVideos: boolean;
  hasNewAudios: boolean;
  latestVideoId: number | null;
  latestAudioId: number | null;
  lastSeenVideoId: number | null;
  lastSeenAudioId: number | null;
  refreshNotifications: () => Promise<void>;
  markMediaSeen: (kind: MediaKind) => Promise<void>;
};

const NotificationContext =
  createContext<NotificationContextType | undefined>(undefined);

export function NotificationProvider({
  children,
}: {
  children: ReactNode;
}) {
  const [hasNewVideos, setHasNewVideos] = useState(false);
  const [hasNewAudios, setHasNewAudios] = useState(false);

  const [latestVideoId, setLatestVideoId] = useState<number | null>(null);
  const [latestAudioId, setLatestAudioId] = useState<number | null>(null);

  const [lastSeenVideoId, setLastSeenVideoId] = useState<number | null>(null);
  const [lastSeenAudioId, setLastSeenAudioId] = useState<number | null>(null);

  const checkingRef = useRef(false);

  const refreshNotifications = useCallback(async () => {
    
    if (checkingRef.current) return;

    checkingRef.current = true;

    try {
      const results = await Promise.allSettled([
        fetchLatestMediaId('videos'),
        fetchLatestMediaId('audios'),
      ]);

      const updateKind = async (
        kind: MediaKind,
        latestId: number
      ) => {
        if (!Number.isSafeInteger(latestId) || latestId < 0) {
          throw new Error(`Invalid latestId received for ${kind}`);
        }

        const storageKey =
          kind === 'videos'
            ? LAST_SEEN_VIDEO_KEY
            : LAST_SEEN_AUDIO_KEY;

        const storedId = await AsyncStorage.getItem(storageKey);

        if (storedId === null) {
          // First check: don't mark historical content as new.
          await AsyncStorage.setItem(storageKey, String(latestId));

          if (kind === 'videos') {
            setLastSeenVideoId(latestId);
            setLatestVideoId(latestId);
            setHasNewVideos(false);
          } else {
            setLastSeenAudioId(latestId);
            setLatestAudioId(latestId);
            setHasNewAudios(false);
          }

          return;
        }

        const lastSeenId = Number(storedId);

        if (!Number.isSafeInteger(lastSeenId) || lastSeenId < 0) {
          // Recover an invalid stored marker without generating
          // a notification for historical content.
          await AsyncStorage.setItem(storageKey, String(latestId));

          if (kind === 'videos') {
            setLastSeenVideoId(latestId);
            setLatestVideoId(latestId);
            setHasNewVideos(false);
          } else {
            setLastSeenAudioId(latestId);
            setLatestAudioId(latestId);
            setHasNewAudios(false);
          }

          return;
        }

        if (kind === 'videos') {
          setLastSeenVideoId(lastSeenId);
          setLatestVideoId(latestId);
          setHasNewVideos(latestId > lastSeenId);
        } else {
          setLastSeenAudioId(lastSeenId);
          setLatestAudioId(latestId);
          setHasNewAudios(latestId > lastSeenId);
        }
      };

      if (results[0].status === 'fulfilled') {
        await updateKind('videos', results[0].value);
      } else {
        console.warn('Could not check new videos:', results[0].reason);
      }

      if (results[1].status === 'fulfilled') {
        await updateKind('audios', results[1].value);
      } else {
        console.warn('Could not check new audios:', results[1].reason);
      }
    } catch (error) {
      console.warn('Notification check failed:', error);
    } finally {
      checkingRef.current = false;
    }
  }, []);

  const markMediaSeen = useCallback(async (kind: MediaKind) => {
    const latestId =
      kind === 'videos' ? latestVideoId : latestAudioId;

    if (latestId === null) return;

    const storageKey =
      kind === 'videos'
        ? LAST_SEEN_VIDEO_KEY
        : LAST_SEEN_AUDIO_KEY;

    // Save first. Only clear the indicator if storage succeeds.
    await AsyncStorage.setItem(storageKey, String(latestId));

    if (kind === 'videos') {
      setLastSeenVideoId(latestId);
      setHasNewVideos(false);
    } else {
      setLastSeenAudioId(latestId);
      setHasNewAudios(false);
    }
  }, [latestVideoId, latestAudioId]);


  useEffect(() => {
 
  void refreshNotifications();
    const subscription = AppState.addEventListener(
      'change',
      (state) => {
        if (state === 'active') {
          void refreshNotifications();
        }
      }
    );

    return () => subscription.remove();
  }, [refreshNotifications]);

  return (
    <NotificationContext.Provider
      value={{
        hasNewVideos,
        hasNewAudios,
        latestVideoId,
        latestAudioId,
        lastSeenVideoId,
        lastSeenAudioId,
        refreshNotifications,
        markMediaSeen,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotifications() {
  const context = useContext(NotificationContext);

  if (!context) {
    throw new Error(
      'useNotifications must be used inside NotificationProvider'
    );
  }

  return context;
}
