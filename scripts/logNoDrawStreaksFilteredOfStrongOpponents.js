function logNoDrawStreaksFilteredOfStrongOpponents() {
  const leagueSheets = [
    { name: "MatchesAll_ENG", code: "ENG" },
    { name: "MatchesAll_ESP", code: "ESP" }
  ];

  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const strongSheet = ss.getSheetByName("StrongTeams");
  if (!strongSheet) {
    Logger.log("❌ גיליון StrongTeams לא נמצא.");
    return;
  }

  function normalizeName(name) {
    return (name || "").toString().toLowerCase().trim();
  }

  // טוען קבוצות חזקות לפי Season+League
  const strongData = strongSheet.getDataRange().getValues();
  const strongMap = {};
  strongData.slice(1).forEach(row => {
    const [season, league, t1, t2, t3] = row;
    if (!season || !league) return;
    strongMap[season] = strongMap[season] || {};
    strongMap[season][league] = [t1, t2, t3].map(normalizeName).filter(x => x);
  });

  const outSheet = getOrCreateSheet("NoDrawStreaksDetails_Filtered");
  outSheet.clearContents();
  outSheet.appendRow([
    "Season", "League", "Team", "StreakLength",
    "StartDate", "EndDate", "Matches", "FilteredOpponents"
  ]);

  leagueSheets.forEach(league => {
    const sheet = ss.getSheetByName(league.name);
    if (!sheet) {
      Logger.log(`⚠️ גיליון ${league.name} לא נמצא.`);
      return;
    }

    const data = sheet.getDataRange().getValues();
    const header = data[0].map(h => normalizeName(h));
    const rows = data.slice(1);

    const h = {
      season: header.indexOf("season"),
      date: header.indexOf("date"),
      home: header.indexOf("home"),
      away: header.indexOf("away"),
      isDraw: header.indexOf("isdraw")
    };

    const matchesByTeam = {};

    rows.forEach(row => {
      const season = row[h.season];
      const date = row[h.date];
      const home = row[h.home];
      const away = row[h.away];
      const isDraw = row[h.isDraw] === true || row[h.isDraw] === "TRUE";

      if (!season || !date || !home || !away) return;

      if (!matchesByTeam[season]) matchesByTeam[season] = {};
      [home, away].forEach(team => {
        if (!matchesByTeam[season][team]) matchesByTeam[season][team] = [];
      });

      matchesByTeam[season][home].push({ date, vs: "vs " + away, isDraw, opp: away, self: home });
      matchesByTeam[season][away].push({ date, vs: "@ " + home, isDraw, opp: home, self: away });
    });

    for (let season in matchesByTeam) {
      const strongOpps = (strongMap[season] && strongMap[season][league.code]) || [];

      for (let team in matchesByTeam[season]) {
        const games = matchesByTeam[season][team].sort((a, b) => new Date(a.date) - new Date(b.date));

        let currentStreak = [];
        let currentMatches = [];
        let currentStart = null;
        let filteredOpponents = [];

        games.forEach(game => {
          const isDraw = game.isDraw;
          const isStrongOpponent = strongOpps.includes(normalizeName(game.opp));

          if (isDraw) {
            if (currentStreak.length >= 8 && currentStreak.length <= 18) {
              outSheet.appendRow([
                season,
                league.code,
                team,
                currentStreak.length,
                currentStart,
                currentStreak[currentStreak.length - 1].date,
                currentMatches.join(", "),
                [...new Set(filteredOpponents)].join(", ")
              ]);
            }
            currentStreak = [];
            currentMatches = [];
            filteredOpponents = [];
            currentStart = null;
            return;
          }

          if (isStrongOpponent) {
            filteredOpponents.push(game.opp);
            return;
          }

          if (currentStreak.length === 0) currentStart = game.date;
          currentStreak.push(game);
          currentMatches.push(game.vs);
        });

        if (currentStreak.length >= 8 && currentStreak.length <= 18) {
          outSheet.appendRow([
            season,
            league.code,
            team,
            currentStreak.length,
            currentStart,
            currentStreak[currentStreak.length - 1].date,
            currentMatches.join(", "),
            [...new Set(filteredOpponents)].join(", ")
          ]);
        }
      }
    }
  });

  Logger.log("🎯 הרצפים סוננו ונרשמו כולל טור FilteredOpponents.");
}
