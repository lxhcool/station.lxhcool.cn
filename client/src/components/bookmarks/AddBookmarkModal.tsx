import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Cancel01Icon, Link01Icon, GlobeIcon, Loading03Icon } from 'hugeicons-react';
import { api } from '../../services/api';
import { BookmarkItem } from '../../types';

interface AddBookmarkModalProps {
  isOpen: boolean;
  onClose: () => void;
  editingBookmark?: BookmarkItem | null;
  onSave: (bookmark: BookmarkItem | Omit<BookmarkItem, 'id'>) => void;
}

export const AddBookmarkModal: React.FC<AddBookmarkModalProps> = ({
  isOpen,
  onClose,
  editingBookmark,
  onSave,
}) => {
  const [url, setUrl] = useState('');
  const [title, setTitle] = useState('');
  const [icon, setIcon] = useState('');
  const [isLoadingMeta, setIsLoadingMeta] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const debounceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastFetchedUrlRef = useRef<string>('');

  useEffect(() => {
    if (isOpen) {
      if (editingBookmark) {
        setUrl(editingBookmark.url);
        setTitle(editingBookmark.title);
        setIcon(editingBookmark.icon || '');
        lastFetchedUrlRef.current = editingBookmark.url;
      } else {
        setUrl('');
        setTitle('');
        setIcon('');
        lastFetchedUrlRef.current = '';
      }
      setErrorMsg('');
      setIsLoadingMeta(false);
    }
  }, [editingBookmark, isOpen]);

  // 格式化并补全协议前缀
  const formatUrl = (input: string) => {
    let clean = input.trim();
    if (!clean) return '';
    if (!/^https?:\/\//i.test(clean)) {
      clean = 'https://' + clean;
    }
    return clean;
  };

  // 智能抓取站点名称与 Favicon 图标
  const fetchMetadata = async (targetUrl: string) => {
    const formatted = formatUrl(targetUrl);
    if (!formatted) return;

    try {
      const parsed = new URL(formatted);
      if (!parsed.hostname || !parsed.hostname.includes('.')) return;
    } catch {
      return;
    }

    if (lastFetchedUrlRef.current === formatted) return;
    lastFetchedUrlRef.current = formatted;

    setIsLoadingMeta(true);
    setErrorMsg('');

    try {
      const meta = await api.getSiteMetadata(formatted);
      if (meta) {
        if (!title && meta.title) {
          setTitle(meta.title.trim());
        }
        if (!icon && meta.icon) {
          setIcon(meta.icon);
        }
      } else {
        // 降级策略：根据域名自动提取名称与高清 Favicon
        const parsed = new URL(formatted);
        const host = parsed.hostname.replace(/^www\./, '');
        if (!title) {
          const brand = host.split('.')[0] || host;
          setTitle(brand.charAt(0).toUpperCase() + brand.slice(1));
        }
        if (!icon) {
          setIcon(`https://www.google.com/s2/favicons?domain=${parsed.hostname}&sz=128`);
        }
      }
    } catch (err) {
      console.warn('Metadata fetch fallback', err);
      try {
        const parsed = new URL(formatted);
        const host = parsed.hostname.replace(/^www\./, '');
        if (!title) {
          const brand = host.split('.')[0] || host;
          setTitle(brand.charAt(0).toUpperCase() + brand.slice(1));
        }
        if (!icon) {
          setIcon(`https://www.google.com/s2/favicons?domain=${parsed.hostname}&sz=128`);
        }
      } catch {
        // ignore
      }
    } finally {
      setIsLoadingMeta(false);
    }
  };

  const handleUrlChange = (val: string) => {
    setUrl(val);
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }
    if (val.trim().length > 4 && !editingBookmark) {
      debounceTimerRef.current = setTimeout(() => {
        fetchMetadata(val);
      }, 600);
    }
  };

  const handleUrlBlur = () => {
    if (url.trim() && !editingBookmark) {
      fetchMetadata(url);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const formattedUrl = formatUrl(url);

    if (!formattedUrl) {
      setErrorMsg('请输入网址');
      return;
    }

    try {
      new URL(formattedUrl);
    } catch {
      setErrorMsg('请输入有效的网址格式');
      return;
    }

    let finalTitle = title.trim();
    if (!finalTitle) {
      try {
        finalTitle = new URL(formattedUrl).hostname.replace(/^www\./, '');
      } catch {
        finalTitle = '书签';
      }
    }

    if (editingBookmark) {
      onSave({
        ...editingBookmark,
        title: finalTitle,
        url: formattedUrl,
        icon: icon.trim() || undefined,
      });
    } else {
      onSave({
        title: finalTitle,
        url: formattedUrl,
        icon: icon.trim() || undefined,
      });
    }

    handleClose();
  };

  const handleClose = () => {
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }
    setUrl('');
    setTitle('');
    setIcon('');
    setErrorMsg('');
    setIsLoadingMeta(false);
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

        {/* 弹窗主体：微光黑橙暗调卡片 (纯阴影，无边框) */}
        <motion.div
          initial={{ opacity: 0, scale: 0.94, y: 12 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.96, y: 8 }}
          className="relative z-10 w-[420px] max-w-[94vw] rounded-[24px] modal-card-glow text-white p-6 space-y-5"
        >
          {/* 顶部标题栏 */}
          <div className="flex items-center justify-between pb-1">
            <h2 className="text-xl font-bold tracking-tight text-white/95">
              {editingBookmark ? '编辑书签' : '添加快捷书签'}
            </h2>
            <button
              type="button"
              onClick={handleClose}
              className="w-7 h-7 rounded-full bg-white/[0.08] hover:bg-white/[0.16] flex items-center justify-center text-white/60 hover:text-white transition-colors cursor-pointer"
            >
              <Cancel01Icon size={14} />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* 网址输入 */}
            <div className="space-y-1.5">
              <label className="text-xs text-white/70 font-medium flex items-center justify-between">
                <span>网址 (URL)</span>
                {isLoadingMeta && (
                  <span className="text-[11px] text-orange-400 flex items-center gap-1 font-normal animate-in fade-in duration-200">
                    <Loading03Icon size={12} className="animate-spin" />
                    正在识别站点信息...
                  </span>
                )}
              </label>
              <div className="relative flex items-center">
                <div className="absolute left-3.5 text-white/30 pointer-events-none">
                  <Link01Icon size={15} />
                </div>
                <input
                  type="text"
                  value={url}
                  onChange={(e) => handleUrlChange(e.target.value)}
                  onBlur={handleUrlBlur}
                  placeholder="https://example.com"
                  autoFocus
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white/[0.06] hover:bg-white/[0.09] focus:bg-white/[0.12] text-sm text-white placeholder-white/25 focus:outline-none transition-colors border-none"
                />
              </div>
            </div>

            {/* 名称输入 */}
            <div className="space-y-1.5">
              <label className="text-xs text-white/70 font-medium">名称</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="例如：GitHub (输入网址后自动填充)"
                className="w-full px-3.5 py-2.5 rounded-xl bg-white/[0.06] hover:bg-white/[0.09] focus:bg-white/[0.12] text-sm text-white placeholder-white/25 focus:outline-none transition-colors border-none"
              />
            </div>

            {/* 图标 (可选) */}
            <div className="space-y-1.5">
              <label className="text-xs text-white/70 font-medium">图标 (自动获取或自定义链接)</label>
              <div className="flex items-center gap-2">
                <div className="w-10 h-10 rounded-xl bg-white/[0.06] flex items-center justify-center shrink-0 overflow-hidden">
                  {icon ? (
                    <img
                      src={icon}
                      alt="Icon"
                      className="w-5 h-5 object-contain"
                      onError={() => setIcon('')}
                    />
                  ) : (
                    <GlobeIcon size={18} className="text-white/30" />
                  )}
                </div>
                <input
                  type="text"
                  value={icon}
                  onChange={(e) => setIcon(e.target.value)}
                  placeholder="https://... 或自动填充"
                  className="flex-1 px-3.5 py-2.5 rounded-xl bg-white/[0.06] hover:bg-white/[0.09] focus:bg-white/[0.12] text-sm text-white placeholder-white/25 focus:outline-none transition-colors border-none"
                />
              </div>
            </div>

            {errorMsg && (
              <div className="text-[12px] text-red-400/90 px-1 pt-1">
                {errorMsg}
              </div>
            )}

            {/* 底部按钮栏 */}
            <div className="flex items-center justify-end gap-2.5 pt-3">
              <button
                type="button"
                onClick={handleClose}
                className="px-4 py-2 rounded-xl bg-white/[0.06] hover:bg-white/[0.12] text-white/70 hover:text-white text-sm font-medium transition-colors cursor-pointer"
              >
                取消
              </button>
              <button
                type="submit"
                className="px-5 py-2 rounded-xl bg-orange-600 hover:bg-orange-500 active:scale-95 text-white text-sm font-medium shadow-[0_4px_16px_rgba(234,88,12,0.3)] transition-all cursor-pointer"
              >
                {editingBookmark ? '保存' : '添加'}
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
