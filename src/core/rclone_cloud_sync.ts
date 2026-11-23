/**
 * AnyMD Non-FUSE Rclone Cloud Sync Driver (`rclone_cloud_sync.ts`)
 * Kawaiianism v3.1 Anti-Slop Directive
 * Supports:
 * - Local-first zero setup mode (rclone toggled off / local only)
 * - Built-in rclone (rcd on 127.0.0.1:5572 with transfers=8, checkers=16, buffer-size=32Mi, fast-list)
 * - External / Self-hosted rclone (custom rcd endpoint on Termux / remote machine / CLI)
 * - Non-FUSE folder-role mapping (vault, library, backup, custom)
 * - Silent error catching and local fallback (no console spam or UI freeze)
 * - Instrumentation with host.log() diagnostic telemetry
 */

import { defaultHostInstance } from '../../contracts/libr-contract';

export type StorageSyncMode = 'local_only' | 'builtin_rclone' | 'external_rclone';

export type FolderRole = 'vault' | 'library' | 'backup' | 'custom';

export interface FolderRoleMapping {
  role: FolderRole;
  remoteName: string;
  subpath: string;
}

export interface RcloneSyncOptions {
  storageMode?: StorageSyncMode;
  rcdEndpoint?: string;
  remoteName?: string;
  roleMappings?: FolderRoleMapping[];
  cacheDir?: string;
}

export class RcloneCloudSyncDriver {
  private rcdEndpoint: string;
  private remoteName: string;
  private storageMode: StorageSyncMode;
  private roleMappings: FolderRoleMapping[];

  constructor(options: RcloneSyncOptions = {}) {
    this.storageMode = options.storageMode || 'local_only';
    this.rcdEndpoint = (options.rcdEndpoint || 'http://127.0.0.1:5572').replace(/\/$/, '');
    this.remoteName = options.remoteName || 'gdrive-cold';
    this.roleMappings = options.roleMappings || [
      { role: 'vault', remoteName: this.remoteName, subpath: 'AnyMD_Vault' },
      { role: 'backup', remoteName: this.remoteName, subpath: 'AnyMD_Backup' },
      { role: 'library', remoteName: this.remoteName, subpath: 'AnyMD_Library' }
    ];

    defaultHostInstance.log({
      level: 'debug',
      source: 'rclone-driver',
      stage: 'runtime',
      message: `Initialized RcloneCloudSyncDriver in mode: ${this.storageMode}`,
      meta: { endpoint: this.rcdEndpoint, remote: this.remoteName }
    });
  }

  public getStorageMode(): StorageSyncMode {
    return this.storageMode;
  }

  public setStorageMode(mode: StorageSyncMode) {
    this.storageMode = mode;
    defaultHostInstance.log({
      level: 'info',
      source: 'rclone-driver',
      stage: 'runtime',
      message: `Switched rclone storage mode to "${mode}"`,
      meta: { mode }
    });
  }

  public getRcdEndpoint(): string {
    return this.rcdEndpoint;
  }

  public setRcdEndpoint(endpoint: string) {
    this.rcdEndpoint = endpoint.replace(/\/$/, '');
  }

  /**
   * Healthcheck rcd daemon quietly without console errors or crash
   */
  public async checkHealth(): Promise<{ online: boolean; version?: string }> {
    if (this.storageMode === 'local_only') {
      defaultHostInstance.log({
        level: 'info',
        source: 'rclone-driver',
        stage: 'fetch',
        message: 'Healthcheck skipped: local-only zero cloud mode active',
        meta: { stub: true }
      });
      return { online: false, version: 'local-first mode active (zero-cloud)' };
    }
    try {
      defaultHostInstance.log({
        level: 'debug',
        source: 'rclone-driver',
        stage: 'fetch',
        message: `Pinging rclone rcd endpoint: ${this.rcdEndpoint}/core/version`,
        meta: { endpoint: this.rcdEndpoint }
      });

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 1500);
      const res = await fetch(`${this.rcdEndpoint}/core/version`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({}),
        signal: controller.signal
      });
      clearTimeout(timeoutId);
      if (res.ok) {
        const data = await res.json();
        defaultHostInstance.log({
          level: 'info',
          source: 'rclone-driver',
          stage: 'fetch',
          message: `rclone rcd daemon online: ${data?.version || 'connected'}`,
          meta: { version: data?.version }
        });
        return { online: true, version: data?.version || 'rclone-rcd-ok' };
      }
    } catch (err: any) {
      defaultHostInstance.log({
        level: 'warn',
        source: 'rclone-driver',
        stage: 'fallback_stub',
        message: `rclone rcd unreachable at ${this.rcdEndpoint}; seamless offline fallback engaged`,
        meta: { error: String(err?.message || err), fallback: 'local_storage' }
      });
    }
    return { online: false };
  }

  /**
   * Resolve destination path for a given role mapping
   */
  public getDestinationForRole(role: FolderRole, customSubpath?: string): string {
    const mapping = this.roleMappings.find(m => m.role === role);
    const remote = mapping ? mapping.remoteName : this.remoteName;
    const subpath = customSubpath || (mapping ? mapping.subpath : `AnyMD_${role}`);
    return `${remote}:${subpath}`;
  }

  /**
   * Generate rclone rcd JSON-RPC request for listing remote manifest and dirty shards
   */
  public getRcdListPayload(role: FolderRole = 'vault', subpath = '.anymd'): object {
    const dest = this.getDestinationForRole(role, subpath ? `AnyMD_Vault/${subpath}` : undefined);
    return {
      jsonrpc: '2.0',
      method: 'operations/list',
      params: {
        fs: dest,
        remote: ''
      },
      id: 1
    };
  }

  /**
   * Build recommended standalone CLI sync command with optimal performance flags
   */
  public buildCliSyncCommand(
    localDir = './sandbox_vault',
    role: FolderRole = 'vault',
    subpath?: string
  ): string {
    const dest = this.getDestinationForRole(role, subpath);
    return `rclone sync "${localDir}" "${dest}" --transfers=8 --checkers=16 --buffer-size=32Mi --fast-list --progress`;
  }

  /**
   * Execute rclone sync command or trigger via rcd daemon with non-blocking fallback
   */
  public async syncDirtyShards(
    localAnymdDir = './sandbox_vault/.anymd',
    role: FolderRole = 'vault'
  ): Promise<{ success: boolean; command: string; fallbackToLocal?: boolean; message?: string }> {
    const cmd = this.buildCliSyncCommand(localAnymdDir, role, 'AnyMD_Vault/.anymd');

    if (this.storageMode === 'local_only') {
      defaultHostInstance.log({
        level: 'info',
        source: 'rclone-driver',
        stage: 'sync',
        message: 'Sync skipped: local-first mode active. Flat-file shards updated on-device.',
        meta: { localAnymdDir, fallback: true }
      });
      return {
        success: true,
        command: cmd,
        fallbackToLocal: true,
        message: 'Local-only zero cloud mode: changes saved directly to local storage / filesystem.'
      };
    }

    try {
      const health = await this.checkHealth();
      if (!health.online) {
        defaultHostInstance.log({
          level: 'warn',
          source: 'rclone-driver',
          stage: 'fallback_stub',
          message: 'Sync daemon offline; fallen back to local persistence.',
          meta: { command: cmd }
        });
        return {
          success: true,
          command: cmd,
          fallbackToLocal: true,
          message: 'Remote rclone rcd offline. Operating smoothly in local-first mode.'
        };
      }

      // If online, dispatch sync job via JSON-RPC
      const dest = this.getDestinationForRole(role, 'AnyMD_Vault/.anymd');
      defaultHostInstance.log({
        level: 'info',
        source: 'rclone-driver',
        stage: 'sync',
        message: `Dispatching async rclone sync to destination: ${dest}`,
        meta: { srcFs: localAnymdDir, dstFs: dest }
      });

      const res = await fetch(`${this.rcdEndpoint}/sync/sync`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          srcFs: localAnymdDir,
          dstFs: dest,
          _async: true
        })
      });

      if (res.ok) {
        const data = await res.json();
        defaultHostInstance.log({
          level: 'info',
          source: 'rclone-driver',
          stage: 'sync',
          message: `Async sync job #${data?.jobid || 'ok'} queued successfully`,
          meta: { jobid: data?.jobid }
        });
        return {
          success: true,
          command: cmd,
          message: `Dispatched rclone async sync job #${data?.jobid || 'ok'}`
        };
      }
    } catch (err: any) {
      defaultHostInstance.log({
        level: 'error',
        source: 'rclone-driver',
        stage: 'fallback_stub',
        message: `Failed to trigger remote sync; fell back to local mode: ${String(err?.message || err)}`,
        meta: { error: String(err) }
      });
    }

    return {
      success: true,
      command: cmd,
      fallbackToLocal: true,
      message: 'Silent fallback to local flat-file storage.'
    };
  }
}
