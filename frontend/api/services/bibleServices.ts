import apiClient from '../client';

export type Testament = 'AT' | 'NT';

export type BibleBook = {
  id: number;
  testament: Testament;
  name: string;
  shortName: string;
  chapterCount: number;
};

export type BibleVerse = {
  versionId: number;
  bookId: number;
  bookName: string;
  shortName: string;
  chapter: number;
  verseNum: number;
  text: string;
  canonicalId: number;
};

export type BibleChapter = {
  book: BibleBook;
  chapter: number;
  versionId: number;
  verses: BibleVerse[];
};

export async function fetchBibleBooks(testament?: Testament) {
  const response = await apiClient.get<{ books: BibleBook[] }>('/api/bible/books', {
    params: testament ? { testament } : undefined,
  });

  return response.data.books;
}

export async function fetchBibleChapter(bookId: number, chapter: number) {
  const response = await apiClient.get<BibleChapter>(
    `/api/bible/books/${bookId}/chapters/${chapter}`
  );

  return response.data;
}

export async function fetchDailyVerse() {
  const response = await apiClient.get<{ verse: BibleVerse }>('/api/bible/daily-verse');
  return response.data.verse;
}

export async function searchBibleVerses(query: string) {
  const response = await apiClient.get<{ results: BibleVerse[] }>('/api/bible/search', {
    params: { q: query, limit: 18 },
  });

  return response.data.results;
}
