import React, { useEffect } from 'react';
import { Cancel01Icon } from 'hugeicons-react';

interface GlassModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl';
}

export const GlassModal: React.FC<GlassModalProps> = ({
  isOpen,
  onClose,
  title,
  children,
  maxWidth = 'md',
}) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const maxWidthClass = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-xl',
    '2xl': 'max-w-2xl',
  }[maxWidth];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* 沉浸式压暗背景 */}
      <div
        className="fixed inset-0 bg-[#0f1118]/65 backdrop-blur-md transition-opacity animate-in fade-in duration-200"
        onClick={onClose}
      />

      {/* 柔光玻璃面板 */}
      <div
        className={`w-full ${maxWidthClass} relative z-10 soft-glass-panel rounded-3xl p-0 animate-in zoom-in-95 duration-200 overflow-hidden`}
      >
        {/* 标题栏 */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/10">
          <h3 className="text-sm font-medium text-white/90 tracking-wide">{title}</h3>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-white/10 text-white/50 hover:text-white transition-colors"
          >
            <Cancel01Icon size={16} />
          </button>
        </div>

        {/* 主体 */}
        <div className="p-6 max-h-[78vh] overflow-y-auto">
          {children}
        </div>
      </div>
    </div>
  );
};
