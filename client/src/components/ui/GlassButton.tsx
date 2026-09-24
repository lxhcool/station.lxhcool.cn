import React from 'react';
import { clsx } from 'clsx';

interface GlassButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'glass' | 'solid-primary' | 'solid-danger' | 'ghost';
  size?: 'sm' | 'md' | 'lg' | 'icon';
  children: React.ReactNode;
  icon?: React.ReactNode;
}

export const GlassButton: React.FC<GlassButtonProps> = ({
  variant = 'glass',
  size = 'md',
  children,
  icon,
  className,
  ...props
}) => {
  const sizeStyles = {
    sm: 'px-3 py-1.5 text-xs rounded-xl gap-1.5',
    md: 'px-4 py-2 text-sm rounded-xl gap-2',
    lg: 'px-6 py-3 text-base rounded-2xl gap-2.5',
    icon: 'p-2.5 rounded-xl aspect-square flex items-center justify-center',
  }[size];

  const variantStyles = {
    glass: 'liquid-glass-btn text-white/90 hover:text-white',
    'solid-primary': 'bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white font-medium shadow-lg shadow-indigo-500/25 border border-indigo-400/30 hover:-translate-y-0.5 active:translate-y-0',
    'solid-danger': 'bg-red-500/90 hover:bg-red-600 text-white font-medium shadow-md shadow-red-500/20 border border-red-400/30 active:scale-95',
    ghost: 'hover:bg-white/10 text-white/70 hover:text-white',
  }[variant];

  return (
    <button
      className={clsx(
        'inline-flex items-center justify-center transition-all duration-200 select-none cursor-pointer disabled:opacity-50 disabled:pointer-events-none',
        sizeStyles,
        variantStyles,
        className
      )}
      {...props}
    >
      {icon && <span className="flex-shrink-0">{icon}</span>}
      {children}
    </button>
  );
};
