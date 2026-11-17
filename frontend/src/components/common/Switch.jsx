import React from 'react';

/**
 * Reusable Accessible Toggle Switch Component
 * Authored by: Likhitha (Frontend Role — Core UI & Layout)
 * Milestone: Week 2 Deliverable — UI Form Controls
 * Organization: Infotact Solutions
 */
export default function Switch({
  checked = false,
  onChange,
  disabled = false,
  label,
  description,
  className = '',
  id,
}) {
  const switchId = id || `switch-${Math.random().toString(36).substr(2, 9)}`;

  function handleKeyDown(e) {
    if (disabled) return;
    if (e.key === ' ' || e.key === 'Enter') {
      e.preventDefault();
      onChange?.(!checked);
    }
  }

  return (
    <div className={`flex items-start justify-between gap-3 ${className}`}>
      {(label || description) && (
        <label
          htmlFor={switchId}
          className={`flex-1 cursor-pointer select-none ${
            disabled ? 'opacity-50 cursor-not-allowed' : ''
          }`}
        >
          {label && (
            <div className="text-xs font-semibold text-slate-200 leading-tight">
              {label}
            </div>
          )}
          {description && (
            <div className="text-[11px] text-slate-500 mt-0.5 leading-snug">
              {description}
            </div>
          )}
        </label>
      )}

      {/* Switch Toggle Button */}
      <button
        id={switchId}
        type="button"
        role="switch"
        aria-checked={checked}
        disabled={disabled}
        onClick={() => onChange?.(!checked)}
        onKeyDown={handleKeyDown}
        className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-cyan-500/20 disabled:cursor-not-allowed disabled:opacity-50 ${
          checked ? 'bg-cyan-500' : 'bg-slate-700'
        }`}
      >
        <span
          className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow-md ring-0 transition duration-200 ease-in-out ${
            checked ? 'translate-x-4' : 'translate-x-0'
          }`}
        />
      </button>
    </div>
  );
}
