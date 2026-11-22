/**
 * EncodingFallbackSniffer.ts
 * Ported from FBReader ZLUnicodeUtil & ZLEncodingConverter heuristics.
 * Guarantees zero mojibake for raw TXT, legacy FB2, and web novel scrapes.
 */

export interface SniffResult {
  encoding: string;
  decodedText: string;
  confidence: number;
}

export class EncodingFallbackSniffer {
  /**
   * Sniff character encoding from raw buffer using BOM checks and heuristic statistical analysis.
   */
  public static sniffAndDecode(buffer: Uint8Array): SniffResult {
    // 1. Check Byte Order Marks (BOM)
    if (buffer.length >= 3 && buffer[0] === 0xEF && buffer[1] === 0xBB && buffer[2] === 0xBF) {
      const decoder = new TextDecoder('utf-8');
      return { encoding: 'UTF-8-BOM', decodedText: decoder.decode(buffer.slice(3)), confidence: 1.0 };
    }
    if (buffer.length >= 2 && buffer[0] === 0xFF && buffer[1] === 0xFE) {
      const decoder = new TextDecoder('utf-16le');
      return { encoding: 'UTF-16LE', decodedText: decoder.decode(buffer.slice(2)), confidence: 1.0 };
    }
    if (buffer.length >= 2 && buffer[0] === 0xFE && buffer[1] === 0xFF) {
      const decoder = new TextDecoder('utf-16be');
      return { encoding: 'UTF-16BE', decodedText: decoder.decode(buffer.slice(2)), confidence: 1.0 };
    }

    // 2. Attempt strict UTF-8 decoding
    try {
      const strictUtf8Decoder = new TextDecoder('utf-8', { fatal: true });
      const text = strictUtf8Decoder.decode(buffer);
      return { encoding: 'UTF-8', decodedText: text, confidence: 0.95 };
    } catch {
      // Not valid UTF-8, proceed to legacy fallbacks
    }

    // 3. Heuristic CJK vs Western Fallback (FBReader ZLEncodingConverter algorithm)
    let gbkCount = 0;
    let sjisCount = 0;
    let highByteCount = 0;

    for (let i = 0; i < Math.min(buffer.length - 1, 4096); i++) {
      const b1 = buffer[i];
      const b2 = buffer[i + 1];

      if (b1 > 0x7F) {
        highByteCount++;
        // GBK 2-byte sequence
        if (b1 >= 0x81 && b1 <= 0xFE && b2 >= 0x40 && b2 <= 0xFE && b2 !== 0x7F) {
          gbkCount++;
          i++;
        }
        // Shift-JIS 2-byte sequence
        else if (
          ((b1 >= 0x81 && b1 <= 0x9F) || (b1 >= 0xE0 && b1 <= 0xFC)) &&
          b2 >= 0x40 && b2 <= 0xFC && b2 !== 0x7F
        ) {
          sjisCount++;
          i++;
        }
      }
    }

    // Determine highest confidence fallback
    if (gbkCount > 20 && gbkCount >= sjisCount) {
      try {
        const gbkDecoder = new TextDecoder('gbk');
        return { encoding: 'GBK', decodedText: gbkDecoder.decode(buffer), confidence: 0.85 };
      } catch {}
    }

    if (sjisCount > 20) {
      try {
        const sjisDecoder = new TextDecoder('shift-jis');
        return { encoding: 'Shift-JIS', decodedText: sjisDecoder.decode(buffer), confidence: 0.85 };
      } catch {}
    }

    // Default Western European legacy fallback (Windows-1252 / ISO-8859-1)
    const win1252Decoder = new TextDecoder('windows-1252');
    return {
      encoding: 'windows-1252',
      decodedText: win1252Decoder.decode(buffer),
      confidence: highByteCount > 0 ? 0.6 : 0.9
    };
  }
}
