import {
  syncVideosToDatabase,
  syncAudiosToDatabase,
} from '../services/youtubeService.js';

export const syncVideosController = async (req, res) => {
  try {
    const result = await syncVideosToDatabase();

    res.status(200).json({
      success: true,
      message: 'Videos synchronized successfully',
      data: result,
    });
  } catch (error) {
    console.error('Video sync error:', error);

    res.status(500).json({
      success: false,
      message: 'Échec de la synchronisation des vidéos',
    });
  }
};

export const syncAudiosController = async (req, res) => {
  try {
    const result = await syncAudiosToDatabase();

    res.status(200).json({
      success: true,
      message: 'Audios synchronized successfully',
      data: result,
    });
  } catch (error) {
    console.error('Audio sync error:', error);

    res.status(500).json({
      success: false,
      message: 'Échec de la synchronisation des audios',
    });
  }
};