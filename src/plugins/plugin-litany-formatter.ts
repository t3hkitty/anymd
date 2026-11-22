/**
 * Plugin: plugin-litany-formatter
 * Enforces [YYYYMMDD-HHMM] Pacific Time Zettelkasten headers, #zettelkasten tag blocks,
 * summary/peripheral/raw snippet sections, and YAML frontmatter hygiene.
 */

import { generatePacificTimestamp, type VaultNote } from '../core/md-vault-engine/vaultEngine';

export function formatLitanyZettel(title: string, summary: string, rawSnippet: string, vaultArea = 'writing-sensei'): string {
  const ptId = generatePacificTimestamp();
  const frontmatter = [
    '---',
    `title: "${title}"`,
    `created_pt: "${ptId}"`,
    `vault_area: "${vaultArea}"`,
    `tags: ["#zettelkasten", "#litany", "#somatic"]`,
    `status: "active"`,
    '---',
    ''
  ].join('\n');

  const body = [
    `# [${ptId}] ${title}`,
    '',
    '## Core Summary',
    `- ${summary}`,
    '',
    '## Peripheral Nodes & Context',
    '- Connected concepts: [[Zettelkasten Architecture]]',
    '- Tension Vector: Stable focus',
    '',
    '## Raw Transcribed Text / Snippet',
    `> ${rawSnippet}`,
    ''
  ].join('\n');

  return frontmatter + body;
}
