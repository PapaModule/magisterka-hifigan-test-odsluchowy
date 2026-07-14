// js/data-paired.js — 15 prób = 5 normal + 5 murmur + 5 extrastole.
// STAŁY skład 15 par (identyczny dla każdego uczestnika). Losowane per wczytanie:
// tylko kolejność prezentacji i strona A/B. extrastole: 5 RÓŻNYCH modów
// (zebrane z różnych epok, bo model kolapsuje 1 mod/epokę) dopasowanych do 5 realnych.
const GENERATED = {
  normal: ['e0200_normal_010.wav', 'e0146_normal_007.wav', 'e0200_normal_020.wav', 'e0200_normal_017.wav', 'e0200_normal_007.wav'],
  murmur: ['e0200_murmur_006.wav', 'e0146_murmur_009.wav', 'e0200_murmur_009.wav', 'e0146_murmur_010.wav', 'e0200_murmur_003.wav'],
  extrastole: ['extrastole_e0080.wav', 'extrastole_e0070.wav', 'extrastole_e0050.wav', 'extrastole_e0160.wav', 'extrastole_e0040.wav']
};
const REAL = {
  normal: ['normal_p2022_18559.wav', 'normal_p2022_17938.wav', 'normal_p2022_09420.wav', 'normal_p2022_09379.wav', 'normal_p2022_10502.wav'],
  murmur: ['murmur_p2016_t_11260.wav', 'murmur_p2016_t_12820.wav', 'murmur_p2016_t_13905.wav', 'murmur_p2016_t_09840.wav', 'murmur_p2016_t_15025.wav'],
  extrastole: ['extrastole_bentley_00033.wav', 'extrastole_bentley_00034.wav', 'extrastole_bentley_00026.wav', 'extrastole_bentley_00043.wav', 'extrastole_bentley_00041.wav']
};
// STAŁY skład par (identyczny dla każdego uczestnika). Losowane per wczytanie:
// tylko strona A/B (w makePair) oraz kolejność prezentacji (selectPairedTrials).
function makePair(cls, gi, ri, p) {
  const genFile = `audio/test-paired/generated/${cls}/${GENERATED[cls][gi]}`;
  const realFile = `audio/test-paired/real/${cls}/${REAL[cls][ri]}`;
  const isGenFirst = Math.random() > 0.5;
  return {
    id: `paired_${cls}_${String(p + 1).padStart(2, '0')}`,
    class: cls,
    fileA: isGenFirst ? genFile : realFile,
    fileB: isGenFirst ? realFile : genFile,
    correctAnswer: isGenFirst ? 'A' : 'B'
  };
}

function buildTrialPool() {
  const pool = [];
  // 5 stałych par na klasę (gen[i] <-> real[i]); extrastole też 5 różnych
  for (const cls of ['normal', 'murmur', 'extrastole']) {
    for (let i = 0; i < GENERATED[cls].length; i++) pool.push(makePair(cls, i, i, i));
  }
  return pool;
}

export const PAIRED_TRIAL_POOL = buildTrialPool();
import { shuffle } from './logic.js';
export function selectPairedTrials(pool, config = {}, rng = Math.random) {
  return shuffle(pool, rng);
}
export function scorePairedTrial(trial, answer) {
  const correct = answer === trial.correctAnswer;
  return { ...trial, answer, correct, isGenerated: trial.correctAnswer === 'B' };
}
