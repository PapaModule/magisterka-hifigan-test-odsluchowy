var NOTIFICATION_EMAIL = 'n.dawid@me.com';

function doPost(e) {
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('Wyniki')
    || SpreadsheetApp.getActiveSpreadsheet().insertSheet('Wyniki');
  var payload = JSON.parse(e.postData.contents);

  if (sheet.getLastRow() === 0) {
    sheet.appendRow([
      'timestamp', 'ageRange', 'audioExperience', 'equipment',
      'medicalHasExperience', 'medicalDetails',
      'trialId', 'trialClass', 'isGenerated', 'answer', 'correct', 'orderIndex'
    ]);
  }

  payload.trials.forEach(function (trial) {
    sheet.appendRow([
      payload.timestamp,
      payload.survey.ageRange,
      payload.survey.audioExperience,
      payload.survey.equipment,
      payload.survey.medicalExperience.hasExperience,
      payload.survey.medicalExperience.details,
      trial.id,
      trial.class,
      trial.isGenerated,
      trial.answer,
      trial.correct,
      trial.orderIndex
    ]);
  });

  sendResultNotification(payload);

  return ContentService.createTextOutput(JSON.stringify({ status: 'ok' }))
    .setMimeType(ContentService.MimeType.JSON);
}

function sendResultNotification(payload) {
  var total = payload.trials.length;
  var correct = payload.trials.filter(function (trial) { return trial.correct; }).length;
  var percentage = total === 0 ? 0 : Math.round((correct / total) * 100);

  var byClass = {};
  payload.trials.forEach(function (trial) {
    if (!byClass[trial.class]) byClass[trial.class] = { correct: 0, total: 0 };
    byClass[trial.class].total += 1;
    if (trial.correct) byClass[trial.class].correct += 1;
  });

  var classLines = Object.keys(byClass).map(function (cls) {
    var stats = byClass[cls];
    return '  - ' + cls + ': ' + stats.correct + '/' + stats.total;
  }).join('\n');

  var survey = payload.survey;
  var medicalLine = '  - Doświadczenie medyczne: ' + (survey.medicalExperience.hasExperience ? 'tak' : 'nie');
  if (survey.medicalExperience.details) {
    medicalLine += ' (' + survey.medicalExperience.details + ')';
  }

  var body = [
    'Ktoś ukończył test odsłuchowy.',
    '',
    'Czas: ' + payload.timestamp,
    'Wynik: ' + correct + '/' + total + ' (' + percentage + '%)',
    'Wynik per klasa:',
    classLines,
    '',
    'Ankieta:',
    '  - Wiek: ' + survey.ageRange,
    '  - Doświadczenie ze słuchem: ' + survey.audioExperience,
    '  - Sprzęt: ' + survey.equipment,
    medicalLine
  ].join('\n');

  MailApp.sendEmail(
    NOTIFICATION_EMAIL,
    'Nowy wynik testu odsłuchowego: ' + correct + '/' + total + ' (' + percentage + '%)',
    body
  );
}
