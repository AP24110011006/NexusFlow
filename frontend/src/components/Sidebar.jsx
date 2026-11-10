import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Cpu,
  Activity,
  GitBranch,
  AlertTriangle,
  LineChart,
  FileText,
  Settings,
  HelpCircle,
} from 'lucide-react';
import { useSocket } from '../context/SocketContext';

const NAV_ITEMS = [
  { name: 'Dashboard', path: '/', icon: LayoutDashboard, badge: null },
  { name: 'Devices', path: '/devices', icon: Cpu, badge: null },
  { name: 'Telemetry', path: '/telemetry', icon: Activity, badge: 'Live' },
  { name: 'Rule Engine', path: '/rules', icon: GitBranch, badge: 'Core' },
  { name: 'Alerts', path: '/alerts', icon: AlertTriangle, badge: 'alerts' },
  { name: 'Analytics', path: '/analytics', icon: LineChart, badge: null },
  { name: 'Event Logs', path: '/logs', icon: FileText, badge: null },
  { name: 'Settings', path: '/settings', icon: Settings, badge: null },
];

export default function Sidebar() {
  const { alertsCount } = useSocket();

  return (
    <aside className="w-64 bg-slate-900/80 border-r border-slate-800 flex flex-col justify-between shrink-0 h-[calc(100vh-4rem)] sticky top-16">
      {/* Navigation Links */}
      <div className="p-4 space-y-1.5 overflow-y-auto">
        <div className="px-3 py-2 text-[10px] font-bold tracking-wider uppercase text-slate-500">
          Core Modules
        </div>

        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.path === '/'}
              className={({ isActive }) =>
                `flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 group ${
                  isActive
                    ? 'bg-gradient-to-r from-cyan-600/25 to-cyan-500/10 text-cyan-300 border border-cyan-500/30 shadow-lg shadow-cyan-950/50'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <div className="flex items-center gap-3">
                    <Icon
                      className={`w-4 h-4 transition-colors ${
                        isActive ? 'text-cyan-400' : 'text-slate-400 group-hover:text-slate-200'
                      }`}
                    />
                    <span>{item.name}</span>
                  </div>

                  {item.badge === 'alerts' && alertsCount.active > 0 && (
                    <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-rose-500/20 text-rose-400 border border-rose-500/30">
                      {alertsCount.active}
                    </span>
                  )}
                  {item.badge === 'Live' && (
                    <span className="px-1.5 py-0.5 text-[10px] font-semibold rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-mono">
                      LIVE
                    </span>
                  )}
                  {item.badge === 'Core' && (
                    <span className="px-1.5 py-0.5 text-[10px] font-semibold rounded bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                      CORE
                    </span>
                  )}
                </>
              )}
            </NavLink>
          );
        })}
      </div>

      {/* Internship Project Footer Badge */}
      <div className="p-4 border-t border-slate-800/80 bg-slate-950/40">
        <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 text-xs">
          <div className="flex items-center gap-1.5 text-cyan-400 font-semibold mb-1">
            <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse"></span>
            <span>Infotact Solutions</span>
          </div>
          <p className="text-slate-300 font-medium">Internship Project</p>
          <div className="mt-2 pt-2 border-t border-slate-800/80 text-[11px] text-slate-400 space-y-0.5 font-mono">
            <div>Intern: Koneti Manikanth</div>
            <div>Ref: ITS/WEB/1849</div>
            <div>Domain: Web Development</div>
          </div>
        </div>
      </div>
    </aside>
  );
}
