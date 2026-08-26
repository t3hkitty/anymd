/**
 * anymd-adapter.js
 * Dedicated adapter connecting the UI client to the local-first webhook database and storage nodes.
 */
class AnyMDAdapter {
  constructor(port = 3050) {
    this.port = port;
    this.baseUrl = `http://localhost:${port}`;
  }

  /**
   * Pushes a document record via HTTP POST to the local vault webhook receiver.
   */
  async saveToLocalDb(vaultName, filename, content, append = false) {
    const url = `${this.baseUrl}/webhook/${encodeURIComponent(vaultName)}?filename=${encodeURIComponent(filename)}`;
    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ content, append })
      });
      return await response.json();
    } catch (error) {
      console.error('[AnyMD Adapter] Failed to push to local webhook DB:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Generates a fully formatted URL endpoint for webhook triggers.
   */
  getWebhookUrl(vaultName, filename = null) {
    let url = `${this.baseUrl}/webhook/${encodeURIComponent(vaultName)}`;
    if (filename) {
      url += `?filename=${encodeURIComponent(filename)}`;
    }
    return url;
  }
}

window.anymdAdapter = new AnyMDAdapter();
