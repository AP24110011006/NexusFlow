import React, { useState } from 'react';
import { ChevronDown } from 'lucide-react';

/**
 * NexusFlow — Accessible Multi/Single Expand Accordion Component
 * Author: Likhitha (Frontend Core / UI Lead)
 * Organization: Infotact Solutions
 * Milestone: Week 2 - Collapsible IoT Configuration & Telemetry Panels
 *
 * @param {Object} props
 * @param {Array<{ id: string, title: React.ReactNode, content: React.ReactNode, icon?: React.ComponentType, badge?: React.ReactNode, disabled?: boolean }>} props.items
 * @param {boolean} [props.allowMultiple=false] - Allow multiple sections to be open simultaneously
 * @param {Array<string>} [props.defaultOpenIds=[]] - IDs of initially expanded items
 * @param {function} [props.onChange] - Callback (openIds: string[]) => void
 * @param {string} [props.className]
 */
export default function Accordion({
  items = [],
  allowMultiple = false,
  defaultOpenIds = [],
  onChange,
  className = '',
}) {
  const [openIds, setOpenIds] = useState(new Set(defaultOpenIds));

  const toggleItem = (id, disabled) => {
    if (disabled) return;

    setOpenIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        if (!allowMultiple) {
          next.clear();
        }
        next.add(id);
      }

      if (onChange) {
        onChange(Array.from(next));
      }
      return next;
    });
  };

  if (!items || items.length === 0) return null;

  return (
    <div className={`divide-y divide-gray-200 dark:divide-gray-800 border border-gray-200 dark:border-gray-800 rounded-lg overflow-hidden bg-white dark:bg-gray-900 shadow-sm ${className}`}>
      {items.map((item) => {
        const isOpen = openIds.has(item.id);
        const Icon = item.icon;

        return (
          <div key={item.id} className="transition-colors duration-150">
            <h3>
              <button
                type="button"
                id={`accordion-btn-${item.id}`}
                aria-expanded={isOpen}
                aria-controls={`accordion-panel-${item.id}`}
                disabled={item.disabled}
                onClick={() => toggleItem(item.id, item.disabled)}
                className={`w-full flex items-center justify-between px-4 py-3.5 text-left font-medium transition-all duration-200 ${
                  item.disabled
                    ? 'opacity-50 cursor-not-allowed bg-gray-50 dark:bg-gray-900/50'
                    : isOpen
                    ? 'bg-blue-50/50 dark:bg-blue-950/20 text-blue-700 dark:text-blue-400'
                    : 'text-gray-800 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-800/60'
                }`}
              >
                <div className="flex items-center space-x-3 min-w-0 pr-2">
                  {Icon && (
                    <Icon className={`w-4 h-4 flex-shrink-0 ${
                      isOpen ? 'text-blue-600 dark:text-blue-400' : 'text-gray-400 dark:text-gray-500'
                    }`} />
                  )}
                  <span className="text-sm font-semibold truncate">{item.title}</span>
                  {item.badge && <span className="flex-shrink-0">{item.badge}</span>}
                </div>

                <ChevronDown
                  className={`w-4 h-4 text-gray-400 dark:text-gray-500 flex-shrink-0 transition-transform duration-200 ${
                    isOpen ? 'rotate-180 text-blue-600 dark:text-blue-400' : ''
                  }`}
                  aria-hidden="true"
                />
              </button>
            </h3>

            <div
              id={`accordion-panel-${item.id}`}
              role="region"
              aria-labelledby={`accordion-btn-${item.id}`}
              hidden={!isOpen}
              className={`transition-all duration-200 ${
                isOpen ? 'block' : 'hidden'
              }`}
            >
              <div className="px-4 py-3 text-sm text-gray-600 dark:text-gray-300 bg-white dark:bg-gray-900 border-t border-gray-100 dark:border-gray-800/60 leading-relaxed">
                {item.content}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
