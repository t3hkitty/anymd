import React from 'react';

export type CategoryType = 'Books' | 'Journal Vaults' | 'Blueprints' | 'Sandboxes';

interface VaultItem {
  id: string;
  name: string;
  category: CategoryType;
}

const ALL_VAULTS: VaultItem[] = [
  { id: 'storycraft-lore', name: '📖 StoryCraft Lore', category: 'Books' },
  { id: 'calibre-local', name: '📚 Calibre Local Library', category: 'Books' },
  { id: 'anymd-main', name: '🐱 Anymd Primary', category: 'Journal Vaults' },
  { id: 'daily-bullet', name: '📝 Daily Bullet Journal', category: 'Journal Vaults' },
  { id: 'signalstack-discovery', name: '📡 SignalStack Discovery', category: 'Blueprints' },
  { id: 'system-specs', name: '⚙️ System Architect Specs', category: 'Blueprints' },
  { id: 'memory-sandbox', name: '🏖️ Memory Sandbox', category: 'Sandboxes' },
  { id: 'draft-playground', name: '🧪 Draft Playground', category: 'Sandboxes' },
];

interface VaultNavStripProps {
  activeCategory: CategoryType;
  onCategoryChange: (category: CategoryType) => void;
  activeVault: string;
  onVaultChange: (vaultId: string) => void;
}

export const VaultNavStrip: React.FC<VaultNavStripProps> = ({
  activeCategory,
  onCategoryChange,
  activeVault,
  onVaultChange,
}) => {
  const filteredVaults = ALL_VAULTS.filter((v) => v.category === activeCategory);

  return (
    <div className="bg-neutral-900 border-b border-neutral-800 px-6 py-3 flex flex-col space-y-2">
      {/* Category Tabs */}
      <div className="flex space-x-2 border-b border-neutral-800 pb-2">
        {(['Books', 'Journal Vaults', 'Blueprints', 'Sandboxes'] as CategoryType[]).map((cat) => (
          <button
            key={cat}
            onClick={() => onCategoryChange(cat)}
            className={`text-xs px-3 py-1 font-mono rounded transition-colors ${
              activeCategory === cat
                ? 'bg-neutral-800 text-sky-400 font-bold border border-neutral-700'
                : 'text-neutral-500 hover:text-neutral-300 hover:bg-neutral-950'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Vault Name Tabs */}
      <div className="flex space-x-2 overflow-x-auto py-1">
        {filteredVaults.map((vault) => (
          <button
            key={vault.id}
            onClick={() => onVaultChange(vault.id)}
            className={`text-xs px-3 py-1.5 rounded-lg border font-mono transition-all whitespace-nowrap ${
              activeVault === vault.id || (activeVault === 'anymd-main' && vault.id === 'anymd-main')
                ? 'bg-sky-950/40 border-sky-500/50 text-sky-300 font-bold'
                : 'bg-neutral-950 border-neutral-800 text-neutral-400 hover:text-neutral-200'
            }`}
          >
            {vault.name}
          </button>
        ))}
      </div>
    </div>
  );
};
