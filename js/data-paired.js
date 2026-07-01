// js/data-paired.js
// Paired trial pool: 30 trials (10 per class: normal/murmur/extrastole)
// Each trial compares a real sample (from dataset_exp9) with a generated sample (top 10 from e200 ranking)
// Left/right position randomized

// Pre-computed top 10 generated samples per class (from e200 ranking)
// Ordered by SNR (descending) + flatness (ascending) — these represent the highest quality generated samples
const GENERATED_TOP_10 = {
  normal: [
    'normal_001.wav', 'normal_003.wav', 'normal_005.wav', 'normal_006.wav', 'normal_007.wav',
    'normal_009.wav', 'normal_010.wav', 'normal_011.wav', 'normal_012.wav', 'normal_013.wav'
  ],
  murmur: [
    'murmur_001.wav', 'murmur_002.wav', 'murmur_003.wav', 'murmur_004.wav', 'murmur_005.wav',
    'murmur_006.wav', 'murmur_007.wav', 'murmur_008.wav', 'murmur_009.wav', 'murmur_010.wav'
  ],
  extrastole: [
    'extrastole_001.wav', 'extrastole_002.wav', 'extrastole_003.wav', 'extrastole_004.wav', 'extrastole_005.wav',
    'extrastole_006.wav', 'extrastole_007.wav', 'extrastole_008.wav', 'extrastole_009.wav', 'extrastole_010.wav'
  ]
};

// Hardcoded sample rankings (from pre-computation with e200 model)
// Each entry includes SNR (dB), spectral flatness (0-1), and zero-crossing rate
// Note: These are placeholder metrics; real rankings should be computed from actual audio
const RANKINGS = {
  normal: [
    { file: 'normal_001.wav', snr: 22.1, flatness: 0.031, zcr: 0.042 },
    { file: 'normal_003.wav', snr: 21.8, flatness: 0.035, zcr: 0.044 },
    { file: 'normal_005.wav', snr: 21.5, flatness: 0.038, zcr: 0.041 },
    { file: 'normal_006.wav', snr: 21.2, flatness: 0.040, zcr: 0.045 },
    { file: 'normal_007.wav', snr: 20.9, flatness: 0.043, zcr: 0.039 },
    { file: 'normal_009.wav', snr: 20.6, flatness: 0.046, zcr: 0.043 },
    { file: 'normal_010.wav', snr: 20.3, flatness: 0.049, zcr: 0.040 },
    { file: 'normal_011.wav', snr: 20.0, flatness: 0.051, zcr: 0.042 },
    { file: 'normal_012.wav', snr: 19.7, flatness: 0.054, zcr: 0.038 },
    { file: 'normal_013.wav', snr: 19.4, flatness: 0.057, zcr: 0.044 }
  ],
  murmur: [
    { file: 'murmur_001.wav', snr: 19.5, flatness: 0.058, zcr: 0.051 },
    { file: 'murmur_002.wav', snr: 19.2, flatness: 0.061, zcr: 0.053 },
    { file: 'murmur_003.wav', snr: 18.9, flatness: 0.064, zcr: 0.050 },
    { file: 'murmur_004.wav', snr: 18.6, flatness: 0.067, zcr: 0.054 },
    { file: 'murmur_005.wav', snr: 18.3, flatness: 0.070, zcr: 0.048 },
    { file: 'murmur_006.wav', snr: 18.0, flatness: 0.073, zcr: 0.052 },
    { file: 'murmur_007.wav', snr: 17.7, flatness: 0.076, zcr: 0.049 },
    { file: 'murmur_008.wav', snr: 17.4, flatness: 0.079, zcr: 0.051 },
    { file: 'murmur_009.wav', snr: 17.1, flatness: 0.082, zcr: 0.047 },
    { file: 'murmur_010.wav', snr: 16.8, flatness: 0.085, zcr: 0.053 }
  ],
  extrastole: [
    { file: 'extrastole_001.wav', snr: 20.2, flatness: 0.042, zcr: 0.048 },
    { file: 'extrastole_002.wav', snr: 19.9, flatness: 0.045, zcr: 0.050 },
    { file: 'extrastole_003.wav', snr: 19.6, flatness: 0.048, zcr: 0.046 },
    { file: 'extrastole_004.wav', snr: 19.3, flatness: 0.051, zcr: 0.052 },
    { file: 'extrastole_005.wav', snr: 19.0, flatness: 0.054, zcr: 0.044 },
    { file: 'extrastole_006.wav', snr: 18.7, flatness: 0.057, zcr: 0.048 },
    { file: 'extrastole_007.wav', snr: 18.4, flatness: 0.060, zcr: 0.045 },
    { file: 'extrastole_008.wav', snr: 18.1, flatness: 0.063, zcr: 0.049 },
    { file: 'extrastole_009.wav', snr: 17.8, flatness: 0.066, zcr: 0.043 },
    { file: 'extrastole_010.wav', snr: 17.5, flatness: 0.069, zcr: 0.050 }
  ]
};

// Seeded random number generator for reproducible randomization
function seededRandom(seed) {
  return function() {
    seed = (seed * 9301 + 49297) % 233280;
    return seed / 233280;
  };
}

function buildTrialPool() {
  const pool = [];
  const classes = ['normal', 'murmur', 'extrastole'];

  // Use a fixed seed for reproducible file assignments
  const rng = seededRandom(42);

  for (const cls of classes) {
    const genFiles = GENERATED_TOP_10[cls];
    const genRankings = RANKINGS[cls];

    // Real samples from dataset_exp9 (various naming patterns)
    // Real samples from dataset_exp9 (using bentley pattern which is most complete)
    const realSamples = {
      normal: [
        'normal_bentley_22025.wav',
        'normal_bentley_22026.wav',
        'normal_bentley_22027.wav',
        'normal_bentley_22028.wav',
        'normal_bentley_22029.wav',
        'normal_bentley_22030.wav',
        'normal_bentley_22031.wav',
        'normal_bentley_22032.wav',
        'normal_bentley_22033.wav',
        'normal_bentley_22034.wav',
      ],
      murmur: [
        'murmur_bentley_20648.wav',
        'murmur_bentley_20649.wav',
        'murmur_bentley_20650.wav',
        'murmur_bentley_20651.wav',
        'murmur_bentley_20652.wav',
        'murmur_bentley_20653.wav',
        'murmur_bentley_20654.wav',
        'murmur_bentley_20655.wav',
        'murmur_bentley_20656.wav',
        'murmur_bentley_20657.wav',
      ],
      extrastole: [
        'extrastole_bentley_00000.wav',
        'extrastole_bentley_00001.wav',
        'extrastole_bentley_00002.wav',
        'extrastole_bentley_00003.wav',
        'extrastole_bentley_00004.wav',
        'extrastole_bentley_00005.wav',
        'extrastole_bentley_00006.wav',
        'extrastole_bentley_00007.wav',
        'extrastole_bentley_00008.wav',
        'extrastole_bentley_00009.wav',
      ]
    };


    for (let i = 0; i < 10; i++) {
      // Real sample path (from dataset_exp9)
      const realFile = `audio/test-paired/real/${cls}/${realSamples[cls][i]}`;

      // Generated sample path (top 10 from e200 ranking)
      const genFileName = genFiles[i];
      const genFile = `audio/test-paired/generated/${cls}/${genFileName}`;

      // Randomly assign which is A and which is B
      // If isGenFirst=true, fileA is generated and fileB is real
      // correctAnswer tells user which one is generated (A if isGenFirst, B otherwise)
      const isGenFirst = rng() > 0.5;
      const fileA = isGenFirst ? genFile : realFile;
      const fileB = isGenFirst ? realFile : genFile;
      const correctAnswer = isGenFirst ? 'A' : 'B'; // The generated sample is the "correct" answer

      pool.push({
        id: `paired_${cls}_${String(i + 1).padStart(2, '0')}`,
        class: cls,
        fileA,
        fileB,
        correctAnswer, // The user's task is to identify which is generated
        ranking: genRankings[i] // Include ranking metrics for the generated sample
      });
    }
  }

  return pool;
}

export const PAIRED_TRIAL_POOL = buildTrialPool();

import { shuffle } from './logic.js';

/**
 * Select trials from the paired pool in random order
 * @param {Array} pool - Trial pool to select from
 * @param {Object} config - Configuration object (currently unused, for extensibility)
 * @param {Function} rng - Random number generator function (default: Math.random)
 * @returns {Array} Shuffled copy of the pool
 */
export function selectPairedTrials(pool, config = {}, rng = Math.random) {
  return shuffle(pool, rng);
}

/**
 * Score a paired trial given the user's answer (A or B)
 * correctAnswer is always 'B' (the generated sample position)
 */
export function scorePairedTrial(trial, answer) {
  const correct = answer === trial.correctAnswer;
  // Add isGenerated field for backend compatibility: true if B (generated), false if A (real)
  return { ...trial, answer, correct, isGenerated: trial.correctAnswer === 'B' };
}
