import React from 'react';
import { Clock, Shield, CheckCircle2, AlertTriangle, AlertOctagon, Info } from 'lucide-react';

/**
 * NexusFlow — Accessible Vertical Activity & Audit Timeline Component
 * Author: Likhitha (Frontend Core / UI Lead)
 * Organization: Infotact Solutions
 * Milestone: Week 3 - Audit Trail Timelines & Escalation Historiography
 *
 * @param {Object} props
 * @param {Array<{ id: string|number, title: string, description?: string, timestamp: string, status?: 'success'|'warning'|'danger'|'info', actor?: string, role?: string, metadata?: Object }>} props.events
 * @param {string} [props.className]
 */
export default function Timeline({
  events = [],
  className = '',
}) {
  if (!events || events.length === 0) return null;

  const statusMap = {
    success: {
      dot: 'bg-emerald-500 ring-emerald-100 dark:ring-emerald-950/60',
      icon: CheckCircle2,
      textColor: 'text-emerald-600 dark:text-emerald-400',
    },
    warning: {
      dot: 'bg-amber-500 ring-amber-100 dark:ring-amber-950/60',
      icon: AlertTriangle,
      textColor: 'text-amber-600 dark:text-amber-400',
    },
    danger: {
      dot: 'bg-rose-500 ring-rose-100 dark:ring-rose-950/60',
      icon: AlertOctagon,
      textColor: 'text-rose-600 dark:text-rose-400',
    },
    info: {
      dot: 'bg-blue-500 ring-blue-100 dark:ring-blue-950/60',
      icon: Info,
      textColor: 'text-blue-600 dark:text-blue-400',
    },
  };

  return (
    <div aria-label="Activity Timeline" className={`relative pl-6 space-y-6 ${className}`}>
      {/* Continuous Timeline Vertical Spine */}
      <div
        className="absolute top-2 bottom-2 left-2.5 w-0.5 bg-gray-200 dark:bg-gray-800 -translate-x-1/2"
        aria-hidden="true"
      />

      {events.map((event, idx) => {
        const config = statusMap[event.status] || statusMap.info;
        const Icon = config.icon;

        return (
          <div key={event.id || idx} className="relative flex items-start group">
            {/* Dot Indicator */}
            <span
              className={`absolute -left-6 top-1 flex items-center justify-center w-5 h-5 rounded-full ring-4 ${config.dot} text-white shadow-xs z-10 transition-transform group-hover:scale-110`}
            >
              <Icon className="w-3 h-3 stroke-[3]" aria-hidden="true" />
            </span>

            {/* Event Card Content */}
            <div className="flex-1 min-w-0 bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 p-3.5 rounded-xl shadow-xs group-hover:border-gray-300 dark:group-hover:border-gray-700 transition-colors">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 mb-1">
                <span className="text-sm font-semibold text-gray-900 dark:text-gray-100 truncate">
                  {event.title}
                </span>

                <time className="text-[11px] text-gray-400 dark:text-gray-500 flex items-center flex-shrink-0">
                  <Clock className="w-3 h-3 mr-1" aria-hidden="true" />
                  {event.timestamp ? new Date(event.timestamp).toLocaleString() : 'Just now'}
                </time>
              </div>

              {event.description && (
                <p className="text-xs text-gray-600 dark:text-gray-400 leading-relaxed mb-2">
                  {event.description}
                </p>
              )}

              {/* Actor & Metadata Footer */}
              <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-gray-50 dark:border-gray-800/60 text-[11px]">
                {event.actor && (
                  <div className="flex items-center space-x-1.5 text-gray-500 dark:text-gray-400">
                    <Shield className="w-3 h-3 text-gray-400" />
                    <span className="font-medium text-gray-700 dark:text-gray-300">{event.actor}</span>
                    {event.role && (
                      <span className="px-1.5 py-0.2 rounded bg-gray-100 dark:bg-gray-800 text-gray-500 font-mono text-[10px]">
                        {event.role}
                      </span>
                    )}
                  </div>
                )}

                {event.metadata && (
                  <span className="text-[10px] font-mono text-gray-400 truncate max-w-[200px]">
                    {JSON.stringify(event.metadata)}
                  </span>
                )}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
