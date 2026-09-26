import db from '../config/db.js';

export const getAudioClasses = async (req, res) => {
  try {
    const [rows] = await db.execute(
      `SELECT DISTINCT classification
       FROM audios
       ORDER BY classification ASC`
    );

    const classes = rows.map((row) => row.classification);

    return res.status(200).json({
      success: true,
      data: classes,
    });
  } catch (error) {
    console.error('Error fetching audio classes:', error);

    return res.status(500).json({
      success: false,
      message: 'Échec de la récupération des catégories audio',
    });
  }
};



export const getAudiosByClass = async (req, res) => {
  try {
    const { classification } = req.query;

    const page = Math.max(parseInt(req.query.page) || 1, 1);
    const limit = Math.min(
      Math.max(parseInt(req.query.limit) || 10, 1),
      50
    );

    const offset = (page - 1) * limit;

    if (!classification) {
      return res.status(400).json({
        success: false,
        message: 'Classification is required',
      });
    }

    // Get total number of audios
    const [countRows] = await db.execute(
      `SELECT COUNT(*) AS total
       FROM audios
       WHERE classification = ?`,
      [classification]
    );

    const total = countRows[0].total;

    // Get videos
    const [rows] = await db.execute(
      `SELECT youtube_video_id, title, classification, thumbnail, published_at
       FROM audios
       WHERE classification = ?
       ORDER BY published_at DESC
       LIMIT ${limit} OFFSET ${offset}`,
      [classification]
    );

    return res.status(200).json({
      success: true,
      data: rows,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Error fetching videos by class:', error);

    return res.status(500).json({
      success: false,
      message: 'Échec de la récupération des vidéos',
    });
  }
};