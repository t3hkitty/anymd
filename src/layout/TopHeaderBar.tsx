import React, { useState } from 'react';
import { Settings, RefreshCw, Target, Coins, UserCheck } from 'lucide-react';

export type ModeType = 'WORK' | 'PLAY' | 'PERSONAL' | 'STUDENT';
export type SyncStatusType = 'synced' | 'syncing' | 'local_only' | 'error';

interface TopHeaderBarProps {
  activeMode: ModeType;
  onModeChange: (mode: ModeType) => void;
  syncStatus: SyncStatusType;
  syncTime: string;
  onManualRefresh: () => void;
  onToggleSettings: () => void;
  activeTask?: string;
  vaultWorth?: number;
  costPerEntry?: number;
}

export const TopHeaderBar: React.FC<TopHeaderBarProps> = ({
  activeMode,
  onModeChange,
  syncStatus,
  syncTime,
  onManualRefresh,
  onToggleSettings,
  activeTask = 'Build Vault Manager & MBB Telemetry',
  vaultWorth = 1420,
  costPerEntry = 10,
}) => {
  const [profileMode, setProfileMode] = useState<'mascot' | 'avatar'>('mascot');
  const [currencyUnit, setCurrencyUnit] = useState<'LCMD' | 'USD' | 'GEMS' | 'XP'>('LCMD');
  const [currentTask, setCurrentTask] = useState(activeTask);

  const cycleCurrency = () => {
    const units: ('LCMD' | 'USD' | 'GEMS' | 'XP')[] = ['LCMD', 'USD', 'GEMS', 'XP'];
    const nextIdx = (units.indexOf(currencyUnit) + 1) % units.length;
    setCurrencyUnit(units[nextIdx]);
  };

  const formattedWorth = () => {
    switch (currencyUnit) {
      case 'LCMD':
        return `💰 ${vaultWorth} LCMD`;
      case 'USD':
        return `💵 $${(vaultWorth * (costPerEntry / 10) * 0.25).toFixed(2)}`;
      case 'GEMS':
        return `💎 ${Math.floor(vaultWorth / 5)} Gems`;
      case 'XP':
        return `⚡ ${vaultWorth * 25} XP`;
    }
  };

  const renderSyncStatus = () => {
    switch (syncStatus) {
      case 'synced':
        return (
          <span className="flex items-center text-emerald-400 font-mono text-xs">
            🟢 Synced • {syncTime}
          </span>
        );
      case 'syncing':
        return (
          <span className="flex items-center text-sky-400 font-mono text-xs animate-pulse">
            🔄 Syncing...
          </span>
        );
      case 'local_only':
        return (
          <span className="flex items-center text-amber-400 font-mono text-xs">
            🟡 Local Only
          </span>
        );
      case 'error':
        return (
          <span className="flex items-center text-rose-500 font-mono text-xs">
            🔴 Sync Issue
          </span>
        );
    }
  };

  return (
    <header className="flex flex-col md:flex-row items-center justify-between px-6 py-3 bg-neutral-950/80 border-b border-neutral-800 backdrop-blur-md gap-3">
      {/* Top Left: Logo & Modes */}
      <div className="flex items-center space-x-4">
        <h1 className="text-xl font-bold font-mono tracking-wider text-neutral-100 flex items-center">
          🐱 anymd
        </h1>
        <div className="flex bg-neutral-900 border border-neutral-800 rounded-xl p-0.5 space-x-1">
          {(['WORK', 'PLAY', 'PERSONAL', 'STUDENT'] as ModeType[]).map((mode) => (
            <button
              key={mode}
              onClick={() => onModeChange(mode)}
              className={`px-3 py-1 font-mono text-xs rounded-lg transition-all cursor-pointer ${
                activeMode === mode
                  ? 'bg-sky-950 text-sky-300 font-bold border border-sky-600/50 shadow-inner'
                  : 'text-neutral-400 hover:text-neutral-200'
              }`}
            >
              [ {mode} ]
            </button>
          ))}
        </div>
      </div>

      {/* Top Center: Active Task Anchor Pill */}
      <div 
        onClick={() => {
          const newTask = prompt('Edit current Active Task Goal:', currentTask);
          if (newTask !== null && newTask.trim()) setCurrentTask(newTask.trim());
        }}
        className="flex items-center space-x-2 bg-neutral-900/90 hover:bg-neutral-800 border border-sky-500/40 text-sky-300 font-mono text-xs px-3.5 py-1.5 rounded-full shadow-sm cursor-pointer transition-all hover:scale-[1.02]"
        title="Click to edit current active sprint task"
      >
        <Target size={14} className="text-sky-400 animate-pulse" />
        <span className="font-bold text-[11px] truncate max-w-[280px]">🎯 {currentTask}</span>
      </div>

      {/* Top Right: LCMD Vault Worth Currency Ticker, Mascot Switcher, Refresh & Settings */}
      <div className="flex items-center space-x-3">
        {/* LCMD Currency Flipper / Ticker */}
        <button
          onClick={cycleCurrency}
          className="flex items-center space-x-1.5 bg-amber-950/50 hover:bg-amber-900/70 border border-amber-500/40 text-amber-200 font-mono text-xs px-3 py-1.5 rounded-xl transition-all cursor-pointer shadow-sm hover:scale-[1.02]"
          title="Click to cycle Vault Worth Currency (LCMD / USD / Gems / XP)"
        >
          <Coins size={14} className="text-amber-400" />
          <span className="font-bold">{formattedWorth()}</span>
        </button>

        {/* Mascot Switcher Button */}
        <button
          onClick={() => setProfileMode(profileMode === 'mascot' ? 'avatar' : 'mascot')}
          className="flex items-center space-x-1 bg-purple-950/50 hover:bg-purple-900/70 border border-purple-500/40 text-purple-200 font-mono text-xs px-2.5 py-1.5 rounded-xl transition-all cursor-pointer shadow-sm"
          title="Toggle Mascot Profile Identity"
        >
          {profileMode === 'mascot' ? (
            <span className="font-bold text-sky-300 text-xs">( o.o )</span>
          ) : (
            <UserCheck size={14} className="text-purple-300" />
          )}
        </button>

        {/* Sync & Refresh */}
        <button
          onClick={onManualRefresh}
          className="flex items-center space-x-2 bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 px-3 py-1.5 rounded-xl transition-colors cursor-pointer"
          title="Manual Sync / Refresh"
        >
          {renderSyncStatus()}
          <RefreshCw size={14} className={`text-neutral-400 ${syncStatus === 'syncing' ? 'animate-spin' : ''}`} />
        </button>
        
        {/* Settings */}
        <button
          onClick={onToggleSettings}
          className="p-2 bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 rounded-xl text-neutral-300 hover:text-neutral-100 transition-colors cursor-pointer"
          title="Settings Drawer"
        >
          <Settings size={18} />
        </button>
      </div>
    </header>
  );
};
