import React, { useState, useEffect, useRef } from 'react';
import { WidgetInstance, WidgetSize } from '../../types/widget';
import { audioPlayer } from '../../services/audioPlayer';
import { PlayerState, PlayerConfig } from './types';
import { DEFAULT_WAVE_BARS } from './defaultPlaylist';
import './player.css';

import {
  PlayIcon,
  PauseIcon,
  NextIcon,
  VolumeHighIcon,
  VolumeLowIcon,
  VolumeMute01Icon,
} from 'hugeicons-react';

interface PlayerWidgetProps {
  widget: WidgetInstance<PlayerConfig>;
  size: WidgetSize;
}

function fmtTime(sec: number): string {
  if (!isFinite(sec) || sec <= 0) return '0:00';
  const m = Math.floor(sec / 60);
  const s = Math.floor(sec % 60);
  return `${m}:${s < 10 ? '0' : ''}${s}`;
}

export const PlayerWidget: React.FC<PlayerWidgetProps> = ({ widget }) => {
  const [playerState, setPlayerState] = useState<PlayerState>(audioPlayer.getState());
  const [showVolumePopover, setShowVolumePopover] = useState(false);
  const waveTrackRef = useRef<HTMLDivElement>(null);
  const volTrackRef = useRef<HTMLDivElement>(null);
  const activeTrackRef = useRef<HTMLButtonElement>(null);

  // 订阅全局音频管理器状态
  useEffect(() => {
    const unsubscribe = audioPlayer.subscribe((state) => {
      setPlayerState(state);
    });
    return () => unsubscribe();
  }, []);

  // 当前播放曲目变动时，平滑滚动至可见区域
  useEffect(() => {
    if (activeTrackRef.current) {
      activeTrackRef.current.scrollIntoView({
        behavior: 'smooth',
        block: 'nearest',
      });
    }
  }, [playerState.currentIndex]);

  // 如果组件配置了特定歌单，自动执行加载
  useEffect(() => {
    if (widget.config?.playlistUrl) {
      audioPlayer.loadPlaylist(widget.config.playlistUrl);
    }
  }, [widget.config?.playlistUrl]);

  const {
    currentTrack,
    isPlaying,
    currentTime,
    duration,
    playlist,
    currentIndex,
    volume,
    isMuted,
    isLoading,
  } = playerState;

  const currentCover = currentTrack?.cover || '';
  const progressRatio = duration > 0 ? Math.min(currentTime / duration, 1) : 0;
  const activeBarCount = Math.ceil(progressRatio * DEFAULT_WAVE_BARS.length);

  // 波形进度条点击 Seek
  const handleWaveSeek = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!waveTrackRef.current) return;
    const rect = waveTrackRef.current.getBoundingClientRect();
    const ratio = (e.clientX - rect.left) / rect.width;
    audioPlayer.seek(ratio);
  };

  // 音量滑块点击与拖动调节
  const handleVolumeChange = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!volTrackRef.current) return;
    const rect = volTrackRef.current.getBoundingClientRect();
    const ratio = (e.clientX - rect.left) / rect.width;
    audioPlayer.setVolume(ratio);
  };

  // 音量图标显示
  const renderVolumeIcon = () => {
    if (isMuted || volume === 0) return <VolumeMute01Icon size={12} />;
    if (volume < 0.5) return <VolumeLowIcon size={12} />;
    return <VolumeHighIcon size={12} />;
  };

  return (
    <div className="pix-music-widget pix-music-immersive">
      {/* 封面高斯模糊全景背景 */}
      {currentCover ? (
        <div
          key={currentCover}
          className="pix-music-cover-bg is-changing"
          style={{ backgroundImage: `url('${currentCover}')` }}
        />
      ) : (
        <div className="pix-music-cover-bg" />
      )}
      <div className="pix-music-cover-overlay" />

      {/* Row 1: Hero Shell (42px) */}
      <div className="pix-music-hero-shell">
        <div className="pix-music-hero">
          <div className="pix-music-cover">
            {currentCover ? (
              <img
                className="pix-music-cover-img"
                src={currentCover}
                alt={currentTrack?.title || '专辑封面'}
              />
            ) : (
              <span className="pix-music-cover-placeholder">
                <PlayIcon size={16} />
              </span>
            )}
          </div>
          <div className="pix-music-info">
            <span className="pix-music-title">
              {currentTrack?.title || (isLoading ? '加载歌单中...' : '暂无歌曲')}
            </span>
            <span className="pix-music-artist">
              {currentTrack?.artist || (isLoading ? '正在获取...' : '')}
            </span>
          </div>
          <div className="pix-music-hero-actions">
            <button
              type="button"
              className="pix-music-hero-btn"
              onClick={() => audioPlayer.toggle()}
              aria-label={isPlaying ? '暂停' : '播放'}
              title={isPlaying ? '暂停' : '播放'}
            >
              {isPlaying ? <PauseIcon size={12} /> : <PlayIcon size={12} className="ml-0.5" />}
            </button>
            <button
              type="button"
              className="pix-music-hero-next"
              onClick={() => audioPlayer.next()}
              aria-label="下一首"
              title="下一首"
            >
              <NextIcon size={12} />
            </button>
            <div
              className="pix-music-wave-volume-control"
              onMouseEnter={() => setShowVolumePopover(true)}
              onMouseLeave={() => setShowVolumePopover(false)}
            >
              <button
                type="button"
                className="pix-music-wave-volume"
                onClick={() => audioPlayer.toggleMute()}
                aria-label={isMuted ? '取消静音' : '静音'}
                title={isMuted ? '取消静音' : '静音'}
              >
                {renderVolumeIcon()}
              </button>
              {showVolumePopover && (
                <div className="pix-music-wave-volume-popover">
                  <div
                    ref={volTrackRef}
                    onClick={handleVolumeChange}
                    className="pix-music-vol-track"
                    role="slider"
                    aria-label="音量"
                  >
                    <span
                      className="pix-music-vol-fill"
                      style={{ width: `${(isMuted ? 0 : volume) * 100}%` }}
                    />
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Row 2: 播放列表 (固定展示 4 首歌曲) */}
      <div className="pix-music-playlist">
        {isLoading && !playlist.length ? (
          <div className="pix-music-skeleton-list">
            {[0, 1, 2, 3].map((i) => (
              <span key={i} className="pix-music-skeleton-row">
                <i className="pix-music-skeleton-index" />
                <i className="pix-music-skeleton-line" />
                <i className="pix-music-skeleton-time" />
              </span>
            ))}
          </div>
        ) : (
          playlist.map((track, idx) => {
            const active = idx === currentIndex;
            return (
              <button
                key={track.id || idx}
                ref={active ? activeTrackRef : undefined}
                type="button"
                onClick={() => audioPlayer.selectTrack(idx)}
                className={`pix-music-track-item ${active ? 'is-active' : ''}`}
              >
                {active && isPlaying ? (
                  <span className="pix-music-eq">
                    <span />
                    <span />
                    <span />
                  </span>
                ) : (
                  <span className="pix-music-idx">{idx + 1}</span>
                )}
                <span className="pix-music-track-meta">
                  <span className="pix-music-trk-title">{track.title}</span>
                  {track.artist && <span className="pix-music-trk-artist">{track.artist}</span>}
                </span>
                <span className="pix-music-trk-duration">{fmtTime(track.duration)}</span>
              </button>
            );
          })
        )}
      </div>

      {/* Row 3: 底部波形胶囊条 (30px) */}
      <div className="pix-music-player-shell">
        <div className="pix-music-wave-player">
          <button
            type="button"
            className="pix-music-wave-play"
            onClick={() => audioPlayer.toggle()}
            aria-label={isPlaying ? '暂停' : '播放'}
            title={isPlaying ? '暂停' : '播放'}
          >
            {isPlaying ? <PauseIcon size={12} /> : <PlayIcon size={12} className="ml-0.5" />}
          </button>
          <div
            ref={waveTrackRef}
            onClick={handleWaveSeek}
            className="pix-music-wave-track"
            role="slider"
            aria-label="播放进度"
          >
            <span className="pix-music-waveform">
              {DEFAULT_WAVE_BARS.map((height, idx) => {
                const isActive = idx < activeBarCount;
                return (
                  <i
                    key={idx}
                    data-music-wave-bar
                    className={isActive ? 'is-active' : ''}
                    style={{ height: `${height}%` }}
                  />
                );
              })}
            </span>
            <span
              className="pix-music-wave-playhead"
              style={{ left: `${progressRatio * 100}%` }}
            />
          </div>
          <span className="pix-music-wave-duration">{fmtTime(duration)}</span>
        </div>
      </div>
    </div>
  );
};
