
import db from '../config/db.js';

export const getDailyVerse = async (req, res) => {
  try {
    // Use the date supplied by the frontend so each user gets
    // the verse corresponding to their own local calendar date.
    const date = req.query.date;

    // Validate date format
    if (!date || !/^\d{4}-\d{2}-\d{2}$/.test(date)) {
      return res.status(400).json({
        success: false,
        message: 'A valid date parameter (YYYY-MM-DD) is required.'
      });
    }

    // Validate that the date is a real calendar date
    const parsedDate = new Date(`${date}T00:00:00.000Z`);

    if (
      Number.isNaN(parsedDate.getTime()) ||
      parsedDate.toISOString().slice(0, 10) !== date
    ) {
      return res.status(400).json({
        success: false,
        message: 'Invalid calendar date.'
      });
    }

    const [rows] = await db.execute(
      `SELECT
        DATE_FORMAT(verse_date, '%Y-%m-%d') AS date,
        book_code,
        chapter,
        verse_start,
        verse_end
       FROM daily_verses
       WHERE verse_date = ?
       LIMIT 1`,
      [date]
    );

    if (rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'No verse of the day has been configured for this date.',
        date
      });
    }

    const dailyVerse = rows[0];

    return res.status(200).json({
      success: true,
      data: {
        date: dailyVerse.date,
        reference: {
          book_code: dailyVerse.book_code,
          chapter: dailyVerse.chapter,
          verse_start: dailyVerse.verse_start,
          verse_end: dailyVerse.verse_end
        }
      }
    });

  } catch (error) {
    console.error('Error fetching daily verse:', error);

    return res.status(500).json({
      success: false,
      message: 'An error occurred while fetching the verse of the day.'
    });
  }
};
