/**
 * Plugin: plugin-reading-mode
 * Provides clean, low-clutter reading/scannability view formatting for Markdown notes.
 */

export interface ReadingModeOptions {
  fontSize?: 'sm' | 'base' | 'lg' | 'xl';
  fontFamily?: 'sans' | 'mono' | 'serif';
  lineHeight?: string;
  maxW?: string;
}

export function formatReadingModeHtml(markdownBody: string, options: ReadingModeOptions = {}): string {
  const { fontSize = 'base', fontFamily = 'sans', maxW = '3xl' } = options;

  // Basic markdown-to-html transformation for clean reading view
  let html = markdownBody
    .replace(/^# (.*$)/gm, '<h1 class="text-2xl font-bold mb-4 text-indigo-200 border-b border-indigo-900/40 pb-2">$1</h1>')
    .replace(/^## (.*$)/gm, '<h2 class="text-xl font-bold mb-3 mt-6 text-indigo-300">$1</h2>')
    .replace(/^### (.*$)/gm, '<h3 class="text-lg font-bold mb-2 mt-4 text-slate-200">$1</h3>')
    .replace(/\*\*(.*?)\*\*/g, '<strong class="font-bold text-amber-300">$1</strong>')
    .replace(/\*(.*?)\*/g, '<em class="italic text-slate-300">$1</em>')
    .replace(/\[\[(.*?)\]\]/g, '<span class="px-1.5 py-0.5 rounded bg-indigo-950/60 text-indigo-300 font-mono text-xs border border-indigo-500/30">[[</span><span class="text-indigo-200 font-semibold">$1</span><span class="px-1.5 py-0.5 rounded bg-indigo-950/60 text-indigo-300 font-mono text-xs border border-indigo-500/30">]]</span>')
    .replace(/\n/g, '<br/>');

  return `<div class="reading-container max-w-${maxW} mx-auto text-${fontSize} font-${fontFamily} leading-relaxed text-slate-200 p-6">${html}</div>`;
}
