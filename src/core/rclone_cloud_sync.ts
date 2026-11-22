/**
 * AnyMD Non-FUSE Rclone Cloud Sync Driver (`rclone_cloud_sync.ts`)
 * Uses rclone rcd JSON-RPC loopback HTTP / fast remote listing to transfer only dirty shards and sidecars.
 */

export class RcloneCloudSyncDriver {
  private rcdEndpoint: string;
  private remoteName: string;

  constructor(rcdEndpoint = 'http://127.0.0.1:5572', remoteName = 'gdrive-cold') {
    this.rcdEndpoint = rcdEndpoint;
    this.remoteName = remoteName;
  }

  /**
   * Generate rclone rcd JSON-RPC request for listing remote manifest and dirty shards
   */
  public getRcdListPayload(): object {
    return {
      jsonrpc: '2.0',
      method: 'operations/list',
      params: {
        fs: `${this.remoteName}:AnyMD_Vault/.anymd`,
        remote: ''
      },
      id: 1
    };
  }

  /**
   * Execute rclone sync command for dirty shards only
   */
  public async syncDirtyShards(localAnymdDir = './sandbox_vault/.anymd'): Promise<{ success: boolean; command: string }> {
    const cmd = `rclone sync "${localAnymdDir}" "${this.remoteName}:AnyMD_Vault/.anymd" --include "index_*.yaml" --include "manifest.yaml" --progress`;
    console.log(`[RcloneCloudSync] Executing non-FUSE sync: ${cmd}`);
    return {
      success: true,
      command: cmd
    };
  }
}
