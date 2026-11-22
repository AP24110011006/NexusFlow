import React from 'react';

/**
 * NexusFlow — Accessible Radio Group Selector Component
 * Author: Likhitha (Frontend Core / UI Lead)
 * Organization: Infotact Solutions
 * Milestone: Week 3 - Policy Selection & Form Input Ergonomics
 *
 * @param {Object} props
 * @param {string} props.name - HTML name attribute for radio inputs
 * @param {string|number} props.value - Currently selected value
 * @param {function} props.onChange - Selection change callback (value) => void
 * @param {Array<{ value: string|number, label: React.ReactNode, description?: string, badge?: React.ReactNode, disabled?: boolean }>} props.options
 * @param {'vertical' | 'horizontal'} [props.orientation='vertical']
 * @param {string} [props.className]
 */
export default function RadioGroup({
  name,
  value,
  onChange,
  options = [],
  orientation = 'vertical',
  className = '',
}) {
  if (!options || options.length === 0) return null;

  return (
    <div
      role="radiogroup"
      className={`${
        orientation === 'horizontal' ? 'flex flex-wrap gap-3' : 'space-y-2.5'
      } ${className}`}
    >
      {options.map((opt) => {
        const isSelected = opt.value === value;
        return (
          <label
            key={opt.value}
            className={`relative flex items-start p-3.5 rounded-xl border cursor-pointer transition-all duration-150 select-none ${
              opt.disabled
                ? 'opacity-50 cursor-not-allowed bg-gray-50 dark:bg-gray-900/40 border-gray-200 dark:border-gray-800'
                : isSelected
                ? 'border-blue-600 dark:border-blue-500 bg-blue-50/40 dark:bg-blue-950/20 shadow-xs'
                : 'border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 hover:border-gray-300 dark:hover:border-gray-700'
            }`}
          >
            {/* Native Radio Input */}
            <input
              type="radio"
              name={name}
              value={opt.value}
              checked={isSelected}
              disabled={opt.disabled}
              onChange={() => !opt.disabled && onChange(opt.value)}
              className="sr-only"
            />

            {/* Custom Radio Ring */}
            <span
              className={`flex items-center justify-center w-4 h-4 mt-0.5 rounded-full border flex-shrink-0 transition-colors ${
                isSelected
                  ? 'border-blue-600 bg-blue-600 dark:border-blue-500 dark:bg-blue-500'
                  : 'border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800'
              }`}
              aria-hidden="true"
            >
              {isSelected && <span className="w-1.5 h-1.5 rounded-full bg-white" />}
            </span>

            {/* Content Body */}
            <div className="ml-3 flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <span
                  className={`text-sm font-semibold truncate ${
                    isSelected
                      ? 'text-blue-900 dark:text-blue-200'
                      : 'text-gray-900 dark:text-gray-100'
                  }`}
                >
                  {opt.label}
                </span>
                {opt.badge && <span className="ml-2 flex-shrink-0">{opt.badge}</span>}
              </div>

              {opt.description && (
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 leading-relaxed">
                  {opt.description}
                </p>
              )}
            </div>
          </label>
        );
      })}
    </div>
  );
}
