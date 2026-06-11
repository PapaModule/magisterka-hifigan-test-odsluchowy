import { CALIBRATION_SAMPLES, CLASS_INFO, TEST_TRIAL_POOL, TEST_CONFIG } from './data.js';
import { selectTrials, scoreTrial, buildResultsPayload, isSurveyComplete } from './logic.js';

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

// ── Krok 0: Powitanie ──────────────────────────────────────────────
function renderWelcome() {
  return `
    <section class="step step-welcome">
      <h1>Test odsłuchowy — generowane dźwięki serca</h1>
      <p>
        Pomagasz nam ocenić, jak dobrze model sztucznej inteligencji potrafi
        generować realistyczne nagrania dźwięków serca (norma, szmer,
        dodatkowy ton). Test składa się z trzech części:
      </p>
      <ol>
        <li>krótka ankieta o Tobie (ok. 1 minuty),</li>
        <li>osłuchanie przykładowych nagrań z oryginalnego zbioru danych,</li>
        <li>30 prób, w których ocenisz, czy nagranie jest prawdziwe, czy wygenerowane.</li>
      </ol>
      <p>Cały test zajmuje zwykle 10–15 minut. Najlepiej przeprowadzić go w cichym otoczeniu, najlepiej na słuchawkach.</p>
      <button type="button" class="btn btn-primary" data-action="start">Rozpocznij</button>
    </section>
  `;
}

function attachWelcomeHandlers() {
  app.querySelector('[data-action="start"]').addEventListener('click', () => goToStep('survey'));
}

// ── Krok 1: Ankieta ────────────────────────────────────────────────
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

// ── Krok 2: Osłuchanie ─────────────────────────────────────────────
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
    state.trials = selectTrials(TEST_TRIAL_POOL, TEST_CONFIG, Math.random);
    state.trialIndex = 0;
    state.scoredTrials = [];
    goToStep('test');
  });
}

// ── Krok 3: Test real-vs-fake ──────────────────────────────────────
function renderTest() {
  const trial = state.trials[state.trialIndex];
  const total = state.trials.length;
  const current = state.trialIndex + 1;
  return `
    <section class="step step-test">
      <h2>Test — czy ta próbka jest prawdziwa, czy wygenerowana?</h2>
      <p class="progress">Próba ${current} z ${total}</p>
      <p class="trial-class">Klasa: <strong>${CLASS_LABELS[trial.class]}</strong></p>
      <audio controls preload="none" src="${trial.file}"></audio>
      <div class="answer-buttons">
        <button type="button" class="btn btn-answer" data-answer="real">Prawdziwa</button>
        <button type="button" class="btn btn-answer" data-answer="generated">Wygenerowana</button>
      </div>
    </section>
  `;
}

function attachTestHandlers() {
  app.querySelectorAll('[data-answer]').forEach((button) => {
    button.addEventListener('click', () => {
      const trial = state.trials[state.trialIndex];
      state.scoredTrials.push(scoreTrial(trial, button.dataset.answer));
      if (state.trialIndex + 1 < state.trials.length) {
        state.trialIndex += 1;
        render();
      } else {
        goToStep('summary');
      }
    });
  });
}

// ── Krok 4: Podsumowanie i wysyłka ─────────────────────────────────
function renderSummary() {
  const correctCount = state.scoredTrials.filter((trial) => trial.correct).length;
  const totalCount = state.scoredTrials.length;
  const percentage = totalCount === 0 ? 0 : Math.round((correctCount / totalCount) * 100);
  const scoreLine = `<p class="result-score">Twój wynik: ${correctCount}/${totalCount} (${percentage}%)</p>`;
  const statusMessages = {
    idle: '',
    sending: '<p class="status status-sending">Wysyłanie wyników…</p>',
    sent: `
      <p class="status status-sent">Dziękujemy! Wyniki zostały zapisane.</p>
      ${scoreLine}
    `,
    error: `
      <p class="status status-error">
        Nie udało się wysłać wyników automatycznie. Pobierz plik z wynikami
        i prześlij go prowadzącemu test.
      </p>
      <button type="button" class="btn btn-secondary" data-action="download">Pobierz wyniki (JSON)</button>
    `
  };
  return `
    <section class="step step-summary">
      <h2>Dziękujemy za udział!</h2>
      <p>To już koniec testu. Kliknij przycisk poniżej, aby wysłać swoje odpowiedzi.</p>
      ${state.sendStatus === 'sent' ? '' : `
      <button type="button" class="btn btn-primary" data-action="send" ${state.sendStatus === 'sending' ? 'disabled' : ''}>
        Wyślij wyniki
      </button>
      `}
      ${statusMessages[state.sendStatus]}
    </section>
  `;
}

function attachSummaryHandlers() {
  const sendButton = app.querySelector('[data-action="send"]');
  if (sendButton) sendButton.addEventListener('click', sendResults);
  const downloadButton = app.querySelector('[data-action="download"]');
  if (downloadButton) downloadButton.addEventListener('click', downloadResults);
}

function buildPayload() {
  return buildResultsPayload(state.survey, state.scoredTrials, new Date().toISOString());
}

async function sendResults() {
  state.sendStatus = 'sending';
  render();
  try {
    const response = await fetch(GAS_WEBHOOK_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'text/plain;charset=utf-8' },
      body: JSON.stringify(buildPayload())
    });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    state.sendStatus = 'sent';
  } catch (error) {
    console.error('Wysyłka wyników nie powiodła się:', error);
    state.sendStatus = 'error';
  }
  render();
}

function downloadResults() {
  const blob = new Blob([JSON.stringify(buildPayload(), null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `wyniki-testu-odsluchowego-${Date.now()}.json`;
  link.click();
  URL.revokeObjectURL(url);
}

render();
