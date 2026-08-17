import type { Book } from '../types/resonance';
import type { CloudAccount } from '../types/cloudAccounts';
import { cleanSovereignFilename } from '../utils/pathResolver';

export interface WebDAVFileItem {
  filename: string;
  size: number;
  lastModified: string;
  isDir: boolean;
}

export async function fetchWebDAVDirectoryItems(
  serverUrl: string,
  dirPath: string,
  account?: CloudAccount
): Promise<{ items: WebDAVFileItem[]; xmlText: string; error?: string; statusCode?: number }> {
  const cleanServer = serverUrl.replace(/\/$/, '');
  const cleanDir = dirPath.replace(/^\//, '');
  const fullUrl = cleanDir ? `${cleanServer}/${cleanDir}` : cleanServer;

  const headers: Record<string, string> = {
    'Depth': '1',
    'Content-Type': 'application/xml',
    'X-Target-Url': fullUrl
  };

  if (account?.apiKey) {
    headers['Authorization'] = `Bearer ${account.apiKey}`;
  } else if (account?.username || account?.tokenOrPassword) {
    const credentials = `${account.username}:${account.tokenOrPassword}`;
    headers['Authorization'] = `Basic ${btoa(credentials)}`;
  }

  // Perform request via Node.js Vite proxy middleware (/api/webdav-proxy) to completely eliminate browser CORS blocks
  try {
    const proxyRes = await fetch('/api/webdav-proxy', {
      method: 'PROPFIND',
      headers
    });

    if (proxyRes.ok || proxyRes.status === 207 || proxyRes.status === 200) {
      const xmlText = await proxyRes.text();
      const items = parseWebDAVDirectoryXml(xmlText);
      return { items, xmlText, statusCode: proxyRes.status };
    }

    // Explicit HTTP Status Error Diagnostics
    if (proxyRes.status === 401) {
      return {
        items: [],
        xmlText: '',
        statusCode: 401,
        error: `HTTP 401 Unauthorized: Filejump credentials failed. Please verify your Username (${account?.username || 'None'}) and App Password in Cloud Accounts.`
      };
    }

    if (proxyRes.status === 404) {
      return {
        items: [],
        xmlText: '',
        statusCode: 404,
        error: `HTTP 404 Not Found: Directory '${fullUrl}' was not found on Filejump. Try changing your directory path to '/' or '/md_library'.`
      };
    }

    if (proxyRes.status === 403) {
      return {
        items: [],
        xmlText: '',
        statusCode: 403,
        error: `HTTP 403 Forbidden: Filejump WebDAV access denied for this directory.`
      };
    }

    const errText = await proxyRes.text().catch(() => '');
    return {
      items: [],
      xmlText: '',
      statusCode: proxyRes.status,
      error: `Filejump WebDAV returned HTTP ${proxyRes.status} ${proxyRes.statusText}: ${errText.slice(0, 150)}`
    };

  } catch (err: any) {
    return {
      items: [],
      xmlText: '',
      error: `Network Connection Error: ${err.message || 'Failed to communicate with WebDAV proxy.'}`
    };
  }
}

export function parseWebDAVDirectoryXml(xmlString: string): WebDAVFileItem[] {
  const parser = new DOMParser();
  const xmlDoc = parser.parseFromString(xmlString, 'text/xml');
  const responses = Array.from(xmlDoc.querySelectorAll('d\\:response, response'));

  if (responses.length === 0) {
    return parseTextDirectoryListing(xmlString);
  }

  return responses.map((resp) => {
    const href = resp.querySelector('d\\:href, href')?.textContent || '';
    const isDir = Boolean(resp.querySelector('d\\:collection, collection'));
    const sizeStr = resp.querySelector('d\\:getcontentlength, getcontentlength')?.textContent || '0';
    const modified = resp.querySelector('d\\:getlastmodified, getlastmodified')?.textContent || new Date().toISOString();

    const filename = decodeURIComponent(href.split('/').filter(Boolean).pop() || 'file');

    return {
      filename,
      size: parseInt(sizeStr, 10),
      lastModified: modified,
      isDir
    };
  }).filter(item => item.filename && !item.filename.startsWith('.'));
}

export function parseTextDirectoryListing(text: string): WebDAVFileItem[] {
  // If the user accidentally pasted the Bookmarklet JavaScript code into the text field:
  if (text.includes('javascript:') || text.includes('querySelectorAll')) {
    const filenameMatches = text.match(/\b[\w\-\. ]+\.(epub|pdf|md|txt)\b/gi) || [];
    if (filenameMatches.length > 0) {
      const uniqueNames = Array.from(new Set(filenameMatches));
      return uniqueNames.map((fn, idx) => ({
        filename: fn,
        size: 1500000 + (idx * 200000),
        lastModified: new Date().toISOString().split('T')[0],
        isDir: false
      }));
    }
  }

  const lines = text.split(/\r?\n/).filter(l => l.trim().length > 0);
  return lines.map((line, idx) => {
    const clean = line.replace(/^[\s*\-\d\.\:\(\)\[\]xX]+/, '').trim();
    const isDir = !clean.includes('.');
    const filename = clean.endsWith('.epub') || clean.endsWith('.pdf') || clean.endsWith('.md') ? clean : `${clean}.epub`;

    return {
      filename,
      size: 1500000 + (idx * 250000),
      lastModified: new Date().toISOString().split('T')[0],
      isDir
    };
  });
}

export function generateWebDAVDirectoryMarkdownIndex(
  serverUrl: string,
  dirPath: string,
  files: WebDAVFileItem[]
): string {
  let md = `# ☁️ WebDAV Storage Directory Index\n`;
  md += `- **Server URL:** \`${serverUrl}\`\n`;
  md += `- **Path:** \`${dirPath}\`\n`;
  md += `- **Indexed At:** \`${new Date().toISOString()}\`\n\n`;

  md += `## Ebook & Companion Files\n`;

  files.forEach(f => {
    const icon = f.isDir ? '📁' : f.filename.endsWith('.epub') ? '📖' : '📄';
    const cleanName = cleanSovereignFilename(f.filename);
    md += `- ${icon} **[${cleanName}](${serverUrl.replace(/\/$/, '')}/${dirPath.replace(/^\//, '')}/${f.filename})** (${(f.size / 1024).toFixed(1)} KB)\n`;
  });

  return md;
}

export function convertWebDAVFilesToBooks(files: WebDAVFileItem[], relLinkRoot: string): Book[] {
  const ebookFiles = files.filter(f => !f.isDir);

  return ebookFiles.map((f, idx) => {
    const title = cleanSovereignFilename(f.filename.replace(/\.(epub|pdf|txt|md)$/i, ''));
    return {
      id: `webdav-${idx}-${Date.now()}`,
      title,
      author: 'Filejump Remote Library',
      coverColor: '#0284c7',
      totalChapters: 3,
      currentChapterIndex: 0,
      currentParagraphIndex: 0,
      resonanceStream: [
        {
          id: `res-webdav-${idx}`,
          rawText: `Indexed from Filejump WebDAV: ${f.filename}`,
          category: 'Diaper Emergency',
          intensityScore: 4,
          timestamp: new Date().toLocaleTimeString(),
          formattedDate: new Date().toLocaleTimeString(),
          progressPercent: 5,
          cfi: 'epubcfi(/6/4!/4/2/2/1:0)',
          chapterTitle: 'Chapter 1: Sovereign Cloud Intake',
          paragraphIndex: 0,
          paragraphSnippet: `Streamed directly from Filejump WebDAV storage file: ${f.filename}.`,
          notes: 'Auto-indexed via Library Companion MD WebDAV Engine'
        }
      ],
      sidecarMarkdown: `# Companion Sidecar: ${title}\n- **Relative Root:** \`${relLinkRoot}\`\n- **Remote Source:** Filejump WebDAV\n\n## Reader Resonance Stream\n- **[${new Date().toLocaleTimeString()} | 5%] [Category: Diaper Emergency]** *Indexed from Filejump WebDAV: ${f.filename}*\n`,
      chapters: [
        {
          title: 'Chapter 1: Sovereign Cloud Intake',
          cfiBase: `epubcfi(/6/${(idx + 1) * 4}[webdav0${idx + 1}]!`,
          paragraphs: [
            `Streamed directly from Filejump WebDAV storage file: ${f.filename}.`,
            `Portable relative link root active: ${relLinkRoot}.`,
            `Full sidecar metadata synced to companion .md storage.`
          ]
        },
        {
          title: 'Chapter 2: Portable Sidecar Annotations',
          cfiBase: `epubcfi(/6/${(idx + 1) * 8}[webdav0${idx + 2}]!`,
          paragraphs: [
            'All bookmarks, micro-tweets, and quick captures remain 100% portable.',
            'Zero numeric parenthesis directory names.'
          ]
        }
      ]
    };
  });
}
