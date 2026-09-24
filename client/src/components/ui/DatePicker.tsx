import React, { useState, useRef, useEffect, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Calendar03Icon, ArrowLeft01Icon, ArrowRight01Icon, ArrowDown01Icon } from 'hugeicons-react';

interface DatePickerProps {
  value: string; // YYYY-MM-DD
  onChange: (value: string) => void;
  label?: string;
}

export const DatePicker: React.FC<DatePickerProps> = ({ value, onChange, label }) => {
  const [isOpen, setIsOpen] = useState(false);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const popoverRef = useRef<HTMLDivElement>(null);
  const [popoverPos, setPopoverPos] = useState<{ top: number; left: number; width: number } | null>(null);

  // 解析当前选中日期
  const selectedDate = useMemo(() => {
    if (!value) return new Date();
    const [y, m, d] = value.split('-').map(Number);
    if (!y || !m || !d) return new Date();
    return new Date(y, m - 1, d);
  }, [value]);

  // 日历浏览的年月状态
  const [viewYear, setViewYear] = useState(() => selectedDate.getFullYear());
  const [viewMonth, setViewMonth] = useState(() => selectedDate.getMonth() + 1); // 1-12

  // 同步当前选中值到视图年月
  useEffect(() => {
    if (value) {
      const [y, m] = value.split('-').map(Number);
      if (y && m) {
        setViewYear(y);
        setViewMonth(m);
      }
    }
  }, [value]);

  // 计算浮层精确绝对位置（与触发器等宽且左对齐）
  const updatePosition = () => {
    if (!triggerRef.current) return;
    const rect = triggerRef.current.getBoundingClientRect();
    const popoverWidth = rect.width;
    const popoverHeight = 320;
    const spaceBelow = window.innerHeight - rect.bottom;

    let top = rect.bottom + 6;
    if (spaceBelow < popoverHeight && rect.top > popoverHeight) {
      top = rect.top - popoverHeight - 6;
    }

    setPopoverPos({
      top,
      left: rect.left,
      width: popoverWidth,
    });
  };

  useEffect(() => {
    if (isOpen) {
      updatePosition();
      window.addEventListener('scroll', updatePosition, true);
      window.addEventListener('resize', updatePosition);
    }
    return () => {
      window.removeEventListener('scroll', updatePosition, true);
      window.removeEventListener('resize', updatePosition);
    };
  }, [isOpen]);

  // 点击外侧自动关闭
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as Node;
      if (
        triggerRef.current &&
        !triggerRef.current.contains(target) &&
        popoverRef.current &&
        !popoverRef.current.contains(target)
      ) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  // 计算本月及上月/下月数据
  const calendarDays = useMemo(() => {
    const daysInMonth = new Date(viewYear, viewMonth, 0).getDate();
    const firstDayWeekday = new Date(viewYear, viewMonth - 1, 1).getDay(); // 0 is Sunday
    const startCol = (firstDayWeekday + 6) % 7; // Monday is 0

    // 上月补足天数
    const prevMonthDays = new Date(viewYear, viewMonth - 1, 0).getDate();
    const prevDays: { day: number; isCurrentMonth: boolean; dateStr: string }[] = [];
    for (let i = startCol - 1; i >= 0; i--) {
      const d = prevMonthDays - i;
      const prevM = viewMonth === 1 ? 12 : viewMonth - 1;
      const prevY = viewMonth === 1 ? viewYear - 1 : viewYear;
      prevDays.push({
        day: d,
        isCurrentMonth: false,
        dateStr: `${prevY}-${String(prevM).padStart(2, '0')}-${String(d).padStart(2, '0')}`,
      });
    }

    // 当月天数
    const currentDays: { day: number; isCurrentMonth: boolean; dateStr: string }[] = [];
    for (let d = 1; d <= daysInMonth; d++) {
      currentDays.push({
        day: d,
        isCurrentMonth: true,
        dateStr: `${viewYear}-${String(viewMonth).padStart(2, '0')}-${String(d).padStart(2, '0')}`,
      });
    }

    // 下月补足天数
    const totalFilled = prevDays.length + currentDays.length;
    const remaining = (7 - (totalFilled % 7)) % 7;
    const nextDays: { day: number; isCurrentMonth: boolean; dateStr: string }[] = [];
    for (let d = 1; d <= remaining; d++) {
      const nextM = viewMonth === 12 ? 1 : viewMonth + 1;
      const nextY = viewMonth === 12 ? viewYear + 1 : viewYear;
      nextDays.push({
        day: d,
        isCurrentMonth: false,
        dateStr: `${nextY}-${String(nextM).padStart(2, '0')}-${String(d).padStart(2, '0')}`,
      });
    }

    return [...prevDays, ...currentDays, ...nextDays];
  }, [viewYear, viewMonth]);

  const handlePrevMonth = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (viewMonth === 1) {
      setViewYear(viewYear - 1);
      setViewMonth(12);
    } else {
      setViewMonth(viewMonth - 1);
    }
  };

  const handleNextMonth = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (viewMonth === 12) {
      setViewYear(viewYear + 1);
      setViewMonth(1);
    } else {
      setViewMonth(viewMonth + 1);
    }
  };

  const handleSelectDate = (dateStr: string) => {
    onChange(dateStr);
    setIsOpen(false);
  };

  // 相对天数提示
  const daysDiffText = useMemo(() => {
    if (!value) return '';
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const target = new Date(selectedDate);
    target.setHours(0, 0, 0, 0);
    const diffDays = Math.round((target.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    if (diffDays === 0) return '今天';
    if (diffDays > 0) return `还有 ${diffDays} 天`;
    return `已过去 ${Math.abs(diffDays)} 天`;
  }, [value, selectedDate]);

  // 快捷预设
  const applyPresetMonths = (monthsToAdd: number, e: React.MouseEvent) => {
    e.stopPropagation();
    const d = new Date();
    d.setMonth(d.getMonth() + monthsToAdd);
    const dateStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    onChange(dateStr);
    setIsOpen(false);
  };

  const applyPresetDays = (daysToAdd: number, e: React.MouseEvent) => {
    e.stopPropagation();
    const d = new Date();
    d.setDate(d.getDate() + daysToAdd);
    const dateStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    onChange(dateStr);
    setIsOpen(false);
  };

  const applyYearEnd = (e: React.MouseEvent) => {
    e.stopPropagation();
    const currentYear = new Date().getFullYear();
    const dateStr = `${currentYear + 1}-01-01`;
    onChange(dateStr);
    setIsOpen(false);
  };

  const todayStr = useMemo(() => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
  }, []);

  return (
    <div className="relative w-full">
      {label && <label className="block text-xs text-white/70 font-medium mb-1">{label}</label>}

      {/* 触发输入条 */}
      <button
        ref={triggerRef}
        type="button"
        onClick={() => {
          updatePosition();
          setIsOpen(!isOpen);
        }}
        className={`w-full px-3.5 py-2.5 rounded-xl bg-white/[0.06] hover:bg-white/[0.09] active:bg-white/[0.12] text-sm text-white flex items-center justify-between transition-colors border select-none cursor-pointer ${
          isOpen ? 'border-orange-500/50 shadow-[0_0_12px_rgba(249,115,22,0.15)]' : 'border-white/[0.06]'
        }`}
      >
        <div className="flex items-center gap-2.5">
          <Calendar03Icon size={16} className="text-orange-400 shrink-0" />
          <span className="font-mono font-medium text-white/90">{value || '选择日期'}</span>
          {daysDiffText && (
            <span className="px-2 py-0.5 rounded-full text-[10.5px] font-medium bg-orange-500/15 text-orange-400 border border-orange-500/20">
              {daysDiffText}
            </span>
          )}
        </div>
        <ArrowDown01Icon
          size={14}
          className={`text-white/40 transition-transform duration-200 ${isOpen ? 'rotate-180 text-orange-400' : ''}`}
        />
      </button>

      {/* 悬浮弹出层（继承 Station 统一的 modal-card-glow 微光纯净无边框体系） */}
      {typeof document !== 'undefined' &&
        createPortal(
          <AnimatePresence>
            {isOpen && popoverPos && (
              <div
                style={{
                  position: 'fixed',
                  top: popoverPos.top,
                  left: popoverPos.left,
                  width: popoverPos.width,
                  zIndex: 9999,
                }}
                className="select-none"
              >
                <motion.div
                  ref={popoverRef}
                  initial={{ opacity: 0, scale: 0.94, y: -6 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.94, y: -6 }}
                  transition={{ duration: 0.16, ease: [0.16, 1, 0.3, 1] }}
                  className="modal-card-glow rounded-[20px] p-4 text-white space-y-3 shadow-[0_24px_70px_rgba(0,0,0,0.85),0_0_40px_rgba(234,88,12,0.15)]"
                >
                  {/* 年月切换头部 */}
                  <div className="flex items-center justify-between px-1">
                    <div className="flex items-center gap-2">
                      <Calendar03Icon size={16} className="text-orange-400" />
                      <span className="text-sm font-semibold tracking-tight text-white/95">
                        {viewYear} 年 {viewMonth} 月
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={handlePrevMonth}
                        className="w-7 h-7 rounded-lg bg-white/[0.06] hover:bg-white/[0.12] flex items-center justify-center text-white/70 hover:text-white transition-colors cursor-pointer"
                      >
                        <ArrowLeft01Icon size={14} />
                      </button>
                      <button
                        type="button"
                        onClick={handleNextMonth}
                        className="w-7 h-7 rounded-lg bg-white/[0.06] hover:bg-white/[0.12] flex items-center justify-center text-white/70 hover:text-white transition-colors cursor-pointer"
                      >
                        <ArrowRight01Icon size={14} />
                      </button>
                    </div>
                  </div>

                  {/* 星期表头 */}
                  <div className="grid grid-cols-7 text-center text-xs font-medium text-white/35 py-0.5">
                    <span>一</span>
                    <span>二</span>
                    <span>三</span>
                    <span>四</span>
                    <span>五</span>
                    <span className="text-orange-400/70">六</span>
                    <span className="text-orange-400/70">日</span>
                  </div>

                  {/* 日期网格：等宽舒展布局 */}
                  <div className="grid grid-cols-7 gap-y-1.5 justify-items-center">
                    {calendarDays.map((item, idx) => {
                      const isSelected = item.dateStr === value;
                      const isToday = item.dateStr === todayStr;

                      return (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => handleSelectDate(item.dateStr)}
                          className={`w-9 h-9 rounded-xl text-xs font-medium flex flex-col items-center justify-center transition-all cursor-pointer relative ${
                            isSelected
                              ? 'bg-orange-500 text-white font-bold shadow-[0_2px_12px_rgba(249,115,22,0.45)] scale-105'
                              : item.isCurrentMonth
                              ? 'text-white/85 hover:bg-white/[0.1] hover:text-white'
                              : 'text-white/20 hover:bg-white/[0.04] hover:text-white/40'
                          }`}
                        >
                          <span>{item.day}</span>
                          {isToday && !isSelected && (
                            <span className="w-1 h-1 rounded-full bg-orange-400 -mt-0.5" />
                          )}
                        </button>
                      );
                    })}
                  </div>

                  {/* 分割线：柔和微光渐变 */}
                  <div className="h-px bg-gradient-to-r from-transparent via-white/[0.08] to-transparent my-1" />

                  {/* 底部 4 个快捷预设微胶囊 */}
                  <div className="grid grid-cols-4 gap-2 pt-0.5">
                    {[
                      { label: '元旦跨年', onClick: applyYearEnd },
                      { label: '1个月后', onClick: (e: React.MouseEvent) => applyPresetMonths(1, e) },
                      { label: '100天后', onClick: (e: React.MouseEvent) => applyPresetDays(100, e) },
                      { label: '明年今日', onClick: (e: React.MouseEvent) => applyPresetMonths(12, e) },
                    ].map((item) => (
                      <button
                        key={item.label}
                        type="button"
                        onClick={item.onClick}
                        className="py-1.5 px-2 rounded-xl bg-white/[0.04] hover:bg-orange-500/15 text-white/60 hover:text-orange-400 active:scale-95 text-xs font-medium transition-all text-center cursor-pointer select-none border border-transparent hover:border-orange-500/20"
                      >
                        {item.label}
                      </button>
                    ))}
                  </div>
                </motion.div>
              </div>
            )}
          </AnimatePresence>,
          document.body
        )}
    </div>
  );
};
