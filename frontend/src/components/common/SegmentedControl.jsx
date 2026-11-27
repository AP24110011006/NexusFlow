/**
 * NexusFlow — SegmentedControl UI Component
 * Author: Likhitha (Frontend Core & UI/UX Lead)
 * Organization: Infotact Solutions
 * Internship Reference: ITS/WEB/1849
 * Milestone: Week 3 - Visual Flow Builder View Switching & Navigation Controls
 */

import React from 'react';

export const SegmentedControl = ({
  options = [],
  value,
  onChange,
  size = 'md',
  disabled = false,
  className = ''
}) => {
  const sizeClasses = {
    sm: 'text-xs py-1 px-2.5',
    md: 'text-xs py-1.5 px-3.5',
    lg: 'text-sm py-2 px-4'
  };

  const handleKeyDown = (e, index) => {
    if (disabled || !options.length) return;

    let targetIndex = null;
    if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
      targetIndex = (index + 1) % options.length;
    } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
      targetIndex = (index - 1 + options.length) % options.length;
    } else if (e.key === 'Home') {
      targetIndex = 0;
    } else if (e.key === 'End') {
      targetIndex = options.length - 1;
    }

    if (targetIndex !== null) {
      e.preventDefault();
      const targetOpt = options[targetIndex];
      if (onChange && (!targetOpt.disabled)) {
        onChange(targetOpt.id || targetOpt.value);
      }
    }
  };

  return (
    <div
      role="radiogroup"
      className={`inline-flex p-1 rounded-xl bg-slate-900 border border-slate-800 shadow-inner select-none ${
        disabled ? 'opacity-50 pointer-events-none' : ''
      } ${className}`}
    >
      {options.map((option, idx) => {
        const optionId = option.id || option.value;
        const isSelected = value === optionId;
        const isOptionDisabled = disabled || option.disabled;

        return (
          <button
            key={optionId}
            type="button"
            role="radio"
            aria-checked={isSelected}
            disabled={isOptionDisabled}
            tabIndex={isSelected ? 0 : -1}
            onClick={() => !isOptionDisabled && onChange && onChange(optionId)}
            onKeyDown={(e) => handleKeyDown(e, idx)}
            className={`relative flex items-center justify-center space-x-2 font-medium rounded-lg transition-all duration-200 outline-none ${
              sizeClasses[size] || sizeClasses.md
            } ${
              isSelected
                ? 'bg-sky-500 text-white shadow-md shadow-sky-500/20 font-semibold'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            {option.icon && (
              <span className={`w-3.5 h-3.5 shrink-0 ${isSelected ? 'text-white' : 'text-slate-400'}`}>
                {option.icon}
              </span>
            )}
            <span>{option.label || option.name}</span>
            {option.badge !== undefined && (
              <span
                className={`ml-1 px-1.5 py-0.2 rounded-full text-[10px] font-mono ${
                  isSelected ? 'bg-sky-600 text-white' : 'bg-slate-800 text-slate-400'
                }`}
              >
                {option.badge}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
};

export default SegmentedControl;
