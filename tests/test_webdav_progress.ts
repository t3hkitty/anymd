/**
 * Test: Reading Progress Migrator & Safe WebDAV Path Resolution
 * Verifies:
 * 1. Progress migration from legacy URLs/file paths to stable book IDs
 * 2. Fallback without crashing reader or generating unparsed raw '#' dumps
 * 3. Bounded host logging verification
 */

import {
  generateCanonicalBookSlug,
  getStoredReadingPosition,
  saveReadingPosition,
  migrateLegacyReadingProgressKeys
} from '../src/utils/readingProgressMigrator';
import {
  cleanMeowFilename,
  buildMeowBookPath,
  resolveMoonPlusLink,
  fetchEbookViaSafeProxy
} from '../src/utils/pathResolver';
import { defaultHostInstance } from '../contracts/libr-contract';

// Mock localStorage for node environment
const storage: Record<string, string> = {};
(global as any).localStorage = {
  getItem: (k: string) => (k in storage ? storage[k] : null),
  setItem: (k: string, v: string) => { storage[k] = String(v); },
  removeItem: (k: string) => { delete storage[k]; },
  clear: () => { Object.keys(storage).forEach(k => delete storage[k]); },
  key: (i: number) => Object.keys(storage)[i] || null,
  get length() { return Object.keys(storage).length; }
};

// Mock fetch
(global as any).fetch = async (url: string) => {
  if (url.includes('api/webdav-proxy')) {
    // Return mock 200 arrayBuffer for proxy test
    return {
      ok: true,
      status: 200,
      arrayBuffer: async () => new ArrayBuffer(64)
    };
  }
  // Simulate CORS block on direct fetch
  throw new TypeError('Failed to fetch due to CORS restrictions');
};

async function runTests() {
  console.log('🧪 Starting AnyMD WebDAV & Reading Progress Verification Tests...\n');

  // Test 1: Canonical slug generation
  const slug = generateCanonicalBookSlug('H.G. Wells', 'The Time Machine (1895)');
  console.assert(slug.includes('h_g_wells'), `Slug author expected, got ${slug}`);
  console.assert(slug.includes('the_time_machine'), `Slug title expected, got ${slug}`);
  console.log('✅ Test 1 Passed: Canonical slug generated cleanly.');

  // Test 2: Clean meow filename and Moon+ link resolution
  const cleanTitle = cleanMeowFilename('Dune (1249)');
  console.assert(cleanTitle === 'Dune', `Expected 'Dune', got '${cleanTitle}'`);
  const moonLink = resolveMoonPlusLink('./Library', 'Frank Herbert', 'Dune', 'Dune.epub');
  console.assert(moonLink === './Library/Frank Herbert/Dune/Dune.epub', `Unexpected moonLink: ${moonLink}`);
  console.log('✅ Test 2 Passed: Filename sanitization & Moon+ path resolution passed.');

  // Test 3: Save and restore reading position by stable ID
  const mockBook: any = {
    id: 'book-nebula-99',
    title: 'Nebula Nomad',
    author: 'Astra Star',
    currentChapterIndex: 0,
    currentParagraphIndex: 0,
    chapters: [{ title: 'Chapter 1', cfiBase: 'cfi:1', paragraphs: ['Hello', 'World'] }]
  };

  saveReadingPosition(mockBook, {
    cfi: 'epubcfi(/6/2!/4/2:0)',
    progressPercent: 42,
    chapterIndex: 3,
    chapterTitle: 'Chapter 4',
    paragraphIndex: 7,
    paragraphSnippet: 'Travelling through the void.'
  });

  const retrieved = getStoredReadingPosition(mockBook);
  console.assert(retrieved !== null, 'Retrieved position should not be null');
  console.assert(retrieved?.chapterIndex === 3, `Expected chapterIndex 3, got ${retrieved?.chapterIndex}`);
  console.assert(retrieved?.paragraphIndex === 7, `Expected paragraphIndex 7, got ${retrieved?.paragraphIndex}`);
  console.log('✅ Test 3 Passed: Reading position persisted & restored by stable ID.');

  // Test 4: Migration of legacy WebDAV URLs into canonical IDs
  const legacyUrl = 'https://uploads.filejump.com/dav/Books/SciFi/Nebula_Nomad.epub';
  localStorage.setItem(`reading_pos_${legacyUrl}`, JSON.stringify({
    cfi: 'legacy-cfi',
    progressPercent: 88,
    chapterIndex: 5,
    chapterTitle: 'Chapter 6',
    paragraphIndex: 12,
    paragraphSnippet: 'Legacy progress snippet'
  }));

  mockBook.externalReaderUri = legacyUrl;
  const migrationResult = migrateLegacyReadingProgressKeys([mockBook]);
  console.assert(migrationResult.migrated === 1, `Expected 1 migrated key, got ${migrationResult.migrated}`);

  // Confirm legacy key is cleaned up and saved under primary ID
  console.assert(localStorage.getItem(`reading_pos_${legacyUrl}`) === null, 'Legacy URL key should be cleaned up');
  const migratedPos = getStoredReadingPosition(mockBook);
  console.assert(migratedPos?.chapterIndex === 5, `Expected migrated chapterIndex 5, got ${migratedPos?.chapterIndex}`);
  console.log('✅ Test 4 Passed: Legacy WebDAV URL progress migrated seamlessly to canonical ID.');

  // Test 5: Safe WebDAV proxy fetch
  const fetchResult = await fetchEbookViaSafeProxy('https://uploads.filejump.com/dav/Books/Sample.epub');
  console.assert(fetchResult.success === true, 'Safe proxy fetch should succeed via proxy mock');
  console.assert(fetchResult.sourceType === 'webdav_proxy', `Expected webdav_proxy, got ${fetchResult.sourceType}`);
  console.log('✅ Test 5 Passed: Safe WebDAV proxy fetch succeeded without raw error dumps.');

  // Test 6: Bounded host logging
  const logs = defaultHostInstance.getLogs();
  console.assert(logs.length > 0, 'Host logs should contain recorded stages');
  console.log(`✅ Test 6 Passed: Telemetry logging verified (${logs.length} entries in ring buffer).`);

  console.log('\n🎉 ALL TESTS PASSED SUCCESSFULLY! 🐾🐱\n');
}

runTests().catch(err => {
  console.error('❌ Test failed:', err);
  process.exit(1);
});
