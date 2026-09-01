export interface GitHubVaultConfig {
  id: string;
  name: string;
  owner: string;
  repo: string;
  branch: string;
  subfolder: string; // e.g. "vault" or "" for root
  pat: string;
  isPrivate: boolean;
  lastSyncedAt?: string;
  status?: 'synced' | 'buffered' | 'offline';
}

export interface GitHubFileEntry {
  path: string;
  name: string;
  sha: string;
  size: number;
  content?: string;
  download_url?: string;
}

export class GitHubVaultService {
  private config: GitHubVaultConfig;

  constructor(config: GitHubVaultConfig) {
    this.config = config;
  }

  private get headers(): HeadersInit {
    const base: Record<string, string> = {
      'Accept': 'application/vnd.github.v3+json',
      'X-GitHub-Api-Version': '2022-11-28',
    };
    if (this.config.pat && this.config.pat.trim().length > 0) {
      base['Authorization'] = `token ${this.config.pat.trim()}`;
    }
    return base;
  }

  /**
   * Helper to format Pacific Time Zettelkasten commit message:
   * feat(note): update ${filename} [YYYYMMDD-HHmm]
   */
  public static getPacificZettelkastenCommitMessage(filename: string, action: string = 'update'): string {
    const now = new Date();
    // Format to America/Los_Angeles (Pacific Time)
    const options: Intl.DateTimeFormatOptions = {
      timeZone: 'America/Los_Angeles',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    };
    const formatter = new Intl.DateTimeFormat('en-US', options);
    const parts = formatter.formatToParts(now);
    
    let year = '', month = '', day = '', hour = '', minute = '';
    for (const p of parts) {
      if (p.type === 'year') year = p.value;
      if (p.type === 'month') month = p.value;
      if (p.type === 'day') day = p.value;
      if (p.type === 'hour') hour = p.value;
      if (p.type === 'minute') minute = p.value;
    }
    
    const timestamp = `${year}${month}${day}-${hour}${minute}`;
    return `feat(note): ${action} ${filename} [${timestamp}]`;
  }

  /**
   * Validates credentials and repository accessibility.
   */
  async verifyConnection(): Promise<{ ok: boolean; message: string; defaultBranch: string }> {
    try {
      const res = await fetch(`https://api.github.com/repos/${this.config.owner}/${this.config.repo}`, {
        headers: this.headers,
      });

      if (!res.ok) {
        if (res.status === 404) return { ok: false, message: 'Repository not found or private (PAT required).', defaultBranch: '' };
        if (res.status === 401) return { ok: false, message: 'Invalid or expired Personal Access Token (PAT).', defaultBranch: '' };
        return { ok: false, message: `GitHub API error: ${res.statusText}`, defaultBranch: '' };
      }

      const data = await res.json();
      return {
        ok: true,
        message: `Connected to ${data.full_name} (${data.private ? 'Private' : 'Public'})`,
        defaultBranch: data.default_branch || 'main',
      };
    } catch (err: any) {
      return { ok: false, message: `Network error: ${err.message}`, defaultBranch: '' };
    }
  }

  /**
   * Recursively pulls the repository file tree for markdown and sidecar files.
   */
  async fetchRemoteFileTree(): Promise<GitHubFileEntry[]> {
    const treeRes = await fetch(
      `https://api.github.com/repos/${this.config.owner}/${this.config.repo}/git/trees/${this.config.branch}?recursive=1`,
      { headers: this.headers }
    );

    if (!treeRes.ok) {
      throw new Error(`Failed to fetch file tree: ${treeRes.statusText}`);
    }

    const treeData = await treeRes.json();
    const cleanSubfolder = this.config.subfolder.replace(/^\/|\/$/g, '');

    return (treeData.tree || [])
      .filter((item: any) => {
        if (item.type !== 'blob') return false;
        if (cleanSubfolder && !item.path.startsWith(cleanSubfolder)) return false;
        return item.path.endsWith('.md') || item.path.endsWith('.json');
      })
      .map((item: any) => ({
        path: item.path,
        name: item.path.split('/').pop() || item.path,
        sha: item.sha,
        size: item.size,
      }));
  }

  /**
   * Fetches raw file contents via the Git Blob API.
   */
  async fetchFileContent(path: string): Promise<string> {
    const res = await fetch(
      `https://api.github.com/repos/${this.config.owner}/${this.config.repo}/contents/${path}?ref=${this.config.branch}`,
      { headers: this.headers }
    );

    if (!res.ok) throw new Error(`Could not fetch file contents: ${res.statusText}`);
    const data = await res.json();

    // Base64 decode supporting UTF-8 payloads
    const binary = atob(data.content.replace(/\s/g, ''));
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) {
      bytes[i] = binary.charCodeAt(i);
    }
    return new TextDecoder().decode(bytes);
  }

  /**
   * Atomic commit / push for creating or updating a Markdown file.
   */
  async commitAndPushFile(path: string, content: string, commitMessage?: string, sha?: string): Promise<void> {
    const filename = path.split('/').pop() || path;
    const msg = commitMessage || GitHubVaultService.getPacificZettelkastenCommitMessage(filename, 'update');

    // UTF-8 to Base64 conversion
    const utf8Bytes = new TextEncoder().encode(content);
    let binary = '';
    utf8Bytes.forEach((b) => (binary += String.fromCharCode(b)));
    const base64Content = btoa(binary);

    const bodyPayload: Record<string, any> = {
      message: msg,
      content: base64Content,
      branch: this.config.branch || 'main',
    };

    if (sha) {
      bodyPayload.sha = sha;
    } else {
      // Check if file exists to fetch sha if updating
      try {
        const existingRes = await fetch(
          `https://api.github.com/repos/${this.config.owner}/${this.config.repo}/contents/${path}?ref=${this.config.branch}`,
          { headers: this.headers }
        );
        if (existingRes.ok) {
          const existingData = await existingRes.json();
          bodyPayload.sha = existingData.sha;
        }
      } catch {
        // Assume fresh file creation
      }
    }

    const res = await fetch(
      `https://api.github.com/repos/${this.config.owner}/${this.config.repo}/contents/${path}`,
      {
        method: 'PUT',
        headers: {
          ...this.headers,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(bodyPayload),
      }
    );

    if (!res.ok) {
      const errData = await res.json().catch(() => ({}));
      throw new Error(errData.message || `Failed to commit to GitHub: ${res.statusText}`);
    }
  }
}

const GITHUB_VAULTS_STORAGE_KEY = 'anymd_github_vaults_v1';

export function getSavedGitHubVaults(): GitHubVaultConfig[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(GITHUB_VAULTS_STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function saveGitHubVaults(vaults: GitHubVaultConfig[]): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(GITHUB_VAULTS_STORAGE_KEY, JSON.stringify(vaults));
}
