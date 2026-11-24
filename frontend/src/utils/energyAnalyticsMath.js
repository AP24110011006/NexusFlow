/**
 * NexusFlow — Industrial Energy Consumption & Carbon Analytics Math Library
 * Author: Harshitha (Frontend Analytics & Visualizations Lead)
 * Organization: Infotact Solutions
 * Milestone: Week 3 - Smart Energy Metering, Carbon Footprint & ISO 50001
 */

/**
 * Calculate AC Active, Apparent, and Reactive Power
 * P = V * I * cos(theta) (Active Power in Watts)
 * S = V * I (Apparent Power in VA)
 * Q = sqrt(S^2 - P^2) (Reactive Power in VAR)
 * @param {number} voltage - RMS Voltage in Volts
 * @param {number} current - RMS Current in Amperes
 * @param {number} [powerFactor=0.92] - Dimensionless (0.0 to 1.0)
 * @returns {{ activePowerKw: number, apparentPowerKva: number, reactivePowerKvar: number, powerFactor: number }}
 */
export function calculateACPower(voltage = 230, current = 10, powerFactor = 0.92) {
  const v = Math.max(0, Number(voltage) || 0);
  const i = Math.max(0, Number(current) || 0);
  const pf = Math.max(0.1, Math.min(1.0, Number(powerFactor) || 0.92));

  const apparentPowerVa = v * i;
  const activePowerW = apparentPowerVa * pf;
  const reactivePowerVar = Math.sqrt(Math.max(0, apparentPowerVa * apparentPowerVa - activePowerW * activePowerW));

  return {
    activePowerKw: Number((activePowerW / 1000).toFixed(2)),
    apparentPowerKva: Number((apparentPowerVa / 1000).toFixed(2)),
    reactivePowerKvar: Number((reactivePowerVar / 1000).toFixed(2)),
    powerFactor: Number(pf.toFixed(2)),
  };
}

/**
 * Calculate Cumulative Energy in Kilowatt-Hours (kWh)
 * E = P (kW) * t (hours)
 * @param {number} activePowerKw 
 * @param {number} hours 
 * @returns {number}
 */
export function calculateEnergyKWh(activePowerKw = 0, hours = 1) {
  const p = Math.max(0, Number(activePowerKw) || 0);
  const t = Math.max(0, Number(hours) || 0);
  return Number((p * t).toFixed(2));
}

/**
 * Calculate Carbon Emissions Equivalent (kg CO2e)
 * Em = kWh * emissionFactor
 * Standard Central Electricity Authority (CEA) India grid factor ~ 0.82 kg CO2/kWh
 * @param {number} kwh 
 * @param {number} [emissionFactor=0.82] 
 * @returns {{ co2Kg: number, treesEquivalent: number }}
 */
export function calculateCarbonFootprint(kwh = 0, emissionFactor = 0.82) {
  const energy = Math.max(0, Number(kwh) || 0);
  const factor = Number(emissionFactor) || 0.82;
  const co2Kg = Number((energy * factor).toFixed(2));

  // 1 mature urban tree absorbs ~22 kg CO2 per year (~0.06 kg/day)
  const treesEquivalent = Number((co2Kg / 22).toFixed(1));

  return {
    co2Kg,
    treesEquivalent,
  };
}

/**
 * Calculate Industrial Electricity Cost
 * @param {number} kwh 
 * @param {number} [tariffRatePerKwh=8.50] - In INR (₹)
 * @returns {number}
 */
export function calculateEnergyCost(kwh = 0, tariffRatePerKwh = 8.5) {
  const energy = Math.max(0, Number(kwh) || 0);
  const rate = Math.max(0, Number(tariffRatePerKwh) || 8.5);
  return Number((energy * rate).toFixed(2));
}
