import { http, createConfig } from 'wagmi';
import { defineChain } from 'viem';
import { injected, walletConnect, coinbaseWallet } from 'wagmi/connectors';
import { createWeb3Modal } from '@web3modal/wagmi/react';

// WalletConnect Project ID (Public / Env with fallback)
export const projectId = '3a8170812b534d0ff9d794f19a901d64';

// Custom Robinhood Chain L2 EVM network configuration
export const robinhoodChain = defineChain({
  id: 10888,
  name: 'Robinhood Chain',
  nativeCurrency: {
    name: 'Ether',
    symbol: 'ETH',
    decimals: 18,
  },
  rpcUrls: {
    default: {
      http: ['https://rpc.robinhood-chain.network'],
    },
    public: {
      http: ['https://rpc.robinhood-chain.network'],
    },
  },
  blockExplorers: {
    default: {
      name: 'RobinScan',
      url: 'https://explorer.robinhood-chain.network',
    },
  },
});

export const metadata = {
  name: 'Robin Guard',
  description: 'Proof-of-Work NFT Mining on Robinhood Chain',
  url: 'https://robin-guard.network',
  icons: ['https://avatars.githubusercontent.com/u/37784886'],
};

export const wagmiConfig = createConfig({
  chains: [robinhoodChain],
  connectors: [
    injected({ shimDisconnect: true }),
    walletConnect({ projectId, metadata, showQrModal: false }),
    coinbaseWallet({ appName: 'Robin Guard' }),
  ],
  transports: {
    [robinhoodChain.id]: http(),
  },
});

// Initialize official Web3Modal for Wagmi v2 safely
if (typeof window !== 'undefined') {
  try {
    createWeb3Modal({
      wagmiConfig,
      projectId,
      defaultChain: robinhoodChain,
      enableAnalytics: false,
      themeMode: 'dark',
      themeVariables: {
        '--w3m-accent': '#00ff88',
        '--w3m-color-mix': '#080a08',
        '--w3m-color-mix-strength': 40,
        '--w3m-border-radius-master': '1px',
        '--w3m-font-family': "'JetBrains Mono', monospace",
        '--w3m-z-index': 99999,
      },
    });
  } catch (err) {
    console.warn('Optional Web3Modal initialization bypassed:', err);
  }
}
