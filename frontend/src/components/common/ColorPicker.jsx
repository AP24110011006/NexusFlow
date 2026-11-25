/**
 * NexusFlow — ColorPicker UI Component
 * Author: Likhitha (Frontend Core & UI/UX Lead)
 * Organization: Infotact Solutions
 * Internship Reference: ITS/WEB/1849
 * Milestone: Week 3 - Visual Rule Builder Theming & Preset Swatches
 */

import React, { useState, useRef, useEffect } from 'react';

const DEFAULT_PRESETS = [
  { label: 'Emerald Green', hex: '#10B981', ring: 'ring-emerald-400' },
  { label: 'Sky Blue', hex: '#0EA5E9', ring: 'ring-sky-400' },
  { label: 'Amber Orange', hex: '#F59E0B', ring: 'ring-amber-400' },
  { label: 'Rose Red', hex: '#F43F5E', ring: 'ring-rose-400' },
  { label: 'Indigo Purple', hex: '#6366F1', ring: 'ring-indigo-400' },
  { label: 'Cyan Teal', hex: '#06B6D4', ring: 'ring-cyan-400' },
  { label: 'Violet', hex: '#8B5CF6', ring: 'ring-purple-400' },
  { label: 'Slate Grey', hex: '#64748B', ring: 'ring-slate-400' }
];

export const ColorPicker = ({
  value = '#0EA5E9',
  onChange,
  label = 'Color Theme',
  presets = DEFAULT_PRESETS,
  disabled = false,
  className = ''
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [customHex, setCustomHex] = useState(value);
  const containerRef = useRef(null);

  useEffect(() => {
    setCustomHex(value);
  }, [value]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  const handleSelect = (hex) => {
    setCustomHex(hex);
    if (onChange) onChange(hex);
  };

  const handleHexChange = (e) => {
    const val = e.target.value;
    setCustomHex(val);
    if (/^#[0-9A-Fa-f]{6}$/.test(val)) {
      if (onChange) onChange(val);
    }
  };

  return (
    <div className={`relative inline-block text-left ${className}`} ref={containerRef}>
      {label && (
        <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
          {label}
        </label>
      )}

      {/* Trigger Button */}
      <button
        type="button"
        disabled={disabled}
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-2.5 px-3 py-1.5 rounded-lg border border-slate-700 bg-slate-800/90 hover:bg-slate-700/80 transition-all text-sm text-slate-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
        aria-haspopup="true"
        aria-expanded={isOpen}
      >
        <span
          className="w-4 h-4 rounded-full border border-white/20 shadow-inner shrink-0"
          style={{ backgroundColor: value }}
        />
        <span className="font-mono text-xs text-slate-300 uppercase">{value}</span>
        <svg
          className={`w-3.5 h-3.5 text-slate-400 transition-transform ${isOpen ? 'rotate-180' : ''}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {/* Popover Swatches */}
      {isOpen && (
        <div className="absolute z-50 mt-2 w-56 rounded-xl border border-slate-700 bg-slate-900/95 p-3 shadow-2xl backdrop-blur-md animate-fadeIn">
          <div className="text-xs font-medium text-slate-400 mb-2">Preset Palettes</div>
          <div className="grid grid-cols-4 gap-2 mb-3">
            {presets.map((p) => {
              const isSelected = value.toLowerCase() === p.hex.toLowerCase();
              return (
                <button
                  key={p.hex}
                  type="button"
                  title={p.label}
                  onClick={() => {
                    handleSelect(p.hex);
                    setIsOpen(false);
                  }}
                  className={`group relative w-9 h-9 rounded-lg border border-white/10 transition-transform hover:scale-110 flex items-center justify-center ${
                    isSelected ? 'ring-2 ring-white/60 shadow-lg' : ''
                  }`}
                  style={{ backgroundColor: p.hex }}
                >
                  {isSelected && (
                    <svg className="w-4 h-4 text-white drop-shadow-md" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" />
                    </svg>
                  )}
                </button>
              );
            })}
          </div>

          <div className="pt-2 border-t border-slate-800">
            <label className="block text-[11px] text-slate-400 mb-1">Custom Hex</label>
            <div className="flex items-center space-x-2">
              <span className="text-xs font-mono text-slate-500">#</span>
              <input
                type="text"
                value={customHex.replace('#', '')}
                onChange={handleHexChange}
                maxLength={6}
                className="w-full px-2 py-1 bg-slate-950 border border-slate-700 rounded text-xs font-mono text-slate-200 focus:outline-none focus:border-sky-500 uppercase"
                placeholder="0EA5E9"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ColorPicker;
