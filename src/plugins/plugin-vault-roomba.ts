/**
 * Plugin: plugin-vault-roomba
 * Audits PARA folders (writing-sensei, docs-dono, art-chan, library-senpai, scripts-senpai),
 * flags duplicates, missing frontmatter, and stale drafts with dry-run support.
 */

import { runVaultRoombaAudit, type VaultNote, type RoombaAuditReport } from '../core/md-vault-engine/vaultEngine';

export function executeVaultRoomba(notes: VaultNote[], dryRun = true): RoombaAuditReport {
  console.log(`[Vault Roomba] Running audit across ${notes.length} notes (Dry Run: ${dryRun})`);
  return runVaultRoombaAudit(notes, dryRun);
}
