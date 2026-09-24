import { Router } from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import axios from 'axios';
import * as cheerio from 'cheerio';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const toolsRouter = Router();

// Uploads configuration
const uploadDir = path.resolve(__dirname, '../../uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, uploadDir);
  },
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname);
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, `file-${uniqueSuffix}${ext}`);
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
  fileFilter: (_req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed!'));
    }
  }
});

// 单图上传接口
toolsRouter.post('/upload', upload.single('file'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ success: false, message: 'No file uploaded' });
  }

  const fileUrl = `/uploads/${req.file.filename}`;
  res.json({
    success: true,
    url: fileUrl,
    filename: req.file.filename,
    size: req.file.size
  });
});

// 智能获取网站 Favicon 与标题
toolsRouter.get('/metadata', async (req, res) => {
  const targetUrl = req.query.url as string;
  if (!targetUrl) {
    return res.status(400).json({ success: false, message: 'URL is required' });
  }

  let formattedUrl = targetUrl.trim();
  if (!/^https?:\/\//i.test(formattedUrl)) {
    formattedUrl = 'https://' + formattedUrl;
  }

  try {
    const parsed = new URL(formattedUrl);
    const origin = parsed.origin;
    const hostname = parsed.hostname;

    let title = hostname;
    let iconUrl = `https://www.google.com/s2/favicons?domain=${hostname}&sz=128`;

    try {
      const response = await axios.get(formattedUrl, {
        timeout: 4000,
        headers: {
          'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
        }
      });

      const $ = cheerio.load(response.data);
      const pageTitle = $('title').first().text().trim();
      if (pageTitle) {
        // 去除多余后缀如 " - 哔哩哔哩"
        title = pageTitle.split(/[-_|]/)[0].trim() || pageTitle;
      }

      // 提取 link icon
      const iconHref = $('link[rel="apple-touch-icon"]').attr('href') ||
                       $('link[rel="icon"]').attr('href') ||
                       $('link[rel="shortcut icon"]').attr('href');

      if (iconHref) {
        if (iconHref.startsWith('http')) {
          iconUrl = iconHref;
        } else if (iconHref.startsWith('//')) {
          iconUrl = `${parsed.protocol}${iconHref}`;
        } else if (iconHref.startsWith('/')) {
          iconUrl = `${origin}${iconHref}`;
        } else {
          iconUrl = `${origin}/${iconHref}`;
        }
      }
    } catch (fetchErr) {
      // 访问失败时直接降级为 google s2 favicon
      title = hostname.replace(/^www\./, '');
    }

    res.json({
      success: true,
      data: {
        url: formattedUrl,
        title,
        icon: iconUrl,
      }
    });
  } catch (err: any) {
    res.status(400).json({
      success: false,
      message: 'Invalid URL format'
    });
  }
});
