import React, { useState, useEffect } from 'react';

export const DigitalClock: React.FC<{ className?: string }> = ({ className = '' }) => {
  const [time, setTime] = useState<Date>(() => new Date());

  useEffect(() => {
    // 准秒定时器对齐
    const updateTime = () => setTime(new Date());
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  const hours = String(time.getHours()).padStart(2, '0');
  const minutes = String(time.getMinutes()).padStart(2, '0');

  // 中文星期与日期格式化
  const weekDays = ['星期日', '星期一', '星期二', '星期三', '星期四', '星期五', '星期六'];
  const month = time.getMonth() + 1;
  const date = time.getDate();
  const day = weekDays[time.getDay()];
  const dateStr = `${month}月${date}日 ${day}`;

  return (
    <div className={`flex flex-col items-center justify-center select-none cursor-default group ${className}`}>
      {/* 核心时间：Square_Dot_Matrix 点阵数码字体呈现 */}
      <div
        className="font-squaredot text-6xl sm:text-7xl md:text-8xl text-white/95 tracking-wider drop-shadow-[0_4px_24px_rgba(0,0,0,0.5)] transition-all duration-300 hover:scale-[1.02] hover:text-white"
        style={{
          fontFamily: "'SquareDotMatrix', monospace",
          fontVariantNumeric: 'tabular-nums',
        }}
      >
        {hours}:{minutes}
      </div>

      {/* 伴随日期与星期微标 */}
      <div className="mt-3 text-sm sm:text-[15px] font-medium text-white/70 tracking-[0.2em] pl-[0.2em] drop-shadow-[0_2px_10px_rgba(0,0,0,0.5)] transition-colors duration-300 group-hover:text-white/90">
        {dateStr}
      </div>
    </div>
  );
};
