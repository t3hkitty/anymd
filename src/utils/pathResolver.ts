/**
 * Sanitizes book/author titles to clean sovereign file paths.
 * Strips Calibre-style parentheses numbers e.g. "Dune (1249)" -> "Dune"
 */
export function cleanSovereignFilename(input: string): string {
  if (!input) return 'Untitled';
  return input
    .replace(/\s*\(\d+\)\s*/g, '') // remove numbers in parentheses like (1249)
    .trim();
}

/**
 * Normalizes a file path to clean sovereign Markdown format.
 * Author/Title/Title.epub
 */
export function buildSovereignBookPath(author: string, title: string, extension: string = 'epub'): string {
  const cleanAuth = cleanSovereignFilename(author).replace(/[^a-zA-Z0-9\s_-]/g, '').trim();
  const cleanTitle = cleanSovereignFilename(title).replace(/[^a-zA-Z0-9\s_-]/g, '').trim();
  return `${cleanAuth || 'Unknown_Author'}/${cleanTitle || 'Untitled_Book'}.${extension}`;
}

/**
 * Resolves a Moon+ Reader style relative link root (rel_link_root)
 * E.g. root = "cloud://WebDAV/Books" or "./Library"
 */
export function resolveMoonPlusLink(relRoot: string, author: string, title: string, filename: string): string {
  const cleanRoot = (relRoot || './Library').replace(/\/+$/, '');
  const cleanAuth = cleanSovereignFilename(author);
  const cleanTitle = cleanSovereignFilename(title);
  
  return `${cleanRoot}/${cleanAuth}/${cleanTitle}/${filename}`;
}

/**
 * Formats frontmatter for companion .md sidecar file with Moon+ relative link root
 */
export function buildCompanionSidecarHeader(
  title: string,
  author: string,
  relRoot: string,
  extraMetadata?: Record<string, string | number | string[]>
): string {
  const cleanT = cleanSovereignFilename(title);
  const cleanA = cleanSovereignFilename(author);
  const root = relRoot || './Library';

  let yaml = `---\n`;
  yaml += `title: "${cleanT}"\n`;
  yaml += `author: "${cleanA}"\n`;
  yaml += `rel_link_root: "${root}"\n`;
  yaml += `book_rel_path: "${resolveMoonPlusLink(root, cleanA, cleanT, `${cleanT}.epub`)}"\n`;
  yaml += `companion_md: "${resolveMoonPlusLink(root, cleanA, cleanT, `${cleanT}.companion.md`)}"\n`;
  yaml += `updated_at: "${new Date().toISOString()}"\n`;

  if (extraMetadata) {
    Object.entries(extraMetadata).forEach(([k, v]) => {
      if (Array.isArray(v)) {
        yaml += `${k}: [${v.map(item => `"${item}"`).join(', ')}]\n`;
      } else {
        yaml += `${k}: "${v}"\n`;
      }
    });
  }

  yaml += `---\n\n`;
  yaml += `# Companion Sidecar: ${cleanT}\n`;
  yaml += `- **Author:** ${cleanA}\n`;
  yaml += `- **Relative Link Root:** \`${root}\`\n\n`;

  return yaml;
}
