'use client';

import React from 'react';
import { RobinGuardNFT } from '../types';
import { sound } from '../utils/audio';
import { formatTimeAgo, shortenAddress } from '../utils/mining';
import { Shield, ShieldCheck, Zap } from 'lucide-react';

interface LiveRaceProps {
  guards: RobinGuardNFT[];
  onSelectGuard: (guard: RobinGuardNFT) => void;
  myAddress: string;
}

export const LiveRace: React.FC<LiveRaceProps> = ({
  guards,
  onSelectGuard,
  myAddress,
}) => {
  return (
    <div className="border border-emerald-900/60 bg-[#0c130e] flex flex-col justify-between p-4 sm:p-5 relative shadow-[0_4px_20px_rgba(0,0,0,0.6)] h-full">
      {/* Corner notches */}
      <div className="absolute -top-[1px] -left-[1px] w-2 h-2 bg-[#00ff88]"></div>
      <div className="absolute -top-[1px] -right-[1px] w-2 h-2 bg-[#059669]"></div>
      <div className="absolute -bottom-[1px] -left-[1px] w-2 h-2 bg-[#a3e635]"></div>
      <div className="absolute -bottom-[1px] -right-[1px] w-2 h-2 bg-[#00ff88]"></div>

      <div>
        {/* Title: "RECENT GUARDS MINED" */}
        <div className="flex items-center justify-between border-b border-emerald-900/60 pb-3 mb-4">
          <div className="flex items-center gap-2">
            <Shield className="w-4 h-4 text-[#00ff88]" />
            <h2 className="font-pixel text-xs sm:text-sm text-white">
              RECENT GUARDS MINED
            </h2>
          </div>

          <div className="flex items-center gap-1.5 text-[10px] font-mono text-emerald-400 border border-emerald-800 bg-[#080a08] px-2 py-0.5">
            <span className="w-1.5 h-1.5 bg-[#00ff88] animate-pulse"></span>
            <span>EPOCH 1 FEED</span>
          </div>
        </div>

        {/* Live Race Feed */}
        <div className="space-y-2.5 max-h-[460px] overflow-y-auto pr-1 scrollbar-thin min-h-[320px] flex flex-col justify-center">
          {guards.length === 0 ? (
            /* Required text: "No Guards mined yet in Epoch 1. Be the first to start!" */
            <div className="border border-dashed border-emerald-900/70 p-8 text-center font-mono my-auto">
              <div className="w-10 h-10 border border-emerald-800 bg-emerald-950/30 flex items-center justify-center mx-auto mb-3">
                <Shield className="w-5 h-5 text-emerald-500" />
              </div>
              <p className="text-[#00ff88] text-xs font-pixel mb-1">EPOCH 1 JUST BEGAN</p>
              <p className="text-neutral-400 text-xs font-mono">
                No Guards mined yet in Epoch 1. Be the first to start!
              </p>
            </div>
          ) : (
            <div className="space-y-2.5 w-full self-start">
              {guards.map((item) => {
                const isMine = item.isOwner || (myAddress && item.minedBy.toLowerCase() === myAddress.toLowerCase());

                return (
                  <div
                    key={item.id + item.hash}
                    onClick={() => {
                      sound.playBlip(600, 'triangle', 0.04);
                      onSelectGuard(item);
                    }}
                    className="group border border-emerald-950 hover:border-[#00ff88] bg-[#080a08] hover:bg-[#0e1710] p-2.5 flex items-center justify-between gap-3 cursor-pointer transition-all"
                  >
                    {/* Left: Pixel Avatar + Details */}
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-black border border-emerald-800 group-hover:border-[#00ff88] overflow-hidden flex-shrink-0 relative">
                        <img
                          src={item.image}
                          alt={item.name}
                          referrerPolicy="no-referrer"
                          className="w-full h-full object-cover pixelated"
                        />
                        {isMine && (
                          <span className="absolute bottom-0 right-0 bg-[#00ff88] text-black font-pixel text-[6px] px-0.5 font-bold">
                            YOU
                          </span>
                        )}
                      </div>

                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-pixel text-xs text-white group-hover:text-[#00ff88] transition-colors">
                            {item.id}
                          </span>
                          <span className="text-[9px] px-1.5 py-0.2 border border-emerald-800 bg-emerald-950/40 text-[#a3e635] uppercase font-mono">
                            {item.rarity}
                          </span>
                        </div>

                        <div className="text-xs text-neutral-300 font-mono mt-0.5">
                          {item.name}
                        </div>

                        <div className="flex items-center gap-2 text-[10px] text-neutral-500 font-mono mt-1">
                          <span className="text-emerald-400/80">{shortenAddress(item.minedBy)}</span>
                          <span>·</span>
                          <span className="text-neutral-400">{formatTimeAgo(item.minedAt)}</span>
                        </div>
                      </div>
                    </div>

                    {/* Right: Farm Rate / Staking Power */}
                    <div className="text-right flex flex-col items-end justify-center">
                      <div className="flex items-center gap-1 text-[11px] font-mono text-[#00ff88]">
                        <Zap className="w-3 h-3 text-[#00ff88]" />
                        <span className="font-bold">{item.power} H-PWR</span>
                      </div>
                      <div className="text-[9px] text-emerald-500 font-mono mt-1">
                        +50 $GUARD/hr
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Footer Info Box */}
      <div className="pt-4 mt-4 border-t border-emerald-900/60 text-[11px] font-mono text-neutral-400 flex items-center justify-between">
        <span className="flex items-center gap-1.5 text-emerald-400">
          <ShieldCheck className="w-3.5 h-3.5 text-[#00ff88]" />
          CHAIN VERIFIED MINT
        </span>
        <span className="text-[10px] text-emerald-600">
          MINT FEE: $5.00
        </span>
      </div>
    </div>
  );
};
