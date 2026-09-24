import React from 'react';
import { clsx } from 'clsx';

interface GlassInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  icon?: React.ReactNode;
}

export const GlassInput = React.forwardRef<HTMLInputElement, GlassInputProps>(({
  label,
  error,
  icon,
  className,
  ...props
}, ref) => {
  return (
    <div className="w-full space-y-1.5 text-left">
      {label && (
        <label className="block text-xs font-medium text-white/80 select-none">
          {label}
        </label>
      )}
      <div className="relative flex items-center">
        {icon && (
          <div className="absolute left-3.5 text-white/50 pointer-events-none flex items-center">
            {icon}
          </div>
        )}
        <input
          ref={ref}
          className={clsx(
            'w-full bg-slate-900/60 hover:bg-slate-900/80 focus:bg-slate-900/95',
            'backdrop-blur-xl border border-white/20 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-500/20',
            'text-white placeholder:text-white/40 text-sm rounded-xl px-4 py-2.5 transition-all outline-none',
            icon && 'pl-10',
            error && 'border-red-400 focus:border-red-500 focus:ring-red-500/20',
            className
          )}
          {...props}
        />
      </div>
      {error && (
        <p className="text-xs text-red-400 mt-1">{error}</p>
      )}
    </div>
  );
});

GlassInput.displayName = 'GlassInput';
