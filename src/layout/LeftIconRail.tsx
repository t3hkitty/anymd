import React from 'react';
import { Database, Edit3, Activity, Layers, Settings, User } from 'lucide-react';

interface LeftIconRailProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  onToggleSettings: () => void;
}

export const LeftIconRail: React.FC<LeftIconRailProps> = ({
  activeTab,
  onTabChange,
  onToggleSettings,
}) => {
  const rails = [
    { id: 'vaults', icon: <Database size={20} />, label: 'Vaults' },
    { id: 'drafting', icon: <Edit3 size={20} />, label: 'Drafting' },
    { id: 'inputs', icon: <Activity size={20} />, label: 'Inputs' },
    { id: 'processed', icon: <Layers size={20} />, label: 'Processed' },
  ];

  return (
    <aside className="w-16 bg-neutral-950 border-r border-neutral-900 flex flex-col justify-between items-center py-6 h-full">
      <div className="flex flex-col items-center space-y-6 w-full">
        {/* Cat icon / logo at the top */}
        <div className="text-xl font-bold select-none cursor-default font-mono text-sky-400">
          🐾
        </div>

        {/* Tab Items */}
        <div className="flex flex-col space-y-3 w-full px-2">
          {rails.map((item) => (
            <button
              key={item.id}
              onClick={() => onTabChange(item.id)}
              className={`p-3 rounded-xl flex items-center justify-center transition-all cursor-pointer ${
                activeTab === item.id
                  ? 'bg-sky-950/40 text-sky-400 border border-sky-500/30'
                  : 'text-neutral-500 hover:text-neutral-300 hover:bg-neutral-900/50'
              }`}
              title={item.label}
            >
              {item.icon}
            </button>
          ))}
        </div>
      </div>

      <div className="flex flex-col items-center space-y-4 w-full px-2">
        {/* User icon */}
        <div className="p-3 text-neutral-600 cursor-default">
          <User size={18} />
        </div>

        {/* Settings button */}
        <button
          onClick={onToggleSettings}
          className="p-3 bg-neutral-900/50 border border-neutral-800 hover:border-neutral-700 rounded-xl text-neutral-400 hover:text-neutral-200 transition-all cursor-pointer"
          title="Open Settings Drawer"
        >
          <Settings size={18} />
        </button>
      </div>
    </aside>
  );
};
