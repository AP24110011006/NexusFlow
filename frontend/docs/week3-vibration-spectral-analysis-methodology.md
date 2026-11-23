# NexusFlow — Week 3: Vibration Spectral Harmonics & ISO 10816 Analysis Methodology
**Author:** Harshitha (Frontend Analytics & Visualizations Lead)  
**Organization:** Infotact Solutions (Electronic City, Bengaluru, Karnataka, PIN 560100)  
**Internship Ref. No.:** ITS/WEB/1849  
**Domain:** Web Development / Full-Stack IoT Platform  
**Milestone:** Week 3 Analytics & Mathematical Methodology

---

## 1. Executive Summary

In heavy rotating industrial machinery (turbines, induction motors, centrifugal pumps, gearboxes), time-domain vibration signals only indicate that vibration magnitude has increased. They cannot diagnose the mechanical root cause—whether the issue stems from unbalance ($1\times\text{ RPM}$), angular misalignment ($2\times\text{ RPM}$), or bearing outer race defects ($f_{\text{BPFO}}$).

Week 3 introduces the **Discrete Fourier Transform (DFT) Spectral Engine** (`frontend/src/utils/spectralMath.js`) and the **Vibration Spectrogram Widget** (`frontend/src/components/widgets/VibrationSpectrogramWidget.jsx`).

---

## 2. Mathematical Formulations

### 2.1 Discrete Fourier Transform (DFT)
Converts $N$ time-domain vibration displacement or velocity samples $x[n]$ into frequency domain spectral bins $X[k]$:

$$X[k] = \sum_{n=0}^{N-1} x[n] \cdot e^{-i \frac{2\pi}{N} k n} = \sum_{n=0}^{N-1} x[n] \left[\cos\left(\frac{2\pi kn}{N}\right) - i \sin\left(\frac{2\pi kn}{N}\right)\right]$$

The spectral magnitude $|X[k]|$ at bin frequency $f_k = \frac{k \cdot f_s}{N}$ is:

$$|X[k]| = \frac{1}{N} \sqrt{\text{Re}(X[k])^2 + \text{Im}(X[k])^2}$$

---

### 2.2 ISO 10816 Mechanical Vibration Severity Classification
Evaluates measured RMS vibration velocity ($v_{\text{RMS}}$ in $\text{mm/s}$) against standard operational zones:

$$v_{\text{RMS}} = \sqrt{\frac{1}{N} \sum_{n=1}^N v[n]^2}$$

#### Severity Zones:
- **Zone A (Good):** Vibration of newly commissioned machinery.
- **Zone B (Acceptable):** Machines considered acceptable for unrestricted long-term operation.
- **Zone C (Warning):** Machines unsatisfactory for continuous operation; remedial work required.
- **Zone D (Danger):** Vibration severity sufficient to cause severe damage; trip command triggered.

| Machine Classification | Zone A Max | Zone B Max | Zone C Max | Zone D Range |
| :--- | :---: | :---: | :---: | :---: |
| **Class I** (Small motors $< 15\text{ kW}$) | $0.71\text{ mm/s}$ | $1.8\text{ mm/s}$ | $4.5\text{ mm/s}$ | $> 4.5\text{ mm/s}$ |
| **Class II** (Medium motors $15 - 75\text{ kW}$) | $1.12\text{ mm/s}$ | $2.8\text{ mm/s}$ | $7.1\text{ mm/s}$ | $> 7.1\text{ mm/s}$ |
| **Class III** (Large rigid foundations) | $1.80\text{ mm/s}$ | $4.5\text{ mm/s}$ | $11.2\text{ mm/s}$ | $> 11.2\text{ mm/s}$ |
| **Class IV** (Large flexible foundations) | $2.80\text{ mm/s}$ | $7.1\text{ mm/s}$ | $18.0\text{ mm/s}$ | $> 18.0\text{ mm/s}$ |

---

## 3. UI Component Integration

Implemented in `VibrationSpectrogramWidget.jsx`:
- 32-bin frequency bar spectrogram displaying harmonic distributions up to $250\text{ Hz}$.
- Dynamic ISO 10816 zone assessment based on active machine classification dropdown.
- Automated detection of peak vibration frequency ($f_{\text{peak}}$) and magnitude.

*Prepared by:* Harshitha (Frontend Analytics Lead)  
*Date:* November 2026
