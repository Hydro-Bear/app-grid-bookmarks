import 'server-only';
import { promises as fs } from 'fs';
import path from 'path';
import type { Bookmark, BookmarkData, BookmarkPayload, Settings } from './types';

const FALLBACK_SETTINGS: Settings = {
  iconSize: 96,
  radius: 24,
  gap: 16,
  columns: { sm: 3, md: 4, lg: 6 }
};

const BOOKMARKS_PATH = path.join(process.cwd(), 'public', 'data', 'bookmarks.json');

const normaliseBookmark = (bookmark: Bookmark, index: number): Bookmark => ({
  ...bookmark,
  tags: bookmark.tags?.filter(Boolean) ?? [],
  order: typeof bookmark.order === 'number' ? bookmark.order : index * 10
});

const normaliseSettings = (settings?: Settings): Settings => {
  if (!settings) return FALLBACK_SETTINGS;
  return {
    iconSize: Number.isFinite(settings.iconSize) ? settings.iconSize : FALLBACK_SETTINGS.iconSize,
    radius: Number.isFinite(settings.radius) ? settings.radius : FALLBACK_SETTINGS.radius,
    gap: Number.isFinite(settings.gap) ? settings.gap : FALLBACK_SETTINGS.gap,
    columns: {
      sm: Number.isFinite(settings.columns?.sm)
        ? settings.columns.sm
        : FALLBACK_SETTINGS.columns.sm,
      md: Number.isFinite(settings.columns?.md)
        ? settings.columns.md
        : FALLBACK_SETTINGS.columns.md,
      lg: Number.isFinite(settings.columns?.lg)
        ? settings.columns.lg
        : FALLBACK_SETTINGS.columns.lg
    }
  };
};

const friendlyEmpty: BookmarkPayload = {
  bookmarks: [],
  settings: FALLBACK_SETTINGS,
  message:
    'No bookmarks found. Add entries to public/data/bookmarks.json to populate the grid.'
};

const resolveBaseUrl = () => {
  if (process.env.NEXT_PUBLIC_SITE_URL) return process.env.NEXT_PUBLIC_SITE_URL;
  if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}`;
  if (process.env.NEXT_URL) return process.env.NEXT_URL;
  return '';
};

const toPayload = (data: BookmarkData): BookmarkPayload => ({
  bookmarks: (data.bookmarks ?? []).map((bookmark, index) =>
    normaliseBookmark(bookmark, index)
  ),
  settings: normaliseSettings(data.settings)
});

export async function loadBookmarks(): Promise<BookmarkPayload> {
  const baseUrl = resolveBaseUrl();

  if (baseUrl) {
    try {
      const response = await fetch(`${baseUrl.replace(/\/$/, '')}/data/bookmarks.json`, {
        next: { revalidate: 300 }
      });

      if (response.ok) {
        const parsed = (await response.json()) as BookmarkData;
        return toPayload(parsed);
      }
    } catch {
      // swallow and continue to filesystem
    }
  }

  try {
    const raw = await fs.readFile(BOOKMARKS_PATH, 'utf-8');
    const parsed = JSON.parse(raw) as BookmarkData;
    return toPayload(parsed);
  } catch (error) {
    console.warn('Failed to read bookmarks.json', error);
    return friendlyEmpty;
  }
}

