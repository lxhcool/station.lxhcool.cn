import React, { useState, useEffect, useRef } from 'react';
import { BookmarkItem } from '../../types';
import {
  Add01Icon,
  GlobeIcon,
  MoreHorizontalIcon,
  Link01Icon,
  Copy01Icon,
  PencilEdit02Icon,
  Delete02Icon,
} from 'hugeicons-react';
import { motion, AnimatePresence } from 'framer-motion';

interface BookmarkGridProps {
  bookmarks: BookmarkItem[];
  openInNewTab: boolean;
  onAddClick: () => void;
  onEditBookmark: (bookmark: BookmarkItem) => void;
  onDeleteBookmark: (id: string) => void;
}

interface MenuState {
  bookmark: BookmarkItem;
  x: number;
  y: number;
}

export const BookmarkGrid: React.FC<BookmarkGridProps> = ({
  bookmarks,
  openInNewTab,
  onAddClick,
  onEditBookmark,
  onDeleteBookmark,
}) => {
  const [menuState, setMenuState] = useState<MenuState | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // 点击外部自动关闭菜单
  useEffect(() => {
    const handleClose = () => setMenuState(null);
    if (menuState) {
      window.addEventListener('click', handleClose);
      window.addEventListener('contextmenu', handleClose);
      window.addEventListener('resize', handleClose);
      window.addEventListener('scroll', handleClose, true);
    }
    return () => {
      window.removeEventListener('click', handleClose);
      window.removeEventListener('contextmenu', handleClose);
      window.removeEventListener('resize', handleClose);
      window.removeEventListener('scroll', handleClose, true);
    };
  }, [menuState]);

  const handleCopyUrl = (url: string, id: string) => {
    navigator.clipboard.writeText(url);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 1500);
    setMenuState(null);
  };

  return (
    <div className="relative flex flex-wrap items-center justify-center gap-x-6 gap-y-4 mt-8 max-w-2xl mx-auto select-none">
      {bookmarks.map((bookmark) => (
        <BookmarkCard
          key={bookmark.id}
          bookmark={bookmark}
          openInNewTab={openInNewTab}
          onOpenMenu={(x, y) => setMenuState({ bookmark, x, y })}
        />
      ))}

      {/* 添加书签入口 */}
      <button
        onClick={onAddClick}
        className="group flex flex-col items-center gap-1.5 w-16 cursor-pointer focus:outline-none"
        title="添加书签"
      >
        <div className="w-[52px] h-[52px] rounded-[16px] bg-white/[0.05] hover:bg-white/[0.12] active:scale-95 flex items-center justify-center text-white/50 group-hover:text-white transition-all duration-200 shadow-[0_8px_20px_-4px_rgba(0,0,0,0.25)] group-hover:-translate-y-1">
          <Add01Icon size={20} />
        </div>
        <span className="text-[12px] font-medium text-white/45 group-hover:text-white/80 transition-colors">
          添加
        </span>
      </button>

      {/* 悬浮上下文快捷菜单 (右键或点击更多按钮触发) */}
      <AnimatePresence>
        {menuState && (
          <ContextMenu
            menuState={menuState}
            openInNewTab={openInNewTab}
            isCopied={copiedId === menuState.bookmark.id}
            onOpenLink={() => {
              window.open(menuState.bookmark.url, openInNewTab ? '_blank' : '_self');
              setMenuState(null);
            }}
            onCopy={() => handleCopyUrl(menuState.bookmark.url, menuState.bookmark.id)}
            onEdit={() => {
              const b = menuState.bookmark;
              setMenuState(null);
              onEditBookmark(b);
            }}
            onDelete={() => {
              const id = menuState.bookmark.id;
              setMenuState(null);
              onDeleteBookmark(id);
            }}
            onClose={() => setMenuState(null)}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

interface BookmarkCardProps {
  bookmark: BookmarkItem;
  openInNewTab: boolean;
  onOpenMenu: (x: number, y: number) => void;
}

const BookmarkCard: React.FC<BookmarkCardProps> = ({
  bookmark,
  openInNewTab,
  onOpenMenu,
}) => {
  const [imgError, setImgError] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);

  const fallbackChar = bookmark.title ? bookmark.title.trim().charAt(0).toUpperCase() : '?';

  const handleContextMenu = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onOpenMenu(e.clientX, e.clientY);
  };

  const handleMoreClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const rect = e.currentTarget.getBoundingClientRect();
    onOpenMenu(rect.left - 40, rect.bottom + 6);
  };

  return (
    <div
      ref={cardRef}
      onContextMenu={handleContextMenu}
      className="group relative flex flex-col items-center gap-1.5 w-16"
    >
      {/* 书签卡片主体 */}
      <a
        href={bookmark.url}
        target={openInNewTab ? '_blank' : '_self'}
        rel="noopener noreferrer"
        className="relative w-[52px] h-[52px] rounded-[16px] bg-white/[0.08] hover:bg-white/[0.16] active:scale-95 backdrop-blur-xl flex items-center justify-center transition-all duration-200 shadow-[0_8px_24px_-4px_rgba(0,0,0,0.3)] group-hover:-translate-y-1 overflow-hidden"
      >
        {bookmark.icon && !imgError ? (
          <img
            src={bookmark.icon}
            alt={bookmark.title}
            onError={() => setImgError(true)}
            className="w-6 h-6 object-contain rounded-[6px] pointer-events-none"
          />
        ) : (
          <div className="w-6 h-6 rounded-[8px] bg-white/[0.08] flex items-center justify-center text-xs font-semibold text-white/80 pointer-events-none">
            {fallbackChar || <GlobeIcon size={14} className="text-white/60" />}
          </div>
        )}
      </a>

      {/* 书签标题 */}
      <span
        className="text-[12px] font-medium text-white/70 group-hover:text-white truncate max-w-[64px] text-center tracking-tight transition-colors"
        title={bookmark.title}
      >
        {bookmark.title}
      </span>
    </div>
  );
};

interface ContextMenuProps {
  menuState: MenuState;
  openInNewTab: boolean;
  isCopied: boolean;
  onOpenLink: () => void;
  onCopy: () => void;
  onEdit: () => void;
  onDelete: () => void;
  onClose: () => void;
}

const ContextMenu: React.FC<ContextMenuProps> = ({
  menuState,
  openInNewTab,
  isCopied,
  onOpenLink,
  onCopy,
  onEdit,
  onDelete,
  onClose,
}) => {
  // 防止菜单超出屏幕右侧或底部
  const menuWidth = 164;
  const menuHeight = 168;
  const left = Math.min(Math.max(12, menuState.x), window.innerWidth - menuWidth - 16);
  const top = Math.min(Math.max(12, menuState.y), window.innerHeight - menuHeight - 16);

  return (
    <div
      className="fixed inset-0 z-50 pointer-events-auto"
      onClick={onClose}
      onContextMenu={(e) => {
        e.preventDefault();
        onClose();
      }}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: -4 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: -4 }}
        transition={{ duration: 0.12, ease: [0.16, 1, 0.3, 1] }}
        style={{ left, top }}
        onClick={(e) => e.stopPropagation()}
        className="fixed z-50 w-[164px] p-1.5 rounded-[16px] modal-card-glow text-white select-none"
      >
        <div className="space-y-0.5">
          <button
            onClick={onOpenLink}
            className="w-full h-8 flex items-center gap-2.5 px-2.5 rounded-[10px] text-[13px] text-white/90 hover:text-white hover:bg-white/[0.12] transition-colors cursor-pointer text-left"
          >
            <Link01Icon size={14} className="text-white/50 flex-shrink-0" />
            <span className="truncate">{openInNewTab ? '新标签页打开' : '打开链接'}</span>
          </button>

          <button
            onClick={onCopy}
            className="w-full h-8 flex items-center gap-2.5 px-2.5 rounded-[10px] text-[13px] text-white/90 hover:text-white hover:bg-white/[0.12] transition-colors cursor-pointer text-left"
          >
            <Copy01Icon size={14} className="text-white/50 flex-shrink-0" />
            <span className="truncate">{isCopied ? '已复制！' : '复制网址'}</span>
          </button>
        </div>

        {/* 中间线：距离上下精确 4px，颜色微弱克制 */}
        <div className="h-[1px] bg-white/[0.04] my-1 mx-2" />

        <div className="space-y-0.5">
          <button
            onClick={onEdit}
            className="w-full h-8 flex items-center gap-2.5 px-2.5 rounded-[10px] text-[13px] text-white/90 hover:text-white hover:bg-white/[0.12] transition-colors cursor-pointer text-left"
          >
            <PencilEdit02Icon size={14} className="text-white/50 flex-shrink-0" />
            <span className="truncate">编辑书签</span>
          </button>

          <button
            onClick={onDelete}
            className="w-full h-8 flex items-center gap-2.5 px-2.5 rounded-[10px] text-[13px] text-red-400 hover:text-red-300 hover:bg-red-500/15 transition-colors cursor-pointer text-left"
          >
            <Delete02Icon size={14} className="text-red-400/80 flex-shrink-0" />
            <span className="truncate">删除书签</span>
          </button>
        </div>
      </motion.div>
    </div>
  );
};
