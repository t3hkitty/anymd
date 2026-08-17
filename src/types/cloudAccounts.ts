export type CloudPresetId = 'filejump' | 'torbox' | 'koofr' | 'nextcloud' | 'pcloud' | 'google-drive' | 'dropbox' | 'custom-webdav';

export type StorageAccessMode = 'read-write' | 'read-only';
export type ConfigStorageLocation = 'local' | 'remote-cloud';

export interface CloudProviderPreset {
  id: CloudPresetId;
  name: string;
  description: string;
  icon: string;
  defaultServerUrl: string;
  requiresAppPassword?: boolean;
  requiresApiKey?: boolean;
  helpDocUrl?: string;
}

export interface CloudAccount {
  id: string;
  name: string;
  presetId: CloudPresetId;
  serverUrl: string;
  username: string;
  tokenOrPassword: string;
  apiKey?: string;
  remoteRootFolder: string;
  isActive: boolean;
  autoSyncSidecars: boolean;
  accessMode: StorageAccessMode;
  configStorageLocation: ConfigStorageLocation;
  lastSyncedAt?: string;
}
