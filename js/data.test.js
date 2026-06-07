import { test } from 'node:test';
import assert from 'node:assert/strict';
import { CALIBRATION_SAMPLES, TEST_TRIAL_POOL, TEST_CONFIG } from './data.js';

test('calibration manifest has at least 2 samples for each class', () => {
  for (const cls of TEST_CONFIG.classes) {
    const count = CALIBRATION_SAMPLES.filter((s) => s.class === cls).length;
    assert.ok(count >= 2, `expected at least 2 calibration samples for ${cls}, got ${count}`);
  }
});

test('test trial pool has at least the configured real/generated counts for every class', () => {
  for (const cls of TEST_CONFIG.classes) {
    const real = TEST_TRIAL_POOL.filter((t) => t.class === cls && !t.isGenerated).length;
    const generated = TEST_TRIAL_POOL.filter((t) => t.class === cls && t.isGenerated).length;
    assert.ok(real >= TEST_CONFIG.realPerClass, `expected >= ${TEST_CONFIG.realPerClass} real samples for ${cls}, got ${real}`);
    assert.ok(generated >= TEST_CONFIG.generatedPerClass, `expected >= ${TEST_CONFIG.generatedPerClass} generated samples for ${cls}, got ${generated}`);
  }
});

test('every trial in the pool has a unique id', () => {
  const ids = TEST_TRIAL_POOL.map((t) => t.id);
  assert.equal(new Set(ids).size, ids.length);
});
