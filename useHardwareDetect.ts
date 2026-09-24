'use client';

import { useState, useEffect } from 'react';

export interface HardwareInfo {
  detectedGPU: string;
  detectedCPU: string;
  gpuMultiplier: number;
  cpuCores: number;
  isDedicatedGPU: boolean;
}

export function useHardwareDetect(): HardwareInfo {
  const [hardware, setHardware] = useState<HardwareInfo>({
    detectedGPU: 'Detecting Hardware...',
    detectedCPU: '8-Core High-Performance CPU',
    gpuMultiplier: 1.0,
    cpuCores: 8,
    isDedicatedGPU: false,
  });

  useEffect(() => {
    let gpuName = 'Standard Integrated Graphics';
    let isDedicated = false;
    let multiplier = 1.0;
    let cores = 8;

    try {
      if (typeof navigator !== 'undefined' && navigator.hardwareConcurrency) {
        cores = navigator.hardwareConcurrency;
      }
    } catch {
      cores = 8;
    }

    const cpuName = `${cores}-Core High-Performance CPU`;

    try {
      if (typeof window !== 'undefined' && typeof document !== 'undefined') {
        const canvas = document.createElement('canvas');
        const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');

        if (gl && gl instanceof WebGLRenderingContext) {
          const debugInfo = gl.getExtension('WEBGL_debug_renderer_info');
          if (debugInfo) {
            const renderer = gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL);
            if (typeof renderer === 'string' && renderer.length > 0) {
              const upper = renderer.toUpperCase();

              // Dedicated GPU detection: NVIDIA, AMD, Apple Silicon, Radeon, RTX, GTX
              const isNvidia = upper.includes('NVIDIA') || upper.includes('GEFORCE') || upper.includes('RTX') || upper.includes('GTX') || upper.includes('QUADRO');
              const isAmd = upper.includes('AMD') || upper.includes('RADEON');
              const isAppleSilicon = upper.includes('APPLE') || upper.includes('M1') || upper.includes('M2') || upper.includes('M3') || upper.includes('M4');

              if (isNvidia || isAmd || isAppleSilicon) {
                isDedicated = true;
                multiplier = 3.0;

                const match = renderer.match(/(NVIDIA\s+GeForce\s+[^,)]+|AMD\s+Radeon\s+[^,)]+|Apple\s+M\d+[^,)]+|Apple\s+GPU|RTX\s+[^,)]+|GTX\s+[^,)]+)/i);
                if (match && match[0]) {
                  gpuName = match[0].trim();
                } else {
                  gpuName = renderer.replace(/ANGLE \((.*)\)/i, '$1').split(',')[0].trim();
                }
              } else {
                // Integrated GPU (Intel UHD, Iris, etc.)
                const isIntel = upper.includes('INTEL');
                if (isIntel) {
                  const match = renderer.match(/(Intel\(R\)\s+[^,)]+|Intel\s+[^,)]+)/i);
                  gpuName = match ? match[0].trim() : 'Intel Integrated HD/Iris Graphics';
                } else {
                  gpuName = 'Standard Integrated Graphics';
                }
                multiplier = 1.0;
                isDedicated = false;
              }
            }
          }
        }
      }
    } catch {
      gpuName = 'Standard Integrated Graphics';
      multiplier = 1.0;
      isDedicated = false;
    }

    setHardware({
      detectedGPU: gpuName,
      detectedCPU: cpuName,
      gpuMultiplier: multiplier,
      cpuCores: cores,
      isDedicatedGPU: isDedicated,
    });
  }, []);

  return hardware;
}
