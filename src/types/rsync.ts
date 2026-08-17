export type RsyncSyncDirection = 'export-push' | 'import-pull';
export type RsyncTargetType = 'ssh-nas' | 'local-folder' | 'rclone-cloud';

export interface RsyncConfig {
  targetType: RsyncTargetType;
  direction: RsyncSyncDirection;
  localPath: string;
  remoteSshHost: string;
  remoteSshPort: number;
  remoteSshUser: string;
  remotePath: string;
  sshKeyPath?: string;
  includeSidecarsOnly: boolean;
  includeBooks: boolean;
  includeConfigFiles: boolean;
  deleteExtraneousFiles: boolean;
  preservePermissions: boolean;
  compressData: boolean;
  dryRunMode: boolean;
}

export interface RsyncManifest {
  version: string;
  createdAt: string;
  config: RsyncConfig;
  filterRules: string[];
}
