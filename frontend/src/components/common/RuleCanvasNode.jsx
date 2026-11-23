import React from 'react';
import { Cpu, Sliders, Send, AlertTriangle, CheckCircle2 } from 'lucide-react';

/**
 * NexusFlow — Visual Rule Engine Canvas Node Component
 * Author: Likhitha (Frontend Core / UI Lead)
 * Organization: Infotact Solutions
 * Milestone: Week 3 - Visual Rule Workflow & Flow Node Topology
 *
 * @param {Object} props
 * @param {string} props.id - Unique node ID
 * @param {'trigger' | 'condition' | 'action'} [props.type='trigger'] - Node architectural role
 * @param {string} props.title - Node primary headline
 * @param {string} [props.subtitle] - Parameter or condition summary
 * @param {React.ComponentType} [props.icon] - Optional custom icon
 * @param {'active' | 'warning' | 'idle'} [props.status='active']
 * @param {boolean} [props.selected=false]
 * @param {Array<string>} [props.inputs=['in']] - Incoming connection ports
 * @param {Array<string>} [props.outputs=['out']] - Outgoing connection ports
 * @param {function} [props.onClick]
 * @param {string} [props.className]
 */
export default function RuleCanvasNode({
  id,
  type = 'trigger',
  title,
  subtitle,
  icon: CustomIcon,
  status = 'active',
  selected = false,
  inputs = ['in'],
  outputs = ['out'],
  onClick,
  className = '',
}) {
  // Styling configuration per node type
  const typeStyles = {
    trigger: {
      badgeBg: 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800',
      border: 'border-emerald-500/30 dark:border-emerald-500/20',
      Icon: Cpu,
      label: 'TRIGGER',
    },
    condition: {
      badgeBg: 'bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 border-amber-200 dark:border-amber-800',
      border: 'border-amber-500/30 dark:border-amber-500/20',
      Icon: Sliders,
      label: 'CONDITION',
    },
    action: {
      badgeBg: 'bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 border-blue-200 dark:border-blue-800',
      border: 'border-blue-500/30 dark:border-blue-500/20',
      Icon: Send,
      label: 'ACTION',
    },
  };

  const currentType = typeStyles[type] || typeStyles.trigger;
  const NodeIcon = CustomIcon || currentType.Icon;

  return (
    <div
      onClick={onClick}
      className={`relative w-64 bg-white dark:bg-gray-900 border rounded-xl shadow-md p-4 transition-all duration-200 select-none cursor-pointer ${
        selected
          ? 'ring-2 ring-blue-500 border-blue-500 shadow-blue-500/10'
          : `${currentType.border} hover:shadow-lg hover:border-gray-300 dark:hover:border-gray-700`
      } ${className}`}
    >
      {/* Input Connection Ports (Left Edge) */}
      {inputs.map((port, idx) => (
        <span
          key={`in-${port}-${idx}`}
          title={`Input Port: ${port}`}
          className="absolute -left-2 top-1/2 -translate-y-1/2 w-4 h-4 rounded-full bg-white dark:bg-gray-800 border-2 border-gray-400 dark:border-gray-500 hover:scale-125 transition-transform shadow-xs"
        />
      ))}

      {/* Output Connection Ports (Right Edge) */}
      {outputs.map((port, idx) => (
        <span
          key={`out-${port}-${idx}`}
          title={`Output Port: ${port}`}
          className="absolute -right-2 top-1/2 -translate-y-1/2 w-4 h-4 rounded-full bg-white dark:bg-gray-800 border-2 border-blue-500 hover:scale-125 transition-transform shadow-xs"
        />
      ))}

      {/* Header Bar */}
      <div className="flex items-center justify-between pb-2 mb-2 border-b border-gray-100 dark:border-gray-800">
        <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold border tracking-wider ${currentType.badgeBg}`}>
          {currentType.label}
        </span>

        {status === 'active' && (
          <span className="flex items-center text-[11px] font-medium text-emerald-600 dark:text-emerald-400">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mr-1.5 animate-pulse" />
            Active
          </span>
        )}
        {status === 'warning' && (
          <span className="flex items-center text-[11px] font-medium text-amber-500">
            <AlertTriangle className="w-3 h-3 mr-1" />
            Warning
          </span>
        )}
      </div>

      {/* Body Content */}
      <div className="flex items-start space-x-3">
        <div className="p-2 rounded-lg bg-gray-50 dark:bg-gray-800 text-gray-700 dark:text-gray-300 flex-shrink-0">
          <NodeIcon className="w-5 h-5" />
        </div>

        <div className="flex-1 min-w-0">
          <h4 className="text-sm font-semibold text-gray-900 dark:text-gray-100 truncate">
            {title}
          </h4>
          {subtitle && (
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 line-clamp-2 leading-relaxed">
              {subtitle}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
