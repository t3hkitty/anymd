/**
 * Test: Exhaustive Rclone Detail Extraction & Reusable YAML Sidecar Generation
 * Verifies:
 * 1. Deep parsing of `psthimTeM` (path, size, time, hash, id, origId, mime, tier, metadataJson)
 * 2. Parsing of `rclone lsjson` / operations/list output
 * 3. Generation of comprehensive .anymd YAML frontmatter with full technical properties
 * 4. Preservation of telemetry in host ring buffer
 */

import {
  parseRcloneLsfOutput,
  generateSidecarsFromLsf
} from '../src/core/rcloneLsfSidecarEngine';
import { defaultHostInstance } from '../contracts/libr-contract';

async function testExhaustiveRcloneDetails() {
  console.log('🧪 Starting Exhaustive Rclone Detail Extraction Tests...\n');

  // Test 1: Full format `psthiomeTM`
  const deepLsf = `
Frank Herbert/Dune/Dune.epub;2411724;2026-08-15T14:22:00Z;e3b0c44298fc1c149afbf4c8996fb924;obj-901;orig-901;application/epub+zip;;Hot;{"publisher":"Chilton Books","edition":"1st"}
Dan Simmons/Hyperion.pdf;1842000;2026-07-20T12:00:00Z;d41d8cd98f00b204e9800998ecf8427e;obj-902;;application/pdf;;Cool;{"author_note":"Hugo Award Winner"}
`;

  const parsed = parseRcloneLsfOutput(deepLsf, ';', 'psthiomeTM');
  console.assert(parsed.length === 2, `Expected 2 parsed items, got ${parsed.length}`);

  const dune = parsed[0];
  console.assert(dune.hash === 'e3b0c44298fc1c149afbf4c8996fb924', `Unexpected hash: ${dune.hash}`);
  console.assert(dune.objectId === 'obj-901', `Unexpected objectId: ${dune.objectId}`);
  console.assert(dune.originalId === 'orig-901', `Unexpected originalId: ${dune.originalId}`);
  console.assert(dune.mimeType === 'application/epub+zip', `Unexpected mimeType: ${dune.mimeType}`);
  console.assert(dune.storageTier === 'Hot', `Unexpected tier: ${dune.storageTier}`);
  console.assert(dune.rawMetadata?.publisher === 'Chilton Books', `Metadata publisher missing: ${JSON.stringify(dune.rawMetadata)}`);
  console.log('✅ Test 1 Passed: Full format string (psthimTeM) parsed with all extended fields.');

  // Test 2: Generate exhaustive YAML sidecars
  const books = await generateSidecarsFromLsf(parsed, './Library');
  console.assert(books.length === 2, `Expected 2 books, got ${books.length}`);

  const duneBook = books[0];
  const sidecar = duneBook.sidecarMarkdown;

  // Verify full set of YAML frontmatter keys
  console.assert(sidecar.includes('content_hash: "e3b0c44298fc1c149afbf4c8996fb924"'), 'Missing content_hash in YAML');
  console.assert(sidecar.includes('remote_object_id: "obj-901"'), 'Missing remote_object_id in YAML');
  console.assert(sidecar.includes('original_object_id: "orig-901"'), 'Missing original_object_id in YAML');
  console.assert(sidecar.includes('storage_tier: "Hot"'), 'Missing storage_tier in YAML');
  console.assert(sidecar.includes('meta_publisher: "Chilton Books"'), 'Missing meta_publisher in YAML');
  console.assert(sidecar.includes('meta_edition: "1st"'), 'Missing meta_edition in YAML');
  console.assert(sidecar.includes('mime_type: "application/epub+zip"'), 'Missing mime_type in YAML');
  console.assert(sidecar.includes('storage_type: "rclone_managed_vfs"'), 'Missing storage_type in YAML');
  console.assert(sidecar.includes('file_size_formatted: "2.30 MB"'), 'Missing file_size_formatted in YAML');
  console.log('✅ Test 2 Passed: Maximum-fidelity YAML frontmatter validated with all rclone properties.');

  // Test 3: Parse rclone JSON format (lsjson / operations/list)
  const sampleJson = JSON.stringify([
    {
      Path: "Martha Wells/All_Systems_Red.epub",
      Name: "All_Systems_Red.epub",
      Size: 824100,
      MimeType: "application/epub+zip",
      ModTime: "2026-08-10T11:45:00Z",
      IsDir: false,
      Tier: "Hot",
      ID: "gdrive-file-id-441",
      Hashes: { MD5: "7d793037a0760186574b0282f2f435e7" },
      Metadata: { series: "The Murderbot Diaries", narrator: "Kevin R. Free" }
    }
  ]);

  const jsonParsed = parseRcloneLsfOutput(sampleJson);
  console.assert(jsonParsed.length === 1, `Expected 1 item from JSON, got ${jsonParsed.length}`);
  const jsonBook = (await generateSidecarsFromLsf(jsonParsed, './Library'))[0];
  console.assert(jsonBook.sidecarMarkdown.includes('content_hash: "7d793037a0760186574b0282f2f435e7"'), 'JSON content_hash missing');
  console.assert(jsonBook.sidecarMarkdown.includes('meta_series: "The Murderbot Diaries"'), 'JSON meta_series missing');
  console.assert(jsonBook.sidecarMarkdown.includes('meta_narrator: "Kevin R. Free"'), 'JSON meta_narrator missing');
  console.log('✅ Test 3 Passed: Direct rclone lsjson format parsed with complete metadata.');

  // Test 4: Ring buffer logs
  const logs = defaultHostInstance.getLogs();
  console.assert(logs.some(l => l.source === 'rclone-lsf'), 'Telemetry ring buffer should record rclone-lsf events');
  console.log(`✅ Test 4 Passed: Ring buffer telemetry recorded (${logs.length} entries).`);

  console.log('\n🎉 ALL EXHAUSTIVE RCLONE DETAIL TESTS PASSED! 🐾🐱\n');
}

testExhaustiveRcloneDetails().catch(err => {
  console.error('❌ Test failed:', err);
  process.exit(1);
});
