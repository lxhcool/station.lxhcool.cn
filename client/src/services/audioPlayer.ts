import { Song, PlayMode, PlayerState } from '../widgets/player/types';
import { DEFAULT_SONGS } from '../widgets/player/defaultPlaylist';

type Listener = (state: PlayerState) => void;

class AudioPlayerManager {
  private audio: HTMLAudioElement | null = null;
  private listeners = new Set<Listener>();

  private state: PlayerState = {
    playlist: DEFAULT_SONGS,
    currentIndex: 0,
    currentTrack: DEFAULT_SONGS[0] || null,
    isPlaying: false,
    currentTime: 0,
    duration: DEFAULT_SONGS[0]?.duration || 0,
    volume: 0.65,
    isMuted: false,
    mode: 'sequential',
    isLoading: false,
    error: null,
  };

  private shuffleHistory: number[] = [];

  constructor() {
    if (typeof window !== 'undefined') {
      this.initAudio();
      this.loadSavedState();
    }
  }

  private initAudio() {
    this.audio = new Audio();
    this.audio.preload = 'metadata';
    this.audio.volume = this.state.volume;

    this.audio.addEventListener('timeupdate', () => {
      if (!this.audio) return;
      this.state.currentTime = this.audio.currentTime;
      if (isFinite(this.audio.duration) && this.audio.duration > 0) {
        this.state.duration = this.audio.duration;
      }
      this.notify();
    });

    this.audio.addEventListener('loadedmetadata', () => {
      if (!this.audio) return;
      if (isFinite(this.audio.duration) && this.audio.duration > 0) {
        this.state.duration = this.audio.duration;
      }
      this.notify();
    });

    this.audio.addEventListener('ended', () => {
      if (this.state.mode === 'repeat-one') {
        if (this.audio) {
          this.audio.currentTime = 0;
          this.audio.play().catch(() => {});
        }
      } else {
        this.next();
      }
    });

    this.audio.addEventListener('error', () => {
      this.state.isPlaying = false;
      this.state.error = '音频加载失败或无可用音源';
      this.notify();
    });
  }

  private loadSavedState() {
    try {
      const savedVolume = localStorage.getItem('station_music_volume');
      if (savedVolume !== null) {
        const v = parseFloat(savedVolume);
        if (!isNaN(v)) {
          this.state.volume = Math.max(0, Math.min(1, v));
          if (this.audio) this.audio.volume = this.state.volume;
        }
      }
      const savedMode = localStorage.getItem('station_music_mode') as PlayMode | null;
      if (savedMode && ['sequential', 'shuffle', 'repeat', 'repeat-one'].includes(savedMode)) {
        this.state.mode = savedMode;
      }
    } catch {
      // 忽略隐私模式异常
    }
  }

  public getState(): PlayerState {
    return { ...this.state };
  }

  public subscribe(listener: Listener): () => void {
    this.listeners.add(listener);
    listener(this.getState());
    return () => this.listeners.delete(listener);
  }

  private notify() {
    const currentState = this.getState();
    this.listeners.forEach((fn) => fn(currentState));
  }

  public async loadPlaylist(urlOrId: string) {
    if (!urlOrId) return;

    this.state.isLoading = true;
    this.state.error = null;
    this.notify();

    try {
      // 优先请求本地或代理网易云解析端点
      const apiUrl = `/api/netease/playlist?url=${encodeURIComponent(urlOrId)}`;
      const resp = await fetch(apiUrl);
      if (!resp.ok) {
        throw new Error(`HTTP ${resp.status}`);
      }
      const data = await resp.json();

      if (Array.isArray(data.tracks) && data.tracks.length > 0) {
        this.state.playlist = data.tracks;
        this.state.currentIndex = 0;
        this.state.currentTrack = data.tracks[0];
        this.state.duration = data.tracks[0].duration || 0;
        this.state.currentTime = 0;
        this.state.isLoading = false;
        this.notify();

        // 如果之前正在播放，则切歌后直接开播
        if (this.state.isPlaying) {
          this.play();
        }
      } else {
        throw new Error('歌单为空或未获取到歌曲');
      }
    } catch (err: any) {
      console.warn('Failed to load online playlist, keeping current pool:', err?.message);
      this.state.isLoading = false;
      this.state.error = '加载歌单失败，已保留原歌曲';
      this.notify();
    }
  }

  public async play() {
    if (!this.audio) return;
    const track = this.state.playlist[this.state.currentIndex];
    if (!track) return;

    this.state.currentTrack = track;

    if (this.audio.src !== track.audioUrl) {
      this.audio.src = track.audioUrl;
    }

    try {
      await this.audio.play();
      this.state.isPlaying = true;
      this.state.error = null;
      this.notify();
    } catch (e: any) {
      this.state.isPlaying = false;
      this.state.error = '播放失败，请点击重试';
      this.notify();
    }
  }

  public pause() {
    if (!this.audio) return;
    this.audio.pause();
    this.state.isPlaying = false;
    this.notify();
  }

  public toggle() {
    if (this.state.isPlaying) {
      this.pause();
    } else {
      this.play();
    }
  }

  private getShuffleIndex(): number {
    const len = this.state.playlist.length;
    if (len <= 1) return 0;
    const candidates = [];
    for (let i = 0; i < len; i++) {
      if (i !== this.state.currentIndex && !this.shuffleHistory.slice(-2).includes(i)) {
        candidates.push(i);
      }
    }
    const pool = candidates.length ? candidates : Array.from({ length: len }, (_, i) => i);
    const chosen = pool[Math.floor(Math.random() * pool.length)];
    this.shuffleHistory.push(chosen);
    if (this.shuffleHistory.length > 10) this.shuffleHistory.shift();
    return chosen;
  }

  public next() {
    if (!this.state.playlist.length) return;

    if (this.state.mode === 'shuffle') {
      this.state.currentIndex = this.getShuffleIndex();
    } else if (this.state.mode === 'repeat') {
      this.state.currentIndex = (this.state.currentIndex + 1) % this.state.playlist.length;
    } else if (this.state.mode === 'repeat-one') {
      // 单曲循环重播
    } else {
      // sequential
      if (this.state.currentIndex >= this.state.playlist.length - 1) {
        this.state.currentIndex = 0;
        this.pause();
        return;
      }
      this.state.currentIndex += 1;
    }

    this.state.currentTrack = this.state.playlist[this.state.currentIndex];
    this.play();
  }

  public prev() {
    if (!this.state.playlist.length) return;

    if (this.state.mode === 'shuffle') {
      this.state.currentIndex = this.getShuffleIndex();
    } else if (this.state.mode === 'repeat-one') {
      // 单曲循环重播
    } else {
      this.state.currentIndex =
        (this.state.currentIndex - 1 + this.state.playlist.length) % this.state.playlist.length;
    }

    this.state.currentTrack = this.state.playlist[this.state.currentIndex];
    this.play();
  }

  public selectTrack(index: number) {
    if (index < 0 || index >= this.state.playlist.length) return;
    this.state.currentIndex = index;
    this.state.currentTrack = this.state.playlist[index];
    this.play();
  }

  public seek(ratio: number) {
    if (!this.audio) return;
    const clamped = Math.max(0, Math.min(1, ratio));
    const targetTime = clamped * (this.state.duration || this.audio.duration || 0);
    if (isFinite(targetTime)) {
      this.audio.currentTime = targetTime;
      this.state.currentTime = targetTime;
      this.notify();
    }
  }

  public setVolume(val: number) {
    const clamped = Math.max(0, Math.min(1, val));
    this.state.volume = clamped;
    this.state.isMuted = clamped === 0;
    if (this.audio) {
      this.audio.volume = clamped;
      this.audio.muted = this.state.isMuted;
    }
    try {
      localStorage.setItem('station_music_volume', String(clamped));
    } catch {}
    this.notify();
  }

  public toggleMute() {
    this.state.isMuted = !this.state.isMuted;
    if (this.audio) {
      this.audio.muted = this.state.isMuted;
    }
    this.notify();
  }

  public cycleMode() {
    const modes: PlayMode[] = ['sequential', 'shuffle', 'repeat', 'repeat-one'];
    const curIdx = modes.indexOf(this.state.mode);
    const nextMode = modes[(curIdx + 1) % modes.length];
    this.state.mode = nextMode;
    try {
      localStorage.setItem('station_music_mode', nextMode);
    } catch {}
    this.notify();
  }
}

export const audioPlayer = new AudioPlayerManager();
