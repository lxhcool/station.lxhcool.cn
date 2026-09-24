import React from 'react';
import { WidgetStrategy, WidgetInstance, WidgetSize } from '../../types/widget';
import { MusicNote01Icon } from 'hugeicons-react';
import { PlayerConfig } from './types';
import { PlayerWidget } from './PlayerWidget';

export * from './types';
export * from './defaultPlaylist';
export * from './PlayerWidget';

const PlayerWidgetWrapper: React.FC<{
  instance: WidgetInstance<PlayerConfig>;
  size: WidgetSize;
  isEditing?: boolean;
}> = ({ instance, size }) => {
  return <PlayerWidget widget={instance} size={size} />;
};

export const playerStrategy: WidgetStrategy<PlayerConfig> = {
  type: 'player',
  name: '网易云音乐',
  description: '沉浸式波形与歌单播放器，40柱音频波形跳动与网易云歌单直链解析',
  icon: MusicNote01Icon,
  defaultSize: '4x3',
  supportedSizes: ['4x3'],
  defaultConfig: {
    playlistUrl: 'https://music.163.com/playlist?id=3778678',
    showPlaylist: true,
    defaultVolume: 65,
  },
  render: PlayerWidgetWrapper,
};
