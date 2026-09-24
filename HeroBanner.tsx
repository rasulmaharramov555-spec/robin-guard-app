'use client';

import React, { useState } from 'react';
import { sound } from '../utils/audio';
import { useLaunchCountdown } from '../hooks/useLaunchCountdown';
import { Clock } from 'lucide-react';

interface HeroBannerProps {
  totalMined: number;
  maxSupply?: number;
  currentEpoch?: number;
  totalEpochs?: number;
  priceDisplay?: string;
  difficultyDisplay?: string;
}

export const HeroBanner: React.FC<HeroBannerProps> = ({
  totalMined = 0,
  maxSupply = 5000,
  currentEpoch = 1,
  totalEpochs = 10,
  priceDisplay = '$5.00',
  difficultyDisplay = '1.0 bits',
}) => {
  const [selectedEpoch, setSelectedEpoch] = useState<number | null>(null);
  const { formatted: countdownFormatted } = useLaunchCountdown();

  const getEpochDetails = (epochNum: number) => {
    const supplyPerEpoch = maxSupply / totalEpochs;
    const startRange = (epochNum - 1) * supplyPerEpoch + 1;
    const endRange = epochNum * supplyPerEpoch;
    const rate = epochNum === 1 ? '50 $GUARD / hr' : `${Math.max(10, 50 - (epochNum - 1) * 4.5).toFixed(0)} $GUARD / hr`;
    const diff = `${(1 + (epochNum - 1) * 0.4).toFixed(1)} bits`;

    return {
      range: `#${String(startRange).padStart(4, '0')} - #${String(endRange).padStart(4, '0')}`,
      farmRate: rate,
      diff,
      status: epochNum < currentEpoch ? 'COMPLETED' : epochNum === currentEpoch ? 'ACTIVE' : 'UPCOMING'
    };
  };

  const epochMined = totalMined % (maxSupply / totalEpochs);
  const epochTotal = maxSupply / totalEpochs;
  const currentEpochPercent = Math.min(100, Math.round((epochMined / epochTotal) * 100));

  return (
    <div className="relative border-b border-emerald-900/50 bg-[#0a0f0b] overflow-hidden">
      {/* Subtle green pixel grid background */}
      <div className="absolute inset-0 pixel-grid-bg opacity-50 pointer-events-none" />

      {/* Decorative cyber corner accents */}
      <div className="absolute top-2 left-2 text-[9px] text-emerald-500/60 font-mono select-none">
        [SYS_GUARD_POW: ACTIVE]
      </div>
      <div className="absolute top-2 right-2 text-[9px] text-[#00ff88]/60 font-mono select-none">
        [CONSENSUS: SHA3-GUARD]
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 py-8 sm:py-10">
        {/* Main Title Banner */}
        <div className="text-center space-y-3">
          <div className="inline-block border border-emerald-800 bg-emerald-950/40 px-3 py-1 text-xs text-[#00ff88] uppercase tracking-wider font-mono">
            * 100% PROOF-OF-WORK · NO PRIVATE ALLOCATION · FAIR LAUNCH *
          </div>

          <h1 className="font-pixel text-xl sm:text-3xl md:text-4xl text-white tracking-tight leading-snug drop-shadow-[0_2px_10px_rgba(0,255,136,0.25)]">
            YOU CAN'T BUY A GUARD. <span className="text-[#00ff88]">YOU MINE ONE.</span>
          </h1>

          <p className="font-mono text-xs sm:text-sm text-neutral-400 max-w-2xl mx-auto tracking-wide">
            PROOF-OF-WORK NFT MINING ON <span className="text-[#00ff88] font-semibold">ROBINHOOD CHAIN</span>
          </p>
        </div>

        {/* Live Stats Bar:
            * MINED: 0 / 5,000
            * EPOCH: 1 / 10
            * PRICE: $5.00 (in ETH)
            * DIFFICULTY: 1.0 bits
        */}
        <div className="mt-8 border border-emerald-900/60 bg-[#0c130e] p-3 sm:p-4 max-w-4xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center divide-y md:divide-y-0 md:divide-x divide-emerald-900/60">
            <div className="pt-2 md:pt-0">
              <span className="text-[10px] text-emerald-500/80 font-mono block uppercase tracking-wider">MINED</span>
              <span className="font-mono text-sm sm:text-base font-bold text-white tabular-nums">
                {totalMined.toLocaleString()} / {maxSupply.toLocaleString()}
              </span>
            </div>

            <div className="pt-2 md:pt-0">
              <span className="text-[10px] text-emerald-500/80 font-mono block uppercase tracking-wider">EPOCH</span>
              <span className="font-mono text-sm sm:text-base font-bold text-[#00ff88] tabular-nums">
                {currentEpoch} / {totalEpochs}
              </span>
            </div>

            <div className="pt-2 md:pt-0">
              <span className="text-[10px] text-emerald-500/80 font-mono block uppercase tracking-wider">PRICE (IN ETH)</span>
              <span className="font-mono text-sm sm:text-base font-bold text-white tabular-nums">
                {priceDisplay}
              </span>
            </div>

            <div className="pt-2 md:pt-0">
              <span className="text-[10px] text-emerald-500/80 font-mono block uppercase tracking-wider">DIFFICULTY</span>
              <span className="font-mono text-sm sm:text-base font-bold text-[#a3e635] tabular-nums">
                {difficultyDisplay}
              </span>
            </div>
          </div>

          {/* Top Stat Header Countdown row: DDd : HHh : MMm : SSs */}
          <div className="mt-3 pt-3 border-t border-emerald-950 flex flex-wrap items-center justify-between gap-2 px-1 text-xs font-mono">
            <div className="flex items-center gap-1.5 text-neutral-400 text-[11px]">
              <Clock className="w-3.5 h-3.5 text-[#00ff88]" />
              <span>OFFICIAL TOKEN LAUNCH:</span>
            </div>
            <div className="text-[#00ff88] font-bold text-xs sm:text-sm tracking-widest tabular-nums">
              {countdownFormatted}
            </div>
          </div>
        </div>

        {/* Epoch Progress Bar: 10 segmented green blocks showing active progress (Epoch 1 highlighted in glowing green, remaining 9 in dark green) */}
        <div className="mt-6 max-w-4xl mx-auto">
          <div className="flex items-center justify-between text-xs font-mono mb-2">
            <span className="text-neutral-400 flex items-center gap-2">
              <span className="text-[#00ff88] font-pixel text-[10px]">&gt;</span>
              EPOCH BLOCKS (10 PHASES):
            </span>
            <span className="text-[#00ff88] text-[11px] font-bold">
              Epoch {currentEpoch} Active {totalMined > 0 ? `(${currentEpochPercent}%)` : '(0%)'}
            </span>
          </div>

          <div className="grid grid-cols-10 gap-1.5 sm:gap-2">
            {Array.from({ length: totalEpochs }, (_, idx) => {
              const epochNum = idx + 1;
              const isPast = epochNum < currentEpoch;
              const isCurrent = epochNum === currentEpoch;
              const isFuture = epochNum > currentEpoch;

              return (
                <button
                  key={epochNum}
                  onClick={() => {
                    sound.playBlip(400 + epochNum * 35, 'triangle', 0.04);
                    setSelectedEpoch(selectedEpoch === epochNum ? null : epochNum);
                  }}
                  className={`group relative h-9 sm:h-11 border transition-all text-left p-1 flex flex-col justify-between cursor-pointer ${
                    isCurrent
                      ? 'border-[#00ff88] bg-[#00ff88]/20 text-[#00ff88] shadow-[0_0_14px_rgba(0,255,136,0.35)] ring-1 ring-[#00ff88]'
                      : isPast
                      ? 'border-emerald-600 bg-emerald-900/40 text-emerald-300'
                      : 'border-emerald-950 bg-[#08120b] text-emerald-800 hover:border-emerald-900'
                  }`}
                  title={`Epoch ${epochNum}`}
                >
                  <div className="flex items-center justify-between w-full">
                    <span className="font-pixel text-[8px] sm:text-[9px]">
                      E{epochNum}
                    </span>
                    {isCurrent && (
                      <span className="w-1.5 h-1.5 bg-[#00ff88] animate-ping"></span>
                    )}
                  </div>

                  {/* Progress bar inside active block */}
                  {isCurrent && (
                    <div className="w-full bg-[#080a08] h-1.5 border border-emerald-800 overflow-hidden">
                      <div
                        className="bg-[#00ff88] h-full transition-all duration-300"
                        style={{ width: `${Math.max(8, currentEpochPercent)}%` }}
                      />
                    </div>
                  )}

                  {isPast && (
                    <div className="w-full bg-[#059669] h-1.5"></div>
                  )}

                  {isFuture && (
                    <div className="w-full bg-[#0f291e] h-1.5"></div>
                  )}
                </button>
              );
            })}
          </div>

          {/* Selected Epoch Details Popup */}
          {selectedEpoch !== null && (
            <div className="mt-3 p-3 bg-[#0c130e] border border-emerald-800/80 flex flex-wrap items-center justify-between gap-3 text-xs font-mono">
              {(() => {
                const details = getEpochDetails(selectedEpoch);
                return (
                  <>
                    <div className="flex items-center gap-3">
                      <span className="font-pixel text-[#00ff88] text-xs">
                        [EPOCH {selectedEpoch}]
                      </span>
                      <span className="text-neutral-300">
                        Supply: <strong className="text-white">{details.range}</strong>
                      </span>
                      <span className="text-emerald-500">·</span>
                      <span className="text-neutral-300">
                        Farming Rate: <strong className="text-[#a3e635]">{details.farmRate}</strong>
                      </span>
                      <span className="text-emerald-500">·</span>
                      <span className="text-neutral-300">
                        Diff: <strong className="text-white">{details.diff}</strong>
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`text-[10px] px-2 py-0.5 border ${
                        details.status === 'ACTIVE'
                          ? 'border-[#00ff88] text-[#00ff88] bg-[#00ff88]/10'
                          : details.status === 'COMPLETED'
                          ? 'border-emerald-600 text-emerald-400 bg-emerald-950/20'
                          : 'border-emerald-950 text-emerald-800'
                      }`}>
                        {details.status}
                      </span>
                      <button
                        onClick={() => setSelectedEpoch(null)}
                        className="text-neutral-400 hover:text-white px-1 cursor-pointer"
                      >
                        [x]
                      </button>
                    </div>
                  </>
                );
              })()}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
