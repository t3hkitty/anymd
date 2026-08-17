import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// WebDAV CORS Proxy Middleware Plugin for Filejump, TorBox, Koofr & Remote Cloud Storage
export default defineConfig({
  plugins: [
    react(),
    {
      name: 'webdav-cors-proxy',
      configureServer(server) {
        server.middlewares.use('/api/webdav-proxy', async (req, res) => {
          // Handle CORS preflight OPTIONS request
          if (req.method === 'OPTIONS') {
            res.statusCode = 200;
            res.setHeader('Access-Control-Allow-Origin', '*');
            res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PROPFIND, OPTIONS');
            res.setHeader('Access-Control-Allow-Headers', '*');
            res.end();
            return;
          }

          const rawTargetUrl = req.headers['x-target-url'];
          const targetUrl = Array.isArray(rawTargetUrl) ? rawTargetUrl[0] : rawTargetUrl;

          if (!targetUrl) {
            res.statusCode = 400;
            res.setHeader('Access-Control-Allow-Origin', '*');
            res.end('Missing X-Target-Url header');
            return;
          }

          try {
            const rawAuth = req.headers['authorization'];
            const auth = Array.isArray(rawAuth) ? rawAuth[0] : rawAuth;
            const rawDepth = req.headers['depth'];
            const depth = Array.isArray(rawDepth) ? rawDepth[0] : rawDepth;

            const headers: Record<string, string> = {
              'User-Agent': 'Library-Companion-MD/3.8',
              'Accept': '*/*'
            };

            if (auth) headers['Authorization'] = auth;
            if (depth) headers['Depth'] = depth;

            // Forward request to remote WebDAV server with a strict 12-second timeout
            const response = await fetch(targetUrl, {
              method: req.method,
              headers,
              signal: AbortSignal.timeout(12000)
            });

            res.statusCode = response.status;
            res.setHeader('Access-Control-Allow-Origin', '*');
            res.setHeader('Access-Control-Allow-Headers', '*');
            res.setHeader('Content-Type', response.headers.get('content-type') || 'text/xml');

            const body = await response.text();
            res.end(body);
          } catch (err: any) {
            res.statusCode = err.name === 'TimeoutError' || err.name === 'AbortError' ? 504 : 502;
            res.setHeader('Access-Control-Allow-Origin', '*');
            res.end(JSON.stringify({
              error: err.name === 'TimeoutError' ? 'WebDAV Server Request Timed Out (12s)' : (err.message || 'WebDAV Proxy Error')
            }));
          }
        });
      }
    }
  ]
});
