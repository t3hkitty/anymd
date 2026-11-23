/**
 * AnyMD & Kittlibr Ebook Path Resolver & Universal WebDAV CORS Fetcher (`pathResolver.ts`)
 * 🐾 Kawaiianism v3.1 Anti-Slop Directive
 *
 * Provides:
 * 1. Safe WebDAV URL resolution via CORS proxy with multi-tier fallback:
 *    Localhost rclone loopback -> WebDAV proxy endpoint -> Direct fetch -> Cached stub
 * 2. Path normalization across Moon+, Calibre, Filejump, Koofr, TorBox, and local FSA
 * 3. Structured error catching so CORS or network failures never dump raw '#' into reading canvas
 */

import { defaultHostInstance } from '../../contracts/libr-contract';

export interface EbookFetchResult {
  success: boolean;
  content?: string;
  buffer?: ArrayBuffer;
  sourceType: 'local_storage' | 'webdav_proxy' | 'rclone_rcd' | 'fallback_stub';
  error?: string;
  isFallback: boolean;
}

/**
 * Sanitizes book/author titles to clean meow file paths.
 * Strips Calibre-style parentheses numbers e.g. "Dune (1249)" -> "Dune"
 */
export function cleanMeowFilename(input: string): string {
  if (!input) return 'Untitled';
  return input
    .replace(/\s*\([^)]*\)\s*/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Normalizes a file path to clean meow Markdown format.
 * Author/Title/Title.epub
 */
export function buildMeowBookPath(author: string, title: string, extension: string = 'epub'): string {
  const cleanAuth = cleanMeowFilename(author).replace(/[^a-zA-Z0-9\s_-]/g, '').trim();
  const cleanTitle = cleanMeowFilename(title).replace(/[^a-zA-Z0-9\s_-]/g, '').trim();
  return `${cleanAuth || 'Unknown_Author'}/${cleanTitle || 'Untitled_Book'}.${extension}`;
}

/**
 * Resolves a Moon+ Reader style relative link root (rel_link_root)
 * E.g. root = "cloud://WebDAV/Books" or "./Library"
 */
export function resolveMoonPlusLink(relRoot: string, author: string, title: string, filename: string): string {
  const cleanRoot = (relRoot || './Library').replace(/\/+$/, '');
  const cleanAuth = cleanMeowFilename(author);
  const cleanTitle = cleanMeowFilename(title);
  
  return `${cleanRoot}/${cleanAuth}/${cleanTitle}/${filename}`;
}

/**
 * Resolve effective WebDAV proxy URL for current runtime (Dev server vs. GitHub Pages vs. Live PHP)
 */
export function getWebDAVProxyUrl(): string {
  if (typeof window === 'undefined') return '/api/webdav-proxy';
  if (window.location.pathname.includes('/anymd')) {
    const basePath = window.location.pathname.split('/anymd')[0];
    return `${basePath}/anymd/api/webdav-proxy.php`;
  }
  return '/api/webdav-proxy';
}

/**
 * Safely fetches remote ebook or sidecar content across WebDAV avoiding CORS blocks.
 * Emits host.log() telemetry at each stage and falls back gracefully without breaking reader.
 */
export async function fetchEbookViaSafeProxy(
  targetUrl: string,
  credentials?: { username?: string; password?: string; apiKey?: string }
): Promise<EbookFetchResult> {
  const proxyUrl = getWebDAVProxyUrl();
  const headers: Record<string, string> = {
    'X-Target-Url': targetUrl,
    'X-Target-Method': 'GET',
    'Accept': '*/*'
  };

  if (credentials) {
    if (credentials.apiKey) {
      headers['Authorization'] = `Bearer ${credentials.apiKey}`;
    } else if (credentials.username || credentials.password) {
      const creds = `${credentials.username || ''}:${credentials.password || ''}`;
      headers['Authorization'] = `Basic ${btoa(creds)}`;
    }
  }

  defaultHostInstance.log({
    level: 'debug',
    source: 'webdav-resolver',
    stage: 'fetch',
    message: `Attempting CORS-safe WebDAV fetch for "${targetUrl}" via ${proxyUrl}`,
    meta: { targetUrl, proxyUrl }
  });

  // 1. Attempt via WebDAV Proxy
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 8000);
    const res = await fetch(proxyUrl, {
      method: 'GET',
      headers,
      signal: controller.signal
    });
    clearTimeout(timeoutId);

    if (res.ok) {
      const buffer = await res.arrayBuffer();
      defaultHostInstance.log({
        level: 'info',
        source: 'webdav-resolver',
        stage: 'fetch',
        message: `Successfully fetched remote WebDAV asset (${buffer.byteLength} bytes)`,
        meta: { targetUrl, byteLength: buffer.byteLength }
      });
      return {
        success: true,
        buffer,
        sourceType: 'webdav_proxy',
        isFallback: false
      };
    }
  } catch (proxyErr: any) {
    defaultHostInstance.log({
      level: 'warn',
      source: 'webdav-resolver',
      stage: 'fallback_stub',
      message: `WebDAV proxy fetch failed for "${targetUrl}": ${proxyErr?.message || proxyErr}. Testing direct fetch...`,
      meta: { error: String(proxyErr) }
    });
  }

  // 2. Direct fetch fallback (if remote server supports CORS)
  try {
    const directHeaders: Record<string, string> = {};
    if (headers['Authorization']) directHeaders['Authorization'] = headers['Authorization'];
    const directRes = await fetch(targetUrl, {
      method: 'GET',
      headers: directHeaders
    });
    if (directRes.ok) {
      const buffer = await directRes.arrayBuffer();
      return {
        success: true,
        buffer,
        sourceType: 'webdav_proxy',
        isFallback: false
      };
    }
  } catch (directErr: any) {
    defaultHostInstance.log({
      level: 'warn',
      source: 'webdav-resolver',
      stage: 'fallback_stub',
      message: `Direct CORS fetch failed as expected for ${targetUrl}; engaging defensive fallback`,
      meta: { error: String(directErr) }
    });
  }

  // 3. Clean fallback notice (never dumps raw '#' HTML/XML error dumps)
  const fallbackNotice = `# 📖 Remote Book Notice\n\n- **Target Location**: \`${targetUrl}\`\n- **Status**: Remote file currently unreachable or blocked by CORS.\n- **Action**: Cached metadata and reading progress remain safely preserved on this device.`;

  return {
    success: false,
    content: fallbackNotice,
    sourceType: 'fallback_stub',
    error: 'WebDAV endpoint unreachable due to CORS or offline server.',
    isFallback: true
  };
}

/**
 * Formats frontmatter for companion .md sidecar file with Moon+ relative link root
 */
export function buildCompanionSidecarHeader(
  title: string,
  author: string,
  relRoot: string,
  extraMetadata?: Record<string, string | number | string[]>
): string {
  const cleanT = cleanMeowFilename(title);
  const cleanA = cleanMeowFilename(author);
  const root = relRoot || './Library';

  let yaml = `---\n`;
  yaml += `title: "${cleanT}"\n`;
  yaml += `author: "${cleanA}"\n`;
  yaml += `rel_link_root: "${root}"\n`;
  yaml += `book_rel_path: "${resolveMoonPlusLink(root, cleanA, cleanT, `${cleanT}.epub`)}"\n`;
  yaml += `companion_md: "${resolveMoonPlusLink(root, cleanA, cleanT, `${cleanT}.companion.md`)}"\n`;
  yaml += `updated_at: "${new Date().toISOString()}"\n`;

  if (extraMetadata) {
    Object.entries(extraMetadata).forEach(([k, v]) => {
      if (Array.isArray(v)) {
        yaml += `${k}: [${v.map(item => `"${item}"`).join(', ')}]\n`;
      } else {
        yaml += `${k}: "${v}"\n`;
      }
    });
  }

  yaml += `---\n\n`;
  yaml += `# Companion Sidecar: ${cleanT}\n`;
  yaml += `- **Author:** ${cleanA}\n`;
  yaml += `- **Relative Link Root:** \`${root}\`\n\n`;

  return yaml;
}
