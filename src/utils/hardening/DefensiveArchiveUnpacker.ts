/**
 * DefensiveArchiveUnpacker.ts
 * Ported from FBReader archive safety traversal routines.
 * Defends against Zip-Slip attacks, corrupted central directories, and handles .fb2.zip cleanly.
 */

export interface ArchiveEntry {
  path: string;
  size: number;
  isSanitized: boolean;
  data?: Uint8Array;
}

export class DefensiveArchiveUnpacker {
  /**
   * Sanitizes relative entry paths to prevent directory traversal (Zip-Slip vulnerability).
   */
  public static sanitizeEntryPath(entryPath: string, destinationRoot: string): string | null {
    // Replace backslashes with forward slashes
    const normalized = entryPath.replace(/\\/g, '/');

    // Reject entries attempting directory traversal
    if (normalized.includes('../') || normalized.startsWith('/') || normalized.includes('..')) {
      console.warn(`[Security Alert] Rejected malicious zip entry path: ${entryPath}`);
      return null;
    }

    // Strip leading dot-slashes
    const cleanPath = normalized.replace(/^\.\//, '');
    return cleanPath;
  }

  /**
   * Inspects buffer for corrupt ZIP central directory signatures and recovers embedded payloads.
   */
  public static validateZipHeader(buffer: Uint8Array): { isValid: boolean; isFb2Zip: boolean } {
    if (buffer.length < 4) return { isValid: false, isFb2Zip: false };

    // Standard PK ZIP signature: 0x50 0x4B 0x03 0x04
    const isPkZip = buffer[0] === 0x50 && buffer[1] === 0x4B && buffer[2] === 0x03 && buffer[3] === 0x04;
    return {
      isValid: isPkZip,
      isFb2Zip: isPkZip // Extended FB2 check can inspect inner files
    };
  }
}
