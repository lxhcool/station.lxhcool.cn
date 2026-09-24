import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Cancel01Icon, Tick02Icon } from 'hugeicons-react';
import { SEARCH_ENGINES } from '../search/SearchBar';

interface SearchPreferencesModalProps {
  isOpen: boolean;
  onClose: () => void;
  activeEngineId: string;
  onEngineChange: (id: string) => void;
  openInNewTab: boolean;
  onToggleNewTab: (open: boolean) => void;
}

export const SearchPreferencesModal: React.FC<SearchPreferencesModalProps> = ({
  isOpen,
  onClose,
  activeEngineId,
  onEngineChange,
  openInNewTab,
  onToggleNewTab,
}) => {
  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 select-none">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-black/75 backdrop-blur-md"
        />

        <motion.div
          initial={{ opacity: 0, scale: 0.94, y: 12 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.96, y: 8 }}
          className="relative z-10 w-[440px] max-w-[94vw] rounded-[24px] modal-card-glow text-white p-6 space-y-5"
        >
          <div className="flex items-center justify-between pb-2">
            <h2 className="text-xl font-bold tracking-tight text-white/95">搜索引擎偏好</h2>
            <button
              onClick={onClose}
              className="w-7 h-7 rounded-full bg-white/[0.08] hover:bg-white/[0.16] flex items-center justify-center text-white/60 hover:text-white transition-colors cursor-pointer"
            >
              <Cancel01Icon size={14} />
            </button>
          </div>

          {/* 搜索引擎选择列表 */}
          <div className="space-y-1.5">
            <span className="text-xs text-white/40 font-medium">默认搜索引擎</span>
            <div className="space-y-1 rounded-2xl bg-white/[0.04] p-2">
              {SEARCH_ENGINES.map((engine) => {
                const isSelected = engine.id === activeEngineId;
                return (
                  <button
                    key={engine.id}
                    onClick={() => onEngineChange(engine.id)}
                    className={`w-full flex items-center justify-between p-2.5 rounded-xl transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-orange-500/20 text-white font-medium'
                        : 'text-white/70 hover:bg-white/[0.06] hover:text-white'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <img src={engine.icon} alt={engine.name} className="w-5 h-5 rounded-md object-contain" />
                      <span className="text-xs">{engine.name}</span>
                    </div>
                    {isSelected && <Tick02Icon size={16} className="text-orange-400" />}
                  </button>
                );
              })}
            </div>
          </div>

          {/* 新标签页打开开关 */}
          <div className="flex items-center justify-between p-4 rounded-2xl bg-white/[0.04]">
            <span className="text-xs text-white/80">搜索结果在新标签页中打开</span>
            <input
              type="checkbox"
              checked={openInNewTab}
              onChange={(e) => onToggleNewTab(e.target.checked)}
              className="w-4 h-4 accent-orange-500 cursor-pointer"
            />
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
