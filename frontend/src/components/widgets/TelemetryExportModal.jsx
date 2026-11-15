import React, { useState } from 'react';
import { Download, FileSpreadsheet, FileJson, Check, X } from 'lucide-react';

/**
 * Historical Telemetry Data Export Modal
 * Authored by: Harshitha (Frontend Analytics & Visualizations Role)
 * Milestone: Week 1 Deliverable — Visual IoT Telemetry Monitoring
 * Organization: Infotact Solutions
 */
export default function TelemetryExportModal({
  isOpen,
  onClose,
  telemetryData = [],
}) {
  const [format, setFormat] = useState('csv'); // 'csv' | 'json'
  const [selectedMetric, setSelectedMetric] = useState('all'); // 'all' | 'temperature' | 'humidity' | 'pressure'
  const [downloadSuccess, setDownloadSuccess] = useState(false);

  if (!isOpen) return null;

  function handleExport() {
    if (!telemetryData || telemetryData.length === 0) return;

    let exportBlob;
    let filename;
    const now = new Date().toISOString().split('T')[0];

    if (format === 'json') {
      const jsonContent = JSON.stringify(telemetryData, null, 2);
      exportBlob = new Blob([jsonContent], { type: 'application/json' });
      filename = `nexusflow-telemetry-${now}.json`;
    } else {
      // Generate CSV
      const headers = ['id', 'deviceId', 'temperature', 'humidity', 'pressure', 'battery', 'rssi', 'timestamp'];
      const rows = telemetryData.map((item) =>
        headers.map((h) => (item[h] !== undefined ? item[h] : '')).join(',')
      );
      const csvContent = [headers.join(','), ...rows].join('\n');
      exportBlob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      filename = `nexusflow-telemetry-${now}.csv`;
    }

    // Trigger browser download
    const url = URL.createObjectURL(exportBlob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    setDownloadSuccess(true);
    setTimeout(() => {
      setDownloadSuccess(false);
      onClose();
    }, 1200);
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm transition-opacity"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Modal Dialog */}
      <div
        className="relative w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl p-6 text-slate-100 z-10 space-y-5"
        role="dialog"
        aria-modal="true"
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <Download className="w-5 h-5 text-cyan-400" />
            <h3 className="text-base font-bold text-white">Export Telemetry Data</h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Format Selection */}
        <div className="space-y-2">
          <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
            Export Format
          </label>
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => setFormat('csv')}
              className={`flex items-center justify-center gap-2 p-3 rounded-xl border text-xs font-semibold transition-all ${
                format === 'csv'
                  ? 'border-cyan-500 bg-cyan-500/10 text-cyan-300'
                  : 'border-slate-800 bg-slate-950/60 text-slate-400 hover:border-slate-700'
              }`}
            >
              <FileSpreadsheet className="w-4 h-4 text-emerald-400" />
              CSV Spreadsheet
            </button>
            <button
              type="button"
              onClick={() => setFormat('json')}
              className={`flex items-center justify-center gap-2 p-3 rounded-xl border text-xs font-semibold transition-all ${
                format === 'json'
                  ? 'border-cyan-500 bg-cyan-500/10 text-cyan-300'
                  : 'border-slate-800 bg-slate-950/60 text-slate-400 hover:border-slate-700'
              }`}
            >
              <FileJson className="w-4 h-4 text-amber-400" />
              JSON Time-Series
            </button>
          </div>
        </div>

        {/* Record Summary */}
        <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800/80 text-xs space-y-1">
          <div className="flex justify-between text-slate-400">
            <span>Total Records:</span>
            <span className="font-mono font-bold text-white">{telemetryData.length}</span>
          </div>
          <div className="flex justify-between text-slate-400">
            <span>Channels Included:</span>
            <span className="text-slate-200">Temp, Humidity, Pressure, Battery, RSSI</span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-3 pt-2">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-medium text-slate-400 hover:text-white"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleExport}
            disabled={telemetryData.length === 0 || downloadSuccess}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-semibold bg-gradient-to-r from-cyan-600 to-cyan-500 hover:from-cyan-500 hover:to-cyan-400 text-white shadow-lg shadow-cyan-600/25 active:scale-95 disabled:opacity-50"
          >
            {downloadSuccess ? (
              <>
                <Check className="w-4 h-4 text-emerald-300" />
                <span>Downloaded!</span>
              </>
            ) : (
              <>
                <Download className="w-4 h-4" />
                <span>Download {format.toUpperCase()}</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
