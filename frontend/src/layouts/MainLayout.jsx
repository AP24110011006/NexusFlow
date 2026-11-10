import React from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import SimulatorBar from '../components/SimulatorBar';
import { useSocket } from '../context/SocketContext';
import { AlertCircle, X } from 'lucide-react';

export default function MainLayout() {
  const { recentNotification, clearNotification } = useSocket();

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col text-slate-100 font-sans">
      <Navbar />
      <SimulatorBar />

      <div className="flex-1 flex overflow-hidden">
        <Sidebar />

        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 bg-[#0b0f19]">
          {/* Real-time floating Alert Toast */}
          {recentNotification && (
            <div
              className={`mb-6 p-4 rounded-xl border backdrop-blur-md shadow-2xl animate-bounce-subtle flex items-start justify-between ${
                recentNotification.severity === 'critical'
                  ? 'bg-rose-950/80 border-rose-500/50 text-rose-200'
                  : 'bg-amber-950/80 border-amber-500/50 text-amber-200'
              }`}
            >
              <div className="flex items-start gap-3">
                <AlertCircle
                  className={`w-5 h-5 shrink-0 mt-0.5 ${
                    recentNotification.severity === 'critical'
                      ? 'text-rose-400'
                      : 'text-amber-400'
                  }`}
                />
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-sm tracking-wide uppercase">
                      {recentNotification.severity} Alert Triggered by Rule Engine!
                    </span>
                    <span className="text-xs px-2 py-0.5 rounded bg-black/40 font-mono">
                      {recentNotification.deviceId}
                    </span>
                  </div>
                  <p className="text-xs mt-1 text-slate-200">{recentNotification.message}</p>
                </div>
              </div>
              <button
                onClick={clearNotification}
                className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-white/10"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          )}

          <div className="max-w-7xl mx-auto space-y-6">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
