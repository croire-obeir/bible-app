import { DatabaseSync } from 'node:sqlite';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const defaultDbPath = path.join(__dirname, '..', 'data', 'lsg_1910.db');

let bibleDb;

function getDb() {
  if (!bibleDb) {
    bibleDb = new DatabaseSync(process.env.BIBLE_DB_PATH || defaultDbPath, {
      readOnly: true,
    });
  }

  return bibleDb;
}

function mapBook(row) {
  return {
    id: row.id,
    testament: row.testament,
    name: row.name,
    shortName: row.short_name,
    chapterCount: row.chapter_count,
  };
}

function mapVerse(row) {
  return {
    versionId: row.version_id,
    bookId: row.book_id,
    bookName: row.book_name,
    shortName: row.short_name,
    chapter: row.chapter,
    verseNum: row.verse_num,
    text: row.verse_text.replace(/^¶\s*/, ''),
    canonicalId: row.canonical_id,
  };
}

export function getVersions() {
  return getDb()
    .prepare('SELECT id, name, abbreviation, language FROM versions ORDER BY id')
    .all();
}

export function getBooks(testament) {
  const db = getDb();
  const normalizedTestament = testament?.toUpperCase();

  if (normalizedTestament === 'AT' || normalizedTestament === 'NT') {
    return db
      .prepare(
        'SELECT id, testament, name, short_name, chapter_count FROM books WHERE testament = ? ORDER BY id'
      )
      .all(normalizedTestament)
      .map(mapBook);
  }

  return db
    .prepare('SELECT id, testament, name, short_name, chapter_count FROM books ORDER BY id')
    .all()
    .map(mapBook);
}

export function getBook(bookId) {
  const row = getDb()
    .prepare('SELECT id, testament, name, short_name, chapter_count FROM books WHERE id = ?')
    .get(bookId);

  return row ? mapBook(row) : null;
}

export function getChapter(bookId, chapter, versionId = 1) {
  const book = getBook(bookId);

  if (!book || chapter < 1 || chapter > book.chapterCount) {
    return null;
  }

  const verses = getDb()
    .prepare(
      `SELECT v.version_id, v.book_id, b.name AS book_name, b.short_name,
              v.chapter, v.verse_num, v.verse_text, v.canonical_id
       FROM verses v
       INNER JOIN books b ON b.id = v.book_id
       WHERE v.version_id = ? AND v.book_id = ? AND v.chapter = ?
       ORDER BY v.verse_num`
    )
    .all(versionId, bookId, chapter)
    .map(mapVerse);

  return {
    book,
    chapter,
    versionId,
    verses,
  };
}

export function getVerse(bookId, chapter, verseNum, versionId = 1) {
  const row = getDb()
    .prepare(
      `SELECT v.version_id, v.book_id, b.name AS book_name, b.short_name,
              v.chapter, v.verse_num, v.verse_text, v.canonical_id
       FROM verses v
       INNER JOIN books b ON b.id = v.book_id
       WHERE v.version_id = ? AND v.book_id = ? AND v.chapter = ? AND v.verse_num = ?`
    )
    .get(versionId, bookId, chapter, verseNum);

  return row ? mapVerse(row) : null;
}

export function getDailyVerse() {
  return getVerse(6, 1, 8);
}

export function searchVerses(query, limit = 20, versionId = 1) {
  const search = query?.trim();

  if (!search || search.length < 2) {
    return [];
  }

  const safeLimit = Math.min(Math.max(Number(limit) || 20, 1), 50);

  return getDb()
    .prepare(
      `SELECT v.version_id, v.book_id, b.name AS book_name, b.short_name,
              v.chapter, v.verse_num, v.verse_text, v.canonical_id
       FROM verses v
       INNER JOIN books b ON b.id = v.book_id
       WHERE v.version_id = ? AND v.verse_text LIKE ?
       ORDER BY v.canonical_id
       LIMIT ?`
    )
    .all(versionId, `%${search}%`, safeLimit)
    .map(mapVerse);
}
