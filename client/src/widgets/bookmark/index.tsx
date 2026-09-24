import React, { useState } from 'react';
import { WidgetStrategy, WidgetInstance, WidgetSize } from '../../types/widget';
import { Link01Icon, GlobeIcon } from 'hugeicons-react';

export interface BookmarkConfig {
  title: string;
  url: string;
  icon?: string;
}

const BookmarkWidget: React.FC<{
  instance: WidgetInstance<BookmarkConfig>;
  size: WidgetSize;
  openInNewTab?: boolean;
  isEditing?: boolean;
  onUpdateConfig?: (cfg: Partial<BookmarkConfig>) => void;
}> = ({ instance, size, openInNewTab, isEditing }) => {
  const { title = '书签', url = '', icon = '' } = instance.config || {};
  const [imgError, setImgError] = useState(false);

  const fallbackChar = title ? title.trim().charAt(0).toUpperCase() : '?';

  const handleClick = (e: React.MouseEvent) => {
    if (isEditing) {
      e.preventDefault();
      return;
    }
    if (!url) return;
    e.preventDefault();
    window.open(url, openInNewTab ? '_blank' : '_self');
  };

  // 1x2 双格竖向卡片规格 (竖向 2 格)
  if (size === '1x2') {
    return (
      <div
        onClick={handleClick}
        className="w-full h-full rounded-[18px] bg-white/[0.08] hover:bg-white/[0.14] active:scale-98 backdrop-blur-xl border border-white/[0.08] flex flex-col items-center justify-center gap-2.5 p-3 transition-all duration-200 shadow-[0_8px_24px_-4px_rgba(0,0,0,0.3)] cursor-pointer group select-none overflow-hidden"
      >
        <div className="w-11 h-11 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform duration-200">
          {icon && !imgError ? (
            <img
              src={icon}
              alt={title}
              onError={() => setImgError(true)}
              className="w-10 h-10 object-contain rounded-[10px] pointer-events-none drop-shadow-md"
            />
          ) : (
            <div className="w-10 h-10 rounded-[11px] bg-white/[0.1] flex items-center justify-center text-base font-semibold text-white/80">
              {fallbackChar || <GlobeIcon size={20} className="text-white/60" />}
            </div>
          )}
        </div>
        <span className="text-[12.5px] font-semibold text-white/95 group-hover:text-white truncate max-w-[58px] text-center tracking-tight transition-colors">
          {title}
        </span>
      </div>
    );
  }

  // 2x1 双格横向卡片规格 (横向 2 格)
  if (size === '2x1') {
    return (
      <div
        onClick={handleClick}
        className="w-full h-full rounded-[18px] bg-white/[0.08] hover:bg-white/[0.14] active:scale-98 backdrop-blur-xl border border-white/[0.08] flex items-center gap-3 px-3.5 transition-all duration-200 shadow-[0_8px_24px_-4px_rgba(0,0,0,0.3)] cursor-pointer group select-none overflow-hidden"
      >
        <div className="w-7 h-7 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform duration-200">
          {icon && !imgError ? (
            <img
              src={icon}
              alt={title}
              onError={() => setImgError(true)}
              className="w-6 h-6 object-contain rounded-[6px] pointer-events-none drop-shadow-sm"
            />
          ) : (
            <div className="w-6 h-6 rounded-[7px] bg-white/[0.1] flex items-center justify-center text-xs font-semibold text-white/80">
              {fallbackChar || <GlobeIcon size={16} className="text-white/60" />}
            </div>
          )}
        </div>
        <div className="flex flex-col min-w-0 flex-1 justify-center">
          <span className="text-[12.5px] font-semibold text-white/95 group-hover:text-white truncate tracking-tight transition-colors">
            {title}
          </span>
          <span className="text-[10.5px] text-white/40 truncate mt-0.5">
            {url ? url.replace(/^https?:\/\//i, '').replace(/\/$/, '') : '点击访问'}
          </span>
        </div>
      </div>
    );
  }

  // 1x1 标准小图标规格 (单格子，精细间距防止文字截断)
  return (
    <div
      onClick={handleClick}
      className="w-full h-full rounded-[18px] bg-white/[0.08] hover:bg-white/[0.16] active:scale-95 backdrop-blur-xl border border-white/[0.06] flex flex-col items-center justify-center gap-1.5 p-1 transition-all duration-200 shadow-[0_8px_24px_-4px_rgba(0,0,0,0.3)] cursor-pointer group select-none overflow-hidden"
    >
      <div className="w-6 h-6 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform duration-200">
        {icon && !imgError ? (
          <img
            src={icon}
            alt={title}
            onError={() => setImgError(true)}
            className="w-6 h-6 object-contain rounded-[5px] pointer-events-none drop-shadow-sm"
          />
        ) : (
          <div className="w-6 h-6 rounded-[6px] bg-white/[0.1] flex items-center justify-center text-[11px] font-semibold text-white/80">
            {fallbackChar || <GlobeIcon size={13} className="text-white/60" />}
          </div>
        )}
      </div>
      <span className="text-[11px] leading-tight font-medium text-white/80 group-hover:text-white truncate max-w-[58px] text-center tracking-tight transition-colors">
        {title}
      </span>
    </div>
  );
};

export const bookmarkStrategy: WidgetStrategy<BookmarkConfig> = {
  type: 'bookmark',
  name: '快捷书签',
  description: '快速访问常用网站，支持 1x1 小图标、2x1 横条卡与 1x2 竖条卡',
  icon: Link01Icon,
  defaultSize: '1x1',
  supportedSizes: ['1x1', '2x1', '1x2'],
  defaultConfig: {
    title: '新书签',
    url: 'https://github.com',
  },
  render: BookmarkWidget,
};
