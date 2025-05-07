function importStandingsEngAll() {
  const seasons = [2017, 2018, 2019, 2020, 2021, 2022, 2023, 2024];

  seasons.forEach(season => {
    importStandingsEngSeason(season);
  });
}

function importStandingsEngSeason(season) {
  const fileUrl = `https://raw.githubusercontent.com/Sameerzaher/DrawBetProject/main/data/processed/england/standings_by_season/standings_eng_${season}.csv`;
  const sheetName = `Standings ENG ${season}`;

  try {
    const response = UrlFetchApp.fetch(fileUrl);
    const csv = response.getContentText();
    const data = Utilities.parseCsv(csv);

    if (data.length === 0 || data[0].length === 0) {
      Logger.log(`⚠️ קובץ ריק או לא תקין לעונה ${season}.`);
      return;
    }

    const sheet = getOrCreateSheet(sheetName);
    sheet.clearContents();
    sheet.getRange(1, 1, data.length, data[0].length).setValues(data);
    Logger.log(`✅ standings_eng_${season}.csv יובא בהצלחה.`);
  } catch (e) {
    Logger.log(`❌ שגיאה בייבוא לעונה ${season}: ${e.message}`);
  }
}

function getOrCreateSheet(name) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getSheetByName(name);
  if (!sheet) sheet = ss.insertSheet(name);
  return sheet;
}
