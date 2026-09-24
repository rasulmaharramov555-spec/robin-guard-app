'use client';

import React, { useState, useEffect } from 'react';
import { RobinGuardNFT, WalletState } from '../types';
import { sound } from '../utils/audio';
import { Shield, Coins, Zap, Check, AlertCircle } from 'lucide-react';

interface StakingTabProps {
  guards: RobinGuardNFT[];
  wallet: WalletState;
  onToggleStake: (guardId: string) => void;
  onStakeAll: () => void;
  onUnstakeAll: () => void;
  onClaimGuard: (amount: number) => void;
  onConnectWallet: () => void;
  onNavigateToMine: () => void;
}

export const StakingTab: React.FC<StakingTabProps> = ({
  guards,
  wallet,
  onToggleStake,
  onStakeAll,
  onUnstakeAll,
  onClaimGuard,
  onConnectWallet,
  onNavigateToMine,
}) => {
  const [unclaimedGuard, setUnclaimedGuard] = useState<number>(0);
  const [claimSuccess, setClaimSuccess] = useState<boolean>(false);

  // User's owned guards
  const userGuards = guards.filter(
    (g) => g.isOwner || (wallet.isConnected && g.minedBy.toLowerCase() === wallet.address.toLowerCase())
  );
  const stakedGuards = userGuards.filter((g) => g.isStaked);
  const unstakedGuards = userGuards.filter((g) => !g.isStaked);

  const stakedCount = stakedGuards.length;
  // Each staked guard yields 50 $GUARD / hr
  const earningRatePerHour = stakedCount * 50;
  // Estimated listing price is $0.20 per $GUARD as stated in tokenomics
  const estimatedValueUSD = (unclaimedGuard * 0.20).toFixed(2);

  // Real-time ticking of unclaimed $GUARD if at least one guard is staked
  useEffect(() => {
    if (stakedCount > 0) {
      const interval = setInterval(() => {
        // 50 $GUARD per hour per guard = ~0.01388 / sec
        const increment = (stakedCount * 50 / 3600) * 0.5; // step per 500ms
        setUnclaimedGuard((prev) => +(prev + increment).toFixed(2));
      }, 500);

      return () => clearInterval(interval);
    }
  }, [stakedCount]);

  const handleClaim = () => {
    if (unclaimedGuard <= 0) return;
    sound.playWinFanfare();
    onClaimGuard(unclaimedGuard);
    setClaimSuccess(true);
    setUnclaimedGuard(0);
    setTimeout(() => setClaimSuccess(false), 3000);
  };

  const handleStakeFirstAvailable = () => {
    if (!wallet.isConnected) {
      onConnectWallet();
      return;
    }
    if (unstakedGuards.length > 0) {
      sound.playBlip(700, 'triangle', 0.05);
      onToggleStake(unstakedGuards[0].id);
    } else if (userGuards.length === 0) {
      onNavigateToMine();
    }
  };

  return (
    <div className="space-y-6">
      {/* Wallet-Gated Banner if not connected */}
      {!wallet.isConnected && (
        <div className="border-2 border-[#00ff88] bg-[#00ff88]/10 p-4 sm:p-5 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-[0_0_20px_rgba(0,255,136,0.25)]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 border border-[#00ff88] bg-[#00ff88]/20 flex items-center justify-center flex-shrink-0">
              <Shield className="w-5 h-5 text-[#00ff88]" />
            </div>
            <div>
              <h3 className="font-pixel text-xs sm:text-sm text-white">
                Connect wallet to view and stake your Robin Guards
              </h3>
              <p className="font-mono text-xs text-neutral-300 mt-0.5">
                Link your Robinhood Chain Web3 wallet to access your mined guards and earn 50 $GUARD/hr.
              </p>
            </div>
          </div>
          <button
            onClick={onConnectWallet}
            className="pixel-btn-action border-2 border-[#00ff88] bg-[#00ff88] text-black px-4 py-2 font-pixel text-xs font-bold uppercase cursor-pointer hover:bg-[#00ff88]/90 whitespace-nowrap shadow-[2px_2px_0px_#000]"
          >
            CONNECT WALLET
          </button>
        </div>
      )}

      {/* Header text & Subtitle */}
      <div className="border border-emerald-900/60 bg-[#0c130e] p-5 sm:p-6 relative">
        <div className="border-b border-emerald-900/60 pb-4 mb-5">
          <div className="flex items-center gap-2">
            <h2 className="font-pixel text-base sm:text-lg text-white">
              STAKE YOUR ROBIN GUARD
            </h2>
            <span className="text-[10px] text-[#00ff88] border border-emerald-800 px-1.5 py-0.2 bg-emerald-950/40 uppercase font-mono">
              NON-CUSTODIAL VAULT
            </span>
          </div>
          <p className="font-mono text-xs sm:text-sm text-neutral-400 mt-1">
            Connect your wallet to stake your Robin Guard NFTs and farm $GUARD tokens.
          </p>
        </div>

        {/* Stat Cards Grid:
            * "STAKED GUARDS": 0
            * "EARNING RATE": 50 $GUARD / hr
            * "UNCLAIMED $GUARD": 0.00
            * "ESTIMATED VALUE": $0.00
        */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {/* STAKED GUARDS */}
          <div className="border border-emerald-950 bg-[#080a08] p-3.5">
            <span className="text-[10px] text-emerald-500/90 font-mono uppercase block">
              STAKED GUARDS
            </span>
            <div className="flex items-center gap-2 mt-1">
              <Shield className="w-4 h-4 text-[#00ff88]" />
              <span className="font-mono text-xl font-bold text-white tabular-nums">
                {stakedCount}
              </span>
            </div>
            <span className="text-[10px] text-neutral-500 font-mono mt-1 block">
              {userGuards.length} Total in Wallet
            </span>
          </div>

          {/* EARNING RATE */}
          <div className="border border-emerald-950 bg-[#080a08] p-3.5">
            <span className="text-[10px] text-emerald-500/90 font-mono uppercase block">
              EARNING RATE
            </span>
            <div className="flex items-center gap-2 mt-1">
              <Zap className="w-4 h-4 text-[#a3e635]" />
              <span className="font-mono text-xl font-bold text-[#a3e635] tabular-nums">
                {earningRatePerHour > 0 ? `${earningRatePerHour} $GUARD / hr` : '50 $GUARD / hr'}
              </span>
            </div>
            <span className="text-[10px] text-neutral-500 font-mono mt-1 block">
              50 $GUARD / hr per Guard
            </span>
          </div>

          {/* UNCLAIMED $GUARD */}
          <div className="border border-emerald-950 bg-[#080a08] p-3.5">
            <span className="text-[10px] text-emerald-500/90 font-mono uppercase block">
              UNCLAIMED $GUARD
            </span>
            <div className="flex items-center gap-2 mt-1">
              <Coins className="w-4 h-4 text-[#00ff88]" />
              <span className="font-mono text-xl font-bold text-[#00ff88] tabular-nums">
                {unclaimedGuard.toFixed(2)}
              </span>
            </div>
            <span className="text-[10px] text-neutral-500 font-mono mt-1 block">
              Accruing in Vault
            </span>
          </div>

          {/* ESTIMATED VALUE */}
          <div className="border border-emerald-950 bg-[#080a08] p-3.5">
            <span className="text-[10px] text-emerald-500/90 font-mono uppercase block">
              ESTIMATED VALUE
            </span>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-[#00ff88] font-mono text-lg font-bold">$</span>
              <span className="font-mono text-xl font-bold text-white tabular-nums">
                {estimatedValueUSD}
              </span>
            </div>
            <span className="text-[10px] text-neutral-500 font-mono mt-1 block">
              At $0.20 Listing Price
            </span>
          </div>
        </div>

        {/* Action Buttons: "STAKE GUARD" | "CLAIM $GUARD" | "UNSTAKE ALL" */}
        <div className="flex flex-wrap items-center gap-3 pt-2">
          <button
            onClick={handleStakeFirstAvailable}
            className="pixel-btn-action px-4 py-2.5 bg-[#00ff88] text-black font-pixel text-xs tracking-wider uppercase font-bold hover:bg-[#00ff88]/90 cursor-pointer border border-[#00ff88]"
          >
            STAKE GUARD
          </button>

          <button
            onClick={handleClaim}
            disabled={unclaimedGuard <= 0}
            className={`pixel-btn-action px-4 py-2.5 font-pixel text-xs tracking-wider uppercase font-bold border transition-colors cursor-pointer ${
              unclaimedGuard > 0
                ? 'border-[#a3e635] bg-[#a3e635] text-black hover:bg-[#a3e635]/90 shadow-[0_0_12px_rgba(163,230,53,0.3)]'
                : 'border-emerald-950 bg-[#080a08] text-neutral-500 cursor-not-allowed'
            }`}
          >
            CLAIM $GUARD
          </button>

          <button
            onClick={() => {
              if (stakedCount > 0) {
                sound.playBlip(350, 'square', 0.05);
                onUnstakeAll();
              }
            }}
            disabled={stakedCount === 0}
            className={`px-4 py-2.5 font-mono text-xs border uppercase cursor-pointer transition-colors ${
              stakedCount > 0
                ? 'border-emerald-800 bg-[#080a08] text-neutral-300 hover:text-white hover:border-emerald-700'
                : 'border-emerald-950 bg-[#080a08] text-neutral-600 cursor-not-allowed'
            }`}
          >
            UNSTAKE ALL
          </button>

          {unstakedGuards.length > 1 && (
            <button
              onClick={() => {
                sound.playBlip(650, 'triangle', 0.05);
                onStakeAll();
              }}
              className="px-3 py-2 border border-emerald-700 text-emerald-400 hover:bg-emerald-950/40 text-xs font-mono cursor-pointer ml-auto"
            >
              STAKE ALL ({unstakedGuards.length})
            </button>
          )}
        </div>

        {claimSuccess && (
          <div className="mt-4 p-3 border border-[#00ff88] bg-[#00ff88]/10 text-[#00ff88] text-xs font-mono flex items-center gap-2">
            <Check className="w-4 h-4" />
            <span>Successfully claimed $GUARD to your Robinhood Chain wallet!</span>
          </div>
        )}
      </div>

      {/* Grid state: Empty state vs User's Robin Guards */}
      <div className="border border-emerald-900/60 bg-[#0c130e] p-5">
        <div className="flex items-center justify-between border-b border-emerald-900/60 pb-3 mb-4">
          <div className="flex items-center gap-2">
            <Shield className="w-4 h-4 text-[#00ff88]" />
            <h3 className="font-pixel text-xs text-white">YOUR ROBIN GUARDS</h3>
          </div>
          <span className="text-xs font-mono text-emerald-500">
            {userGuards.length} DETECTED
          </span>
        </div>

        {userGuards.length === 0 ? (
          /* Required Empty Grid State: "No Robin Guards detected in your wallet." */
          <div className="border border-dashed border-emerald-900/70 p-10 text-center font-mono space-y-3">
            <div className="w-12 h-12 border border-emerald-900 bg-emerald-950/20 flex items-center justify-center mx-auto text-emerald-600">
              <AlertCircle className="w-6 h-6" />
            </div>
            <p className="text-neutral-300 text-sm font-bold">
              No Robin Guards detected in your wallet.
            </p>
            <p className="text-neutral-500 text-xs max-w-md mx-auto">
              You must mine a Robin Guard in Epoch 1 to begin farming $GUARD tokens at 50 $GUARD / hr.
            </p>
            <button
              onClick={onNavigateToMine}
              className="mt-2 pixel-btn-action px-4 py-2 border border-[#00ff88] bg-[#00ff88]/10 text-[#00ff88] hover:bg-[#00ff88] hover:text-black font-pixel text-xs uppercase cursor-pointer"
            >
              GO TO MINE TAB
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {userGuards.map((guard) => (
              <div
                key={guard.id}
                className="border border-emerald-900/80 bg-[#080a08] p-3 flex flex-col justify-between"
              >
                <div>
                  <div className="aspect-square bg-black border border-emerald-800 overflow-hidden mb-2.5 relative">
                    <img
                      src={guard.image}
                      alt={guard.name}
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover pixelated"
                    />
                    {guard.isStaked && (
                      <div className="absolute top-2 left-2 bg-[#00ff88] text-black font-pixel text-[7px] px-1.5 py-0.5 font-bold">
                        STAKED (FARMING)
                      </div>
                    )}
                    <div className="absolute top-2 right-2 bg-black/80 border border-emerald-800 text-emerald-400 font-mono text-[9px] px-1">
                      {guard.rarity}
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-xs font-mono">
                    <span className="font-pixel text-white">{guard.id}</span>
                    <span className="text-[#00ff88] font-bold">{guard.power} H-PWR</span>
                  </div>
                  <div className="text-xs text-neutral-300 font-mono mt-0.5 truncate">
                    {guard.name}
                  </div>
                  <div className="text-[10px] text-emerald-500/80 font-mono mt-1">
                    Yield: 50 $GUARD/hr
                  </div>
                </div>

                <div className="pt-3 mt-3 border-t border-emerald-950">
                  <button
                    onClick={() => {
                      sound.playBlip(guard.isStaked ? 400 : 700, 'triangle', 0.04);
                      onToggleStake(guard.id);
                    }}
                    className={`w-full py-2 border text-xs font-mono font-bold uppercase transition-colors cursor-pointer ${
                      guard.isStaked
                        ? 'border-red-500/70 text-red-400 hover:bg-red-500/15'
                        : 'border-[#00ff88] text-[#00ff88] hover:bg-[#00ff88]/15'
                    }`}
                  >
                    {guard.isStaked ? 'UNSTAKE' : 'STAKE GUARD'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
