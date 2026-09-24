'use client';

import React from 'react';
import { WalletState } from '../types';
import { useLaunchCountdown } from '../hooks/useLaunchCountdown';
import { Clock, TrendingUp, ShieldCheck, Lock } from 'lucide-react';

interface GuardTokenTabProps {
  wallet: WalletState;
  onConnectWallet: () => void;
}

export const GuardTokenTab: React.FC<GuardTokenTabProps> = ({
  wallet,
  onConnectWallet,
}) => {
  // Global fixed launch countdown: September 26, 2026 at 06:00:00 AM UTC+4
  const { formatted, days, hours, minutes, seconds } = useLaunchCountdown();

  return (
    <div className="space-y-6">
      {/* Token Info Banner: "$GUARD TOKENOMICS" */}
      <div className="border border-emerald-900/60 bg-[#0c130e] p-5 sm:p-6 relative">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-emerald-900/60 pb-5 mb-5">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="font-pixel text-base sm:text-lg text-white">
                $GUARD TOKENOMICS
              </h2>
              <span className="text-[10px] text-[#00ff88] border border-emerald-800 px-1.5 py-0.2 bg-emerald-950/40 uppercase font-mono">
                ERC-20 · ROBINHOOD CHAIN
              </span>
            </div>
            <p className="font-mono text-xs sm:text-sm text-neutral-400 mt-1">
              The primary governance and yield token of the Robin Guard ecosystem. Fairly distributed exclusively through Proof-of-Work NFT staking.
            </p>
          </div>

          {/* Launch Status indicator */}
          <div className="flex items-center gap-2 bg-[#080a08] border border-emerald-900 px-3 py-1.5">
            <span className="w-2 h-2 rounded-none bg-[#00ff88] animate-pulse"></span>
            <span className="font-mono text-xs text-emerald-400">FAIR LAUNCH: SEP 26, 2026 06:00 UTC+4</span>
          </div>
        </div>

        {/* Global Fixed Launch Countdown Timer: DDd : HHh : MMm : SSs */}
        <div className="border border-emerald-900/80 bg-[#080a08] p-6 text-center max-w-xl mx-auto mb-6 shadow-[0_0_20px_rgba(0,255,136,0.15)] relative">
          <div className="flex items-center justify-center gap-2 text-xs font-mono text-emerald-400 uppercase tracking-widest mb-2">
            <Clock className="w-4 h-4 text-[#00ff88] animate-spin" style={{ animationDuration: '8s' }} />
            <span>GLOBAL LAUNCH COUNTDOWN (UTC+4)</span>
          </div>

          <div className="font-pixel text-xl sm:text-3xl text-[#00ff88] tracking-widest tabular-nums my-3 drop-shadow-[0_0_14px_rgba(0,255,136,0.45)]">
            {formatted}
          </div>

          <p className="font-mono text-[11px] text-neutral-400 mt-2">
            Target launch date: <strong>September 26, 2026 at 06:00:00 AM (UTC+4)</strong>. All $GUARD staking rewards will become transferable and claimable to DEX pools.
          </p>
        </div>

        {/* Stat Cards:
            * "TOTAL VIRTUAL SUPPLY": 0.00 $GUARD
            * "ESTIMATED LISTING PRICE": $0.20
            * "YOUR BALANCE": 0.00 $GUARD
        */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* TOTAL VIRTUAL SUPPLY */}
          <div className="border border-emerald-950 bg-[#080a08] p-4 text-center sm:text-left">
            <span className="text-[10px] text-emerald-500/90 font-mono uppercase block">
              TOTAL VIRTUAL SUPPLY
            </span>
            <div className="font-mono text-xl sm:text-2xl font-bold text-white mt-1 tabular-nums">
              0.00 $GUARD
            </div>
            <span className="text-[10px] text-neutral-500 font-mono mt-1 block">
              Pre-mint: 0% · 100% Farmed
            </span>
          </div>

          {/* ESTIMATED LISTING PRICE */}
          <div className="border border-emerald-950 bg-[#080a08] p-4 text-center sm:text-left">
            <span className="text-[10px] text-emerald-500/90 font-mono uppercase block">
              ESTIMATED LISTING PRICE
            </span>
            <div className="font-mono text-xl sm:text-2xl font-bold text-[#00ff88] mt-1 tabular-nums flex items-center justify-center sm:justify-start gap-1">
              <TrendingUp className="w-5 h-5" />
              <span>$0.20</span>
            </div>
            <span className="text-[10px] text-neutral-500 font-mono mt-1 block">
              Initial Pool Price Target
            </span>
          </div>

          {/* YOUR BALANCE */}
          <div className="border border-emerald-950 bg-[#080a08] p-4 text-center sm:text-left">
            <span className="text-[10px] text-emerald-500/90 font-mono uppercase block">
              YOUR BALANCE
            </span>
            <div className="font-mono text-xl sm:text-2xl font-bold text-[#a3e635] mt-1 tabular-nums">
              {wallet.guardBalance.toFixed(2)} $GUARD
            </div>
            <span className="text-[10px] text-neutral-500 font-mono mt-1 block">
              {wallet.isConnected ? 'Available in Wallet' : 'Connect Wallet to Sync'}
            </span>
          </div>
        </div>
      </div>

      {/* Token Distribution & Security Architecture */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Token Distribution Model */}
        <div className="border border-emerald-900/60 bg-[#0c130e] p-5">
          <div className="flex items-center gap-2 mb-3 border-b border-emerald-900/60 pb-2">
            <ShieldCheck className="w-4 h-4 text-[#00ff88]" />
            <h3 className="font-pixel text-xs text-white">EMISSION BREAKDOWN</h3>
          </div>

          <div className="space-y-3 font-mono text-xs">
            <div className="flex justify-between items-center py-1 border-b border-emerald-950">
              <span className="text-neutral-400">POW STAKING REWARDS</span>
              <span className="text-[#00ff88] font-bold">85% (85,000,000)</span>
            </div>
            <div className="flex justify-between items-center py-1 border-b border-emerald-950">
              <span className="text-neutral-400">INITIAL DEX LIQUIDITY</span>
              <span className="text-white font-bold">15% (15,000,000)</span>
            </div>
            <div className="flex justify-between items-center py-1 border-b border-emerald-950">
              <span className="text-neutral-400">TEAM / ADVISOR ALLOCATION</span>
              <span className="text-red-400 font-bold">0% (ZERO)</span>
            </div>
            <div className="flex justify-between items-center py-1">
              <span className="text-neutral-400">PRIVATE SALE / INVESTORS</span>
              <span className="text-red-400 font-bold">0% (ZERO)</span>
            </div>
          </div>
        </div>

        {/* Contract Safeguards */}
        <div className="border border-emerald-900/60 bg-[#0c130e] p-5">
          <div className="flex items-center gap-2 mb-3 border-b border-emerald-900/60 pb-2">
            <Lock className="w-4 h-4 text-[#a3e635]" />
            <h3 className="font-pixel text-xs text-white">LAUNCH SAFEGUARDS</h3>
          </div>

          <ul className="space-y-2 font-mono text-xs text-neutral-300">
            <li className="flex items-start gap-2">
              <span className="text-[#00ff88]">&gt;</span>
              <span>Liquidity pair auto-locks for 365 days upon launch execution.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-[#00ff88]">&gt;</span>
              <span>Anti-whale transaction cap: Max 10,000 $GUARD per block during first 2 hours.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-[#00ff88]">&gt;</span>
              <span>Robinhood Chain gas subsidies ensure sub-cent micro-transactions.</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
};
