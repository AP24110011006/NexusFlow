import React, { useEffect, useCallback } from 'react';
import { X } from 'lucide-react';

/**
 * NexusFlow — Accessible Slide-Over Drawer / Side-Sheet Component
 * Author: Likhitha (Frontend Core / UI Lead)
 * Organization: Infotact Solutions
 * Milestone: Week 3 - Slide-over Inspection Drawers & Escalation Panels
 *
 * @param {Object} props
 * @param {boolean} props.isOpen - Drawer open/closed state
 * @param {function} props.onClose - Dismissal callback
 * @param {React.ReactNode} props.title - Drawer header title
 * @param {string} [props.description] - Optional sub-headline
 * @param {React.ReactNode} props.children - Drawer body content
 * @param {React.ReactNode} [props.footer] - Optional sticky footer actions
 * @param {'right' | 'left' | 'bottom'} [props.position='right'] - Drawer slide direction
 * @param {'sm' | 'md' | 'lg' | 'xl'} [props.size='md'] - Drawer width/size preset
 * @param {string} [props.className] - Additional utility classes
 */
export default function Drawer({
  isOpen,
  onClose,
  title,
  description,
  children,
  footer,
  position = 'right',
  size = 'md',
  className = '',
}) {
  // Handle ESC key press
  const handleKeyDown = useCallback(
    (e) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    },
    [isOpen, onClose]
  );

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, handleKeyDown]);

  if (!isOpen) return null;

  // Size widths
  const sizeMap = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-xl',
  };

  const isBottom = position === 'bottom';
  const widthClass = isBottom ? 'w-full max-h-[85vh] rounded-t-2xl' : `h-full ${sizeMap[size] || 'max-w-md'} w-full`;
  const positionClass = isBottom
    ? 'bottom-0 left-0 right-0'
    : position === 'left'
    ? 'top-0 bottom-0 left-0'
    : 'top-0 bottom-0 right-0';

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="drawer-title"
      className="fixed inset-0 z-50 overflow-hidden"
    >
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-xs transition-opacity duration-300"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Drawer Surface */}
      <div className={`fixed ${positionClass} ${widthClass} bg-white dark:bg-gray-900 shadow-2xl flex flex-col z-50 transform transition-transform duration-300 ease-in-out border-l border-gray-200 dark:border-gray-800 ${className}`}>
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 dark:border-gray-800 flex-shrink-0">
          <div>
            <h2 id="drawer-title" className="text-lg font-semibold text-gray-900 dark:text-gray-100">
              {title}
            </h2>
            {description && (
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                {description}
              </p>
            )}
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close drawer"
            className="p-1.5 rounded-lg text-gray-400 hover:text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {children}
        </div>

        {/* Optional Sticky Footer */}
        {footer && (
          <div className="px-6 py-4 border-t border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-900/50 flex-shrink-0 flex items-center justify-end space-x-3">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}
