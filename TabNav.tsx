'use client';

import React from 'react';
import { TabType } from '../types';
import { sound } from '../utils/audio';

interface TabNavProps {
  activeTab: TabType;
  onTabChange: (tab: TabType) => void;
  stakedCount: number;
}

export const TabNav: React.FC<TabNavProps> = ({
  activeTab,
  onTabChange,
  stakedCount,
}) => {
  const tabs: { id: TabType; label: string; badge?: string | number }[] = [
    { id: 'MINE', label: 'MINE' },
    { id: 'STAKING', label: 'STAKING', badge: stakedCount > 0 ? `${stakedCount} STAKED` : undefined },
    { id: 'GUARD_TOKEN', label: '$GUARD TOKEN' },
    { id: 'HOW_IT_WORKS', label: 'HOW IT WORKS' },
  ];

  return (
    <div className="border-b border-emerald-900/50 bg-[#080a08] sticky top-16 z-30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <nav className="flex items-center gap-1.5 sm:gap-3 overflow-x-auto py-3 scrollbar-none" aria-label="Tabs">
          {tabs.map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => {
                  sound.playBlip(isActive ? 520 : 680, 'triangle', 0.04);
                  onTabChange(tab.id);
                }}
                className={`group relative px-3.5 sm:px-5 py-2.5 text-xs sm:text-sm font-mono whitespace-nowrap border transition-all cursor-pointer flex items-center gap-2 ${
                  isActive
                    ? 'border-[#00ff88] bg-[#00ff88]/15 text-[#00ff88] shadow-[0_0_14px_rgba(0,255,136,0.3)] font-bold border-b-2'
                    : 'border-emerald-950/80 bg-[#0c130e] text-neutral-400 hover:text-white hover:border-emerald-800'
                }`}
              >
                {/* Glowing neon green indicator arrow */}
                <span className={`text-[10px] ${isActive ? 'text-[#00ff88]' : 'text-transparent group-hover:text-emerald-700'}`}>
                  &gt;
                </span>

                <span>[{tab.label}]</span>

                {/* Optional Badge */}
                {tab.badge !== undefined && (
                  <span
                    className={`text-[10px] px-1.5 py-0.2 border font-mono ${
                      isActive
                        ? 'border-[#00ff88] bg-[#00ff88]/20 text-[#00ff88]'
                        : 'border-emerald-800 bg-[#080a08] text-emerald-400'
                    }`}
                  >
                    {tab.badge}
                  </span>
                )}

                {/* Glowing neon green bottom underline */}
                {isActive && (
                  <span className="absolute bottom-[-1px] left-0 right-0 h-[2px] bg-[#00ff88] shadow-[0_0_8px_#00ff88]"></span>
                )}
              </button>
            );
          })}
        </nav>
      </div>
    </div>
  );
};
