export interface Song {
  id: string;
  title: string;
  artist: string;
  album?: string;
  cover: string;
  duration: number; // 秒
  audioUrl: string;
}

export interface PlaylistData {
  id: string;
  title: string;
  cover: string;
  trackCount: number;
  tracks: Song[];
}

export interface PlayerConfig {
  playlistUrl?: string;
  showPlaylist?: boolean;
  defaultVolume?: number;
  autoPlay?: boolean;
}

export type PlayMode = 'sequential' | 'shuffle' | 'repeat' | 'repeat-one';

export interface PlayerState {
  playlist: Song[];
  currentIndex: number;
  currentTrack: Song | null;
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  volume: number; // 0 ~ 1
  isMuted: boolean;
  mode: PlayMode;
  isLoading: boolean;
  error: string | null;
}
