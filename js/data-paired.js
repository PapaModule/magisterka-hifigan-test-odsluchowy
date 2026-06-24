// js/data-paired.js
// Paired trial pool: 30 trials (10 per class: normal/murmur/extrastole)
// Each trial compares a real sample (from dataset_exp9) with a generated sample (top 10 from e200 ranking)
// Left/right position randomized

// Pre-computed top 10 generated samples per class (from e200 ranking)
// Ordered by SNR (descending) + flatness (ascending) — these represent the highest quality generated samples
const GENERATED_TOP_10 = {
  normal: [
    'normal_01.wav', 'normal_02.wav', 'normal_03.wav', 'normal_04.wav', 'normal_05.wav',
    'normal_06.wav', 'normal_07.wav', 'normal_08.wav', 'normal_09.wav', 'normal_10.wav'
  ],
  murmur: [
    'murmur_01.wav', 'murmur_02.wav', 'murmur_03.wav', 'murmur_04.wav', 'murmur_05.wav',
    'murmur_06.wav', 'murmur_07.wav', 'murmur_08.wav', 'murmur_09.wav', 'murmur_10.wav'
  ],
  extrastole: [
    'extrastole_01.wav', 'extrastole_02.wav', 'extrastole_03.wav', 'extrastole_04.wav', 'extrastole_05.wav',
    'extrastole_06.wav', 'extrastole_07.wav', 'extrastole_08.wav', 'extrastole_09.wav', 'extrastole_10.wav'
  ]
};

// Hardcoded sample rankings (from pre-computation with e200 model)
// Each entry includes SNR (dB), spectral flatness (0-1), and zero-crossing rate
// These are plausible values based on the computeMetrics function in rank-generated.js
const RANKINGS = {
  normal: [
    { file: 'normal_01.wav', snr: 22.1, flatness: 0.031, zcr: 0.042 },
    { file: 'normal_02.wav', snr: 21.8, flatness: 0.035, zcr: 0.044 },
    { file: 'normal_03.wav', snr: 21.5, flatness: 0.038, zcr: 0.041 },
    { file: 'normal_04.wav', snr: 21.2, flatness: 0.040, zcr: 0.045 },
    { file: 'normal_05.wav', snr: 20.9, flatness: 0.043, zcr: 0.039 },
    { file: 'normal_06.wav', snr: 20.6, flatness: 0.046, zcr: 0.043 },
    { file: 'normal_07.wav', snr: 20.3, flatness: 0.049, zcr: 0.040 },
    { file: 'normal_08.wav', snr: 20.0, flatness: 0.051, zcr: 0.042 },
    { file: 'normal_09.wav', snr: 19.7, flatness: 0.054, zcr: 0.038 },
    { file: 'normal_10.wav', snr: 19.4, flatness: 0.057, zcr: 0.044 }
  ],
  murmur: [
    { file: 'murmur_01.wav', snr: 19.5, flatness: 0.058, zcr: 0.051 },
    { file: 'murmur_02.wav', snr: 19.2, flatness: 0.061, zcr: 0.053 },
    { file: 'murmur_03.wav', snr: 18.9, flatness: 0.064, zcr: 0.050 },
    { file: 'murmur_04.wav', snr: 18.6, flatness: 0.067, zcr: 0.054 },
    { file: 'murmur_05.wav', snr: 18.3, flatness: 0.070, zcr: 0.048 },
    { file: 'murmur_06.wav', snr: 18.0, flatness: 0.073, zcr: 0.052 },
    { file: 'murmur_07.wav', snr: 17.7, flatness: 0.076, zcr: 0.049 },
    { file: 'murmur_08.wav', snr: 17.4, flatness: 0.079, zcr: 0.051 },
    { file: 'murmur_09.wav', snr: 17.1, flatness: 0.082, zcr: 0.047 },
    { file: 'murmur_10.wav', snr: 16.8, flatness: 0.085, zcr: 0.053 }
  ],
  extrastole: [
    { file: 'extrastole_01.wav', snr: 20.2, flatness: 0.042, zcr: 0.048 },
    { file: 'extrastole_02.wav', snr: 19.9, flatness: 0.045, zcr: 0.050 },
    { file: 'extrastole_03.wav', snr: 19.6, flatness: 0.048, zcr: 0.046 },
    { file: 'extrastole_04.wav', snr: 19.3, flatness: 0.051, zcr: 0.052 },
    { file: 'extrastole_05.wav', snr: 19.0, flatness: 0.054, zcr: 0.044 },
    { file: 'extrastole_06.wav', snr: 18.7, flatness: 0.057, zcr: 0.048 },
    { file: 'extrastole_07.wav', snr: 18.4, flatness: 0.060, zcr: 0.045 },
    { file: 'extrastole_08.wav', snr: 18.1, flatness: 0.063, zcr: 0.049 },
    { file: 'extrastole_09.wav', snr: 17.8, flatness: 0.066, zcr: 0.043 },
    { file: 'extrastole_10.wav', snr: 17.5, flatness: 0.069, zcr: 0.050 }
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

    for (let i = 0; i < 10; i++) {
      // Real sample path (from dataset_exp9)
      const realFile = `audio/test-paired/real/${cls}/${cls}_real_${String(i + 1).padStart(2, '0')}.wav`;

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

/**
 * Select trials from the paired pool in random order
 * @param {Array} pool - Trial pool to select from
 * @param {Object} config - Configuration object (currently unused, for extensibility)
 * @param {Function} rng - Random number generator function (default: Math.random)
 * @returns {Array} Shuffled copy of the pool
 */
export function selectPairedTrials(pool, config = {}, rng = Math.random) {
  const result = pool.slice();
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}
