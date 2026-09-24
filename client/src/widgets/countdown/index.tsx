import React from 'react';
import { WidgetStrategy, WidgetInstance, WidgetSize } from '../../types/widget';
import { HourglassIcon, Calendar03Icon, SparklesIcon } from 'hugeicons-react';

export interface CountdownConfig {
  title: string;
  targetDate: string; // YYYY-MM-DD
  isAnniversary?: boolean; // 是否是累计纪念日
}

const getNextNewYear = () => {
  const nextYear = new Date().getFullYear() + 1;
  return `${nextYear}-01-01`;
};

const DEFAULT_CONFIG: CountdownConfig = {
  title: '元旦跨年',
  targetDate: getNextNewYear(),
  isAnniversary: false,
};

const CountdownWidget: React.FC<{
  instance: WidgetInstance<CountdownConfig>;
  size: WidgetSize;
  isEditing?: boolean;
  onUpdateConfig?: (cfg: Partial<CountdownConfig>) => void;
}> = ({ instance, size }) => {
  const config = { ...DEFAULT_CONFIG, ...(instance.config || {}) };
  const target = new Date(config.targetDate + 'T00:00:00');
  const now = new Date();

  // 计算天数差异
  const diffTime = target.getTime() - now.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  const isPast = diffDays < 0;
  const isToday = diffDays === 0;
  const displayDays = Math.abs(diffDays);

  // 2x1 迷你胶囊规格
  if (size === '2x1') {
    return (
      <div className="w-full h-full rounded-[16px] bg-white/[0.07] hover:bg-white/[0.11] backdrop-blur-xl border border-white/[0.08] shadow-[0_8px_24px_-4px_rgba(0,0,0,0.3)] px-3.5 flex items-center justify-between select-none transition-all duration-200 group">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-8 h-8 rounded-[10px] bg-rose-500/15 text-rose-400 border border-rose-500/25 flex items-center justify-center shrink-0 shadow-[0_0_12px_rgba(244,63,94,0.2)]">
            <HourglassIcon size={16} />
          </div>
          <div className="flex flex-col min-w-0">
            <span className="text-[12.5px] font-semibold text-white/90 truncate tracking-tight">
              {config.title}
            </span>
            <span className="text-[10px] text-white/40 truncate">
              {config.targetDate}
            </span>
          </div>
        </div>

        <div className="flex items-baseline gap-1 shrink-0 pl-2">
          {isToday ? (
            <span className="text-[13px] font-bold text-amber-400 tracking-tight">
              今天！
            </span>
          ) : (
            <>
              <span className="text-[18px] font-black tracking-tight text-white font-mono">
                {displayDays}
              </span>
              <span className="text-[10px] text-white/45">
                {isPast ? '天前' : '天后'}
              </span>
            </>
          )}
        </div>
      </div>
    );
  }

  // 2x2 大号环形/数字仪表盘规格
  return (
    <div className="w-full h-full rounded-[16px] bg-white/[0.07] hover:bg-white/[0.11] backdrop-blur-xl border border-white/[0.08] shadow-[0_8px_24px_-4px_rgba(0,0,0,0.3)] p-3.5 flex flex-col justify-between select-none transition-all duration-200 group relative overflow-hidden">
      {/* 顶部标题与图标 */}
      <div className="flex items-center justify-between z-10">
        <div className="flex items-center gap-1.5 min-w-0">
          <div className="w-6 h-6 rounded-[8px] bg-rose-500/15 text-rose-400 border border-rose-500/20 flex items-center justify-center shrink-0">
            <HourglassIcon size={13} />
          </div>
          <span className="text-[12px] font-semibold text-white/85 truncate tracking-tight">
            {config.title}
          </span>
        </div>

        <span className="text-[10px] text-white/35 font-mono">
          {config.targetDate.slice(5)}
        </span>
      </div>

      {/* 中部核心天数大字 */}
      <div className="flex flex-col items-center justify-center my-auto z-10 py-1">
        {isToday ? (
          <div className="flex flex-col items-center gap-1 text-amber-400">
            <SparklesIcon size={24} className="animate-bounce" />
            <span className="text-[18px] font-black tracking-tight">就是今天！</span>
          </div>
        ) : (
          <div className="flex flex-col items-center">
            <div className="flex items-baseline gap-1">
              <span className="text-[38px] font-black text-white font-mono leading-none tracking-tighter drop-shadow-[0_4px_12px_rgba(0,0,0,0.5)]">
                {displayDays}
              </span>
              <span className="text-[12px] font-semibold text-rose-400/90 tracking-wide">
                DAYS
              </span>
            </div>
            <span className="text-[10.5px] font-medium text-white/45 mt-1 tracking-tight">
              {isPast ? '已经走过那些日子' : `距离目标还剩 ${displayDays} 天`}
            </span>
          </div>
        )}
      </div>

      {/* 底部柔和光条进度 */}
      <div className="w-full bg-white/[0.06] rounded-full h-1.5 overflow-hidden z-10">
        <div
          className="h-full bg-gradient-to-r from-rose-500 to-orange-400 rounded-full transition-all duration-500"
          style={{
            width: isToday ? '100%' : `${Math.min(100, Math.max(8, (100 - displayDays) % 100))}%`,
          }}
        />
      </div>

      {/* 背景微光散斑 */}
      <div className="absolute -right-6 -bottom-6 w-24 h-24 rounded-full bg-rose-500/10 blur-2xl pointer-events-none" />
    </div>
  );
};

export const countdownStrategy: WidgetStrategy<CountdownConfig> = {
  type: 'countdown',
  name: '倒数日',
  description: '重要日子与人生节点倒计时，支持 2x1 胶囊与 2x2 仪式感大方块',
  icon: HourglassIcon,
  defaultSize: '2x2',
  supportedSizes: ['2x1', '2x2'],
  defaultConfig: DEFAULT_CONFIG,
  render: CountdownWidget,
};
