function importEngMatchesAll() {
  const seasons = [2017, 2018, 2019, 2020, 2021, 2022, 2023, 2024];
  seasons.forEach(importEngSeason);
}

function importEngSeason(season) {
  const fileUrl = `https://raw.githubusercontent.com/Sameerzaher/DrawBetProject/main/data/raw/england/matches_eng_${season}.csv`;
  const sheetName = `Raw ENG ${season}`;

  try {
    const response = UrlFetchApp.fetch(fileUrl);
    const csvData = response.getContentText();
    const parsed = Utilities.parseCsv(csvData);

    if (parsed.length === 0 || parsed[0].length === 0) {
      Logger.log(`⚠️ הקובץ matches_eng_${season}.csv ריק או לא תקין.`);
      return;
    }

    const sheet = getOrCreateSheet(sheetName);
    sheet.clearContents();
    sheet.getRange(1, 1, parsed.length, parsed[0].length).setValues(parsed);

    Logger.log(`✅ ${parsed.length} שורות יובאו בהצלחה לעונת ENG ${season}.`);
  } catch (e) {
    Logger.log(`❌ שגיאה בעונת ENG ${season}: ${e.message}`);
  }
}
