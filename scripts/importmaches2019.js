function importMatches2019() {
  const season = 2019;
  const fileUrl = `https://raw.githubusercontent.com/Sameerzaher/DrawBetProject/main/data/raw/matches_${season}.csv`;
  const sheetName = `Raw Matches ${season}`;

  try {
    const response = UrlFetchApp.fetch(fileUrl);
    const csvData = response.getContentText();
    const parsed = Utilities.parseCsv(csvData);

    if (parsed.length === 0 || parsed[0].length === 0) {
      Logger.log(`⚠️ הקובץ matches_${season}.csv ריק או לא תקין.`);
      return;
    }

    const sheet = getOrCreateSheet(sheetName);
    sheet.clearContents();
    sheet.getRange(1, 1, parsed.length, parsed[0].length).setValues(parsed);

    Logger.log(`✅ ${parsed.length} שורות יובאו בהצלחה לעונה ${season}.`);
  } catch (e) {
    Logger.log(`❌ שגיאה בעונה ${season}: ${e.message}`);
  }
}

function getOrCreateSheet(name) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getSheetByName(name);
  if (sheet) {
    sheet.clearContents();
  } else {
    sheet = ss.insertSheet(name);
  }
  return sheet;
}
