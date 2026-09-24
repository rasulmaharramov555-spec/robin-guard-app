'use client';

import React, { useState, useEffect, useRef } from 'react';
import {
  Shield,
  Zap,
  Flame,
  Terminal,
  Clock,
  Coins,
  Cpu,
  Trophy,
  Wallet,
  Lock,
  Sparkles,
  Volume2,
  VolumeX,
  Monitor,
  Copy,
  Check,
  QrCode,
  LogOut,
  ArrowRight,
  ArrowLeft,
  RefreshCw,
  Gauge,
  Loader2,
  TrendingUp,
  ShieldCheck,
  HelpCircle
} from 'lucide-react';

import imgGuardPrimary from './assets/images/pixel_robin_guard_1790261783198.jpg';
import imgMiner from './assets/images/pixel_nft_miner_1790261281704.jpg';
import imgArcher from './assets/images/pixel_nft_archer_1790261296083.jpg';
import imgRobot from './assets/images/pixel_nft_robot_1790261307832.jpg';
import imgCyber from './assets/images/pixel_nft_cyberpunk_1790261319590.jpg';

// --- TYPES ---
export type TabType = 'MINE' | 'STAKING' | 'GUARD_TOKEN' | 'HOW_IT_WORKS';
export type RigMode = 'CPU' | 'GPU';
export type Rarity = 'Common' | 'Elite' | 'Commander' | 'Legendary' | 'Prime';

export interface RobinGuardNFT {
  id: string;
  name: string;
  image: string;
  epoch: number;
  hash: string;
  power: number;
  rarity: Rarity;
  minedBy: string;
  timestamp: number;
  isOwner?: boolean;
  isStaked?: boolean;
}

export interface WalletState {
  isConnected: boolean;
  address: string;
  ethBalance: number;
  guardBalance: number;
}

// --- CONSTANTS ---
export const TARGET_LAUNCH_ISO = '2026-09-26T06:00:00+04:00';
export const TARGET_LAUNCH_TIMESTAMP = new Date(TARGET_LAUNCH_ISO).getTime();

const AVATAR_SPRITES = [imgGuardPrimary, imgMiner, imgArcher, imgRobot, imgCyber];

const INITIAL_GUARDS: RobinGuardNFT[] = [];

// --- UTILS ---
export const shortenAddress = (addr: string) => {
  if (!addr) return '';
  return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
};

// 8-Bit Web Audio Synthesizer
class SoundFX {
  private ctx: AudioContext | null = null;
  public enabled = true;

  private init() {
    if (!this.ctx && typeof window !== 'undefined') {
      try {
        const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
        if (AudioCtx) this.ctx = new AudioCtx();
      } catch {
        this.ctx = null;
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      try { this.ctx.resume(); } catch {}
    }
  }

  public playBlip(freq = 440, type: OscillatorType = 'square', dur = 0.04) {
    if (!this.enabled) return;
    try {
      this.init();
      if (!this.ctx) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = type;
      osc.frequency.setValueAtTime(freq, this.ctx.currentTime);
      gain.gain.setValueAtTime(0.08, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + dur);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start();
      osc.stop(this.ctx.currentTime + dur);
    } catch {}
  }

  public playToggle(on: boolean) {
    this.playBlip(on ? 600 : 320, 'triangle', 0.05);
  }

  public playHashTick() {
    if (!this.enabled) return;
    try {
      this.init();
      if (!this.ctx) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(150 + Math.random() * 200, this.ctx.currentTime);
      gain.gain.setValueAtTime(0.015, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, this.ctx.currentTime + 0.03);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start();
      osc.stop(this.ctx.currentTime + 0.03);
    } catch {}
  }

  public playWinFanfare() {
    if (!this.enabled) return;
    try {
      this.init();
      if (!this.ctx) return;
      [261.63, 329.63, 392.0, 523.25, 659.25, 783.99].forEach((freq, i) => {
        const osc = this.ctx!.createOscillator();
        const gain = this.ctx!.createGain();
        osc.type = 'square';
        const start = this.ctx!.currentTime + i * 0.09;
        osc.frequency.setValueAtTime(freq, start);
        gain.gain.setValueAtTime(0.08, start);
        gain.gain.exponentialRampToValueAtTime(0.001, start + 0.16);
        osc.connect(gain);
        gain.connect(this.ctx!.destination);
        osc.start(start);
        osc.stop(start + 0.18);
      });
    } catch {}
  }
}

const sound = new SoundFX();

export default function App() {
  const [activeTab, setActiveTab] = useState<TabType>('MINE');
  const [crtEnabled, setCrtEnabled] = useState(true);
  const [audioEnabled, setAudioEnabled] = useState(true);
  const [isWalletModalOpen, setIsWalletModalOpen] = useState(false);

  // Wallet State
  const [wallet, setWallet] = useState<WalletState>({
    isConnected: false,
    address: '0x71C88e019F023184561b369680327e7B39aB',
    ethBalance: 0.15,
    guardBalance: 0.0,
  });

  // Guards & Mined State
  const [guards, setGuards] = useState<RobinGuardNFT[]>(INITIAL_GUARDS);
  const [totalMined, setTotalMined] = useState<number>(0);
  const [claimTargetGuard, setClaimTargetGuard] = useState<RobinGuardNFT | null>(null);
  const [isClaimModalOpen, setIsClaimModalOpen] = useState(false);
  const [inspectedGuard, setInspectedGuard] = useState<RobinGuardNFT | null>(null);

  // Hardware Detection State
  const [hardware, setHardware] = useState({
    detectedGPU: 'Detecting...',
    detectedCPU: '8-Core CPU',
    gpuMultiplier: 1.0,
    cpuCores: 8,
    isDedicatedGPU: false,
  });

  // Launch Countdown State
  const [countdown, setCountdown] = useState({
    formatted: '00d : 00h : 00m : 00s',
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  });

  // Mining Engine State
  const [isMining, setIsMining] = useState(false);
  const [progress, setProgress] = useState(0);
  const [hashrate, setHashrate] = useState(0);
  const [mode, setMode] = useState<RigMode>('GPU');
  const [usage, setUsage] = useState(75);
  const [isCompleted, setIsCompleted] = useState(false);
  const [keepMiningAfterWin, setKeepMiningAfterWin] = useState(true);
  const [streak, setStreak] = useState(0);
  const [turboMode, setTurboMode] = useState(false);
  const [consoleLogs, setConsoleLogs] = useState<string[]>([
    '[INIT] Robin Guard SHA3-POW engine v2.0 initialized.',
    '[SYS] Target difficulty: 1.0 bits (Epoch 1 target).',
    '[READY] Connect wallet to begin mining Robin Guard on Robinhood Chain L2.',
  ]);

  const logContainerRef = useRef<HTMLDivElement>(null);
  const lastTimeRef = useRef<number>(Date.now());
  const logCycleIndexRef = useRef<number>(0);

  // Staking Rewards Ticker
  const [unclaimedGuard, setUnclaimedGuard] = useState(0);

  // 1. Hardware Detection Hook
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
              if (
                upper.includes('NVIDIA') ||
                upper.includes('GEFORCE') ||
                upper.includes('RTX') ||
                upper.includes('GTX') ||
                upper.includes('AMD') ||
                upper.includes('RADEON') ||
                upper.includes('APPLE') ||
                upper.includes('M1') ||
                upper.includes('M2') ||
                upper.includes('M3') ||
                upper.includes('M4')
              ) {
                isDedicated = true;
                multiplier = 3.0;
                const match = renderer.match(
                  /(NVIDIA\s+GeForce\s+[^,)]+|AMD\s+Radeon\s+[^,)]+|Apple\s+M\d+[^,)]+|Apple\s+GPU|RTX\s+[^,)]+|GTX\s+[^,)]+)/i
                );
                gpuName = match && match[0] ? match[0].trim() : renderer.replace(/ANGLE \((.*)\)/i, '$1').split(',')[0].trim();
              } else if (upper.includes('INTEL')) {
                const match = renderer.match(/(Intel\(R\)\s+[^,)]+|Intel\s+[^,)]+)/i);
                gpuName = match ? match[0].trim() : 'Intel Integrated HD/Iris Graphics';
              }
            }
          }
        }
      }
    } catch {
      gpuName = 'Standard Integrated Graphics';
    }

    setHardware({
      detectedGPU: gpuName,
      detectedCPU: `${cores}-Core High-Performance CPU`,
      gpuMultiplier: multiplier,
      cpuCores: cores,
      isDedicatedGPU: isDedicated,
    });
  }, []);

  // 2. Launch Countdown Hook: Target Sep 26, 2026, 06:00:00 AM UTC+4
  useEffect(() => {
    const updateCountdown = () => {
      try {
        const diff = Math.max(0, TARGET_LAUNCH_TIMESTAMP - Date.now());
        const totalSecs = Math.floor(diff / 1000);
        const d = Math.floor(totalSecs / 86400);
        const h = Math.floor((totalSecs % 86400) / 3600);
        const m = Math.floor((totalSecs % 3600) / 60);
        const s = totalSecs % 60;
        const fmt = `${String(d).padStart(2, '0')}d : ${String(h).padStart(2, '0')}h : ${String(m).padStart(2, '0')}m : ${String(s).padStart(2, '0')}s`;
        setCountdown({ formatted: fmt, days: d, hours: h, minutes: m, seconds: s });
      } catch {}
    };

    updateCountdown();
    const interval = setInterval(updateCountdown, 1000);
    return () => clearInterval(interval);
  }, []);

  // Sync Audio Setting
  useEffect(() => {
    sound.enabled = audioEnabled;
  }, [audioEnabled]);

  // Auto-scroll mining terminal logs
  useEffect(() => {
    if (logContainerRef.current) {
      logContainerRef.current.scrollTop = logContainerRef.current.scrollHeight;
    }
  }, [consoleLogs]);

  // Log hardware mode toggles
  useEffect(() => {
    if (mode === 'GPU') {
      setConsoleLogs((prev) => [
        ...prev.slice(-14),
        `[HARDWARE: GPU ACTIVE] DETECTED: ${hardware.detectedGPU} (${hardware.gpuMultiplier.toFixed(1)}X Multiplier)`,
      ]);
    } else {
      setConsoleLogs((prev) => [
        ...prev.slice(-14),
        `[HARDWARE: CPU ACTIVE] DETECTED: ${hardware.cpuCores}-Core High-Performance CPU (1.0X Base Multiplier)`,
      ]);
    }
  }, [mode, hardware]);

  // 3. Dynamic Hashrate & Mining Engine Loop
  useEffect(() => {
    if (!isMining) {
      setHashrate(0);
      return;
    }

    const interval = setInterval(() => {
      if (Math.random() < 0.2) sound.playHashTick();

      const intensityFactor = usage / 100;
      const jitter = (Math.random() - 0.5) * 4.0;
      let currentHashrate = 0;

      if (mode === 'GPU') {
        const base = 45.0 + (62.0 - 45.0) * intensityFactor;
        currentHashrate = Math.max(20.0, +(base + jitter).toFixed(1));
      } else {
        const base = 8.5 + (14.0 - 8.5) * intensityFactor;
        currentHashrate = Math.max(4.0, +(base + jitter).toFixed(1));
      }
      setHashrate(currentHashrate);

      // Pseudo-terminal logs
      const randomBlock = Math.floor(Math.random() * 90000) + 840000;
      const cycleLogs = [
        `--> Hashing block #${randomBlock}...`,
        `--> Checking nonce: 0x${Math.random().toString(16).substring(2, 6)}... MATCH FAILED`,
        `--> Difficulty target: 1.0 bits (Epoch 1)`,
        `--> Hashrate: ${currentHashrate} MH/s (${mode})`,
        `--> Checking candidate proof: 0000${Math.random().toString(16).substring(2, 8)}... [PASS: FALSE]`,
      ];
      setConsoleLogs((prev) => [...prev.slice(-14), cycleLogs[logCycleIndexRef.current % cycleLogs.length]]);
      logCycleIndexRef.current += 1;
    }, 500);

    return () => clearInterval(interval);
  }, [isMining, mode, usage]);

  // 4. Balanced Mining Speed Loop: ~3.5 to 5 minutes to 100% for Epoch 1
  useEffect(() => {
    if (!isMining || isCompleted) return;

    lastTimeRef.current = Date.now();
    const interval = setInterval(() => {
      const now = Date.now();
      const deltaSec = (now - lastTimeRef.current) / 1000;
      lastTimeRef.current = now;

      // Base fill speed calibrated so Epoch 1 takes ~300s at 1.0X and 2.5x slower balancer
      const baseSpeedPercentPerSec = (100 / 300) / 2.5;
      const activeMultiplier = mode === 'GPU' ? hardware.gpuMultiplier : 1.0;
      const intensity = usage / 100;
      const boost = turboMode ? 10.0 : 1.0;
      const deltaPercent = baseSpeedPercentPerSec * activeMultiplier * intensity * boost * deltaSec;

      setProgress((prev) => {
        const next = prev + deltaPercent;
        if (next >= 100) {
          setIsCompleted(true);
          setIsMining(false);
          sound.playWinFanfare();

          const foundGuard: RobinGuardNFT = {
            id: `#${String(totalMined + 1).padStart(4, '0')}`,
            name: `Robin Guard #${totalMined + 1}`,
            image: AVATAR_SPRITES[(totalMined) % AVATAR_SPRITES.length],
            epoch: 1,
            hash: '0x0000' + Array.from({ length: 60 }, () => Math.floor(Math.random() * 16).toString(16)).join(''),
            power: Math.floor(Math.random() * 50) + 120,
            rarity: ['Elite', 'Commander', 'Legendary', 'Prime'][Math.floor(Math.random() * 4)] as Rarity,
            minedBy: wallet.address,
            timestamp: Date.now(),
            isOwner: true,
            isStaked: false,
          };

          setClaimTargetGuard(foundGuard);
          setConsoleLogs((logs) => [
            ...logs.slice(-14),
            '*** PROOF-OF-WORK TARGET SOLVED! ***',
            `>>> ROBIN GUARD ${foundGuard.id} DISCOVERED!`,
            '>>> CLICK CLAIM BELOW TO CONFIRM ($5.00 ETH)',
          ]);
          return 100;
        }
        return next;
      });
    }, 100);

    return () => clearInterval(interval);
  }, [isMining, isCompleted, mode, usage, hardware, turboMode, totalMined, wallet.address]);

  // 5. Staking real-time yield ticker (50 $GUARD/hr per staked guard)
  const userGuards = guards.filter(
    (g) => g.isOwner || (wallet.isConnected && g.minedBy.toLowerCase() === wallet.address.toLowerCase())
  );
  const stakedGuards = userGuards.filter((g) => g.isStaked);
  const stakedCount = stakedGuards.length;

  useEffect(() => {
    if (stakedCount > 0) {
      const interval = setInterval(() => {
        // 50 $GUARD per hour per guard = 50 / 3600 per second
        const step = (stakedCount * 50 / 3600) * 0.5;
        setUnclaimedGuard((prev) => +(prev + step).toFixed(2));
      }, 500);
      return () => clearInterval(interval);
    }
  }, [stakedCount]);

  // Wallet Connect Handler
  const handleConnectMock = (optName = 'Robinhood Demo') => {
    sound.playWinFanfare();
    setWallet((prev) => ({ ...prev, isConnected: true }));
    setIsWalletModalOpen(false);
  };

  const handleDisconnect = () => {
    sound.playBlip(300, 'square', 0.05);
    setWallet((prev) => ({ ...prev, isConnected: false }));
    setIsWalletModalOpen(false);
  };

  const handleFaucet = () => {
    sound.playBlip(700, 'triangle', 0.05);
    setWallet((prev) => ({
      ...prev,
      ethBalance: +(prev.ethBalance + 0.1).toFixed(3),
      guardBalance: +(prev.guardBalance + 50).toFixed(2),
    }));
  };

  // Mining Toggle
  const handleToggleMining = () => {
    if (!wallet.isConnected) {
      setIsWalletModalOpen(true);
      return;
    }
    sound.playBlip(isMining ? 300 : 700, 'square', 0.08);
    setIsMining(!isMining);
  };

  // Claim Mined Guard
  const handleClaimMined = () => {
    if (!claimTargetGuard) return;
    setIsClaimModalOpen(true);
  };

  const handleMintSuccess = () => {
    if (!claimTargetGuard) return;
    setGuards((prev) => [claimTargetGuard, ...prev]);
    setTotalMined((c) => c + 1);
    setStreak((s) => s + 1);
    setWallet((w) => ({
      ...w,
      ethBalance: Math.max(0, +(w.ethBalance - 0.0018).toFixed(4)),
    }));
    setClaimTargetGuard(null);
    setIsClaimModalOpen(false);
    setProgress(0);
    setIsCompleted(false);

    if (keepMiningAfterWin) {
      setIsMining(true);
    }
  };

  // Staking Handlers
  const handleToggleStake = (id: string) => {
    sound.playBlip(550, 'triangle', 0.05);
    setGuards((prev) => prev.map((g) => (g.id === id ? { ...g, isStaked: !g.isStaked } : g)));
    if (inspectedGuard && inspectedGuard.id === id) {
      setInspectedGuard((prev) => (prev ? { ...prev, isStaked: !prev.isStaked } : null));
    }
  };

  const handleStakeAll = () => {
    sound.playBlip(650, 'triangle', 0.05);
    setGuards((prev) => prev.map((g) => ({ ...g, isStaked: true })));
  };

  const handleUnstakeAll = () => {
    sound.playBlip(350, 'square', 0.05);
    setGuards((prev) => prev.map((g) => ({ ...g, isStaked: false })));
  };

  const handleClaimTokens = () => {
    if (unclaimedGuard <= 0) return;
    sound.playWinFanfare();
    setWallet((prev) => ({
      ...prev,
      guardBalance: +(prev.guardBalance + unclaimedGuard).toFixed(2),
    }));
    setUnclaimedGuard(0);
  };

  return (
    <div className="min-h-screen bg-[#080a08] text-neutral-200 font-mono relative selection:bg-[#00ff88] selection:text-black">
      {/* CRT Scanline Overlay */}
      {crtEnabled && <div className="fixed inset-0 scanlines-overlay z-50 pointer-events-none" />}

      {/* 1. HEADER */}
      <header className="border-b border-emerald-900/50 bg-[#080a08]/95 backdrop-blur-sm sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-3">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 border border-[#00ff88] bg-[#00ff88]/10 flex items-center justify-center shadow-[0_0_12px_rgba(0,255,136,0.3)]">
              <Shield className="w-5 h-5 text-[#00ff88]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-pixel text-sm sm:text-base font-bold tracking-tight text-white hover:text-[#00ff88] transition-colors">
                  ROBIN GUARD
                </span>
                <span className="text-[10px] text-[#00ff88] border border-emerald-800 px-1 py-0.2 bg-emerald-950/40 uppercase font-mono hidden sm:inline">
                  PoW L2
                </span>
              </div>
            </div>
          </div>

          {/* Launch Countdown Badge */}
          <div className="hidden md:flex items-center gap-2 border border-emerald-900/60 bg-[#0c130e] px-3 py-1 text-xs font-mono">
            <Clock className="w-3.5 h-3.5 text-[#00ff88] animate-pulse" />
            <span className="text-neutral-400 text-[11px]">LAUNCH:</span>
            <span className="text-[#00ff88] font-bold tabular-nums tracking-wider text-[11px]">
              {countdown.formatted}
            </span>
          </div>

          {/* Network Badge */}
          <div className="hidden lg:flex items-center gap-2 border border-emerald-900/60 bg-[#0c130e] px-3 py-1">
            <div className="relative flex items-center justify-center w-2.5 h-2.5">
              <span className="absolute w-2.5 h-2.5 rounded-none bg-[#00ff88] animate-ping opacity-75"></span>
              <span className="relative w-2 h-2 rounded-none bg-[#00ff88]"></span>
            </div>
            <span className="text-xs font-mono text-neutral-200">Robinhood Chain</span>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2 sm:gap-3">
            <button
              onClick={() => {
                sound.playToggle(!crtEnabled);
                setCrtEnabled(!crtEnabled);
              }}
              title={crtEnabled ? 'Disable CRT Scanlines' : 'Enable CRT Scanlines'}
              className={`p-2 border transition-colors cursor-pointer ${
                crtEnabled ? 'border-[#00ff88] text-[#00ff88] bg-[#00ff88]/10' : 'border-emerald-900/60 text-neutral-400 bg-[#0c130e]'
              }`}
            >
              <Monitor className="w-4 h-4" />
            </button>

            <button
              onClick={() => {
                sound.playToggle(!audioEnabled);
                setAudioEnabled(!audioEnabled);
              }}
              title={audioEnabled ? 'Mute 8-Bit Audio' : 'Unmute 8-Bit Audio'}
              className={`p-2 border transition-colors cursor-pointer ${
                audioEnabled ? 'border-[#00ff88] text-[#00ff88] bg-[#00ff88]/10' : 'border-emerald-900/60 text-neutral-400 bg-[#0c130e]'
              }`}
            >
              {audioEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
            </button>

            {!wallet.isConnected ? (
              <button
                onClick={() => {
                  sound.playBlip(600, 'square', 0.08);
                  setIsWalletModalOpen(true);
                }}
                className="pixel-btn-action border-2 border-[#00ff88] bg-[#00ff88] text-black px-3.5 sm:px-4 py-1.5 font-pixel text-[11px] sm:text-xs tracking-wider uppercase font-bold hover:bg-[#00ff88]/90 cursor-pointer shadow-[0_0_15px_rgba(0,255,136,0.4)]"
              >
                CONNECT WALLET
              </button>
            ) : (
              <button
                onClick={() => {
                  sound.playBlip(500, 'triangle', 0.05);
                  setIsWalletModalOpen(true);
                }}
                className="pixel-btn-action border border-emerald-700 bg-[#0c130e] text-neutral-200 px-3 py-1.5 font-mono text-xs hover:border-[#00ff88] hover:text-[#00ff88] flex items-center gap-2 cursor-pointer shadow-[0_0_10px_rgba(0,255,136,0.15)]"
              >
                <div className="w-4 h-4 bg-[#00ff88]/20 border border-[#00ff88] flex items-center justify-center text-[8px] font-pixel text-[#00ff88]">
                  G
                </div>
                <span className="w-1.5 h-1.5 bg-[#00ff88] animate-pulse"></span>
                <span className="font-bold">{shortenAddress(wallet.address)}</span>
                <span className="text-[10px] text-emerald-500 hidden sm:inline">
                  ({wallet.ethBalance.toFixed(3)} ETH)
                </span>
              </button>
            )}
          </div>
        </div>
      </header>

      {/* 2. HERO BANNER */}
      <section className="relative border-b border-emerald-900/60 bg-[#080a08] overflow-hidden pixel-grid-bg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 sm:py-10">
          <div className="text-center max-w-3xl mx-auto space-y-3">
            <div className="inline-flex items-center gap-2 border border-emerald-800 bg-[#0c130e] px-3 py-1 text-xs">
              <span className="w-2 h-2 rounded-none bg-[#00ff88] animate-pulse"></span>
              <span className="font-pixel text-[10px] sm:text-xs text-[#00ff88]">EPOCH 1 ACTIVE</span>
              <span className="text-neutral-500">|</span>
              <span className="text-neutral-300 text-[11px]">5,000 TOTAL SUPPLY</span>
            </div>

            <h1 className="font-pixel text-xl sm:text-3xl lg:text-4xl text-white tracking-wide leading-tight drop-shadow-[0_0_20px_rgba(0,255,136,0.25)]">
              YOU CAN&apos;T BUY A GUARD.<br />
              <span className="text-[#00ff88]">YOU MINE ONE.</span>
            </h1>

            <p className="font-mono text-xs sm:text-sm text-neutral-400 uppercase tracking-widest">
              PROOF-OF-WORK NFT MINING ON ROBINHOOD CHAIN
            </p>

            {/* Live Stats Bar */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-4 pt-4 max-w-2xl mx-auto text-left font-mono">
              <div className="border border-emerald-950 bg-[#0c130e] p-2.5">
                <span className="text-[10px] text-emerald-500 block uppercase">MINED</span>
                <span className="font-bold text-white text-sm sm:text-base tabular-nums">
                  {totalMined} / 5,000
                </span>
              </div>
              <div className="border border-emerald-950 bg-[#0c130e] p-2.5">
                <span className="text-[10px] text-emerald-500 block uppercase">EPOCH</span>
                <span className="font-bold text-[#00ff88] text-sm sm:text-base">1 / 10</span>
              </div>
              <div className="border border-emerald-950 bg-[#0c130e] p-2.5">
                <span className="text-[10px] text-emerald-500 block uppercase">MINT PRICE</span>
                <span className="font-bold text-white text-sm sm:text-base">$5.00 ETH</span>
              </div>
              <div className="border border-emerald-950 bg-[#0c130e] p-2.5">
                <span className="text-[10px] text-emerald-500 block uppercase">DIFFICULTY</span>
                <span className="font-bold text-[#a3e635] text-sm sm:text-base">1.0 bits</span>
              </div>
            </div>

            {/* Epoch Progress Bar: 10 distinct segmented blocks */}
            <div className="pt-3 max-w-2xl mx-auto">
              <div className="flex items-center justify-between text-[10px] text-neutral-400 font-mono mb-1.5">
                <span>EPOCH ROADMAP (10 BLOCKS)</span>
                <span className="text-[#00ff88]">EPOCH 1: 500 GUARDS</span>
              </div>
              <div className="grid grid-cols-10 gap-1.5">
                {Array.from({ length: 10 }).map((_, idx) => {
                  const isCurrent = idx === 0;
                  return (
                    <div
                      key={idx}
                      className={`h-3 border transition-all ${
                        isCurrent
                          ? 'border-[#00ff88] bg-[#00ff88] shadow-[0_0_10px_rgba(0,255,136,0.6)] animate-pulse'
                          : 'border-emerald-950 bg-[#0c1810]'
                      }`}
                      title={`Epoch ${idx + 1}`}
                    />
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. TAB NAVIGATION */}
      <nav className="border-b border-emerald-900/60 bg-[#080a08]/90 sticky top-16 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex items-center justify-start sm:justify-center overflow-x-auto gap-1 sm:gap-2 py-2">
          {(
            [
              { key: 'MINE', label: 'MINE' },
              { key: 'STAKING', label: `STAKING ${stakedCount > 0 ? `(${stakedCount})` : ''}` },
              { key: 'GUARD_TOKEN', label: '$GUARD TOKEN' },
              { key: 'HOW_IT_WORKS', label: 'HOW IT WORKS' },
            ] as const
          ).map((tab) => {
            const isActive = activeTab === tab.key;
            return (
              <button
                key={tab.key}
                onClick={() => {
                  sound.playBlip(500, 'square', 0.04);
                  setActiveTab(tab.key);
                }}
                className={`px-3.5 sm:px-5 py-2 font-pixel text-xs whitespace-nowrap uppercase cursor-pointer transition-all border ${
                  isActive
                    ? 'border-[#00ff88] bg-[#00ff88]/15 text-[#00ff88] font-bold shadow-[0_0_12px_rgba(0,255,136,0.3)]'
                    : 'border-transparent text-neutral-400 hover:text-white hover:bg-emerald-950/20'
                }`}
              >
                [{tab.label}]
              </button>
            );
          })}
        </div>
      </nav>

      {/* 4. MAIN CONTENT */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
        {/* TAB 1: MINE */}
        {activeTab === 'MINE' && (
          <div className="space-y-8">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
              {/* THE RIG (Left Column) */}
              <div className="lg:col-span-7 border border-emerald-900/80 bg-[#0c130e] p-5 sm:p-6 space-y-5">
                {/* Header */}
                <div className="flex items-center justify-between border-b border-emerald-900/60 pb-3">
                  <div className="flex items-center gap-2">
                    <span className="font-pixel text-sm sm:text-base text-white">THE RIG</span>
                    <span className="text-neutral-500">·</span>
                    <span className={`text-xs font-mono font-bold ${isMining ? 'text-[#00ff88] animate-pulse' : 'text-neutral-400'}`}>
                      {isMining ? 'MINING ACTIVE' : 'IDLE'}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] text-emerald-500 font-mono">ALGO:</span>
                    <span className="text-[10px] font-mono text-[#00ff88] border border-emerald-800 px-1 bg-emerald-950/40">
                      SHA3-GUARD
                    </span>
                  </div>
                </div>

                {/* ACCURATE HARDWARE DETECTION (CPU vs GPU) */}
                <div className="p-2.5 bg-[#080a08] border border-emerald-950 flex flex-wrap items-center justify-between gap-2 text-xs font-mono">
                  <div className="flex items-center gap-2">
                    <Cpu className="w-3.5 h-3.5 text-[#00ff88]" />
                    <span className="text-neutral-400 text-[11px]">HARDWARE:</span>
                    {mode === 'GPU' ? (
                      <span className="text-[#00ff88] font-bold text-[11px] truncate max-w-[220px] sm:max-w-xs">
                        DETECTED: {hardware.detectedGPU}
                      </span>
                    ) : (
                      <span className="text-[#a3e635] font-bold text-[11px] truncate max-w-[220px] sm:max-w-xs">
                        DETECTED: {hardware.cpuCores}-Core High-Performance CPU
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-2 text-[10px]">
                    {mode === 'GPU' ? (
                      <span className="border border-emerald-800 px-1.5 py-0.2 bg-emerald-950/40 text-[#00ff88] font-bold">
                        {hardware.gpuMultiplier.toFixed(1)}X {hardware.isDedicatedGPU ? 'DEDICATED GPU' : 'INTEGRATED'}
                      </span>
                    ) : (
                      <span className="border border-emerald-800 px-1.5 py-0.2 bg-emerald-950/40 text-[#a3e635] font-bold">
                        1.0X CPU THREADS
                      </span>
                    )}
                  </div>
                </div>

                {/* Stats Grid: HASHRATE | MULTIPLIER | STREAK */}
                <div className="grid grid-cols-3 gap-2 sm:gap-3">
                  <div className="border border-emerald-950 bg-[#080a08] p-3 text-center">
                    <div className="flex items-center justify-center gap-1 text-[10px] text-emerald-500 uppercase font-mono mb-1">
                      <Zap className="w-3 h-3 text-[#00ff88]" />
                      <span>HASHRATE</span>
                    </div>
                    <div className="font-mono text-sm sm:text-lg font-bold text-white tabular-nums">
                      {isMining ? `${hashrate.toFixed(1)} MH/s` : '0.0 MH/s'}
                    </div>
                  </div>

                  <div className="border border-emerald-950 bg-[#080a08] p-3 text-center">
                    <div className="flex items-center justify-center gap-1 text-[10px] text-emerald-500 uppercase font-mono mb-1">
                      <Flame className="w-3 h-3 text-[#a3e635]" />
                      <span>MULTIPLIER</span>
                    </div>
                    <div className="font-mono text-sm sm:text-lg font-bold text-[#a3e635] tabular-nums">
                      {mode === 'GPU' ? `${hardware.gpuMultiplier.toFixed(1)}X GPU` : '1.0X CPU'}
                    </div>
                  </div>

                  <div className="border border-emerald-950 bg-[#080a08] p-3 text-center">
                    <div className="flex items-center justify-center gap-1 text-[10px] text-emerald-500 uppercase font-mono mb-1">
                      <Trophy className="w-3 h-3 text-yellow-400" />
                      <span>STREAK</span>
                    </div>
                    <div className="font-mono text-sm sm:text-lg font-bold text-yellow-400 tabular-nums">
                      {streak}X
                    </div>
                  </div>
                </div>

                {/* Hardware Toggle Controls */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs font-mono">
                    <span className="text-neutral-300 flex items-center gap-1.5">
                      <Gauge className="w-3.5 h-3.5 text-[#00ff88]" />
                      HARDWARE SELECTION:
                    </span>
                    <span className="text-[10px] text-emerald-500 font-mono">
                      {mode === 'GPU' ? `GPU Accelerated (${hardware.gpuMultiplier.toFixed(1)}X)` : 'CPU Multi-Core (1.0X)'}
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
                          : 'border-emerald-950 bg-[#080a08] text-neutral-400 hover:text-white'
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
                          : 'border-emerald-950 bg-[#080a08] text-neutral-400 hover:text-white'
                      }`}
                    >
                      <span className={`w-2 h-2 ${mode === 'GPU' ? 'bg-[#00ff88]' : 'bg-neutral-600'}`}></span>
                      [GPU · {hardware.gpuMultiplier.toFixed(1)}X]
                    </button>
                  </div>
                </div>

                {/* Intensity Slider: USAGE */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs font-mono">
                    <span className="text-neutral-300">USAGE:</span>
                    <span className="text-[#00ff88] font-bold tabular-nums">{usage}% POWER</span>
                  </div>
                  <input
                    type="range"
                    min="25"
                    max="100"
                    step="5"
                    value={usage}
                    onChange={(e) => setUsage(Number(e.target.value))}
                    className="w-full h-2 bg-[#080a08] border border-emerald-900 appearance-none cursor-pointer accent-[#00ff88]"
                  />
                  <div className="flex justify-between text-[10px] text-emerald-600">
                    <span>25% ECO</span>
                    <span>75% OPTIMAL</span>
                    <span>100% MAX</span>
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="space-y-1">
                  <div className="flex items-center justify-between text-xs font-mono">
                    <span className="text-neutral-400">NONCE SEARCH PROGRESS:</span>
                    <span className={`font-bold tabular-nums ${isCompleted ? 'text-[#a3e635]' : 'text-[#00ff88]'}`}>
                      {progress.toFixed(1)}%
                    </span>
                  </div>
                  <div className="w-full bg-[#080a08] border border-emerald-900 h-4 p-0.5 overflow-hidden">
                    <div
                      className={`h-full transition-all duration-100 ${
                        isCompleted
                          ? 'bg-gradient-to-r from-emerald-500 via-[#00ff88] to-[#a3e635]'
                          : isMining
                          ? 'bg-gradient-to-r from-emerald-600 to-[#00ff88]'
                          : 'bg-emerald-950/40'
                      }`}
                      style={{ width: `${Math.max(1, progress)}%` }}
                    />
                  </div>
                  <div className="flex justify-between text-[9px] text-emerald-600 font-mono">
                    <span>EPOCH 1 DURATION: ~3.5 - 5 MINS</span>
                    <span>{isCompleted ? 'TARGET SOLVED! CLICK CLAIM' : isMining ? 'MINING IN PROGRESS' : 'STANDBY'}</span>
                  </div>
                </div>

                {/* Animated Terminal Console Box */}
                <div className="bg-[#060a06] border border-emerald-950 p-2.5">
                  <div className="flex items-center justify-between border-b border-emerald-950 pb-1 mb-1.5 text-[10px] text-emerald-500">
                    <span className="flex items-center gap-1">
                      <Terminal className="w-3 h-3 text-[#00ff88]" />
                      <span>TERMINAL CONSOLE</span>
                    </span>
                    <span className="text-[#00ff88]">{isCompleted ? 'SOLVED' : isMining ? 'ACTIVE' : 'IDLE'}</span>
                  </div>
                  <div ref={logContainerRef} className="h-20 overflow-y-auto font-mono text-[10px] text-emerald-400 space-y-1 select-text">
                    {consoleLogs.map((log, i) => (
                      <div key={i} className="leading-tight break-all">
                        {log.startsWith('-->') ? (
                          <span className="text-[#a3e635]">{log}</span>
                        ) : log.includes('SOLVED') || log.includes('DISCOVERED') ? (
                          <span className="text-[#00ff88] font-bold">{log}</span>
                        ) : (
                          <span>{log}</span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Action Area */}
                <div className="pt-2 border-t border-emerald-900/60 space-y-3">
                  {!wallet.isConnected ? (
                    <button
                      onClick={() => {
                        sound.playBlip(600, 'square', 0.08);
                        setIsWalletModalOpen(true);
                      }}
                      className="w-full py-3.5 px-4 font-pixel text-xs sm:text-sm tracking-wider uppercase font-bold pixel-btn-action cursor-pointer border-2 border-[#00ff88] bg-[#00ff88] text-black hover:bg-[#00ff88]/90 shadow-[0_0_20px_rgba(0,255,136,0.4)] flex items-center justify-center gap-2"
                    >
                      <Lock className="w-4 h-4" />
                      <span>CONNECT WALLET TO MINE</span>
                    </button>
                  ) : isCompleted ? (
                    <button
                      onClick={handleClaimMined}
                      className="w-full py-3.5 px-4 font-pixel text-xs sm:text-sm tracking-wider uppercase font-bold pixel-btn-action cursor-pointer border-2 border-[#00ff88] bg-[#00ff88] text-black shadow-[0_0_30px_rgba(0,255,136,0.6)] hover:bg-[#00ff88]/90 animate-bounce flex items-center justify-center gap-2"
                    >
                      <Sparkles className="w-4 h-4 text-black animate-spin" />
                      <span>CLAIM ROBIN GUARD ($5.00 ETH)</span>
                    </button>
                  ) : (
                    <button
                      onClick={handleToggleMining}
                      className={`w-full py-3.5 px-4 font-pixel text-xs sm:text-sm tracking-wider uppercase font-bold pixel-btn-action cursor-pointer transition-all border-2 ${
                        isMining
                          ? 'border-red-500 bg-red-500 text-black hover:bg-red-400'
                          : 'border-[#00ff88] bg-[#00ff88] text-black hover:bg-[#00ff88]/90 shadow-[0_0_25px_rgba(0,255,136,0.5)]'
                      }`}
                    >
                      {isMining ? '■ STOP MINING' : 'START MINING'}
                    </button>
                  )}

                  <div className="flex items-center justify-between text-xs font-mono">
                    <label className="flex items-center gap-2 text-neutral-300 cursor-pointer select-none">
                      <input
                        type="checkbox"
                        checked={keepMiningAfterWin}
                        onChange={() => setKeepMiningAfterWin(!keepMiningAfterWin)}
                        className="w-4 h-4 accent-[#00ff88]"
                      />
                      <span>[x] Keep mining after a win</span>
                    </label>

                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => setTurboMode(!turboMode)}
                        className={`text-[10px] px-1.5 py-0.5 border cursor-pointer ${
                          turboMode ? 'border-[#a3e635] text-[#a3e635] bg-[#a3e635]/15' : 'border-emerald-900 text-neutral-500'
                        }`}
                        title="10x Speed Accelerator for Testing"
                      >
                        ⚡ 10X TURBO
                      </button>
                      {progress > 0 && !isCompleted && (
                        <button
                          onClick={() => {
                            setProgress(0);
                            setIsMining(false);
                          }}
                          className="text-[10px] text-emerald-600 hover:text-emerald-400 underline cursor-pointer"
                        >
                          Reset
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* LIVE RACE (Right Column) */}
              <div className="lg:col-span-5 border border-emerald-900/80 bg-[#0c130e] p-5 sm:p-6 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between border-b border-emerald-900/60 pb-3 mb-4">
                    <div className="flex items-center gap-2">
                      <span className="font-pixel text-xs text-white">RECENT GUARDS MINED</span>
                      <span className="text-[10px] text-[#00ff88] border border-emerald-800 px-1 bg-emerald-950/40">
                        EPOCH 1
                      </span>
                    </div>
                    <span className="text-xs text-neutral-400 tabular-nums">{guards.length} MINED</span>
                  </div>

                  {guards.length === 0 ? (
                    <div className="border border-emerald-950 bg-[#080a08] p-8 text-center space-y-3">
                      <div className="w-10 h-10 border border-emerald-800 bg-emerald-950/30 flex items-center justify-center mx-auto text-emerald-500">
                        <Shield className="w-5 h-5" />
                      </div>
                      <p className="text-xs text-neutral-300 font-bold">
                        No Guards mined yet in Epoch 1.
                      </p>
                      <p className="text-[11px] text-neutral-500 max-w-xs mx-auto">
                        Be the first to start the rig and mint Robin Guard #0001!
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-2.5 max-h-[380px] overflow-y-auto pr-1">
                      {guards.map((guard) => (
                        <div
                          key={guard.id}
                          onClick={() => setInspectedGuard(guard)}
                          className="p-2.5 border border-emerald-900/70 hover:border-[#00ff88] bg-[#080a08] flex items-center justify-between cursor-pointer transition-all group"
                        >
                          <div className="flex items-center gap-3">
                            <img
                              src={guard.image}
                              alt={guard.name}
                              className="w-10 h-10 border border-emerald-800 object-cover pixelated"
                            />
                            <div>
                              <div className="flex items-center gap-1.5">
                                <span className="font-pixel text-xs text-white group-hover:text-[#00ff88]">
                                  {guard.id}
                                </span>
                                <span className="text-[9px] border border-emerald-800 px-1 text-emerald-400">
                                  {guard.rarity}
                                </span>
                              </div>
                              <span className="block text-[10px] text-neutral-500 font-mono">
                                By: {shortenAddress(guard.minedBy)}
                              </span>
                            </div>
                          </div>
                          <div className="text-right">
                            <span className="text-xs font-bold text-[#00ff88]">{guard.power} H-PWR</span>
                            <span className="block text-[9px] text-neutral-500">50 $GUARD/hr</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="pt-4 border-t border-emerald-900/60 mt-4 text-[10px] text-neutral-500 flex items-center justify-between">
                  <span>Network: Robinhood Chain L2</span>
                  <span>Target: 1.0 bits</span>
                </div>
              </div>
            </div>

            {/* Step Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-8">
              {[
                { n: '1', t: 'CONNECT', d: 'Connect wallet to Robinhood Chain with fractional ETH.', ic: Wallet, tag: 'WEB3' },
                { n: '2', t: 'MINE', d: 'Press Start. GPU calculates SHA3 nonces to discover Guard.', ic: Cpu, tag: 'POW' },
                { n: '3', t: 'CLAIM', d: 'Confirm the mint transaction in your wallet for $5.00.', ic: Trophy, tag: '$5.00' },
                { n: '4', t: 'STAKE & EARN', d: 'Stake your Guard to farm 50 $GUARD/hr before launch.', ic: Coins, tag: '50/HR' },
              ].map((s, idx) => {
                const Icon = s.ic;
                return (
                  <div
                    key={idx}
                    onClick={() => {
                      if (idx === 0 && !wallet.isConnected) setIsWalletModalOpen(true);
                      else if (idx === 3) setActiveTab('STAKING');
                    }}
                    className="border border-emerald-900/80 hover:border-[#00ff88] bg-[#0c130e] p-4 cursor-pointer transition-all group"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-pixel text-xs text-[#00ff88]">0{s.n}</span>
                      <Icon className="w-4 h-4 text-emerald-500 group-hover:text-[#00ff88]" />
                    </div>
                    <h3 className="font-pixel text-xs text-white group-hover:text-[#00ff88] mb-1">{s.t}</h3>
                    <p className="font-mono text-xs text-neutral-400">{s.d}</p>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* TAB 2: STAKING */}
        {activeTab === 'STAKING' && (
          <div className="space-y-6">
            <div className="border border-emerald-900/80 bg-[#0c130e] p-5 sm:p-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-emerald-900/60 pb-4 mb-5">
                <div>
                  <h2 className="font-pixel text-base sm:text-lg text-white">STAKE YOUR ROBIN GUARD</h2>
                  <p className="text-xs text-neutral-400 mt-1">
                    Stake your Robin Guard NFTs into the non-custodial vault to farm 50 $GUARD/hr per guard.
                  </p>
                </div>
                <span className="text-[10px] text-[#00ff88] border border-emerald-800 px-2 py-1 bg-emerald-950/40 uppercase">
                  NON-CUSTODIAL VAULT
                </span>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                <div className="border border-emerald-950 bg-[#080a08] p-3.5">
                  <span className="text-[10px] text-emerald-500 uppercase block">STAKED GUARDS</span>
                  <div className="flex items-center gap-2 mt-1">
                    <Shield className="w-4 h-4 text-[#00ff88]" />
                    <span className="text-xl font-bold text-white tabular-nums">{stakedCount}</span>
                  </div>
                  <span className="text-[10px] text-neutral-500 mt-1 block">{userGuards.length} Total Owned</span>
                </div>

                <div className="border border-emerald-950 bg-[#080a08] p-3.5">
                  <span className="text-[10px] text-emerald-500 uppercase block">EARNING RATE</span>
                  <div className="flex items-center gap-2 mt-1">
                    <Zap className="w-4 h-4 text-[#a3e635]" />
                    <span className="text-xl font-bold text-[#a3e635] tabular-nums">{stakedCount * 50} $GUARD/hr</span>
                  </div>
                  <span className="text-[10px] text-neutral-500 mt-1 block">50 per Guard / hr</span>
                </div>

                <div className="border border-emerald-950 bg-[#080a08] p-3.5">
                  <span className="text-[10px] text-emerald-500 uppercase block">UNCLAIMED $GUARD</span>
                  <div className="flex items-center gap-2 mt-1">
                    <Coins className="w-4 h-4 text-[#00ff88]" />
                    <span className="text-xl font-bold text-[#00ff88] tabular-nums">{unclaimedGuard.toFixed(2)}</span>
                  </div>
                  <span className="text-[10px] text-neutral-500 mt-1 block">Accumulating Live</span>
                </div>

                <div className="border border-emerald-950 bg-[#080a08] p-3.5">
                  <span className="text-[10px] text-emerald-500 uppercase block">ESTIMATED VALUE</span>
                  <div className="flex items-center gap-2 mt-1">
                    <TrendingUp className="w-4 h-4 text-white" />
                    <span className="text-xl font-bold text-white tabular-nums">${(unclaimedGuard * 0.20).toFixed(2)}</span>
                  </div>
                  <span className="text-[10px] text-neutral-500 mt-1 block">Listing: $0.20 / $GUARD</span>
                </div>
              </div>

              {/* Actions */}
              <div className="flex flex-wrap items-center gap-3 border-b border-emerald-900/60 pb-5 mb-5">
                <button
                  onClick={handleClaimTokens}
                  disabled={unclaimedGuard <= 0}
                  className={`px-4 py-2 font-pixel text-xs uppercase cursor-pointer border ${
                    unclaimedGuard > 0
                      ? 'border-[#00ff88] bg-[#00ff88] text-black hover:bg-[#00ff88]/90'
                      : 'border-emerald-950 bg-[#080a08] text-neutral-600 cursor-not-allowed'
                  }`}
                >
                  CLAIM {unclaimedGuard > 0 ? `${unclaimedGuard.toFixed(2)} $GUARD` : '$GUARD'}
                </button>

                <button
                  onClick={handleStakeAll}
                  disabled={userGuards.length === 0}
                  className="px-4 py-2 font-mono text-xs border border-emerald-800 hover:border-[#00ff88] text-white bg-[#080a08] cursor-pointer"
                >
                  STAKE ALL
                </button>

                <button
                  onClick={handleUnstakeAll}
                  disabled={stakedCount === 0}
                  className="px-4 py-2 font-mono text-xs border border-emerald-900 hover:border-red-500 text-neutral-400 hover:text-red-400 bg-[#080a08] cursor-pointer"
                >
                  UNSTAKE ALL
                </button>
              </div>

              {/* Guards List */}
              {userGuards.length === 0 ? (
                <div className="border border-emerald-950 bg-[#080a08] p-8 text-center space-y-3">
                  <Shield className="w-10 h-10 text-neutral-600 mx-auto" />
                  <p className="text-sm text-neutral-300 font-bold">No Robin Guards detected in your wallet.</p>
                  <p className="text-xs text-neutral-500 max-w-sm mx-auto">
                    Mine a Robin Guard in Epoch 1 to start earning 50 $GUARD per hour.
                  </p>
                  <button
                    onClick={() => setActiveTab('MINE')}
                    className="px-4 py-2 border border-[#00ff88] bg-[#00ff88]/10 text-[#00ff88] hover:bg-[#00ff88] hover:text-black font-pixel text-xs cursor-pointer"
                  >
                    GO TO MINE TAB
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  {userGuards.map((guard) => (
                    <div key={guard.id} className="border border-emerald-900/80 bg-[#080a08] p-3 flex flex-col justify-between">
                      <div>
                        <div className="aspect-square bg-black border border-emerald-800 overflow-hidden mb-2 relative">
                          <img src={guard.image} alt={guard.name} className="w-full h-full object-cover pixelated" />
                          {guard.isStaked && (
                            <span className="absolute top-2 left-2 bg-[#00ff88] text-black font-pixel text-[7px] px-1 py-0.5 font-bold">
                              STAKED
                            </span>
                          )}
                          <span className="absolute top-2 right-2 bg-black/80 border border-emerald-800 text-emerald-400 font-mono text-[9px] px-1">
                            {guard.rarity}
                          </span>
                        </div>
                        <div className="flex items-center justify-between text-xs">
                          <span className="font-pixel text-white">{guard.id}</span>
                          <span className="text-[#00ff88] font-bold">{guard.power} H-PWR</span>
                        </div>
                        <div className="text-[10px] text-emerald-500 mt-1">Yield: 50 $GUARD/hr</div>
                      </div>

                      <button
                        onClick={() => handleToggleStake(guard.id)}
                        className={`w-full py-1.5 mt-3 border font-mono text-xs uppercase cursor-pointer ${
                          guard.isStaked
                            ? 'border-red-500/70 text-red-400 hover:bg-red-500/15'
                            : 'border-[#00ff88] text-[#00ff88] hover:bg-[#00ff88]/15'
                        }`}
                      >
                        {guard.isStaked ? 'UNSTAKE' : 'STAKE GUARD'}
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB 3: $GUARD TOKEN */}
        {activeTab === 'GUARD_TOKEN' && (
          <div className="space-y-6">
            <div className="border border-emerald-900/80 bg-[#0c130e] p-5 sm:p-6 space-y-6">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-emerald-900/60 pb-5">
                <div>
                  <h2 className="font-pixel text-base sm:text-lg text-white">$GUARD TOKENOMICS</h2>
                  <p className="text-xs text-neutral-400 mt-1">
                    The native reward and governance token for the Robin Guard ecosystem. Fairly distributed exclusively via Proof-of-Work NFT staking.
                  </p>
                </div>
                <div className="flex items-center gap-2 bg-[#080a08] border border-emerald-900 px-3 py-1.5 text-xs text-emerald-400">
                  <span className="w-2 h-2 rounded-none bg-[#00ff88] animate-pulse"></span>
                  <span>FAIR LAUNCH: SEP 26, 2026 06:00 UTC+4</span>
                </div>
              </div>

              {/* Countdown Banner */}
              <div className="border border-emerald-900 bg-[#080a08] p-6 text-center max-w-xl mx-auto shadow-[0_0_20px_rgba(0,255,136,0.15)]">
                <div className="flex items-center justify-center gap-2 text-xs text-emerald-400 uppercase tracking-widest mb-1">
                  <Clock className="w-4 h-4 text-[#00ff88]" />
                  <span>GLOBAL LAUNCH COUNTDOWN (UTC+4)</span>
                </div>
                <div className="font-pixel text-xl sm:text-3xl text-[#00ff88] tracking-widest tabular-nums my-3">
                  {countdown.formatted}
                </div>
                <p className="text-[11px] text-neutral-400">
                  Target: <strong>September 26, 2026 at 06:00:00 AM UTC+4</strong>. All staked $GUARD tokens become claimable and tradeable on DEX pools upon timer expiry.
                </p>
              </div>

              {/* Token Metrics */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="border border-emerald-950 bg-[#080a08] p-3.5">
                  <span className="text-[10px] text-emerald-500 uppercase block">MAX TOTAL SUPPLY</span>
                  <div className="text-lg font-bold text-white mt-1">100,000,000</div>
                  <span className="text-[10px] text-neutral-500">Fixed Cap ERC-20</span>
                </div>

                <div className="border border-emerald-950 bg-[#080a08] p-3.5">
                  <span className="text-[10px] text-emerald-500 uppercase block">INITIAL DEX LISTING</span>
                  <div className="text-lg font-bold text-[#00ff88] mt-1">$0.20 USD</div>
                  <span className="text-[10px] text-neutral-500">Robinhood DEX Pair</span>
                </div>

                <div className="border border-emerald-950 bg-[#080a08] p-3.5">
                  <span className="text-[10px] text-emerald-500 uppercase block">YOUR BALANCE</span>
                  <div className="text-lg font-bold text-[#a3e635] mt-1">{wallet.guardBalance.toFixed(2)} $GUARD</div>
                  <span className="text-[10px] text-neutral-500">In Connected Wallet</span>
                </div>

                <div className="border border-emerald-950 bg-[#080a08] p-3.5">
                  <span className="text-[10px] text-emerald-500 uppercase block">ESTIMATED HOLDING</span>
                  <div className="text-lg font-bold text-white mt-1">${(wallet.guardBalance * 0.20).toFixed(2)}</div>
                  <span className="text-[10px] text-neutral-500">At $0.20 Target Price</span>
                </div>
              </div>

              {/* Token Allocation */}
              <div className="border border-emerald-900/60 bg-[#080a08] p-4 text-xs font-mono">
                <h3 className="font-pixel text-xs text-white mb-3">100% COMMUNITY FAIR DISTRIBUTION</h3>
                <div className="space-y-2">
                  <div className="flex justify-between py-1 border-b border-emerald-950">
                    <span className="text-neutral-400">POW STAKING EMISSIONS (FARMABLE)</span>
                    <span className="text-[#00ff88] font-bold">85% (85,000,000 $GUARD)</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-emerald-950">
                    <span className="text-neutral-400">INITIAL DEX LIQUIDITY POOL</span>
                    <span className="text-white font-bold">15% (15,000,000 $GUARD)</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-emerald-950">
                    <span className="text-neutral-400">TEAM & ADVISORS</span>
                    <span className="text-red-400 font-bold">0% (ZERO ALLOCATION)</span>
                  </div>
                  <div className="flex justify-between py-1">
                    <span className="text-neutral-400">VENTURE CAPITAL / SEED SALE</span>
                    <span className="text-red-400 font-bold">0% (ZERO ALLOCATION)</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 4: HOW IT WORKS */}
        {activeTab === 'HOW_IT_WORKS' && (
          <div className="space-y-6">
            <div className="border border-emerald-900/80 bg-[#0c130e] p-5 sm:p-6 space-y-6">
              <div className="border-b border-emerald-900/60 pb-4">
                <h2 className="font-pixel text-base sm:text-lg text-white">HOW ROBIN GUARD WORKS</h2>
                <p className="text-xs text-neutral-400 mt-1">
                  Robin Guard brings fair Proof-of-Work minting to the Robinhood Chain L2. No bots. No private presales. Only computation.
                </p>
              </div>

              {/* Terminal Flowchart */}
              <div className="bg-[#060a06] border border-emerald-950 p-4 font-mono text-xs text-emerald-400 space-y-2">
                <div className="text-[10px] text-neutral-500 uppercase">&gt; PROOF-OF-WORK PROTOCOL FLOWCHART</div>
                <div className="p-3 bg-black/60 border border-emerald-900/40 text-[11px] leading-relaxed select-text">
                  [1. CLIENT HASHER] --(SHA3 Nonce Loop)---&gt; [2. TARGET MATCH: 1.0 BITS]<br />
                  &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;|&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;|<br />
                  &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;v&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;v<br />
                  [MINT GUARD $5.00 ETH] &lt;--(VERIFY PROOF)-- [L2 SMART CONTRACT]<br />
                  &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;|<br />
                  &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;v<br />
                  [STAKE IN VAULT] =====&gt; [FARM 50 $GUARD / HR] =====&gt; [DEX LISTING SEP 26]
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs font-mono">
                <div className="border border-emerald-950 bg-[#080a08] p-4">
                  <h3 className="font-pixel text-xs text-[#00ff88] mb-2">1. NO GAS WARS</h3>
                  <p className="text-neutral-400">
                    Traditional NFT mints let bots outbid real users with priority fees. Robin Guard requires actual client-side hashing, giving every GPU and CPU an equal chance.
                  </p>
                </div>

                <div className="border border-emerald-950 bg-[#080a08] p-4">
                  <h3 className="font-pixel text-xs text-[#a3e635] mb-2">2. HARDWARE EFFICIENCY</h3>
                  <p className="text-neutral-400">
                    The SHA3-Guard algorithm runs directly inside your browser using WebGL or Multi-Thread CPU workers. No special mining software or command-line tools needed.
                  </p>
                </div>

                <div className="border border-emerald-950 bg-[#080a08] p-4">
                  <h3 className="font-pixel text-xs text-white mb-2">3. GUARANTEED $5.00 PRICE</h3>
                  <p className="text-neutral-400">
                    When you mine a winning nonce, you lock in the mint right for $5.00 in ETH. Claimed guards immediately generate 50 $GUARD per hour in the staking tab.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-emerald-900/60 bg-[#060a06] py-6 mt-12 text-xs font-mono text-emerald-600">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="font-pixel text-[10px] text-white">ROBIN GUARD</span>
            <span>·</span>
            <span>PROOF-OF-WORK NFT PROTOCOL</span>
            <span>·</span>
            <span className="text-[#00ff88]">ROBINHOOD CHAIN</span>
          </div>
          <div className="flex items-center gap-4 text-[11px] text-emerald-500/80">
            <span>EPOCH 1: ACTIVE</span>
            <span>·</span>
            <span>GAS EFFICIENCY: 99.8%</span>
          </div>
        </div>
      </footer>

      {/* INLINE WALLETCONNECT MODAL */}
      {isWalletModalOpen && (
        <WalletModalView
          wallet={wallet}
          onClose={() => setIsWalletModalOpen(false)}
          onConnect={handleConnectMock}
          onDisconnect={handleDisconnect}
          onFaucet={handleFaucet}
        />
      )}

      {/* INSPECT MODAL */}
      {inspectedGuard && (
        <InspectModalView
          guard={inspectedGuard}
          onClose={() => setInspectedGuard(null)}
          onToggleStake={handleToggleStake}
          myAddress={wallet.isConnected ? wallet.address : ''}
        />
      )}

      {/* CLAIM TRANSACTION TOAST MODAL */}
      {isClaimModalOpen && claimTargetGuard && (
        <ClaimToastModalView
          guard={claimTargetGuard}
          onClose={() => setIsClaimModalOpen(false)}
          onSuccess={handleMintSuccess}
        />
      )}
    </div>
  );
}

// --- SUBCOMPONENT: INLINE WALLET MODAL ---
function WalletModalView({
  wallet,
  onClose,
  onConnect,
  onDisconnect,
  onFaucet,
}: {
  wallet: WalletState;
  onClose: () => void;
  onConnect: (name: string) => void;
  onDisconnect: () => void;
  onFaucet: () => void;
}) {
  const [activeView, setActiveView] = useState<'LIST' | 'QR_CODE'>('LIST');
  const [copied, setCopied] = useState(false);
  const [copiedUri, setCopiedUri] = useState(false);
  const [isPairing, setIsPairing] = useState(false);

  const qrUri = `wc:robin-guard-${Date.now()}@2?relay-protocol=irn&chainId=10888`;

  const handleCopyAddr = () => {
    try {
      if (typeof navigator !== 'undefined' && navigator.clipboard) {
        navigator.clipboard.writeText(wallet.address);
      }
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleCopyUri = () => {
    try {
      if (typeof navigator !== 'undefined' && navigator.clipboard) {
        navigator.clipboard.writeText(qrUri);
      }
      setCopiedUri(true);
      setTimeout(() => setCopiedUri(false), 2000);
    } catch {
      setCopiedUri(true);
      setTimeout(() => setCopiedUri(false), 2000);
    }
  };

  const handleAutoPair = () => {
    setIsPairing(true);
    setTimeout(() => {
      setIsPairing(false);
      onConnect('WalletConnect Mobile');
    }, 1000);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="relative w-full max-w-md border border-emerald-500/50 bg-[#0c0f0e] p-6 shadow-2xl shadow-emerald-900/30 font-mono my-auto max-h-[calc(100vh-2rem)] overflow-y-auto">
        <div className="flex items-center justify-between border-b border-emerald-900/60 pb-3 mb-5">
          <div className="flex items-center gap-2">
            {activeView === 'QR_CODE' && !wallet.isConnected ? (
              <button onClick={() => setActiveView('LIST')} className="text-neutral-400 hover:text-white p-1 cursor-pointer">
                <ArrowLeft className="w-4 h-4" />
              </button>
            ) : (
              <Shield className="w-4 h-4 text-[#00ff88]" />
            )}
            <span className="font-pixel text-xs text-white">
              {wallet.isConnected ? 'ROBINHOOD WALLET' : activeView === 'QR_CODE' ? 'WALLETCONNECT QR' : 'CONNECT WEB3 WALLET'}
            </span>
          </div>
          <button
            onClick={onClose}
            className="text-neutral-400 hover:text-white font-mono text-sm px-2 py-0.5 border border-emerald-900 hover:border-emerald-700 cursor-pointer"
          >
            [X]
          </button>
        </div>

        {wallet.isConnected ? (
          <div className="space-y-4 text-xs">
            <div className="bg-[#080a08] p-3.5 border border-emerald-900/60">
              <div className="flex items-center justify-between text-[10px] text-emerald-500 uppercase mb-1">
                <span>ACTIVE WALLET</span>
                <span className="flex items-center gap-1.5 text-[#00ff88]">
                  <span className="w-2 h-2 rounded-none bg-[#00ff88] animate-pulse"></span>
                  Robinhood Chain L2
                </span>
              </div>
              <div className="flex items-center justify-between text-neutral-200 break-all font-mono text-xs">
                <span className="font-bold text-white">{wallet.address}</span>
                <button onClick={handleCopyAddr} className="p-1 hover:text-[#00ff88] text-neutral-400 ml-2 cursor-pointer flex-shrink-0">
                  {copied ? <Check className="w-4 h-4 text-[#00ff88]" /> : <Copy className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 bg-[#080a08] border border-emerald-900/60">
                <div className="text-neutral-500 text-[10px] uppercase">NATIVE BALANCE</div>
                <div className="text-sm font-bold text-white mt-1 tabular-nums">{wallet.ethBalance.toFixed(4)} ETH</div>
              </div>
              <div className="p-3 bg-[#080a08] border border-emerald-900/60">
                <div className="text-neutral-500 text-[10px] uppercase">$GUARD BALANCE</div>
                <div className="text-sm font-bold text-[#00ff88] mt-1 tabular-nums">{wallet.guardBalance.toFixed(2)} $GUARD</div>
              </div>
            </div>

            <div className="p-2.5 bg-emerald-950/20 border border-emerald-900/60 text-[11px] text-neutral-300 space-y-1">
              <div className="flex justify-between">
                <span className="text-neutral-500">NETWORK:</span>
                <span className="text-[#00ff88]">Robinhood Chain L2 (ID: 10888)</span>
              </div>
              <div className="flex justify-between">
                <span className="text-neutral-500">GAS ASSET:</span>
                <span className="text-white">Ether (ETH)</span>
              </div>
            </div>

            <div className="pt-2 flex items-center justify-between gap-3">
              <button
                onClick={onFaucet}
                className="flex-1 py-2 px-3 border border-[#a3e635] text-[#a3e635] hover:bg-[#a3e635]/10 text-xs font-mono cursor-pointer"
              >
                + FAUCET (+0.1 ETH)
              </button>
              <button
                onClick={onDisconnect}
                className="py-2 px-3 border border-red-500/70 text-red-400 hover:bg-red-500/10 text-xs font-mono cursor-pointer flex items-center gap-1.5 justify-center"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>DISCONNECT</span>
              </button>
            </div>
          </div>
        ) : activeView === 'QR_CODE' ? (
          <div className="space-y-4 text-center">
            <div className="p-4 bg-[#080a08] border border-emerald-900/80 inline-block mx-auto relative shadow-[0_0_20px_rgba(0,255,136,0.2)]">
              {/* Retro Pixel QR Graphic */}
              <div className="w-48 h-48 sm:w-56 sm:h-56 bg-black border-2 border-[#00ff88] p-3 flex flex-col items-center justify-center relative select-none">
                <div className="absolute top-2 left-2 w-6 h-6 border-2 border-[#00ff88] p-0.5">
                  <div className="w-full h-full bg-[#00ff88]"></div>
                </div>
                <div className="absolute top-2 right-2 w-6 h-6 border-2 border-[#00ff88] p-0.5">
                  <div className="w-full h-full bg-[#00ff88]"></div>
                </div>
                <div className="absolute bottom-2 left-2 w-6 h-6 border-2 border-[#00ff88] p-0.5">
                  <div className="w-full h-full bg-[#00ff88]"></div>
                </div>
                <div className="grid grid-cols-7 gap-1.5 p-2 bg-[#040804]">
                  {Array.from({ length: 49 }).map((_, i) => (
                    <div
                      key={i}
                      className={`w-3.5 h-3.5 ${
                        (i % 2 === 0 && (i % 3 === 0 || i % 5 === 0)) || i === 24
                          ? 'bg-[#00ff88] shadow-[0_0_4px_#00ff88]'
                          : (i * 7) % 4 === 0
                          ? 'bg-[#a3e635]'
                          : 'bg-emerald-950/30'
                      }`}
                    />
                  ))}
                </div>
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <div className="px-2 py-0.5 bg-black border border-[#00ff88] text-[9px] font-pixel text-[#00ff88]">
                    SCAN QR
                  </div>
                </div>
              </div>
              <div className="text-[10px] text-emerald-500 font-mono mt-2">Robinhood Chain L2 · EVM Gas ETH</div>
            </div>

            <p className="text-xs text-neutral-300 font-mono">
              Scan with <strong>Trust Wallet</strong>, <strong>Rainbow</strong>, or <strong>MetaMask Mobile</strong>.
            </p>

            <div className="flex items-center gap-2">
              <button
                onClick={handleCopyUri}
                className="flex-1 py-2 px-3 border border-emerald-800 hover:border-[#00ff88] text-neutral-300 hover:text-white bg-[#080a08] text-xs font-mono flex items-center justify-center gap-1.5 cursor-pointer"
              >
                {copiedUri ? <Check className="w-3.5 h-3.5 text-[#00ff88]" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedUri ? 'URI COPIED!' : 'COPY WC URI'}</span>
              </button>
              <button
                onClick={handleAutoPair}
                disabled={isPairing}
                className="flex-1 py-2 px-3 border border-[#00ff88] bg-[#00ff88]/15 hover:bg-[#00ff88]/25 text-[#00ff88] text-xs font-mono font-bold flex items-center justify-center gap-1.5 cursor-pointer"
              >
                {isPairing ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-3.5 h-3.5" />}
                <span>{isPairing ? 'PAIRING...' : 'AUTO PAIR'}</span>
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            <button
              onClick={() => setActiveView('QR_CODE')}
              className="w-full py-3 px-4 border-2 border-[#00ff88] bg-[#00ff88] text-black font-pixel text-xs tracking-wider uppercase font-bold hover:bg-[#00ff88]/90 cursor-pointer shadow-[0_0_20px_rgba(0,255,136,0.35)] flex items-center justify-center gap-2.5"
            >
              <QrCode className="w-4 h-4 text-black" />
              <span>WALLETCONNECT QR CODE</span>
            </button>

            <div className="flex items-center gap-3 my-2 text-[10px] text-neutral-500 uppercase">
              <div className="h-[1px] bg-emerald-950 flex-1"></div>
              <span>OR CONNECT BROWSER WALLET</span>
              <div className="h-[1px] bg-emerald-950 flex-1"></div>
            </div>

            <div className="space-y-2">
              {[
                { name: 'METAMASK', icon: '🦊', desc: 'Browser Extension & Mobile Injected' },
                { name: 'RABBY WALLET', icon: '🐰', desc: 'Game-ready Web3 Security Wallet' },
                { name: 'COINBASE WALLET', icon: '🔵', desc: 'Coinbase Wallet Extension / App' },
              ].map((w) => (
                <button
                  key={w.name}
                  onClick={() => onConnect(w.name)}
                  className="w-full p-2.5 border border-emerald-900/80 hover:border-[#00ff88] bg-[#080a08] hover:bg-[#0e1810] text-left flex items-center justify-between cursor-pointer transition-all group"
                >
                  <div className="flex items-center gap-2.5">
                    <div className="w-7 h-7 border border-emerald-800 group-hover:border-[#00ff88] bg-emerald-950/40 flex items-center justify-center text-xs">
                      {w.icon}
                    </div>
                    <div>
                      <span className="font-pixel text-xs text-white group-hover:text-[#00ff88]">{w.name}</span>
                      <span className="block text-[10px] text-neutral-500 font-mono">{w.desc}</span>
                    </div>
                  </div>
                  <ArrowRight className="w-4 h-4 text-emerald-600 group-hover:text-[#00ff88]" />
                </button>
              ))}

              <button
                onClick={() => onConnect('Robinhood Demo Sandbox')}
                className="w-full p-2.5 border border-dashed border-[#a3e635]/60 hover:border-[#a3e635] bg-[#a3e635]/5 hover:bg-[#a3e635]/15 text-left flex items-center justify-between cursor-pointer transition-all group"
              >
                <div className="flex items-center gap-2.5">
                  <div className="w-7 h-7 border border-[#a3e635] bg-[#a3e635]/20 text-[#a3e635] flex items-center justify-center font-pixel text-[9px] font-bold">
                    DEMO
                  </div>
                  <div>
                    <span className="font-pixel text-xs text-[#a3e635]">ROBINHOOD DEMO ACCOUNT</span>
                    <span className="block text-[10px] text-neutral-400 font-mono">1-Click Instant Sandbox on Robinhood Chain L2</span>
                  </div>
                </div>
                <Sparkles className="w-4 h-4 text-[#a3e635]" />
              </button>
            </div>

            <div className="pt-2 text-[10px] text-neutral-500 text-center border-t border-emerald-950 font-mono">
              Target Network: Robinhood Chain L2 (EVM, Native Gas ETH)
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// --- SUBCOMPONENT: INSPECT MODAL ---
function InspectModalView({
  guard,
  onClose,
  onToggleStake,
  myAddress,
}: {
  guard: RobinGuardNFT;
  onClose: () => void;
  onToggleStake: (id: string) => void;
  myAddress: string;
}) {
  const [copied, setCopied] = useState(false);
  const isOwner = guard.isOwner || (myAddress && guard.minedBy.toLowerCase() === myAddress.toLowerCase());

  const handleCopy = () => {
    try {
      if (typeof navigator !== 'undefined' && navigator.clipboard) {
        navigator.clipboard.writeText(guard.hash);
      }
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="relative w-full max-w-xl border border-emerald-500/50 bg-[#0c0f0e] p-5 sm:p-6 shadow-2xl shadow-emerald-900/30 my-auto font-mono max-h-[calc(100vh-2rem)] overflow-y-auto">
        <div className="flex items-center justify-between border-b border-emerald-900/60 pb-3 mb-5">
          <div className="flex items-center gap-2">
            <span className="font-pixel text-xs text-[#00ff88]">&gt; GUARD INSPECTION</span>
            <span className="text-emerald-500 font-mono text-xs">/ {guard.id}</span>
          </div>
          <button onClick={onClose} className="text-neutral-400 hover:text-white font-mono text-sm px-2 py-0.5 border border-emerald-900">
            [X]
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <div className="border border-emerald-900/70 bg-[#080a08] p-2 flex flex-col items-center justify-center">
            <img src={guard.image} alt={guard.name} className="w-full aspect-square object-cover pixelated border border-emerald-900 mb-2" />
            <div className="flex items-center justify-between w-full text-xs font-mono">
              <span className="text-[#00ff88] font-bold">{guard.power} HASH-PWR</span>
              <span className="text-neutral-400 font-pixel text-[10px]">{guard.rarity}</span>
            </div>
          </div>

          <div className="space-y-3 text-xs">
            <div className="p-2.5 bg-[#080a08] border border-emerald-950">
              <span className="text-[10px] text-emerald-500 uppercase block">CRYPTOGRAPHIC PROOF</span>
              <div className="flex items-center justify-between font-mono text-[11px] text-white mt-1 break-all">
                <span>{guard.hash.slice(0, 18)}...{guard.hash.slice(-10)}</span>
                <button onClick={handleCopy} className="p-1 hover:text-[#00ff88] text-neutral-400 cursor-pointer">
                  {copied ? <Check className="w-3.5 h-3.5 text-[#00ff88]" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 text-[11px]">
              <div className="p-2 bg-[#080a08] border border-emerald-950">
                <span className="text-neutral-500 block">EPOCH</span>
                <span className="text-white font-bold">Epoch {guard.epoch}</span>
              </div>
              <div className="p-2 bg-[#080a08] border border-emerald-950">
                <span className="text-neutral-500 block">FARMING YIELD</span>
                <span className="text-[#00ff88] font-bold">50 $GUARD/hr</span>
              </div>
            </div>

            <div className="p-2.5 bg-[#080a08] border border-emerald-950 text-[11px]">
              <span className="text-neutral-500 block">MINED BY</span>
              <span className="text-white font-bold">{guard.minedBy}</span>
            </div>

            {isOwner && (
              <button
                onClick={() => onToggleStake(guard.id)}
                className={`w-full py-2.5 border font-mono text-xs font-bold uppercase cursor-pointer ${
                  guard.isStaked
                    ? 'border-red-500/80 text-red-400 hover:bg-red-500/10'
                    : 'border-[#00ff88] bg-[#00ff88]/10 text-[#00ff88] hover:bg-[#00ff88] hover:text-black'
                }`}
              >
                {guard.isStaked ? 'UNSTAKE FROM VAULT' : 'STAKE IN VAULT (50 $GUARD/HR)'}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// --- SUBCOMPONENT: CLAIM TOAST MODAL ---
function ClaimToastModalView({
  guard,
  onClose,
  onSuccess,
}: {
  guard: RobinGuardNFT;
  onClose: () => void;
  onSuccess: () => void;
}) {
  const [stage, setStage] = useState<'PENDING' | 'CONFIRMED'>('PENDING');

  useEffect(() => {
    sound.playBlip(600, 'square', 0.08);
    const timer = setTimeout(() => {
      setStage('CONFIRMED');
      sound.playWinFanfare();
    }, 1500);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4"
      onClick={(e) => {
        if (e.target === e.currentTarget && stage === 'CONFIRMED') onClose();
      }}
    >
      <div className="relative w-full max-w-md border border-emerald-500/50 bg-[#0c0f0e] p-6 shadow-2xl shadow-emerald-900/30 font-mono my-auto text-center max-h-[calc(100vh-2rem)] overflow-y-auto">
        <div className="absolute top-2 left-2 text-[9px] text-[#00ff88]/60 font-mono">[WEB3_RPC_MINT]</div>
        <div className="absolute top-2 right-2 text-[9px] text-[#00ff88]/60 font-mono">[CHAIN_ID: 10888]</div>

        {stage === 'PENDING' ? (
          <div className="space-y-4 py-3">
            <div className="w-14 h-14 border border-[#00ff88] bg-[#00ff88]/10 flex items-center justify-center mx-auto shadow-[0_0_15px_rgba(0,255,136,0.3)]">
              <Loader2 className="w-8 h-8 text-[#00ff88] animate-spin" />
            </div>
            <div>
              <h3 className="font-pixel text-sm text-white">SUBMITTING MINT TX</h3>
              <p className="text-xs text-neutral-400 mt-1">Proof-of-Work verified. Minting Robin Guard on Robinhood Chain L2...</p>
            </div>
            <div className="text-[10px] text-emerald-500/80 bg-[#080a08] p-2 border border-emerald-950 font-mono">
              GAS: 0.0018 ETH ($5.00) · TARGET: 1.0 bits
            </div>
          </div>
        ) : (
          <div className="space-y-4 py-2">
            <div className="w-14 h-14 border border-[#00ff88] bg-[#00ff88] text-black flex items-center justify-center mx-auto shadow-[0_0_20px_rgba(0,255,136,0.6)]">
              <Trophy className="w-8 h-8" />
            </div>

            <div>
              <span className="font-pixel text-[10px] text-[#a3e635] uppercase block mb-1">MINT CONFIRMED ON L2!</span>
              <h3 className="font-pixel text-base text-white">{guard.name}</h3>
              <p className="text-xs text-emerald-400 font-mono mt-1">Successfully minted to your wallet address!</p>
            </div>

            <div className="p-3 bg-[#080a08] border border-emerald-900/70 text-left text-xs font-mono space-y-1">
              <div className="flex justify-between">
                <span className="text-neutral-500">TOKEN ID:</span>
                <span className="text-white font-bold">{guard.id}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-neutral-500">RARITY:</span>
                <span className="text-[#a3e635] font-bold">{guard.rarity}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-neutral-500">HASH POWER:</span>
                <span className="text-[#00ff88] font-bold">{guard.power} H-PWR</span>
              </div>
              <div className="flex justify-between">
                <span className="text-neutral-500">STAKING YIELD:</span>
                <span className="text-[#00ff88] font-bold">50 $GUARD / hr</span>
              </div>
            </div>

            <button
              onClick={onSuccess}
              className="w-full py-3 px-4 font-pixel text-xs border-2 border-[#00ff88] bg-[#00ff88] text-black uppercase font-bold hover:bg-[#00ff88]/90 cursor-pointer shadow-[0_0_15px_rgba(0,255,136,0.4)]"
            >
              COLLECT GUARD & CONTINUE
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
