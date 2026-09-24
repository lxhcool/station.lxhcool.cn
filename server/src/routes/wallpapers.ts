import { Router } from 'express';
import { db } from '../db/index.js';
import axios from 'axios';

export const wallpaperRouter = Router();

let cachedBingWallpaper: { url: string; title: string; copyright: string; timestamp: number } | null = null;

// 获取所有壁纸
wallpaperRouter.get('/', (req, res) => {
  const { category } = req.query;
  let query = 'SELECT * FROM wallpapers';
  const params: any[] = [];

  if (category && category !== 'all') {
    query += ' WHERE category = ?';
    params.push(category);
  }

  query += ' ORDER BY id DESC';

  const rows = db.prepare(query).all(...params);
  res.json({ success: true, data: rows });
});

// 获取必应每日一图 (带内存缓存)
wallpaperRouter.get('/bing', async (_req, res) => {
  const now = Date.now();
  // 缓存 1 小时
  if (cachedBingWallpaper && (now - cachedBingWallpaper.timestamp < 3600 * 1000)) {
    return res.json({ success: true, data: cachedBingWallpaper });
  }

  try {
    const response = await axios.get('https://cn.bing.com/HPImageArchive.aspx?format=js&idx=0&n=1&mkt=zh-CN', {
      timeout: 5000,
    });
    const imageInfo = response.data?.images?.[0];
    if (imageInfo) {
      const fullUrl = imageInfo.url.startsWith('http') ? imageInfo.url : `https://cn.bing.com${imageInfo.url}`;
      cachedBingWallpaper = {
        url: fullUrl,
        title: imageInfo.title || 'Bing Daily Wallpaper',
        copyright: imageInfo.copyright || '',
        timestamp: now,
      };
      return res.json({ success: true, data: cachedBingWallpaper });
    }
    throw new Error('No image returned from Bing');
  } catch (error: any) {
    // 降级兜底图
    res.json({
      success: true,
      data: {
        url: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=2880&q=85',
        title: '静谧旷野',
        copyright: 'Fallback Image',
        timestamp: now,
      }
    });
  }
});
