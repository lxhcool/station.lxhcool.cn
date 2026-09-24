import { Router } from 'express';
import { db } from '../db/index.js';

export const syncRouter = Router();

// 拉取指定 Token 的云端配置
syncRouter.get('/pull/:token', (req, res) => {
  const { token } = req.params;
  if (!token) {
    return res.status(400).json({ success: false, message: 'Token is required' });
  }

  const row = db.prepare('SELECT token, data, updated_at FROM user_configs WHERE token = ?').get(token) as { token: string; data: string; updated_at: string } | undefined;

  if (!row) {
    return res.status(404).json({ success: false, message: 'No remote configuration found for this token' });
  }

  try {
    const parsedData = JSON.parse(row.data);
    res.json({
      success: true,
      token: row.token,
      data: parsedData,
      updatedAt: row.updated_at
    });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to parse stored config JSON' });
  }
});

// 保存/同步当前配置
syncRouter.post('/push', (req, res) => {
  const { token, data, deviceName } = req.body;
  if (!token || !data) {
    return res.status(400).json({ success: false, message: 'Token and data are required' });
  }

  const serializedData = typeof data === 'string' ? data : JSON.stringify(data);
  const now = new Date().toISOString();

  const upsert = db.prepare(`
    INSERT INTO user_configs (token, data, device_name, updated_at)
    VALUES (?, ?, ?, ?)
    ON CONFLICT(token) DO UPDATE SET
      data = excluded.data,
      device_name = excluded.device_name,
      updated_at = excluded.updated_at
  `);

  upsert.run(token, serializedData, deviceName || 'Web Browser', now);

  res.json({
    success: true,
    message: 'Configuration synced successfully',
    updatedAt: now
  });
});
