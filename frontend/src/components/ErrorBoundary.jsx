import React from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

/**
 * Production-grade React Error Boundary
 * Authored by: Harshitha (Frontend Role — Analytics, Widgets & QA)
 * Week 1 Deliverable — Reliability & Fault Tolerance
 */
export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('ErrorBoundary caught an unhandled error:', error, errorInfo);
  }

  handleReload = () => {
    this.setState({ hasError: false, error: null });
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-[300px] flex items-center justify-center p-6">
          <div className="max-w-md w-full glass-panel-danger rounded-2xl p-6 text-center space-y-4">
            <div className="w-12 h-12 rounded-xl bg-rose-500/10 text-rose-400 mx-auto flex items-center justify-center">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Telemetry Render Error</h3>
              <p className="text-xs text-slate-400 mt-1">
                An unexpected exception occurred while rendering this IoT telemetry view.
              </p>
              <pre className="mt-3 p-3 rounded-lg bg-black/50 text-rose-300 text-[11px] font-mono text-left overflow-x-auto max-h-24">
                {this.state.error?.message || 'Unknown render fault'}
              </pre>
            </div>
            <button
              onClick={this.handleReload}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-semibold shadow-lg shadow-rose-600/30 transition-all"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              Reload View
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}
