import React from 'react';

/**
 * Reusable UI Badge Component
 * Authored by: Likhitha (Frontend Role — Core UI & Layout)
 * Milestone: Week 1 Deliverable — UI Design System Components
 * Organization: Infotact Solutions
 */
export default function Badge({
  children,
  variant = 'info', // 'success' | 'warning' | 'danger' | 'info' | 'neutral' | 'purple'
  size = 'md',        // 'sm' | 'md' | 'lg'
  pulse = false,
  icon: Icon,
  className = '',
  ...props
}) {
  const baseStyles = 'inline-flex items-center font-medium rounded-full transition-colors';

  const sizeStyles = {
    sm: 'px-2 py-0.5 text-[10px] gap-1',
    md: 'px-2.5 py-1 text-xs gap-1.5',
    lg: 'px-3 py-1.5 text-xs gap-2',
  };

  const variantStyles = {
    success: 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20',
    warning: 'bg-amber-500/10 text-amber-400 border border-amber-500/20',
    danger: 'bg-rose-500/10 text-rose-400 border border-rose-500/20',
    info: 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/20',
    purple: 'bg-purple-500/10 text-purple-400 border border-purple-500/20',
    neutral: 'bg-slate-700/40 text-slate-300 border border-slate-600/30',
  };

  const dotColors = {
    success: 'bg-emerald-400',
    warning: 'bg-amber-400',
    danger: 'bg-rose-400',
    info: 'bg-cyan-400',
    purple: 'bg-purple-400',
    neutral: 'bg-slate-400',
  };

  return (
    <span
      className={`${baseStyles} ${sizeStyles[size] || sizeStyles.md} ${
        variantStyles[variant] || variantStyles.info
      } ${className}`}
      {...props}
    >
      {pulse && (
        <span className="relative flex h-2 w-2">
          <span
            className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${
              dotColors[variant] || dotColors.info
            }`}
          />
          <span
            className={`relative inline-flex rounded-full h-2 w-2 ${
              dotColors[variant] || dotColors.info
            }`}
          />
        </span>
      )}
      {Icon && <Icon className="w-3.5 h-3.5 shrink-0" />}
      <span>{children}</span>
    </span>
  );
}
