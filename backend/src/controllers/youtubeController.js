import {
  getVideos,
  getAudios,
} from '../services/youtubeService.js';

export const getVideosController = async (
  req,
  res
) => {
  try {
    const videos = await getVideos();

    res.status(200).json({
      success: true,
      data: videos,
    });
  } catch (error) {
     res.status(500).json({
      success: false,
      message: "Échec de la récupération des vidéos",
    });
  }
};

export const getAudiosController = async (
  req,
  res
) => {
  try {
    const audios = await getAudios();

    res.status(200).json({
      success: true,
      data: audios,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Échec de la récupération des audios',
    });
  }
};