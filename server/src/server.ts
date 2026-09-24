import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import { initDB } from './db/index.js';
import { syncRouter } from './routes/sync.js';
import { wallpaperRouter } from './routes/wallpapers.js';
import { toolsRouter } from './routes/tools.js';
import { adminRouter } from './routes/admin.js';
import { neteaseRouter } from './routes/netease.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3001;

// 初始化 SQLite 数据库
initDB();

// 基础中间件
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// 静态文件目录服务
const uploadsDir = path.resolve(__dirname, '../uploads');
app.use('/uploads', express.static(uploadsDir));

// 路由挂载
app.use('/api/sync', syncRouter);
app.use('/api/wallpapers', wallpaperRouter);
app.use('/api/tools', toolsRouter);
app.use('/api/admin', adminRouter);
app.use('/api/netease', neteaseRouter);

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.listen(PORT, () => {
  console.log(`🚀 Station API Server is running at http://localhost:${PORT}`);
});
