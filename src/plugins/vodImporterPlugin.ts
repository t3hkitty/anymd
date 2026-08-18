/**
 * Sovereign VOD & Video Stream Importer Plugin
 * Catalogues YouTube, Twitch, Kick, Vimeo, TorBox Debrid streams, and local MP4/M3U8 VODs into sovereign companion sidecars with timestamped anchors.
 */

import type { Book, ResonanceEntry } from '../types/resonance';
import { generateZettelkastenSerial } from './zettelkastenSerialPlugin';

export type VodPlatform = 'youtube' | 'twitch' | 'kick' | 'vimeo' | 'torbox' | 'direct_stream' | 'local_mp4';

export interface VodChapter {
  timestampSeconds: number;
  timestampFormatted: string; // e.g. "01:24:15"
  title: string;
  notes?: string;
}

export interface VodMetadataInput {
  url: string;
  title: string;
  creator: string;
  platform: VodPlatform;
  durationFormatted?: string; // e.g. "02:15:30"
  resolution?: string; // e.g. "1080p60", "4K UHD"
  thumbnailUrl?: string;
  description?: string;
  rawTimestampsText?: string;
  tags?: string[];
  torboxFileId?: string;
}

/**
 * Formats seconds into HH:MM:SS or MM:SS
 */
export function formatSecondsToTimestamp(totalSecs: number): string {
  const hours = Math.floor(totalSecs / 3600);
  const minutes = Math.floor((totalSecs % 3600) / 60);
  const seconds = totalSecs % 60;

  if (hours > 0) {
    return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
  }
  return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
}

/**
 * Parses timestamp string "01:24:15" or "12:30" into total seconds
 */
export function parseTimestampToSeconds(ts: string): number {
  const parts = ts.trim().split(':').map(Number);
  if (parts.length === 3) {
    return parts[0] * 3600 + parts[1] * 60 + parts[2];
  }
  if (parts.length === 2) {
    return parts[0] * 60 + parts[1];
  }
  return 0;
}

/**
 * Extracts platform and video ID from common video URLs
 */
export function detectPlatformAndThumbnail(url: string): {
  platform: VodPlatform;
  thumbnailUrl?: string;
  videoId?: string;
} {
  const clean = url.trim();

  // YouTube
  const ytMatch = clean.match(/(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/i);
  if (ytMatch && ytMatch[1]) {
    const videoId = ytMatch[1];
    return {
      platform: 'youtube',
      videoId,
      thumbnailUrl: `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`
    };
  }

  // Twitch VOD or Clip
  if (clean.includes('twitch.tv/videos/')) {
    const vId = clean.split('twitch.tv/videos/')[1]?.split('?')[0];
    return {
      platform: 'twitch',
      videoId: vId,
      thumbnailUrl: 'https://static-cdn.jtvnw.net/ttv-static/404_preview-640x360.jpg'
    };
  }

  // Kick
  if (clean.includes('kick.com/video/')) {
    return { platform: 'kick' };
  }

  // Vimeo
  const vimeoMatch = clean.match(/vimeo\.com\/(\d+)/i);
  if (vimeoMatch && vimeoMatch[1]) {
    return {
      platform: 'vimeo',
      videoId: vimeoMatch[1]
    };
  }

  // TorBox Stream
  if (clean.includes('torbox.app') || clean.includes('api.torbox.app')) {
    return { platform: 'torbox' };
  }

  // Direct HLS or MP4
  if (clean.endsWith('.m3u8') || clean.endsWith('.mp4') || clean.endsWith('.webm')) {
    return { platform: 'direct_stream' };
  }

  return { platform: 'direct_stream' };
}

/**
 * Parses multi-line raw timestamp text into structured chapters
 * e.g.:
 * "00:00 - Stream Kickoff & Chat"
 * "14:20 - Deep Dive Breakdown"
 * "01:10:45 - Live Coding Review"
 */
export function parseRawTimestampLines(text: string): VodChapter[] {
  if (!text || !text.trim()) return [];

  const lines = text.split('\n');
  const chapters: VodChapter[] = [];

  const tsRegex = /(?:(\d{1,2}:\d{2}:\d{2})|(\d{1,2}:\d{2}))\s*[-–—:]*\s*(.*)/;

  for (const line of lines) {
    const match = line.match(tsRegex);
    if (match) {
      const timeStr = match[1] || match[2];
      const title = match[3]?.trim() || `Chapter at ${timeStr}`;
      const secs = parseTimestampToSeconds(timeStr);
      chapters.push({
        timestampSeconds: secs,
        timestampFormatted: timeStr,
        title
      });
    }
  }

  return chapters.sort((a, b) => a.timestampSeconds - b.timestampSeconds);
}

/**
 * Converts VOD metadata input into a sovereign Book/Sidecar object
 */
export function convertVodToVaultItem(
  input: VodMetadataInput
): Book {
  const serial = generateZettelkastenSerial();
  const detected = detectPlatformAndThumbnail(input.url);
  const platform = input.platform || detected.platform;
  const thumbnailUrl = input.thumbnailUrl || detected.thumbnailUrl || 'https://images.unsplash.com/photo-1536240478700-b869070f9279?w=600&auto=format&fit=crop&q=80';

  const chapters = parseRawTimestampLines(input.rawTimestampsText || '');
  const nowIso = new Date().toISOString();
  const dateStr = nowIso.split('T')[0];

  // Convert chapters to Resonance Entries
  const resonanceStream: ResonanceEntry[] = chapters.map((ch, idx) => ({
    id: `res-vod-${Date.now()}-${idx}`,
    timestamp: nowIso,
    formattedDate: dateStr,
    progressPercent: chapters.length > 1 ? Math.round((idx / (chapters.length - 1)) * 100) : 0,
    category: 'VOD & Stream Archive',
    rawText: `[${ch.timestampFormatted}] ${ch.title}`,
    cfi: `cfi:vod:${ch.timestampSeconds}`,
    chapterTitle: ch.title,
    paragraphIndex: idx,
    paragraphSnippet: ch.notes || `Spatial timestamp anchor at playback offset ${ch.timestampFormatted} on ${platform.toUpperCase()}.`,
    intensityScore: 4,
    reactionImageUrl: thumbnailUrl,
    reactionGifCaption: `Chapter: ${ch.title} (${ch.timestampFormatted})`,
    emojiReactions: ['🎬', '🔥', '📺']
  }));

  // If no chapters provided, add initial overview entry
  if (resonanceStream.length === 0) {
    resonanceStream.push({
      id: `res-vod-${Date.now()}-0`,
      timestamp: nowIso,
      formattedDate: dateStr,
      progressPercent: 0,
      category: 'VOD & Stream Archive',
      rawText: `Stream Recording & Archive: ${input.title}`,
      cfi: 'cfi:vod:0',
      chapterTitle: 'Overview',
      paragraphIndex: 0,
      paragraphSnippet: `Sovereign VOD archive captured from ${platform.toUpperCase()}. Direct stream URL: ${input.url}`,
      intensityScore: 5,
      reactionImageUrl: thumbnailUrl,
      reactionGifCaption: input.title,
      emojiReactions: ['🎬', '⚡']
    });
  }

  const sidecarMarkdown = `---
title: "${input.title.replace(/"/g, '\\"')}"
creator: "${input.creator.replace(/"/g, '\\"')}"
media_type: "vod"
platform: "${platform}"
stream_url: "${input.url}"
duration: "${input.durationFormatted || 'N/A'}"
resolution: "${input.resolution || '1080p60'}"
serial_code: "${serial}"
tags: [${['vod', platform, ...(input.tags || [])].map(t => `"${t}"`).join(', ')}]
date_cataloged: "${nowIso}"
---

# 🎬 ${input.title}

> **Platform:** \`${platform.toUpperCase()}\` &bull; **Creator:** **${input.creator}** &bull; **Duration:** \`${input.durationFormatted || 'N/A'}\` &bull; **Resolution:** \`${input.resolution || '1080p60'}\`
> **Stream URL:** [Watch Video Stream](${input.url})

---

## 📑 Spatial Chapters & Timestamp Anchors

${chapters.length > 0 ? chapters.map(ch => `- **\`[${ch.timestampFormatted}]\`** ${ch.title}`).join('\n') : '*No chapter breakdowns recorded for this VOD.*'}

---

## 📝 VOD Notes & Synthesis

${input.description || 'Sovereign VOD companion sidecar cataloged with media attachments and playback anchors.'}
`;

  return {
    id: `vod-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
    title: input.title,
    author: input.creator,
    coverColor: '#ef4444',
    coverImageUrl: thumbnailUrl,
    externalReaderUri: input.url,
    totalChapters: chapters.length || 1,
    currentChapterIndex: 0,
    currentParagraphIndex: 0,
    sidecarMarkdown,
    resonanceStream,
    chapters: chapters.length > 0
      ? chapters.map(ch => ({
          title: ch.title,
          cfiBase: `cfi:vod:${ch.timestampSeconds}`,
          paragraphs: [`Offset: ${ch.timestampFormatted}`, ch.title]
        }))
      : [{ title: 'Full Stream Recording', cfiBase: 'cfi:vod:0', paragraphs: [`Stream URL: ${input.url}`] }]
  };
}
