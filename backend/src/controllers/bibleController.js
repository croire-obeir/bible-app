import {
  getBook,
  getBooks,
  getChapter,
  getDailyVerse,
  getVersions,
  searchVerses,
} from '../services/bibleService.js';

function toPositiveInt(value) {
  const parsed = Number(value);
  return Number.isInteger(parsed) && parsed > 0 ? parsed : null;
}

export function listVersions(req, res) {
  res.json({ versions: getVersions() });
}

export function listBooks(req, res) {
  res.json({ books: getBooks(req.query.testament) });
}

export function showBook(req, res) {
  const bookId = toPositiveInt(req.params.bookId);

  if (!bookId) {
    return res.status(400).json({ message: 'Invalid book id' });
  }

  const book = getBook(bookId);

  if (!book) {
    return res.status(404).json({ message: 'Book not found' });
  }

  return res.json({ book });
}

export function showChapter(req, res) {
  const bookId = toPositiveInt(req.params.bookId);
  const chapter = toPositiveInt(req.params.chapter);
  const versionId = toPositiveInt(req.query.versionId) || 1;

  if (!bookId || !chapter) {
    return res.status(400).json({ message: 'Invalid chapter reference' });
  }

  const chapterData = getChapter(bookId, chapter, versionId);

  if (!chapterData) {
    return res.status(404).json({ message: 'Chapter not found' });
  }

  return res.json(chapterData);
}

export function showDailyVerse(req, res) {
  res.json({ verse: getDailyVerse() });
}

export function searchBible(req, res) {
  res.json({
    results: searchVerses(req.query.q, req.query.limit, req.query.versionId),
  });
}
