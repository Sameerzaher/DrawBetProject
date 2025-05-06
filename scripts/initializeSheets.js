function initializeSheets() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const seasons = [2017, 2018, 2019, 2020, 2021, 2022, 2023, 2024];

  seasons.forEach(season => {
    const rawName = `Raw Matches ${season}`;
    const standingsName = `Standings ${season}`;
    createIfNotExists(ss, rawName);
    createIfNotExists(ss, standingsName);
  });

  Logger.log("✅ כל הגליונות נוצרו (אם לא היו קיימים)");
}

function createIfNotExists(ss, name) {
  if (!ss.getSheetByName(name)) {
    ss.insertSheet(name);
    Logger.log(`📄 נוצר: ${name}`);
  } else {
    Logger.log(`ℹ️ כבר קיים: ${name}`);
  }
}
