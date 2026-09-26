import { google } from 'googleapis';
import db from '../config/db.js';

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



// export const getVideos = async () => {
//   try {
//     const allItems = [];
//     let nextPageToken = undefined;

//     do {
//       const response = await youtube.playlistItems.list({
//         part: 'snippet,contentDetails',
//         playlistId: VIDEOS_PLAYLIST_ID,
//         maxResults: 50,
//         pageToken: nextPageToken,
//       });

//       allItems.push(...(response.data.items || []));

//       nextPageToken = response.data.nextPageToken;
//     } while (nextPageToken);

//     const classifiedVideos = {};

//     allItems.forEach((item) => {
//       const title = item.snippet.title;

//       // Everything before the first " - "
//       const classification = title.split(' - ')[0].trim();

//       const video = {
//         videoId: item.contentDetails.videoId,
//         title,
//         thumbnail:
//           item.snippet.thumbnails?.high?.url ??
//           item.snippet.thumbnails?.default?.url,
//         publishedAt: item.snippet.publishedAt,
//       };

//       if (!classifiedVideos[classification]) {
//         classifiedVideos[classification] = [];
//       }

//       classifiedVideos[classification].push(video);
//     });

//     return classifiedVideos;
//   } catch (error) {
//     console.error(
//       'YouTube API error:',
//       error.response?.data || error.message
//     );

//     throw new Error("Échec de la récupération des vidéos YouTube");
//   }
// };

export const syncVideosToDatabase = async () => {
  try {
    let nextPageToken;
    let count = 0;

    do {
      const response = await youtube.playlistItems.list({
        part: 'snippet,contentDetails',
        playlistId: VIDEOS_PLAYLIST_ID,
        maxResults: 50,
        pageToken: nextPageToken,
      });

      const items = response.data.items || [];

      for (const item of items) {
        const title = item.snippet.title;

        // Everything before the first " - "
        const classification = title.split(' - ')[0].trim();

        const video = {
          youtube_video_id: item.contentDetails.videoId,
          title,
          classification,
          thumbnail:
            item.snippet.thumbnails?.high?.url ??
            item.snippet.thumbnails?.default?.url,
          published_at: new Date(item.snippet.publishedAt)
            .toISOString()
            .slice(0, 19)
            .replace('T', ' '),
        };

        await db.execute(
          `INSERT INTO videos
            (youtube_video_id, title, classification, thumbnail, published_at)
          VALUES (?, ?, ?, ?, ?)
          ON DUPLICATE KEY UPDATE
            title = VALUES(title),
            classification = VALUES(classification),
            thumbnail = VALUES(thumbnail),
            published_at = VALUES(published_at),
            updated_at = CURRENT_TIMESTAMP`,
          [
            video.youtube_video_id,
            video.title,
            video.classification,
            video.thumbnail,
            video.published_at,
          ]
        );

        count++;
      }

      nextPageToken = response.data.nextPageToken;
    } while (nextPageToken);

    console.log(`Videos synchronized: ${count}`);

    return { count };
  } catch (error) {
    console.error('YouTube video sync error:', error);
    console.error('Error message:', error.message);
    console.error('Error response:', error.response?.data);

    throw error;
  }
};


export const syncAudiosToDatabase = async () => {
  try {
    let nextPageToken;
    let count = 0;

    do {
      const response = await youtube.playlistItems.list({
        part: 'snippet,contentDetails',
        playlistId: AUDIOS_PLAYLIST_ID,
        maxResults: 50,
        pageToken: nextPageToken,
      });

      const items = response.data.items || [];

      for (const item of items) {
        const title = item.snippet.title;

        // Everything before the first " - "
        const classification = title.split(' - ')[0].trim();

        const audio = {
          youtube_video_id: item.contentDetails.videoId,
          title,
          classification,
          thumbnail:
            item.snippet.thumbnails?.high?.url ??
            item.snippet.thumbnails?.default?.url,
          published_at: new Date(item.snippet.publishedAt)
            .toISOString()
            .slice(0, 19)
            .replace('T', ' '),
        };

        await db.execute(
          `INSERT INTO audios
            (youtube_video_id, title, classification, thumbnail, published_at)
           VALUES (?, ?, ?, ?, ?)
           ON DUPLICATE KEY UPDATE
            title = VALUES(title),
            classification = VALUES(classification),
            thumbnail = VALUES(thumbnail),
            published_at = VALUES(published_at),
            updated_at = CURRENT_TIMESTAMP`,
          [
            audio.youtube_video_id,
            audio.title,
            audio.classification,
            audio.thumbnail,
            audio.published_at,
          ]
        );

        count++;
      }

      nextPageToken = response.data.nextPageToken;
    } while (nextPageToken);

    console.log(`Audios synchronized: ${count}`);

    return { count };
  } catch (error) {
    console.error('YouTube audio sync error:', error);
    console.error('Error message:', error.message);
    console.error('Error response:', error.response?.data);

    throw new Error('Échec de la synchronisation des audios YouTube');
  }
};