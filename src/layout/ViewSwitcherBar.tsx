import React from 'react';
import { Grid, List, Layers, Bookmark, HardDrive } from 'lucide-react';

export type ViewLayoutType = 'Grid' | 'List' | '3D' | 'Spines' | 'Hangers';

interface ViewSwitcherBarProps {
  activeLayout: ViewLayoutType;
  onLayoutChange: (layout: ViewLayoutType) => void;
  noteCount: number;
}

export const ViewSwitcherBar: React.FC<ViewSwitcherBarProps> = ({
  activeLayout,
  onLayoutChange,
  noteCount,
}) => {
  const layouts: { id: ViewLayoutType; icon: React.ReactNode; label: string }[] = [
    { id: 'Grid', icon: <Grid size={14} />, label: 'Grid' },
    { id: 'List', icon: <List size={14} />, label: 'List' },
    { id: '3D', icon: <Layers size={14} />, label: '3D' },
    { id: 'Spines', icon: <Bookmark size={14} />, label: 'Spines' },
    { id: 'Hangers', icon: <HardDrive size={14} />, label: 'Hangers' },
  ];

  return (
    <div className="flex justify-between items-center px-6 py-2.5 bg-neutral-900/40 border-b border-neutral-800">
      <span className="text-[11px] font-mono text-neutral-500">
        Showing {noteCount} items
      </span>

      <div className="flex space-x-1.5">
        {layouts.map((l) => (
          <button
            key={l.id}
            onClick={() => onLayoutChange(l.id)}
            className={`flex items-center space-x-1 px-2.5 py-1 rounded font-mono text-xs transition-all cursor-pointer ${
              activeLayout === l.id
                ? 'bg-neutral-800 text-sky-400 border border-neutral-700'
                : 'text-neutral-500 hover:text-neutral-300'
            }`}
            title={`${l.label} View`}
          >
            {l.icon}
            <span>{l.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
};
