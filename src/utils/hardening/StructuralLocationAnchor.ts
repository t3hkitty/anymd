/**
 * StructuralLocationAnchor.ts
 * Ported from FBReader ZLTextPosition structural element model.
 * Provides resilient paragraph/offset anchoring that survives viewport resize and font reflows.
 */

export interface StructuralPosition {
  paragraphIndex: number;
  elementIndex: number;
  characterOffset: number;
  percentage: number;
  anchorSnippet?: string;
}

export class StructuralLocationAnchor {
  /**
   * Generates a structural anchor from a DOM text range or node.
   */
  public static createAnchor(
    paragraphIndex: number,
    elementIndex: number,
    characterOffset: number,
    totalParagraphs: number,
    textSnippet = ''
  ): StructuralPosition {
    const percentage = totalParagraphs > 0 ? (paragraphIndex / totalParagraphs) * 100 : 0;
    return {
      paragraphIndex,
      elementIndex,
      characterOffset,
      percentage: Number(percentage.toFixed(2)),
      anchorSnippet: textSnippet.slice(0, 80)
    };
  }

  /**
   * Resolves structural position back into the reflowed DOM elements.
   */
  public static resolveAnchor(
    position: StructuralPosition,
    domParagraphs: HTMLElement[]
  ): HTMLElement | null {
    if (position.paragraphIndex >= 0 && position.paragraphIndex < domParagraphs.length) {
      return domParagraphs[position.paragraphIndex];
    }

    // Heuristic fuzzy match fallback based on anchorSnippet
    if (position.anchorSnippet) {
      for (let i = 0; i < domParagraphs.length; i++) {
        if (domParagraphs[i].innerText.includes(position.anchorSnippet)) {
          return domParagraphs[i];
        }
      }
    }

    return null;
  }
}
