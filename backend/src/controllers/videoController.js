import db from '../config/db.js';

export const getVideoClasses = async (req, res) => {
  try {
    const [rows] = await db.execute(
      `SELECT DISTINCT classification
       FROM videos
       ORDER BY classification ASC`
    );

    const [latestRows] = await db.execute(
      `SELECT COALESCE(MAX(id), 0) AS latestId
       FROM videos`
    );

    return res.status(200).json({
      success: true,
      data: rows.map((row) => row.classification),
      latestId: Number(latestRows[0].latestId),
    });
  } catch (error) {
    console.error('Error fetching video classes:', error);

    return res.status(500).json({
      success: false,
      message: 'Échec de la récupération des catégories de vidéos',
    });
  }
};



export const getVideosByClass = async (req, res) => {
  try {
    const { classification } = req.query;

    const page = Math.max(parseInt(req.query.page) || 1, 1);
    const limit = Math.min(
      Math.max(parseInt(req.query.limit) || 10, 1),
      50
    );

    // Optional filter for retrieving only new videos
    const afterId =
      req.query.afterId !== undefined
        ? Number.parseInt(req.query.afterId, 10)
        : null;

    if (
      afterId !== null &&
      (!Number.isSafeInteger(afterId) || afterId < 0)
    ) {
      return res.status(400).json({
        success: false,
        message: 'Invalid afterId',
      });
    }

    const offset = (page - 1) * limit;

    if (!classification) {
      return res.status(400).json({
        success: false,
        message: 'Classification is required',
      });
    }

    // Build the optional ID filter
    const idCondition =
      afterId !== null ? 'AND id > ?' : '';

    const queryParams =
      afterId !== null
        ? [classification, afterId]
        : [classification];

    // Count videos matching the filters
    const [countRows] = await db.execute(
      `SELECT COUNT(*) AS total
       FROM videos
       WHERE classification = ?
       ${idCondition}`,
      queryParams
    );

    const total = countRows[0].total;

    // Retrieve videos matching the filters
    const [rows] = await db.execute(
      `SELECT id, youtube_video_id, title, classification, thumbnail, published_at
       FROM videos
       WHERE classification = ?
       ${idCondition}
       ORDER BY published_at DESC
       LIMIT ${limit} OFFSET ${offset}`,
      queryParams
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
