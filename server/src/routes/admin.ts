import { Router } from 'express';
import { db } from '../db/index.js';

export const adminRouter = Router();

// 后台接口密钥鉴权中间件 (从环境变量 ADMIN_TOKEN 读取，若未配置则使用默认保护密钥)
const ADMIN_TOKEN = process.env.ADMIN_TOKEN || 'station_admin_2026';

adminRouter.use((req, res, next) => {
  const reqToken =
    req.headers['x-admin-token'] ||
    (req.headers['authorization'] ? req.headers['authorization'].replace(/^Bearer\s+/i, '') : '') ||
    req.query.admin_token;

  if (!reqToken || reqToken !== ADMIN_TOKEN) {
    return res.status(401).json({
      success: false,
      message: '未授权：管理接口需要提供合法的 X-Admin-Token 请求头',
    });
  }
  next();
});

// 后台概览统计
adminRouter.get('/stats', (_req, res) => {
  const configsCount = (db.prepare('SELECT COUNT(*) as count FROM user_configs').get() as { count: number }).count;
  const wallpapersCount = (db.prepare('SELECT COUNT(*) as count FROM wallpapers').get() as { count: number }).count;
  const sitesCount = (db.prepare('SELECT COUNT(*) as count FROM site_presets').get() as { count: number }).count;

  // 脱敏输出近期同步设备记录，绝不泄露用户完整 SyncToken
  const rawConfigs = db.prepare('SELECT token, device_name, updated_at FROM user_configs ORDER BY updated_at DESC LIMIT 10').all() as any[];
  const recentConfigs = rawConfigs.map((c) => ({
    ...c,
    token: c.token ? (c.token.length > 8 ? `${c.token.slice(0, 4)}****${c.token.slice(-4)}` : '****') : '',
  }));

  res.json({
    success: true,
    data: {
      configsCount,
      wallpapersCount,
      sitesCount,
      recentConfigs,
    },
  });
});

// 壁纸管理：添加
adminRouter.post('/wallpapers', (req, res) => {
  const { title, url, thumbnail, category } = req.body;
  if (!title || !url) {
    return res.status(400).json({ success: false, message: 'Title and URL are required' });
  }

  const insert = db.prepare(`
    INSERT INTO wallpapers (title, url, thumbnail, category, is_official)
    VALUES (?, ?, ?, ?, 1)
  `);

  const info = insert.run(title, url, thumbnail || url, category || 'nature');
  res.json({ success: true, id: info.lastInsertRowid });
});

// 壁纸管理：删除
adminRouter.delete('/wallpapers/:id', (req, res) => {
  const { id } = req.params;
  db.prepare('DELETE FROM wallpapers WHERE id = ?').run(id);
  res.json({ success: true, message: 'Wallpaper deleted' });
});

// 推荐站点管理：获取与添加
adminRouter.get('/sites', (_req, res) => {
  const sites = db.prepare('SELECT * FROM site_presets ORDER BY sort_order ASC, id DESC').all();
  res.json({ success: true, data: sites });
});

adminRouter.post('/sites', (req, res) => {
  const { name, url, icon, category, sortOrder } = req.body;
  if (!name || !url) {
    return res.status(400).json({ success: false, message: 'Name and URL are required' });
  }

  const insert = db.prepare(`
    INSERT INTO site_presets (name, url, icon, category, sort_order)
    VALUES (?, ?, ?, ?, ?)
  `);

  const info = insert.run(name, url, icon || '', category || '常用', sortOrder || 0);
  res.json({ success: true, id: info.lastInsertRowid });
});

adminRouter.delete('/sites/:id', (req, res) => {
  const { id } = req.params;
  db.prepare('DELETE FROM site_presets WHERE id = ?').run(id);
  res.json({ success: true, message: 'Site preset deleted' });
});
