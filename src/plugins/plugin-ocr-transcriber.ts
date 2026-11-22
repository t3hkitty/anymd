/**
 * Plugin: plugin-ocr-transcriber
 * Formats OCR/screenshot transcriptions and link captures with platform/context identification,
 * concise summary bullets, and Zettelkasten timestamps.
 */

import { generatePacificTimestamp } from '../core/md-vault-engine/vaultEngine';

export function formatOcrCaptureNote(rawOcrText: string, sourcePlatform = 'Screenshot / OCR', url?: string): string {
  const ptId = generatePacificTimestamp();
  const title = `Capture: ${sourcePlatform} (${ptId})`;

  const frontmatter = [
    '---',
    `title: "${title}"`,
    `created_pt: "${ptId}"`,
    `vault_area: "docs-dono"`,
    `tags: ["#capture", "#ocr", "#zettelkasten"]`,
    `status: "active"`,
    url ? `source_url: "${url}"` : '',
    '---',
    ''
  ].filter(Boolean).join('\n');

  const body = [
    `# [${ptId}] ${title}`,
    '',
    '## Core Summary',
    '- Automatically transcribed via OCR/Link capture pipeline.',
    `- Platform/Context: ${sourcePlatform}`,
    '',
    '## Transcribed Content & Snippets',
    `> ${rawOcrText.replace(/\n/g, '\n> ')}`,
    ''
  ].join('\n');

  return frontmatter + body;
}
