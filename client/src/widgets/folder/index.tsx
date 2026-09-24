import React, { useState } from 'react';
import { WidgetStrategy, WidgetInstance, WidgetSize } from '../../types/widget';
import { Folder01Icon, GlobeIcon, PlusSignIcon } from 'hugeicons-react';

export interface FolderItem {
  id: string;
  title: string;
  url: string;
  icon?: string;
}

export interface FolderConfig {
  title: string;
  items: FolderItem[];
}

// 单个应用图标渲染器 — 统一圆角背景底板，图标与背景留出充足呼吸边距，绝对不重叠
const FolderAppIcon: React.FC<{
  item: FolderItem;
  size?: 'large' | 'normal' | 'small' | 'mini';
  onClick: (e: React.MouseEvent) => void;
}> = ({ item, size = 'normal', onClick }) => {
  const [imgError, setImgError] = useState(false);
  const fallbackChar = item.title ? item.title.trim().charAt(0).toUpperCase() : '?';

  // 容器底板尺寸 & 圆角
  const containerCls =
    size === 'large'
      ? 'w-[32px] h-[32px] rounded-[8px]'
      : size === 'normal'
      ? 'w-[30px] h-[30px] rounded-[7.5px]'
      : size === 'small'
      ? 'w-[26px] h-[26px] rounded-[6px]'
      : 'w-[22px] h-[22px] rounded-[5px]';

  // 内部图标尺寸：严格控制在底板 62%~65% 之间，四周预留整整 5~6px 舒适留白，背景与图标层次分明绝不重叠
  const imgCls =
    size === 'large'
      ? 'w-[20px] h-[20px]'
      : size === 'normal'
      ? 'w-[19px] h-[19px]'
      : size === 'small'
      ? 'w-[16px] h-[16px]'
      : 'w-[14px] h-[14px]';

  const textDimensions =
    size === 'large'
      ? 'text-[12px]'
      : size === 'normal'
      ? 'text-[11px]'
      : size === 'small'
      ? 'text-[10px]'
      : 'text-[9px]';

  const globeIconSize =
    size === 'large' ? 14 : size === 'normal' ? 13 : size === 'small' ? 11 : 9;

  return (
    <div
      onClick={onClick}
      title={item.title}
      className={`${containerCls} bg-white/[0.10] hover:bg-white/[0.18] flex items-center justify-center shrink-0 cursor-pointer transition-all duration-150 hover:scale-110 active:scale-95 group/app select-none overflow-hidden`}
    >
      {item.icon && !imgError ? (
        <img
          src={item.icon}
          alt={item.title}
          onError={() => setImgError(true)}
          className={`${imgCls} object-contain pointer-events-none drop-shadow-sm`}
        />
      ) : (
        <div
          className={`w-full h-full flex items-center justify-center ${textDimensions} font-semibold text-white/90 transition-colors`}
        >
          {fallbackChar || <GlobeIcon size={globeIconSize} className="text-white/60" />}
        </div>
      )}
    </div>
  );
};

const FolderWidget: React.FC<{
  instance: WidgetInstance<FolderConfig>;
  size: WidgetSize;
  openInNewTab?: boolean;
  isEditing?: boolean;
  onUpdateConfig?: (cfg: Partial<FolderConfig>) => void;
}> = ({ instance, size, openInNewTab, isEditing }) => {
  const { title = '文件夹', items = [] } = instance.config || {};

  const handleItemClick = (e: React.MouseEvent, item: FolderItem) => {
    e.stopPropagation();
    if (isEditing) {
      e.preventDefault();
      return;
    }
    if (!item.url) return;
    window.open(item.url, openInNewTab ? '_blank' : '_self');
  };

  const handleOpenEdit = (e: React.MouseEvent) => {
    e.stopPropagation();
    window.dispatchEvent(
      new CustomEvent('open-folder-edit', {
        detail: { id: instance.id },
      })
    );
  };

  // 1x2 竖向卡片规格 (纵向最多排列 3 个书签图标，纯净无文字显示)
  if (size === '1x2') {
    const maxItems = 3;
    const displayItems = items.slice(0, maxItems);
    const hasRoom = displayItems.length < maxItems;

    return (
      <div className="w-full h-full rounded-[18px] bg-white/[0.08] hover:bg-white/[0.12] active:scale-98 backdrop-blur-xl border border-white/[0.08] shadow-[0_8px_24px_-4px_rgba(0,0,0,0.3)] py-3 px-2 flex flex-col items-center justify-center gap-3 select-none overflow-hidden transition-all duration-200">
        {displayItems.map((item) => (
          <FolderAppIcon
            key={item.id}
            item={item}
            size="large"
            onClick={(e) => handleItemClick(e, item)}
          />
        ))}
        {hasRoom && (
          <button
            type="button"
            onClick={handleOpenEdit}
            title="添加书签到文件夹"
            className="w-[32px] h-[32px] rounded-[8px] border border-dashed border-white/20 hover:border-white/40 hover:bg-white/[0.08] flex items-center justify-center text-white/30 hover:text-white/70 transition-all cursor-pointer"
          >
            <PlusSignIcon size={14} />
          </button>
        )}
      </div>
    );
  }

  // 2x1 横向卡片规格 (横向最多排列 3 个书签图标，纯净无文字显示)
  if (size === '2x1') {
    const maxItems = 3;
    const displayItems = items.slice(0, maxItems);
    const hasRoom = displayItems.length < maxItems;

    return (
      <div className="w-full h-full rounded-[18px] bg-white/[0.08] hover:bg-white/[0.12] active:scale-98 backdrop-blur-xl border border-white/[0.08] shadow-[0_8px_24px_-4px_rgba(0,0,0,0.3)] px-3 py-2 flex items-center justify-center gap-3.5 select-none overflow-hidden transition-all duration-200">
        {displayItems.map((item) => (
          <FolderAppIcon
            key={item.id}
            item={item}
            size="large"
            onClick={(e) => handleItemClick(e, item)}
          />
        ))}
        {hasRoom && (
          <button
            type="button"
            onClick={handleOpenEdit}
            title="添加书签到文件夹"
            className="w-[32px] h-[32px] rounded-[8px] border border-dashed border-white/20 hover:border-white/40 hover:bg-white/[0.08] flex items-center justify-center text-white/30 hover:text-white/70 transition-all cursor-pointer"
          >
            <PlusSignIcon size={14} />
          </button>
        )}
      </div>
    );
  }

  // 2x2 标准 9 宫格大文件夹 (最多 9 个书签，纯净无文字显示)
  const maxItems = 9;
  const displayItems = items.slice(0, maxItems);
  const emptySlotsCount = maxItems - displayItems.length;

  return (
    <div className="w-full h-full rounded-[18px] bg-white/[0.08] hover:bg-white/[0.12] active:scale-98 backdrop-blur-xl border border-white/[0.08] shadow-[0_8px_24px_-4px_rgba(0,0,0,0.3)] p-3.5 flex items-center justify-center select-none overflow-hidden transition-all duration-200">
      {/* 3x3 九宫格书签区域 */}
      <div className="grid grid-cols-3 grid-rows-3 gap-2 w-full h-full items-center justify-items-center">
        {displayItems.map((item) => (
          <FolderAppIcon
            key={item.id}
            item={item}
            size="normal"
            onClick={(e) => handleItemClick(e, item)}
          />
        ))}

        {/* 若未满 9 格，首个空位提供添加引导，其余保持干净透光空间 */}
        {emptySlotsCount > 0 && (
          <button
            type="button"
            onClick={handleOpenEdit}
            title="添加书签到文件夹"
            className="w-[30px] h-[30px] rounded-[7.5px] border border-dashed border-white/15 hover:border-white/40 hover:bg-white/[0.08] flex items-center justify-center text-white/25 hover:text-white/75 transition-all cursor-pointer"
          >
            <PlusSignIcon size={13} />
          </button>
        )}

        {Array.from({ length: Math.max(0, emptySlotsCount - 1) }).map((_, i) => (
          <div key={`empty-${i}`} className="w-[30px] h-[30px] rounded-[7.5px] pointer-events-none" />
        ))}
      </div>
    </div>
  );
};


export const folderStrategy: WidgetStrategy<FolderConfig> = {
  type: 'folder',
  name: '书签文件夹',
  description: '九宫格大文件夹与横竖多形态书签容器，点击书签直接跳转，横竖最多3个，九宫格最多9个',
  icon: Folder01Icon,
  defaultSize: '2x2',
  supportedSizes: ['2x2', '2x1', '1x2'],
  defaultConfig: {
    title: '常用书签',
    items: [
      {
        id: 'f-1',
        title: 'GitHub',
        url: 'https://github.com',
        icon: 'https://github.githubassets.com/favicons/favicon.svg',
      },
      {
        id: 'f-2',
        title: 'Bilibili',
        url: 'https://www.bilibili.com',
        icon: 'https://www.bilibili.com/favicon.ico',
      },
      {
        id: 'f-3',
        title: '微信读书',
        url: 'https://weread.qq.com',
        icon: 'https://weread.qq.com/favicon.ico',
      },
    ],
  },
  render: FolderWidget,
};

