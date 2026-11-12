
import db from '../config/db.js';

export const registerInstallation = async (req, res) => {
  try {
    const { installation_id, platform, app_version } = req.body;

    // Validate required fields
    if (!installation_id || !platform) {
      return res.status(400).json({
        success: false,
        message: 'Installation ID and platform are required.'
      });
    }

    // Validate UUID
    const uuidRegex =
      /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

    if (!uuidRegex.test(installation_id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid installation ID.'
      });
    }

    // Validate platform
    const normalizedPlatform = platform.toLowerCase();

    if (!['android', 'ios'].includes(normalizedPlatform)) {
      return res.status(400).json({
        success: false,
        message: 'Platform must be android or ios.'
      });
    }

    // Validate app version
    if (
      app_version !== undefined &&
      app_version !== null &&
      (typeof app_version !== 'string' || app_version.length > 20)
    ) {
      return res.status(400).json({
        success: false,
        message: 'Invalid app version.'
      });
    }

    // Insert or update installation
    const sql = `
      INSERT INTO app_installations (
        installation_id,
        platform,
        app_version,
        first_seen_at,
        last_seen_at,
        created_at,
        updated_at
      )
      VALUES (?, ?, ?, NOW(), NOW(), NOW(), NOW())
      ON DUPLICATE KEY UPDATE
        platform = VALUES(platform),
        app_version = VALUES(app_version),
        last_seen_at = NOW(),
        updated_at = NOW()
    `;

    await db.execute(sql, [
      installation_id,
      normalizedPlatform,
      app_version || null
    ]);

    return res.status(200).json({
      success: true,
      message: 'Installation registered successfully.'
    });

  } catch (error) {
    console.error('Error registering installation:', error);

    return res.status(500).json({
      success: false,
      message: 'Unable to register installation.'
    });
  }
};
