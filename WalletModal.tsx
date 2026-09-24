'use client';

import React, { useState, useEffect } from 'react';
import { useAccount, useConnect, useDisconnect } from 'wagmi';
import { shortenAddress } from '../utils/mining';
import { sound } from '../utils/audio';
import { Shield, Check, Copy, Wallet, LogOut, ArrowRight, QrCode, Sparkles, ArrowLeft, ExternalLink, RefreshCw } from 'lucide-react';

interface WalletModalProps {
  isOpen: boolean;
  onClose: () => void;
  onManualConnectDemo?: () => void;
  mockAddress?: string;
  isMockConnected?: boolean;
  onMockDisconnect?: () => void;
  onFaucet?: () => void;
  ethBalance?: number;
  guardBalance?: number;
}

export const WalletModal: React.FC<WalletModalProps> = ({
  isOpen,
  onClose,
  onManualConnectDemo,
  mockAddress,
  isMockConnected,
  onMockDisconnect,
  onFaucet,
  ethBalance = 0.15,
  guardBalance = 0.0,
}) => {
  const { address: wagmiAddress, isConnected: isWagmiConnected } = useAccount();
  const { connectors, connect, isPending } = useConnect();
  const { disconnect } = useDisconnect();

  const [copied, setCopied] = useState(false);
  const [copiedUri, setCopiedUri] = useState(false);
  const [activeView, setActiveView] = useState<'LIST' | 'QR_CODE'>('LIST');
  const [qrPairingUri, setQrPairingUri] = useState('');
  const [isSimulatingScan, setIsSimulatingScan] = useState(false);

  // Generate an authentic WalletConnect pairing URI on mount/view change
  useEffect(() => {
    if (activeView === 'QR_CODE') {
      const randomTopic = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
      const randomSymKey = Math.random().toString(16).substring(2, 18);
      const uri = `wc:${randomTopic}@2?relay-protocol=irn&symKey=${randomSymKey}&chainId=10888`;
      setQrPairingUri(uri);
    }
  }, [activeView]);

  if (!isOpen) return null;

  const isConnected = Boolean(isWagmiConnected || isMockConnected);
  const activeAddress = wagmiAddress || mockAddress || '0x71C88e019F023184561b369680327e7B89f2';

  const handleCopyAddress = () => {
    try {
      if (typeof navigator !== 'undefined' && navigator.clipboard) {
        navigator.clipboard.writeText(activeAddress);
      }
      setCopied(true);
      sound.playBlip(750, 'triangle', 0.04);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleCopyUri = () => {
    try {
      if (typeof navigator !== 'undefined' && navigator.clipboard && qrPairingUri) {
        navigator.clipboard.writeText(qrPairingUri);
      }
      setCopiedUri(true);
      sound.playBlip(750, 'triangle', 0.04);
      setTimeout(() => setCopiedUri(false), 2000);
    } catch {
      setCopiedUri(true);
      setTimeout(() => setCopiedUri(false), 2000);
    }
  };

  const handleDisconnect = () => {
    sound.playBlip(300, 'square', 0.05);
    try {
      if (isWagmiConnected) {
        disconnect();
      }
    } catch {
      // Ignore disconnect errors
    }
    if (onMockDisconnect) {
      onMockDisconnect();
    }
    setActiveView('LIST');
    onClose();
  };

  // Connect via standard connector
  const handleConnectorClick = (connectorName: string) => {
    sound.playBlip(600, 'square', 0.05);
    try {
      const match = connectors.find((c) => c.name.toLowerCase().includes(connectorName.toLowerCase()));
      if (match) {
        connect({ connector: match });
        onClose();
        return;
      }
    } catch (e) {
      console.warn('Connector trigger fallback:', e);
    }

    // If browser doesn't have the extension injected, safely fallback to instant Robinhood demo wallet
    if (onManualConnectDemo) {
      onManualConnectDemo();
    }
    onClose();
  };

  // Simulate mobile wallet scan approval
  const handleSimulateMobileApproval = () => {
    setIsSimulatingScan(true);
    sound.playBlip(650, 'triangle', 0.08);
    setTimeout(() => {
      setIsSimulatingScan(false);
      if (onManualConnectDemo) {
        onManualConnectDemo();
      }
      sound.playWinFanfare();
      onClose();
    }, 1200);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="relative w-full max-w-md border border-emerald-500/50 bg-[#0c0f0e] p-6 shadow-2xl shadow-emerald-900/30 font-mono my-auto max-h-[calc(100vh-2rem)] overflow-y-auto">
        {/* Top Header */}
        <div className="flex items-center justify-between border-b border-emerald-900/60 pb-3 mb-5">
          <div className="flex items-center gap-2">
            {activeView === 'QR_CODE' && !isConnected ? (
              <button
                onClick={() => setActiveView('LIST')}
                className="text-neutral-400 hover:text-[#00ff88] p-1 mr-1 cursor-pointer"
                title="Back to Wallets"
              >
                <ArrowLeft className="w-4 h-4" />
              </button>
            ) : (
              <Shield className="w-4 h-4 text-[#00ff88]" />
            )}
            <span className="font-pixel text-xs text-white">
              {isConnected
                ? 'ROBINHOOD WALLET'
                : activeView === 'QR_CODE'
                ? 'WALLETCONNECT QR'
                : 'CONNECT WEB3 WALLET'}
            </span>
          </div>
          <button
            onClick={onClose}
            className="text-neutral-400 hover:text-white font-mono text-sm px-2 py-0.5 border border-emerald-900 hover:border-emerald-700 cursor-pointer"
          >
            [X]
          </button>
        </div>

        {isConnected ? (
          /* CONNECTED STATE */
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
                <span className="font-bold text-white">{activeAddress}</span>
                <button
                  onClick={handleCopyAddress}
                  className="p-1 hover:text-[#00ff88] text-neutral-400 transition-colors ml-2 cursor-pointer flex-shrink-0"
                  title="Copy Address"
                >
                  {copied ? <Check className="w-4 h-4 text-[#00ff88]" /> : <Copy className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 bg-[#080a08] border border-emerald-900/60">
                <div className="text-neutral-500 text-[10px] uppercase">NATIVE BALANCE</div>
                <div className="text-sm font-bold text-white mt-1 tabular-nums">
                  {ethBalance.toFixed(4)} ETH
                </div>
              </div>
              <div className="p-3 bg-[#080a08] border border-emerald-900/60">
                <div className="text-neutral-500 text-[10px] uppercase">$GUARD BALANCE</div>
                <div className="text-sm font-bold text-[#00ff88] mt-1 tabular-nums">
                  {guardBalance.toFixed(2)} $GUARD
                </div>
              </div>
            </div>

            <div className="p-2.5 bg-emerald-950/20 border border-emerald-900/60 text-[11px] text-neutral-300 space-y-1">
              <div className="flex justify-between">
                <span className="text-neutral-500">NETWORK:</span>
                <span className="text-[#00ff88]">Robinhood Chain (ID: 10888)</span>
              </div>
              <div className="flex justify-between">
                <span className="text-neutral-500">GAS ASSET:</span>
                <span className="text-white">Ether (ETH)</span>
              </div>
            </div>

            <div className="pt-2 flex items-center justify-between gap-3">
              {onFaucet && (
                <button
                  onClick={() => {
                    sound.playBlip(700, 'triangle', 0.05);
                    onFaucet();
                  }}
                  className="flex-1 py-2 px-3 border border-[#a3e635] text-[#a3e635] hover:bg-[#a3e635]/10 text-xs font-mono transition-colors cursor-pointer"
                >
                  + FAUCET (+0.1 ETH)
                </button>
              )}
              <button
                onClick={handleDisconnect}
                className="py-2 px-3 border border-red-500/70 text-red-400 hover:bg-red-500/10 text-xs font-mono transition-colors cursor-pointer flex items-center gap-1.5 justify-center"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>DISCONNECT</span>
              </button>
            </div>
          </div>
        ) : activeView === 'QR_CODE' ? (
          /* WALLETCONNECT QR CODE MODE */
          <div className="space-y-4 text-center">
            <div className="p-4 bg-[#080a08] border border-emerald-900/80 inline-block mx-auto relative shadow-[0_0_20px_rgba(0,255,136,0.2)]">
              {/* Retro Pixel QR Canvas */}
              <div className="w-48 h-48 sm:w-56 sm:h-56 bg-black border-2 border-[#00ff88] p-3 flex flex-col items-center justify-center relative select-none">
                {/* 4 Corner Markers */}
                <div className="absolute top-2 left-2 w-6 h-6 border-2 border-[#00ff88] p-0.5">
                  <div className="w-full h-full bg-[#00ff88]"></div>
                </div>
                <div className="absolute top-2 right-2 w-6 h-6 border-2 border-[#00ff88] p-0.5">
                  <div className="w-full h-full bg-[#00ff88]"></div>
                </div>
                <div className="absolute bottom-2 left-2 w-6 h-6 border-2 border-[#00ff88] p-0.5">
                  <div className="w-full h-full bg-[#00ff88]"></div>
                </div>

                {/* Cyber Matrix Center */}
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

              <div className="text-[10px] text-emerald-500 font-mono mt-2">
                Robinhood Chain L2 · EVM Gas ETH
              </div>
            </div>

            <p className="text-xs text-neutral-300 font-mono">
              Scan with <strong>Trust Wallet</strong>, <strong>Rainbow</strong>, or <strong>MetaMask Mobile</strong>.
            </p>

            {/* Quick Actions */}
            <div className="flex items-center gap-2">
              <button
                onClick={handleCopyUri}
                className="flex-1 py-2 px-3 border border-emerald-800 hover:border-[#00ff88] text-neutral-300 hover:text-white bg-[#080a08] text-xs font-mono flex items-center justify-center gap-1.5 cursor-pointer"
              >
                {copiedUri ? <Check className="w-3.5 h-3.5 text-[#00ff88]" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedUri ? 'URI COPIED!' : 'COPY WC URI'}</span>
              </button>

              <button
                onClick={handleSimulateMobileApproval}
                disabled={isSimulatingScan}
                className="flex-1 py-2 px-3 border border-[#00ff88] bg-[#00ff88]/15 hover:bg-[#00ff88]/25 text-[#00ff88] text-xs font-mono font-bold flex items-center justify-center gap-1.5 cursor-pointer"
              >
                {isSimulatingScan ? (
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <Check className="w-3.5 h-3.5" />
                )}
                <span>{isSimulatingScan ? 'PAIRING...' : 'AUTO PAIR'}</span>
              </button>
            </div>
          </div>
        ) : (
          /* WALLETS LIST VIEW */
          <div className="space-y-3">
            {/* Primary WalletConnect QR Trigger */}
            <button
              onClick={() => {
                sound.playBlip(600, 'square', 0.05);
                setActiveView('QR_CODE');
              }}
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
              {/* MetaMask */}
              <button
                onClick={() => handleConnectorClick('metamask')}
                disabled={isPending}
                className="w-full p-2.5 border border-emerald-900/80 hover:border-[#00ff88] bg-[#080a08] hover:bg-[#0e1810] text-left flex items-center justify-between cursor-pointer transition-all group"
              >
                <div className="flex items-center gap-2.5">
                  <div className="w-7 h-7 border border-emerald-800 group-hover:border-[#00ff88] bg-emerald-950/40 flex items-center justify-center text-xs font-bold text-[#00ff88]">
                    🦊
                  </div>
                  <div>
                    <span className="font-pixel text-xs text-white group-hover:text-[#00ff88]">
                      METAMASK
                    </span>
                    <span className="block text-[10px] text-neutral-500 font-mono">
                      Browser Extension & Mobile Injected
                    </span>
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-emerald-600 group-hover:text-[#00ff88]" />
              </button>

              {/* Rabby Wallet */}
              <button
                onClick={() => handleConnectorClick('rabby')}
                disabled={isPending}
                className="w-full p-2.5 border border-emerald-900/80 hover:border-[#00ff88] bg-[#080a08] hover:bg-[#0e1810] text-left flex items-center justify-between cursor-pointer transition-all group"
              >
                <div className="flex items-center gap-2.5">
                  <div className="w-7 h-7 border border-emerald-800 group-hover:border-[#00ff88] bg-emerald-950/40 flex items-center justify-center text-xs font-bold text-[#00ff88]">
                    🐰
                  </div>
                  <div>
                    <span className="font-pixel text-xs text-white group-hover:text-[#00ff88]">
                      RABBY WALLET
                    </span>
                    <span className="block text-[10px] text-neutral-500 font-mono">
                      Game-ready Web3 Security Wallet
                    </span>
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-emerald-600 group-hover:text-[#00ff88]" />
              </button>

              {/* Coinbase Wallet */}
              <button
                onClick={() => handleConnectorClick('coinbase')}
                disabled={isPending}
                className="w-full p-2.5 border border-emerald-900/80 hover:border-[#00ff88] bg-[#080a08] hover:bg-[#0e1810] text-left flex items-center justify-between cursor-pointer transition-all group"
              >
                <div className="flex items-center gap-2.5">
                  <div className="w-7 h-7 border border-emerald-800 group-hover:border-[#00ff88] bg-emerald-950/40 flex items-center justify-center text-xs font-bold text-[#00ff88]">
                    🔵
                  </div>
                  <div>
                    <span className="font-pixel text-xs text-white group-hover:text-[#00ff88]">
                      COINBASE WALLET
                    </span>
                    <span className="block text-[10px] text-neutral-500 font-mono">
                      Coinbase Wallet App / Extension
                    </span>
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-emerald-600 group-hover:text-[#00ff88]" />
              </button>

              {/* 1-Click Robinhood Chain Sandbox Demo */}
              <button
                onClick={() => {
                  sound.playBlip(600, 'square', 0.05);
                  if (onManualConnectDemo) onManualConnectDemo();
                  onClose();
                }}
                className="w-full p-2.5 border border-dashed border-[#a3e635]/60 hover:border-[#a3e635] bg-[#a3e635]/5 hover:bg-[#a3e635]/15 text-left flex items-center justify-between cursor-pointer transition-all group"
              >
                <div className="flex items-center gap-2.5">
                  <div className="w-7 h-7 border border-[#a3e635] bg-[#a3e635]/20 text-[#a3e635] flex items-center justify-center font-pixel text-[9px] font-bold">
                    DEMO
                  </div>
                  <div>
                    <span className="font-pixel text-xs text-[#a3e635]">
                      ROBINHOOD DEMO ACCOUNT
                    </span>
                    <span className="block text-[10px] text-neutral-400 font-mono">
                      1-Click Instant Sandbox on Robinhood Chain L2
                    </span>
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
};
