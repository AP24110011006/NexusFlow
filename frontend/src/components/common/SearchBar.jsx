import React from 'react';
import { Search, X } from 'lucide-react';

/**
 * Reusable Operational Search & Filter Input Component
 * Authored by: Likhitha (Frontend Role — Core UI & Layout)
 * Milestone: Week 2 Deliverable — UI Filter & Search Controls
 * Organization: Infotact Solutions
 */
export default function SearchBar({
  value = '',
  onChange,
  placeholder = 'Search devices, metrics, or alerts...',
  className = '',
  resultCount,
  autoFocus = false,
}) {
  function handleClear() {
    onChange?.('');
  }

  function handleKeyDown(e) {
    if (e.key === 'Escape') {
      handleClear();
    }
  }

  return (
    <div className={`relative flex items-center ${className}`}>
      <Search className="absolute left-3.5 w-4 h-4 text-slate-400 pointer-events-none" />
      <input
        type="text"
        value={value}
        onChange={(e) => onChange?.(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        autoFocus={autoFocus}
        className="w-full pl-10 pr-20 py-2 rounded-xl text-xs bg-slate-900/90 border border-slate-700/80 text-slate-100 placeholder-slate-500 hover:border-slate-600 focus:border-cyan-500/60 focus:outline-none focus:ring-2 focus:ring-cyan-500/20 transition-all backdrop-blur-md"
      />
      <div className="absolute right-2.5 flex items-center gap-1.5">
        {resultCount !== undefined && (
          <span className="px-1.5 py-0.5 text-[10px] font-mono font-medium rounded-md bg-slate-800 text-slate-400">
            {resultCount}
          </span>
        )}
        {value && (
          <button
            type="button"
            onClick={handleClear}
            className="p-1 rounded-md text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            aria-label="Clear search input"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        )}
      </div>
    </div>
  );
}
