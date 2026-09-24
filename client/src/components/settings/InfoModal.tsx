import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Cancel01Icon, ChromeIcon, InformationCircleIcon } from 'hugeicons-react';

interface InfoModalProps {
  isOpen: boolean;
  onClose: () => void;
  type: 'about' | 'extension';
}

export const InfoModal: React.FC<InfoModalProps> = ({ isOpen, onClose, type }) => {
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
          className="relative z-10 w-[420px] max-w-[94vw] rounded-[24px] modal-card-glow text-white p-6 space-y-4"
        >
          <div className="flex items-center justify-between pb-1">
            <div className="flex items-center gap-2">
              {type === 'extension' ? (
                <ChromeIcon size={20} className="text-orange-400" />
              ) : (
                <InformationCircleIcon size={20} className="text-white/70" />
              )}
              <h2 className="text-xl font-bold tracking-tight text-white/95">
                {type === 'extension' ? '浏览器扩展' : '关于 Station'}
              </h2>
            </div>
            <button
              onClick={onClose}
              className="w-7 h-7 rounded-full bg-white/[0.08] hover:bg-white/[0.16] flex items-center justify-center text-white/60 hover:text-white transition-colors cursor-pointer"
            >
              <Cancel01Icon size={14} />
            </button>
          </div>

          {type === 'extension' ? (
            <div className="space-y-3 text-xs text-white/70 leading-relaxed">
              <p>Station 已打包为符合 Chrome & Edge 标准的 Manifest V3 扩展程序。</p>
              <div className="rounded-xl bg-white/[0.04] p-3 space-y-1.5 font-mono text-[11px] text-white/80">
                <div>1. 打开 chrome://extensions/ 并开启“开发者模式”</div>
                <div>2. 点击“加载已解压的扩展程序”</div>
                <div>3. 选择 client/dist-extension 目录即可完成载入</div>
              </div>
            </div>
          ) : (
            <div className="space-y-3 text-xs text-white/70 leading-relaxed">
              <p className="text-sm font-semibold text-white/90">Station 极简柔光起始页</p>
              <p>灵动高质感的液态柔光玻璃新标签页，专注最核心的纯粹搜索与壁纸视觉调谐。</p>
              <div className="text-[11px] text-white/40 pt-2">版本：v2.0.0 (Hugeicons Minimal)</div>
            </div>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
