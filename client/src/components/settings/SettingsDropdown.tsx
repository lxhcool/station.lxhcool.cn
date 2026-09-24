import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Settings02Icon,
  Search01Icon,
  Image01Icon,
  InformationCircleIcon,
  ChromeIcon,
} from 'hugeicons-react';

interface SettingsDropdownProps {
  onOpenWallpaper: () => void;
  onOpenSearch: () => void;
  onOpenGeneral: () => void;
  onOpenAbout: () => void;
  onOpenExtension: () => void;
}

export const SettingsDropdown: React.FC<SettingsDropdownProps> = ({
  onOpenWallpaper,
  onOpenSearch,
  onOpenGeneral,
  onOpenAbout,
  onOpenExtension,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={dropdownRef}>
      {/* 右上角单齿轮按钮：纯粹磨砂半透圆圈 */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        title="设置"
        className={`w-9 h-9 rounded-full flex items-center justify-center transition-all cursor-pointer ${
          isOpen
            ? 'bg-white/25 text-white shadow-lg backdrop-blur-md'
            : 'text-white/75 hover:text-white bg-white/[0.08] hover:bg-white/[0.16] backdrop-blur-md active:scale-95'
        }`}
      >
        <Settings02Icon size={17} />
      </button>

      {/* 齿轮下拉菜单：宽度严格 160px，每个项高度严格 36px，高阶磨砂透明玻璃 */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.94, y: -4 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -4 }}
            transition={{ duration: 0.16, ease: [0.16, 1, 0.3, 1] }}
            className="absolute right-0 top-[calc(100%+8px)] w-[168px] rounded-[16px] modal-card-glow p-1.5 text-white select-none space-y-0.5"
          >
            {/* 菜单项第 1 组 */}
            <div className="space-y-0.5">
              <button
                onClick={() => {
                  setIsOpen(false);
                  onOpenGeneral();
                }}
                className="w-full h-8 flex items-center gap-2 px-2.5 rounded-[10px] hover:bg-white/[0.12] text-[13px] text-white/90 hover:text-white font-normal transition-colors text-left cursor-pointer"
              >
                <Settings02Icon size={15} className="text-white/60 flex-shrink-0" />
                <span className="truncate">常规设置</span>
              </button>

              <button
                onClick={() => {
                  setIsOpen(false);
                  onOpenSearch();
                }}
                className="w-full h-8 flex items-center gap-2 px-2.5 rounded-[10px] hover:bg-white/[0.12] text-[13px] text-white/90 hover:text-white font-normal transition-colors text-left cursor-pointer"
              >
                <Search01Icon size={15} className="text-white/60 flex-shrink-0" />
                <span className="truncate">搜索引擎偏好</span>
              </button>

              <button
                onClick={() => {
                  setIsOpen(false);
                  onOpenWallpaper();
                }}
                className="w-full h-8 flex items-center gap-2 px-2.5 rounded-[10px] hover:bg-white/[0.12] text-[13px] text-white/90 hover:text-white font-normal transition-colors text-left cursor-pointer"
              >
                <Image01Icon size={15} className="text-white/60 flex-shrink-0" />
                <span className="truncate">壁纸偏好</span>
              </button>
            </div>

            {/* 微弱磨砂细分割线：上下各 4px，颜色微弱 */}
            <div className="h-[1px] bg-white/[0.04] my-1 mx-2" />

            {/* 菜单项第 2 组 */}
            <div className="space-y-0.5">
              <button
                onClick={() => {
                  setIsOpen(false);
                  onOpenAbout();
                }}
                className="w-full h-8 flex items-center gap-2 px-2.5 rounded-[10px] hover:bg-white/[0.12] text-[13px] text-white/90 hover:text-white font-normal transition-colors text-left cursor-pointer"
              >
                <InformationCircleIcon size={15} className="text-white/60 flex-shrink-0" />
                <span className="truncate">关于</span>
              </button>
            </div>

            {/* 微弱磨砂细分割线：上下各 4px，颜色微弱 */}
            <div className="h-[1px] bg-white/[0.04] my-1 mx-2" />

            {/* 菜单项第 3 组 */}
            <div className="space-y-0.5">
              <button
                onClick={() => {
                  setIsOpen(false);
                  onOpenExtension();
                }}
                className="w-full h-8 flex items-center gap-2 px-2.5 rounded-[10px] hover:bg-white/[0.12] text-[13px] text-white/90 hover:text-white font-normal transition-colors text-left cursor-pointer"
              >
                <ChromeIcon size={15} className="text-white/60 flex-shrink-0" />
                <span className="truncate">浏览器扩展</span>
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
