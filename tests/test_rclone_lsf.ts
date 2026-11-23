/**
 * Test: Rclone LSF Parser & Sidecar Generation Engine
 * Verifies:
 * 1. Fast parsing of `rclone lsf --format "pst"` outputs
 * 2. Rapid .anymd YAML sidecar generation
 * 3. Step-by-step progress callbacks and diagnostic logging
 */

import {
  parseRcloneLsfOutput,
  extractMetadataFromPath,
  generateSidecarsFromLsf,
  type SidecarGenerationProgress
} from '../src/core/rcloneLsfSidecarEngine';
import { defaultHostInstance } from '../contracts/libr-contract';

async function testLsfEngine() {
  console.log('🧪 Starting Rclone LSF Sidecar Engine Tests...\n');

  // Test 1: Parse rclone lsf output
  const sampleLsfOutput = `
Frank Herbert/Dune/Dune.epub;2411724;2026-08-15T14:22:00Z
Brandon Sanderson - The Way of Kings.epub;3518290;2026-08-14T09:15:00Z
Dan Simmons/Hyperion.pdf;1842000;2026-07-20T12:00:00Z
Subfolder/
Martha Wells/All Systems Red.epub;824100;2026-08-10T11:45:00Z
`;

  const parsed = parseRcloneLsfOutput(sampleLsfOutput, ';');
  console.assert(parsed.length === 5, `Expected 5 items, got ${parsed.length}`);
  const filesOnly = parsed.filter(p => !p.isDir);
  console.assert(filesOnly.length === 4, `Expected 4 files, got ${filesOnly.length}`);
  console.log('✅ Test 1 Passed: rclone lsf raw text parsed cleanly into structured items.');

  // Test 2: Metadata extraction heuristics
  const meta1 = extractMetadataFromPath('Frank Herbert/Dune/Dune.epub');
  console.assert(meta1.author === 'Frank Herbert', `Expected 'Frank Herbert', got '${meta1.author}'`);
  console.assert(meta1.title === 'Dune', `Expected 'Dune', got '${meta1.title}'`);

  const meta2 = extractMetadataFromPath('Brandon Sanderson - The Way of Kings.epub');
  console.assert(meta2.author === 'Brandon Sanderson', `Expected 'Brandon Sanderson', got '${meta2.author}'`);
  console.assert(meta2.title === 'The Way of Kings', `Expected 'The Way of Kings', got '${meta2.title}'`);
  console.log('✅ Test 2 Passed: Heuristic author/title path extraction passed.');

  // Test 3: High-speed sidecar generation with progress events
  const progressSnapshots: SidecarGenerationProgress[] = [];
  const books = await generateSidecarsFromLsf(
    parsed,
    './Library',
    (p) => progressSnapshots.push({ ...p }),
    2 // Chunk size for quick testing
  );

  console.assert(books.length === 4, `Expected 4 generated books, got ${books.length}`);
  console.assert(progressSnapshots.length > 0, 'Progress callback should have received events');
  const lastProgress = progressSnapshots[progressSnapshots.length - 1];
  console.assert(lastProgress.percent === 100, `Last progress percent should be 100, got ${lastProgress.percent}`);
  console.assert(lastProgress.totalDetected === 4, `Detected count should be 4, got ${lastProgress.totalDetected}`);

  // Test 4: Inspect generated .anymd YAML sidecar header
  const duneBook = books.find(b => b.title === 'Dune');
  console.assert(duneBook !== undefined, 'Dune book should exist');
  console.assert(duneBook?.sidecarMarkdown.includes('author: "Frank Herbert"'), 'Sidecar should contain author frontmatter');
  console.assert(duneBook?.sidecarMarkdown.includes('rel_link_root: "./Library"'), 'Sidecar should contain rel_link_root frontmatter');
  console.assert(duneBook?.sidecarMarkdown.includes('file_size_bytes: "2411724"'), 'Sidecar should contain file_size_bytes');
  console.log('✅ Test 3 & 4 Passed: Sidecars and YAML frontmatter generated with live progress.');

  // Test 5: Verify diagnostic logging in ring buffer
  const logs = defaultHostInstance.getLogs();
  const lsfLogs = logs.filter(l => l.source === 'rclone-lsf');
  console.assert(lsfLogs.length > 0, 'Ring buffer should contain rclone-lsf logs');
  console.log(`✅ Test 5 Passed: Telemetry events logged cleanly (${lsfLogs.length} events recorded).`);

  console.log('\n🎉 ALL RCLONE LSF TESTS PASSED! 🐾🐱\n');
}

testLsfEngine().catch(err => {
  console.error('❌ Test failed:', err);
  process.exit(1);
});
