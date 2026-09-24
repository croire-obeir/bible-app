import axios from 'axios';

const YOUTUBE_API_URL = 'https://www.googleapis.com/youtube/v3';

const API_KEY = process.env.YOUTUBE_API_KEY;
const CHANNEL_ID = process.env.YOUTUBE_CHANNEL_ID;

if (!API_KEY) {
  throw new Error("YOUTUBE_API_KEY n'est pas défini");
}

if (!CHANNEL_ID) {
  throw new Error("YOUTUBE_CHANNEL_ID n'est pas défini");
}

export const getVideos = async () => {
  try {
    const response = await axios.get(`${YOUTUBE_API_URL}/search`, {
      params: {
        part: 'snippet',
        channelId: CHANNEL_ID,
        type: 'video',
        order: 'date',
        maxResults: 20,
        key: API_KEY,
      },
    });

    return response.data.items.map((item) => ({
      videoId: item.id.videoId,
      title: item.snippet.title,
      description: item.snippet.description,
      thumbnail: item.snippet.thumbnails.high?.url,
      publishedAt: item.snippet.publishedAt,
      channelTitle: item.snippet.channelTitle,
    }));
  } catch (error) {
    throw new Error("Échec de la récupération des vidéos YouTube");
  }
};

export const getAudios = async () => {
  try {
    const response = await axios.get(`${YOUTUBE_API_URL}/search`, {
      params: {
        part: 'snippet',
        channelId: CHANNEL_ID,
        type: 'video',
        order: 'date',
        maxResults: 20,
        key: API_KEY,
      },
    });

    return response.data.items.map((item) => ({
      videoId: item.id.videoId,
      title: item.snippet.title,
      description: item.snippet.description,
      thumbnail: item.snippet.thumbnails.high?.url,
      publishedAt: item.snippet.publishedAt,
      channelTitle: item.snippet.channelTitle,
    }));
  } catch (error) {
    console.error('YouTube API error:', error);
    throw new Error("Échec de la récupération des audios YouTube");
  }
};