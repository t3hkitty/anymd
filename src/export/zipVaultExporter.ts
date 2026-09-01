import JSZip from 'jszip';

// Helper to derive AES-256 key from a numeric PIN
export async function deriveKeyFromPin(pin: string, salt: Uint8Array): Promise<CryptoKey> {
  const enc = new TextEncoder();
  const baseKey = await window.crypto.subtle.importKey(
    'raw',
    enc.encode(pin),
    'PBKDF2',
    false,
    ['deriveBits', 'deriveKey']
  );
  
  return window.crypto.subtle.deriveKey(
    {
      name: 'PBKDF2',
      salt: salt.buffer as ArrayBuffer,
      iterations: 100000,
      hash: 'SHA-256',
    },
    baseKey,
    { name: 'AES-GCM', length: 256 },
    false,
    ['encrypt', 'decrypt']
  );
}

interface ExportFile {
  name: string;
  content: string;
}

export async function exportVaultToEncryptedZip(
  files: ExportFile[],
  pin: string
): Promise<Blob> {
  const zip = new JSZip();
  
  // Bundle markdown files, sidecars, and configuration
  files.forEach((f) => {
    zip.file(f.name, f.content);
  });
  
  // Add metadata/plugins config mock file
  zip.file('.anymd/plugins/config.json', JSON.stringify({
    version: '1.0',
    rebranded: true,
    mbbEnabled: true,
  }, null, 2));

  // Generate ZIP as array buffer
  const zipBuffer = await zip.generateAsync({ type: 'arraybuffer' });
  
  // Setup Encryption
  const salt = window.crypto.getRandomValues(new Uint8Array(16));
  const iv = window.crypto.getRandomValues(new Uint8Array(12));
  const key = await deriveKeyFromPin(pin, salt);
  
  const encryptedContent = await window.crypto.subtle.encrypt(
    {
      name: 'AES-GCM',
      iv,
    },
    key,
    zipBuffer
  );
  
  // Combine salt + iv + encrypted content into a final output blob
  const finalBuffer = new Uint8Array(salt.length + iv.length + encryptedContent.byteLength);
  finalBuffer.set(salt, 0);
  finalBuffer.set(iv, salt.length);
  finalBuffer.set(new Uint8Array(encryptedContent), salt.length + iv.length);
  
  return new Blob([finalBuffer], { type: 'application/zip' });
}
