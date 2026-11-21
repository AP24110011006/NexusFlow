import React from 'react';
import { Inbox } from 'lucide-react';
import Button from './Button';

/**
 * NexusFlow — Accessible Empty State & Zero-Data Component
 * Author: Likhitha (Frontend Core / UI Lead)
 * Organization: Infotact Solutions
 * Milestone: Week 2 - Empty States & Resilience UX
 *
 * @param {Object} props
 * @param {string} props.title - Empty state headline
 * @param {string} [props.description] - Subtitle explaining reason or resolution
 * @param {React.ComponentType} [props.icon=Inbox] - Lucide icon component
 * @param {string} [props.actionLabel] - Button label if an action is available
 * @param {function} [props.onAction] - Button click handler
 * @param {React.ReactNode} [props.extra] - Additional custom content
 * @param {string} [props.className] - Wrapper utility classes
 */
export default function EmptyState({
  title = 'No records found',
  description = 'There is currently no telemetry, alert, or configuration data to display.',
  icon: Icon = Inbox,
  actionLabel,
  onAction,
  extra,
  className = '',
}) {
  return (
    <div
      role="status"
      aria-live="polite"
      className={`flex flex-col items-center justify-center p-8 text-center rounded-xl border border-dashed border-gray-200 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-900/40 ${className}`}
    >
      <div className="p-3.5 mb-3 bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 rounded-full shadow-inner">
        <Icon className="w-8 h-8" aria-hidden="true" />
      </div>

      <h3 className="text-base font-semibold text-gray-900 dark:text-gray-100 mb-1">
        {title}
      </h3>

      {description && (
        <p className="text-sm text-gray-500 dark:text-gray-400 max-w-sm mb-4 leading-relaxed">
          {description}
        </p>
      )}

      {actionLabel && onAction && (
        <Button variant="primary" size="sm" onClick={onAction}>
          {actionLabel}
        </Button>
      )}

      {extra && <div className="mt-4">{extra}</div>}
    </div>
  );
}
