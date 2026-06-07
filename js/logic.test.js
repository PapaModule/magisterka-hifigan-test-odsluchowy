import { test } from 'node:test';
import assert from 'node:assert/strict';
import { shuffle, selectTrials, scoreTrial, isSurveyComplete, buildResultsPayload } from './logic.js';

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

test('scoreTrial marks a correct guess as correct and an incorrect guess as incorrect', () => {
  const generatedTrial = { id: 'g1', class: 'normal', isGenerated: true, file: 'audio/test/generated/normal_01.wav' };
  const realTrial = { id: 'r1', class: 'murmur', isGenerated: false, file: 'audio/test/real/murmur_01.wav' };

  assert.deepEqual(scoreTrial(generatedTrial, 'generated'), { ...generatedTrial, answer: 'generated', correct: true });
  assert.deepEqual(scoreTrial(generatedTrial, 'real'), { ...generatedTrial, answer: 'real', correct: false });
  assert.deepEqual(scoreTrial(realTrial, 'real'), { ...realTrial, answer: 'real', correct: true });
  assert.deepEqual(scoreTrial(realTrial, 'generated'), { ...realTrial, answer: 'generated', correct: false });
});

test('isSurveyComplete requires every field, including a boolean medicalExperience.hasExperience', () => {
  assert.equal(isSurveyComplete({}), false);
  assert.equal(isSurveyComplete({
    ageRange: '18-25',
    audioExperience: 'amator',
    equipment: 'słuchawki',
    medicalExperience: { hasExperience: false, details: '' }
  }), true);
  assert.equal(isSurveyComplete({
    ageRange: '18-25',
    audioExperience: 'amator',
    equipment: 'słuchawki',
    medicalExperience: { hasExperience: null, details: '' }
  }), false);
});

test('buildResultsPayload assembles timestamp, survey and ordered, mapped trial results', () => {
  const survey = {
    ageRange: '26-35',
    audioExperience: 'amator',
    equipment: 'słuchawki',
    medicalExperience: { hasExperience: false, details: '' }
  };
  const scoredTrials = [
    { id: 'a', class: 'normal', isGenerated: false, file: 'x.wav', answer: 'real', correct: true },
    { id: 'b', class: 'murmur', isGenerated: true, file: 'y.wav', answer: 'real', correct: false }
  ];
  const payload = buildResultsPayload(survey, scoredTrials, '2026-06-07T12:00:00.000Z');
  assert.deepEqual(payload, {
    timestamp: '2026-06-07T12:00:00.000Z',
    survey,
    trials: [
      { id: 'a', class: 'normal', isGenerated: false, answer: 'real', correct: true, orderIndex: 0 },
      { id: 'b', class: 'murmur', isGenerated: true, answer: 'real', correct: false, orderIndex: 1 }
    ]
  });
});
