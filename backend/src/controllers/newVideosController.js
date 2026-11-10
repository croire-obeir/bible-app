
export const getNewVideos = async (req, res) => {
  try {
    const afterId = Number.parseInt(req.query.afterId, 10);

    if (!Number.isSafeInteger(afterId) || afterId < 0) {
      return res.status(400).json({
        success: false,
        message: 'A valid afterId is required',
      });
    }

    const [rows] = await db.execute(
      `SELECT id, youtube_video_id, title, classification,
              thumbnail, published_at
       FROM videos
       WHERE id > ?
       ORDER BY id ASC`,
      [afterId]
    );

    return res.status(200).json({
      success: true,
      data: rows,
    });
  } catch (error) {
    console.error('Error fetching new videos:', error);

    return res.status(500).json({
      success: false,
      message: 'Échec de la récupération des nouvelles vidéos',
    });
  }
};
