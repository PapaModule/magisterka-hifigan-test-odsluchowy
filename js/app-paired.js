import { CALIBRATION_SAMPLES, CLASS_INFO } from './data.js';
import { PAIRED_TRIAL_POOL as TEST_TRIAL_POOL, selectPairedTrials, scorePairedTrial } from './data-paired.js';
import { isSurveyComplete } from './logic.js';

const GAS_WEBHOOK_URL = 'https://script.google.com/macros/s/AKfycby-ZQFd6aQX92gkORo0TU-XSEL3LdOZvkdA34MZMs6K8vJ96uwuBMgs88k3_xF9YHV3/exec';

const CLASS_LABELS = {
  normal: 'norma (normal)',
  murmur: 'szmer (murmur)',
  extrastole: 'dodatkowy ton (extrastole)'
};

const state = {
  step: 'welcome',
  survey: {
    ageRange: '',
    audioExperience: '',
    equipment: '',
    medicalExperience: { hasExperience: null, details: '' }
  },
  trials: [],
  trialIndex: 0,
  scoredTrials: [],
  sendStatus: 'idle'
};

const app = document.getElementById('app');

function render() {
  if (state.step === 'welcome') app.innerHTML = renderWelcome();
  else if (state.step === 'survey') app.innerHTML = renderSurvey();
  else if (state.step === 'calibration') app.innerHTML = renderCalibration();
  else if (state.step === 'test') app.innerHTML = renderTest();
  else if (state.step === 'summary') app.innerHTML = renderSummary();
  const step = app.querySelector('.step');
  if (step && getComputedStyle(step).animationName !== 'none') {
    step.style.pointerEvents = 'none';
    step.addEventListener('animationend', () => { step.style.pointerEvents = ''; }, { once: true });
  }
  attachHandlers();
}

function goToStep(step) {
  state.step = step;
  render();
  window.scrollTo(0, 0);
}

function attachHandlers() {
  if (state.step === 'welcome') attachWelcomeHandlers();
  else if (state.step === 'survey') attachSurveyHandlers();
  else if (state.step === 'calibration') attachCalibrationHandlers();
  else if (state.step === 'test') attachTestHandlers();
  else if (state.step === 'summary') attachSummaryHandlers();
}

function renderWelcome() {
  return `
    <section class="step step-welcome">
      <h1>Test odsłuchowy — A/B porównanie</h1>
      <p>
        Pomagasz nam ocenić, jak dobrze model sztucznej inteligencji potrafi
        generować realistyczne nagrania dźwięków serca (norma, szmer,
        dodatkowy ton). Test składa się z trzech części:
      </p>
      <ol>
        <li>krótka ankieta o Tobie (ok. 1 minuty),</li>
        <li>osłuchanie przykładowych nagrań z oryginalnego zbioru danych,</li>
        <li>30 prób, w których usłyszysz dwa dźwięki i wskaż, który jest wygenerowany.</li>
      </ol>
      <p>Cały test zajmuje zwykle 10–15 minut. Najlepiej przeprowadzić go w cichym otoczeniu, najlepiej na słuchawkach.</p>
      <button type="button" class="btn btn-primary" data-action="start">Rozpocznij</button>
    </section>
  `;
}

function attachWelcomeHandlers() {
  app.querySelector('[data-action="start"]').addEventListener('click', () => goToStep('survey'));
}

function renderSurvey() {
  return `
    <section class="step step-survey">
      <h2>Krótka ankieta</h2>
      <p>Te informacje pomogą nam zinterpretować wyniki testu. Wszystkie pola są wymagane (poza opisem doświadczenia medycznego).</p>
      <form id="survey-form">
        <fieldset>
          <legend>Wiek</legend>
          <select name="ageRange" required>
            <option value="">— wybierz —</option>
            <option value="<18">poniżej 18</option>
            <option value="18-25">18–25</option>
            <option value="26-35">26–35</option>
            <option value="36-50">36–50</option>
            <option value="50+">powyżej 50</option>
          </select>
        </fieldset>
        <fieldset>
          <legend>Doświadczenie ze słuchem / muzyką</legend>
          <select name="audioExperience" required>
            <option value="">— wybierz —</option>
            <option value="brak">brak / nie dotyczy</option>
            <option value="amator">amator (np. gram dla przyjemności)</option>
            <option value="zaawansowany">zaawansowany (np. szkoła muzyczna, hobby na poważnie)</option>
            <option value="profesjonalista">profesjonalista (np. muzyk, realizator dźwięku)</option>
          </select>
        </fieldset>
        <fieldset>
          <legend>Sprzęt, na którym słuchasz teraz</legend>
          <select name="equipment" required>
            <option value="">— wybierz —</option>
            <option value="słuchawki">słuchawki</option>
            <option value="głośniki komputera/laptopa">głośniki komputera / laptopa</option>
            <option value="głośnik telefonu/tabletu">głośnik telefonu / tabletu</option>
            <option value="głośniki zewnętrzne">głośniki zewnętrzne</option>
            <option value="inne">inne</option>
          </select>
        </fieldset>
        <fieldset>
          <legend>Doświadczenie medyczne / osłuchowe</legend>
          <p class="field-hint">Czy osłuchiwał(a) Pan/Pani kiedykolwiek serce pacjentów (np. studia medyczne, praca w zawodzie)?</p>
          <label class="radio-label"><input type="radio" name="medicalExperience" value="tak" required> tak</label>
          <label class="radio-label"><input type="radio" name="medicalExperience" value="nie" required> nie</label>
          <label class="field-label" for="medical-details">Jeśli tak — w jakim kontekście? (opcjonalnie)</label>
          <input type="text" id="medical-details" name="medicalDetails" placeholder="np. studia pielęgniarskie, praktyka lekarska...">
        </fieldset>
        <p class="form-error" id="survey-error" hidden>Uzupełnij wszystkie wymagane pola, aby przejść dalej.</p>
        <button type="submit" class="btn btn-primary">Dalej</button>
      </form>
    </section>
  `;
}

function attachSurveyHandlers() {
  const form = app.querySelector('#survey-form');
  form.addEventListener('submit', (event) => {
    event.preventDefault();
    const data = new FormData(form);
    const medicalAnswer = data.get('medicalExperience');
    const survey = {
      ageRange: data.get('ageRange') || '',
      audioExperience: data.get('audioExperience') || '',
      equipment: data.get('equipment') || '',
      medicalExperience: {
        hasExperience: medicalAnswer === 'tak' ? true : medicalAnswer === 'nie' ? false : null,
        details: (data.get('medicalDetails') || '').trim()
      }
    };
    if (!isSurveyComplete(survey)) {
      app.querySelector('#survey-error').hidden = false;
      return;
    }
    state.survey = survey;
    goToStep('calibration');
  });
}

function renderCalibration() {
  const sections = Object.keys(CLASS_INFO).map((cls) => {
    const info = CLASS_INFO[cls];
    const players = CALIBRATION_SAMPLES
      .filter((s) => s.class === cls)
      .map((s) => `
        <div class="sample-player">
          <span class="sample-label">${s.label}</span>
          <audio controls preload="none" src="${s.file}"></audio>
        </div>
      `)
      .join('');
    return `
      <article class="class-card">
        <h3>${info.title}</h3>
        <p>${info.description}</p>
        ${players}
      </article>
    `;
  }).join('');

  return `
    <section class="step step-calibration">
      <h2>Osłuchanie — poznaj oryginalne nagrania</h2>
      <p>
        Zanim przejdziesz do właściwego testu, posłuchaj kilku przykładów
        z oryginalnego zbioru danych dla każdej z trzech klas. To pomoże Ci
        wyrobić sobie punkt odniesienia.
      </p>
      ${sections}
      <button type="button" class="btn btn-primary" data-action="to-test">Przejdź do testu</button>
    </section>
  `;
}

function attachCalibrationHandlers() {
  app.querySelector('[data-action="to-test"]').addEventListener('click', () => {
    state.trials = selectPairedTrials(TEST_TRIAL_POOL, {}, Math.random);
    state.trialIndex = 0;
    state.scoredTrials = [];
    goToStep('test');
  });
}

function renderTest() {
  const trial = state.trials[state.trialIndex];
  const total = state.trials.length;
  const current = state.trialIndex + 1;
  return `
    <section class="step step-test">
      <h2>Test — który z dźwięków jest wygenerowany?</h2>
      <p class="progress">Próba ${current} z ${total}</p>
      <p class="trial-class">Klasa: <strong>${CLASS_LABELS[trial.class]}</strong></p>

      <div class="paired-players">
        <div class="player-group">
          <span class="player-label">Audio A</span>
          <audio controls preload="none" src="${trial.fileA}"></audio>
        </div>
        <div class="player-group">
          <span class="player-label">Audio B</span>
          <audio controls preload="none" src="${trial.fileB}"></audio>
        </div>
      </div>

      <div class="answer-buttons">
        <button type="button" class="btn btn-answer" data-answer="A">To A jest wygenerowane</button>
        <button type="button" class="btn btn-answer" data-answer="B">To B jest wygenerowane</button>
      </div>
    </section>
  `;
}

function attachTestHandlers() {
  app.querySelectorAll('[data-answer]').forEach((button) => {
    button.addEventListener('click', () => {
      const trial = state.trials[state.trialIndex];
      const scored = scorePairedTrial(trial, button.dataset.answer);
      state.scoredTrials.push(scored);
      
      // Show feedback
      const isCorrect = scored.correct;
      const feedbackDiv = document.createElement('div');
      feedbackDiv.style.cssText = 'position: fixed; top: 50%; left: 50%; transform: translate(-50%, -50%); font-size: 2rem; font-weight: bold; padding: 2rem; border-radius: 8px; z-index: 9999;';
      feedbackDiv.textContent = isCorrect ? '✓ Prawidłowo!' : '✗ Błędnie!';
      feedbackDiv.style.backgroundColor = isCorrect ? '#10b981' : '#ef4444';
      feedbackDiv.style.color = 'white';
      app.appendChild(feedbackDiv);
      
      // Disable buttons during feedback
      app.querySelectorAll('[data-answer]').forEach(b => b.disabled = true);
      
      // After 1 second, move to next trial
      setTimeout(() => {
        feedbackDiv.remove();
        if (state.trialIndex + 1 < state.trials.length) {
          state.trialIndex += 1;
          render();
        } else {
          finishTest();
        }
      }, 1000);
    });
  });
}


// Zakończenie testu: od razu pokazujemy ekran podziękowania z wynikiem,
// a wyniki wysyłają się automatycznie w tle (bez klikania przez uczestnika).
function finishTest() {
  goToStep('summary');
  sendResults();
}

function renderSummary() {
  const correctCount = state.scoredTrials.filter((trial) => trial.correct).length;
  const totalCount = state.scoredTrials.length;
  const percentage = totalCount === 0 ? 0 : Math.round((correctCount / totalCount) * 100);
  const errorFallback = state.sendStatus === 'error' ? `
      <p class="status status-error">
        Nie udało się automatycznie zapisać wyników. Jeśli możesz, pobierz plik
        i prześlij go osobie prowadzącej test.
      </p>
      <button type="button" class="btn btn-secondary" data-action="download">Pobierz wyniki (JSON)</button>
    ` : '';
  return `
    <section class="step step-summary">
      <h2>Bardzo dziękuję za udział w teście!</h2>
      <p>Miłego dnia!</p>
      <p class="result-score">Twój wynik: ${correctCount}/${totalCount} (${percentage}%)</p>
      ${errorFallback}
    </section>
  `;
}

function attachSummaryHandlers() {
  const downloadButton = app.querySelector('[data-action="download"]');
  if (downloadButton) downloadButton.addEventListener('click', downloadResults);
}

function buildPayload() {
  return {
    testVersion: 2,
    timestamp: new Date().toISOString(),
    survey: state.survey,
    trials: state.scoredTrials.map((trial, index) => ({
      id: trial.id,
      class: trial.class,
      isGenerated: trial.isGenerated,
      answer: trial.answer,
      correct: trial.correct,
      orderIndex: index
    }))
  };
}

async function sendResults(attempt = 1) {
  const MAX_ATTEMPTS = 3;
  try {
    const response = await fetch(GAS_WEBHOOK_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'text/plain;charset=utf-8' },
      body: JSON.stringify(buildPayload())
    });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    state.sendStatus = 'sent';
  } catch (error) {
    console.error(`Wysyłka wyników nie powiodła się (próba ${attempt}/${MAX_ATTEMPTS}):`, error);
    if (attempt < MAX_ATTEMPTS) {
      setTimeout(() => sendResults(attempt + 1), 1500 * attempt);
      return;
    }
    // Trwały błąd — pokaż uczestnikowi opcję pobrania, żeby nie zgubić danych.
    state.sendStatus = 'error';
    if (state.step === 'summary') render();
  }
}

function downloadResults() {
  const blob = new Blob([JSON.stringify(buildPayload(), null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `wyniki-test2-${Date.now()}.json`;
  link.click();
  URL.revokeObjectURL(url);
}

render();
