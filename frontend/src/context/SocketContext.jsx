import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { io } from 'socket.io-client';
import { simulatorAPI } from '../api/client';

const SocketContext = createContext(null);

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000';

export function SocketProvider({ children }) {
  const [socket, setSocket] = useState(null);
  const [connected, setConnected] = useState(false);
  const [latestTelemetry, setLatestTelemetry] = useState({}); // deviceId -> reading
  const [liveStream, setLiveStream] = useState([]); // rolling array of last 40 telemetry
  const [alertsCount, setAlertsCount] = useState({ total: 0, active: 0, critical: 0, warning: 0 });
  const [recentNotification, setRecentNotification] = useState(null);
  const [simulatorStatus, setSimulatorStatus] = useState({ isRunning: true, intervalMs: 3000 });
  const [audioEnabled, setAudioEnabled] = useState(true);

  // Play subtle warning audio beep on critical alert
  const playAlertSound = useCallback(() => {
    if (!audioEnabled) return;
    try {
      const ctx = new (window.AudioContext || window.webkitAudioContext)();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(880, ctx.currentTime); // A5 note
      osc.frequency.exponentialRampToValueAtTime(440, ctx.currentTime + 0.3);
      gain.gain.setValueAtTime(0.2, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.3);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.3);
    } catch (e) {
      // AudioContext may be restricted until user gesture
    }
  }, [audioEnabled]);

  useEffect(() => {
    const s = io(SOCKET_URL, {
      transports: ['websocket', 'polling'],
      reconnectionAttempts: 10,
      reconnectionDelay: 1000,
    });

    s.on('connect', () => {
      console.log('✅ Connected to NexusFlow Socket.io server');
      setConnected(true);
    });

    s.on('disconnect', () => {
      console.log('❌ Disconnected from NexusFlow Socket.io server');
      setConnected(false);
    });

    s.on('telemetry:new', (reading) => {
      setLatestTelemetry((prev) => ({
        ...prev,
        [reading.deviceId]: reading,
      }));

      setLiveStream((prev) => {
        const next = [reading, ...prev];
        return next.slice(0, 50);
      });
    });

    s.on('alert:new', (alert) => {
      console.log('🚨 Live alert received:', alert);
      setRecentNotification(alert);
      if (alert.severity === 'critical') {
        playAlertSound();
      }
      setAlertsCount((prev) => ({
        ...prev,
        total: prev.total + 1,
        active: prev.active + 1,
        critical: alert.severity === 'critical' ? prev.critical + 1 : prev.critical,
        warning: alert.severity === 'warning' ? prev.warning + 1 : prev.warning,
      }));
    });

    s.on('stats:updated', (stats) => {
      setAlertsCount(stats);
    });

    s.on('simulator:status', (status) => {
      setSimulatorStatus(status);
    });

    setSocket(s);

    // Initial fetch of simulator status
    simulatorAPI.getStatus()
      .then((res) => setSimulatorStatus(res.data))
      .catch((err) => console.warn('Could not fetch simulator status initially:', err.message));

    return () => {
      s.disconnect();
    };
  }, [playAlertSound]);

  // Simulator controls
  const startSimulator = async (intervalMs) => {
    try {
      const res = await simulatorAPI.start({ intervalMs });
      setSimulatorStatus(res.data.status);
    } catch (err) {
      console.error('Error starting simulator:', err);
    }
  };

  const stopSimulator = async () => {
    try {
      const res = await simulatorAPI.stop();
      setSimulatorStatus(res.data.status);
    } catch (err) {
      console.error('Error stopping simulator:', err);
    }
  };

  const injectAnomaly = async (payload) => {
    try {
      const res = await simulatorAPI.inject(payload);
      return res.data;
    } catch (err) {
      console.error('Error injecting anomaly:', err);
      throw err;
    }
  };

  const clearNotification = () => setRecentNotification(null);

  return (
    <SocketContext.Provider
      value={{
        socket,
        connected,
        latestTelemetry,
        liveStream,
        alertsCount,
        recentNotification,
        clearNotification,
        simulatorStatus,
        startSimulator,
        stopSimulator,
        injectAnomaly,
        audioEnabled,
        setAudioEnabled,
      }}
    >
      {children}
    </SocketContext.Provider>
  );
}

export function useSocket() {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error('useSocket must be used within a SocketProvider');
  }
  return context;
}
