import type { YamlMetadataMap } from '../types/readerPlugins';

/**
 * Parses raw Markdown file content and extracts YAML frontmatter as a custom metadata map
 */
export function parseYamlFrontmatter(markdown: string): { metadata: YamlMetadataMap; body: string } {
  const match = markdown.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n([\s\S]*)$/);
  if (!match) {
    return { metadata: {}, body: markdown };
  }

  const yamlStr = match[1];
  const body = match[2];
  const metadata: YamlMetadataMap = {};

  yamlStr.split('\n').forEach((line) => {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) return;

    const colonIdx = trimmed.indexOf(':');
    if (colonIdx === -1) return;

    const key = trimmed.slice(0, colonIdx).trim();
    let valStr = trimmed.slice(colonIdx + 1).trim();

    // Remove quotes
    if ((valStr.startsWith('"') && valStr.endsWith('"')) || (valStr.startsWith("'") && valStr.endsWith("'"))) {
      valStr = valStr.slice(1, -1);
    }

    // Array parsing e.g. [tag1, tag2]
    if (valStr.startsWith('[') && valStr.endsWith(']')) {
      const items = valStr
        .slice(1, -1)
        .split(',')
        .map(i => i.trim().replace(/^["']|["']$/g, ''))
        .filter(Boolean);
      metadata[key] = items;
    } else if (valStr === 'true') {
      metadata[key] = true;
    } else if (valStr === 'false') {
      metadata[key] = false;
    } else if (!isNaN(Number(valStr)) && valStr !== '') {
      metadata[key] = Number(valStr);
    } else {
      metadata[key] = valStr;
    }
  });

  return { metadata, body };
}

/**
 * Stringifies a YamlMetadataMap back into standard Markdown frontmatter
 */
export function stringifyYamlFrontmatter(metadata: YamlMetadataMap, body: string): string {
  let yaml = `---\n`;
  Object.entries(metadata).forEach(([k, v]) => {
    if (Array.isArray(v)) {
      yaml += `${k}: [${v.map(item => `"${item}"`).join(', ')}]\n`;
    } else if (typeof v === 'boolean' || typeof v === 'number') {
      yaml += `${k}: ${v}\n`;
    } else {
      yaml += `${k}: "${v}"\n`;
    }
  });
  yaml += `---\n\n`;
  yaml += body.replace(/^---\r?\n[\s\S]*?\r?\n---\r?\n?/, '').trim();
  return yaml;
}

/**
 * Updates or sets a single custom YAML key in a Markdown sidecar string
 */
export function updateYamlFrontmatterKey(markdown: string, key: string, value: string | number | boolean | string[]): string {
  const { metadata, body } = parseYamlFrontmatter(markdown);
  metadata[key] = value;
  metadata['updated_at'] = new Date().toISOString();
  return stringifyYamlFrontmatter(metadata, body);
}
