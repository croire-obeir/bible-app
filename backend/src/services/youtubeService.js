// import axios from 'axios';

// const YOUTUBE_API_URL = 'https://www.googleapis.com/youtube/v3';

// const API_KEY = process.env.YOUTUBE_API_KEY;
// const CHANNEL_ID = process.env.YOUTUBE_CHANNEL_ID;

// if (!API_KEY) {
//   throw new Error("YOUTUBE_API_KEY n'est pas défini");
// }

// if (!CHANNEL_ID) {
//   throw new Error("YOUTUBE_CHANNEL_ID n'est pas défini");
// }

// export const getVideos = async () => {
//   try {
//     const response = await axios.get(`${YOUTUBE_API_URL}/search`, {
//       params: {
//         part: 'snippet',
//         channelId: CHANNEL_ID,
//         type: 'video',
//         order: 'date',
//         maxResults: 20,
//         key: API_KEY,
//       },
//     });

//     return response.data.items.map((item) => ({
//       videoId: item.id.videoId,
//       title: item.snippet.title,
//       description: item.snippet.description,
//       thumbnail: item.snippet.thumbnails.high?.url,
//       publishedAt: item.snippet.publishedAt,
//       channelTitle: item.snippet.channelTitle,
//     }));
//   } catch (error) {
//     throw new Error("Échec de la récupération des vidéos YouTube");
//   }
// };

// export const getAudios = async () => {
//   try {
//     const response = await axios.get(`${YOUTUBE_API_URL}/search`, {
//       params: {
//         part: 'snippet',
//         channelId: CHANNEL_ID,
//         type: 'video',
//         order: 'date',
//         maxResults: 20,
//         key: API_KEY,
//       },
//     });

//     return response.data.items.map((item) => ({
//       videoId: item.id.videoId,
//       title: item.snippet.title,
//       description: item.snippet.description,
//       thumbnail: item.snippet.thumbnails.high?.url,
//       publishedAt: item.snippet.publishedAt,
//       channelTitle: item.snippet.channelTitle,
//     }));
//   } catch (error) {
//     console.error('YouTube API error:', error);
//     throw new Error("Échec de la récupération des audios YouTube");
//   }
// };



import { google } from 'googleapis';

const oauth2Client = new google.auth.OAuth2(
  process.env.GOOGLE_OAUTH_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  process.env.GOOGLE_REDIRECT_URI
);

oauth2Client.setCredentials({
  refresh_token: process.env.YOUTUBE_REFRESH_TOKEN,
});

const youtube = google.youtube({
  version: 'v3',
  auth: oauth2Client,
});

const VIDEOS_PLAYLIST_ID = process.env.YOUTUBE_VIDEOS_PLAYLIST_ID;
const AUDIOS_PLAYLIST_ID = process.env.YOUTUBE_AUDIOS_PLAYLIST_ID;

if (!process.env.YOUTUBE_REFRESH_TOKEN) {
  throw new Error("YOUTUBE_REFRESH_TOKEN n'est pas défini");
}

if (!VIDEOS_PLAYLIST_ID) {
  throw new Error("YOUTUBE_VIDEOS_PLAYLIST_ID n'est pas défini");
}

if (!AUDIOS_PLAYLIST_ID) {
  throw new Error("YOUTUBE_AUDIOS_PLAYLIST_ID n'est pas défini");
}

export const getVideos = async () => {
  try {
    const response = await youtube.playlistItems.list({
      part: 'snippet,contentDetails',
      playlistId: VIDEOS_PLAYLIST_ID,
      maxResults: 50,
    });

    return response.data.items.map((item) => ({
      videoId: item.contentDetails.videoId,
      title: item.snippet.title,
      // description: item.snippet.description,
      thumbnail:
        item.snippet.thumbnails?.high?.url ??
        item.snippet.thumbnails?.default?.url,
      publishedAt: item.snippet.publishedAt,
      // channelTitle: item.snippet.channelTitle,
    }));
  } catch (error) {
    console.error(
      'YouTube API error:',
      error.response?.data || error.message
    );

    throw new Error("Échec de la récupération des vidéos YouTube");
  }
};

export const getAudios = async () => {
  try {
    const response = await youtube.playlistItems.list({
      part: 'snippet,contentDetails',
      playlistId: AUDIOS_PLAYLIST_ID,
      maxResults: 50,
    });

    return response.data.items.map((item) => ({
      videoId: item.contentDetails.videoId,
      title: item.snippet.title,
      // description: item.snippet.description,
      thumbnail:
        item.snippet.thumbnails?.high?.url ??
        item.snippet.thumbnails?.default?.url,
      publishedAt: item.snippet.publishedAt,
      // channelTitle: item.snippet.channelTitle,
    }));
  } catch (error) {
    console.error(
      'YouTube API error:',
      error.response?.data || error.message
    );

    throw new Error("Échec de la récupération des audios YouTube");
  }
};