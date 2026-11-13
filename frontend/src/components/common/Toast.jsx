import React, { useEffect } from 'react';
import { CheckCircle2, AlertTriangle, AlertCircle, Info, X } from 'lucide-react';

/**
 * Reusable Operational Toast Notification Component
 * Authored by: Likhitha (Frontend Role — Core UI & Layout)
 * Milestone: Week 1 Deliverable — UI Notification Components
 * Organization: Infotact Solutions
 */
export default function Toast({
  message,
  type = 'info', // 'success' | 'warning' | 'error' | 'info'
  onClose,
  duration = 4000,
}) {
  useEffect(() => {
    if (duration > 0 && onClose) {
      const timer = setTimeout(() => {
        onClose();
      }, duration);
      return () => clearTimeout(timer);
    }
  }, [duration, onClose]);

  const icons = {
    success: <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />,
    warning: <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0" />,
    error: <AlertCircle className="w-5 h-5 text-rose-400 shrink-0" />,
    info: <Info className="w-5 h-5 text-cyan-400 shrink-0" />,
  };

  const borders = {
    success: 'border-emerald-500/30 bg-emerald-950/40 text-emerald-100',
    warning: 'border-amber-500/30 bg-amber-950/40 text-amber-100',
    error: 'border-rose-500/30 bg-rose-950/40 text-rose-100',
    info: 'border-cyan-500/30 bg-cyan-950/40 text-cyan-100',
  };

  return (
    <div
      role="alert"
      className={`flex items-center gap-3 px-4 py-3 rounded-xl border backdrop-blur-md shadow-xl transition-all duration-300 ${
        borders[type] || borders.info
      }`}
    >
      {icons[type] || icons.info}
      <p className="text-sm font-medium flex-1 leading-snug">{message}</p>
      {onClose && (
        <button
          type="button"
          onClick={onClose}
          className="text-slate-400 hover:text-white p-1 rounded-md transition-colors"
          aria-label="Dismiss notification"
        >
          <X className="w-4 h-4" />
        </button>
      )}
    </div>
  );
}
