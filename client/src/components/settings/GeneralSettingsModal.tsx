import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Cancel01Icon } from 'hugeicons-react';

interface GeneralSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  openInNewTab: boolean;
  onToggleNewTab: (open: boolean) => void;
}

export const GeneralSettingsModal: React.FC<GeneralSettingsModalProps> = ({
  isOpen,
  onClose,
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
          className="relative z-10 w-[420px] max-w-[94vw] rounded-[24px] modal-card-glow text-white p-6 space-y-5"
        >
          <div className="flex items-center justify-between pb-2">
            <h2 className="text-xl font-bold tracking-tight text-white/95">常规设置</h2>
            <button
              onClick={onClose}
              className="w-7 h-7 rounded-full bg-white/[0.08] hover:bg-white/[0.16] flex items-center justify-center text-white/60 hover:text-white transition-colors cursor-pointer"
            >
              <Cancel01Icon size={14} />
            </button>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between p-4 rounded-2xl bg-white/[0.04]">
              <div>
                <div className="text-xs text-white/90 font-medium">在新标签页打开</div>
                <div className="text-[11px] text-white/40 mt-0.5">搜索与访问链接时在新窗口开启</div>
              </div>
              <input
                type="checkbox"
                checked={openInNewTab}
                onChange={(e) => onToggleNewTab(e.target.checked)}
                className="w-4 h-4 accent-orange-500 cursor-pointer"
              />
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
