/**
 * RcloneRcClient.ts — librsync Non-FUSE Rclone Stability Client
 * Direct authenticated communication with loopback rclone rcd (http://127.0.0.1:5572).
 * Eliminates WinFsp / FUSE mount locking, stalls, and drive-letter corruption.
 */

export interface RcloneListResult {
  list: Array<{
    Path: string;
    Name: string;
    Size: number;
    MimeType: string;
    ModTime: string;
    IsDir: boolean;
  }>;
}

export interface VaultConfig {
  id: string;
  name: string;
  type: 'local' | 'rclone_remote';
  path: string; // e.g. "C:/Vault" or "Koofr:meow-vault/library"
  readOnly: boolean;
}

export interface VaultRegistry {
  version: number;
  activeVault: string;
  vaults: VaultConfig[];
}

export class RcloneRcClient {
  private rcBaseUrl: string;
  private authHeader: string;

  constructor(host = '127.0.0.1', port = 5572, user = 'kittlibr', pass = 'meowpass') {
    this.rcBaseUrl = `http://${host}:${port}`;
    this.authHeader = 'Basic ' + Buffer.from(`${user}:${pass}`).toString('base64');
  }

  private async rpc<T>(endpoint: string, params: Record<string, any> = {}): Promise<T> {
    const res = await fetch(`${this.rcBaseUrl}/${endpoint}`, {
      method: 'POST',
      headers: {
        'Authorization': this.authHeader,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(params)
    });

    if (!res.ok) {
      throw new Error(`Rclone RC Error [${endpoint}]: ${res.status} ${res.statusText}`);
    }
    return res.json();
  }

  /**
   * Non-FUSE Directory Listing
   */
  public async listDirectory(remote: string, path: string): Promise<RcloneListResult> {
    return this.rpc<RcloneListResult>('operations/list', {
      fs: remote,
      remote: path,
      opt: { recurse: false }
    });
  }

  /**
   * Safe Sync / Copy with optional Dry Run
   */
  public async syncVault(
    srcFs: string,
    dstFs: string,
    dryRun = false
  ): Promise<{ status: string; dryRun: boolean }> {
    const endpoint = dryRun ? 'sync/copy' : 'sync/copy';
    await this.rpc(endpoint, {
      srcFs,
      dstFs,
      _filter: { ExcludeRule: ['*.tmp', '*.lock'] },
      dryRun
    });
    return { status: 'queued', dryRun };
  }

  /**
   * Query core transfer stats
   */
  public async getStats(): Promise<any> {
    return this.rpc('core/stats');
  }
}
