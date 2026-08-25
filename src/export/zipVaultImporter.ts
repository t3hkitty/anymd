import JSZip from 'jszip';
import { deriveKeyFromPin } from './zipVaultExporter';

interface ImportedFile {
  name: string;
  content: string;
}

export async function importVaultFromEncryptedZip(
  encryptedData: ArrayBuffer,
  pin: string
): Promise<ImportedFile[]> {
  try {
    const dataView = new Uint8Array(encryptedData);
    
    // Extract salt, iv and cipher text
    const salt = dataView.slice(0, 16);
    const iv = dataView.slice(16, 28);
    const encryptedContent = dataView.slice(28);
    
    const key = await deriveKeyFromPin(pin, salt);
    
    const decryptedBuffer = await window.crypto.subtle.decrypt(
      {
        name: 'AES-GCM',
        iv,
      },
      key,
      encryptedContent
    );
    
    // Load decrypted zip buffer
    const zip = await JSZip.loadAsync(decryptedBuffer);
    const files: ImportedFile[] = [];
    
    // Unpack hierarchy
    const fileKeys = Object.keys(zip.files);
    for (const key of fileKeys) {
      const zFile = zip.files[key];
      if (!zFile.dir) {
        const text = await zFile.async('text');
        files.push({
          name: zFile.name,
          content: text,
        });
      }
    }
    
    return files;
  } catch (err) {
    console.error('Decryption/Import failed:', err);
    throw new Error('Invalid PIN or corrupted archive.');
  }
}
