import express from 'express';
import {
  listBooks,
  listVersions,
  searchBible,
  showBook,
  showChapter,
  showDailyVerse,
} from '../controllers/bibleController.js';

const router = express.Router();

router.get('/versions', listVersions);
router.get('/books', listBooks);
router.get('/books/:bookId', showBook);
router.get('/books/:bookId/chapters/:chapter', showChapter);
router.get('/daily-verse', showDailyVerse);
router.get('/search', searchBible);

export default router;
