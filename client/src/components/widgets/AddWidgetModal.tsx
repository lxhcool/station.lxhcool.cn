import React, { useState, useRef, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Cancel01Icon, Add01Icon, Loading03Icon, GlobeIcon } from 'hugeicons-react';
import { api } from '../../services/api';
import { widgetRegistry } from '../../services/widgetRegistry';
import { WidgetInstance, WidgetSize } from '../../types/widget';
import { DatePicker } from '../ui/DatePicker';

// 尺寸图形化可视化组件（纯色块表达，无边框）
const WidgetSizeGraphic: React.FC<{ size: WidgetSize; isSelected: boolean }> = ({
  size,
  isSelected,
}) => {
  const cellClass = isSelected
    ? 'bg-orange-500 shadow-[0_0_8px_rgba(249,115,22,0.4)]'
    : 'bg-white/20 group-hover:bg-white/35 transition-colors';

  if (size === '1x1') {
    return (
      <div className="w-5 h-5 flex items-center justify-center">
        <div className={`w-3.5 h-3.5 rounded-[3px] ${cellClass}`} />
      </div>
    );
  }

  if (size === '1x2') {
    return (
      <div className="w-5 h-6 flex flex-col items-center justify-center gap-[2px]">
        <div className={`w-3.5 h-2.5 rounded-[2.5px] ${cellClass}`} />
        <div className={`w-3.5 h-2.5 rounded-[2.5px] ${cellClass}`} />
      </div>
    );
  }

  if (size === '2x1') {
    return (
      <div className="w-6 h-5 flex items-center justify-center gap-[2px]">
        <div className={`w-2.5 h-3.5 rounded-[2.5px] ${cellClass}`} />
        <div className={`w-2.5 h-3.5 rounded-[2.5px] ${cellClass}`} />
      </div>
    );
  }

  if (size === '2x2') {
    return (
      <div className="w-5 h-5 flex items-center justify-center">
        <div className="grid grid-cols-2 gap-[2px]">
          <div className={`w-2 h-2 rounded-[2px] ${cellClass}`} />
          <div className={`w-2 h-2 rounded-[2px] ${cellClass}`} />
          <div className={`w-2 h-2 rounded-[2px] ${cellClass}`} />
          <div className={`w-2 h-2 rounded-[2px] ${cellClass}`} />
        </div>
      </div>
    );
  }

  if (size === '4x2') {
    return (
      <div className="w-7 h-5 flex items-center justify-center">
        <div className="grid grid-cols-4 gap-[1.5px]">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className={`w-1.5 h-1.5 rounded-[1.5px] ${cellClass}`} />
          ))}
        </div>
      </div>
    );
  }

  if (size === '4x3') {
    return (
      <div className="w-7 h-5 flex items-center justify-center">
        <div className="grid grid-cols-4 gap-[1.5px]">
          {Array.from({ length: 12 }).map((_, i) => (
            <div key={i} className={`w-1.5 h-1.5 rounded-[1.5px] ${cellClass}`} />
          ))}
        </div>
      </div>
    );
  }

  if (size === '4x4') {
    return (
      <div className="w-6 h-5 flex items-center justify-center">
        <div className="grid grid-cols-4 gap-[1px]">
          {Array.from({ length: 16 }).map((_, i) => (
            <div key={i} className={`w-1 h-1 rounded-[1px] ${cellClass}`} />
          ))}
        </div>
      </div>
    );
  }

  return null;
};

interface AddWidgetModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddWidget: (widget: Omit<WidgetInstance, 'id'>) => void;
}

export const AddWidgetModal: React.FC<AddWidgetModalProps> = ({
  isOpen,
  onClose,
  onAddWidget,
}) => {
  const strategies = widgetRegistry.getAll();
  const [selectedType, setSelectedType] = useState<string>(strategies[0]?.type || 'weather');
  const activeStrategy = widgetRegistry.get(selectedType) || strategies[0];

  const [selectedSize, setSelectedSize] = useState<WidgetSize>(
    activeStrategy?.defaultSize || '2x2'
  );

  // 书签特定输入字段
  const [bookmarkTitle, setBookmarkTitle] = useState('');
  const [bookmarkUrl, setBookmarkUrl] = useState('');
  const [bookmarkIcon, setBookmarkIcon] = useState('');
  const [isLoadingBookmarkMeta, setIsLoadingBookmarkMeta] = useState(false);
  const bookmarkDebounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastFetchedBookmarkUrlRef = useRef<string>('');

  // 格式化并补全协议前缀
  const formatBookmarkUrl = (input: string) => {
    let clean = input.trim();
    if (!clean) return '';
    if (!/^https?:\/\//i.test(clean)) {
      clean = 'https://' + clean;
    }
    return clean;
  };

  // 智能抓取书签站点名称与 Favicon 图标
  const fetchBookmarkMetadata = async (targetUrl: string) => {
    const formatted = formatBookmarkUrl(targetUrl);
    if (!formatted) return;

    try {
      const parsed = new URL(formatted);
      if (!parsed.hostname || !parsed.hostname.includes('.')) return;
    } catch {
      return;
    }

    if (lastFetchedBookmarkUrlRef.current === formatted) return;
    lastFetchedBookmarkUrlRef.current = formatted;

    setIsLoadingBookmarkMeta(true);

    try {
      const meta = await api.getSiteMetadata(formatted);
      if (meta) {
        if (!bookmarkTitle || bookmarkTitle === '新书签' || bookmarkTitle === '我的网站') {
          if (meta.title) setBookmarkTitle(meta.title.trim());
        }
        if (!bookmarkIcon && meta.icon) {
          setBookmarkIcon(meta.icon);
        }
      } else {
        // 降级：从域名提取名称与高清 Favicon
        const parsed = new URL(formatted);
        const host = parsed.hostname.replace(/^www\./, '');
        if (!bookmarkTitle || bookmarkTitle === '新书签' || bookmarkTitle === '我的网站') {
          const brand = host.split('.')[0] || host;
          setBookmarkTitle(brand.charAt(0).toUpperCase() + brand.slice(1));
        }
        if (!bookmarkIcon) {
          setBookmarkIcon(`https://www.google.com/s2/favicons?domain=${parsed.hostname}&sz=128`);
        }
      }
    } catch (err) {
      console.warn('Widget bookmark metadata fallback', err);
      try {
        const parsed = new URL(formatted);
        const host = parsed.hostname.replace(/^www\./, '');
        if (!bookmarkTitle || bookmarkTitle === '新书签' || bookmarkTitle === '我的网站') {
          const brand = host.split('.')[0] || host;
          setBookmarkTitle(brand.charAt(0).toUpperCase() + brand.slice(1));
        }
        if (!bookmarkIcon) {
          setBookmarkIcon(`https://www.google.com/s2/favicons?domain=${parsed.hostname}&sz=128`);
        }
      } catch {
        // ignore
      }
    } finally {
      setIsLoadingBookmarkMeta(false);
    }
  };

  const handleBookmarkUrlChange = (val: string) => {
    setBookmarkUrl(val);
    if (bookmarkDebounceRef.current) {
      clearTimeout(bookmarkDebounceRef.current);
    }
    if (val.trim().length > 4) {
      bookmarkDebounceRef.current = setTimeout(() => {
        fetchBookmarkMetadata(val);
      }, 500);
    }
  };

  const handleBookmarkUrlBlur = () => {
    if (bookmarkUrl.trim()) {
      fetchBookmarkMetadata(bookmarkUrl);
    }
  };

  // 天气特定输入字段
  const [weatherCity, setWeatherCity] = useState('厦门');

  // 倒数日特定输入字段
  const [countdownTitle, setCountdownTitle] = useState('元旦跨年');
  const [countdownDate, setCountdownDate] = useState(() => `${new Date().getFullYear() + 1}-01-01`);

  // GitHub 特定输入字段
  const [githubUsername, setGithubUsername] = useState('torvalds');

  // 音乐播放器特定输入字段
  const [playerPlaylistUrl, setPlayerPlaylistUrl] = useState('https://music.163.com/playlist?id=3778678');

  const scrollRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  const updateScrollState = () => {
    const el = scrollRef.current;
    if (!el) return;
    setCanScrollLeft(el.scrollLeft > 2);
    setCanScrollRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 2);
  };

  const maskStyle = useMemo<React.CSSProperties>(() => {
    if (canScrollLeft && canScrollRight) {
      return {
        WebkitMaskImage: 'linear-gradient(to right, transparent 0%, black 12px, black calc(100% - 12px), transparent 100%)',
        maskImage: 'linear-gradient(to right, transparent 0%, black 12px, black calc(100% - 12px), transparent 100%)',
      };
    }
    if (canScrollLeft) {
      return {
        WebkitMaskImage: 'linear-gradient(to right, transparent 0%, black 12px, black 100%)',
        maskImage: 'linear-gradient(to right, transparent 0%, black 12px, black 100%)',
      };
    }
    if (canScrollRight) {
      return {
        WebkitMaskImage: 'linear-gradient(to left, transparent 0%, black 12px, black 100%)',
        maskImage: 'linear-gradient(to left, transparent 0%, black 12px, black 100%)',
      };
    }
    return {};
  }, [canScrollLeft, canScrollRight]);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;

    // 初始计算左右溢出状态
    updateScrollState();

    const onWheel = (e: WheelEvent) => {
      // 只有在垂直鼠标滚轮且无原生水平位移时映射为水平滚动，并阻止冒泡阻断外层晃动
      if (Math.abs(e.deltaY) > 0 && Math.abs(e.deltaX) === 0) {
        e.preventDefault();
        el.scrollLeft += e.deltaY;
        updateScrollState();
      }
    };

    el.addEventListener('wheel', onWheel, { passive: false });
    return () => el.removeEventListener('wheel', onWheel);
  }, [isOpen]);

  const handleSelectStrategy = (type: string) => {
    setSelectedType(type);
    const strat = widgetRegistry.get(type);
    if (strat) {
      setSelectedSize(strat.defaultSize);
    }
  };

  const handleConfirm = () => {
    if (!activeStrategy) return;

    let config = { ...activeStrategy.defaultConfig };

    if (activeStrategy.type === 'bookmark') {
      config = {
        title: bookmarkTitle.trim() || '新书签',
        url: bookmarkUrl.trim().startsWith('http') ? bookmarkUrl.trim() : 'https://' + (bookmarkUrl.trim() || 'github.com'),
        icon: bookmarkIcon.trim() || undefined,
      };
    } else if (activeStrategy.type === 'weather') {
      config = {
        city: weatherCity.trim() || '厦门',
        autoLocation: true,
      };
    } else if (activeStrategy.type === 'countdown') {
      config = {
        title: countdownTitle.trim() || '重要日子',
        targetDate: countdownDate.trim() || `${new Date().getFullYear() + 1}-01-01`,
      };
    } else if (activeStrategy.type === 'github') {
      config = {
        username: githubUsername.trim() || 'torvalds',
      };
    } else if (activeStrategy.type === 'player') {
      config = {
        playlistUrl: playerPlaylistUrl.trim() || 'https://music.163.com/playlist?id=3778678',
        showPlaylist: true,
        defaultVolume: 65,
      };
    }

    onAddWidget({
      type: activeStrategy.type,
      size: selectedSize,
      config,
    });

    handleClose();
  };

  const handleClose = () => {
    if (bookmarkDebounceRef.current) {
      clearTimeout(bookmarkDebounceRef.current);
    }
    setBookmarkTitle('');
    setBookmarkUrl('');
    setBookmarkIcon('');
    setIsLoadingBookmarkMeta(false);
    lastFetchedBookmarkUrlRef.current = '';
    onClose();
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 select-none">
        {/* 背景遮罩 */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={handleClose}
          className="fixed inset-0 bg-black/75 backdrop-blur-md"
        />

        {/* 弹窗主体 */}
        <motion.div
          initial={{ opacity: 0, scale: 0.94, y: 12 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.96, y: 8 }}
          className="relative z-10 w-[490px] max-w-[94vw] max-h-[86vh] overflow-y-auto no-scrollbar rounded-[22px] modal-card-glow text-white p-5 space-y-4"
        >
          {/* 标题栏 */}
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold tracking-tight text-white/95">添加桌面组件</h2>
              <p className="text-xs text-white/40 mt-0.5">左右滑动选择心仪组件，配置后挂载至桌面</p>
            </div>
            <button
              onClick={handleClose}
              className="w-7 h-7 rounded-full bg-white/[0.08] hover:bg-white/[0.16] flex items-center justify-center text-white/60 hover:text-white transition-colors cursor-pointer"
            >
              <Cancel01Icon size={14} />
            </button>
          </div>

          {/* 组件库横向平滑滚动卡片轨 (无卡顿，与标题精准左对齐，真实透明度动态羽化) */}
          <div className="relative">
            <div
              ref={scrollRef}
              onScroll={updateScrollState}
              style={maskStyle}
              className="flex items-center gap-2 overflow-x-auto py-1 px-0.5 overscroll-x-contain [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]"
            >
              {strategies.map((strat) => {
                const Icon = strat.icon;
                const isSelected = strat.type === selectedType;
                return (
                  <button
                    key={strat.type}
                    type="button"
                    onClick={() => handleSelectStrategy(strat.type)}
                    title={strat.description}
                    className={`w-[78px] h-[76px] shrink-0 p-2 rounded-[14px] cursor-pointer transition-all flex flex-col items-center justify-center gap-1.5 border select-none group ${
                      isSelected
                        ? 'bg-orange-500/15 border-orange-500/50 shadow-[0_2px_12px_rgba(249,115,22,0.18)]'
                        : 'bg-white/[0.03] border-white/[0.06] hover:bg-white/[0.07] hover:border-white/10'
                    }`}
                  >
                    <div
                      className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 transition-all ${
                        isSelected
                          ? 'bg-orange-500 text-white shadow-sm'
                          : 'bg-white/[0.06] text-white/70 group-hover:text-white group-hover:bg-white/[0.1]'
                      }`}
                    >
                      <Icon size={16} />
                    </div>
                    <span
                      className={`text-xs font-medium truncate max-w-full text-center transition-colors ${
                        isSelected ? 'text-orange-400 font-semibold' : 'text-white/80 group-hover:text-white'
                      }`}
                    >
                      {strat.name}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* 选中组件的动态说明栏 */}
          {activeStrategy && (
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white/[0.03] border border-white/[0.05] text-[11px] text-white/55">
              <span className="w-1.5 h-1.5 rounded-full bg-orange-400 shrink-0 shadow-[0_0_6px_rgba(251,146,60,0.8)]" />
              <span className="truncate">{activeStrategy.description}</span>
            </div>
          )}

          {/* 尺寸选择（图形化表达，仅多尺寸组件显示） */}
          {activeStrategy && activeStrategy.supportedSizes.length > 1 && (
            <div className="space-y-2 pt-0.5">
              <label className="text-xs font-medium text-white/70">可用尺寸</label>
              <div className="flex items-center gap-2 flex-wrap">
                {activeStrategy.supportedSizes.map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => setSelectedSize(s)}
                    className={`group flex items-center gap-2 px-3 py-1.5 rounded-xl transition-all cursor-pointer border select-none ${
                      selectedSize === s
                        ? 'bg-orange-500/15 border-orange-500/60 shadow-[0_2px_12px_rgba(249,115,22,0.2)] text-white'
                        : 'bg-white/[0.04] border-white/[0.08] hover:bg-white/[0.08] text-white/60 hover:text-white'
                    }`}
                  >
                    <WidgetSizeGraphic size={s} isSelected={selectedSize === s} />
                    <span className="text-xs font-mono font-medium tracking-tight">
                      {s}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* 特殊参数配置 */}
          {activeStrategy?.type === 'bookmark' && (
            <div className="space-y-3 pt-1">
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <label className="text-xs text-white/70 font-medium">网址 (URL)</label>
                  {isLoadingBookmarkMeta && (
                    <span className="text-[11px] text-orange-400 flex items-center gap-1 font-normal animate-in fade-in duration-150">
                      <Loading03Icon size={12} className="animate-spin" />
                      正在识别网站信息...
                    </span>
                  )}
                </div>
                <input
                  type="text"
                  value={bookmarkUrl}
                  onChange={(e) => handleBookmarkUrlChange(e.target.value)}
                  onBlur={handleBookmarkUrlBlur}
                  placeholder="https://example.com"
                  autoFocus
                  className="w-full px-3.5 py-2.5 rounded-xl bg-white/[0.06] hover:bg-white/[0.09] focus:bg-white/[0.12] text-sm text-white placeholder-white/25 focus:outline-none transition-colors border-none"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs text-white/70 font-medium">书签名称与图标</label>
                <div className="flex items-center gap-2">
                  <div className="w-10 h-10 rounded-xl bg-white/[0.06] flex items-center justify-center shrink-0 overflow-hidden">
                    {bookmarkIcon ? (
                      <img
                        src={bookmarkIcon}
                        alt="Icon"
                        className="w-5 h-5 object-contain"
                        onError={() => setBookmarkIcon('')}
                      />
                    ) : (
                      <GlobeIcon size={18} className="text-white/30" />
                    )}
                  </div>
                  <input
                    type="text"
                    value={bookmarkTitle}
                    onChange={(e) => setBookmarkTitle(e.target.value)}
                    placeholder="例如：我的网站 (输入网址后自动识别)"
                    className="flex-1 px-3.5 py-2.5 rounded-xl bg-white/[0.06] hover:bg-white/[0.09] focus:bg-white/[0.12] text-sm text-white placeholder-white/25 focus:outline-none transition-colors border-none"
                  />
                </div>
              </div>
            </div>
          )}

          {activeStrategy?.type === 'weather' && (
            <div className="space-y-1 pt-1">
              <label className="text-xs text-white/70 font-medium">目标城市</label>
              <input
                type="text"
                value={weatherCity}
                onChange={(e) => setWeatherCity(e.target.value)}
                placeholder="例如：北京、上海、厦门"
                className="w-full px-3.5 py-2.5 rounded-xl bg-white/[0.06] text-sm text-white placeholder-white/25 focus:outline-none border-none"
              />
            </div>
          )}

          {/* 特殊参数配置 - 倒数日 (一行一个，确保单行展示呼吸感与完整日期胶囊) */}
          {activeStrategy?.type === 'countdown' && (
            <div className="space-y-3 pt-1">
              <div className="space-y-1">
                <label className="text-xs text-white/70 font-medium">倒数事件名称</label>
                <input
                  type="text"
                  value={countdownTitle}
                  onChange={(e) => setCountdownTitle(e.target.value)}
                  placeholder="如：元旦跨年、考研冲刺、发薪日"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-white/[0.06] text-sm text-white placeholder-white/25 focus:outline-none border-none"
                />
              </div>
              <div>
                <DatePicker
                  label="目标日期"
                  value={countdownDate}
                  onChange={setCountdownDate}
                />
              </div>
            </div>
          )}

          {/* 特殊参数配置 - GitHub */}
          {activeStrategy?.type === 'github' && (
            <div className="space-y-3 pt-1">
              <div className="space-y-1">
                <label className="text-xs text-white/70 font-medium">GitHub 用户名</label>
                <input
                  type="text"
                  value={githubUsername}
                  onChange={(e) => setGithubUsername(e.target.value)}
                  placeholder="例如: torvalds 或 antfu"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-white/[0.06] text-sm text-white placeholder-white/25 focus:outline-none border-none font-mono"
                />
              </div>
            </div>
          )}

          {/* 特殊参数配置 - 网易云音乐 */}
          {activeStrategy?.type === 'player' && (
            <div className="space-y-3 pt-1">
              <div className="space-y-1">
                <label className="text-xs text-white/70 font-medium">网易云歌单链接或 ID</label>
                <input
                  type="text"
                  value={playerPlaylistUrl}
                  onChange={(e) => setPlayerPlaylistUrl(e.target.value)}
                  placeholder="如：https://music.163.com/playlist?id=3778678 或直接输入歌单ID"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-white/[0.06] text-sm text-white placeholder-white/25 focus:outline-none border-none font-mono"
                />
              </div>
              <div className="flex items-center gap-1.5 flex-wrap pt-0.5">
                <span className="text-[11px] text-white/40 mr-1">快捷精选:</span>
                {[
                  { name: '热歌榜', id: '3778678' },
                  { name: '飙升榜', id: '19723756' },
                  { name: '专注轻音乐', id: '26467411' },
                  { name: '经典粤语', id: '2829883282' },
                ].map((preset) => (
                  <button
                    key={preset.id}
                    type="button"
                    onClick={() => setPlayerPlaylistUrl(`https://music.163.com/playlist?id=${preset.id}`)}
                    className="px-2 py-1 rounded-lg bg-white/[0.04] hover:bg-orange-500/15 text-[11px] text-white/60 hover:text-orange-400 border border-transparent hover:border-orange-500/20 transition-all cursor-pointer"
                  >
                    {preset.name}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* 底部确认操作 */}
          <div className="flex items-center justify-end gap-2.5 pt-3">
            <button
              type="button"
              onClick={handleClose}
              className="px-4 py-2 rounded-xl bg-white/[0.06] hover:bg-white/[0.12] text-white/70 hover:text-white text-sm font-medium transition-colors cursor-pointer"
            >
              取消
            </button>
            <button
              type="button"
              onClick={handleConfirm}
              className="flex items-center gap-1.5 px-5 py-2 rounded-xl bg-orange-600 hover:bg-orange-500 active:scale-95 text-white text-sm font-medium shadow-[0_4px_16px_rgba(234,88,12,0.3)] transition-all cursor-pointer"
            >
              <Add01Icon size={16} />
              <span>添加至桌面</span>
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
