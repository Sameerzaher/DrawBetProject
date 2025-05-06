function runDrawAnalysisQA() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const report = [["Season", "Matchday", "Home", "Away", "Error Type"]];

  const seasons = [2017, 2018, 2019, 2020, 2021, 2022, 2023, 2024];

  seasons.forEach(season => {
    const sheetName = `DrawAnalysis_${season}`;
    const sheet = ss.getSheetByName(sheetName);
    if (!sheet) {
      Logger.log(`⚠️ גיליון ${sheetName} לא נמצא.`);
      return;
    }

    const data = sheet.getDataRange().getValues();
    const header = data[0];
    const col = {};
    header.forEach((h, i) => col[h] = i);

    for (let i = 1; i < data.length; i++) {
      const row = data[i];
      const matchday = row[col["Matchday"]];
      const home = row[col["Home"]];
      const away = row[col["Away"]];
      const isDraw = row[col["isDraw"]];
      const posDiff = row[col["posDiff"]];

      if (!matchday || !home || !away) {
        report.push([season, matchday, home, away, "⚠️ שדות ריקים"]);
      }
      if (typeof posDiff !== "number" || isNaN(posDiff)) {
        report.push([season, matchday, home, away, "❌ posDiff לא חוקי"]);
      }
      if (isDraw !== true && isDraw !== false && isDraw !== "TRUE" && isDraw !== "FALSE") {
        report.push([season, matchday, home, away, "❌ isDraw לא תקין"]);
      }
    }

    Logger.log(`🔍 QA לעונה ${season} הושלם. נמצאו ${report.length - 1} חריגות.`);
  });

  writeSheet("Data_QA_Report", report);
  Logger.log("📄 דוח QA עודכן ב־Data_QA_Report");
}
