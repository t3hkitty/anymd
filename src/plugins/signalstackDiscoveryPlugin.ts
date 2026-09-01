/**
 * SignalStack Discovery Engine Plugin
 * - Keyword Subscriptions
 * - One Shade Off Lateral Expansion
 * - Directly generates Anymd Sidecar `.companion.md` data structures
 */

import type { Book } from '../types/resonance';

export interface KeywordSubscription {
  keyword: string;
  tags: string[];
}

export const DEFAULT_KEYWORD_SUBSCRIPTIONS: KeywordSubscription[] = [
  { keyword: "Zettelkasten", tags: ["#pkm", "#zettelkasten", "#anymd"] },
  { keyword: "Distributed Systems", tags: ["#engineering", "#systems", "#architecture"] },
  { keyword: "Webnovel Archiving", tags: ["#media", "#calibre", "#preservation"] },
  { keyword: "Tactile Audio Synthesis", tags: ["#synth", "#sound-design", "#hardware"] }
];

export const LATERAL_EXPANSION_DICTIONARY: Record<string, string> = {
  "distributed systems": "Cellular Automata & Biological Consensus",
  "zettelkasten": "Spatial Memory & Hypercard Archaeology",
  "webnovel archiving": "Typography Standards in EPUB3 Open Readers",
  "tactile audio synthesis": "Granular Synthesis & Micro-Acoustic Physics"
};

export function getLateralPivot(keyword: string): string {
  return LATERAL_EXPANSION_DICTIONARY[keyword.toLowerCase()] || "Adjacent Domain Exploration";
}

export interface DiscoveryFeedItem {
  title: string;
  source: string;
  url: string;
  content: string;
}

export function processDiscoveryFeedIntoBooks(feed: DiscoveryFeedItem[], subs = DEFAULT_KEYWORD_SUBSCRIPTIONS): Book[] {
  return feed.map((item, idx) => {
    const matchedSub = subs.find(sub => 
      item.title.toLowerCase().includes(sub.keyword.toLowerCase()) ||
      item.content.toLowerCase().includes(sub.keyword.toLowerCase())
    ) || subs[0];

    const lateralTopic = getLateralPivot(matchedSub.keyword);
    const timestamp = new Date().toISOString();
    
    return {
      id: `signalstack-${Date.now()}-${idx}`,
      title: item.title,
      author: item.source,
      coverColor: '#10B981',
      totalChapters: 1,
      currentChapterIndex: 0,
      currentParagraphIndex: 0,
      sidecarMarkdown: `# ${item.title}\n\nSource: ${item.source} (${item.url})\n\n${item.content}`,
      price: 0,
      resonanceStream: [],
      chapters: [{
        title: item.title,
        cfiBase: 'epubcfi(/6/2!)',
        paragraphs: [item.content]
      }]
    };
  });
}
