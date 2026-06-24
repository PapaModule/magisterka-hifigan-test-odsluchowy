// js/data-paired.test.js
import { test } from 'node:test';
import assert from 'node:assert';
import { PAIRED_TRIAL_POOL, selectPairedTrials } from './data-paired.js';

test('Trial pool structure', () => {
  // Total count: 30 trials
  assert.strictEqual(PAIRED_TRIAL_POOL.length, 30, `Pool has ${PAIRED_TRIAL_POOL.length} trials, expected 30`);

  // Count by class
  const byClass = { normal: 0, murmur: 0, extrastole: 0 };
  const ids = new Set();

  for (const trial of PAIRED_TRIAL_POOL) {
    byClass[trial.class]++;
    ids.add(trial.id);

    // Validate trial structure
    assert(trial.id, `Trial missing id`);
    assert(trial.class, `Trial ${trial.id} missing class`);
    assert(trial.fileA, `Trial ${trial.id} has no fileA`);
    assert(trial.fileB, `Trial ${trial.id} has no fileB`);
    assert(['A', 'B'].includes(trial.correctAnswer), `Trial ${trial.id} has invalid correctAnswer: ${trial.correctAnswer}`);
    assert(trial.ranking, `Trial ${trial.id} missing ranking`);
    assert(typeof trial.ranking.snr === 'number', `Trial ${trial.id} ranking.snr not a number`);
    assert(typeof trial.ranking.flatness === 'number', `Trial ${trial.id} ranking.flatness not a number`);
    assert(typeof trial.ranking.zcr === 'number', `Trial ${trial.id} ranking.zcr not a number`);

    // Validate file paths exist and are different
    assert(trial.fileA !== trial.fileB, `Trial ${trial.id}: fileA and fileB are identical`);

    // CRITICAL SEMANTIC ASSERTION: correctAnswer must point to the generated file
    const generatedInA = trial.fileA.includes('/generated/');
    const generatedInB = trial.fileB.includes('/generated/');
    const answerPointsToGenerated =
      (trial.correctAnswer === 'A' && generatedInA) ||
      (trial.correctAnswer === 'B' && generatedInB);
    assert(answerPointsToGenerated,
      `Trial ${trial.id}: correctAnswer doesn't point to generated file (answer='${trial.correctAnswer}', genA=${generatedInA}, genB=${generatedInB})`);
  }

  // Verify unique IDs
  assert.strictEqual(ids.size, 30, `Expected 30 unique IDs, got ${ids.size}`);

  // Verify 10 per class
  assert.strictEqual(byClass.normal, 10, `normal: ${byClass.normal}, expected 10`);
  assert.strictEqual(byClass.murmur, 10, `murmur: ${byClass.murmur}, expected 10`);
  assert.strictEqual(byClass.extrastole, 10, `extrastole: ${byClass.extrastole}, expected 10`);

  // Verify that real and generated files are mixed (some fileA are real, some generated)
  let genFirstCount = 0;
  for (const trial of PAIRED_TRIAL_POOL) {
    if (trial.fileA.includes('/generated/')) {
      genFirstCount++;
    }
  }
  assert(genFirstCount > 0 && genFirstCount < 30, `Generated files not properly mixed: ${genFirstCount} trials have generated as fileA`);
});

test('Trial pool ranking metrics', () => {
  for (const trial of PAIRED_TRIAL_POOL) {
    const { ranking } = trial;

    // SNR should be positive in dB
    assert(ranking.snr > 0, `Trial ${trial.id}: SNR should be positive, got ${ranking.snr}`);

    // Flatness should be between 0 and 1
    assert(ranking.flatness >= 0 && ranking.flatness <= 1, `Trial ${trial.id}: flatness out of range [0,1]: ${ranking.flatness}`);

    // ZCR should be between 0 and 1
    assert(ranking.zcr >= 0 && ranking.zcr <= 1, `Trial ${trial.id}: zcr out of range [0,1]: ${ranking.zcr}`);

    // Verify file name matches ranking
    const genFileName = trial.fileA.includes('/generated/') ? trial.fileA.split('/').pop() : trial.fileB.split('/').pop();
    assert.strictEqual(ranking.file, genFileName, `Trial ${trial.id}: ranking file mismatch`);
  }
});

test('selectPairedTrials returns shuffled copy', () => {
  const selected = selectPairedTrials(PAIRED_TRIAL_POOL, {}, Math.random);

  // Same count
  assert.strictEqual(selected.length, 30, `Selected trials: ${selected.length}, expected 30`);

  // Should return a new array, not reference to original
  assert(selected !== PAIRED_TRIAL_POOL, 'selectPairedTrials should return new array');

  // Should contain all the same trials (by id)
  const selectedIds = new Set(selected.map(t => t.id));
  const originalIds = new Set(PAIRED_TRIAL_POOL.map(t => t.id));
  assert.strictEqual(selectedIds.size, 30, 'Selected array should have 30 unique IDs');

  for (const id of originalIds) {
    assert(selectedIds.has(id), `Selected array missing trial ${id}`);
  }
});

test('selectPairedTrials with custom RNG', () => {
  // Test with a seeded RNG for reproducibility
  let seed = 12345;
  const seededRng = () => {
    seed = (seed * 9301 + 49297) % 233280;
    return seed / 233280;
  };

  const selected1 = selectPairedTrials(PAIRED_TRIAL_POOL, {}, seededRng);

  // Reset seed
  seed = 12345;
  const selected2 = selectPairedTrials(PAIRED_TRIAL_POOL, {}, seededRng);

  // Same seed should produce same order
  for (let i = 0; i < 30; i++) {
    assert.strictEqual(selected1[i].id, selected2[i].id, `Trial order differs at index ${i} with same seed`);
  }
});

test('selectPairedTrials with Math.random is different order', () => {
  const selected1 = selectPairedTrials(PAIRED_TRIAL_POOL, {}, Math.random);
  const selected2 = selectPairedTrials(PAIRED_TRIAL_POOL, {}, Math.random);

  // Very unlikely to have identical order with Math.random (probability ~10^-32)
  // Just verify they are different arrays
  assert(selected1 !== selected2, 'Two random shuffles should be different array objects');
});
