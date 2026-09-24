'use client';

import React from 'react';
import { Terminal, Shield, Cpu, HelpCircle, Coins, Trophy, Wallet } from 'lucide-react';

export const HowItWorksTab: React.FC = () => {
  const steps = [
    {
      num: '1',
      title: 'CONNECT',
      desc: 'Connect wallet to Robinhood Chain with a fraction of ETH for gas.',
      icon: Wallet,
      accent: '#00ff88',
    },
    {
      num: '2',
      title: 'MINE',
      desc: 'Press Start. Your GPU calculates hashes until a Robin Guard is found.',
      icon: Cpu,
      accent: '#059669',
    },
    {
      num: '3',
      title: 'CLAIM',
      desc: 'Confirm the mint transaction in your wallet for $5.00.',
      icon: Trophy,
      accent: '#a3e635',
    },
    {
      num: '4',
      title: 'STAKE & EARN',
      desc: 'Stake your Guard to farm 50 $GUARD/hr before the official token launch.',
      icon: Coins,
      accent: '#00ff88',
    },
  ];

  return (
    <div className="space-y-6">
      {/* 4 Step Cards as specified */}
      <div className="border border-emerald-900/60 bg-[#0c130e] p-5 sm:p-6">
        <div className="flex items-center justify-between border-b border-emerald-900/60 pb-3 mb-5">
          <div className="flex items-center gap-2">
            <Shield className="w-4 h-4 text-[#00ff88]" />
            <h2 className="font-pixel text-sm sm:text-base text-white">
              HOW ROBIN GUARD WORKS
            </h2>
          </div>
          <span className="text-[10px] text-emerald-400 font-mono">
            4-STAGE CYCLE
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {steps.map((step) => {
            const Icon = step.icon;
            return (
              <div
                key={step.num}
                className="border border-emerald-950 bg-[#080a08] p-4 relative"
              >
                <div
                  className="absolute top-0 left-0 right-0 h-[2px]"
                  style={{ backgroundColor: step.accent }}
                />
                <div className="flex items-center justify-between mb-3">
                  <span
                    className="font-pixel text-sm font-bold"
                    style={{ color: step.accent }}
                  >
                    {step.num}. {step.title}
                  </span>
                  <div
                    className="p-1.5 border border-emerald-900 bg-[#0c130e]"
                    style={{ color: step.accent }}
                  >
                    <Icon className="w-4 h-4" />
                  </div>
                </div>
                <p className="font-mono text-xs text-neutral-300 leading-relaxed">
                  {step.desc}
                </p>
              </div>
            );
          })}
        </div>
      </div>

      {/* ASCII Consensus Architecture Diagram */}
      <div className="border border-emerald-900/60 bg-[#080a08] p-4 sm:p-6 font-mono">
        <div className="flex items-center justify-between border-b border-emerald-900/60 pb-3 mb-4">
          <div className="flex items-center gap-2">
            <Terminal className="w-4 h-4 text-[#00ff88]" />
            <span className="font-pixel text-xs text-white">
              POW CONSENSUS & MINING TOPOLOGY
            </span>
          </div>
          <span className="text-[10px] text-[#00ff88]">ALGO: SHA3-GUARD</span>
        </div>

        {/* ASCII Flowchart */}
        <pre className="text-[11px] sm:text-xs text-[#00ff88] overflow-x-auto p-3 bg-[#050805] border border-emerald-950 leading-relaxed font-mono">
{`
+------------------+         +-------------------+         +-------------------+
|  BROWSER CLIENT  |         |   POW VALIDATION  |         |  ROBINHOOD CHAIN  |
|  (CPU/GPU RIG)   | ------> |  [NONCE MATCHED]  | ------> |  SMART CONTRACT   |
+------------------+         +-------------------+         +-------------------+
        |                              |                             |
        | [SHA-3 Guard Hashes]         | [Target <= 1.0 bits]        | [Verify & Claim]
        v                              v                             v
+------------------+         +-------------------+         +-------------------+
|  DIFFICULTY 1.0  |         |   MINT CLAIM TX   |         |  ROBIN GUARD NFT  |
|  (Scaled/Epoch)  |         |   ($5.00 In ETH)  |         |  FARM: 50 $GUARD  |
+------------------+         +-------------------+         +-------------------+
`}
        </pre>
      </div>

      {/* Frequently Asked Inquiries */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div className="border border-emerald-900/60 bg-[#0c130e] p-5">
          <div className="flex items-center gap-2 mb-2">
            <HelpCircle className="w-4 h-4 text-[#00ff88]" />
            <h3 className="font-pixel text-xs text-white">IS IT REALLY MINED IN MY BROWSER?</h3>
          </div>
          <p className="font-mono text-xs text-neutral-400 leading-relaxed">
            Yes! Robin Guard utilizes WebAssembly and WebGPU parallel workers to perform genuine cryptographic SHA3 hashing right in your browser tab. No specialized mining rig is needed.
          </p>
        </div>

        <div className="border border-emerald-900/60 bg-[#0c130e] p-5">
          <div className="flex items-center gap-2 mb-2">
            <HelpCircle className="w-4 h-4 text-[#a3e635]" />
            <h3 className="font-pixel text-xs text-white">HOW DOES THE $5.00 MINT WORK?</h3>
          </div>
          <p className="font-mono text-xs text-neutral-400 leading-relaxed">
            When your rig finds a valid target nonce, you confirm the mint transaction directly with your Web3 wallet for $5.00 worth of ETH. Your newly minted Robin Guard is immediately deposited to your address and ready to stake.
          </p>
        </div>
      </div>
    </div>
  );
};
