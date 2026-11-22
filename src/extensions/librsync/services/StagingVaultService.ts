/**
 * StagingVaultService.ts — Non-FUSE Cache-First Staging & Offload Pipeline
 * Directs all writes to local C:\ cache staging first, then triggers
 * non-blocking background rclone sync/copy to remotes (Koofr, FileJump, etc.).
 */

import * as fs from 'fs';
import * as path from 'path';
import { RcloneRcClient, VaultRegistry, VaultConfig } from './RcloneRcClient';

export class StagingVaultService {
  private cacheDir: string;
  private rcClient: RcloneRcClient;
  private registry: VaultRegistry;

  constructor(
    cacheDir = 'C:/Users/lorik/AppData/Local/Temp/kittlibr_cache',
    rcClient?: RcloneRcClient,
    registryPath?: string
  ) {
    this.cacheDir = cacheDir;
    this.rcClient = rcClient || new RcloneRcClient();

    if (!fs.existsSync(this.cacheDir)) {
      fs.mkdirSync(this.cacheDir, { recursive: true });
    }

    if (registryPath && fs.existsSync(registryPath)) {
      this.registry = JSON.parse(fs.readFileSync(registryPath, 'utf-8'));
    } else {
      this.registry = {
        version: 1,
        activeVault: 'koofr_main',
        vaults: [
          {
            id: 'local_cache',
            name: 'Local Cache Staging',
            type: 'local',
            path: this.cacheDir,
            readOnly: false
          },
          {
            id: 'koofr_main',
            name: 'Koofr Main Vault',
            type: 'rclone_remote',
            path: 'Koofr:meow-vault/codeneko/Fossforceten',
            readOnly: false
          }
        ]
      };
    }
  }

  public getVaults(): VaultConfig[] {
    return this.registry.vaults;
  }

  public addVault(vault: VaultConfig): void {
    this.registry.vaults = this.registry.vaults.filter(v => v.id !== vault.id);
    this.registry.vaults.push(vault);
  }

  /**
   * Stage a file to local C:\ cache first.
   */
  public async stageFile(relativePath: string, content: Buffer | string): Promise<string> {
    const dest = path.join(this.cacheDir, relativePath);
    const parent = path.dirname(dest);
    if (!fs.existsSync(parent)) {
      fs.mkdirSync(parent, { recursive: true });
    }

    const tempDest = dest + `.tmp.${Date.now()}`;
    await fs.promises.writeFile(tempDest, content);
    await fs.promises.rename(tempDest, dest);
    return dest;
  }

  /**
   * Trigger non-FUSE sync offload from local staging to remote vault.
   */
  public async offloadToRemote(
    targetVaultId: string,
    dryRun = false
  ): Promise<{ status: string; dryRun: boolean }> {
    const target = this.registry.vaults.find(v => v.id === targetVaultId);
    if (!target) {
      throw new Error(`Vault ID not found: ${targetVaultId}`);
    }
    if (target.readOnly) {
      throw new Error(`Cannot offload to read-only vault: ${target.name}`);
    }

    return this.rcClient.syncVault(this.cacheDir, target.path, dryRun);
  }
}
