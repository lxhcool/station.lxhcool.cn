import React, { useState, useEffect } from 'react';
import { WidgetStrategy, WidgetInstance, WidgetSize } from '../../types/widget';
import { Sun01Icon, Location01Icon, Compass01Icon } from 'hugeicons-react';

export interface WeatherConfig {
  city: string;
  autoLocation?: boolean;
}

const WeatherWidget: React.FC<{
  instance: WidgetInstance<WeatherConfig>;
  size: WidgetSize;
  openInNewTab?: boolean;
  onUpdateConfig?: (cfg: Partial<WeatherConfig>) => void;
}> = ({ instance, size }) => {
  const { city = '厦门' } = instance.config || {};
  const [temp, setTemp] = useState('28°');
  const [condition, setCondition] = useState('晴');
  const [wind, setWind] = useState('东南风 3级');
  const [aqi, setAqi] = useState('优 42');

  // 2x1 胶囊条
  if (size === '2x1') {
    return (
      <div className="w-full h-full rounded-[16px] bg-gradient-to-br from-[#1a4478]/80 to-[#122442]/90 backdrop-blur-xl p-3 flex items-center justify-between shadow-[0_8px_24px_-4px_rgba(0,0,0,0.35)] select-none">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-amber-400/20 flex items-center justify-center text-amber-400">
            <Sun01Icon size={20} className="animate-[spin_24s_linear_infinite]" />
          </div>
          <div>
            <div className="flex items-center gap-1 text-[13px] font-semibold text-white/95">
              <span>{city}</span>
              <Location01Icon size={12} className="text-white/60" />
            </div>
            <div className="text-[11px] text-white/60 mt-0.5">{condition} · {wind}</div>
          </div>
        </div>
        <div className="text-2xl font-bold tracking-tight text-white pr-1">
          {temp}
        </div>
      </div>
    );
  }

  // 2x2 经典平板方块卡片 (参考图样式)
  return (
    <div className="w-full h-full rounded-[16px] bg-gradient-to-b from-[#1d5292]/85 via-[#183a66]/90 to-[#11233d]/95 backdrop-blur-xl p-4 flex flex-col justify-between shadow-[0_8px_24px_-4px_rgba(0,0,0,0.35)] select-none group">
      {/* 顶部城市与天气微动效图标 */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5 text-sm font-semibold text-white/95">
          <span>{city}</span>
          <Compass01Icon size={13} className="text-white/70" />
        </div>
        <div className="text-amber-400 drop-shadow-[0_2px_10px_rgba(251,191,36,0.5)]">
          <Sun01Icon size={24} className="animate-[spin_20s_linear_infinite]" />
        </div>
      </div>

      {/* 居中特大温度数字 */}
      <div className="my-auto py-1">
        <div className="text-4xl font-extrabold tracking-tight text-white drop-shadow-sm">
          {temp}
        </div>
      </div>

      {/* 底部详细天气与空气质量 */}
      <div className="space-y-0.5 text-[11px] text-white/75 font-medium">
        <div className="truncate">{condition}（{wind}）</div>
        <div className="text-white/50 text-[10.5px]">空气指数：{aqi}</div>
      </div>
    </div>
  );
};

export const weatherStrategy: WidgetStrategy<WeatherConfig> = {
  type: 'weather',
  name: '实时天气',
  description: '经典 iPadOS 风格精美天气卡片，气温、风向风速与空气质量指数',
  icon: Sun01Icon,
  defaultSize: '2x2',
  supportedSizes: ['2x1', '2x2'],
  defaultConfig: {
    city: '厦门',
    autoLocation: true,
  },
  render: WeatherWidget,
};
