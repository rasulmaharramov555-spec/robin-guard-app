'use client';

import React from 'react';
import { sound } from '../utils/audio';
import { Wallet, Cpu, Trophy, Coins } from 'lucide-react';

interface StepCardsProps {
  onStepClick?: (stepIndex: number) => void;
}

export const StepCards: React.FC<StepCardsProps> = ({ onStepClick }) => {
  const steps = [
    {
      num: '1',
      title: 'CONNECT',
      desc: 'Connect wallet to Robinhood Chain with a fraction of ETH for gas.',
      accent: '#00ff88',
      icon: Wallet,
      tag: 'WEB3 WALLET',
    },
    {
      num: '2',
      title: 'MINE',
      desc: 'Press Start. Your GPU calculates hashes until a Robin Guard is found.',
      accent: '#059669',
      icon: Cpu,
      tag: 'BROWSER POW',
    },
    {
      num: '3',
      title: 'CLAIM',
      desc: 'Confirm the mint transaction in your wallet for $5.00.',
      accent: '#a3e635',
      icon: Trophy,
      tag: 'FAIR MINT',
    },
    {
      num: '4',
      title: 'STAKE & EARN',
      desc: 'Stake your Guard to farm 50 $GUARD/hr before the official token launch.',
      accent: '#00ff88',
      icon: Coins,
      tag: '50 $GUARD / HR',
    },
  ];

  return (
    <div className="mt-8 sm:mt-12">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <span className="font-pixel text-xs text-[#00ff88]">&gt; PROTOCOL ROADMAP</span>
          <span className="text-emerald-600 font-mono text-xs">/ 4-STEP GUARD CYCLE</span>
        </div>
        <span className="text-[10px] font-mono text-emerald-500 hidden sm:inline">
          PROVABLE PROOF-OF-WORK CONSENSUS
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {steps.map((step, idx) => {
          const Icon = step.icon;
          return (
            <div
              key={step.num}
              onClick={() => {
                sound.playBlip(480 + idx * 60, 'triangle', 0.04);
                if (onStepClick) onStepClick(idx);
              }}
              className="border border-emerald-900/60 bg-[#0c130e] hover:border-[#00ff88] p-4 relative group cursor-pointer transition-all hover:-translate-y-0.5"
            >
              {/* Accent top stripe */}
              <div
                className="absolute top-0 left-0 right-0 h-[2px] opacity-80 group-hover:opacity-100 transition-opacity"
                style={{ backgroundColor: step.accent }}
              />

              <div className="flex items-center justify-between mb-3">
                <span
                  className="font-pixel text-sm font-bold"
                  style={{ color: step.accent }}
                >
                  {step.num} {step.title}
                </span>

                <div
                  className="p-1.5 border border-emerald-900 bg-[#080a08]"
                  style={{ color: step.accent }}
                >
                  <Icon className="w-4 h-4" />
                </div>
              </div>

              <p className="font-mono text-xs text-neutral-400 leading-relaxed mb-3">
                {step.desc}
              </p>

              <div className="flex items-center justify-between text-[10px] font-mono pt-2 border-t border-emerald-950">
                <span className="text-emerald-500/80">{step.tag}</span>
                <span className="text-emerald-600 group-hover:text-emerald-300 transition-colors">
                  STEP 0{step.num} &gt;
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
