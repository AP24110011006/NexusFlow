import React, { useRef } from 'react';

/**
 * Reusable Accessible Tabs Navigation Component
 * Authored by: Likhitha (Frontend Role — Core UI & Layout)
 * Milestone: Week 2 Deliverable — UI Navigation Architecture
 * Organization: Infotact Solutions
 */
export default function Tabs({
  tabs = [],
  activeTab,
  onChange,
  className = '',
  size = 'md', // 'sm' | 'md'
}) {
  const tabListRef = useRef(null);

  function handleKeyDown(e, currentIndex) {
    let nextIndex = currentIndex;
    if (e.key === 'ArrowRight') {
      nextIndex = (currentIndex + 1) % tabs.length;
    } else if (e.key === 'ArrowLeft') {
      nextIndex = (currentIndex - 1 + tabs.length) % tabs.length;
    } else if (e.key === 'Home') {
      nextIndex = 0;
    } else if (e.key === 'End') {
      nextIndex = tabs.length - 1;
    } else {
      return;
    }

    e.preventDefault();
    const nextTab = tabs[nextIndex];
    onChange?.(nextTab.id);
    const buttons = tabListRef.current?.querySelectorAll('button');
    buttons?.[nextIndex]?.focus();
  }

  const sizeStyles = {
    sm: 'text-xs py-2 px-3 gap-1.5',
    md: 'text-sm py-2.5 px-4 gap-2',
  };

  return (
    <div className={`border-b border-slate-800/80 ${className}`}>
      <div
        ref={tabListRef}
        role="tablist"
        className="flex space-x-2 overflow-x-auto no-scrollbar"
      >
        {tabs.map((tab, idx) => {
          const isActive = tab.id === activeTab;
          const Icon = tab.icon;

          return (
            <button
              key={tab.id}
              role="tab"
              aria-selected={isActive}
              tabIndex={isActive ? 0 : -1}
              onClick={() => onChange?.(tab.id)}
              onKeyDown={(e) => handleKeyDown(e, idx)}
              className={`relative inline-flex items-center font-medium transition-all whitespace-nowrap focus:outline-none rounded-t-xl ${
                sizeStyles[size] || sizeStyles.md
              } ${
                isActive
                  ? 'text-cyan-400 font-semibold bg-slate-900/60'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/30'
              }`}
            >
              {Icon && (
                <Icon
                  className={`w-4 h-4 shrink-0 transition-colors ${
                    isActive ? 'text-cyan-400' : 'text-slate-400'
                  }`}
                />
              )}
              <span>{tab.label}</span>
              {tab.badge !== undefined && (
                <span
                  className={`px-1.5 py-0.5 text-[10px] font-bold rounded-full ${
                    isActive
                      ? 'bg-cyan-500/20 text-cyan-300'
                      : 'bg-slate-800 text-slate-400'
                  }`}
                >
                  {tab.badge}
                </span>
              )}

              {/* Active Indicator Bar */}
              {isActive && (
                <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-cyan-500 to-cyan-400 rounded-full shadow-sm shadow-cyan-500/50" />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
