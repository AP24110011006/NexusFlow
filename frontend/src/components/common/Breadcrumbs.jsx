import React from 'react';
import { ChevronRight, Home } from 'lucide-react';

/**
 * NexusFlow — Hierarchical Breadcrumb Navigation Component
 * Author: Likhitha (Frontend Core / UI Lead)
 * Organization: Infotact Solutions
 * Milestone: Week 2 - IoT Device Drill-down Navigation & Accessibility
 *
 * @param {Object} props
 * @param {Array<{ label: string, href?: string, icon?: React.ComponentType, current?: boolean }>} props.items - Breadcrumb items list
 * @param {React.ReactNode} [props.separator] - Optional custom separator node
 * @param {function} [props.onNavigate] - Navigation callback (item, index) => void
 * @param {string} [props.className] - Additional wrapper CSS classes
 */
export default function Breadcrumbs({
  items = [],
  separator,
  onNavigate,
  className = '',
}) {
  if (!items || items.length === 0) return null;

  const handleClick = (e, item, index) => {
    if (item.current) {
      e.preventDefault();
      return;
    }
    if (onNavigate) {
      e.preventDefault();
      onNavigate(item, index);
    }
  };

  const defaultSeparator = (
    <ChevronRight className="w-3.5 h-3.5 text-gray-400 dark:text-gray-500 flex-shrink-0" aria-hidden="true" />
  );

  return (
    <nav aria-label="Breadcrumb" className={`flex items-center text-sm font-medium ${className}`}>
      <ol className="flex items-center space-x-1.5 md:space-x-2 flex-wrap">
        {items.map((item, index) => {
          const isFirst = index === 0;
          const isLast = index === items.length - 1;
          const isCurrent = item.current || isLast;
          const Icon = item.icon || (isFirst ? Home : null);

          return (
            <li key={item.label || index} className="flex items-center space-x-1.5 md:space-x-2">
              {index > 0 && (
                <span className="flex items-center" aria-hidden="true">
                  {separator || defaultSeparator}
                </span>
              )}

              {isCurrent ? (
                <span
                  className="flex items-center text-gray-900 dark:text-gray-100 font-semibold px-1.5 py-1 rounded-md bg-gray-100 dark:bg-gray-800/60 select-none"
                  aria-current="page"
                >
                  {Icon && <Icon className="w-3.5 h-3.5 mr-1.5 text-blue-600 dark:text-blue-400 flex-shrink-0" />}
                  <span className="truncate max-w-[140px] sm:max-w-[220px]">{item.label}</span>
                </span>
              ) : (
                <a
                  href={item.href || '#'}
                  onClick={(e) => handleClick(e, item, index)}
                  className="flex items-center text-gray-500 hover:text-blue-600 dark:text-gray-400 dark:hover:text-blue-400 transition-colors duration-150 px-1.5 py-1 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800"
                >
                  {Icon && <Icon className="w-3.5 h-3.5 mr-1.5 flex-shrink-0" />}
                  <span className="truncate max-w-[120px] sm:max-w-[180px]">{item.label}</span>
                </a>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
