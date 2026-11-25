/**
 * NexusFlow — FilterChipBar UI Component
 * Author: Likhitha (Frontend Core & UI/UX Lead)
 * Organization: Infotact Solutions
 * Internship Reference: ITS/WEB/1849
 * Milestone: Week 3 - Visual Rule Builder Filtering & Multi-Tag Taxonomy
 */

import React from 'react';

export const FilterChipBar = ({
  options = [],
  selected = [],
  onToggle,
  onClearAll,
  label = 'Filter by',
  showClearAll = true,
  className = ''
}) => {
  const selectedCount = selected.length;

  return (
    <div className={`flex flex-wrap items-center gap-2 ${className}`}>
      {label && (
        <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider mr-1">
          {label}:
        </span>
      )}

      {options.map((option) => {
        const isSelected = selected.includes(option.value || option.id);
        const count = option.count !== undefined ? option.count : null;

        return (
          <button
            key={option.value || option.id}
            type="button"
            onClick={() => onToggle && onToggle(option.value || option.id)}
            className={`inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-full text-xs font-medium transition-all duration-150 border ${
              isSelected
                ? 'bg-sky-500/20 text-sky-300 border-sky-500/40 shadow-sm shadow-sky-500/10'
                : 'bg-slate-800/80 text-slate-400 border-slate-700 hover:bg-slate-700/60 hover:text-slate-200'
            }`}
            aria-pressed={isSelected}
          >
            {option.icon && <span className="w-3.5 h-3.5 shrink-0">{option.icon}</span>}
            <span>{option.label || option.name}</span>
            {count !== null && (
              <span
                className={`ml-1 px-1.5 py-0.2 rounded-full text-[10px] ${
                  isSelected ? 'bg-sky-500/30 text-sky-200' : 'bg-slate-700 text-slate-400'
                }`}
              >
                {count}
              </span>
            )}
            {isSelected && (
              <svg
                className="w-3 h-3 ml-0.5 text-sky-400 hover:text-sky-200 transition-colors"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12" />
              </svg>
            )}
          </button>
        );
      })}

      {showClearAll && selectedCount > 0 && (
        <button
          type="button"
          onClick={onClearAll}
          className="text-xs text-rose-400 hover:text-rose-300 underline underline-offset-2 ml-1 transition-colors font-medium"
        >
          Clear all ({selectedCount})
        </button>
      )}
    </div>
  );
};

export default FilterChipBar;
