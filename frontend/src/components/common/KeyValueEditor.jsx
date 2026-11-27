/**
 * NexusFlow — KeyValueEditor UI Component
 * Author: Likhitha (Frontend Core & UI/UX Lead)
 * Organization: Infotact Solutions
 * Internship Reference: ITS/WEB/1849
 * Milestone: Week 3 - Metadata Configuration & Custom Header Editor
 */

import React, { useState } from 'react';

export const KeyValueEditor = ({
  pairs = [],
  onChange,
  keyPlaceholder = 'Key / Header',
  valuePlaceholder = 'Value',
  label = 'Metadata & Configuration Pairs',
  readOnly = false,
  className = ''
}) => {
  const [internalPairs, setInternalPairs] = useState(
    pairs.length > 0 ? pairs : [{ key: '', value: '', id: 'row_1' }]
  );

  const handleUpdate = (newPairs) => {
    setInternalPairs(newPairs);
    if (onChange) {
      const sanitized = newPairs
        .filter((p) => p.key.trim() !== '')
        .map(({ key, value }) => ({ key: key.trim(), value }));
      onChange(sanitized);
    }
  };

  const handleRowChange = (index, field, val) => {
    const updated = internalPairs.map((pair, i) => {
      if (i === index) {
        return { ...pair, [field]: val };
      }
      return pair;
    });
    handleUpdate(updated);
  };

  const addRow = () => {
    const newRow = { key: '', value: '', id: `row_${Date.now()}` };
    handleUpdate([...internalPairs, newRow]);
  };

  const removeRow = (index) => {
    if (internalPairs.length <= 1) {
      handleUpdate([{ key: '', value: '', id: `row_${Date.now()}` }]);
      return;
    }
    const updated = internalPairs.filter((_, i) => i !== index);
    handleUpdate(updated);
  };

  return (
    <div className={`space-y-2 ${className}`}>
      {label && (
        <div className="flex items-center justify-between">
          <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider">
            {label}
          </label>
          <span className="text-[11px] text-slate-500 font-mono">
            {internalPairs.filter((p) => p.key.trim()).length} active pairs
          </span>
        </div>
      )}

      <div className="space-y-2">
        {internalPairs.map((pair, idx) => (
          <div key={pair.id || idx} className="flex items-center space-x-2 group">
            {/* Key Input */}
            <input
              type="text"
              value={pair.key}
              disabled={readOnly}
              onChange={(e) => handleRowChange(idx, 'key', e.target.value)}
              placeholder={keyPlaceholder}
              className="flex-1 px-3 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-xs font-mono text-slate-200 placeholder-slate-500 focus:outline-none focus:border-sky-500 transition-colors disabled:opacity-50"
            />

            <span className="text-slate-600 text-xs font-mono">:</span>

            {/* Value Input */}
            <input
              type="text"
              value={pair.value}
              disabled={readOnly}
              onChange={(e) => handleRowChange(idx, 'value', e.target.value)}
              placeholder={valuePlaceholder}
              className="flex-1 px-3 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-xs font-mono text-slate-200 placeholder-slate-500 focus:outline-none focus:border-sky-500 transition-colors disabled:opacity-50"
            />

            {/* Remove Row Button */}
            {!readOnly && (
              <button
                type="button"
                onClick={() => removeRow(idx)}
                title="Remove pair"
                className="p-1.5 text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition-colors"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </button>
            )}
          </div>
        ))}
      </div>

      {!readOnly && (
        <button
          type="button"
          onClick={addRow}
          className="inline-flex items-center space-x-1.5 text-xs text-sky-400 hover:text-sky-300 font-medium py-1 px-2 rounded-md hover:bg-sky-500/10 transition-colors"
        >
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 4v16m8-8H4" />
          </svg>
          <span>Add Key-Value Pair</span>
        </button>
      )}
    </div>
  );
};

export default KeyValueEditor;
