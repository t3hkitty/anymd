import React, { useState } from 'react';
import { ChevronDown, ChevronUp, Package, Trash2, Send, Plus } from 'lucide-react';

interface MbbQuickActionZippyProps {
  onAddSamples: () => void;
  onPurgeAll: () => void;
  onExportZip: () => void;
  onDeployAgv: () => void;
}

export const MbbQuickActionZippy: React.FC<MbbQuickActionZippyProps> = ({
  onAddSamples,
  onPurgeAll,
  onExportZip,
  onDeployAgv,
}) => {
  const [isOpen, setIsOpen] = useState(true);

  return (
    <div className="border border-neutral-800 bg-neutral-950/40 rounded-lg overflow-hidden my-3 mx-6">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between px-4 py-2.5 bg-neutral-900 border-b border-neutral-800 text-xs font-mono text-neutral-300 hover:text-neutral-100 transition-colors"
      >
        <span className="flex items-center space-x-2">
          <span>🐾 MBB (My Black Box) Micrologging Suite</span>
        </span>
        {isOpen ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
      </button>

      {isOpen && (
        <div className="p-4 flex flex-wrap gap-3 items-center justify-between bg-neutral-950/20">
          <div className="text-[10px] text-neutral-500 font-mono hidden md:block">
            <pre className="leading-tight text-neutral-600">
{`   /\\_/\\
  ( o.o )  My Black Box (MBB) Engine
   > ^ <   Active`}
            </pre>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={onAddSamples}
              className="flex items-center space-x-1.5 bg-neutral-900 hover:bg-emerald-950/30 hover:text-emerald-400 border border-neutral-800 hover:border-emerald-500/30 px-3 py-1.5 rounded-lg text-xs font-mono text-neutral-300 transition-all cursor-pointer"
            >
              <Plus size={12} />
              <span>+ Microlog Samples</span>
            </button>
            <button
              onClick={onPurgeAll}
              className="flex items-center space-x-1.5 bg-neutral-900 hover:bg-rose-950/30 hover:text-rose-400 border border-neutral-800 hover:border-rose-500/30 px-3 py-1.5 rounded-lg text-xs font-mono text-neutral-300 transition-all cursor-pointer"
            >
              <Trash2 size={12} />
              <span>🗑️ Purge All</span>
            </button>
            <button
              onClick={onExportZip}
              className="flex items-center space-x-1.5 bg-neutral-900 hover:bg-sky-950/30 hover:text-sky-400 border border-neutral-800 hover:border-sky-500/30 px-3 py-1.5 rounded-lg text-xs font-mono text-neutral-300 transition-all cursor-pointer"
            >
              <Package size={12} />
              <span>📦 Export ZIP</span>
            </button>
            <button
              onClick={onDeployAgv}
              className="flex items-center space-x-1.5 bg-neutral-900 hover:bg-purple-950/30 hover:text-purple-400 border border-neutral-800 hover:border-purple-500/30 px-3 py-1.5 rounded-lg text-xs font-mono text-neutral-300 transition-all cursor-pointer"
            >
              <Send size={12} />
              <span>🚀 Deploy to AGV</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
