import React, { useState, useEffect } from 'react';
import { WidgetStrategy, WidgetInstance, WidgetSize } from '../../types/widget';
import { GithubIcon, GitCommitIcon, FireIcon } from 'hugeicons-react';

export interface GithubConfig {
  username: string;
}

const DEFAULT_CONFIG: GithubConfig = {
  username: 'torvalds',
};

interface ContributionDay {
  date: string;
  count: number;
  level: number; // 0, 1, 2, 3, 4
}

const LEVEL_COLORS = [
  'rgba(255, 255, 255, 0.05)', // level 0: 空白底色
  '#0e4429',                     // level 1: 微绿
  '#006d32',                     // level 2: 中绿
  '#26a641',                     // level 3: 亮绿
  '#39d353',                     // level 4: 极光绿
];

const GithubWidget: React.FC<{
  instance: WidgetInstance<GithubConfig>;
  size: WidgetSize;
  openInNewTab?: boolean;
  isEditing?: boolean;
}> = ({ instance, size, openInNewTab, isEditing }) => {
  const config = { ...DEFAULT_CONFIG, ...(instance.config || {}) };
  const username = config.username.trim() || 'torvalds';

  const [total, setTotal] = useState<number>(842);
  const [contributions, setContributions] = useState<ContributionDay[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    let cancelled = false;

    const fetchContributions = async () => {
      setLoading(true);
      try {
        const res = await fetch(`https://github-contributions-api.jogruber.de/v4/${username}?y=last`);
        if (res.ok) {
          const data = await res.json();
          if (!cancelled && data.contributions) {
            setTotal(data.total?.[new Date().getFullYear()] || data.total?.lastYear || 842);
            // 提取最近的一组贡献点 (展示 140 天 = 20 周整)
            setContributions(data.contributions.slice(-140));
          }
        }
      } catch {
        // 网络异常兜底模拟数据
        if (!cancelled) {
          const mockDays: ContributionDay[] = Array.from({ length: 140 }, (_, i) => ({
            date: `2026-${i}`,
            count: Math.floor(Math.random() * 5),
            level: Math.floor(Math.random() * 5),
          }));
          setContributions(mockDays);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    fetchContributions();
    return () => {
      cancelled = true;
    };
  }, [username]);

  const handleClick = (e: React.MouseEvent) => {
    if (isEditing) return;
    window.open(`https://github.com/${username}`, openInNewTab ? '_blank' : '_self');
  };

  // 2x1 迷你开发者名片规格
  if (size === '2x1') {
    return (
      <div
        onClick={handleClick}
        className="w-full h-full rounded-[18px] bg-white/[0.08] hover:bg-white/[0.14] active:scale-98 backdrop-blur-xl border border-white/[0.08] shadow-[0_8px_24px_-4px_rgba(0,0,0,0.3)] px-3.5 flex items-center gap-3 select-none transition-all duration-200 cursor-pointer group"
      >
        <div className="relative w-9 h-9 rounded-[11px] bg-white/[0.08] flex items-center justify-center shrink-0 border border-white/[0.1] group-hover:border-white/20 transition-colors">
          <GithubIcon size={18} className="text-white/85 group-hover:text-white transition-colors" />
          <div className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-emerald-400 ring-2 ring-slate-950/80 animate-pulse" />
        </div>
        <div className="flex flex-col min-w-0 flex-1 justify-center">
          <span className="text-[12.5px] font-semibold text-white/95 group-hover:text-white truncate tracking-tight transition-colors">
            @{username}
          </span>
          <span className="text-[11px] font-mono text-emerald-400/90 truncate flex items-center gap-1 mt-0.5">
            <GitCommitIcon size={11} className="shrink-0 text-emerald-400" />
            <span className="font-semibold">{total}</span>
            <span className="text-[10px] text-white/45 font-sans">提交</span>
          </span>
        </div>
      </div>
    );
  }

  // 4x2 完整年度贡献热力图大方卡
  return (
    <div
      onClick={handleClick}
      className="w-full h-full rounded-[16px] bg-white/[0.07] hover:bg-white/[0.11] backdrop-blur-xl border border-white/[0.08] shadow-[0_8px_24px_-4px_rgba(0,0,0,0.3)] px-3.5 py-2.5 flex flex-col justify-between select-none transition-all duration-200 cursor-pointer group relative overflow-hidden"
    >
      {/* 顶部个人信息与统计 */}
      <div className="flex items-center justify-between z-10">
        <div className="flex items-center gap-2">
          <div className="w-5.5 h-5.5 rounded-[7px] bg-white/[0.08] flex items-center justify-center border border-white/[0.1]">
            <GithubIcon size={13} className="text-white/90" />
          </div>
          <span className="text-[12px] font-semibold text-white/90 tracking-tight">
            @{username}
          </span>
        </div>

        <div className="flex items-center gap-1.5 text-[11px] text-white/50 font-mono">
          <span className="text-emerald-400 font-bold">{total}</span>
          <span>contributions</span>
        </div>
      </div>

      {/* 中部 GitHub 经典绿色热力图小格子 (CSS Grid 流动排布，7行代表周日到周六完整展示) */}
      <div className="flex-1 flex items-center justify-center my-0.5 z-10">
        {loading ? (
          <div className="text-[11px] text-white/30 italic flex items-center gap-1.5">
            <div className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
            <span>加载热力图中...</span>
          </div>
        ) : (
          <div className="grid grid-flow-col grid-rows-7 gap-[2.5px] auto-cols-[8px] items-center justify-center">
            {contributions.slice(-140).map((day, idx) => (
              <div
                key={idx}
                className="w-[8px] h-[8px] rounded-[2px] transition-transform hover:scale-125 hover:z-20 cursor-pointer"
                style={{
                  backgroundColor: LEVEL_COLORS[Math.min(day.level, 4)] || LEVEL_COLORS[0],
                }}
                title={`${day.date}: ${day.count} 次提交`}
              />
            ))}
          </div>
        )}
      </div>

      {/* 底部说明与色阶 (无底部分割线，轻盈通透) */}
      <div className="flex items-center justify-between text-[10px] text-white/40 z-10">
        <span className="truncate">GitHub 贡献热力图</span>
        <div className="flex items-center gap-1 font-mono">
          <span>Less</span>
          {LEVEL_COLORS.map((col, i) => (
            <div
              key={i}
              className="w-[7px] h-[7px] rounded-[1.5px]"
              style={{ backgroundColor: col }}
            />
          ))}
          <span>More</span>
        </div>
      </div>

      {/* 极客绿光晕 */}
      <div className="absolute -right-6 -bottom-6 w-24 h-24 rounded-full bg-emerald-500/10 blur-2xl pointer-events-none" />
    </div>
  );
};

export const githubStrategy: WidgetStrategy<GithubConfig> = {
  type: 'github',
  name: 'GitHub',
  description: '展示 GitHub 提交热力图格子与贡献量，支持 2x1 极简名片与 4x2 完整热力盘',
  icon: GithubIcon,
  defaultSize: '4x2',
  supportedSizes: ['2x1', '4x2'],
  defaultConfig: DEFAULT_CONFIG,
  render: GithubWidget,
};
