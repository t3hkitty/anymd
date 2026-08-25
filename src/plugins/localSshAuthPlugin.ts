export interface MeowUserAccount {
  username: string;
  displayName: string;
  email?: string;
  sshPublicKey: string;
  sshPrivateKeyFingerprint: string;
  authMethod: 'ssh_key' | 'local_encrypted_pwd';
  createdTimestamp: string;
  isAdmin: boolean;
  allowedSidecarPaths: string[];
}

export const INITIAL_SOVEREIGN_ACCOUNTS: MeowUserAccount[] = [
  {
    username: 'lorik_admin',
    displayName: 'Lorik (Meow Admin)',
    email: 'lorik@artkitty.net',
    sshPublicKey: 'ssh-ed25519 AAAAC3NzaC1lZDI1NTE5AAAAIG7... lorik@midphase.local',
    sshPrivateKeyFingerprint: 'SHA256:x91Kz+M3qP82... (ed25519)',
    authMethod: 'ssh_key',
    createdTimestamp: '2026-08-17',
    isAdmin: true,
    allowedSidecarPaths: ['/vault/all', '/sidecars/*']
  },
  {
    username: 'wife_piplup',
    displayName: 'Wife (Piplup & Dawn Reader 🐧)',
    email: 'wife@artkitty.net',
    sshPublicKey: 'ssh-ed25519 AAAAC3NzaC1lZDI1NTE5AAAAIH9... wife@midphase.local',
    sshPrivateKeyFingerprint: 'SHA256:k73Pz+L9aM41... (ed25519)',
    authMethod: 'ssh_key',
    createdTimestamp: '2026-08-17',
    isAdmin: false,
    allowedSidecarPaths: ['/vault/piplup', '/vault/danmei']
  }
];

export function getSavedMeowAccounts(): MeowUserAccount[] {
  try {
    const raw = localStorage.getItem('lc_md_meow_accounts');
    if (raw) return JSON.parse(raw);
  } catch (err) {
    console.warn('Failed to load meow accounts:', err);
  }
  return INITIAL_SOVEREIGN_ACCOUNTS;
}

export function saveMeowAccounts(accounts: MeowUserAccount[]): void {
  try {
    localStorage.setItem('lc_md_meow_accounts', JSON.stringify(accounts));
  } catch (err) {
    console.warn('Failed to save meow accounts:', err);
  }
}

export function generateSshKeypair(username: string): { publicKey: string; privateKeySnippet: string; fingerprint: string } {
  const randomHash = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
  const pub = `ssh-ed25519 AAAAC3NzaC1lZDI1NTE5AAAAI${randomHash.toUpperCase()} ${username}@meow-vault`;
  const finger = `SHA256:${randomHash.substring(0, 12)}... (ed25519)`;
  const priv = `-----BEGIN OPENSSH PRIVATE KEY-----\nb3BlbnNzaC1rZXktdjEAAAAABG5vbmUAAAAEbm9uZQAAAAAAAAABAAAAMwAAAAtz\nc2gtZWQyNTUxOQAAAC${randomHash.substring(0, 16)}...\n-----END OPENSSH PRIVATE KEY-----`;

  return { publicKey: pub, privateKeySnippet: priv, fingerprint: finger };
}

export function generateSshAuthorizedKeys(accounts: MeowUserAccount[] = getSavedMeowAccounts()): string {
  return `# Meow Anymd authorized_keys (Zero Cloud Access)
# Path: ~/.ssh/authorized_keys
${accounts.map(a => `${a.sshPublicKey} # user: ${a.username}`).join('\n')}
`;
}
