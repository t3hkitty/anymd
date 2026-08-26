import React from 'react';
import { Plus } from 'lucide-react';

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

export const VaultNavStrip: React.FC<VaultNavStripProps> = ({
  activeCategory,
  onCategoryChange,
  activeVault,
  onVaultChange,
  vaults,
  onAddVaultClick,
}) => {
  const filteredVaults = vaults.filter((v) => v.category === activeCategory);

  return (
    <div className="bg-neutral-900 border-b border-neutral-800 px-6 py-3 flex flex-col space-y-2">
      {/* Category Tabs */}
      <div className="flex space-x-2 border-b border-neutral-800 pb-2">
        {(['Books', 'Journal Vaults', 'Blueprints', 'Sandboxes'] as CategoryType[]).map((cat) => (
          <button
            key={cat}
            onClick={() => onCategoryChange(cat)}
            className={`text-xs px-3 py-1 font-mono rounded transition-colors cursor-pointer ${
              activeCategory === cat
                ? 'bg-neutral-800 text-sky-400 font-bold border border-neutral-700'
                : 'text-neutral-500 hover:text-neutral-300 hover:bg-neutral-950'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Vault Name Tabs & Plus Button */}
      <div className="flex items-center space-x-2 overflow-x-auto py-1">
        {filteredVaults.map((vault) => (
          <button
            key={vault.id}
            onClick={() => onVaultChange(vault.id)}
            className={`text-xs px-3 py-1.5 rounded-lg border font-mono transition-all whitespace-nowrap cursor-pointer ${
              activeVault === vault.id
                ? 'bg-sky-950/40 border-sky-500/50 text-sky-300 font-bold'
                : 'bg-neutral-950 border-neutral-800 text-neutral-400 hover:text-neutral-200'
            }`}
          >
            {vault.name}
          </button>
        ))}

        {onAddVaultClick && (
          <button
            onClick={onAddVaultClick}
            className="text-xs px-2.5 py-1.5 rounded-lg border border-dashed border-sky-500/40 bg-sky-950/10 text-sky-400 hover:text-sky-300 hover:border-sky-400 transition-all flex items-center space-x-1 whitespace-nowrap cursor-pointer"
            title="Create New Vault"
          >
            <Plus size={14} />
            <span>New Vault</span>
          </button>
        )}
      </div>
    </div>
  );
};
