function loadSheet(sheetName) {
  const sheet = SpreadsheetApp.getActive().getSheetByName(sheetName);
  if (!sheet) throw new Error("Sheet not found: " + sheetName);
  return sheet.getDataRange().getValues();
}

function writeSheet(sheetName, data) {
  const ss = SpreadsheetApp.getActive();
  let sheet = ss.getSheetByName(sheetName);
  if (!sheet) {
    sheet = ss.insertSheet(sheetName);
  } else {
    sheet.clearContents();
  }
  sheet.getRange(1, 1, data.length, data[0].length).setValues(data);
}
function buildPosMap(standingsData) {
  const header = standingsData[0];
  const seasonIdx = header.indexOf("Season");
  const mdIdx = header.indexOf("Matchday");
  const teamIdx = header.indexOf("Team");
  const rankIdx = header.indexOf("Rank");

  const posMap = {};

  for (let i = 1; i < standingsData.length; i++) {
    const row = standingsData[i];
    const season = row[seasonIdx];
    const md = row[mdIdx];
    const team = row[teamIdx];
    const rank = row[rankIdx];

    if (!posMap[season]) posMap[season] = {};
    if (!posMap[season][md]) posMap[season][md] = {};
    posMap[season][md][team] = rank;
  }

  return posMap;
}
