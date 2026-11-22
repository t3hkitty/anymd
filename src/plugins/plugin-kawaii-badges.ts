/**
 * Plugin: plugin-kawaii-badges
 * Optional visual/status badge and kawaii token layer without altering underlying plain-text .md semantics.
 */

export function getKawaiiBadge(vaultArea: string): { emoji: string; label: string; color: string } {
  switch (vaultArea) {
    case 'writing-sensei':
      return { emoji: '🌸', label: 'Writing Sensei', color: 'bg-rose-500/20 text-rose-300 border-rose-500/40' };
    case 'docs-dono':
      return { emoji: '📚', label: 'Docs Dono', color: 'bg-indigo-500/20 text-indigo-300 border-indigo-500/40' };
    case 'art-chan':
      return { emoji: '🎨', label: 'Art Chan', color: 'bg-amber-500/20 text-amber-300 border-amber-500/40' };
    case 'library-senpai':
      return { emoji: '🐱', label: 'Library Senpai', color: 'bg-purple-500/20 text-purple-300 border-purple-500/40' };
    case 'scripts-senpai':
      return { emoji: '⚡', label: 'Scripts Senpai', color: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40' };
    default:
      return { emoji: '🐾', label: 'AnyMD Vault', color: 'bg-slate-500/20 text-slate-300 border-slate-500/40' };
  }
}
