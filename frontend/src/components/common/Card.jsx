import React from 'react';

/**
 * Reusable Glassmorphic Card Container Component
 * Authored by: Likhitha (Frontend Role — Core UI & Layout)
 * Week 1 Deliverable — UI Component Library
 */
export default function Card({
  children,
  className = '',
  glow = false,
  danger = false,
  title,
  subtitle,
  action,
  headerIcon: HeaderIcon,
  ...props
}) {
  let panelClass = 'glass-panel';
  if (danger) {
    panelClass = 'glass-panel-danger';
  } else if (glow) {
    panelClass = 'glass-panel-glow';
  }

  return (
    <div className={`rounded-2xl p-5 border ${panelClass} ${className}`} {...props}>
      {(title || action || HeaderIcon) && (
        <div className="flex items-center justify-between gap-3 mb-4 pb-2 border-b border-slate-800/80">
          <div className="flex items-center gap-2">
            {HeaderIcon && <HeaderIcon className="w-4 h-4 text-cyan-400" />}
            <div>
              {title && <h3 className="text-sm font-bold text-white leading-tight">{title}</h3>}
              {subtitle && <p className="text-xs text-slate-400 mt-0.5">{subtitle}</p>}
            </div>
          </div>
          {action && <div>{action}</div>}
        </div>
      )}
      {children}
    </div>
  );
}
