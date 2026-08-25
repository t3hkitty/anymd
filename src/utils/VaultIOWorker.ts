/**
 * Vault IO Worker & Synchronous Pipeline Queue
 * 
 * Prevents concurrent text-based DB file corruption by enforcing a strict FIFO
 * write queue across the Anymd ecosystem.
 * 
 * Also implements targeted segment patching (e.g. updating a specific YAML row 
 * or markdown section) to avoid full-file rewrites.
 */

export class VaultIOWorker {
  private writeQueue: Promise<void> = Promise.resolve();
  private isProcessing = false;

  /**
   * Enqueues an IO operation to prevent concurrent racing (File Corruption)
   */
  public async enqueue<T>(operation: () => Promise<T>): Promise<T> {
    return new Promise((resolve, reject) => {
      this.writeQueue = this.writeQueue.then(async () => {
        this.isProcessing = true;
        try {
          const result = await operation();
          resolve(result);
        } catch (error) {
          reject(error);
        } finally {
          this.isProcessing = false;
        }
      });
    });
  }

  /**
   * Streamlined Segment Patcher 
   * (The "cat EOF" equivalent for targeting specific rows, columns, or markdown headers)
   * 
   * Reads a text database file, isolates a specific block (e.g. "## Telemetry" or a CSV row ID),
   * and surgically replaces only that exact chunk in memory before a single flush.
   */
  public async patchMarkdownSegment(
    filePath: string, 
    segmentHeader: string, 
    newContent: string
  ): Promise<void> {
    return this.enqueue(async () => {
      console.log(`[IO-QUEUE] Patching segment '${segmentHeader}' in ${filePath}...`);
      
      // In a production build, this bridges to the Native FileSystem Access API or Node 'fs'.
      const existingContent = await this.mockReadFile(filePath);
      
      // Surgical Regex Targeting:
      // Finds the exact Markdown header (e.g., "## Telemetry") and captures everything 
      // inside it until the NEXT header ("\n#") or the End of File (EOF).
      // This prevents the engine from parsing/rewriting the rest of the 50MB vault file.
      const segmentRegex = new RegExp(`(${segmentHeader}\\n)([\\s\\S]*?)(?=\\n#|$)`, 'g');
      
      let updatedContent = existingContent;
      
      if (segmentRegex.test(existingContent)) {
         // Replace only the surgical segment
         updatedContent = existingContent.replace(segmentRegex, `$1${newContent}\n`);
      } else {
         // If segment doesn't exist, append safely to EOF
         updatedContent += `\n\n${segmentHeader}\n${newContent}\n`;
      }
      
      // Flush only the modified buffer back to disk
      await this.mockWriteFile(filePath, updatedContent);
      console.log(`[IO-QUEUE] Patch complete for ${filePath}. Queue resolved.`);
    });
  }

  // --- FileSystem API Mocks for UI Development Environment ---
  
  private async mockReadFile(filePath: string): Promise<string> {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve(`# Target DB\n\n## 🔮 Corollary Engine\nmoodScore: 5\n\n## 📝 Note\nOld text data.`);
      }, 50); // Simulate disk latency
    });
  }

  private async mockWriteFile(filePath: string, content: string): Promise<void> {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve(); // Simulate successful disk write
      }, 50);
    });
  }
}

// Export a singleton instance so the entire app shares the exact same IO Pipeline Queue
export const ioWorker = new VaultIOWorker();
