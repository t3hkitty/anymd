import React from 'react';
import { RefreshCw } from 'lucide-react';
import type { SyncStatusType } from '../layout/TopHeaderBar';

interface SyncStatusIndicatorProps {
  status: SyncStatusType;
  syncTime: string;
}

export const SyncStatusIndicator: React.FC<SyncStatusIndicatorProps> = ({
  status,
  syncTime,
}) => {
  switch (status) {
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
    default:
      return null;
  }
};
