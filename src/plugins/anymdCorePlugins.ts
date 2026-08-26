// Anymd Core Plugins - Learning Mode, Litany Zettelkasten, n8n Bridge, OCR, Roomba, Kawaii Badges
import type { PluginId } from '../types/plugins';

// Webhook destination
let remoteN8nEndpoint = 'https://n8n.lorik.me/webhook/';

export function setN8nWebhookEndpoint(url: string) {
  remoteN8nEndpoint = url;
}

export function getN8nWebhookEndpoint(): string {
  return remoteN8nEndpoint;
}

// 1. Reading / Learning Mode Parser
export interface RenderedMarkdown {
  html: string;
  toc: { id: string; text: string; level: number }[];
}

export function renderReadingMode(markdown: string): RenderedMarkdown {
  const lines = markdown.split('\n');
  const toc: { id: string; text: string; level: number }[] = [];
  let htmlLines: string[] = [];
  let inYaml = false;
  let inCodeBlock = false;
  let currentCollapsibleId = '';

  lines.forEach((line, index) => {
    // Handle YAML Frontmatter
    if (line.trim() === '---') {
      if (index === 0 || inYaml) {
        inYaml = !inYaml;
        return;
      }
    }
    if (inYaml) return; // Skip rendering raw YAML properties in distraction-free reader

    // Handle Code Blocks
    if (line.trim().startsWith('```')) {
      inCodeBlock = !inCodeBlock;
      htmlLines.push(inCodeBlock ? '<pre class="bg-neutral-900 text-purple-300 p-4 rounded-lg my-3 font-mono text-xs overflow-x-auto border border-purple-950">' : '</pre>');
      return;
    }

    if (inCodeBlock) {
      // Escape HTML
      const escaped = line
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;');
      htmlLines.push(escaped);
      return;
    }

    // Callout Blocks (> [!NOTE], etc.)
    if (line.trim().startsWith('>')) {
      const calloutContent = line.trim().replace(/^>\s*/, '');
      const calloutMatch = calloutContent.match(/^\[!(NOTE|TIP|IMPORTANT|WARNING|CAUTION)\]/i);
      if (calloutMatch) {
        const type = calloutMatch[1].toUpperCase();
        let colorClass = 'border-l-4 border-indigo-500 bg-indigo-950/20 text-indigo-200';
        let icon = '💡';
        if (type === 'WARNING' || type === 'CAUTION') {
          colorClass = 'border-l-4 border-amber-500 bg-amber-950/20 text-amber-200';
          icon = '⚠️';
        } else if (type === 'IMPORTANT') {
          colorClass = 'border-l-4 border-purple-500 bg-purple-950/20 text-purple-200';
          icon = '🎀';
        }
        htmlLines.push(`<div class="p-4 rounded-r-lg my-3 font-sans text-sm flex gap-3 ${colorClass}"><span class="text-base">${icon}</span><div>`);
      } else {
        htmlLines.push(`<p class="pl-4 border-l-2 border-neutral-700 italic text-neutral-400 my-2">${calloutContent}</p>`);
      }
      return;
    }

    // Headings & Collapsible Sections
    const headingMatch = line.match(/^(#{1,6})\s+(.*)$/);
    if (headingMatch) {
      const level = headingMatch[1].length;
      const text = headingMatch[2].trim();
      const id = `heading-${index}`;
      toc.push({ id, text, level });

      // Close previous collapsible section if level 1 or 2
      if (level <= 2 && currentCollapsibleId) {
        htmlLines.push('</div></details>');
        currentCollapsibleId = '';
      }

      if (level <= 2) {
        currentCollapsibleId = id;
        htmlLines.push(`<details open class="group my-4 border border-neutral-800 rounded-lg overflow-hidden bg-neutral-900/40">
          <summary class="flex justify-between items-center p-3 font-mono font-bold text-xs bg-neutral-900 border-b border-neutral-800 cursor-pointer list-none select-none text-lavender hover:text-white">
            <span class="flex items-center gap-2">
              <span class="transition-transform group-open:rotate-90 text-[10px]">▶</span>
              ${'#'.repeat(level)} ${text}
            </span>
          </summary>
          <div class="p-4 space-y-3 font-sans text-sm text-neutral-300 leading-relaxed bg-[#1E1E2E]/80">`);
      } else {
        htmlLines.push(`<h${level} id="${id}" class="font-bold text-neutral-100 font-sans my-3 text-base">${text}</h${level}>`);
      }
      return;
    }

    // Horizontal Rules
    if (line.trim() === '---' || line.trim() === '***' || line.trim() === '___') {
      htmlLines.push('<hr class="border-neutral-800 my-4" />');
      return;
    }

    // List Items
    if (line.trim().startsWith('- ') || line.trim().startsWith('* ')) {
      const item = line.trim().substring(2);
      htmlLines.push(`<li class="list-disc ml-6 my-1 font-sans text-sm text-neutral-300">${item}</li>`);
      return;
    }

    // Normal Paragraphs
    if (line.trim()) {
      htmlLines.push(`<p class="my-2 font-sans text-sm text-neutral-300 leading-relaxed">${line.trim()}</p>`);
    }
  });

  if (currentCollapsibleId) {
    htmlLines.push('</div></details>');
  }

  return {
    html: htmlLines.join('\n'),
    toc
  };
}

// 2. Litany / Zettelkasten Note Schema Generator
export function generateLitanyZettelTemplate(title: string, source: string = 'Source Identifier'): string {
  // Get Pacific Time timestamp
  const date = new Date();
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  const seconds = String(date.getSeconds()).padStart(2, '0');
  
  const timestampId = `${year}${month}${day}-${hours}${minutes}`;
  const isoCreated = `${year}-${month}-${day}T${hours}:${minutes}:${seconds}-07:00`; // PT standard

  return `---
id: ${timestampId}
tags: ["#zettelkasten", "#litany", "#summary"]
type: reading_note
status: complete 🎀
created: ${isoCreated}
---

# [${timestampId}] ${title || 'Title'} / ${source}
-----------------------------------------
# Tags: #zettelkasten #litany #summary

• Core Summary:
  - [Key Takeaway 1]
  - [Key Takeaway 2]

• Peripheral Nodes / Context:
  - Author/Source Context: ${source}
  - Related Topics / Books: ...

• Raw Transcribed Text / Snippets:
  > Paste your highlights or captured text snippet here...
`;
}

// 3. Webhook Dispatcher
export async function dispatchToN8n(frontmatter: any, content: string): Promise<boolean> {
  try {
    const payload = {
      event: 'anymd_zettel_sync',
      timestamp: new Date().toISOString(),
      frontmatter,
      content
    };
    const targetUrl = remoteN8nEndpoint.endsWith('/') ? remoteN8nEndpoint : `${remoteN8nEndpoint}/`;
    const response = await fetch(`${targetUrl}anymd-zettel-sync`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    });
    return response.ok;
  } catch (err) {
    console.error('n8n dispatch failed:', err);
    return false;
  }
}

// 4. OCR & Snippet Transcriber Parser
export function parseTranscribedTextToBlockquote(transcription: string): string {
  if (!transcription.trim()) return '';
  return transcription
    .split('\n')
    .map(line => `  > ${line}`)
    .join('\n');
}

// 5. Vault Roomba / Sweeper
export interface SweepResult {
  cleanedContent: string;
  orphansIdentified: boolean;
  changesMade: string[];
}

export function sweepVaultNote(content: string): SweepResult {
  const lines = content.split('\n');
  let inYaml = false;
  let yamlLines: string[] = [];
  let bodyLines: string[] = [];
  let changesMade: string[] = [];

  lines.forEach((line, idx) => {
    if (line.trim() === '---') {
      if (idx === 0 || inYaml) {
        inYaml = !inYaml;
        return;
      }
    }
    if (inYaml) {
      yamlLines.push(line);
    } else {
      bodyLines.push(line);
    }
  });

  // Deduplicate and sanitize YAML properties
  const frontmatter: Record<string, string> = {};
  yamlLines.forEach(line => {
    const parts = line.split(':');
    if (parts.length >= 2) {
      const key = parts[0].trim();
      const val = parts.slice(1).join(':').trim();
      frontmatter[key] = val;
    }
  });

  // Clean tags
  if (frontmatter['tags']) {
    try {
      const rawTags = frontmatter['tags'].replace(/[\[\]"]/g, '').split(',');
      const uniqueTags = Array.from(new Set(rawTags.map(t => t.trim()).filter(Boolean)));
      const cleanTagsString = `[${uniqueTags.map(t => `"${t.startsWith('#') ? t : '#' + t}"`).join(', ')}]`;
      if (cleanTagsString !== frontmatter['tags']) {
        frontmatter['tags'] = cleanTagsString;
        changesMade.push('Deduplicated and normalized tags in frontmatter');
      }
    } catch (e) {
      // safe fallback
    }
  }

  // Re-build clean YAML
  const cleanYaml = Object.entries(frontmatter)
    .map(([k, v]) => `${k}: ${v}`)
    .join('\n');

  const cleanedContent = `---
${cleanYaml}
---
${bodyLines.join('\n')}`;

  return {
    cleanedContent,
    orphansIdentified: bodyLines.join('\n').trim().length === 0,
    changesMade
  };
}

// 6. Kawaii Emoji Status Decorator
export function getKawaiiBadge(status: string, type?: string): { emoji: string; style: string; label: string } {
  const normStatus = (status || '').toLowerCase();
  const normType = (type || '').toLowerCase();

  if (normType.includes('litany') || normStatus.includes('litany')) {
    return { emoji: '🌸', style: 'bg-pink-950/40 text-pink-300 border-pink-800/40', label: '#litany' };
  }
  if (normType.includes('zettel') || normStatus.includes('zettel')) {
    return { emoji: '💜', style: 'bg-purple-950/40 text-purple-300 border-purple-800/40', label: '#zettelkasten' };
  }

  if (normStatus.includes('complete') || normStatus.includes('done') || normStatus.includes('🎀')) {
    return { emoji: '🎀', style: 'bg-emerald-950/40 text-emerald-300 border-emerald-800/40', label: 'complete 🎀' };
  }
  if (normStatus.includes('processing') || normStatus.includes('progress') || normStatus.includes('🐾')) {
    return { emoji: '🐾', style: 'bg-amber-950/40 text-amber-300 border-amber-800/40', label: 'processing 🐾' };
  }
  if (normStatus.includes('pending') || normStatus.includes('wait') || normStatus.includes('⏳')) {
    return { emoji: '⏳', style: 'bg-neutral-800/60 text-neutral-400 border-neutral-700/40', label: 'pending ⏳' };
  }
  if (normStatus.includes('webhook') || normStatus.includes('crystal') || normStatus.includes('🔮')) {
    return { emoji: '🔮', style: 'bg-sky-950/40 text-sky-300 border-sky-800/40', label: 'webhook 🔮' };
  }

  return { emoji: '✨', style: 'bg-indigo-950/40 text-indigo-300 border-indigo-800/40', label: 'ready ✨' };
}
