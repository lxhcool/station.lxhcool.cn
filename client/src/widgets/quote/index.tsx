import React, { useState, useEffect } from 'react';
import { WidgetStrategy, WidgetInstance, WidgetSize } from '../../types/widget';
import { QuoteUpIcon, RefreshIcon, Copy01Icon, Tick02Icon } from 'hugeicons-react';

export interface QuoteConfig {
  category?: string;
}

const FALLBACK_QUOTES = [
  { hitokoto: '落霞与孤鹜齐飞，秋水共长天一色。', from: '滕王阁序', from_who: '王勃' },
  { hitokoto: '行到水穷处，坐看云起时。', from: '终南别业', from_who: '王维' },
  { hitokoto: '追风赶月莫停留，平芜尽处是春山。', from: '赠番阳少帅', from_who: '民谚' },
  { hitokoto: '星光不问赶路人，岁月不负有心人。', from: '杂感', from_who: '严文井' },
  { hitokoto: 'Stay hungry, stay foolish.', from: 'Whole Earth Catalog', from_who: 'Steve Jobs' },
];

const QuoteWidget: React.FC<{
  instance: WidgetInstance<QuoteConfig>;
  size: WidgetSize;
  isEditing?: boolean;
}> = ({ size, isEditing }) => {
  const [quote, setQuote] = useState(FALLBACK_QUOTES[0]);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  const fetchQuote = async () => {
    if (loading) return;
    setLoading(true);
    try {
      const res = await fetch('https://v1.hitokoto.cn/?encode=json');
      if (res.ok) {
        const data = await res.json();
        setQuote({
          hitokoto: data.hitokoto,
          from: data.from,
          from_who: data.from_who || '',
        });
      } else {
        throw new Error('API failed');
      }
    } catch {
      // 离线随机兜底
      const random = FALLBACK_QUOTES[Math.floor(Math.random() * FALLBACK_QUOTES.length)];
      setQuote(random);
    } finally {
      setTimeout(() => setLoading(false), 300);
    }
  };

  useEffect(() => {
    fetchQuote();
  }, []);

  const handleCopy = (e: React.MouseEvent) => {
    e.stopPropagation();
    const text = `“${quote.hitokoto}” —— ${quote.from_who ? quote.from_who + ' ' : ''}《${quote.from}》`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  // 2x1 极简诗词单行胶囊
  if (size === '2x1') {
    return (
      <div
        onClick={() => !isEditing && fetchQuote()}
        className="w-full h-full rounded-[16px] bg-white/[0.07] hover:bg-white/[0.11] active:scale-98 backdrop-blur-xl border border-white/[0.08] shadow-[0_8px_24px_-4px_rgba(0,0,0,0.3)] px-3.5 flex items-center justify-between gap-2.5 select-none transition-all duration-200 cursor-pointer group"
        title="点击换一句"
      >
        <div className="flex items-center gap-2 min-w-0 flex-1">
          <QuoteUpIcon size={14} className="text-cyan-400/80 shrink-0" />
          <span className="text-[12px] font-medium text-white/90 truncate tracking-tight">
            {quote.hitokoto}
          </span>
        </div>

        <span className="text-[10px] text-white/40 shrink-0 truncate max-w-[64px]">
          {quote.from_who || quote.from}
        </span>
      </div>
    );
  }

  // 4x2 完整典藏排版大卡片
  return (
    <div className="w-full h-full rounded-[16px] bg-white/[0.07] hover:bg-white/[0.11] backdrop-blur-xl border border-white/[0.08] shadow-[0_8px_24px_-4px_rgba(0,0,0,0.3)] p-4 flex flex-col justify-between select-none transition-all duration-200 group relative overflow-hidden">
      {/* 顶部标识与操作条 */}
      <div className="flex items-center justify-between z-10">
        <div className="flex items-center gap-2 text-cyan-400/80">
          <QuoteUpIcon size={16} />
          <span className="text-[11.5px] font-semibold tracking-wider text-white/50 uppercase">
            每日一言
          </span>
        </div>

        {/* 交互按钮组 */}
        {!isEditing && (
          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <button
              type="button"
              onClick={handleCopy}
              className="p-1 rounded-[6px] hover:bg-white/[0.1] text-white/50 hover:text-white transition-colors"
              title="复制句子"
            >
              {copied ? <Tick02Icon size={13} className="text-green-400" /> : <Copy01Icon size={13} />}
            </button>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                fetchQuote();
              }}
              disabled={loading}
              className={`p-1 rounded-[6px] hover:bg-white/[0.1] text-white/50 hover:text-white transition-all ${
                loading ? 'animate-spin text-cyan-400' : ''
              }`}
              title="换一句"
            >
              <RefreshIcon size={13} />
            </button>
          </div>
        )}
      </div>

      {/* 核心文案大字 */}
      <div className="my-auto z-10 py-1">
        <p className="text-[14.5px] font-normal leading-relaxed text-white/90 tracking-wide font-serif italic drop-shadow-sm">
          “{quote.hitokoto}”
        </p>
      </div>

      {/* 底部作者与出处 */}
      <div className="flex items-center justify-end gap-1.5 text-[11px] text-white/45 z-10">
        {quote.from_who && <span className="font-medium text-white/60">{quote.from_who}</span>}
        {quote.from && <span>《{quote.from}》</span>}
      </div>

      {/* 背景水波柔光 */}
      <div className="absolute -left-8 -bottom-8 w-28 h-28 rounded-full bg-cyan-500/10 blur-2xl pointer-events-none" />
    </div>
  );
};

export const quoteStrategy: WidgetStrategy<QuoteConfig> = {
  type: 'quote',
  name: '每日一言',
  description: '每日精选诗词名句与哲思金句，支持 2x1 单行与 4x2 完整典藏卡片',
  icon: QuoteUpIcon,
  defaultSize: '4x2',
  supportedSizes: ['2x1', '4x2'],
  defaultConfig: {},
  render: QuoteWidget,
};
