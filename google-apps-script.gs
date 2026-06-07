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

  return ContentService.createTextOutput(JSON.stringify({ status: 'ok' }))
    .setMimeType(ContentService.MimeType.JSON);
}
