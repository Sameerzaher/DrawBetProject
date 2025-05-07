function summarizeNoDrawStreaksBothLeagues() {
  const leagueSheets = [
    { name: "MatchesAll_ENG", code: "ENG" },
    { name: "MatchesAll_ESP", code: "ESP" }
  ];

  const summaryData = [];

  leagueSheets.forEach(league => {
    const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(league.name);
    if (!sheet) {
      Logger.log(`⚠️ גיליון ${league.name} לא נמצא.`);
      return;
    }

    const data = sheet.getDataRange().getValues();
    const header = data[0].map(h => h.toString().toLowerCase());
    const rows = data.slice(1);

    const colIndex = {
      season: header.indexOf("season"),
      date: header.indexOf("date"),
      isDraw: header.indexOf("isdraw")
    };

    if (Object.values(colIndex).some(i => i === -1)) {
      Logger.log(`❌ עמודות חסרות בגיליון ${league.name}.`);
      return;
    }

    // מיון לפי תאריך
    rows.sort((a, b) => new Date(a[colIndex.date]) - new Date(b[colIndex.date]));

    let currentSeason = null;
    let streakLength = 0;
    const streakCounter = {}; // { season: { 6: 3, 7: 1, ... } }

    rows.forEach(row => {
      const season = row[colIndex.season];
      const isDraw = row[colIndex.isDraw] === true || row[colIndex.isDraw] === "TRUE";

      if (season !== currentSeason) {
        currentSeason = season;
        streakLength = 0;
      }

      if (!isDraw) {
        streakLength++;
      } else {
        if (streakLength >= 6 && streakLength <= 18) {
          if (!streakCounter[currentSeason]) streakCounter[currentSeason] = {};
          streakCounter[currentSeason][streakLength] = (streakCounter[currentSeason][streakLength] || 0) + 1;
        }
        streakLength = 0;
      }
    });

    // הוספה לטבלת הסיכום
    for (let season in streakCounter) {
      for (let length in streakCounter[season]) {
        summaryData.push([
          season,
          league.code,
          parseInt(length),
          streakCounter[season][length]
        ]);
      }
    }
  });

  // כתיבה לגיליון
  const outSheet = getOrCreateSheet("NoDrawStreakSummary");
  outSheet.clearContents();
  outSheet.appendRow(["Season", "League", "StreakLength", "Count"]);

  if (summaryData.length > 0) {
    outSheet.getRange(2, 1, summaryData.length, 4).setValues(summaryData);
  }

  Logger.log(`✅ טבלת סיכום נוצרה עבור ENG ו-ESP.`);
}
