'use client';

import React, { useState } from 'react';
import { RobinGuardNFT } from '../types';
import { sound } from '../utils/audio';
import { shortenAddress } from '../utils/mining';
import { ShieldCheck, Copy, Check, Zap, Layers } from 'lucide-react';

interface InspectModalProps {
  guard: RobinGuardNFT | null;
  onClose: () => void;
  onToggleStake?: (guardId: string) => void;
  myAddress: string;
}

export const InspectModal: React.FC<InspectModalProps> = ({
  guard,
  onClose,
  onToggleStake,
  myAddress,
}) => {
  const [copied, setCopied] = useState(false);

  if (!guard) return null;

  const isOwner = guard.isOwner || (myAddress && guard.minedBy.toLowerCase() === myAddress.toLowerCase());

  const handleCopyHash = () => {
    try {
      if (typeof navigator !== 'undefined' && navigator.clipboard) {
        navigator.clipboard.writeText(guard.hash);
      }
      setCopied(true);
      sound.playBlip(750, 'triangle', 0.04);
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
        {/* Header */}
        <div className="flex items-center justify-between border-b border-emerald-900/60 pb-3 mb-5">
          <div className="flex items-center gap-2">
            <span className="font-pixel text-xs text-[#00ff88]">&gt; GUARD INSPECTION</span>
            <span className="text-emerald-500 font-mono text-xs">/ {guard.id}</span>
          </div>
          <button
            onClick={() => {
              sound.playBlip(350, 'square', 0.04);
              onClose();
            }}
            className="text-neutral-400 hover:text-white font-mono text-sm px-2 py-0.5 border border-emerald-900 hover:border-emerald-700 cursor-pointer"
          >
            [X]
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          {/* Image */}
          <div className="border border-emerald-900/70 bg-[#080a08] p-2 flex flex-col items-center justify-center">
            <div className="w-full aspect-square bg-black border border-emerald-800 overflow-hidden relative">
              <img
                src={guard.image}
                alt={guard.name}
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover pixelated"
              />
              {guard.isStaked && (
                <div className="absolute top-2 left-2 bg-[#00ff88] text-black font-pixel text-[8px] px-1.5 py-0.5 font-bold shadow-md">
                  STAKED
                </div>
              )}
            </div>

            <div className="w-full mt-2 flex items-center justify-between font-mono text-[10px] text-neutral-400">
              <span>ROBINHOOD CHAIN NFT</span>
              <span className="text-[#a3e635] font-bold">{guard.rarity}</span>
            </div>
          </div>

          {/* Details & Traits */}
          <div className="space-y-3 font-mono text-xs">
            <div>
              <div className="text-[10px] text-emerald-500/80 uppercase">UNIT DESIGNATION</div>
              <h3 className="font-pixel text-sm text-white mt-0.5">{guard.name}</h3>
              <div className="text-neutral-400 text-[11px] mt-0.5">Token ID: {guard.id}</div>
            </div>

            <div className="grid grid-cols-2 gap-2 pt-1">
              <div className="p-2 border border-emerald-950 bg-[#080a08]">
                <div className="flex items-center gap-1 text-[10px] text-emerald-500/90">
                  <Zap className="w-3 h-3 text-[#00ff88]" />
                  <span>HASH-POWER</span>
                </div>
                <div className="text-sm font-bold text-[#00ff88] mt-0.5 tabular-nums">
                  {guard.power} H-PWR
                </div>
              </div>

              <div className="p-2 border border-emerald-950 bg-[#080a08]">
                <div className="flex items-center gap-1 text-[10px] text-emerald-500/90">
                  <Layers className="w-3 h-3 text-[#a3e635]" />
                  <span>FARM YIELD</span>
                </div>
                <div className="text-sm font-bold text-[#a3e635] mt-0.5 tabular-nums">
                  50 $GUARD/hr
                </div>
              </div>
            </div>

            <div className="p-2.5 border border-emerald-950 bg-[#080a08] space-y-1.5">
              <div className="flex items-center justify-between text-[10px] text-neutral-400">
                <span>MINED BY</span>
                <span className="text-white">{shortenAddress(guard.minedBy)}</span>
              </div>
              <div className="flex items-center justify-between text-[10px] text-neutral-400">
                <span>EPOCH</span>
                <span className="text-[#00ff88]">EPOCH {guard.epoch}</span>
              </div>
              <div className="flex items-center justify-between text-[10px] text-neutral-400">
                <span>PROOF HASH</span>
                <button
                  onClick={handleCopyHash}
                  className="flex items-center gap-1 text-[#00ff88] hover:underline cursor-pointer"
                  title="Copy full hash"
                >
                  <span className="font-mono text-[9px] truncate max-w-[120px]">{guard.hash}</span>
                  {copied ? <Check className="w-3 h-3 text-[#00ff88]" /> : <Copy className="w-3 h-3" />}
                </button>
              </div>
            </div>

            <div className="flex items-center gap-1.5 text-[10px] text-[#00ff88] border border-emerald-800/80 bg-emerald-950/30 p-2">
              <ShieldCheck className="w-3.5 h-3.5 flex-shrink-0" />
              <span>ROBINHOOD CHAIN PROOF-OF-WORK VERIFIED</span>
            </div>
          </div>
        </div>

        {/* Action Button */}
        {isOwner && onToggleStake && (
          <div className="mt-5 pt-3 border-t border-emerald-900/60 flex justify-end gap-3 font-mono text-xs">
            <button
              onClick={() => {
                sound.playBlip(700, 'triangle', 0.05);
                onToggleStake(guard.id);
              }}
              className={`px-4 py-2 border font-bold uppercase transition-colors cursor-pointer ${
                guard.isStaked
                  ? 'border-red-500/70 text-red-400 hover:bg-red-500/15'
                  : 'border-[#00ff88] text-[#00ff88] hover:bg-[#00ff88]/15'
              }`}
            >
              {guard.isStaked ? 'UNSTAKE FROM VAULT' : 'STAKE GUARD'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
