/**
 * Test Suite: Extension/Bundle Diagnostic Logging & Fallback Telemetry
 * 🐾 Kawaiianism v3.1 Anti-Slop Directive
 */

const assert = require('assert');
const { 
  createSafeExtensionHost, 
  validateExtensionManifest 
} = require('../contracts/libr-contract.js');

console.log('🧪 Starting Diagnostic Logging & Fallback Telemetry Tests...\n');

// 1. Test ring buffer capacity and bounding
const host = createSafeExtensionHost({ network: false, local_storage: true }, null, 50);

for (let i = 1; i <= 75; i++) {
  host.log({
    level: i % 2 === 0 ? 'info' : 'warn',
    source: i % 3 === 0 ? 'rclone-driver' : 'vault-engine',
    stage: i % 5 === 0 ? 'fallback_stub' : 'catalog_read',
    message: `Test log entry #${i}`,
    meta: { index: i, stub: i % 5 === 0 }
  });
}

const allLogs = host.getLogs();
assert.strictEqual(allLogs.length, 50, `Ring buffer should be bounded to 50 entries, got ${allLogs.length}`);
assert.strictEqual(allLogs[0].meta.index, 26, 'Oldest entries (1-25) should have shifted out');
assert.strictEqual(allLogs[49].meta.index, 75, 'Newest entry (75) should be present at the tail');
console.log('✅ Test 1 Passed: Bounded ring buffer limits to configured maximum capacity.');

// 2. Test filtering by level, source, stage, and freeform query
const warnLogs = host.getLogs({ level: 'warn' });
assert.ok(warnLogs.length > 0 && warnLogs.every(l => l.level === 'warn'), 'All filtered logs should be warn level');

const rcloneLogs = host.getLogs({ source: 'rclone-driver' });
assert.ok(rcloneLogs.length > 0 && rcloneLogs.every(l => l.source === 'rclone-driver'), 'All filtered logs should match source');

const fallbackLogs = host.getLogs({ stage: 'fallback_stub' });
assert.ok(fallbackLogs.length > 0 && fallbackLogs.every(l => l.stage === 'fallback_stub'), 'All filtered logs should match stage');

const searchLogs = host.getLogs({ query: '#70' });
assert.strictEqual(searchLogs.length, 1, 'Search query should match #70');
assert.strictEqual(searchLogs[0].meta.index, 70);
console.log('✅ Test 2 Passed: Structured filters (level, source, stage, query) work accurately.');

// 3. Test executeWithFallback() with diagnostic logging
async function testFallback() {
  const failingTask = async () => {
    throw new Error('Connection refused to rcd daemon on 127.0.0.1:5572');
  };

  const result = await host.executeWithFallback(
    failingTask,
    { fallback: true, mode: 'local_sandbox' },
    'fallback_stub',
    'rclone-sync'
  );

  assert.deepStrictEqual(result, { fallback: true, mode: 'local_sandbox' }, 'Should return fallback value');
  const recent = host.getLogs({ source: 'rclone-sync' });
  assert.ok(recent.length > 0, 'Should have logged fallback error event');
  assert.strictEqual(recent[recent.length - 1].stage, 'fallback_stub');
  assert.strictEqual(recent[recent.length - 1].level, 'warn');
  console.log('✅ Test 3 Passed: executeWithFallback returns fallback value and logs diagnostic telemetry.');
}

// 4. Test live log subscription and clearLogs()
let liveEmitted = 0;
const unsub = host.subscribeLogs((entry) => {
  if (entry.message.includes('Live')) liveEmitted++;
});

host.log({ source: 'test', message: 'Live event 1' });
host.log({ source: 'test', message: 'Live event 2' });
assert.strictEqual(liveEmitted, 2, 'Live subscriber should receive emissions');
unsub();
host.log({ source: 'test', message: 'Live event 3' });
assert.strictEqual(liveEmitted, 2, 'Unsubscribed listener should not receive emissions');

host.clearLogs();
assert.strictEqual(host.getLogs().length, 0, 'Buffer should be empty after clearLogs');
console.log('✅ Test 4 Passed: Live subscription and clearLogs work as expected.');

// 5. Test example manifest validation
const manifest = require('../extensions/librfind-openlibrary/manifest.json');
const validation = validateExtensionManifest(manifest);
assert.strictEqual(validation.valid, true, 'Manifest should pass contract validation');
console.log('✅ Test 5 Passed: Extension manifest validation succeeds.');

testFallback().then(() => {
  console.log('\n🌸 All Diagnostic Logging tests passed successfully! (=^.^=)');
});
