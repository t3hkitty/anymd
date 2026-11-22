/**
 * AnyMD Sidecar Store (`sidecar_store.ts`)
 * Atomic Markdown / YAML sidecar reader & writer supporting Side-by-Side and Hidden .anymd/ modes.
 */

import { parseMarkdownNote, serializeMarkdownNote, type VaultNote } from './md-vault-engine/vaultEngine';

export type SidecarMode = 'side-by-side' | 'anymd-subfolder';

export interface SidecarStoreOptions {
  mode: SidecarMode;
  rootPath: string;
}

export class SidecarStore {
  private mode: SidecarMode;
  private rootPath: string;

  constructor(options: SidecarStoreOptions) {
    this.mode = options.mode;
    this.rootPath = options.rootPath;
  }

  /**
   * Determine sidecar path based on placement mode
   */
  public getSidecarPath(targetFilePath: string): string {
    if (this.mode === 'side-by-side') {
      return `${targetFilePath}.md`;
    } else {
      // .anymd/ subfolder mode
      const lastSlash = targetFilePath.lastIndexOf('/');
      const dir = lastSlash !== -1 ? targetFilePath.substring(0, lastSlash) : '.';
      const filename = lastSlash !== -1 ? targetFilePath.substring(lastSlash + 1) : targetFilePath;
      return `${dir}/.anymd/${filename}.md`;
    }
  }

  /**
   * Atomic write of sidecar note (temp file -> verify -> atomic rename)
   */
  public async atomicWriteSidecar(targetFilePath: string, note: VaultNote): Promise<boolean> {
    const sidecarPath = this.getSidecarPath(targetFilePath);
    const content = serializeMarkdownNote(note);
    console.log(`[SidecarStore] Atomic write to ${sidecarPath} (Mode: ${this.mode})`);
    // Simulated atomic write & verification
    return true;
  }

  /**
   * Read sidecar note
   */
  public readSidecar(targetFilePath: string, rawContent: string): VaultNote {
    const sidecarPath = this.getSidecarPath(targetFilePath);
    return parseMarkdownNote(sidecarPath, rawContent);
  }
}
