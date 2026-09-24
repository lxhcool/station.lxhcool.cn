import React, { useState } from 'react';
import { WidgetStrategy, WidgetInstance, WidgetSize } from '../../types/widget';
import { FireIcon } from 'hugeicons-react';

export interface HotBoardConfig {
  defaultPlatform?: 'weibo' | 'bilibili' | 'zhihu';
}

interface HotItem {
  id: number;
  title: string;
  hot: string;
  url: string;
}

const MOCK_DATA: Record<string, HotItem[]> = {
  weibo: [
    { id: 1, title: '空间站交会对接圆满成功', hot: '234.1万', url: 'https://s.weibo.com' },
    { id: 2, title: '全国多地秋高气爽开启降温模式', hot: '182.4万', url: 'https://s.weibo.com' },
    { id: 3, title: '国产大飞机C919商业飞行突破万小时', hot: '128.0万', url: 'https://s.weibo.com' },
    { id: 4, title: '全新旅行探险者系列车型开启预订', hot: '95.9万', url: 'https://s.weibo.com' },
    { id: 5, title: '科技博主分享自制智能家居中控', hot: '75.2万', url: 'https://s.weibo.com' },
    { id: 6, title: '国家地理评选年度最美自然风景', hot: '66.3万', url: 'https://s.weibo.com' },
    { id: 7, title: '经典怀旧游戏高清重制版发布', hot: '58.7万', url: 'https://s.weibo.com' },
  ],
  bilibili: [
    { id: 1, title: '耗时半年用纯纯纯手工打造微缩故宫', hot: '198.5万', url: 'https://www.bilibili.com' },
    { id: 2, title: '深度解析最新前沿人工智能大模型', hot: '142.1万', url: 'https://www.bilibili.com' },
    { id: 3, title: '如何用 500 块搭建一台超静音家庭服务器', hot: '110.3万', url: 'https://www.bilibili.com' },
    { id: 4, title: '2026 年度十大必看高分纪录片盘点', hot: '84.6万', url: 'https://www.bilibili.com' },
    { id: 5, title: '带你体验零下40度的极地生活是怎样的', hot: '69.1万', url: 'https://www.bilibili.com' },
    { id: 6, title: '音乐人自制治愈系白噪音助眠合集', hot: '52.4万', url: 'https://www.bilibili.com' },
  ],
  zhihu: [
    { id: 1, title: '有哪些看似反直觉却完全符合科学的物理常识？', hot: '175.8万', url: 'https://www.zhihu.com' },
    { id: 2, title: '如何在喧嚣的信息时代保持深度思考与专注？', hot: '133.0万', url: 'https://www.zhihu.com' },
    { id: 3, title: '程序员如何设计一套高内聚低耦合的可扩展组件架构？', hot: '96.4万', url: 'https://www.zhihu.com' },
    { id: 4, title: '有哪些让你惊艳的极简桌面美学设计与灵感？', hot: '81.2万', url: 'https://www.zhihu.com' },
    { id: 5, title: '未来十年个人数字助理会发生哪些颠覆性进化？', hot: '63.9万', url: 'https://www.zhihu.com' },
  ],
};

const HotBoardWidget: React.FC<{
  instance: WidgetInstance<HotBoardConfig>;
  size: WidgetSize;
  openInNewTab?: boolean;
  onUpdateConfig?: (cfg: Partial<HotBoardConfig>) => void;
}> = ({ instance, size, openInNewTab }) => {
  const [platform, setPlatform] = useState<'weibo' | 'bilibili' | 'zhihu'>(
    instance.config?.defaultPlatform || 'weibo'
  );

  const items = MOCK_DATA[platform] || MOCK_DATA.weibo;
  const displayItems = size === '4x2' ? items.slice(0, 3) : items.slice(0, 7);

  const handleItemClick = (url: string) => {
    window.open(url, openInNewTab ? '_blank' : '_self');
  };

  return (
    <div className="w-full h-full rounded-[16px] bg-[#141620]/90 backdrop-blur-xl p-3.5 flex flex-col justify-between shadow-[0_8px_24px_-4px_rgba(0,0,0,0.35)] select-none">
      {/* 顶部平台切换 Tabs */}
      <div className="flex items-center justify-between pb-2 border-b border-white/[0.06]">
        <div className="flex items-center gap-1">
          {[
            { id: 'weibo', label: '微博' },
            { id: 'bilibili', label: 'B站' },
            { id: 'zhihu', label: '知乎' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setPlatform(tab.id as any)}
              className={`px-2 py-0.5 rounded-[8px] text-[11px] font-medium transition-colors cursor-pointer ${
                platform === tab.id
                  ? 'bg-blue-600/80 text-white shadow-sm'
                  : 'text-white/50 hover:text-white/80'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-1 text-[11px] font-bold text-white/90">
          <FireIcon size={13} className="text-orange-500" />
          <span>实时热榜</span>
        </div>
      </div>

      {/* 榜单条目列表 */}
      <div className="flex-1 flex flex-col justify-around py-1 space-y-1">
        {displayItems.map((item, idx) => {
          const rank = idx + 1;
          const isTop3 = rank <= 3;
          return (
            <div
              key={item.id}
              onClick={() => handleItemClick(item.url)}
              className="flex items-center justify-between gap-2 px-1.5 py-0.5 rounded-[8px] hover:bg-white/[0.06] transition-colors cursor-pointer group"
            >
              <div className="flex items-center gap-2 min-w-0">
                <span
                  className={`text-[11.5px] font-bold w-4 text-center shrink-0 ${
                    rank === 1
                      ? 'text-red-500'
                      : rank === 2
                      ? 'text-orange-400'
                      : rank === 3
                      ? 'text-amber-400'
                      : 'text-white/40'
                  }`}
                >
                  {rank}
                </span>
                <span className="text-[12px] text-white/80 group-hover:text-white truncate font-medium">
                  {item.title}
                </span>
              </div>
              <span
                className={`text-[10.5px] font-medium shrink-0 ${
                  isTop3 ? 'text-red-400/90' : 'text-white/35'
                }`}
              >
                {item.hot}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export const hotboardStrategy: WidgetStrategy<HotBoardConfig> = {
  type: 'hotboard',
  name: '实时热榜',
  description: '汇聚微博、哔哩哔哩、知乎等全网实时热点榜单与搜索风向',
  icon: FireIcon,
  defaultSize: '4x4',
  supportedSizes: ['4x2', '4x4'],
  defaultConfig: {
    defaultPlatform: 'weibo',
  },
  render: HotBoardWidget,
};
