import { test } from 'node:test';
import assert from 'node:assert/strict';
import { shuffle, selectTrials } from './logic.js';

function fixedRng(sequence) {
  let i = 0;
  return () => sequence[i++];
}

test('shuffle deterministically reorders elements according to the provided rng and does not mutate the input', () => {
  const input = [1, 2, 3, 4, 5];
  const result = shuffle(input, fixedRng([0.9, 0.1, 0.5, 0.1]));
  assert.deepEqual(result, [3, 4, 2, 1, 5]);
  assert.deepEqual(input, [1, 2, 3, 4, 5]);
});

test('selectTrials picks the configured number of real and generated trials per class and returns them shuffled', () => {
  const pool = [
    { id: 'n-real-1', class: 'normal', isGenerated: false },
    { id: 'n-real-2', class: 'normal', isGenerated: false },
    { id: 'n-gen-1', class: 'normal', isGenerated: true },
    { id: 'n-gen-2', class: 'normal', isGenerated: true },
    { id: 'm-real-1', class: 'murmur', isGenerated: false },
    { id: 'm-real-2', class: 'murmur', isGenerated: false },
    { id: 'm-gen-1', class: 'murmur', isGenerated: true },
    { id: 'm-gen-2', class: 'murmur', isGenerated: true }
  ];
  const trials = selectTrials(
    pool,
    { classes: ['normal', 'murmur'], realPerClass: 1, generatedPerClass: 1 },
    () => 0
  );
  assert.equal(trials.length, 4);
  for (const cls of ['normal', 'murmur']) {
    const real = trials.filter((t) => t.class === cls && !t.isGenerated);
    const generated = trials.filter((t) => t.class === cls && t.isGenerated);
    assert.equal(real.length, 1, `expected exactly 1 real ${cls} trial`);
    assert.equal(generated.length, 1, `expected exactly 1 generated ${cls} trial`);
  }
});
