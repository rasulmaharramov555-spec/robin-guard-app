'use client';

import React, { useState, useEffect } from 'react';
import { RobinGuardNFT } from '../types';
import { sound } from '../utils/audio';
import { Sparkles, Loader2, CheckCircle2, ArrowRight } from 'lucide-react';

interface ClaimToastModalProps {
  guard: RobinGuardNFT | null;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (guard: RobinGuardNFT) => void;
}

export const ClaimToastModal: React.FC<ClaimToastModalProps> = ({
  guard,
  isOpen,
  onClose,
  onSuccess,
}) => {
  const [stage, setStage] = useState<'PENDING' | 'CONFIRMED'>('PENDING');

  useEffect(() => {
    if (isOpen && guard) {
      setStage('PENDING');
      sound.playBlip(600, 'square', 0.08);

      const timer = setTimeout(() => {
        setStage('CONFIRMED');
        sound.playWinFanfare();
      }, 1800);

      return () => clearTimeout(timer);
    }
  }, [isOpen, guard]);

  if (!isOpen || !guard) return null;

  const handleFinish = () => {
    onSuccess(guard);
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4"
      onClick={(e) => {
        if (e.target === e.currentTarget && stage === 'CONFIRMED') onClose();
      }}
    >
      <div className="relative w-full max-w-md border border-emerald-500/50 bg-[#0c0f0e] p-6 shadow-2xl shadow-emerald-900/30 font-mono my-auto text-center max-h-[calc(100vh-2rem)] overflow-y-auto">
        {/* Decorative corner indicators */}
        <div className="absolute top-2 left-2 text-[9px] text-[#00ff88]/60 font-mono">[WEB3_RPC_MINT]</div>
        <div className="absolute top-2 right-2 text-[9px] text-[#00ff88]/60 font-mono">[CHAIN_ID: 10888]</div>

        {stage === 'PENDING' ? (
          <div className="space-y-4 py-3">
            <div className="w-14 h-14 border border-[#00ff88] bg-[#00ff88]/10 flex items-center justify-center mx-auto shadow-[0_0_15px_rgba(0,255,136,0.3)]">
              <Loader2 className="w-8 h-8 text-[#00ff88] animate-spin" />
            </div>

            <div>
              <span className="font-pixel text-[10px] text-[#a3e635] tracking-wider uppercase block mb-1">
                SUBMITTING POW MERKLE PROOF
              </span>
              <h3 className="font-pixel text-sm sm:text-base text-white">
                Minting Robin Guard {guard.id} on Robinhood Chain...
              </h3>
            </div>

            <div className="bg-[#080a08] border border-emerald-950 p-3 text-left font-mono text-xs space-y-1.5 text-neutral-400">
              <div className="flex justify-between">
                <span>CONTRACT:</span>
                <span className="text-emerald-400 font-mono">0xRobin...Guard</span>
              </div>
              <div className="flex justify-between">
                <span>NONCE VERIFIED:</span>
                <span className="text-[#00ff88] font-mono">{guard.nonce.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span>GAS & MINT COST:</span>
                <span className="text-white font-bold">$5.00 ETH</span>
              </div>
              <div className="flex items-center gap-2 pt-1 text-[11px] text-[#00ff88]">
                <span className="w-2 h-2 rounded-none bg-[#00ff88] animate-ping"></span>
                <span>Awaiting block inclusion (~1.8s)...</span>
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-4 py-2">
            <div className="w-14 h-14 border border-[#00ff88] bg-[#00ff88]/20 flex items-center justify-center mx-auto shadow-[0_0_20px_rgba(0,255,136,0.4)]">
              <CheckCircle2 className="w-8 h-8 text-[#00ff88]" />
            </div>

            <div>
              <div className="flex items-center justify-center gap-2 text-xs font-pixel text-[#00ff88] mb-1">
                <Sparkles className="w-4 h-4 text-[#a3e635]" />
                <span>TRANSACTION CONFIRMED!</span>
                <Sparkles className="w-4 h-4 text-[#a3e635]" />
              </div>
              <h3 className="font-pixel text-base text-white">
                Robin Guard {guard.id} Minted!
              </h3>
              <p className="font-mono text-xs text-neutral-300 mt-1">
                Your Guard is now permanently stored in your Web3 wallet and ready to farm 50 $GUARD/hr in the Staking Vault.
              </p>
            </div>

            {/* Guard card preview */}
            <div className="border border-emerald-800 bg-[#080a08] p-3 max-w-[200px] mx-auto shadow-md">
              <div className="aspect-square bg-black border border-emerald-800 overflow-hidden mb-2">
                <img
                  src={guard.image}
                  alt={guard.name}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover pixelated"
                />
              </div>
              <div className="font-pixel text-xs text-white truncate">{guard.name}</div>
              <div className="text-[10px] text-[#00ff88] font-mono mt-0.5">{guard.power} H-PWR · {guard.rarity}</div>
            </div>

            <button
              onClick={handleFinish}
              className="w-full py-3 px-4 font-pixel text-xs tracking-wider uppercase font-bold bg-[#00ff88] text-black pixel-btn-action cursor-pointer hover:bg-[#00ff88]/90 shadow-[0_0_20px_rgba(0,255,136,0.4)] flex items-center justify-center gap-2"
            >
              <span>ACCEPT & RESUME RIG</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
