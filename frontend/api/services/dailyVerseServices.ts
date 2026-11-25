import AsyncStorage from '@react-native-async-storage/async-storage';
import apiClient from '../client';

const DAILY_VERSE_CACHE_KEY = '@croire_obeir/daily_verse_v1';
const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;
const REQUEST_TIMEOUT_MS = 10000;

const INVALID_RESPONSE_MESSAGE = 'La réponse du verset du jour est invalide.';
const INVALID_REFERENCE_MESSAGE = 'La référence du verset du jour est invalide.';
const INVALID_DATE_MESSAGE = 'La date du verset du jour est invalide.';

export type DailyVerseReference = {
  book_code: string; // string, not a number (e.g. "20")
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

/**
 * Returns the device's LOCAL calendar date (YYYY-MM-DD).
 * Never convert to UTC (no toISOString) – the day must follow the user's timezone.
 */
export const getLocalDateString = (): string => {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

function isDailyVerseReference(value: unknown): value is DailyVerseReference {
  if (!value || typeof value !== 'object') return false;

  const reference = value as Partial<DailyVerseReference>;
  return (
    typeof reference.book_code === 'string' &&
    /^\d+$/.test(reference.book_code) &&
    Number.isSafeInteger(reference.chapter) &&
    Number(reference.chapter) > 0 &&
    Number.isSafeInteger(reference.verse_start) &&
    Number(reference.verse_start) > 0 &&
    Number.isSafeInteger(reference.verse_end) &&
    Number(reference.verse_end) >= Number(reference.verse_start)
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

async function writeDailyVerseCache(cache: DailyVerseCache): Promise<void> {
  try {
    await AsyncStorage.setItem(DAILY_VERSE_CACHE_KEY, JSON.stringify(cache));
  } catch (error) {
    // A storage failure must not prevent displaying a verse fetched online.
    console.warn('Could not save the daily verse cache:', error);
  }
}

export async function getDailyVerseReference(
  date: string
): Promise<DailyVerseReference> {
  if (!DATE_PATTERN.test(date)) {
    throw new Error(INVALID_DATE_MESSAGE);
  }

  // Join an in-flight request first (synchronous check) so that concurrent
  // callers never trigger duplicate cache reads or API calls.
  const pendingRequest = pendingRequests.get(date);
  if (pendingRequest) return pendingRequest;

  const request = (async () => {
    // 1. Use the cached reference if it matches the current local date.
    const cached = await readDailyVerseCache();
    if (cached?.date === date) return cached.reference;

    // 2. Otherwise call the API with the local date.
    //    On failure we throw WITHOUT touching the existing cache.
    const response = await apiClient.get<DailyVerseResponse>('/api/daily-verse', {
      params: { date },
      timeout: REQUEST_TIMEOUT_MS,
    });
    const payload = response.data;

    if (
      !payload?.success ||
      !payload.data ||
      payload.data.date !== date ||
      !isDailyVerseReference(payload.data.reference)
    ) {
      throw new Error(INVALID_RESPONSE_MESSAGE);
    }

    // 3. Persist the new reference and its date.
    const cache: DailyVerseCache = {
      date: payload.data.date,
      reference: payload.data.reference,
    };
    await writeDailyVerseCache(cache);

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
  if (
    error instanceof Error &&
    (error.message === INVALID_RESPONSE_MESSAGE ||
      error.message === INVALID_REFERENCE_MESSAGE ||
      error.message === INVALID_DATE_MESSAGE)
  ) {
    return error.message;
  }

  const response =
    typeof error === 'object' && error !== null && 'response' in error
      ? (error as { response?: { status?: number } }).response
      : undefined;
  const status = response?.status;

  if (status === 404) return 'Aucun verset du jour n’est disponible pour cette date.';
  if (status === 400) return INVALID_DATE_MESSAGE;
  if (status && status >= 500) {
    return 'Le service du verset du jour est momentanément indisponible.';
  }
  if (status) {
    // Any other HTTP error: the server answered, so the user is not offline.
    return 'Impossible de récupérer le verset du jour pour le moment. Veuillez réessayer plus tard.';
  }

  // No response at all: network error or timeout.
  return 'Verset du jour indisponible hors connexion. Réessayez lorsque vous serez connecté.';
}