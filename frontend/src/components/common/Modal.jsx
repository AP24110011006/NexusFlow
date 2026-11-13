import React, { useEffect } from 'react';
import { X } from 'lucide-react';

/**
 * Reusable Accessible Modal Dialog Component
 * Authored by: Likhitha (Frontend Role — Core UI & Layout)
 * Milestone: Week 1 Deliverable — UI Design System Components
 * Organization: Infotact Solutions
 */
export default function Modal({
  isOpen,
  onClose,
  title,
  children,
  maxWidth = 'md', // 'sm' | 'md' | 'lg' | 'xl' | '2xl'
  showCloseButton = true,
}) {
  useEffect(() => {
    function handleKeyDown(e) {
      if (e.key === 'Escape' && isOpen) {
        onClose?.();
      }
    }
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.body.style.overflow = 'unset';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const maxWidthStyles = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-xl',
    '2xl': 'max-w-2xl',
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm transition-opacity"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Modal Dialog Card */}
      <div
        className={`relative w-full ${
          maxWidthStyles[maxWidth] || maxWidthStyles.md
        } bg-slate-900/95 border border-slate-800 rounded-2xl shadow-2xl p-6 text-slate-100 z-10 transform transition-all`}
        role="dialog"
        aria-modal="true"
        aria-labelledby={title ? 'modal-title' : undefined}
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-4 mb-4 border-b border-slate-800/80">
          {title && (
            <h3 id="modal-title" className="text-lg font-bold text-white tracking-wide">
              {title}
            </h3>
          )}
          {showCloseButton && (
            <button
              type="button"
              onClick={onClose}
              className="text-slate-400 hover:text-slate-200 transition-colors p-1.5 rounded-lg hover:bg-slate-800"
              aria-label="Close dialog"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Content Body */}
        <div className="space-y-4">{children}</div>
      </div>
    </div>
  );
}
