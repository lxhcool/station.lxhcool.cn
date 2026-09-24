import { Router } from 'express';
import axios from 'axios';

export const neteaseRouter = Router();

const NETEASE_HEADERS = {
  Referer: 'https://music.163.com/',
  'User-Agent':
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
};

// 内存轻量缓存 (TTL 30 分钟)
const cache = new Map<string, { data: any; expiry: number }>();

function extractPlaylistId(input: string): string {
  if (!input) return '';
  const trimmed = input.trim();
  const idParam = trimmed.match(/[?&#]id=(\d+)/);
  if (idParam) return idParam[1];
  const pathParam = trimmed.match(/playlist\/(\d+)/);
  if (pathParam) return pathParam[1];
  if (/^\d+$/.test(trimmed)) return trimmed;
  return '';
}

neteaseRouter.get('/playlist', async (req, res) => {
  const urlOrId = (req.query.url as string) || (req.query.id as string) || '';
  const playlistId = extractPlaylistId(urlOrId);

  if (!playlistId) {
    return res.status(400).json({ error: '无效的歌单链接或歌单 ID' });
  }

  const cached = cache.get(playlistId);
  if (cached && cached.expiry > Date.now()) {
    return res.json(cached.data);
  }

  try {
    // 1. 获取歌单基础信息与曲目 ID 列表
    const detailResp = await axios.get(
      `https://music.163.com/api/v6/playlist/detail?id=${playlistId}&n=1000&s=8`,
      { headers: NETEASE_HEADERS, timeout: 12000 }
    );

    const playlist = detailResp.data?.result || detailResp.data?.playlist;
    if (!playlist) {
      return res.status(404).json({ error: '歌单不存在或未公开' });
    }

    const trackIds: string[] = (playlist.trackIds || [])
      .map((t: any) => String(t.id || ''))
      .filter(Boolean);

    // 取前 50 首（保证加载速度与流畅体验）
    const targetIds = trackIds.slice(0, 50);

    let songs: any[] = [];
    if (targetIds.length > 0) {
      const songDetailResp = await axios.get(
        `https://music.163.com/api/song/detail/?ids=[${targetIds.map((id) => encodeURIComponent(id)).join(',')}]`,
        { headers: NETEASE_HEADERS, timeout: 12000 }
      );
      songs = songDetailResp.data?.songs || [];
    } else if (Array.isArray(playlist.tracks)) {
      songs = playlist.tracks.slice(0, 50);
    }

    // 按原歌单顺序排序
    const orderMap = new Map(targetIds.map((id, index) => [id, index]));
    songs.sort((a, b) => {
      const ia = orderMap.get(String(a.id)) ?? 999;
      const ib = orderMap.get(String(b.id)) ?? 999;
      return ia - ib;
    });

    // 格式化歌曲信息
    const formattedTracks = songs.map((s: any) => {
      const id = String(s.id);
      const artists = s.artists || s.ar || [];
      const artistNames = artists.map((a: any) => a.name).filter(Boolean);
      const album = s.album || s.al || {};
      const durationMs = s.duration ?? s.dt ?? 0;
      const duration = Math.round(durationMs / 1000);

      return {
        id,
        title: s.name || '未命名歌曲',
        artist: artistNames.join(' / ') || '未知音乐人',
        album: album.name || '',
        cover: album.picUrl || '',
        duration: duration > 0 ? duration : 0,
        // 网易云标准外链音频通道 (支持全跨域播放)
        audioUrl: `https://music.163.com/song/media/outer/url?id=${id}.mp3`,
      };
    });

    const result = {
      id: playlistId,
      title: playlist.name || '精选歌单',
      cover: playlist.coverImgUrl || '',
      trackCount: trackIds.length || formattedTracks.length,
      tracks: formattedTracks,
    };

    // 写入缓存 30 分钟
    cache.set(playlistId, { data: result, expiry: Date.now() + 30 * 60 * 1000 });

    return res.json(result);
  } catch (error: any) {
    console.error('NetEase playlist fetch error:', error?.message);
    return res.status(502).json({ error: '解析网易云歌单失败，请检查网络或稍后重试' });
  }
});
