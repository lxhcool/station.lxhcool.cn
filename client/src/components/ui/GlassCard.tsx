import React from 'react';
import { clsx } from 'clsx';

interface GlassCardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  variant?: 'subtle' | 'default' | 'capsule' | 'panel';
  interactive?: boolean;
  className?: string;
}

export const GlassCard: React.FC<GlassCardProps> = ({
  children,
  variant = 'default',
  interactive = false,
  className,
  ...props
}) => {
  const variantStyles = {
    subtle: 'soft-glass-capsule',
    default: 'soft-glass-circle',
    capsule: 'soft-glass-capsule',
    panel: 'soft-glass-panel',
  }[variant];

  return (
    <div
      className={clsx(
        variantStyles,
        interactive && 'interactive-tap cursor-pointer hover:shadow-2xl',
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
};
