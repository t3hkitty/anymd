import type { CloudAccount } from '../types/cloudAccounts';
import { parseWebDAVDirectoryXml } from './webdavIndexerPlugin';

export interface WebDAVTestResult {
  success: boolean;
  statusCode?: number;
  message: string;
  itemsDiscovered?: number;
  writeVerified?: boolean;
}

export async function testRealWebDAVConnection(account: CloudAccount): Promise<WebDAVTestResult> {
  try {
    const targetUrl = account.serverUrl;
    const headers: Record<string, string> = {
      'Depth': '1',
      'X-Target-Url': targetUrl
    };

    if (account.apiKey) {
      headers['Authorization'] = `Bearer ${account.apiKey}`;
    } else if (account.username || account.tokenOrPassword) {
      const creds = `${account.username}:${account.tokenOrPassword}`;
      headers['Authorization'] = `Basic ${btoa(creds)}`;
    }

    // 1. Perform PROPFIND Read Test via proxy
    const res = await fetch('/api/webdav-proxy', {
      method: 'PROPFIND',
      headers
    });

    if (!res.ok && res.status !== 207 && res.status !== 200) {
      return {
        success: false,
        statusCode: res.status,
        message: `WebDAV server returned HTTP ${res.status}: ${res.statusText}`,
        writeVerified: false
      };
    }

    const xmlText = await res.text();
    const items = parseWebDAVDirectoryXml(xmlText);

    // 2. Perform Live Remote WebDAV PUT Write Test
    if (account.accessMode === 'read-only') {
      return {
        success: true,
        statusCode: res.status,
        message: `Read Test OK (${items.length} items). Write test skipped (Account in Read-Only mode).`,
        itemsDiscovered: items.length,
        writeVerified: false
      };
    }

    const writeTestResult = await testWebDAVWritePermission(account);
    if (writeTestResult.success) {
      return {
        success: true,
        statusCode: res.status,
        message: `Read & Write Test SUCCESSFUL! (${items.length} items found, PUT write verified)`,
        itemsDiscovered: items.length,
        writeVerified: true
      };
    } else {
      return {
        success: true,
        statusCode: res.status,
        message: `Read Test OK (${items.length} items), but PUT write test failed: ${writeTestResult.message}`,
        itemsDiscovered: items.length,
        writeVerified: false
      };
    }
  } catch (err: any) {
    return {
      success: false,
      message: `Connection Error: ${err.message || 'Failed to connect to WebDAV server.'}`,
      writeVerified: false
    };
  }
}

export async function testWebDAVWritePermission(
  account: CloudAccount
): Promise<{ success: boolean; message: string }> {
  try {
    const cleanServer = account.serverUrl.replace(/\/$/, '');
    const writeTestUrl = `${cleanServer}/.lc-md-write-test.txt`;

    const headers: Record<string, string> = {
      'Content-Type': 'text/plain; charset=utf-8',
      'X-Target-Url': writeTestUrl
    };

    if (account.apiKey) {
      headers['Authorization'] = `Bearer ${account.apiKey}`;
    } else if (account.username || account.tokenOrPassword) {
      const creds = `${account.username}:${account.tokenOrPassword}`;
      headers['Authorization'] = `Basic ${btoa(creds)}`;
    }

    const res = await fetch('/api/webdav-proxy', {
      method: 'PUT',
      headers,
      body: `LC-MD Write Permission Test Ping [${new Date().toISOString()}]`
    });

    if (res.ok || res.status === 201 || res.status === 204 || res.status === 200) {
      return {
        success: true,
        message: 'Remote PUT write test succeeded (HTTP 200/201/204 OK)'
      };
    } else {
      return {
        success: false,
        message: `HTTP ${res.status} ${res.statusText}`
      };
    }
  } catch (err: any) {
    return {
      success: false,
      message: err.message || 'Remote PUT write network error'
    };
  }
}

export async function saveSidecarToWebDAV(
  account: CloudAccount,
  filename: string,
  markdownContent: string
): Promise<{ success: boolean; message: string }> {
  if (account.accessMode === 'read-only') {
    return {
      success: false,
      message: 'Account is set to Read-Only mode. Remote sidecar saving is locked.'
    };
  }

  try {
    const cleanServer = account.serverUrl.replace(/\/$/, '');
    const targetUrl = `${cleanServer}/${filename.replace(/^\//, '')}`;

    const headers: Record<string, string> = {
      'Content-Type': 'text/markdown; charset=utf-8',
      'X-Target-Url': targetUrl
    };

    if (account.apiKey) {
      headers['Authorization'] = `Bearer ${account.apiKey}`;
    } else if (account.username || account.tokenOrPassword) {
      const creds = `${account.username}:${account.tokenOrPassword}`;
      headers['Authorization'] = `Basic ${btoa(creds)}`;
    }

    const res = await fetch('/api/webdav-proxy', {
      method: 'PUT',
      headers,
      body: markdownContent
    });

    if (res.ok || res.status === 201 || res.status === 204 || res.status === 200) {
      return {
        success: true,
        message: `Successfully saved ${filename} to ${account.name}!`
      };
    } else {
      return {
        success: false,
        message: `Remote WebDAV PUT failed with HTTP ${res.status}`
      };
    }
  } catch (err: any) {
    return {
      success: false,
      message: `Save Error: ${err.message}`
    };
  }
}
