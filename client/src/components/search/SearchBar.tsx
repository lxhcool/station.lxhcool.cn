import React, { useState, useRef, useEffect } from 'react';
import { Search01Icon, Cancel01Icon } from 'hugeicons-react';
import { SearchEngine } from '../../types';

export const SEARCH_ENGINES: SearchEngine[] = [
  {
    id: 'google',
    name: 'Google',
    icon: 'https://www.google.com/favicon.ico',
    searchUrl: 'https://www.google.com/search?q=',
    placeholder: '在 Google 中搜索，或输入网址...',
  },
  {
    id: 'baidu',
    name: '百度',
    icon: 'https://www.baidu.com/favicon.ico',
    searchUrl: 'https://www.baidu.com/s?wd=',
    placeholder: '百度一下，你就知道...',
  },
  {
    id: 'bing',
    name: 'Bing',
    icon: 'https://cn.bing.com/favicon.ico',
    searchUrl: 'https://www.bing.com/search?q=',
    placeholder: '在必应中畅快探索...',
  },
  {
    id: 'bilibili',
    name: 'Bilibili',
    icon: 'https://www.bilibili.com/favicon.ico',
    searchUrl: 'https://search.bilibili.com/all?keyword=',
    placeholder: '搜索哔哩哔哩视频、UP主...',
  },
  {
    id: 'github',
    name: 'GitHub',
    icon: 'https://github.githubassets.com/favicons/favicon.svg',
    searchUrl: 'https://github.com/search?q=',
    placeholder: '搜索开源仓库、代码、开发者...',
  },
  {
    id: 'zhihu',
    name: '知乎',
    icon: 'https://static.zhihu.com/heifetz/favicon.ico',
    searchUrl: 'https://www.zhihu.com/search?type=content&q=',
    placeholder: '发现更大的世界...',
  },
];

interface SearchBarProps {
  activeEngineId: string;
  onEngineChange: (engineId: string) => void;
  openInNewTab: boolean;
}

export const SearchBar: React.FC<SearchBarProps> = ({
  activeEngineId,
  onEngineChange,
  openInNewTab,
}) => {
  const [query, setQuery] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const activeEngine = SEARCH_ENGINES.find((e) => e.id === activeEngineId) || SEARCH_ENGINES[0];

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSearch = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const trimmed = query.trim();
    if (!trimmed) return;

    const isUrl = /^(https?:\/\/)?([a-zA-Z0-9-]+\.)+[a-zA-Z]{2,}(:\d+)?(\/.*)?$/.test(trimmed);
    const targetUrl = isUrl
      ? (trimmed.startsWith('http://') || trimmed.startsWith('https://') ? trimmed : `https://${trimmed}`)
      : `${activeEngine.searchUrl}${encodeURIComponent(trimmed)}`;

    if (openInNewTab) {
      window.open(targetUrl, '_blank', 'noopener,noreferrer');
    } else {
      window.location.href = targetUrl;
    }
  };

  return (
    <div className="relative w-full max-w-2xl mx-auto z-20">
      {/* 搜索框容器：严格固定高度 50px */}
      <form
        onSubmit={handleSearch}
        className={`relative flex items-center h-[50px] w-full rounded-full transition-all duration-300 px-1.5 ${
          isFocused ? 'soft-glass-search-focus scale-[1.01]' : 'soft-glass-search hover:scale-[1.005]'
        }`}
      >
        {/* 搜索引擎选择圆形按钮：仅 hover 时显示背景 */}
        <div className="relative flex items-center h-full" ref={dropdownRef}>
          <button
            type="button"
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            title="切换搜索引擎"
            className="w-9 h-9 ml-0.5 rounded-full flex items-center justify-center bg-transparent hover:bg-white/[0.1] transition-colors duration-200 cursor-pointer select-none active:scale-95 flex-shrink-0"
          >
            <img
              src={activeEngine.icon}
              alt={activeEngine.name}
              className="w-5 h-5 rounded-full object-contain pointer-events-none"
              onError={(e) => {
                (e.target as HTMLElement).style.display = 'none';
              }}
            />
          </button>

          {/* 独立脱离文档流的下拉选择菜单：item 间距严格 4px */}
          {isDropdownOpen && (
            <div className="absolute top-[calc(100%+8px)] left-1 w-44 rounded-2xl soft-glass-dropdown p-1.5 shadow-2xl z-50 animate-in fade-in zoom-in-95 duration-150">
              <div className="text-[10px] text-white/40 px-2.5 py-1 mb-1 uppercase tracking-wider font-semibold">切换引擎</div>
              <div className="flex flex-col gap-[4px]">
                {SEARCH_ENGINES.map((engine) => (
                  <button
                    key={engine.id}
                    type="button"
                    onClick={() => {
                      onEngineChange(engine.id);
                      setIsDropdownOpen(false);
                      inputRef.current?.focus();
                    }}
                    className={`flex items-center gap-2.5 w-full px-3 py-2 rounded-xl text-xs transition-all text-left cursor-pointer ${
                      engine.id === activeEngine.id
                        ? 'bg-white/20 text-white font-medium shadow-sm'
                        : 'text-white/70 hover:bg-white/10 hover:text-white'
                    }`}
                  >
                    <img src={engine.icon} alt={engine.name} className="w-4 h-4 rounded-sm object-contain" />
                    <span>{engine.name}</span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* 核心输入框 */}
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          placeholder={activeEngine.placeholder}
          className="flex-1 h-full bg-transparent border-none outline-none text-white placeholder:text-white/60 text-[14px] pl-3 pr-2 tracking-wide font-normal"
        />

        {/* 清除按钮 */}
        {query && (
          <button
            type="button"
            onClick={() => {
              setQuery('');
              inputRef.current?.focus();
            }}
            className="p-1.5 mr-1 text-white/50 hover:text-white transition-colors cursor-pointer"
          >
            <Cancel01Icon size={15} />
          </button>
        )}

        {/* 搜索提交按钮：无背景色纯净图标 */}
        <button
          type="submit"
          title="搜索"
          className="w-9 h-9 flex items-center justify-center text-white/70 hover:text-white transition-colors cursor-pointer flex-shrink-0 active:scale-90 mr-1"
        >
          <Search01Icon size={18} />
        </button>
      </form>
    </div>
  );
};
