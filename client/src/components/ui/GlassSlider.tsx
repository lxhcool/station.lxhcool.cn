import React from 'react';

interface GlassSliderProps {
  label: string;
  value: number;
  min: number;
  max: number;
  step?: number;
  unit?: string;
  onChange: (val: number) => void;
}

export const GlassSlider: React.FC<GlassSliderProps> = ({
  label,
  value,
  min,
  max,
  step = 1,
  unit = '',
  onChange,
}) => {
  const percentage = ((value - min) / (max - min)) * 100;

  return (
    <div className="space-y-2">
      <div className="flex justify-between items-center text-xs">
        <span className="text-white/80 font-medium">{label}</span>
        <span className="text-indigo-300 font-mono bg-white/10 px-2 py-0.5 rounded-md border border-white/10">
          {value}{unit}
        </span>
      </div>
      <div className="relative flex items-center h-6">
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={value}
          onChange={(e) => onChange(parseFloat(e.target.value))}
          className="w-full h-2 bg-slate-800/80 rounded-lg appearance-none cursor-pointer accent-indigo-500 hover:accent-indigo-400 focus:outline-none border border-white/10"
          style={{
            background: `linear-gradient(to right, rgb(99 102 241) 0%, rgb(99 102 241) ${percentage}%, rgba(255, 255, 255, 0.15) ${percentage}%, rgba(255, 255, 255, 0.15) 100%)`
          }}
        />
      </div>
    </div>
  );
};
