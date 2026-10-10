
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const R2_PUBLIC_BASE_URL = `${process.env.EXPO_PUBLIC_DOMAIN}`;

const MANIFEST_CACHE_KEY = '@croire_obeir/document_manifest_v1';

export interface ManifestDocument {
  id: string;
  title: string;
  file: string;
}

export interface ManifestCategory {
  id: string;
  name: string;
  documents: ManifestDocument[];
}

export interface DocumentManifest {
  categories: ManifestCategory[];
}

export type ManifestFetchResult =
  | { success: true; data: DocumentManifest }
  | { success: false; error: string };

const r2Client = axios.create({
  baseURL: R2_PUBLIC_BASE_URL,
  timeout: 15000,
  headers: {
    Accept: 'application/json',
  },
});

function isNonEmptyString(value: unknown): value is string {
  return typeof value === 'string' && value.length > 0;
}

function isManifestDocument(value: unknown): value is ManifestDocument {
  if (!value || typeof value !== 'object') {
    return false;
  }

  const document = value as ManifestDocument;

  return (
    isNonEmptyString(document.id) &&
    typeof document.title === 'string' &&
    typeof document.file === 'string'
  );
}

function isManifestCategory(value: unknown): value is ManifestCategory {
  if (!value || typeof value !== 'object') {
    return false;
  }

  const category = value as ManifestCategory;

  return (
    isNonEmptyString(category.id) &&
    typeof category.name === 'string' &&
    Array.isArray(category.documents) &&
    category.documents.every(isManifestDocument)
  );
}

function isDocumentManifest(value: unknown): value is DocumentManifest {
  if (!value || typeof value !== 'object') {
    return false;
  }

  const manifest = value as DocumentManifest;

  return (
    Array.isArray(manifest.categories) &&
    manifest.categories.every(isManifestCategory)
  );
}

/**
 * Reads the previously saved manifest from the device.
 * Returns null if no valid cached manifest is available.
 */
export async function getCachedDocumentManifest(): Promise<DocumentManifest | null> {
  try {
    const cachedValue = await AsyncStorage.getItem(MANIFEST_CACHE_KEY);

    if (!cachedValue) {
      return null;
    }

    const parsedValue: unknown = JSON.parse(cachedValue);

    if (!isDocumentManifest(parsedValue)) {
      return null;
    }

    return parsedValue;
  } catch {
    // Cache problems should not prevent the app from loading.
    return null;
  }
}

/**
 * Saves a validated manifest locally.
 * Cache errors must not interrupt document loading.
 */
async function cacheDocumentManifest(
  manifest: DocumentManifest
): Promise<void> {
  try {
    await AsyncStorage.setItem(
      MANIFEST_CACHE_KEY,
      JSON.stringify(manifest)
    );
  } catch {
    // The app can still use the freshly downloaded manifest.
  }
}

function splitR2Path(filePath: string): string[] {
  return filePath.split('/').filter((segment) => segment.length > 0);
}

function encodePathSegment(segment: string): string {
  let decoded = segment;

  try {
    decoded = decodeURIComponent(segment);
  } catch {
    decoded = segment;
  }

  return encodeURIComponent(decoded).replace(/[!'()*]/g, (character) => {
    return `%${character.charCodeAt(0).toString(16).toUpperCase()}`;
  });
}

export function buildR2DocumentUrl(filePath: string): string {
  const normalizedBase = R2_PUBLIC_BASE_URL.replace(/\/+$/, '');
  const normalizedPath = filePath.replace(/^\/+/, '');

  const encodedPath = splitR2Path(normalizedPath)
    .map(encodePathSegment)
    .join('/');

  return `${normalizedBase}/${encodedPath}`;
}

export function getFolderSegments(filePath: string): string[] {
  const segments = splitR2Path(filePath);
  return segments.slice(0, -1);
}

export function getNestedFolderSegments(filePath: string): string[] {
  return getFolderSegments(filePath).slice(1);
}

export function getFileName(filePath: string): string {
  const segments = splitR2Path(filePath);
  return segments[segments.length - 1] ?? filePath;
}

function getErrorMessage(error: unknown): string {
  if (axios.isAxiosError(error)) {
    if (error.response) {
      return `Le manifeste est inaccessible (${error.response.status}).`;
    }

    if (error.code === 'ECONNABORTED') {
      return 'Le chargement du manifeste a expiré.';
    }

    return 'Impossible de se connecter au stockage des documents.';
  }

  if (error instanceof Error && error.message) {
    return error.message;
  }

  return 'Une erreur inattendue est survenue.';
}

/**
 * Fetches the latest manifest from R2.
 * A successful, validated response is saved to the local cache.
 */
export const fetchDocumentManifest =
  async (): Promise<ManifestFetchResult> => {
    try {
      const response = await r2Client.get<unknown>('/manifest.json');

      if (response.status < 200 || response.status >= 300) {
        return {
          success: false,
          error: `Le manifeste est inaccessible (${response.status}).`,
        };
      }

      if (!isDocumentManifest(response.data)) {
        return {
          success: false,
          error: 'Le manifeste reçu a un format inattendu.',
        };
      }

      // Save the latest manifest for the next visit.
      await cacheDocumentManifest(response.data);

      return {
        success: true,
        data: response.data,
      };
    } catch (error: unknown) {
      return {
        success: false,
        error: getErrorMessage(error),
      };
    }
  };