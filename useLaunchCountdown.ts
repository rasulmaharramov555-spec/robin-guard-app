'use client';

import { useState, useEffect } from 'react';

// Hardcoded global launch target timestamp: September 26, 2026 at 06:00:00 AM UTC+4
export const TARGET_LAUNCH_ISO = '2026-09-26T06:00:00+04:00';
export const TARGET_LAUNCH_TIMESTAMP = new Date(TARGET_LAUNCH_ISO).getTime();

export interface LaunchCountdown {
  remainingMs: number;
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  formatted: string; // e.g. "01d : 10h : 45m : 22s"
  targetTimestamp: number;
}

export function useLaunchCountdown(): LaunchCountdown {
  const [remainingMs, setRemainingMs] = useState<number>(() => {
    try {
      return Math.max(0, TARGET_LAUNCH_TIMESTAMP - Date.now());
    } catch {
      return 0;
    }
  });

  useEffect(() => {
    const updateCountdown = () => {
      try {
        const diff = Math.max(0, TARGET_LAUNCH_TIMESTAMP - Date.now());
        setRemainingMs(diff);
      } catch {
        // Fallback
      }
    };

    updateCountdown();
    const interval = setInterval(updateCountdown, 1000);
    return () => clearInterval(interval);
  }, []);

  const totalSeconds = Math.floor(remainingMs / 1000);
  const days = Math.floor(totalSeconds / 86400);
  const hours = Math.floor((totalSeconds % 86400) / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  const formatted = `${String(days).padStart(2, '0')}d : ${String(hours).padStart(2, '0')}h : ${String(minutes).padStart(2, '0')}m : ${String(seconds).padStart(2, '0')}s`;

  return {
    remainingMs,
    days,
    hours,
    minutes,
    seconds,
    formatted,
    targetTimestamp: TARGET_LAUNCH_TIMESTAMP,
  };
}
