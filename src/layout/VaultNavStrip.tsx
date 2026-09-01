import React from 'react';
import { Plus, Folder } from 'lucide-react';

export type CategoryType = 'Books' | 'Journal Vaults' | 'Blueprints' | 'Sandboxes';

export interface VaultItem {
  id: string;
  name: string;
  category: CategoryType;
}

interface VaultNavStripProps {
  activeCategory: CategoryType;
  onCategoryChange: (category: CategoryType) => void;
  activeVault: string;
  onVaultChange: (vaultId: string) => void;
  vaults: VaultItem[];
  onAddVaultClick?: () => void;
}

const CATEGORY_COLORS: Record<CategoryType, { bg: string; text: string; border: string; pillActive: string; glow: string }> = {
  'Books': {
    bg: 'bg-indigo-950/80',
    text: 'text-indigo-300',
    border: 'border-indigo-700/60',
    pillActive: 'bg-indigo-900/60 text-indigo-200 border-indigo-500 shadow-indigo-900/30',
    glow: 'shadow-[0_-2px_10px_rgba(99,102,241,0.2)]',
  },
  'Journal Vaults': {
    bg: 'bg-emerald-950/80',
    text: 'text-emerald-300',
    border: 'border-emerald-700/60',
    pillActive: 'bg-emerald-900/60 text-emerald-200 border-emerald-500 shadow-emerald-900/30',
    glow: 'shadow-[0_-2px_10px_rgba(16,185,129,0.2)]',
  },
  'Blueprints': {
    bg: 'bg-amber-950/80',
    text: 'text-amber-300',
    border: 'border-amber-700/60',
    pillActive: 'bg-amber-900/60 text-amber-200 border-amber-500 shadow-amber-900/30',
    glow: 'shadow-[0_-2px_10px_rgba(245,158,11,0.2)]',
  },
  'Sandboxes': {
    bg: 'bg-purple-950/80',
    text: 'text-purple-300',
    border: 'border-purple-700/60',
    pillActive: 'bg-purple-900/60 text-purple-200 border-purple-500 shadow-purple-900/30',
    glow: 'shadow-[0_-2px_10px_rgba(139,92,246,0.2)]',
  },
};

export const VaultNavStrip: React.FC<VaultNavStripProps> = ({
  activeCategory,
  onCategoryChange,
  activeVault,
  onVaultChange,
  vaults,
  onAddVaultClick,
}) => {
  const filteredVaults = vaults.filter((v) => v.category === activeCategory);
  const activeColor = CATEGORY_COLORS[activeCategory];

  return (
    <div className="bg-neutral-950 border-b border-neutral-900 px-6 pt-2 pb-3 flex flex-col space-y-2 select-none">
      {/* Manila Hanging Folder Staggered Tabs */}
      <div className="flex space-x-1.5 items-end border-b border-neutral-800 pb-0 pt-1">
        {(['Books', 'Journal Vaults', 'Blueprints', 'Sandboxes'] as CategoryType[]).map((cat, idx) => {
          const isActive = activeCategory === cat;
          const colors = CATEGORY_COLORS[cat];
          return (
            <button
              key={cat}
              onClick={() => onCategoryChange(cat)}
              style={{ transform: `translateY(${isActive ? '1px' : '0'})` }}
              className={`text-xs px-4 py-1.5 font-mono rounded-t-xl border-t border-x transition-all cursor-pointer flex items-center space-x-1.5 ${
                isActive
                  ? `${colors.bg} ${colors.text} ${colors.border} ${colors.glow} font-bold border-b-transparent z-10 py-2`
                  : 'bg-neutral-900/80 text-neutral-400 border-neutral-800 hover:text-neutral-200 hover:bg-neutral-900'
              }`}
            >
              <Folder size={12} className={isActive ? colors.text : 'text-neutral-500'} />
              <span>{cat}</span>
            </button>
          );
        })}
      </div>

      {/* Color-Inherited Vault Name Pills */}
      <div className="flex items-center space-x-2 overflow-x-auto py-1">
        {filteredVaults.map((vault) => {
          const isVaultActive = activeVault === vault.id;
          return (
            <button
              key={vault.id}
              onClick={() => onVaultChange(vault.id)}
              className={`text-xs px-3 py-1.5 rounded-xl border font-mono transition-all whitespace-nowrap cursor-pointer shadow-sm ${
                isVaultActive
                  ? `${activeColor.pillActive} font-bold scale-[1.02]`
                  : 'bg-neutral-950 border-neutral-900 text-neutral-400 hover:text-neutral-200 hover:border-neutral-800'
              }`}
            >
              {vault.name}
            </button>
          );
        })}

        {onAddVaultClick && (
          <button
            onClick={onAddVaultClick}
            className={`text-xs px-3 py-1.5 rounded-xl border border-dashed ${activeColor.border} ${activeColor.text} bg-neutral-950 hover:bg-neutral-900 transition-all flex items-center space-x-1 whitespace-nowrap cursor-pointer`}
            title="Create New Vault"
          >
            <Plus size={14} />
            <span>+ New Vault</span>
          </button>
        )}
      </div>
    </div>
  );
};
