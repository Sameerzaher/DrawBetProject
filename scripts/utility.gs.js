// utility.gs – פונקציות עזר כלליות למערכת DrawBet

function loadSheet(sheetName) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName(sheetName);
  if (!sheet) throw new Error(`❌ גיליון בשם '${sheetName}' לא נמצא.`);
  const data = sheet.getDataRange().getValues();
  return data;
}

function writeSheet(sheetName, values) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getSheetByName(sheetName);
  if (!sheet) sheet = ss.insertSheet(sheetName);
  else sheet.clearContents();
  sheet.getRange(1, 1, values.length, values[0].length).setValues(values);
}

function buildPosMap() {
  const data = loadSheet("StandingsAll");
  const header = data[0];
  const colIndex = {};
  header.forEach((col, i) => colIndex[col] = i);

  const posMap = {};

  for (let i = 1; i < data.length; i++) {
    const row = data[i];
    const season = parseInt(row[colIndex["Season"]]);
    const matchday = parseInt(row[colIndex["Matchday"]]);
    const team = row[colIndex["Team"]]?.toString().trim();
    const rank = parseInt(row[colIndex["Rank"]]);

    // ודא שכל הערכים קיימים
    if (!season || !matchday || !team || !rank) continue;

    if (!posMap[season]) posMap[season] = {};
    if (!posMap[season][matchday]) posMap[season][matchday] = {};

    posMap[season][matchday][team] = rank;
  }

  Logger.log(`✅ buildPosMap הושלם עם ${Object.keys(posMap).length} עונות`);
  return posMap;
}

