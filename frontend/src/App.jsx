import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { SocketProvider } from './context/SocketContext';
import ErrorBoundary from './components/ErrorBoundary';
import MainLayout from './layouts/MainLayout';
import Dashboard from './pages/Dashboard';
import Devices from './pages/Devices';
import Telemetry from './pages/Telemetry';
import Rules from './pages/Rules';
import Alerts from './pages/Alerts';
import Analytics from './pages/Analytics';
import Logs from './pages/Logs';
import Settings from './pages/Settings';
import Login from './pages/Login';

// Protected Route wrapper
function ProtectedRoute({ children }) {
  const { user } = useAuth();
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  return children;
}

export default function App() {
  return (
    <ErrorBoundary>
      <BrowserRouter>
        <AuthProvider>
          <SocketProvider>
            <Routes>
              <Route path="/login" element={<Login />} />

              <Route
                path="/"
                element={
                  <ProtectedRoute>
                    <MainLayout />
                  </ProtectedRoute>
                }
              >
                <Route index element={<Dashboard />} />
                <Route path="devices" element={<Devices />} />
                <Route path="telemetry" element={<Telemetry />} />
                <Route path="rules" element={<Rules />} />
                <Route path="alerts" element={<Alerts />} />
                <Route path="analytics" element={<Analytics />} />
                <Route path="logs" element={<Logs />} />
                <Route path="settings" element={<Settings />} />
              </Route>

              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </SocketProvider>
        </AuthProvider>
      </BrowserRouter>
    </ErrorBoundary>
  );
}
