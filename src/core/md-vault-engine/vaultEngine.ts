/**
 * AnyMD Flat-File Markdown Vault Engine & Rclone Storage Bridge
 * Strictly adheres to Markdown + YAML frontmatter as the sole source of truth.
 * Uses non-FUSE rclone commands for cold vault backup and offload.
 */

export interface VaultNoteFrontmatter {
  title: string;
  created_pt: string; // YYYYMMDD-HHMM in America/Los_Angeles
  vault_area: 'writing-sensei' | 'docs-dono' | 'art-chan' | 'library-senpai' | 'scripts-senpai' | string;
  tags: string[];
  status: 'draft' | 'active' | 'archived' | 'reviewed';
  source_url?: string;
  nuance_brick_id?: string;
}

export interface VaultNote {
  filename: string;
  frontmatter: VaultNoteFrontmatter;
  body: string;
  rawContent: string;
}

export interface RoombaAuditReport {
  totalNotes: number;
  missingFrontmatter: string[];
  duplicateIds: string[];
  brokenLinks: { note: string; target: string }[];
  dryRun: boolean;
}

/**
 * Generate Pacific Time timestamp string (YYYYMMDD-HHMM)
 */
export function generatePacificTimestamp(date = new Date()): string {
  const options: Intl.DateTimeFormatOptions = {
    timeZone: 'America/Los_Angeles',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false
  };
  const formatter = new Intl.DateTimeFormat('en-US', options);
  const parts = formatter.formatToParts(date);
  const p: Record<string, string> = {};
  for (const part of parts) {
    p[part.type] = part.value;
  }
  return `${p.year}${p.month}${p.day}-${p.hour}${p.minute}`;
}

/**
 * Parse raw markdown content into frontmatter and body
 */
export function parseMarkdownNote(filename: string, rawContent: string): VaultNote {
  const fmRegex = /^---\r?\n([\s\S]*?)\r?\n---\r?\n([\s\S]*)$/;
  const match = rawContent.match(fmRegex);

  let frontmatter: VaultNoteFrontmatter = {
    title: filename.replace('.md', ''),
    created_pt: generatePacificTimestamp(),
    vault_area: 'docs-dono',
    tags: ['#zettelkasten'],
    status: 'draft'
  };

  let body = rawContent;

  if (match) {
    const fmText = match[1];
    body = match[2];
    const lines = fmText.split(/\r?\n/);
    for (const line of lines) {
      const [key, ...valParts] = line.split(':');
      if (!key || valParts.length === 0) continue;
      const val = valParts.join(':').trim().replace(/^['"](.*)['"]$/, '$1');
      if (key.trim() === 'title') frontmatter.title = val;
      if (key.trim() === 'created_pt') frontmatter.created_pt = val;
      if (key.trim() === 'vault_area') frontmatter.vault_area = val;
      if (key.trim() === 'status') frontmatter.status = val as any;
      if (key.trim() === 'source_url') frontmatter.source_url = val;
      if (key.trim() === 'nuance_brick_id') frontmatter.nuance_brick_id = val;
      if (key.trim() === 'tags') {
        frontmatter.tags = val.replace(/[\[\]]/g, '').split(',').map(t => t.trim()).filter(Boolean);
      }
    }
  }

  return { filename, frontmatter, body, rawContent };
}

/**
 * Serialize note back to markdown + YAML frontmatter format
 */
export function serializeMarkdownNote(note: VaultNote): string {
  const tagsStr = `[${note.frontmatter.tags.join(', ')}]`;
  const fm = [
    '---',
    `title: "${note.frontmatter.title}"`,
    `created_pt: "${note.frontmatter.created_pt}"`,
    `vault_area: "${note.frontmatter.vault_area}"`,
    `tags: ${tagsStr}`,
    `status: "${note.frontmatter.status}"`,
    note.frontmatter.source_url ? `source_url: "${note.frontmatter.source_url}"` : '',
    note.frontmatter.nuance_brick_id ? `nuance_brick_id: "${note.frontmatter.nuance_brick_id}"` : '',
    '---',
    ''
  ].filter(Boolean).join('\n');

  return fm + '\n' + note.body;
}

/**
 * Vault Roomba Audit: checks frontmatter, duplicate IDs, and broken [[WikiLinks]]
 */
export function runVaultRoombaAudit(notes: VaultNote[], dryRun = true): RoombaAuditReport {
  const missingFrontmatter: string[] = [];
  const idCounts = new Map<string, number>();
  const duplicateIds: string[] = [];
  const brokenLinks: { note: string; target: string }[] = [];
  const noteTitles = new Set(notes.map(n => n.frontmatter.title.toLowerCase()));

  for (const note of notes) {
    if (!note.rawContent.startsWith('---')) {
      missingFrontmatter.push(note.filename);
    }
    const id = note.frontmatter.created_pt;
    idCounts.set(id, (idCounts.get(id) || 0) + 1);

    // Extract [[WikiLinks]]
    const linkRegex = /\[\[(.*?)\]\]/g;
    let match;
    while ((match = linkRegex.exec(note.body)) !== null) {
      const target = match[1].toLowerCase().trim();
      if (!noteTitles.has(target)) {
        brokenLinks.push({ note: note.filename, target: match[1] });
      }
    }
  }

  for (const [id, count] of idCounts.entries()) {
    if (count > 1) duplicateIds.push(id);
  }

  return {
    totalNotes: notes.length,
    missingFrontmatter,
    duplicateIds,
    brokenLinks,
    dryRun
  };
}

/**
 * Non-FUSE Rclone Storage Bridge (Commands generator & runner stub)
 */
export class RcloneStorageBridge {
  private remoteName: string;
  private localStagingDir: string;

  constructor(remoteName = 'gdrive-cold', localStagingDir = './sandbox_vault') {
    this.remoteName = remoteName;
    this.localStagingDir = localStagingDir;
  }

  /**
   * Generate non-FUSE rclone command for syncing local vault to remote storage
   */
  public getSyncCommand(): string {
    return `rclone sync "${this.localStagingDir}" "${this.remoteName}:AnyMD_Cold_Vault" --progress --fast-list`;
  }

  /**
   * Generate rclone copyto command for a single note backup offload
   */
  public getCopytoCommand(noteFilename: string): string {
    return `rclone copyto "${this.localStagingDir}/${noteFilename}" "${this.remoteName}:AnyMD_Cold_Vault/${noteFilename}"`;
  }

  /**
   * Execute sync operation (simulated or via rcd daemon API)
   */
  public async executeSync(): Promise<{ success: boolean; command: string; timestamp: string }> {
    const cmd = this.getSyncCommand();
    console.log(`[Rclone Bridge] Executing non-FUSE sync: ${cmd}`);
    return {
      success: true,
      command: cmd,
      timestamp: generatePacificTimestamp()
    };
  }
}
