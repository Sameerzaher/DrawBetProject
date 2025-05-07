function mergeMatchesAll() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const seasons = [2017, 2018, 2019, 2020, 2021, 2022, 2023, 2024];
  const combined = [];
  let headers;

  seasons.forEach(season => {
    const sheet = ss.getSheetByName(`Raw Matches ${season}`);
    if (!sheet) {
      Logger.log(`⚠️ גיליון חסר: Raw Matches ${season}`);
      return;
    }

    const data = sheet.getDataRange().getValues();
    if (!headers) headers = data[0];

    const h = {
      matchday: headers.indexOf("Matchday"),
      date: headers.indexOf("Date"),
      home: headers.indexOf("Home"),
      away: headers.indexOf("Away"),
      scoreHome: headers.indexOf("ScoreHome"),
      scoreAway: headers.indexOf("ScoreAway"),
      status: headers.indexOf("FixtureStatus")
    };

    if (Object.values(h).includes(-1)) {
      Logger.log(`❌ בעיה בכותרות בעונה ${season} – חסרות עמודות נדרשות`);
      return;
    }

    const rows = data.slice(1).filter(row => row[h.status] === "FT");

    let added = 0;

    rows.forEach(row => {
      const scoreHome = parseInt(row[h.scoreHome], 10);
      const scoreAway = parseInt(row[h.scoreAway], 10);

      if (isNaN(scoreHome) || isNaN(scoreAway)) {
        Logger.log(`⚠️ תוצאה חסרה או לא תקינה בעונה ${season}: ${row[h.home]} - ${row[h.away]}`);
        return;
      }

      combined.push([
        season,
        row[h.matchday],
        row[h.date],
        row[h.home],
        row[h.away],
        scoreHome,
        scoreAway,
        row[h.status],
        scoreHome === scoreAway
      ]);

      added++;
    });

    Logger.log(`✅ ${season}: נוספו ${added} משחקים`);
  });

  // כתיבה לגיליון MatchesAll
  const outSheet = ss.getSheetByName("MatchesAll") || ss.insertSheet("MatchesAll");
  outSheet.clearContents();

  const finalHeaders = [
    "Season", "Matchday", "Date", "Home", "Away",
    "ScoreHome", "ScoreAway", "FixtureStatus", "isDraw"
  ];

  outSheet.getRange(1, 1, 1, finalHeaders.length).setValues([finalHeaders]);

  if (combined.length > 0) {
    outSheet.getRange(2, 1, combined.length, finalHeaders.length).setValues(combined);
  }

  Logger.log(`🎯 MatchesAll נוצר עם ${combined.length} שורות`);
}
  }

  Logger.log(`🎯 MatchesAll נוצר עם ${combined.length} שורות`);
}
