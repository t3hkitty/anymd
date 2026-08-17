import type { Book } from '../types/resonance';

export function convertToObsidianVaultFormat(book: Book, relLinkRoot: string): string {
  let md = `---\n`;
  md += `title: "${book.title}"\n`;
  md += `author: "[[${book.author}]]"\n`;
  md += `tags: [book, resonance-stream, calibre-companion-md]\n`;
  md += `rel_link_root: "${relLinkRoot}"\n`;
  md += `---\n\n`;

  md += `# [[${book.title}]]\n`;
  md += `> [!info] Sovereign Companion Sidecar\n`;
  md += `> Author: [[${book.author}]]\n`;
  md += `> Relative Link Root: \`${relLinkRoot}\`\n\n`;

  md += `## Reader Resonance Stream\n`;

  book.resonanceStream.forEach((entry) => {
    md += `> [!quote] **[${entry.formattedDate} | ${entry.progressPercent}%] [Category: ${entry.category}]**\n`;
    md += `> *${entry.rawText}*\n`;
    md += `> - Locator: \`${entry.cfi}\`\n`;
    md += `> - Context: "${entry.paragraphSnippet}"\n\n`;
  });

  return md;
}

export function convertToNotionMarkdownFormat(book: Book): string {
  let md = `# ${book.title}\n`;
  md += `**Author:** ${book.author}\n`;
  md += `**Format:** Companion Sidecar (.md)\n\n`;

  md += `## Reader Resonance Stream\n`;
  book.resonanceStream.forEach((entry) => {
    md += `- **[${entry.formattedDate} | ${entry.progressPercent}%] [Category: ${entry.category}]** *${entry.rawText}*\n`;
  });

  return md;
}
