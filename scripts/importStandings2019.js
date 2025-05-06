function importStandings_2019() {
  const season = 2019;
  const url = `https://raw.githubusercontent.com/Sameerzaher/DrawBetProject/main/data/raw/standings_${season}.csv`;
  const sheetName = `Standings ${season}`;
  const ss = SpreadsheetApp.getActiveSpreadsheet();

  try {
    const response = UrlFetchApp.fetch(url);
    const csv = response.getContentText();
    let data = Utilities.parseCsv(csv);
    if (data.length < 2) throw new Error("הקובץ ריק או חסר שדות.");

    const headers = data[0];
    const seasonIdx = headers.indexOf("Season");
    const required = ["Season", "Matchday", "Team", "Rank"];
    const missing = required.filter(h => !headers.includes(h));
    if (missing.length > 0) throw new Error("חסרות עמודות: " + missing.join(", "));

    data = data.filter(row => row.join("").trim() !== "");
    const sample = data[1][seasonIdx];
    if (String(sample) !== String(season)) throw new Error(`הקובץ הוא של עונת ${sample} ולא ${season}`);

    let sheet = ss.getSheetByName(sheetName);
    if (!sheet) sheet = ss.insertSheet(sheetName);
    else sheet.clearContents();

    sheet.getRange(1, 1, data.length, data[0].length).setValues(data);
    Logger.log(`✅ Standings ${season} יובא בהצלחה`);

  } catch (e) {
    Logger.log(`❌ ${season}: ${e.message}`);
  }
}
