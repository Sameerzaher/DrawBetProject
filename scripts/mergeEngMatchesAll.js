function mergeEngMatchesAll() {
  const seasons = [2017, 2018, 2019, 2020, 2021, 2022, 2023, 2024];
  const mergedData = [];

  seasons.forEach(season => {
    const sheetName = `Raw ENG ${season}`;
    const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(sheetName);
    if (!sheet) {
      Logger.log(`⚠️ גיליון ${sheetName} לא נמצא.`);
      return;
    }

    const data = sheet.getDataRange().getValues();
    if (data.length < 2) {
      Logger.log(`⚠️ אין נתונים בעונה ${season}.`);
      return;
    }

    const headers = data[0].map(h => h.toString().toLowerCase());
    const rows = data.slice(1);

    const colIndex = {
      season: headers.indexOf("season"),
      date: headers.indexOf("date"),
      home: headers.indexOf("home"),
      away: headers.indexOf("away"),
      home_goals: headers.indexOf("home_goals"),
      away_goals: headers.indexOf("away_goals"),
      is_draw: headers.indexOf("is_draw")
    };

    if (Object.values(colIndex).some(i => i === -1)) {
      Logger.log(`❌ עמודות חסרות בגיליון ${sheetName}.`);
      return;
    }

    // מיון לפי תאריך
    const sorted = rows.slice().sort((a, b) => new Date(a[colIndex.date]) - new Date(b[colIndex.date]));

    // חלוקה למחזורים (10 משחקים למחזור)
    let matchday = 1;
    for (let i = 0; i < sorted.length; i++) {
      const row = sorted[i];
      const seasonVal = row[colIndex.season];
      const date = row[colIndex.date];
      const home = row[colIndex.home];
      const away = row[colIndex.away];
      const homeGoals = row[colIndex.home_goals];
      const awayGoals = row[colIndex.away_goals];
      const isDraw = row[colIndex.is_draw];

      mergedData.push([
        seasonVal,
        matchday,
        date,
        home,
        away,
        homeGoals,
        awayGoals,
        isDraw
      ]);

      if ((i + 1) % 10 === 0) {
        matchday++; // כל 10 משחקים – מחזור חדש
      }
    }
  });

  const outSheetName = "MatchesAll_ENG";
  const outSheet = getOrCreateSheet(outSheetName);
  outSheet.clearContents();

  const headers = [
    "Season", "Matchday", "Date", "Home", "Away",
    "ScoreHome", "ScoreAway", "isDraw"
  ];
  outSheet.getRange(1, 1, 1, headers.length).setValues([headers]);

  if (mergedData.length > 0) {
    outSheet.getRange(2, 1, mergedData.length, headers.length).setValues(mergedData);
  }

  Logger.log(`✅ מוזגו ${mergedData.length} משחקים עם Matchday לגיליון MatchesAll_ENG.`);
}
