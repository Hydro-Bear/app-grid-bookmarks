export interface Bookmark {
  id: string;
  title: string;
  url: string;
  description: string;
  iconSrc?: string;
  color?: string;
  tags?: string[];
  order?: number;
  featured?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface Settings {
  iconSize: number;
  radius: number;
  gap: number;
  columns: {
    sm: number;
    md: number;
    lg: number;
  };
}

export interface BookmarkData {
  bookmarks: Bookmark[];
  settings: Settings;
}

export type SortOption = 'manual' | 'alpha' | 'recent';

export interface BookmarkPayload extends BookmarkData {
  message?: string;
}
