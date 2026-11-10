import React, { useState } from 'react';
import {
  Bell,
  Activity,
  Volume2,
  VolumeX,
  User,
  ShieldCheck,
  Check,
  ExternalLink,
  ChevronDown,
} from 'lucide-react';
import { useSocket } from '../context/SocketContext';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';

export default function Navbar() {
  const { connected, alertsCount, audioEnabled, setAudioEnabled } = useSocket();
  const { user, switchUser, logout } = useAuth();
  const [profileOpen, setProfileOpen] = useState(false);
  const [alertsOpen, setAlertsOpen] = useState(false);

  return (
    <header className="h-16 bg-slate-900/95 border-b border-slate-800 px-4 sm:px-6 flex items-center justify-between sticky top-0 z-40 backdrop-blur-md">
      {/* Brand logo & platform title */}
      <div className="flex items-center gap-3">
        <Link to="/" className="flex items-center gap-2.5 group">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-cyan-600 via-cyan-500 to-emerald-400 p-0.5 shadow-lg shadow-cyan-500/20 group-hover:scale-105 transition-transform">
            <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center">
              <Activity className="w-5 h-5 text-cyan-400" />
            </div>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-lg tracking-tight bg-gradient-to-r from-white via-slate-100 to-cyan-300 bg-clip-text text-transparent">
                NexusFlow
              </span>
              <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                IoT Core v1.0
              </span>
            </div>
            <p className="text-[10px] text-slate-400 -mt-0.5 hidden sm:block">
              Telemetry & Real-Time Rule Engine
            </p>
          </div>
        </Link>
      </div>

      {/* Right controls */}
      <div className="flex items-center gap-3">
        {/* WebSocket live status */}
        <div
          className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium border ${
            connected
              ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
              : 'bg-rose-500/10 text-rose-400 border-rose-500/30'
          }`}
          title={connected ? 'Real-Time WebSocket Connected' : 'Reconnecting to Server...'}
        >
          <span
            className={`w-2 h-2 rounded-full ${
              connected ? 'bg-emerald-400 animate-pulse' : 'bg-rose-400'
            }`}
          />
          <span className="hidden md:inline font-mono">
            {connected ? 'WS LIVE' : 'WS OFFLINE'}
          </span>
        </div>

        {/* Audio Alert Toggle */}
        <button
          onClick={() => setAudioEnabled(!audioEnabled)}
          title={audioEnabled ? 'Audio alerts active' : 'Audio alerts muted'}
          className="p-2 rounded-lg bg-slate-800/80 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-700/60 transition-colors"
        >
          {audioEnabled ? (
            <Volume2 className="w-4 h-4 text-cyan-400" />
          ) : (
            <VolumeX className="w-4 h-4 text-slate-500" />
          )}
        </button>

        {/* Alerts Bell Dropdown */}
        <div className="relative">
          <button
            onClick={() => setAlertsOpen(!alertsOpen)}
            className="relative p-2 rounded-lg bg-slate-800/80 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-700/60 transition-colors"
          >
            <Bell className="w-4 h-4 text-slate-300" />
            {alertsCount.active > 0 && (
              <span className="absolute -top-1 -right-1 px-1.5 py-0.2 rounded-full text-[10px] font-bold bg-rose-500 text-white animate-pulse">
                {alertsCount.active}
              </span>
            )}
          </button>

          {alertsOpen && (
            <div className="absolute right-0 mt-2 w-72 rounded-xl bg-slate-900 border border-slate-800 shadow-2xl p-3 z-50 animate-fadeIn">
              <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                <span className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
                  Active Alerts
                </span>
                <span className="text-xs font-bold px-2 py-0.5 rounded bg-rose-500/20 text-rose-400">
                  {alertsCount.active} Unresolved
                </span>
              </div>
              <div className="py-3 text-xs text-slate-400 space-y-1">
                <div className="flex justify-between">
                  <span>Critical severity:</span>
                  <span className="font-bold text-rose-400">{alertsCount.critical || 0}</span>
                </div>
                <div className="flex justify-between">
                  <span>Warning severity:</span>
                  <span className="font-bold text-amber-400">{alertsCount.warning || 0}</span>
                </div>
                <div className="flex justify-between">
                  <span>Total historical:</span>
                  <span className="font-semibold text-slate-300">{alertsCount.total || 0}</span>
                </div>
              </div>
              <Link
                to="/alerts"
                onClick={() => setAlertsOpen(false)}
                className="block text-center w-full py-1.5 rounded-lg bg-cyan-600/20 hover:bg-cyan-600/30 text-cyan-300 text-xs font-semibold border border-cyan-500/30 transition-colors"
              >
                Open Alert Management →
              </Link>
            </div>
          )}
        </div>

        {/* User profile with switcher */}
        <div className="relative">
          <button
            onClick={() => setProfileOpen(!profileOpen)}
            className="flex items-center gap-2.5 p-1.5 pr-2.5 rounded-xl bg-slate-800/80 hover:bg-slate-800 border border-slate-700/60 transition-colors"
          >
            <img
              src={user?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=256&q=80'}
              alt={user?.name}
              className="w-7 h-7 rounded-lg object-cover ring-1 ring-cyan-500/40"
            />
            <div className="text-left hidden sm:block">
              <p className="text-xs font-semibold text-slate-200 leading-tight">
                {user?.name || 'Koneti Manikanth'}
              </p>
              <p className="text-[10px] text-cyan-400 font-medium leading-tight">
                {user?.role || 'Associate L1. Intern'}
              </p>
            </div>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
          </button>

          {profileOpen && (
            <div className="absolute right-0 mt-2 w-64 rounded-xl bg-slate-900 border border-slate-800 shadow-2xl p-3 z-50 animate-fadeIn">
              <div className="pb-2 mb-2 border-b border-slate-800">
                <p className="text-xs font-bold text-white">{user?.name}</p>
                <p className="text-[11px] text-cyan-400">{user?.role}</p>
                <p className="text-[10px] text-slate-400">{user?.organization || 'Infotact Solutions'}</p>
                <p className="text-[10px] text-slate-500 font-mono">Ref: {user?.refNo || 'ITS/WEB/1849'}</p>
              </div>

              <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
                Switch Demo Persona
              </div>

              <button
                onClick={() => {
                  switchUser('intern');
                  setProfileOpen(false);
                }}
                className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs font-medium mb-1 transition-colors ${
                  user?.id === 'usr_manikanth'
                    ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30'
                    : 'text-slate-300 hover:bg-slate-800'
                }`}
              >
                <span>Koneti Manikanth (Intern)</span>
                {user?.id === 'usr_manikanth' && <Check className="w-3.5 h-3.5 text-cyan-400" />}
              </button>

              <button
                onClick={() => {
                  switchUser('admin');
                  setProfileOpen(false);
                }}
                className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs font-medium mb-2 transition-colors ${
                  user?.id === 'usr_admin'
                    ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30'
                    : 'text-slate-300 hover:bg-slate-800'
                }`}
              >
                <span>Nexus Admin (Administrator)</span>
                {user?.id === 'usr_admin' && <Check className="w-3.5 h-3.5 text-cyan-400" />}
              </button>

              <Link
                to="/settings"
                onClick={() => setProfileOpen(false)}
                className="block text-center w-full py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold transition-colors"
              >
                Account & Settings
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
