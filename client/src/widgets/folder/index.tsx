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

// 单个应用图标渲染器
const FolderAppIcon: React.FC<{
  item: FolderItem;
  size?: 'normal' | 'small' | 'mini';
  onClick: (e: React.MouseEvent) => void;
}> = ({ item, size = 'normal', onClick }) => {
  const [imgError, setImgError] = useState(false);
  const fallbackChar = item.title ? item.title.trim().charAt(0).toUpperCase() : '?';

  const iconDimensions =
    size === 'mini'
      ? 'w-5 h-5 rounded-[5px]'
      : size === 'small'
      ? 'w-6 h-6 rounded-[6px]'
      : 'w-7 h-7 rounded-[7px]';

  const textDimensions =
    size === 'mini' ? 'text-[9px]' : size === 'small' ? 'text-[10px]' : 'text-[11px]';

  return (
    <div
      onClick={onClick}
      title={item.title}
      className={`${iconDimensions} flex items-center justify-center shrink-0 cursor-pointer transition-transform duration-150 hover:scale-110 active:scale-95 group/app select-none`}
    >
      {item.icon && !imgError ? (
        <img
          src={item.icon}
          alt={item.title}
          onError={() => setImgError(true)}
          className="w-full h-full object-contain rounded-inherit pointer-events-none drop-shadow-sm"
        />
      ) : (
        <div
          className={`w-full h-full rounded-inherit bg-white/[0.12] group-hover/app:bg-white/[0.2] flex items-center justify-center ${textDimensions} font-semibold text-white/90 shadow-sm transition-colors`}
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

  // 1x2 竖向卡片规格 (纵向排列 2-3 个应用图标，底部文件夹标题)
  if (size === '1x2') {
    const maxItems = 3;
    const displayItems = items.slice(0, maxItems);
    const hasRoom = displayItems.length < maxItems;

    return (
      <div className="w-full h-full rounded-[18px] bg-white/[0.08] hover:bg-white/[0.12] active:scale-98 backdrop-blur-xl border border-white/[0.08] shadow-[0_8px_24px_-4px_rgba(0,0,0,0.3)] p-2 flex flex-col justify-between select-none overflow-hidden transition-all duration-200">
        <div className="flex flex-col items-center justify-center gap-2.5 flex-1 w-full my-auto">
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
              title="添加应用到文件夹"
              className="w-7 h-7 rounded-[7px] border border-dashed border-white/20 hover:border-white/40 hover:bg-white/[0.08] flex items-center justify-center text-white/30 hover:text-white/70 transition-all cursor-pointer"
            >
              <PlusSignIcon size={13} />
            </button>
          )}
        </div>
        <span className="text-[10.5px] font-medium text-white/75 group-hover:text-white truncate text-center tracking-tight px-0.5 shrink-0 transition-colors">
          {title}
        </span>
      </div>
    );
  }

  // 2x1 横向卡片规格 (横向排列 2-4 个应用图标，底部文件夹标题)
  if (size === '2x1') {
    const maxItems = 4;
    const displayItems = items.slice(0, maxItems);
    const hasRoom = displayItems.length < maxItems;

    return (
      <div className="w-full h-full rounded-[18px] bg-white/[0.08] hover:bg-white/[0.12] active:scale-98 backdrop-blur-xl border border-white/[0.08] shadow-[0_8px_24px_-4px_rgba(0,0,0,0.3)] p-2 flex flex-col justify-between select-none overflow-hidden transition-all duration-200">
        <div className="flex items-center justify-center gap-3 flex-1 w-full my-auto">
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
              title="添加应用到文件夹"
              className="w-7 h-7 rounded-[7px] border border-dashed border-white/20 hover:border-white/40 hover:bg-white/[0.08] flex items-center justify-center text-white/30 hover:text-white/70 transition-all cursor-pointer"
            >
              <PlusSignIcon size={13} />
            </button>
          )}
        </div>
        <span className="text-[10.5px] font-medium text-white/75 group-hover:text-white truncate text-center tracking-tight px-1 shrink-0 transition-colors">
          {title}
        </span>
      </div>
    );
  }

  // 1x1 迷你小卡片规格 (2x2 微缩 4 宫格)
  if (size === '1x1') {
    const maxItems = 4;
    const displayItems = items.slice(0, maxItems);
    const hasRoom = displayItems.length < maxItems;

    return (
      <div className="w-full h-full rounded-[18px] bg-white/[0.08] hover:bg-white/[0.12] active:scale-98 backdrop-blur-xl border border-white/[0.08] shadow-[0_8px_24px_-4px_rgba(0,0,0,0.3)] p-1.5 flex flex-col justify-between select-none overflow-hidden transition-all duration-200">
        <div className="grid grid-cols-2 grid-rows-2 gap-1 w-full flex-1 items-center justify-items-center my-auto">
          {displayItems.map((item) => (
            <FolderAppIcon
              key={item.id}
              item={item}
              size="mini"
              onClick={(e) => handleItemClick(e, item)}
            />
          ))}
          {hasRoom && (
            <button
              type="button"
              onClick={handleOpenEdit}
              title="添加应用到文件夹"
              className="w-5 h-5 rounded-[5px] border border-dashed border-white/20 hover:border-white/40 hover:bg-white/[0.08] flex items-center justify-center text-white/30 hover:text-white/70 transition-all cursor-pointer"
            >
              <PlusSignIcon size={10} />
            </button>
          )}
        </div>
        <span className="text-[9.5px] font-medium text-white/75 group-hover:text-white truncate text-center tracking-tight px-0.5 shrink-0 transition-colors">
          {title}
        </span>
      </div>
    );
  }

  // 2x2 标准 9 宫格大文件夹 (最多 9 个应用，可不填满，底部文件夹标题)
  const maxItems = 9;
  const displayItems = items.slice(0, maxItems);
  const emptySlotsCount = maxItems - displayItems.length;

  return (
    <div className="w-full h-full rounded-[18px] bg-white/[0.08] hover:bg-white/[0.12] active:scale-98 backdrop-blur-xl border border-white/[0.08] shadow-[0_8px_24px_-4px_rgba(0,0,0,0.3)] p-2.5 flex flex-col justify-between select-none overflow-hidden transition-all duration-200">
      {/* 3x3 九宫格应用区域 */}
      <div className="grid grid-cols-3 grid-rows-3 gap-1.5 w-full flex-1 items-center justify-items-center my-auto">
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
            title="添加应用到文件夹"
            className="w-7 h-7 rounded-[7px] border border-dashed border-white/15 hover:border-white/40 hover:bg-white/[0.08] flex items-center justify-center text-white/25 hover:text-white/75 transition-all cursor-pointer"
          >
            <PlusSignIcon size={13} />
          </button>
        )}

        {Array.from({ length: Math.max(0, emptySlotsCount - 1) }).map((_, i) => (
          <div key={`empty-${i}`} className="w-7 h-7 rounded-[7px] pointer-events-none" />
        ))}
      </div>

      {/* 底部文件夹名称 */}
      <span className="text-[11.5px] font-medium text-white/75 group-hover:text-white truncate text-center tracking-tight px-1 shrink-0 transition-colors pt-0.5">
        {title}
      </span>
    </div>
  );
};

export const folderStrategy: WidgetStrategy<FolderConfig> = {
  type: 'folder',
  name: '应用文件夹',
  description: '九宫格大文件夹与横竖多形态容器，无需弹窗直接点击跳转，最多容纳9个应用',
  icon: Folder01Icon,
  defaultSize: '2x2',
  supportedSizes: ['2x2', '2x1', '1x2', '1x1'],
  defaultConfig: {
    title: '常用应用',
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
      {
        id: 'f-4',
        title: '知乎',
        url: 'https://www.zhihu.com',
        icon: 'https://static.zhihu.com/heifetz/favicon.ico',
      },
    ],
  },
  render: FolderWidget,
};
