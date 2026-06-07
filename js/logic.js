export function shuffle(array, rng) {
  const result = array.slice();
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

export function selectTrials(pool, { classes, realPerClass, generatedPerClass }, rng) {
  const selected = [];
  for (const cls of classes) {
    const real = pool.filter((t) => t.class === cls && !t.isGenerated);
    const generated = pool.filter((t) => t.class === cls && t.isGenerated);
    selected.push(...shuffle(real, rng).slice(0, realPerClass));
    selected.push(...shuffle(generated, rng).slice(0, generatedPerClass));
  }
  return shuffle(selected, rng);
}

export function scoreTrial(trial, answer) {
  const correct = (answer === 'generated') === trial.isGenerated;
  return { ...trial, answer, correct };
}

export function isSurveyComplete(survey) {
  return Boolean(
    survey &&
    survey.ageRange &&
    survey.audioExperience &&
    survey.equipment &&
    survey.medicalExperience &&
    typeof survey.medicalExperience.hasExperience === 'boolean'
  );
}

export function buildResultsPayload(survey, scoredTrials, timestamp) {
  return {
    timestamp,
    survey,
    trials: scoredTrials.map((trial, index) => ({
      id: trial.id,
      class: trial.class,
      isGenerated: trial.isGenerated,
      answer: trial.answer,
      correct: trial.correct,
      orderIndex: index
    }))
  };
}
