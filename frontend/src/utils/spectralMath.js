/**
 * NexusFlow — Industrial Telemetry Spectral Analysis & Harmonic Math
 * Author: Harshitha (Frontend Analytics & Visualizations Lead)
 * Organization: Infotact Solutions
 * Milestone: Week 3 - Vibration Harmonics, DFT & ISO 10816 Severity
 */

/**
 * Compute Discrete Fourier Transform (DFT) Power Spectrum
 * X_k = SUM(x_n * exp(-i * 2 * PI * k * n / N))
 * @param {number[]} signal - Time-domain vibration samples
 * @param {number} [samplingRate=1000] - In Hz
 * @returns {{ frequencies: number[], magnitudes: number[], peakFrequency: number, peakMagnitude: number }}
 */
export function computeDFT(signal = [], samplingRate = 1000) {
  if (!Array.isArray(signal) || signal.length < 4) {
    return { frequencies: [], magnitudes: [], peakFrequency: 0, peakMagnitude: 0 };
  }

  const N = Math.min(signal.length, 64); // Window bound for fast responsive UI calculation
  const frequencies = [];
  const magnitudes = [];
  let peakMag = 0;
  let peakFreq = 0;

  for (let k = 0; k < N / 2; k++) {
    let real = 0;
    let imag = 0;
    const freq = (k * samplingRate) / N;

    for (let n = 0; n < N; n++) {
      const angle = (2 * Math.PI * k * n) / N;
      real += signal[n] * Math.cos(angle);
      imag -= signal[n] * Math.sin(angle);
    }

    const mag = Math.sqrt(real * real + imag * imag) / N;
    const roundedMag = Number(mag.toFixed(2));
    const roundedFreq = Number(freq.toFixed(1));

    frequencies.push(roundedFreq);
    magnitudes.push(roundedMag);

    if (roundedMag > peakMag && roundedFreq > 0) {
      peakMag = roundedMag;
      peakFreq = roundedFreq;
    }
  }

  return {
    frequencies,
    magnitudes,
    peakFrequency: peakFreq,
    peakMagnitude: peakMag,
  };
}

/**
 * ISO 10816 Industrial Mechanical Vibration Severity Standards
 * Evaluates RMS velocity against machine classification boundaries
 * @param {number} rmsVelocityMmS - Vibration velocity in mm/s RMS
 * @param {'class_1' | 'class_2' | 'class_3' | 'class_4'} [machineClass='class_2']
 * @returns {{ zone: 'A'|'B'|'C'|'D', status: 'Good'|'Acceptable'|'Warning'|'Danger', description: string, color: string }}
 */
export function evaluateVibrationSeverity(rmsVelocityMmS = 0, machineClass = 'class_2') {
  const v = Math.max(0, Number(rmsVelocityMmS) || 0);

  // Class boundaries: [Zone A max, Zone B max, Zone C max]
  const limits = {
    class_1: [0.71, 1.8, 4.5], // Small motors (< 15 kW)
    class_2: [1.12, 2.8, 7.1], // Medium motors (15 - 75 kW)
    class_3: [1.8, 4.5, 11.2], // Large rigid foundation machines
    class_4: [2.8, 7.1, 18.0], // Large flexible foundation turbomachinery
  };

  const [limA, limB, limC] = limits[machineClass] || limits.class_2;

  if (v <= limA) {
    return {
      zone: 'A',
      status: 'Good',
      description: 'Vibration is within newly commissioned baseline tolerances.',
      color: 'emerald',
    };
  } else if (v <= limB) {
    return {
      zone: 'B',
      status: 'Acceptable',
      description: 'Unrestricted long-term continuous machine operation permitted.',
      color: 'blue',
    };
  } else if (v <= limC) {
    return {
      zone: 'C',
      status: 'Warning',
      description: 'Vibration velocity elevated; maintenance action recommended.',
      color: 'amber',
    };
  } else {
    return {
      zone: 'D',
      status: 'Danger',
      description: 'Severe damage imminent; trip failsafe command recommended.',
      color: 'rose',
    };
  }
}
