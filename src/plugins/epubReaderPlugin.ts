import JSZip from 'jszip';
import type { Book } from '../types/resonance';
import { cleanMeowFilename, buildCompanionSidecarHeader, fetchEbookViaSafeProxy } from '../utils/pathResolver';
import { defaultHostInstance } from '../../contracts/libr-contract';

export async function parseEpubBuffer(
  buffer: ArrayBuffer,
  fileName: string,
  relLinkRoot: string = './Library'
): Promise<Book> {
  const zip = await JSZip.loadAsync(buffer);
  
  // 1. Locate container.xml
  const containerFile = zip.file('META-INF/container.xml');
  let opfPath = 'OEBPS/content.opf';

  if (containerFile) {
    const containerXml = await containerFile.async('text');
    const match = containerXml.match(/full-path="([^"]+)"/);
    if (match && match[1]) {
      opfPath = match[1];
    }
  }

  // 2. Read OPF
  const opfFile = zip.file(opfPath);
  let title = fileName.replace(/\.epub$/i, '');
  let author = 'Unknown Author';
  let coverColor = '#6366f1';

  if (opfFile) {
    const opfXml = await opfFile.async('text');
    
    const titleMatch = opfXml.match(/<dc:title[^>]*>([^<]+)<\/dc:title>/i);
    if (titleMatch && titleMatch[1]) {
      title = cleanMeowFilename(titleMatch[1]);
    }

    const creatorMatch = opfXml.match(/<dc:creator[^>]*>([^<]+)<\/dc:creator>/i);
    if (creatorMatch && creatorMatch[1]) {
      author = cleanMeowFilename(creatorMatch[1]);
    }
  }

  // 3. Extract text chapters from html/xhtml files inside zip
  const htmlFiles = Object.keys(zip.files).filter(f => /\.xhtml$|\.html$|\.htm$/i.test(f));
  const chapters: { title: string; cfiBase: string; paragraphs: string[] }[] = [];

  for (let i = 0; i < Math.min(htmlFiles.length, 5); i++) {
    const filePath = htmlFiles[i];
    const htmlText = await zip.file(filePath)?.async('text');
    if (!htmlText) continue;

    // Strip HTML tags to get raw paragraph text
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = htmlText;

    const pElements = Array.from(tempDiv.querySelectorAll('p, div.paragraph, article'));
    const rawParagraphs = pElements
      .map(p => p.textContent?.trim())
      .filter((t): t is string => Boolean(t && t.length > 15));

    if (rawParagraphs.length > 0) {
      const chapterTitle = `Chapter ${i + 1}: ${filePath.split('/').pop()?.replace(/\.\w+$/, '') || 'Section'}`;
      chapters.push({
        title: chapterTitle,
        cfiBase: `epubcfi(/6/${(i + 1) * 4}[chap0${i + 1}]!`,
        paragraphs: rawParagraphs.slice(0, 10)
      });
    }
  }

  // Fallback chapter if no HTML extracted
  if (chapters.length === 0) {
    chapters.push({
      title: 'Chapter 1: Opening Narrative',
      cfiBase: 'epubcfi(/6/4[chap01]!',
      paragraphs: [
        `Extracted from meow file ${fileName}.`,
        'The journey begins with raw unfiltered reader resonance.'
      ]
    });
  }

  const bookId = `epub-${Date.now()}`;
  const sidecarHeader = buildCompanionSidecarHeader(title, author, relLinkRoot);

  return {
    id: bookId,
    title,
    author,
    coverColor,
    totalChapters: chapters.length,
    currentChapterIndex: 0,
    currentParagraphIndex: 0,
    resonanceStream: [],
    sidecarMarkdown: sidecarHeader + `## Reader Resonance Stream\n`,
    chapters
  };
}

export async function parseEpubFile(file: File, relLinkRoot: string = './Library'): Promise<Book> {
  const buffer = await file.arrayBuffer();
  return parseEpubBuffer(buffer, file.name, relLinkRoot);
}

/**
 * Safely fetches remote or WebDAV EPUB via CORS proxy and parses it into a Book.
 * Never throws unparsed '#' text into reader if CORS fails or host is unreachable.
 */
export async function loadRemoteEbookSafely(
  url: string,
  fileName: string = 'remote_ebook.epub',
  relLinkRoot: string = './Library',
  credentials?: { username?: string; password?: string; apiKey?: string }
): Promise<Book> {
  defaultHostInstance.log({
    level: 'info',
    source: 'epub-loader',
    stage: 'fetch',
    message: `Initiating safe proxy load for remote ebook: ${url}`,
    meta: { url, fileName }
  });

  const res = await fetchEbookViaSafeProxy(url, credentials);

  if (res.success && res.buffer) {
    try {
      const book = await parseEpubBuffer(res.buffer, fileName, relLinkRoot);
      book.externalReaderUri = url;
      return book;
    } catch (parseErr: any) {
      defaultHostInstance.log({
        level: 'warn',
        source: 'epub-loader',
        stage: 'fallback_stub',
        message: `EPUB zip unpack failed for ${url}: ${parseErr?.message || parseErr}. Returning clean fallback notice.`,
        meta: { error: String(parseErr) }
      });
    }
  }

  // Graceful fallback structure (No raw '#' dumps!)
  const cleanTitle = fileName.replace(/\.epub$/i, '') || 'Remote Ebook';
  return {
    id: `remote-${Date.now()}`,
    title: cleanTitle,
    author: 'Remote Library',
    coverColor: '#0284c7',
    externalReaderUri: url,
    totalChapters: 1,
    currentChapterIndex: 0,
    currentParagraphIndex: 0,
    resonanceStream: [],
    sidecarMarkdown: res.content || `# ${cleanTitle}\n\nNotice: Remote asset at ${url} could not be loaded directly.\n`,
    chapters: [
      {
        title: 'Status: Remote Asset Notice',
        cfiBase: 'epubcfi(/6/2[status]!',
        paragraphs: [
          `Remote file at "${url}" is temporarily unavailable or blocked by CORS headers.`,
          'Your bookmarks, reading positions, and annotations remain safely preserved in local storage.',
          'Connect to local rclone loopback proxy or WebDAV bridge to stream content directly.'
        ]
      }
    ]
  };
}
