import React, { useState } from 'react';

/**
 * Reusable Accessible Hover Tooltip Component
 * Authored by: Likhitha (Frontend Role — Core UI & Layout)
 * Milestone: Week 1 Deliverable — UI Design System Components
 * Organization: Infotact Solutions
 */
export default function Tooltip({
  content,
  children,
  position = 'top', // 'top' | 'bottom' | 'left' | 'right'
  className = '',
}) {
  const [isVisible, setIsVisible] = useState(false);

  if (!content) return <>{children}</>;

  const positionStyles = {
    top: 'bottom-full left-1/2 -translate-x-1/2 mb-2',
    bottom: 'top-full left-1/2 -translate-x-1/2 mt-2',
    left: 'right-full top-1/2 -translate-y-1/2 mr-2',
    right: 'left-full top-1/2 -translate-y-1/2 ml-2',
  };

  const arrowStyles = {
    top: 'top-full left-1/2 -translate-x-1/2 border-t-slate-800 border-x-transparent border-b-transparent',
    bottom: 'bottom-full left-1/2 -translate-x-1/2 border-b-slate-800 border-x-transparent border-t-transparent',
    left: 'left-full top-1/2 -translate-y-1/2 border-l-slate-800 border-y-transparent border-r-transparent',
    right: 'right-full top-1/2 -translate-y-1/2 border-r-slate-800 border-y-transparent border-l-transparent',
  };

  return (
    <div
      className={`relative inline-flex ${className}`}
      onMouseEnter={() => setIsVisible(true)}
      onMouseLeave={() => setIsVisible(false)}
      onFocus={() => setIsVisible(true)}
      onBlur={() => setIsVisible(false)}
    >
      {children}
      {isVisible && (
        <div
          role="tooltip"
          className={`absolute z-50 px-2.5 py-1.5 text-[11px] font-medium text-slate-100 bg-slate-900/95 border border-slate-700/80 rounded-lg shadow-xl backdrop-blur-md whitespace-nowrap pointer-events-none transition-all duration-150 animate-in fade-in-0 zoom-in-95 ${
            positionStyles[position] || positionStyles.top
          }`}
        >
          {content}
          <div
            className={`absolute border-4 w-0 h-0 ${
              arrowStyles[position] || arrowStyles.top
            }`}
          />
        </div>
      )}
    </div>
  );
}
