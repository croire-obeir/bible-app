import AsyncStorage from '@react-native-async-storage/async-storage';
import apiClient from '../client';

const DAILY_VERSE_CACHE_KEY = '@croire_obeir/daily_verse_v1';

export type DailyVerseReference = {
  book_code: string;
  chapter: number;
  verse_start: number;
  verse_end: number;
};

type DailyVerseCache = {
  date: string;
  reference: DailyVerseReference;
};

type DailyVerseResponse = {
  success: boolean;
  data?: {
    date: string;
    reference: DailyVerseReference;
  };
  message?: string;
};

const pendingRequests = new Map<string, Promise<DailyVerseReference>>();

function isDailyVerseReference(value: unknown): value is DailyVerseReference {
  if (!value || typeof value !== 'object') return false;

  const reference = value as Partial<DailyVerseReference>;
  return (
    typeof reference.book_code === 'string' && /^\d+$/.test(reference.book_code) &&
    Number.isSafeInteger(reference.chapter) && Number(reference.chapter) > 0 &&
    Number.isSafeInteger(reference.verse_start) && Number(reference.verse_start) > 0 &&
    Number.isSafeInteger(reference.verse_end) && Number(reference.verse_end) >= Number(reference.verse_start)
  );
}

async function readDailyVerseCache(): Promise<DailyVerseCache | null> {
  try {
    const stored = await AsyncStorage.getItem(DAILY_VERSE_CACHE_KEY);
    if (!stored) return null;

    const cache: unknown = JSON.parse(stored);
    if (
      !cache ||
      typeof cache !== 'object' ||
      typeof (cache as DailyVerseCache).date !== 'string' ||
      !isDailyVerseReference((cache as DailyVerseCache).reference)
    ) {
      return null;
    }

    return cache as DailyVerseCache;
  } catch (error) {
    console.warn('Could not read the daily verse cache:', error);
    return null;
  }
}

export async function getDailyVerseReference(
  date: string
): Promise<DailyVerseReference> {
  const cached = await readDailyVerseCache();
  if (cached?.date === date) return cached.reference;

  const pendingRequest = pendingRequests.get(date);
  if (pendingRequest) return pendingRequest;

  const request = (async () => {
    // Re-check the cache after joining the in-flight queue to avoid a duplicate
    // API request if another caller completed while this request was starting.
    const latestCache = await readDailyVerseCache();
    if (latestCache?.date === date) return latestCache.reference;

    const response = await apiClient.get<DailyVerseResponse>('/api/daily-verse', {
      params: { date },
    });
    const payload = response.data;

    if (
      !payload?.success ||
      !payload.data ||
      payload.data.date !== date ||
      !isDailyVerseReference(payload.data.reference)
    ) {
      throw new Error('La réponse du verset du jour est invalide.');
    }

    const cache: DailyVerseCache = {
      date: payload.data.date,
      reference: payload.data.reference,
    };

    try {
      await AsyncStorage.setItem(DAILY_VERSE_CACHE_KEY, JSON.stringify(cache));
    } catch (error) {
      // A storage failure should not prevent displaying a verse fetched online.
      console.warn('Could not save the daily verse cache:', error);
    }

    return cache.reference;
  })();

  pendingRequests.set(date, request);
  try {
    return await request;
  } finally {
    pendingRequests.delete(date);
  }
}

export function getDailyVerseErrorMessage(error: unknown): string {
  const status =
    typeof error === 'object' && error !== null && 'response' in error
      ? (error as { response?: { status?: number } }).response?.status
      : undefined;

  if (status === 404) return 'Aucun verset du jour n’est disponible pour cette date.';
  if (status === 400) return 'La date du verset du jour est invalide.';
  if (status && status >= 500) return 'Le service du verset du jour est momentanément indisponible.';
  if (
    error instanceof Error &&
    (
      error.message === 'La réponse du verset du jour est invalide.' ||
      error.message === 'La référence du verset du jour est invalide.'
    )
  ) {
    return error.message;
  }
  return 'Verset du jour indisponible hors connexion. Réessayez lorsque vous serez connecté.';
}
