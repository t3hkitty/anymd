import React from 'react';
import { Settings, RefreshCw } from 'lucide-react';

export type ModeType = 'WORK' | 'PLAY' | 'PERSONAL' | 'STUDENT';
export type SyncStatusType = 'synced' | 'syncing' | 'local_only' | 'error';

interface TopHeaderBarProps {
  activeMode: ModeType;
  onModeChange: (mode: ModeType) => void;
  syncStatus: SyncStatusType;
  syncTime: string;
  onManualRefresh: () => void;
  onToggleSettings: () => void;
}

export const TopHeaderBar: React.FC<TopHeaderBarProps> = ({
  activeMode,
  onModeChange,
  syncStatus,
  syncTime,
  onManualRefresh,
  onToggleSettings,
}) => {
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
    <header className="flex items-center justify-between px-6 py-4 bg-neutral-950/60 border-b border-neutral-800 backdrop-blur-md">
      <div className="flex items-center space-x-6">
        <h1 className="text-xl font-bold font-mono tracking-wider text-neutral-100 flex items-center">
          🐱 anymd
        </h1>
        <div className="flex bg-neutral-900 border border-neutral-800 rounded-lg p-0.5 space-x-1">
          {(['WORK', 'PLAY', 'PERSONAL', 'STUDENT'] as ModeType[]).map((mode) => (
            <button
              key={mode}
              onClick={() => onModeChange(mode)}
              className={`px-3 py-1 font-mono text-xs rounded transition-all ${
                activeMode === mode
                  ? 'bg-neutral-800 text-sky-300 font-bold border border-neutral-700 shadow-inner'
                  : 'text-neutral-500 hover:text-neutral-300'
              }`}
            >
              [ {mode} ]
            </button>
          ))}
        </div>
      </div>

      <div className="flex items-center space-x-4">
        <button
          onClick={onManualRefresh}
          className="flex items-center space-x-2 bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 px-3 py-1.5 rounded-lg transition-colors cursor-pointer"
          title="Manual Sync / Refresh"
        >
          {renderSyncStatus()}
          <RefreshCw size={14} className={`text-neutral-400 ${syncStatus === 'syncing' ? 'animate-spin' : ''}`} />
        </button>
        
        <button
          onClick={onToggleSettings}
          className="p-2 bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 rounded-lg text-neutral-300 hover:text-neutral-100 transition-colors cursor-pointer"
          title="Settings"
        >
          <Settings size={18} />
        </button>
      </div>
    </header>
  );
};
