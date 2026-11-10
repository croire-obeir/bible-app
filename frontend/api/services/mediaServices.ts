import apiClient from '../client';

export type MediaKind = 'videos' | 'audios';

export type MediaItem = {
  id?: number;
  youtube_video_id: string;
  title: string;
  classification: string;
  thumbnail: string;
  published_at: string;
};

export type MediaPagination = {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
};

export type MediaPage = {
  data: MediaItem[];
  pagination: MediaPagination;
};

export async function fetchMediaClasses(kind: MediaKind): Promise<string[]> {
  const response = await apiClient.get<{ success: boolean; data: string[] }>(
    `/api/media-classes/${kind}`
  );
  return response.data.data;
}


export async function fetchLatestMediaId(
  kind: MediaKind
): Promise<number> {
  const response = await apiClient.get<{
    success: boolean;
    data: string[];
    latestId: number;
  }>(`/api/media-classes/${kind}`);

  return response.data.latestId;
}



export async function fetchMediaPage(
  kind: MediaKind,
  classification: string,
  page: number,
  limit = 10
): Promise<MediaPage> {
  const response = await apiClient.get<{
    success: boolean;
    data: MediaItem[];
    pagination: MediaPagination;
  }>(`/api/media/${kind}`, {
    params: {
      classification,
      page,
      limit,
    },
  });

  return {
    data: response.data.data,
    pagination: response.data.pagination,
  };
}


export const fetchNewMedia = async (
  kind: MediaKind,
  afterId: number
): Promise<MediaItem[]> => {
  const response = await apiClient.get<{
    success: boolean;
    data: MediaItem[];
  }>(`/api/new-media/${kind}`, {
    params: { afterId },
  });

  return response.data.data;
};


export function getMediaErrorMessage(error: unknown, fallback: string): string {
  if (typeof error === 'object' && error !== null && 'response' in error) {
    const response = (error as { response?: { data?: { message?: string } } }).response;
    if (response?.data?.message) return response.data.message;
  }
  if (error instanceof Error && error.message) return error.message;
  return fallback;
}

export function getYouTubeUrl(videoId: string): string {
  return `https://www.youtube.com/watch?v=${encodeURIComponent(videoId)}`;
}