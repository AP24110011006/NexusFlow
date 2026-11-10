import React from 'react';

export default function MetricCard({
  title,
  value,
  unit = '',
  icon: Icon,
  trend,
  trendPositive,
  subtext,
  variant = 'cyan', // 'cyan', 'emerald', 'amber', 'rose', 'purple'
}) {
  const colorMap = {
    cyan: {
      border: 'border-cyan-500/20 hover:border-cyan-500/40',
      iconBg: 'bg-cyan-500/10 text-cyan-400',
      glow: 'shadow-cyan-500/5',
    },
    emerald: {
      border: 'border-emerald-500/20 hover:border-emerald-500/40',
      iconBg: 'bg-emerald-500/10 text-emerald-400',
      glow: 'shadow-emerald-500/5',
    },
    amber: {
      border: 'border-amber-500/20 hover:border-amber-500/40',
      iconBg: 'bg-amber-500/10 text-amber-400',
      glow: 'shadow-amber-500/5',
    },
    rose: {
      border: 'border-rose-500/20 hover:border-rose-500/40',
      iconBg: 'bg-rose-500/10 text-rose-400',
      glow: 'shadow-rose-500/5',
    },
    purple: {
      border: 'border-purple-500/20 hover:border-purple-500/40',
      iconBg: 'bg-purple-500/10 text-purple-400',
      glow: 'shadow-purple-500/5',
    },
  };

  const scheme = colorMap[variant] || colorMap.cyan;

  return (
    <div
      className={`relative overflow-hidden rounded-xl bg-slate-900/80 backdrop-blur-md p-5 border transition-all duration-300 shadow-lg ${scheme.border} ${scheme.glow}`}
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-medium text-slate-400 uppercase tracking-wider">{title}</p>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold tracking-tight text-white font-mono">
              {value}
            </span>
            {unit && <span className="text-sm font-semibold text-slate-400">{unit}</span>}
          </div>
        </div>

        {Icon && (
          <div className={`p-3 rounded-xl ${scheme.iconBg}`}>
            <Icon className="w-5 h-5" />
          </div>
        )}
      </div>

      {(trend || subtext) && (
        <div className="mt-4 flex items-center justify-between text-xs text-slate-400 border-t border-slate-800/80 pt-3">
          {subtext && <span>{subtext}</span>}
          {trend && (
            <span
              className={`font-semibold ${
                trendPositive ? 'text-emerald-400' : 'text-rose-400'
              }`}
            >
              {trend}
            </span>
          )}
        </div>
      )}
    </div>
  );
}
