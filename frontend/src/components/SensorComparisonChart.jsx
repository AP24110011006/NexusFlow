import React from 'react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
} from 'recharts';

/**
 * SensorComparisonChart - Multi-node comparative visualization widget
 * Authored by Harshitha (Frontend Role) - Week 1 Deliverable
 */
export default function SensorComparisonChart({ data = [], metric = 'temperature' }) {
  const metricConfig = {
    temperature: {
      dataKey: 'avgTemp',
      name: 'Mean Temp (°C)',
      fill: '#06b6d4',
      maxKey: 'maxTemp',
      maxName: 'Peak Temp (°C)',
      maxFill: '#f43f5e',
    },
    humidity: {
      dataKey: 'avgHum',
      name: 'Mean Humidity (%)',
      fill: '#10b981',
      maxKey: null,
      maxName: null,
      maxFill: null,
    },
    pressure: {
      dataKey: 'avgPres',
      name: 'Mean Pressure (hPa)',
      fill: '#a855f7',
      maxKey: null,
      maxName: null,
      maxFill: null,
    },
  };

  const config = metricConfig[metric] || metricConfig.temperature;

  return (
    <div className="w-full h-64">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
          <XAxis dataKey="name" stroke="#64748b" tick={{ fontSize: 11 }} />
          <YAxis stroke="#64748b" tick={{ fontSize: 11 }} />
          <Tooltip
            contentStyle={{
              backgroundColor: '#0f172a',
              borderColor: '#334155',
              borderRadius: '0.75rem',
              fontSize: '12px',
            }}
          />
          <Legend />
          <Bar dataKey={config.dataKey} name={config.name} fill={config.fill} radius={[6, 6, 0, 0]} />
          {config.maxKey && (
            <Bar dataKey={config.maxKey} name={config.maxName} fill={config.maxFill} radius={[6, 6, 0, 0]} />
          )}
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
