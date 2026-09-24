import { WidgetInstance } from './widget';

export interface WallpaperConfig {
  type: 'ambient' | 'official' | 'bing' | 'custom' | 'gradient';
  url: string;
  blur: number; // 0 - 30
  maskOpacity: number; // 0 - 0.8
  brightness: number; // 0.6 - 1.2
}

export interface SearchEngine {
  id: string;
  name: string;
  icon: string;
  searchUrl: string;
  placeholder: string;
}

export interface WallpaperItem {
  id: number;
  title: string;
  url: string;
  thumbnail: string;
  category: string;
  is_official: number;
}

export interface BookmarkItem {
  id: string;
  title: string;
  url: string;
  icon?: string;
}

export interface UserPreferences {
  version: number;
  wallpaper: WallpaperConfig;
  activeEngineId: string;
  openInNewTab: boolean;
  syncToken: string;
  bookmarks: BookmarkItem[];
  widgets?: WidgetInstance[];
}

export * from './widget';
