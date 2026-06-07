export const CLASS_INFO = {
  normal: {
    title: 'Norma (normal)',
    description: 'Prawidłowy rytm serca — regularne, czyste tony „lub-dub” bez dodatkowych dźwięków.'
  },
  murmur: {
    title: 'Szmer (murmur)',
    description: 'Dodatkowy, „chrobotliwy” dźwięk pomiędzy lub w trakcie tonów serca, powstający na skutek turbulentnego przepływu krwi.'
  },
  extrastole: {
    title: 'Dodatkowy ton (extrastole)',
    description: 'Pojedynczy, przedwczesny dodatkowy ton zaburzający regularny rytm „lub-dub”.'
  }
};

export const CALIBRATION_SAMPLES = [
  { class: 'normal', file: 'audio/calibration/normal_01.wav', label: 'Norma — przykład 1' },
  { class: 'normal', file: 'audio/calibration/normal_02.wav', label: 'Norma — przykład 2' },
  { class: 'murmur', file: 'audio/calibration/murmur_01.wav', label: 'Szmer — przykład 1' },
  { class: 'murmur', file: 'audio/calibration/murmur_02.wav', label: 'Szmer — przykład 2' },
  { class: 'extrastole', file: 'audio/calibration/extrastole_01.wav', label: 'Dodatkowy ton — przykład 1' },
  { class: 'extrastole', file: 'audio/calibration/extrastole_02.wav', label: 'Dodatkowy ton — przykład 2' }
];

// PLACEHOLDER — pula próbek do testu real-vs-fake.
// Wpisy "isGenerated: true" wskazują TYMCZASOWO na pliki skopiowane
// z oryginalnego datasetu — eksperyment exp9 jeszcze trwa i docelowe
// wygenerowane próbki nie istnieją. Po jego zakończeniu podmień pliki
// w audio/test/generated/ na finalne nagrania z modelu, zachowując
// te same nazwy plików — patrz README.md, sekcja
// "Podmiana próbek po zakończeniu eksperymentu".
export const TEST_TRIAL_POOL = [
  { id: 'normal_real_01', class: 'normal', isGenerated: false, file: 'audio/test/real/normal_01.wav' },
  { id: 'normal_real_02', class: 'normal', isGenerated: false, file: 'audio/test/real/normal_02.wav' },
  { id: 'normal_real_03', class: 'normal', isGenerated: false, file: 'audio/test/real/normal_03.wav' },
  { id: 'normal_real_04', class: 'normal', isGenerated: false, file: 'audio/test/real/normal_04.wav' },
  { id: 'normal_real_05', class: 'normal', isGenerated: false, file: 'audio/test/real/normal_05.wav' },
  { id: 'normal_generated_01', class: 'normal', isGenerated: true, file: 'audio/test/generated/normal_01.wav' },
  { id: 'normal_generated_02', class: 'normal', isGenerated: true, file: 'audio/test/generated/normal_02.wav' },
  { id: 'normal_generated_03', class: 'normal', isGenerated: true, file: 'audio/test/generated/normal_03.wav' },
  { id: 'normal_generated_04', class: 'normal', isGenerated: true, file: 'audio/test/generated/normal_04.wav' },
  { id: 'normal_generated_05', class: 'normal', isGenerated: true, file: 'audio/test/generated/normal_05.wav' },

  { id: 'murmur_real_01', class: 'murmur', isGenerated: false, file: 'audio/test/real/murmur_01.wav' },
  { id: 'murmur_real_02', class: 'murmur', isGenerated: false, file: 'audio/test/real/murmur_02.wav' },
  { id: 'murmur_real_03', class: 'murmur', isGenerated: false, file: 'audio/test/real/murmur_03.wav' },
  { id: 'murmur_real_04', class: 'murmur', isGenerated: false, file: 'audio/test/real/murmur_04.wav' },
  { id: 'murmur_real_05', class: 'murmur', isGenerated: false, file: 'audio/test/real/murmur_05.wav' },
  { id: 'murmur_generated_01', class: 'murmur', isGenerated: true, file: 'audio/test/generated/murmur_01.wav' },
  { id: 'murmur_generated_02', class: 'murmur', isGenerated: true, file: 'audio/test/generated/murmur_02.wav' },
  { id: 'murmur_generated_03', class: 'murmur', isGenerated: true, file: 'audio/test/generated/murmur_03.wav' },
  { id: 'murmur_generated_04', class: 'murmur', isGenerated: true, file: 'audio/test/generated/murmur_04.wav' },
  { id: 'murmur_generated_05', class: 'murmur', isGenerated: true, file: 'audio/test/generated/murmur_05.wav' },

  { id: 'extrastole_real_01', class: 'extrastole', isGenerated: false, file: 'audio/test/real/extrastole_01.wav' },
  { id: 'extrastole_real_02', class: 'extrastole', isGenerated: false, file: 'audio/test/real/extrastole_02.wav' },
  { id: 'extrastole_real_03', class: 'extrastole', isGenerated: false, file: 'audio/test/real/extrastole_03.wav' },
  { id: 'extrastole_real_04', class: 'extrastole', isGenerated: false, file: 'audio/test/real/extrastole_04.wav' },
  { id: 'extrastole_real_05', class: 'extrastole', isGenerated: false, file: 'audio/test/real/extrastole_05.wav' },
  { id: 'extrastole_generated_01', class: 'extrastole', isGenerated: true, file: 'audio/test/generated/extrastole_01.wav' },
  { id: 'extrastole_generated_02', class: 'extrastole', isGenerated: true, file: 'audio/test/generated/extrastole_02.wav' },
  { id: 'extrastole_generated_03', class: 'extrastole', isGenerated: true, file: 'audio/test/generated/extrastole_03.wav' },
  { id: 'extrastole_generated_04', class: 'extrastole', isGenerated: true, file: 'audio/test/generated/extrastole_04.wav' },
  { id: 'extrastole_generated_05', class: 'extrastole', isGenerated: true, file: 'audio/test/generated/extrastole_05.wav' }
];

export const TEST_CONFIG = {
  classes: ['normal', 'murmur', 'extrastole'],
  realPerClass: 5,
  generatedPerClass: 5
};
