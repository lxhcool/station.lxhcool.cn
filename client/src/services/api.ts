import { UserPreferences, WallpaperItem } from '../types';

export const api = {
  // 同步：拉取配置
  async pullConfig(token: string): Promise<{ success: boolean; data?: UserPreferences; message?: string }> {
    try {
      const res = await fetch(`/api/sync/pull/${encodeURIComponent(token)}`);
      return await res.json();
    } catch (err: any) {
      return { success: false, message: err.message };
    }
  },

  // 同步：推送配置
  async pushConfig(token: string, data: UserPreferences, deviceName?: string): Promise<{ success: boolean; message?: string }> {
    try {
      const res = await fetch('/api/sync/push', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, data, deviceName }),
      });
      return await res.json();
    } catch (err: any) {
      return { success: false, message: err.message };
    }
  },

  // 获取官方精选壁纸库
  async getWallpapers(category?: string): Promise<WallpaperItem[]> {
    try {
      const url = category && category !== 'all' ? `/api/wallpapers?category=${category}` : '/api/wallpapers';
      const res = await fetch(url);
      const json = await res.json();
      return json.success ? json.data : [];
    } catch {
      return [];
    }
  },

  // 获取必应每日壁纸
  async getBingWallpaper(): Promise<{ url: string; title: string; copyright: string } | null> {
    try {
      const res = await fetch('/api/wallpapers/bing');
      const json = await res.json();
      return json.success ? json.data : null;
    } catch {
      return null;
    }
  },

  // 抓取网址的标题与 Favicon
  async getSiteMetadata(url: string): Promise<{ url: string; title: string; icon: string } | null> {
    try {
      const res = await fetch(`/api/tools/metadata?url=${encodeURIComponent(url)}`);
      const json = await res.json();
      return json.success ? json.data : null;
    } catch {
      return null;
    }
  },

  // 上传自定义壁纸或图标
  async uploadFile(file: File): Promise<string | null> {
    try {
      const formData = new FormData();
      formData.append('file', file);
      const res = await fetch('/api/tools/upload', {
        method: 'POST',
        body: formData,
      });
      const json = await res.json();
      return json.success ? json.url : null;
    } catch {
      return null;
    }
  },

  // 后台管理 API
  admin: {
    async getStats() {
      const res = await fetch('/api/admin/stats');
      return await res.json();
    },
    async addWallpaper(data: { title: string; url: string; thumbnail?: string; category: string }) {
      const res = await fetch('/api/admin/wallpapers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      return await res.json();
    },
    async deleteWallpaper(id: number) {
      const res = await fetch(`/api/admin/wallpapers/${id}`, { method: 'DELETE' });
      return await res.json();
    },
    async getSites() {
      const res = await fetch('/api/admin/sites');
      return await res.json();
    },
    async addSite(data: { name: string; url: string; icon?: string; category: string; sortOrder?: number }) {
      const res = await fetch('/api/admin/sites', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      return await res.json();
    },
    async deleteSite(id: number) {
      const res = await fetch(`/api/admin/sites/${id}`, { method: 'DELETE' });
      return await res.json();
    },
  }
};
