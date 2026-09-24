'use client';

import React, { useEffect, useRef, useState } from 'react';
import { RigMode, RobinGuardNFT, WalletState } from '../types';
import { sound } from '../utils/audio';
import { useHardwareDetect } from '../hooks/useHardwareDetect';
import { Cpu, Zap, Flame, Terminal, Shield, Sparkles, Gauge, Lock } from 'lucide-react';

interface MiningRigProps {
  wallet: WalletState;
  onConnectWallet: () => void;
  onGuardFound: (guardIdNum: number) => void;
  onClaimGuard: (guard: RobinGuardNFT) => void;
  nextGuardId: number;
}

export const MiningRig: React.FC<MiningRigProps> = ({
  wallet,
  onConnectWallet,
  onGuardFound,
  onClaimGuard,
  nextGuardId,
}) => {
  // 1. Hardware Detection Hook
  const { detectedGPU, detectedCPU, gpuMultiplier, cpuCores, isDedicatedGPU } = useHardwareDetect();

  // 2. Mining Engine State
  const [isMining, setIsMining] = useState<boolean>(false);
  const [progress, setProgress] = useState<number>(0);
  const [hashrate, setHashrate] = useState<number>(0);
  const [mode, setMode] = useState<RigMode>('GPU');
  const [usage, setUsage] = useState<number>(75); // 25 - 100, default 75
  const [isCompleted, setIsCompleted] = useState<boolean>(false);
  const [keepMiningAfterWin, setKeepMiningAfterWin] = useState<boolean>(true);
  const [streak, setStreak] = useState<number>(0);
  const [turboMode, setTurboMode] = useState<boolean>(false); // 10x testing accelerator

  // 3. Dynamic Console Logs State
  const [consoleLogs, setConsoleLogs] = useState<string[]>([
    '[INIT] Robin Guard SHA3-POW engine v2.0 initialized.',
    `[SYS] Target difficulty: 1.0 bits (Epoch 1 target).`,
    '[READY] Connect wallet and start mining to allocate hashpower to Robinhood Chain.',
  ]);

  const logContainerRef = useRef<HTMLDivElement>(null);
  const lastTimeRef = useRef<number>(Date.now());
  const logCycleIndexRef = useRef<number>(0);

  // Auto-scroll terminal logs
  useEffect(() => {
    if (logContainerRef.current) {
      logContainerRef.current.scrollTop = logContainerRef.current.scrollHeight;
    }
  }, [consoleLogs]);

  // Log hardware mode changes
  useEffect(() => {
    if (mode === 'GPU') {
      setConsoleLogs((prev) => [
        ...prev,
        `[HARDWARE: GPU ACTIVE] DETECTED: ${detectedGPU} (${gpuMultiplier.toFixed(1)}X Multiplier)`,
      ]);
    } else {
      setConsoleLogs((prev) => [
        ...prev,
        `[HARDWARE: CPU ACTIVE] DETECTED: ${cpuCores}-Core High-Performance CPU (1.0X Base Multiplier)`,
      ]);
    }
  }, [mode, detectedGPU, gpuMultiplier, cpuCores]);

  // Dynamic Hashrate & Log Stream loop (every 500ms when isMining is TRUE)
  useEffect(() => {
    if (!isMining) {
      setHashrate(0);
      return;
    }

    const interval = setInterval(() => {
      if (Math.random() < 0.2) {
        sound.playHashTick();
      }

      // Dynamic Hashrate fluctuations:
      // GPU range: 45.0 MH/s to 62.0 MH/s scaled by usage
      // CPU range: 8.5 MH/s to 14.0 MH/s scaled by usage
      let currentHashrate = 0;
      const intensityFactor = usage / 100;
      const jitter = (Math.random() - 0.5) * 4.0;

      if (mode === 'GPU') {
        const baseMin = 45.0;
        const baseMax = 62.0;
        const base = baseMin + (baseMax - baseMin) * intensityFactor;
        currentHashrate = Math.max(20.0, +(base + jitter).toFixed(1));
      } else {
        const baseMin = 8.5;
        const baseMax = 14.0;
        const base = baseMin + (baseMax - baseMin) * intensityFactor;
        currentHashrate = Math.max(4.0, +(base + jitter).toFixed(1));
      }

      setHashrate(currentHashrate);

      // Cycling fake mining logs
      const randomBlock = Math.floor(Math.random() * 90000) + 840000;
      const randomHexNonce = '0x' + Math.random().toString(16).substring(2, 6);
      const cycleLogs = [
        `--> Hashing header block #${randomBlock}...`,
        `--> Nonce check: ${randomHexNonce}... MATCH FAILED`,
        `--> Difficulty target: 1.0 bits`,
        `--> High hash rate detected on ${mode === 'GPU' ? 'GPU' : 'CPU'} (${currentHashrate} MH/s)...`,
        `--> Verifying proof candidate: 0000${Math.random().toString(16).substring(2, 8)}... [PASS: FALSE]`,
      ];

      const nextLog = cycleLogs[logCycleIndexRef.current % cycleLogs.length];
      logCycleIndexRef.current += 1;

      setConsoleLogs((prev) => [...prev.slice(-14), nextLog]);
    }, 500);

    return () => clearInterval(interval);
  }, [isMining, mode, usage]);

  // 2. Mining Speed Balancing (Reduced by 2.5x):
  // At high-end hardware (3.0x GPU) and 100% usage, takes ~4 minutes (between 3.5 and 5 minutes)
  useEffect(() => {
    if (!isMining) return;

    lastTimeRef.current = Date.now();
    // Base speed reduced by 2.5x: 100% in 750 seconds at 1.0x multiplier = ~0.13333 %/sec
    const baseSpeed = (100 / 300) / 2.5;

    const timer = setInterval(() => {
      const now = Date.now();
      const dt = (now - lastTimeRef.current) / 1000;
      lastTimeRef.current = now;

      // When mode === 'GPU', multiplier is gpuMultiplier (3.0x or 1.0x). When mode === 'CPU', multiplier is 1.0x.
      const activeMultiplier = mode === 'GPU' ? gpuMultiplier : 1.0;
      const effectiveSpeed = baseSpeed * activeMultiplier * (usage / 100);
      const speedMultiplier = turboMode ? 10.0 : 1.0;

      const increment = effectiveSpeed * dt * speedMultiplier;

      setProgress((prev) => {
        const next = prev + increment;
        if (next >= 100) {
          setIsMining(false);
          setIsCompleted(true);
          sound.playWinFanfare();

          setConsoleLogs((prevLogs) => [
            ...prevLogs,
            `[TARGET SOLVED] Valid PoW nonce discovered for Epoch 1 target!`,
            `[CLAIM UNLOCKED] Robin Guard ready to mint for $5.00 ETH on Robinhood Chain!`,
          ]);

          onGuardFound(nextGuardId);
          return 100;
        }
        return next;
      });
    }, 100);

    return () => clearInterval(timer);
  }, [isMining, mode, usage, gpuMultiplier, turboMode, nextGuardId, onGuardFound]);

  // Toggle Start / Stop Mining
  const handleToggleMining = () => {
    if (!wallet.isConnected) {
      onConnectWallet();
      return;
    }

    if (isMining) {
      sound.playBlip(320, 'square', 0.06);
      setIsMining(false);
      setConsoleLogs((prev) => [...prev, '[PAUSED] Mining rig suspended.']);
    } else {
      sound.playBlip(680, 'square', 0.08);
      setIsCompleted(false);
      setIsMining(true);
      lastTimeRef.current = Date.now();
      setConsoleLogs((prev) => [
        ...prev,
        `[START] Mining initiated on ${mode} mode (${usage}% power allocation).`,
      ]);
    }
  };

  // Claim Robin Guard
  const handleClaim = () => {
    if (!wallet.isConnected) {
      onConnectWallet();
      return;
    }
    sound.playWinFanfare();

    onClaimGuard({
      id: `#${String(nextGuardId).padStart(4, '0')}`,
      name: `Robin Guard Unit #${String(nextGuardId).padStart(4, '0')}`,
      image: '',
      minedBy: wallet.address,
      minedAt: Date.now(),
      epoch: 1,
      hash: '0x0000' + Math.random().toString(16).substring(2, 28),
      nonce: Math.floor(Math.random() * 9000000) + 1000000,
      rarity: 'Commander',
      power: 280,
      isStaked: false,
      isOwner: true,
    });

    setProgress(0);
    setIsCompleted(false);
    setStreak((s) => s + 1);

    if (keepMiningAfterWin) {
      setTimeout(() => {
        setIsMining(true);
        lastTimeRef.current = Date.now();
      }, 600);
    }
  };

  return (
    <div className="border border-emerald-900/60 bg-[#0c130e] flex flex-col justify-between p-4 sm:p-5 relative shadow-[0_4px_20px_rgba(0,0,0,0.6)]">
      {/* Decorative Corner Notches */}
      <div className="absolute -top-[1px] -left-[1px] w-2.5 h-2.5 bg-[#00ff88]"></div>
      <div className="absolute -top-[1px] -right-[1px] w-2.5 h-2.5 bg-[#059669]"></div>
      <div className="absolute -bottom-[1px] -left-[1px] w-2.5 h-2.5 bg-[#a3e635]"></div>
      <div className="absolute -bottom-[1px] -right-[1px] w-2.5 h-2.5 bg-[#00ff88]"></div>

      <div>
        {/* Header: THE RIG · IDLE / MINING */}
        <div className="flex items-center justify-between border-b border-emerald-900/60 pb-3 mb-4">
          <div className="flex items-center gap-2">
            <span className="font-pixel text-xs sm:text-sm text-white">
              THE RIG · {isCompleted ? (
                <span className="text-[#a3e635] animate-pulse">SOLVED</span>
              ) : isMining ? (
                <span className="text-[#00ff88]">MINING</span>
              ) : (
                <span className="text-neutral-400">IDLE</span>
              )}
            </span>
            {isMining && (
              <span className="w-2 h-2 rounded-none bg-[#00ff88] animate-ping"></span>
            )}
          </div>

          <div className="flex items-center gap-2">
            {/* Turbo test mode toggle */}
            <button
              onClick={() => {
                sound.playToggle(!turboMode);
                setTurboMode(!turboMode);
              }}
              title="Test acceleration: 10x speed"
              className={`text-[9px] font-mono px-1.5 py-0.5 border cursor-pointer transition-colors ${
                turboMode
                  ? 'border-[#a3e635] text-[#a3e635] bg-[#a3e635]/10 font-bold'
                  : 'border-emerald-950 text-emerald-700 hover:text-emerald-500'
              }`}
            >
              {turboMode ? '⚡ TURBO: 10X' : 'NORMAL (1X)'}
            </button>

            <span className="text-[10px] text-emerald-500 font-mono hidden sm:inline">ALGO:</span>
            <span className="text-[10px] font-mono text-[#00ff88] border border-emerald-800 px-1 bg-emerald-950/40">
              SHA3-GUARD
            </span>
          </div>
        </div>

        {/* 1. ACCURATE HARDWARE DETECTION (CPU vs GPU Toggle requirement):
            - When mode === 'GPU': Read WebGL extension and display detected GPU string (e.g. "DETECTED: NVIDIA GeForce RTX 3060")
            - When mode === 'CPU': Read navigator.hardwareConcurrency and display CPU specs string (e.g. "DETECTED: " + navigator.hardwareConcurrency + "-Core High-Performance CPU")
            - DO NOT show the GPU string when CPU mode is selected!
        */}
        <div className="mb-4 p-2.5 bg-[#080a08] border border-emerald-950 flex flex-wrap items-center justify-between gap-2 text-xs font-mono">
          <div className="flex items-center gap-2">
            <Cpu className="w-3.5 h-3.5 text-[#00ff88]" />
            <span className="text-neutral-400 text-[11px]">HARDWARE:</span>
            {mode === 'GPU' ? (
              <span className="text-[#00ff88] font-bold text-[11px] truncate max-w-[220px] sm:max-w-xs">
                DETECTED: {detectedGPU}
              </span>
            ) : (
              <span className="text-[#a3e635] font-bold text-[11px] truncate max-w-[220px] sm:max-w-xs">
                DETECTED: {cpuCores}-Core High-Performance CPU
              </span>
            )}
          </div>
          <div className="flex items-center gap-2 text-[10px]">
            {mode === 'GPU' ? (
              <span className="border border-emerald-800 px-1.5 py-0.2 bg-emerald-950/40 text-[#00ff88] font-bold">
                {gpuMultiplier.toFixed(1)}X {isDedicatedGPU ? 'DEDICATED GPU' : 'INTEGRATED'}
              </span>
            ) : (
              <span className="border border-emerald-800 px-1.5 py-0.2 bg-emerald-950/40 text-[#a3e635] font-bold">
                1.0X CPU THREADS
              </span>
            )}
          </div>
        </div>

        {/* Stats Grid: HASHRATE | MULTIPLIER | STREAK */}
        <div className="grid grid-cols-3 gap-2 sm:gap-3 mb-5">
          {/* HASHRATE */}
          <div className="border border-emerald-950 bg-[#080a08] p-3 text-center">
            <div className="flex items-center justify-center gap-1 text-[10px] text-emerald-500/90 uppercase font-mono mb-1">
              <Zap className="w-3 h-3 text-[#00ff88]" />
              <span>HASHRATE</span>
            </div>
            <div className="font-mono text-sm sm:text-lg font-bold text-white tabular-nums">
              {isMining ? `${hashrate.toFixed(1)} MH/s` : '0.0 MH/s'}
            </div>
          </div>

          {/* MULTIPLIER */}
          <div className="border border-emerald-950 bg-[#080a08] p-3 text-center">
            <div className="flex items-center justify-center gap-1 text-[10px] text-emerald-500/90 uppercase font-mono mb-1">
              <Flame className="w-3 h-3 text-[#a3e635]" />
              <span>MULTIPLIER</span>
            </div>
            <div className="font-mono text-sm sm:text-lg font-bold text-[#a3e635] tabular-nums">
              {mode === 'GPU' ? `${gpuMultiplier.toFixed(1)}X GPU` : '1.0X CPU'}
            </div>
          </div>

          {/* STREAK */}
          <div className="border border-emerald-950 bg-[#080a08] p-3 text-center">
            <div className="flex items-center justify-center gap-1 text-[10px] text-emerald-500/90 uppercase font-mono mb-1">
              <Shield className="w-3 h-3 text-[#00ff88]" />
              <span>STREAK</span>
            </div>
            <div className="font-mono text-sm sm:text-lg font-bold text-[#00ff88] tabular-nums">
              {streak}X
            </div>
          </div>
        </div>

        {/* Controls: [CPU] vs [GPU] toggles */}
        <div className="space-y-3 mb-5">
          <div className="flex items-center justify-between text-xs font-mono">
            <span className="text-neutral-300 flex items-center gap-1.5">
              <Gauge className="w-3.5 h-3.5 text-[#00ff88]" />
              HARDWARE ACCELERATION:
            </span>
            <span className="text-[10px] text-emerald-500 font-mono">
              {mode === 'GPU' ? `GPU Accelerated (${gpuMultiplier.toFixed(1)}X Multiplier)` : 'CPU Multi-Thread Worker (1.0X Base)'}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => {
                sound.playToggle(false);
                setMode('CPU');
              }}
              className={`py-2 px-3 border font-mono text-xs flex items-center justify-center gap-2 cursor-pointer transition-colors ${
                mode === 'CPU'
                  ? 'border-[#a3e635] bg-[#a3e635]/15 text-[#a3e635] font-bold shadow-[0_0_10px_rgba(163,230,53,0.2)]'
                  : 'border-emerald-950 bg-[#080a08] text-neutral-400 hover:text-white hover:border-emerald-800'
              }`}
            >
              <span className={`w-2 h-2 ${mode === 'CPU' ? 'bg-[#a3e635]' : 'bg-neutral-600'}`}></span>
              [CPU · 1.0X]
            </button>

            <button
              onClick={() => {
                sound.playToggle(true);
                setMode('GPU');
              }}
              className={`py-2 px-3 border font-mono text-xs flex items-center justify-center gap-2 cursor-pointer transition-colors ${
                mode === 'GPU'
                  ? 'border-[#00ff88] bg-[#00ff88]/20 text-[#00ff88] font-bold shadow-[0_0_12px_rgba(0,255,136,0.25)]'
                  : 'border-emerald-950 bg-[#080a08] text-neutral-400 hover:text-white hover:border-emerald-800'
              }`}
            >
              <span className={`w-2 h-2 ${mode === 'GPU' ? 'bg-[#00ff88]' : 'bg-neutral-600'}`}></span>
              [GPU · {gpuMultiplier.toFixed(1)}X]
            </button>
          </div>
        </div>

        {/* Intensity slider: "USAGE" (default 75%) */}
        <div className="space-y-2 mb-5">
          <div className="flex items-center justify-between text-xs font-mono">
            <span className="text-neutral-300">USAGE:</span>
            <span className="text-[#00ff88] font-bold tabular-nums font-mono">
              {usage}% POWER
            </span>
          </div>

          <div className="relative">
            <input
              type="range"
              min="25"
              max="100"
              step="5"
              value={usage}
              onChange={(e) => setUsage(Number(e.target.value))}
              className="w-full h-2 bg-[#080a08] border border-emerald-900/60 appearance-none cursor-pointer accent-[#00ff88] focus:outline-none"
            />
          </div>

          <div className="flex items-center justify-between text-[10px] font-mono text-emerald-600 pt-1">
            <span>25% (ECO)</span>
            <span>75% (OPTIMAL DEFAULT)</span>
            <span>100% (MAX PERFORMANCE)</span>
          </div>
        </div>

        {/* Animated Pixel Progress Bar */}
        <div className="space-y-1.5 mb-5">
          <div className="flex items-center justify-between text-xs font-mono">
            <span className="text-neutral-400">
              NONCE SEARCH PROGRESS:
            </span>
            <span className={`font-bold tabular-nums font-mono ${isCompleted ? 'text-[#a3e635]' : 'text-[#00ff88]'}`}>
              {progress.toFixed(1)}%
            </span>
          </div>

          <div
            className={`w-full bg-[#080a08] border h-4 p-0.5 overflow-hidden transition-all duration-300 ${
              isCompleted
                ? 'border-[#a3e635] shadow-[0_0_15px_rgba(163,230,53,0.4)] animate-pulse'
                : 'border-emerald-900/80'
            }`}
          >
            <div
              className={`h-full transition-all duration-150 ${
                isCompleted
                  ? 'bg-gradient-to-r from-emerald-500 via-[#00ff88] to-[#a3e635] shadow-[0_0_14px_rgba(0,255,136,0.6)]'
                  : isMining
                  ? 'bg-gradient-to-r from-emerald-600 via-[#00ff88] to-[#a3e635] shadow-[0_0_10px_rgba(0,255,136,0.4)]'
                  : 'bg-emerald-950/40'
              }`}
              style={{ width: `${Math.max(1, progress)}%` }}
            />
          </div>

          <div className="flex justify-between text-[9px] font-mono text-emerald-600">
            <span>DIFFICULTY TARGET: 1.0 BITS</span>
            <span>
              {isCompleted
                ? 'TARGET SOLVED! CLICK CLAIM BELOW.'
                : isMining
                ? `BALANCED EPOCH 1 FILL (~${Math.max(1, Math.round(((100 - progress) / ((100 / 300) / 2.5)) / (mode === 'GPU' ? gpuMultiplier : 1) / (usage / 100) / (turboMode ? 10 : 1)))}s)`
                : 'STANDBY'}
            </span>
          </div>
        </div>

        {/* Animated Terminal Console Box */}
        <div className="mb-5 bg-[#060a06] border border-emerald-950 p-2.5">
          <div className="flex items-center justify-between border-b border-emerald-950 pb-1 mb-1.5 text-[10px] font-mono text-emerald-500">
            <span className="flex items-center gap-1">
              <Terminal className="w-3 h-3 text-[#00ff88]" />
              <span>TERMINAL MINING ENGINE</span>
            </span>
            <span className="text-[#00ff88]">
              {isCompleted ? 'SOLVED' : isMining ? 'ACTIVE' : 'STANDBY'}
            </span>
          </div>

          <div
            ref={logContainerRef}
            className="h-24 overflow-y-auto font-mono text-[10px] text-emerald-400/90 space-y-1 scrollbar-thin select-text"
          >
            {consoleLogs.map((log, idx) => (
              <div key={idx} className="leading-tight break-all font-mono">
                {log.startsWith('-->') ? (
                  <span className="text-[#a3e635] font-semibold">{log}</span>
                ) : log.includes('SOLVED') || log.includes('CLAIM') ? (
                  <span className="text-[#00ff88] font-bold">{log}</span>
                ) : (
                  <span>{log}</span>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Action Area & Wallet-Gated Behavior:
          - If wallet is not connected: display "CONNECT WALLET TO MINE"
          - If completed: display "CLAIM ROBIN GUARD ($5.00 ETH)"
          - Otherwise: display "START MINING" / "STOP MINING"
      */}
      <div className="pt-2 border-t border-emerald-900/60 space-y-3">
        {!wallet.isConnected ? (
          <button
            onClick={() => {
              sound.playBlip(600, 'square', 0.08);
              onConnectWallet();
            }}
            className="w-full py-3.5 px-4 font-pixel text-xs sm:text-sm tracking-wider uppercase font-bold pixel-btn-action cursor-pointer transition-all border-2 border-[#00ff88] bg-[#00ff88] text-black hover:bg-[#00ff88]/90 shadow-[0_0_20px_rgba(0,255,136,0.4)] flex items-center justify-center gap-2"
          >
            <Lock className="w-4 h-4" />
            <span>CONNECT WALLET TO MINE</span>
          </button>
        ) : isCompleted ? (
          <button
            onClick={handleClaim}
            className="w-full py-3.5 px-4 font-pixel text-xs sm:text-sm tracking-wider uppercase font-bold pixel-btn-action cursor-pointer transition-all border-2 border-[#00ff88] bg-[#00ff88] text-black shadow-[0_0_30px_rgba(0,255,136,0.6)] hover:bg-[#00ff88]/90 animate-bounce flex items-center justify-center gap-2"
          >
            <Sparkles className="w-4 h-4 text-black animate-spin" style={{ animationDuration: '4s' }} />
            <span>CLAIM ROBIN GUARD ($5.00 ETH)</span>
            <Sparkles className="w-4 h-4 text-black animate-spin" style={{ animationDuration: '4s' }} />
          </button>
        ) : (
          <button
            onClick={handleToggleMining}
            className={`w-full py-3.5 px-4 font-pixel text-xs sm:text-sm tracking-wider uppercase font-bold pixel-btn-action cursor-pointer transition-all border-2 ${
              isMining
                ? 'border-red-500 bg-red-500 text-black shadow-[0_0_20px_rgba(239,68,68,0.4)] hover:bg-red-400'
                : 'border-[#00ff88] bg-[#00ff88] text-black shadow-[0_0_25px_rgba(0,255,136,0.5)] hover:bg-[#00ff88]/90'
            }`}
          >
            {isMining ? '■ STOP MINING' : 'START MINING'}
          </button>
        )}

        {/* Checkbox: "[x] Keep mining after a win" */}
        <div className="flex items-center justify-between text-xs font-mono">
          <label className="flex items-center gap-2.5 text-neutral-300 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={keepMiningAfterWin}
              onChange={() => {
                sound.playToggle(!keepMiningAfterWin);
                setKeepMiningAfterWin(!keepMiningAfterWin);
              }}
              className="w-4 h-4 bg-[#080a08] border border-emerald-800 accent-[#00ff88] cursor-pointer rounded-none"
            />
            <span>[x] Keep mining after a win</span>
          </label>

          {progress > 0 && !isCompleted && (
            <button
              onClick={() => {
                sound.playBlip(300, 'square', 0.04);
                setProgress(0);
                setIsMining(false);
              }}
              className="text-[10px] text-emerald-600 hover:text-emerald-400 cursor-pointer underline"
            >
              Reset Progress
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
