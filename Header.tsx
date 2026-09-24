'use client';

import React, { useState } from 'react';
import { useAccount } from 'wagmi';
import { WalletState } from '../types';
import { sound } from '../utils/audio';
import { shortenAddress } from '../utils/mining';
import { useLaunchCountdown } from '../hooks/useLaunchCountdown';
import { Volume2, VolumeX, Monitor, Clock, Shield, Sparkles } from 'lucide-react';
import { WalletModal } from './WalletModal';

interface HeaderProps {
  wallet: WalletState;
  onConnectWallet: () => void;
  onDisconnectWallet: () => void;
  onFaucet: () => void;
  crtEnabled: boolean;
  onToggleCrt: () => void;
  audioEnabled: boolean;
  onToggleAudio: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  wallet,
  onConnectWallet,
  onDisconnectWallet,
  onFaucet,
  crtEnabled,
  onToggleCrt,
  audioEnabled,
  onToggleAudio,
}) => {
  const [showWalletModal, setShowWalletModal] = useState(false);
  const { address: wagmiAddress, isConnected: isWagmiConnected } = useAccount();
  const { formatted: countdownFormatted } = useLaunchCountdown();

  const isConnected = Boolean(isWagmiConnected || wallet.isConnected);
  const activeAddress = wagmiAddress || wallet.address;

  const handleOpenWalletModal = () => {
    sound.playBlip(600, 'square', 0.08);
    setShowWalletModal(true);
  };

  return (
    <header className="border-b border-emerald-900/50 bg-[#080a08]/95 backdrop-blur-sm sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-3">
        {/* Logo: Pixelated Shield/Guard icon + "ROBIN GUARD" text */}
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 border border-[#00ff88] bg-[#00ff88]/10 flex items-center justify-center shadow-[0_0_12px_rgba(0,255,136,0.3)]">
            <svg
              className="w-5 h-5 text-[#00ff88]"
              viewBox="0 0 16 16"
              fill="currentColor"
              shapeRendering="crispEdges"
            >
              <rect x="3" y="2" width="10" height="2" fill="#00ff88" />
              <rect x="2" y="4" width="12" height="4" fill="#00ff88" />
              <rect x="3" y="8" width="10" height="3" fill="#059669" />
              <rect x="5" y="11" width="6" height="2" fill="#00ff88" />
              <rect x="7" y="13" width="2" height="2" fill="#00ff88" />
              <rect x="7" y="5" width="2" height="4" fill="#080a08" />
              <rect x="5" y="6" width="6" height="2" fill="#080a08" />
            </svg>
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

        {/* Global Fixed Launch Countdown indicator in Header: Sep 26, 2026 06:00 UTC+4 */}
        <div className="hidden md:flex items-center gap-2 border border-emerald-900/60 bg-[#0c130e] px-3 py-1 text-xs font-mono">
          <Clock className="w-3.5 h-3.5 text-[#00ff88] animate-pulse" />
          <span className="text-neutral-400 text-[11px]">LAUNCH:</span>
          <span className="text-[#00ff88] font-bold tabular-nums tracking-wider text-[11px]">
            {countdownFormatted}
          </span>
        </div>

        {/* Network badge: "Robinhood Chain" with a green status pulse dot */}
        <div className="hidden lg:flex items-center gap-2 border border-emerald-900/60 bg-[#0c130e] px-3 py-1">
          <div className="relative flex items-center justify-center w-2.5 h-2.5">
            <span className="absolute w-2.5 h-2.5 rounded-none bg-[#00ff88] animate-ping opacity-75"></span>
            <span className="relative w-2 h-2 rounded-none bg-[#00ff88]"></span>
          </div>
          <span className="text-xs font-mono text-neutral-200">
            Robinhood Chain
          </span>
        </div>

        {/* Right Actions: CRT, Audio, Connect Wallet */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* CRT toggle */}
          <button
            onClick={() => {
              sound.playToggle(!crtEnabled);
              onToggleCrt();
            }}
            title={crtEnabled ? "Disable CRT Scanlines" : "Enable CRT Scanlines"}
            className={`p-2 border transition-colors cursor-pointer ${
              crtEnabled
                ? 'border-[#00ff88] text-[#00ff88] bg-[#00ff88]/10'
                : 'border-emerald-900/60 text-neutral-400 hover:text-neutral-200 bg-[#0c130e]'
            }`}
          >
            <Monitor className="w-4 h-4" />
          </button>

          {/* Sound FX Toggle */}
          <button
            onClick={() => {
              sound.playToggle(!audioEnabled);
              onToggleAudio();
            }}
            title={audioEnabled ? "Mute 8-Bit Audio" : "Unmute 8-Bit Audio"}
            className={`p-2 border transition-colors cursor-pointer ${
              audioEnabled
                ? 'border-[#00ff88] text-[#00ff88] bg-[#00ff88]/10'
                : 'border-emerald-900/60 text-neutral-400 hover:text-neutral-200 bg-[#0c130e]'
            }`}
          >
            {audioEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
          </button>

          {/* CONNECT WALLET UI STATES */}
          {!isConnected ? (
            <div className="flex items-center gap-2">
              <button
                onClick={handleOpenWalletModal}
                className="pixel-btn-action border-2 border-[#00ff88] bg-[#00ff88] text-black px-3.5 sm:px-4 py-1.5 font-pixel text-[11px] sm:text-xs tracking-wider uppercase font-bold hover:bg-[#00ff88]/90 cursor-pointer shadow-[0_0_15px_rgba(0,255,136,0.4)]"
              >
                CONNECT WALLET
              </button>
              <button
                onClick={() => {
                  sound.playBlip(500, 'square', 0.05);
                  onConnectWallet();
                }}
                title="1-Click Instant Demo Sandbox"
                className="hidden sm:inline-flex items-center gap-1 border border-dashed border-[#a3e635]/60 hover:border-[#a3e635] bg-[#a3e635]/10 hover:bg-[#a3e635]/20 text-[#a3e635] px-2 py-1 font-mono text-[10px] cursor-pointer"
              >
                <Sparkles className="w-3 h-3 text-[#a3e635]" />
                <span>DEMO</span>
              </button>
            </div>
          ) : (
            <button
              onClick={handleOpenWalletModal}
              className="pixel-btn-action border border-emerald-700 bg-[#0c130e] text-neutral-200 px-3 py-1.5 font-mono text-xs hover:border-[#00ff88] hover:text-[#00ff88] flex items-center gap-2 cursor-pointer shadow-[0_0_10px_rgba(0,255,136,0.15)]"
            >
              {/* Pixel avatar placeholder */}
              <div className="w-4 h-4 bg-[#00ff88]/20 border border-[#00ff88] flex items-center justify-center text-[8px] font-pixel text-[#00ff88]">
                G
              </div>
              <span className="w-1.5 h-1.5 bg-[#00ff88] animate-pulse"></span>
              <span className="font-bold">{shortenAddress(activeAddress)}</span>
              <span className="text-[10px] text-emerald-500 hidden sm:inline">
                ({wallet.ethBalance.toFixed(3)} ETH)
              </span>
            </button>
          )}
        </div>
      </div>

      {/* Clean Inline Wallet Modal */}
      <WalletModal
        isOpen={showWalletModal}
        onClose={() => setShowWalletModal(false)}
        onManualConnectDemo={onConnectWallet}
        mockAddress={wallet.address}
        isMockConnected={wallet.isConnected}
        onMockDisconnect={onDisconnectWallet}
        onFaucet={onFaucet}
        ethBalance={wallet.ethBalance}
        guardBalance={wallet.guardBalance}
      />
    </header>
  );
};
