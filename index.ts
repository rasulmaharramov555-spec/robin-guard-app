export type TabType = 'MINE' | 'STAKING' | 'GUARD_TOKEN' | 'HOW_IT_WORKS';

export type RigMode = 'CPU' | 'GPU';

export type Rarity = 'Common' | 'Elite' | 'Commander' | 'Legendary' | 'Prime';

export interface RobinGuardNFT {
  id: string; // e.g. "#0001"
  name: string; // e.g. "Robin Guard #0001"
  image: string;
  minedBy: string;
  minedAt: number; // timestamp
  epoch: number;
  hash: string;
  nonce: number;
  rarity: Rarity;
  power: number; // Staking power / Hashrate rating
  isStaked?: boolean;
  isOwner?: boolean;
}

export interface WalletState {
  isConnected: boolean;
  address: string;
  ethBalance: number;
  guardBalance: number;
}

export interface MiningStats {
  status: 'idle' | 'mining' | 'won';
  mode: RigMode;
  usage: number; // 0 - 100, default 75
  hashrate: number; // in H/s
  multiplier: number; // 1.0 or 3.5
  streak: number; // 0x, 1x, etc.
  keepMiningAfterWin: boolean;
  currentNonce: number;
  targetDifficulty: string;
  progressPercent: number;
  lastHash: string;
  totalMinedByPlayer: number;
}
