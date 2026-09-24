import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const dataDir = path.resolve(__dirname, '../../data');
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

const dbPath = path.join(dataDir, 'station.db');
export const db = new Database(dbPath);

// Enable WAL mode for performance
db.pragma('journal_mode = WAL');

// Initialize schema
export function initDB() {
  db.exec(`
    CREATE TABLE IF NOT EXISTS user_configs (
      token TEXT PRIMARY KEY,
      data TEXT NOT NULL,
      device_name TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS wallpapers (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      url TEXT NOT NULL,
      thumbnail TEXT,
      category TEXT NOT NULL DEFAULT 'nature',
      is_official INTEGER DEFAULT 1,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS site_presets (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      url TEXT NOT NULL,
      icon TEXT,
      category TEXT NOT NULL DEFAULT '常用',
      sort_order INTEGER DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `);

  seedDefaultData();
}

function seedDefaultData() {
  const wallpaperCount = db.prepare('SELECT COUNT(*) as count FROM wallpapers').get() as { count: number };
  if (wallpaperCount.count === 0) {
    const insertWallpaper = db.prepare(`
      INSERT INTO wallpapers (title, url, thumbnail, category, is_official)
      VALUES (@title, @url, @thumbnail, @category, 1)
    `);

    const defaults = [
      {
        title: '梦幻雪山与极光',
        url: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=2880&q=85',
        thumbnail: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=600&q=70',
        category: 'nature'
      },
      {
        title: '静谧旷野与星河',
        url: 'https://images.unsplash.com/photo-1519681393784-d120267933ba?auto=format&fit=crop&w=2880&q=85',
        thumbnail: 'https://images.unsplash.com/photo-1519681393784-d120267933ba?auto=format&fit=crop&w=600&q=70',
        category: 'nature'
      },
      {
        title: '赛博霓虹都市',
        url: 'https://images.unsplash.com/photo-1514565131-fce0801e5785?auto=format&fit=crop&w=2880&q=85',
        thumbnail: 'https://images.unsplash.com/photo-1514565131-fce0801e5785?auto=format&fit=crop&w=600&q=70',
        category: 'cyberpunk'
      },
      {
        title: '暮光群山云海',
        url: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=2880&q=85',
        thumbnail: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=600&q=70',
        category: 'nature'
      },
      {
        title: '极简流光渐变',
        url: 'https://images.unsplash.com/photo-1550684848-fac1c5b4e853?auto=format&fit=crop&w=2880&q=85',
        thumbnail: 'https://images.unsplash.com/photo-1550684848-fac1c5b4e853?auto=format&fit=crop&w=600&q=70',
        category: 'abstract'
      },
      {
        title: '未来空间几何',
        url: 'https://images.unsplash.com/photo-1508739773434-c26b3d09e071?auto=format&fit=crop&w=2880&q=85',
        thumbnail: 'https://images.unsplash.com/photo-1508739773434-c26b3d09e071?auto=format&fit=crop&w=600&q=70',
        category: 'minimal'
      },
      {
        title: '落日晚霞海岸',
        url: 'https://images.unsplash.com/photo-1495616811223-4d98c6e9c869?auto=format&fit=crop&w=2880&q=85',
        thumbnail: 'https://images.unsplash.com/photo-1495616811223-4d98c6e9c869?auto=format&fit=crop&w=600&q=70',
        category: 'nature'
      }
    ];

    const insertMany = db.transaction((items) => {
      for (const item of items) insertWallpaper.run(item);
    });
    insertMany(defaults);
  }

  const siteCount = db.prepare('SELECT COUNT(*) as count FROM site_presets').get() as { count: number };
  if (siteCount.count === 0) {
    const insertSite = db.prepare(`
      INSERT INTO site_presets (name, url, icon, category, sort_order)
      VALUES (@name, @url, @icon, @category, @sort_order)
    `);

    const defaultSites = [
      { name: 'GitHub', url: 'https://github.com', icon: 'https://github.githubassets.com/favicons/favicon.svg', category: '开发', sort_order: 1 },
      { name: 'Bilibili', url: 'https://www.bilibili.com', icon: 'https://www.bilibili.com/favicon.ico', category: '娱乐', sort_order: 2 },
      { name: '知乎', url: 'https://www.zhihu.com', icon: 'https://static.zhihu.com/heifetz/favicon.ico', category: '资讯', sort_order: 3 },
      { name: 'V2EX', url: 'https://www.v2ex.com', icon: 'https://www.v2ex.com/static/favicon.ico', category: '开发', sort_order: 4 },
      { name: 'YouTube', url: 'https://www.youtube.com', icon: 'https://www.youtube.com/s/desktop/f67596ff/img/favicon_144x144.png', category: '娱乐', sort_order: 5 },
      { name: 'Notion', url: 'https://www.notion.so', icon: 'https://www.notion.so/front-static/favicon.ico', category: '效率', sort_order: 6 },
    ];

    const insertManySites = db.transaction((sites) => {
      for (const site of sites) insertSite.run(site);
    });
    insertManySites(defaultSites);
  }
}
