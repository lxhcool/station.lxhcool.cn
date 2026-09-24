import React from 'react';
import { WidgetStrategy, WidgetInstance, WidgetSize } from '../../types/widget';
import { Calendar03Icon } from 'hugeicons-react';

export interface CalendarConfig {
  showLunar?: boolean;
}

const CalendarWidget: React.FC<{
  instance: WidgetInstance<CalendarConfig>;
  size: WidgetSize;
  openInNewTab?: boolean;
  onUpdateConfig?: (cfg: Partial<CalendarConfig>) => void;
}> = ({ size }) => {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth() + 1;
  const day = now.getDate();
  const weekdays = ['日', '一', '二', '三', '四', '五', '六'];
  const weekdayStr = '周' + weekdays[now.getDay()];

  // 计算本月天数与第一天星期几
  const daysInMonth = new Date(year, month, 0).getDate();
  const firstDayWeekday = new Date(year, month - 1, 1).getDay(); // 0 is Sunday
  // 转换让星期一作为第 1 列: Monday -> 0, Sunday -> 6
  const startCol = (firstDayWeekday + 6) % 7;

  // 2x2 经典大日历翻页方块
  if (size === '2x2') {
    return (
      <div className="w-full h-full rounded-[16px] bg-[#1a1c26]/90 backdrop-blur-xl p-4 flex flex-col justify-between shadow-[0_8px_24px_-4px_rgba(0,0,0,0.35)] select-none">
        <div className="flex items-center justify-between text-xs font-semibold text-white/80">
          <span>{year} 年 {month} 月</span>
          <span className="text-red-400 font-bold">{weekdayStr}</span>
        </div>

        <div className="my-auto py-1">
          <div className="text-5xl font-black tracking-tight text-red-500 drop-shadow-sm">
            {day}
          </div>
        </div>

        <div className="space-y-0.5 text-[11px] text-white/60">
          <div className="text-white/90 font-medium">秋分 · 农历八月</div>
          <div className="text-[10px] text-white/40">今日宜出行 · 顺意</div>
        </div>
      </div>
    );
  }

  // 4x2 完整月历视图 (参考图右半区样式)
  return (
    <div className="w-full h-full rounded-[16px] bg-[#1a1c26]/90 backdrop-blur-xl p-4 flex items-center justify-between gap-4 shadow-[0_8px_24px_-4px_rgba(0,0,0,0.35)] select-none">
      {/* 左侧：今日大字 */}
      <div className="flex flex-col justify-between h-full min-w-[100px] shrink-0">
        <div className="text-xs font-bold text-white/80">
          {year} 年 {month} 月
        </div>

        <div className="text-4xl font-black text-red-500 my-auto">
          {day}
        </div>

        <div className="space-y-0.5 text-[11px] text-white/60">
          <div className="text-white/90 font-semibold">{weekdayStr}</div>
          <div className="text-[10.5px] text-white/40">第 {Math.ceil((now.getTime() - new Date(year, 0, 1).getTime()) / 86400000)} 天</div>
        </div>
      </div>

      {/* 右侧：月历网格 */}
      <div className="flex-1 h-full flex flex-col justify-between py-0.5">
        {/* 星期表头 */}
        <div className="grid grid-cols-7 text-center text-[10.5px] font-semibold text-white/40 mb-1">
          <span>一</span>
          <span>二</span>
          <span>三</span>
          <span>四</span>
          <span>五</span>
          <span className="text-red-400/80">六</span>
          <span className="text-red-400/80">日</span>
        </div>

        {/* 日期数字矩阵 */}
        <div className="grid grid-cols-7 gap-y-1 text-center text-[11px]">
          {/* 前置空白填充 */}
          {Array.from({ length: startCol }).map((_, i) => (
            <div key={`empty-${i}`} className="h-4" />
          ))}

          {/* 当月日期 */}
          {Array.from({ length: daysInMonth }).map((_, i) => {
            const dateNum = i + 1;
            const isToday = dateNum === day;
            const dayOfWeek = (startCol + i) % 7;
            const isWeekend = dayOfWeek === 5 || dayOfWeek === 6;

            return (
              <div key={dateNum} className="flex items-center justify-center h-4">
                <span
                  className={`w-4 h-4 rounded-full flex items-center justify-center text-[10.5px] ${
                    isToday
                      ? 'bg-red-500 text-white font-bold shadow-sm'
                      : isWeekend
                      ? 'text-red-400/80 font-medium'
                      : 'text-white/80 font-medium'
                  }`}
                >
                  {dateNum}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export const calendarStrategy: WidgetStrategy<CalendarConfig> = {
  type: 'calendar',
  name: '日历日程',
  description: '公历农历合一，大号今日翻牌与完整月历日程视图',
  icon: Calendar03Icon,
  defaultSize: '2x2',
  supportedSizes: ['2x2', '4x2'],
  defaultConfig: {
    showLunar: true,
  },
  render: CalendarWidget,
};
