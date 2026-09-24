import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Cancel01Icon,
  Add01Icon,
  Delete02Icon,
  ArrowUp01Icon,
  ArrowDown01Icon,
  GlobeIcon,
  Loading03Icon,
  Tick02Icon,
} from 'hugeicons-react';
import { api } from '../../services/api';
import { FolderConfig, FolderItem } from './index';

interface FolderEditModalProps {
  isOpen: boolean;
  folderTitle: string;
  items: FolderItem[];
  maxItems?: number;
  onSave: (config: FolderConfig) => void;
  onClose: () => void;
}

const PRESET_APPS: Array<{ title: string; url: string; icon: string }> = [
  {
    title: '哔哩哔哩',
    url: 'https://www.bilibili.com',
    icon: 'https://www.bilibili.com/favicon.ico',
  },
  {
    title: '微信读书',
    url: 'https://weread.qq.com',
    icon: 'https://weread.qq.com/favicon.ico',
  },
  {
    title: 'GitHub',
    url: 'https://github.com',
    icon: 'https://github.githubassets.com/favicons/favicon.svg',
  },
  {
    title: '知乎',
    url: 'https://www.zhihu.com',
    icon: 'https://static.zhihu.com/heifetz/favicon.ico',
  },
  {
    title: '掘金',
    url: 'https://juejin.cn',
    icon: 'https://lf3-cdn-tos.bytescm.com/obj/static/xitu_juejin_web/static/favicons/favicon.ico',
  },
  {
    title: '微博',
    url: 'https://weibo.com',
    icon: 'https://weibo.com/favicon.ico',
  },
  {
    title: '少数派',
    url: 'https://sspai.com',
    icon: 'https://sspai.com/favicon.ico',
  },
  {
    title: '高德地图',
    url: 'https://amap.com',
    icon: 'https://amap.com/favicon.ico',
  },
  {
    title: '铁路12306',
    url: 'https://www.12306.cn',
    icon: 'https://www.12306.cn/favicon.ico',
  },
];

export const FolderEditModal: React.FC<FolderEditModalProps> = ({
  isOpen,
  folderTitle: initialTitle,
  items: initialItems,
  maxItems = 9,
  onSave,
  onClose,
}) => {
  const [title, setTitle] = useState(initialTitle || '文件夹');
  const [items, setItems] = useState<FolderItem[]>(initialItems || []);

  const [newUrl, setNewUrl] = useState('');
  const [newTitle, setNewTitle] = useState('');
  const [newIcon, setNewIcon] = useState('');
  const [isLoadingMeta, setIsLoadingMeta] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  if (!isOpen) return null;

  const formatUrl = (input: string) => {
    let clean = input.trim();
    if (!clean) return '';
    if (!/^https?:\/\//i.test(clean)) {
      clean = 'https://' + clean;
    }
    return clean;
  };

  const fetchSiteMeta = async (targetUrl: string) => {
    const formatted = formatUrl(targetUrl);
    if (!formatted) return;
    try {
      new URL(formatted);
    } catch {
      return;
    }

    setIsLoadingMeta(true);
    try {
      const meta = await api.getSiteMetadata(formatted);
      if (meta) {
        if (!newTitle && meta.title) {
          setNewTitle(meta.title.trim());
        }
        if (!newIcon && meta.icon) {
          setNewIcon(meta.icon);
        }
      } else {
        const parsed = new URL(formatted);
        const host = parsed.hostname.replace(/^www\./, '');
        if (!newTitle) {
          const brand = host.split('.')[0] || host;
          setNewTitle(brand.charAt(0).toUpperCase() + brand.slice(1));
        }
        if (!newIcon) {
          setNewIcon(`https://www.google.com/s2/favicons?domain=${parsed.hostname}&sz=128`);
        }
      }
    } catch {
      try {
        const parsed = new URL(formatted);
        const host = parsed.hostname.replace(/^www\./, '');
        if (!newTitle) {
          const brand = host.split('.')[0] || host;
          setNewTitle(brand.charAt(0).toUpperCase() + brand.slice(1));
        }
        if (!newIcon) {
          setNewIcon(`https://www.google.com/s2/favicons?domain=${parsed.hostname}&sz=128`);
        }
      } catch {
        // ignore
      }
    } finally {
      setIsLoadingMeta(false);
    }
  };

  const handleUrlChange = (val: string) => {
    setNewUrl(val);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (val.trim().length > 4) {
      debounceRef.current = setTimeout(() => {
        fetchSiteMeta(val);
      }, 500);
    }
  };

  const handleAddItem = (preset?: { title: string; url: string; icon: string }) => {
    if (items.length >= maxItems) return;

    if (preset) {
      setItems((prev) => [
        ...prev,
        {
          id: `item-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
          title: preset.title,
          url: preset.url,
          icon: preset.icon,
        },
      ]);
      return;
    }

    const cleanUrl = formatUrl(newUrl);
    if (!cleanUrl) return;

    let itemTitle = newTitle.trim();
    if (!itemTitle) {
      try {
        const host = new URL(cleanUrl).hostname.replace(/^www\./, '');
        itemTitle = host.split('.')[0] || host;
      } catch {
        itemTitle = '应用';
      }
    }

    setItems((prev) => [
      ...prev,
      {
        id: `item-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
        title: itemTitle,
        url: cleanUrl,
        icon: newIcon.trim() || undefined,
      },
    ]);

    setNewUrl('');
    setNewTitle('');
    setNewIcon('');
  };

  const handleRemoveItem = (id: string) => {
    setItems((prev) => prev.filter((it) => it.id !== id));
  };

  const handleMove = (index: number, direction: 'up' | 'down') => {
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= items.length) return;
    const next = [...items];
    const [moved] = next.splice(index, 1);
    next.splice(targetIndex, 0, moved);
    setItems(next);
  };

  const handleSave = () => {
    onSave({
      title: title.trim() || '文件夹',
      items,
    });
    onClose();
  };

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
          className="relative z-10 w-[480px] max-w-[94vw] max-h-[88vh] overflow-y-auto no-scrollbar rounded-[22px] modal-card-glow text-white p-5 space-y-4"
        >
          {/* 标题栏 */}
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold tracking-tight text-white/95">编辑书签文件夹</h2>
              <p className="text-xs text-white/40 mt-0.5">
                自定义文件夹名称与书签列表，点击图标直接访问
              </p>
            </div>
            <button
              onClick={onClose}
              className="w-7 h-7 rounded-full bg-white/[0.08] hover:bg-white/[0.16] flex items-center justify-center text-white/60 hover:text-white transition-colors cursor-pointer"
            >
              <Cancel01Icon size={14} />
            </button>
          </div>

          {/* 文件夹名称 */}
          <div className="space-y-1.5">
            <label className="text-xs text-white/70 font-medium">文件夹名称</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="如：常用书签、社交、生活出行"
              maxLength={20}
              className="w-full px-3.5 py-2 rounded-xl bg-white/[0.06] hover:bg-white/[0.09] focus:bg-white/[0.12] text-sm text-white placeholder-white/25 focus:outline-none transition-colors border-none"
            />
          </div>

          {/* 已包含的书签列表 */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs text-white/70 font-medium">
                包含的书签 ({items.length}/{maxItems})
              </label>
              {items.length >= maxItems && (
                <span className="text-[11px] text-amber-400">已达最大容纳上限</span>
              )}
            </div>


            <div className="space-y-1.5 max-h-[220px] overflow-y-auto no-scrollbar pr-0.5">
              {items.map((item, idx) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between p-2 rounded-xl bg-white/[0.04] hover:bg-white/[0.07] border border-white/[0.04] transition-colors group"
                >
                  <div className="flex items-center gap-2.5 min-w-0 flex-1">
                    <div className="w-7 h-7 rounded-[7px] bg-white/[0.08] flex items-center justify-center shrink-0 overflow-hidden">
                      {item.icon ? (
                        <img
                          src={item.icon}
                          alt={item.title}
                          className="w-full h-full object-contain pointer-events-none"
                          onError={(e) => {
                            (e.target as HTMLElement).style.display = 'none';
                          }}
                        />
                      ) : (
                        <span className="text-xs font-semibold text-white/80">
                          {item.title ? item.title.charAt(0).toUpperCase() : '?'}
                        </span>
                      )}
                    </div>
                    <div className="flex flex-col min-w-0 flex-1">
                      <span className="text-xs font-medium text-white/90 truncate">
                        {item.title}
                      </span>
                      <span className="text-[10px] text-white/40 truncate">
                        {item.url.replace(/^https?:\/\//i, '').replace(/\/$/, '')}
                      </span>
                    </div>
                  </div>

                  {/* 排序与删除按钮 */}
                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      type="button"
                      disabled={idx === 0}
                      onClick={() => handleMove(idx, 'up')}
                      className="w-6 h-6 rounded-lg bg-white/[0.04] hover:bg-white/[0.1] disabled:opacity-20 flex items-center justify-center text-white/60 hover:text-white transition-colors cursor-pointer"
                      title="上移"
                    >
                      <ArrowUp01Icon size={12} />
                    </button>
                    <button
                      type="button"
                      disabled={idx === items.length - 1}
                      onClick={() => handleMove(idx, 'down')}
                      className="w-6 h-6 rounded-lg bg-white/[0.04] hover:bg-white/[0.1] disabled:opacity-20 flex items-center justify-center text-white/60 hover:text-white transition-colors cursor-pointer"
                      title="下移"
                    >
                      <ArrowDown01Icon size={12} />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleRemoveItem(item.id)}
                      className="w-6 h-6 rounded-lg bg-white/[0.04] hover:bg-red-500/20 text-white/50 hover:text-red-400 flex items-center justify-center transition-colors cursor-pointer ml-0.5"
                      title="删除"
                    >
                      <Delete02Icon size={12} />
                    </button>
                  </div>
                </div>
              ))}

              {items.length === 0 && (
                <div className="text-center py-6 text-xs text-white/30 border border-dashed border-white/10 rounded-xl">
                  文件夹内暂无书签，可通过下方添加
                </div>
              )}
            </div>
          </div>

          {/* 新增书签表单 (若未满) */}
          {items.length < maxItems && (
            <div className="space-y-2 pt-1 border-t border-white/[0.06]">
              <div className="flex items-center justify-between">
                <label className="text-xs text-white/70 font-medium">添加新书签</label>
                {isLoadingMeta && (
                  <span className="text-[11px] text-orange-400 flex items-center gap-1 font-normal animate-in fade-in">
                    <Loading03Icon size={12} className="animate-spin" />
                    正在识别网站信息...
                  </span>
                )}
              </div>

              <div className="grid grid-cols-[1fr_110px_auto] gap-2 items-center">
                <input
                  type="text"
                  value={newUrl}
                  onChange={(e) => handleUrlChange(e.target.value)}
                  onBlur={() => newUrl.trim() && fetchSiteMeta(newUrl)}
                  placeholder="https://网址..."
                  className="px-3 py-2 rounded-xl bg-white/[0.06] hover:bg-white/[0.09] focus:bg-white/[0.12] text-xs text-white placeholder-white/25 focus:outline-none transition-colors border-none"
                />
                <input
                  type="text"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="书签名称"
                  className="px-3 py-2 rounded-xl bg-white/[0.06] hover:bg-white/[0.09] focus:bg-white/[0.12] text-xs text-white placeholder-white/25 focus:outline-none transition-colors border-none"
                />
                <button
                  type="button"
                  onClick={() => handleAddItem()}
                  disabled={!newUrl.trim()}
                  className="h-8 px-3 rounded-xl bg-orange-600 hover:bg-orange-500 disabled:opacity-30 disabled:hover:bg-orange-600 text-white text-xs font-medium flex items-center gap-1 transition-colors cursor-pointer"
                >
                  <Add01Icon size={13} />
                  <span>添加</span>
                </button>
              </div>

              {/* 常用热门书签一键填入 */}
              <div className="space-y-1 pt-1">
                <span className="text-[10.5px] text-white/40">常用书签快捷添加:</span>
                <div className="flex items-center gap-1.5 flex-wrap">
                  {PRESET_APPS.filter((p) => !items.some((it) => it.url === p.url)).map(
                    (preset) => (
                      <button
                        key={preset.title}
                        type="button"
                        onClick={() => handleAddItem(preset)}
                        className="px-2 py-0.5 rounded-lg bg-white/[0.04] hover:bg-orange-500/15 text-[11px] text-white/60 hover:text-orange-400 border border-transparent hover:border-orange-500/20 transition-all cursor-pointer"
                      >
                        + {preset.title}
                      </button>
                    )
                  )}
                </div>
              </div>
            </div>
          )}


          {/* 底部按钮 */}
          <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-white/[0.06]">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-1.5 rounded-xl bg-white/[0.06] hover:bg-white/[0.12] text-white/70 hover:text-white text-xs font-medium transition-colors cursor-pointer"
            >
              取消
            </button>
            <button
              type="button"
              onClick={handleSave}
              className="flex items-center gap-1.5 px-4 py-1.5 rounded-xl bg-orange-600 hover:bg-orange-500 active:scale-95 text-white text-xs font-medium shadow-[0_4px_16px_rgba(234,88,12,0.3)] transition-all cursor-pointer"
            >
              <Tick02Icon size={14} />
              <span>保存更改</span>
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
