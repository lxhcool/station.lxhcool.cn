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

// 单个应用图标渲染器 — 统一圆角背景底板，图标不裁切
const FolderAppIcon: React.FC<{
  item: FolderItem;
  size?: 'normal' | 'small' | 'mini';
  onClick: (e: React.MouseEvent) => void;
}> = ({ item, size = 'normal', onClick }) => {
  const [imgError, setImgError] = useState(false);
  const fallbackChar = item.title ? item.title.trim().charAt(0).toUpperCase() : '?';

  // 容器尺寸 & 圆角 — 所有图标统一圆角背景底板
  const containerCls =
    size === 'mini'
      ? 'w-5 h-5 rounded-[5px]'
      : size === 'small'
      ? 'w-6 h-6 rounded-[6px]'
      : 'w-7 h-7 rounded-[7px]';

  // 图标内边距 — 留出呼吸空间，避免贴边
  const imgPadding = size === 'mini' ? 'p-[3px]' : size === 'small' ? 'p-[3px]' : 'p-[4px]';

  const textDimensions =
    size === 'mini' ? 'text-[9px]' : size === 'small' ? 'text-[10px]' : 'text-[11px]';

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
          className={`w-full h-full object-contain pointer-events-none drop-shadow-sm ${imgPadding}`}
        />
      ) : (
        <div
          className={`w-full h-full flex items-center justify-center ${textDimensions} font-semibold text-white/90 transition-colors`}
        >
          {fallbackChar || <GlobeIcon size={12} className="text-white/60" />}
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
      <div className="w-full h-full rounded-[18px] bg-white/[0.08] hover:bg-white/[0.12] active:scale-98 backdrop-blur-xl border border-white/[0.08] shadow-[0_8px_24px_-4px_rgba(0,0,0,0.3)] p-2.5 flex flex-col items-center justify-center gap-3 select-none overflow-hidden transition-all duration-200">
        {displayItems.map((item) => (
          <FolderAppIcon
            key={item.id}
            item={item}
            size="normal"
            onClick={(e) => handleItemClick(e, item)}
          />
        ))}
        {hasRoom && (
          <button
            type="button"
            onClick={handleOpenEdit}
            title="添加书签到文件夹"
            className="w-7 h-7 rounded-[7px] border border-dashed border-white/20 hover:border-white/40 hover:bg-white/[0.08] flex items-center justify-center text-white/30 hover:text-white/70 transition-all cursor-pointer"
          >
            <PlusSignIcon size={13} />
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
      <div className="w-full h-full rounded-[18px] bg-white/[0.08] hover:bg-white/[0.12] active:scale-98 backdrop-blur-xl border border-white/[0.08] shadow-[0_8px_24px_-4px_rgba(0,0,0,0.3)] p-2.5 flex items-center justify-center gap-3.5 select-none overflow-hidden transition-all duration-200">
        {displayItems.map((item) => (
          <FolderAppIcon
            key={item.id}
            item={item}
            size="normal"
            onClick={(e) => handleItemClick(e, item)}
          />
        ))}
        {hasRoom && (
          <button
            type="button"
            onClick={handleOpenEdit}
            title="添加书签到文件夹"
            className="w-7 h-7 rounded-[7px] border border-dashed border-white/20 hover:border-white/40 hover:bg-white/[0.08] flex items-center justify-center text-white/30 hover:text-white/70 transition-all cursor-pointer"
          >
            <PlusSignIcon size={13} />
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
    <div className="w-full h-full rounded-[18px] bg-white/[0.08] hover:bg-white/[0.12] active:scale-98 backdrop-blur-xl border border-white/[0.08] shadow-[0_8px_24px_-4px_rgba(0,0,0,0.3)] p-3 flex items-center justify-center select-none overflow-hidden transition-all duration-200">
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
            className="w-7 h-7 rounded-[7px] border border-dashed border-white/15 hover:border-white/40 hover:bg-white/[0.08] flex items-center justify-center text-white/25 hover:text-white/75 transition-all cursor-pointer"
          >
            <PlusSignIcon size={13} />
          </button>
        )}

        {Array.from({ length: Math.max(0, emptySlotsCount - 1) }).map((_, i) => (
          <div key={`empty-${i}`} className="w-7 h-7 rounded-[7px] pointer-events-none" />
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

