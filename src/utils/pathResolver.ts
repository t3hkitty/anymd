/**
 * Sanitizes book/author titles to clean meow file paths.
 * Strips Calibre-style parentheses numbers e.g. "Dune (1249)" -> "Dune"
 */
export function cleanMeowFilename(input: string): string {
  if (!input) return 'Untitled';
  return input
    .replace(/\s*\(\d+\)\s*/g, '') // remove numbers in parentheses like (1249)
    .trim();
}

/**
 * Normalizes a file path to clean meow Markdown format.
 * Author/Title/Title.epub
 */
export function buildMeowBookPath(author: string, title: string, extension: string = 'epub'): string {
  const cleanAuth = cleanMeowFilename(author).replace(/[^a-zA-Z0-9\s_-]/g, '').trim();
  const cleanTitle = cleanMeowFilename(title).replace(/[^a-zA-Z0-9\s_-]/g, '').trim();
  return `${cleanAuth || 'Unknown_Author'}/${cleanTitle || 'Untitled_Book'}.${extension}`;
}

/**
 * Resolves a Moon+ Reader style relative link root (rel_link_root)
 * E.g. root = "cloud://WebDAV/Books" or "./Library"
 */
export function resolveMoonPlusLink(relRoot: string, author: string, title: string, filename: string): string {
  const cleanRoot = (relRoot || './Library').replace(/\/+$/, '');
  const cleanAuth = cleanMeowFilename(author);
  const cleanTitle = cleanMeowFilename(title);
  
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
  const cleanT = cleanMeowFilename(title);
  const cleanA = cleanMeowFilename(author);
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
