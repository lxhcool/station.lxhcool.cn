import { useState, useEffect, useRef, useCallback } from 'react';
import { UserPreferences, BookmarkItem, WidgetInstance } from '../types';
import { api } from '../services/api';

const STORAGE_KEY = 'station_user_preferences_v2';

const generateSyncToken = () => {
  return 'st_' + Math.random().toString(36).substring(2, 8) + Date.now().toString(36);
};

export const DEFAULT_BOOKMARKS: BookmarkItem[] = [
  { id: '1', title: 'GitHub', url: 'https://github.com', icon: 'https://github.githubassets.com/favicons/favicon.svg' },
  { id: '2', title: 'Bilibili', url: 'https://www.bilibili.com', icon: 'https://www.bilibili.com/favicon.ico' },
  { id: '3', title: '知乎', url: 'https://www.zhihu.com', icon: 'https://static.zhihu.com/heifetz/favicon.ico' },
  { id: '4', title: 'YouTube', url: 'https://www.youtube.com', icon: 'https://www.youtube.com/s/desktop/f67596ff/img/favicon_144x144.png' },
  { id: '5', title: 'Notion', url: 'https://www.notion.so', icon: 'https://www.notion.so/front-static/favicon.ico' },
  { id: '6', title: 'V2EX', url: 'https://www.v2ex.com', icon: 'https://www.v2ex.com/static/favicon.ico' },
];

export const DEFAULT_WIDGETS: WidgetInstance[] = [
  { id: 'w_weather', type: 'weather', size: '2x2', config: { city: '厦门' } },
  { id: 'w_calendar', type: 'calendar', size: '2x2', config: { showLunar: true } },
  { id: 'w_github', type: 'github', size: '4x2', config: { username: 'lxhcool' } },
  {
    id: 'w_folder_life',
    type: 'folder',
    size: '2x2',
    config: {
      title: '生活',
      items: [
        { id: 'f_1', title: '高德地图', url: 'https://amap.com', icon: 'https://amap.com/favicon.ico' },
        { id: 'f_2', title: '铁路12306', url: 'https://www.12306.cn', icon: 'https://www.12306.cn/favicon.ico' },
        { id: 'f_3', title: '微信读书', url: 'https://weread.qq.com', icon: 'https://weread.qq.com/favicon.ico' },
        { id: 'f_4', title: '哔哩哔哩', url: 'https://www.bilibili.com', icon: 'https://www.bilibili.com/favicon.ico' },
        { id: 'f_5', title: '知乎', url: 'https://www.zhihu.com', icon: 'https://static.zhihu.com/heifetz/favicon.ico' },
        { id: 'f_6', title: '网易云', url: 'https://music.163.com', icon: 'https://music.163.com/favicon.ico' },
        { id: 'f_7', title: 'GitHub', url: 'https://github.com', icon: 'https://github.githubassets.com/favicons/favicon.svg' },
        { id: 'f_8', title: '少数派', url: 'https://sspai.com', icon: 'https://sspai.com/favicon.ico' },
      ],
    },
  },
  { id: 'bm_1', type: 'bookmark', size: '1x1', config: { title: 'GitHub', url: 'https://github.com', icon: 'https://github.githubassets.com/favicons/favicon.svg' } },
  { id: 'bm_2', type: 'bookmark', size: '1x1', config: { title: 'Bilibili', url: 'https://www.bilibili.com', icon: 'https://www.bilibili.com/favicon.ico' } },
  { id: 'bm_3', type: 'bookmark', size: '1x1', config: { title: '知乎', url: 'https://www.zhihu.com', icon: 'https://static.zhihu.com/heifetz/favicon.ico' } },
  { id: 'bm_4', type: 'bookmark', size: '1x1', config: { title: 'YouTube', url: 'https://www.youtube.com', icon: 'https://www.youtube.com/s/desktop/f67596ff/img/favicon_144x144.png' } },
  { id: 'bm_5', type: 'bookmark', size: '1x1', config: { title: 'Notion', url: 'https://www.notion.so', icon: 'https://www.notion.so/front-static/favicon.ico' } },
];


export const DEFAULT_PREFERENCES: UserPreferences = {
  version: 2,
  wallpaper: {
    type: 'ambient',
    url: '',
    blur: 0,
    maskOpacity: 0.2,
    brightness: 1,
  },
  activeEngineId: 'google',
  openInNewTab: true,
  syncToken: '',
  bookmarks: DEFAULT_BOOKMARKS,
  widgets: DEFAULT_WIDGETS,
};

export function usePreferences() {
  const [preferences, setPreferences] = useState<UserPreferences>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (!parsed.syncToken) {
          parsed.syncToken = generateSyncToken();
        }
        if (!parsed.bookmarks || !Array.isArray(parsed.bookmarks)) {
          parsed.bookmarks = DEFAULT_BOOKMARKS;
        }
        if (!parsed.widgets || !Array.isArray(parsed.widgets)) {
          if (parsed.bookmarks && Array.isArray(parsed.bookmarks) && parsed.bookmarks.length > 0) {
            parsed.widgets = [
              { id: 'w_weather', type: 'weather', size: '2x2', config: { city: '厦门' } },
              { id: 'w_calendar', type: 'calendar', size: '2x2', config: { showLunar: true } },
              ...parsed.bookmarks.map((b: any) => ({
                id: 'bm_' + b.id,
                type: 'bookmark',
                size: '1x1',
                config: { title: b.title, url: b.url, icon: b.icon },
              })),
            ];
          } else {
            parsed.widgets = DEFAULT_WIDGETS;
          }
        } else {
          parsed.widgets = parsed.widgets.map((w: any) => {
            if (w.type === 'player' && w.size !== '4x3') {
              return { ...w, size: '4x3' };
            }
            return w;
          });
        }
        return { ...DEFAULT_PREFERENCES, ...parsed };
      }
    } catch (e) {
      console.error('Failed to load local preferences', e);
    }
    return {
      ...DEFAULT_PREFERENCES,
      syncToken: generateSyncToken(),
    };
  });

  const syncTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // 保存到本地并自动防抖推送到服务端
  const updatePreferences = useCallback((updater: Partial<UserPreferences> | ((prev: UserPreferences) => UserPreferences)) => {
    setPreferences((prev) => {
      const next = typeof updater === 'function' ? updater(prev) : { ...prev, ...updater };
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      } catch (e) {
        console.error('Failed to save to localStorage', e);
      }

      // 防抖同步
      if (syncTimeoutRef.current) {
        clearTimeout(syncTimeoutRef.current);
      }
      syncTimeoutRef.current = setTimeout(async () => {
        await api.pushConfig(next.syncToken, next);
      }, 1000);

      return next;
    });
  }, []);

  useEffect(() => {
    if (preferences.syncToken) {
      api.pullConfig(preferences.syncToken).then((res) => {
        if (res.success && res.data) {
          setPreferences((prev) => ({
            ...prev,
            ...res.data,
          }));
        } else {
          api.pushConfig(preferences.syncToken, preferences);
        }
      });
    }
  }, []);

  return {
    preferences,
    updatePreferences,
  };
}
