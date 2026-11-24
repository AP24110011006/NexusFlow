import React, { useState, useMemo } from 'react';
import { Zap, Leaf, IndianRupee, Gauge, TrendingUp, Sun, Moon } from 'lucide-react';
import { calculateACPower, calculateEnergyKWh, calculateCarbonFootprint, calculateEnergyCost } from '../../utils/energyAnalyticsMath';

/**
 * NexusFlow — Energy Consumption & Carbon Sustainability Widget
 * Author: Harshitha (Frontend Analytics & Visualizations Lead)
 * Organization: Infotact Solutions
 * Milestone: Week 3 - Smart Metering, Carbon Footprint & ESG Tracking
 *
 * @param {Object} props
 * @param {number} [props.voltage=415] - 3-Phase or Line RMS Voltage in Volts
 * @param {number} [props.current=32.5] - Operating RMS Current in Amperes
 * @param {number} [props.operatingHours=24] - Operational duration in hours
 * @param {string} [props.deviceName='Main Substation Feed A']
 * @param {string} [props.className]
 */
export default function EnergySustainabilityWidget({
  voltage = 415,
  current = 32.5,
  operatingHours = 24,
  deviceName = 'Main Substation Feed A',
  className = '',
}) {
  const [tariffTier, setTariffTier] = useState('peak'); // 'peak' | 'off_peak'

  // Tariff rates in INR
  const rate = tariffTier === 'peak' ? 10.5 : 7.2;

  const powerMetrics = useMemo(() => {
    const power = calculateACPower(voltage, current, 0.94);
    const kwh = calculateEnergyKWh(power.activePowerKw, operatingHours);
    const carbon = calculateCarbonFootprint(kwh, 0.82);
    const cost = calculateEnergyCost(kwh, rate);

    return {
      power,
      kwh,
      carbon,
      cost,
    };
  }, [voltage, current, operatingHours, rate]);

  return (
    <div className={`p-5 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl shadow-sm space-y-4 ${className}`}>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-gray-100 dark:border-gray-800">
        <div className="flex items-center space-x-2.5">
          <div className="p-2 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 rounded-lg">
            <Zap className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-semibold text-gray-900 dark:text-gray-100 text-sm">
              Energy & Carbon Sustainability
            </h3>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              ISO 50001 Energy Analytics for {deviceName}
            </p>
          </div>
        </div>

        {/* Tariff Switcher */}
        <div className="flex items-center space-x-1.5 p-1 bg-gray-100 dark:bg-gray-800 rounded-lg text-xs">
          <button
            type="button"
            onClick={() => setTariffTier('peak')}
            className={`flex items-center px-2.5 py-1 rounded-md font-medium transition-all ${
              tariffTier === 'peak'
                ? 'bg-white dark:bg-gray-700 text-amber-600 dark:text-amber-400 shadow-xs'
                : 'text-gray-500 hover:text-gray-900 dark:hover:text-gray-300'
            }`}
          >
            <Sun className="w-3 h-3 mr-1" />
            Peak (₹10.5)
          </button>
          <button
            type="button"
            onClick={() => setTariffTier('off_peak')}
            className={`flex items-center px-2.5 py-1 rounded-md font-medium transition-all ${
              tariffTier === 'off_peak'
                ? 'bg-white dark:bg-gray-700 text-blue-600 dark:text-blue-400 shadow-xs'
                : 'text-gray-500 hover:text-gray-900 dark:hover:text-gray-300'
            }`}
          >
            <Moon className="w-3 h-3 mr-1" />
            Off-Peak (₹7.2)
          </button>
        </div>
      </div>

      {/* KPI 4-Card Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
        {/* Active Power */}
        <div className="p-3 bg-gray-50 dark:bg-gray-950/60 border border-gray-100 dark:border-gray-800 rounded-xl space-y-1">
          <div className="flex items-center text-gray-400">
            <Gauge className="w-3.5 h-3.5 mr-1 text-blue-500" />
            <span>Active Power</span>
          </div>
          <div className="text-lg font-bold text-gray-900 dark:text-gray-100">
            {powerMetrics.power.activePowerKw} <span className="text-xs font-normal text-gray-500">kW</span>
          </div>
          <div className="text-[10px] text-gray-400">PF: {powerMetrics.power.powerFactor}</div>
        </div>

        {/* 24h Energy */}
        <div className="p-3 bg-gray-50 dark:bg-gray-950/60 border border-gray-100 dark:border-gray-800 rounded-xl space-y-1">
          <div className="flex items-center text-gray-400">
            <TrendingUp className="w-3.5 h-3.5 mr-1 text-emerald-500" />
            <span>24h Consumption</span>
          </div>
          <div className="text-lg font-bold text-gray-900 dark:text-gray-100">
            {powerMetrics.kwh} <span className="text-xs font-normal text-gray-500">kWh</span>
          </div>
          <div className="text-[10px] text-gray-400">{operatingHours} hrs running</div>
        </div>

        {/* Carbon Footprint */}
        <div className="p-3 bg-gray-50 dark:bg-gray-950/60 border border-gray-100 dark:border-gray-800 rounded-xl space-y-1">
          <div className="flex items-center text-gray-400">
            <Leaf className="w-3.5 h-3.5 mr-1 text-emerald-500" />
            <span>Carbon (CO₂e)</span>
          </div>
          <div className="text-lg font-bold text-emerald-600 dark:text-emerald-400">
            {powerMetrics.carbon.co2Kg} <span className="text-xs font-normal text-gray-500">kg</span>
          </div>
          <div className="text-[10px] text-gray-400">~{powerMetrics.carbon.treesEquivalent} trees/yr offset</div>
        </div>

        {/* Estimated Cost */}
        <div className="p-3 bg-gray-50 dark:bg-gray-950/60 border border-gray-100 dark:border-gray-800 rounded-xl space-y-1">
          <div className="flex items-center text-gray-400">
            <IndianRupee className="w-3.5 h-3.5 mr-1 text-amber-500" />
            <span>Estimated OpEx</span>
          </div>
          <div className="text-lg font-bold text-gray-900 dark:text-gray-100">
            ₹{powerMetrics.cost}
          </div>
          <div className="text-[10px] text-gray-400">@ ₹{rate}/kWh</div>
        </div>
      </div>

      {/* Efficiency Bar */}
      <div className="pt-2 border-t border-gray-100 dark:border-gray-800 flex items-center justify-between text-xs text-gray-500">
        <span>Apparent: {powerMetrics.power.apparentPowerKva} kVA</span>
        <span>Reactive: {powerMetrics.power.reactivePowerKvar} kVAR</span>
        <span className="font-medium text-emerald-600 dark:text-emerald-400">
          Grid Compliance: Optimal (PF &gt; 0.90)
        </span>
      </div>
    </div>
  );
}
