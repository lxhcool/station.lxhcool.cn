import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Cancel01Icon,
  Image01Icon,
  DropletIcon,
  Moon02Icon,
  Tick02Icon,
  Folder01Icon,
  Link01Icon,
} from 'hugeicons-react';
import { WallpaperConfig, WallpaperItem } from '../../types';
import { api } from '../../services/api';

interface WallpaperSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  config: WallpaperConfig;
  onChange: (config: WallpaperConfig) => void;
}

export const WallpaperSettingsModal: React.FC<WallpaperSettingsModalProps> = ({
  isOpen,
  onClose,
  config,
  onChange,
}) => {
  const [wallpapers, setWallpapers] = useState<WallpaperItem[]>([]);
  const [bingInfo, setBingInfo] = useState<{ url: string; title: string; copyright: string } | null>(null);
  const [showUrlInput, setShowUrlInput] = useState(false);
  const [customUrl, setCustomUrl] = useState('');
  const [showBlurControl, setShowBlurControl] = useState(true);
  const [isUploading, setIsUploading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      api.getWallpapers().then(setWallpapers);
      api.getBingWallpaper().then(setBingInfo);
    }
  }, [isOpen]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  const handleSelectWallpaper = (url: string, type: 'official' | 'bing' | 'custom' | 'ambient') => {
    onChange({
      ...config,
      type,
      url,
    });
  };

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    const uploadedUrl = await api.uploadFile(file);
    setIsUploading(false);

    if (uploadedUrl) {
      handleSelectWallpaper(uploadedUrl, 'custom');
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 select-none">
          {/* 背景遮罩 */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
            onClick={onClose}
            className="fixed inset-0 bg-black/75 backdrop-blur-md"
          />

          {/* 480px 弹窗主体 (参考图 2 样式) */}
          <motion.div
            initial={{ opacity: 0, scale: 0.94, y: 12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 8 }}
            transition={{
              type: 'spring',
              stiffness: 420,
              damping: 32,
              mass: 0.8,
            }}
            className="relative z-10 w-[480px] max-w-[94vw] max-h-[85vh] rounded-[24px] overflow-hidden flex flex-col modal-card-glow text-white"
          >
            {/* 顶栏：标题与关闭按钮 */}
            <div className="flex items-center justify-between px-6 pt-5 pb-2 flex-shrink-0">
              <h2 className="text-xl font-bold tracking-tight text-white/95">壁纸偏好</h2>
              <button
                onClick={onClose}
                className="w-7 h-7 rounded-full bg-white/[0.08] hover:bg-white/[0.16] flex items-center justify-center text-white/60 hover:text-white transition-colors cursor-pointer"
                title="关闭 (Esc)"
              >
                <Cancel01Icon size={14} />
              </button>
            </div>

            {/* 内容区 */}
            <div className="flex-1 overflow-y-auto px-6 pb-5 space-y-4">
              {/* 1. 自定义区域 */}
              <div className="space-y-2">
                <span className="text-xs text-white/40 font-medium">自定义</span>
                <div className="flex gap-3.5 p-3 rounded-2xl bg-white/[0.04]">
                  {/* 当前壁纸缩略预览图 */}
                  <div className="w-[72px] h-[72px] rounded-xl overflow-hidden bg-white/[0.06] flex-shrink-0 flex items-center justify-center relative">
                    {config.type === 'ambient' ? (
                      <div className="w-full h-full bg-gradient-to-tr from-[#764650] via-[#8b746b] to-[#40455d]" />
                    ) : config.url ? (
                      <img
                        src={config.url}
                        alt="current"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <Image01Icon size={22} className="text-white/30" />
                    )}
                  </div>

                  {/* 引导文案与功能按钮组 */}
                  <div className="flex-1 min-w-0 flex flex-col justify-between">
                    <div>
                      <h4 className="text-xs font-semibold text-white/95 leading-snug">
                        将您喜爱的图片设为壁纸。
                      </h4>
                      <p className="text-[11px] text-white/40 mt-0.5 leading-relaxed">
                        支持选择本地图片或网络链接，起始页即时生效。
                      </p>
                    </div>

                    <div className="flex flex-wrap items-center gap-1.5 pt-1.5">
                      <label className="cursor-pointer">
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleUpload}
                          className="hidden"
                          disabled={isUploading}
                        />
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-white/[0.08] hover:bg-white/[0.14] text-[11px] text-white/85 font-medium transition-colors">
                          <Folder01Icon size={12} className="text-white/60" />
                          <span>{isUploading ? '上传中...' : '本地图片'}</span>
                        </span>
                      </label>

                      <button
                        onClick={() => setShowUrlInput(!showUrlInput)}
                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-white/[0.08] hover:bg-white/[0.14] text-[11px] text-white/85 font-medium transition-colors cursor-pointer"
                      >
                        <Link01Icon size={12} className="text-white/60" />
                        <span>在线链接</span>
                      </button>

                      <button
                        onClick={() => handleSelectWallpaper('', 'ambient')}
                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-white/[0.08] hover:bg-white/[0.14] text-[11px] text-white/85 font-medium transition-colors cursor-pointer"
                      >
                        <span>柔光氛围</span>
                      </button>
                    </div>
                  </div>
                </div>

                {/* 在线链接输入框展开 */}
                {showUrlInput && (
                  <div className="flex items-center gap-2 pt-1 animate-in fade-in duration-150">
                    <input
                      type="text"
                      value={customUrl}
                      onChange={(e) => setCustomUrl(e.target.value)}
                      placeholder="粘贴网络图片 URL (https://...)"
                      className="flex-1 bg-white/[0.06] rounded-xl px-3 py-1.5 text-xs text-white placeholder:text-white/30 outline-none focus:bg-white/[0.1] transition-colors"
                    />
                    <button
                      onClick={() => {
                        if (customUrl.trim()) {
                          handleSelectWallpaper(customUrl.trim(), 'custom');
                          setShowUrlInput(false);
                        }
                      }}
                      disabled={!customUrl.trim()}
                      className="px-3 py-1.5 rounded-xl bg-orange-600 hover:bg-orange-500 disabled:opacity-40 text-xs text-white font-medium transition-colors cursor-pointer"
                    >
                      应用
                    </button>
                  </div>
                )}
              </div>

              {/* 2. 模糊度与遮罩调节 */}
              <div className="space-y-2">
                <span className="text-xs text-white/40 font-medium">效果调节</span>
                <div className="rounded-2xl bg-white/[0.04] p-3.5 space-y-3">
                  {/* 模糊程度 */}
                  <div className="space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2 text-white/80">
                        <DropletIcon size={14} className="text-white/60" />
                        <span>模糊程度</span>
                      </div>
                      <span className="font-mono text-white/90 text-xs w-6 text-right">
                        {config.blur}
                      </span>
                    </div>
                    <div className="flex items-center h-5">
                      <input
                        type="range"
                        min="0"
                        max="30"
                        step="1"
                        value={config.blur}
                        onChange={(e) => onChange({ ...config, blur: parseInt(e.target.value) })}
                        className="minimal-slider"
                        style={{
                          background: `linear-gradient(to right, rgba(255, 255, 255, 0.7) 0%, rgba(255, 255, 255, 0.7) ${(config.blur / 30) * 100}%, rgba(255, 255, 255, 0.1) ${(config.blur / 30) * 100}%, rgba(255, 255, 255, 0.1) 100%)`
                        }}
                      />
                    </div>
                  </div>

                  {/* 遮罩暗度 */}
                  <div className="space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2 text-white/80">
                        <Moon02Icon size={14} className="text-white/60" />
                        <span>遮罩暗度</span>
                      </div>
                      <span className="font-mono text-white/90 text-xs w-8 text-right">
                        {Math.round(config.maskOpacity * 100)}%
                      </span>
                    </div>
                    <div className="flex items-center h-5">
                      <input
                        type="range"
                        min="0"
                        max="80"
                        step="5"
                        value={Math.round(config.maskOpacity * 100)}
                        onChange={(e) => onChange({ ...config, maskOpacity: parseInt(e.target.value) / 100 })}
                        className="minimal-slider"
                        style={{
                          background: `linear-gradient(to right, rgba(255, 255, 255, 0.7) 0%, rgba(255, 255, 255, 0.7) ${(config.maskOpacity / 0.8) * 100}%, rgba(255, 255, 255, 0.1) ${(config.maskOpacity / 0.8) * 100}%, rgba(255, 255, 255, 0.1) 100%)`
                        }}
                      />
                    </div>
                  </div>

                  {/* 快速档位 */}
                  <div className="flex items-center gap-1.5 pt-0.5">
                    {[
                      { label: '清晰 0', blur: 0, mask: 0.2 },
                      { label: '微朦 8', blur: 8, mask: 0.25 },
                      { label: '柔光 16', blur: 16, mask: 0.3 },
                      { label: '极境 24', blur: 24, mask: 0.35 },
                    ].map((preset) => (
                      <button
                        key={preset.blur}
                        onClick={() => onChange({ ...config, blur: preset.blur, maskOpacity: preset.mask })}
                        className={`flex-1 py-1 rounded-xl text-[11px] transition-all cursor-pointer ${
                          config.blur === preset.blur
                            ? 'bg-white/20 text-white font-medium shadow-sm'
                            : 'bg-white/[0.04] hover:bg-white/[0.09] text-white/50 hover:text-white/80'
                        }`}
                      >
                        {preset.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* 3. 精选壁纸横向滑动画廊 */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-white/40 font-medium">默认壁纸</span>
                  {bingInfo && (
                    <button
                      onClick={() => handleSelectWallpaper(bingInfo.url, 'bing')}
                      className={`text-[11px] transition-colors cursor-pointer ${
                        config.url === bingInfo.url ? 'text-orange-400 font-medium' : 'text-white/40 hover:text-white'
                      }`}
                    >
                      必应今日日图
                    </button>
                  )}
                </div>

                {/* 水平左右滚动横向画廊（支持鼠标滚轮与手势左右滑动） */}
                <div
                  onWheel={(e) => {
                    if (e.deltaY !== 0) {
                      e.currentTarget.scrollLeft += e.deltaY;
                    }
                  }}
                  className="flex gap-2.5 overflow-x-auto pb-1.5 pt-0.5 overscroll-x-contain select-none"
                  style={{ scrollbarWidth: 'none' }}
                >
                  {/* 官方柔光模式 */}
                  <div
                    onClick={() => handleSelectWallpaper('', 'ambient')}
                    className="group relative w-[132px] aspect-[16/10] shrink-0 rounded-xl overflow-hidden cursor-pointer bg-gradient-to-tr from-[#764650] via-[#8b746b] to-[#40455d] flex flex-col justify-end p-2 transition-transform active:scale-95"
                  >
                    <span className="text-[10px] text-white/90 drop-shadow font-medium">官方柔光</span>
                    {config.type === 'ambient' && (
                      <div className="absolute bottom-2 right-2 w-4 h-4 rounded-full bg-white flex items-center justify-center shadow-md">
                        <Tick02Icon size={10} className="text-orange-600 font-bold" />
                      </div>
                    )}
                  </div>

                  {/* 精选壁纸列表 */}
                  {wallpapers.map((w) => {
                    const isSelected = config.url === w.url;
                    return (
                      <div
                        key={w.id}
                        onClick={() => handleSelectWallpaper(w.url, 'official')}
                        className="group relative w-[132px] aspect-[16/10] shrink-0 rounded-xl overflow-hidden cursor-pointer bg-white/[0.05] flex flex-col justify-end p-2 transition-transform active:scale-95"
                      >
                        <img
                          src={w.thumbnail || w.url}
                          alt={w.title}
                          className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
                        <span className="relative z-10 text-[10px] text-white/90 drop-shadow truncate">
                          {w.title}
                        </span>
                        {isSelected && (
                          <div className="absolute bottom-2 right-2 z-10 w-4 h-4 rounded-full bg-white flex items-center justify-center shadow-md">
                            <Tick02Icon size={10} className="text-orange-600 font-bold" />
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
