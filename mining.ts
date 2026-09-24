import { RobinGuardNFT, Rarity } from '../types';

import imgGuardPrimary from '../assets/images/pixel_robin_guard_1790261783198.jpg';
import imgMiner from '../assets/images/pixel_nft_miner_1790261281704.jpg';
import imgArcher from '../assets/images/pixel_nft_archer_1790261296083.jpg';
import imgRobot from '../assets/images/pixel_nft_robot_1790261307832.jpg';
import imgCyberpunk from '../assets/images/pixel_nft_cyberpunk_1790261319590.jpg';

export const GUARD_IMAGES = [imgGuardPrimary, imgArcher, imgMiner, imgRobot, imgCyberpunk];

export const GUARD_ROLES = [
  'Vanguard Sentinel',
  'Nexus Enforcer',
  'Robinhood Cyber Ward',
  'Epoch Aegis Guardian',
  'Quantum Shield Unit',
  'Stealth Recon Guard',
  'Overclocked Protector',
  'Prime Node Warden'
];

export function generateRandomHash(): string {
  const chars = '0123456789abcdef';
  let result = '0000';
  for (let i = 0; i < 28; i++) {
    result += chars[Math.floor(Math.random() * chars.length)];
  }
  return '0x' + result;
}

export function generateFastNonce(): number {
  return Math.floor(Math.random() * 9000000) + 1000000;
}

export function shortenAddress(addr: string): string {
  if (!addr || addr.length < 10) return addr;
  return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
}

export function formatTimeAgo(timestamp: number): string {
  const diffSec = Math.max(1, Math.floor((Date.now() - timestamp) / 1000));
  if (diffSec < 60) return `${diffSec}s ago`;
  const diffMin = Math.floor(diffSec / 60);
  if (diffMin < 60) return `${diffMin}m ago`;
  return `${Math.floor(diffMin / 60)}h ago`;
}

// Epoch 1 begins empty as specified in prompt: "No Guards mined yet in Epoch 1. Be the first to start!"
export const INITIAL_GUARDS: RobinGuardNFT[] = [];

export function createNewGuard(idNum: number, minedBy: string, isOwner = false): RobinGuardNFT {
  const rarities: Rarity[] = ['Common', 'Common', 'Elite', 'Elite', 'Commander', 'Prime'];
  const rarity = rarities[Math.floor(Math.random() * rarities.length)];
  const img = GUARD_IMAGES[Math.floor(Math.random() * GUARD_IMAGES.length)];
  const role = GUARD_ROLES[Math.floor(Math.random() * GUARD_ROLES.length)];
  const power = rarity === 'Prime' ? 350 : rarity === 'Commander' ? 280 : rarity === 'Elite' ? 200 : 120;

  return {
    id: `#${String(idNum).padStart(4, '0')}`,
    name: `Robin Guard ${role} #${String(idNum).padStart(4, '0')}`,
    image: img,
    minedBy,
    minedAt: Date.now(),
    epoch: 1,
    hash: generateRandomHash(),
    nonce: generateFastNonce(),
    rarity,
    power,
    isStaked: false,
    isOwner
  };
}
