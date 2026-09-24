import { Song } from './types';

export const PRESET_PLAYLISTS = [
  { id: '3778678', name: '云音乐热歌榜', desc: '全网高热度流行金曲' },
  { id: '19723756', name: '云音乐飙升榜', desc: '当下最新上升热门新歌' },
  { id: '26467411', name: '专注与睡眠轻音乐', desc: '白噪音、Lo-Fi 与疗愈钢琴' },
  { id: '2829883282', name: '经典宝藏粤语', desc: '岁月留声港乐典藏' },
];

export const DEFAULT_SONGS: Song[] = [
  {
    id: '1827600686',
    title: '海阔天空',
    artist: 'Beyond',
    album: '海阔天空',
    cover: 'https://p2.music.126.net/H9vP5Hk7qX9uB4wY7zTj3Q==/109951165809706346.jpg',
    duration: 326,
    audioUrl: 'https://music.163.com/song/media/outer/url?id=1827600686.mp3',
  },
  {
    id: '186016',
    title: '晴天',
    artist: '周杰伦',
    album: '叶惠美',
    cover: 'https://p2.music.126.net/cuzMsh4E1k5kCjQn2wzG5A==/109951165578761219.jpg',
    duration: 269,
    audioUrl: 'https://music.163.com/song/media/outer/url?id=186016.mp3',
  },
  {
    id: '139774',
    title: '起风了',
    artist: '买辣椒也用券',
    album: '起风了',
    cover: 'https://p2.music.126.net/diGAyEmpymHgQIsnRHcw-w==/109951163699673355.jpg',
    duration: 325,
    audioUrl: 'https://music.163.com/song/media/outer/url?id=139774.mp3',
  },
  {
    id: '1436709403',
    title: '夏天的风',
    artist: '火羊瞌睡了',
    album: '夏天的风',
    cover: 'https://p2.music.126.net/mF-uXf22uWbS0Y11c6z26w==/109951164858066266.jpg',
    duration: 219,
    audioUrl: 'https://music.163.com/song/media/outer/url?id=1436709403.mp3',
  },
  {
    id: '287035',
    title: '夜的第七章',
    artist: '周杰伦',
    album: '依然范特西',
    cover: 'https://p2.music.126.net/26uEw0z1W2L_gU7hXm8LRA==/109951165578761230.jpg',
    duration: 228,
    audioUrl: 'https://music.163.com/song/media/outer/url?id=287035.mp3',
  },
];

// 40 根音频波形柱的经典高度比例 (完全同步 glintide1 规范)
export const DEFAULT_WAVE_BARS = [
  28, 42, 64, 48, 76, 56, 88, 68, 44, 80, 52, 72, 92, 60, 36, 70, 84, 54, 76, 46,
  66, 86, 58, 74, 40, 62, 82, 50, 70, 90, 56, 74, 44, 68, 84, 52, 64, 78, 48, 70,
];
