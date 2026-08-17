import type { AcquisitionLink } from '../types/importer';
import { parseYamlFrontmatter, stringifyYamlFrontmatter } from './yamlFrontmatterParser';

/**
 * Commits acquisition deep-link URLs into a companion .md sidecar file string
 */
export function commitAcquisitionDeepLinksToSidecar(
  markdownContent: string,
  links: AcquisitionLink[]
): string {
  const { metadata, body } = parseYamlFrontmatter(markdownContent);

  // 1. Commit links to YAML frontmatter under `acquisition_links`
  const linksMap: Record<string, string> = {};
  links.forEach(l => {
    linksMap[l.providerId] = l.url;
  });

  metadata['acquisition_links'] = JSON.stringify(linksMap);
  metadata['updated_at'] = new Date().toISOString();

  // 2. Format clickable Markdown links section in sidecar body
  let markdownLinksSection = `\n## 🛒 Content Acquisition Deep-Links\n`;
  links.forEach(l => {
    markdownLinksSection += `- ${l.icon} **${l.providerName}:** [${l.label}](${l.url})\n`;
  });

  let updatedBody = body;
  if (!updatedBody.includes('## 🛒 Content Acquisition Deep-Links')) {
    updatedBody += markdownLinksSection;
  } else {
    updatedBody = updatedBody.replace(/## 🛒 Content Acquisition Deep-Links[\s\S]*?(?=\n## |$)/, markdownLinksSection.trim());
  }

  return stringifyYamlFrontmatter(metadata, updatedBody);
}
