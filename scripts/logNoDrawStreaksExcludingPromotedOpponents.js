function logNoDrawStreaksExcludingPromotedOpponents() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();

  const leagueSheets = [
    { name: "MatchesAll_ENG", code: "ENG" },
    { name: "MatchesAll_ESP", code: "ESP" }
  ];
  const promotedSheet = ss.getSheetByName("PromotedTeams_All");
  if (!promotedSheet) {
    Logger.log("❌ גיליון PromotedTeams_All לא נמצא.");
    return;
  }

  function normalizeName(name) {
    return (name || "").toString().toLowerCase().trim();
  }

  // טעינת קבוצות שעלו ליגה
  const promotedMap = {}; // { season: { ENG: Set(), ESP: Set() } }
  promotedSheet.getDataRange().getValues().slice(1).forEach(row => {
    const [season, league, team] = row;
    if (!season || !league || !team) return;
    if (!promotedMap[season]) promotedMap[season] = {};
    if (!promotedMap[season][league]) promotedMap[season][league] = new Set();
    promotedMap[season][league].add(normalizeName(team));
  });

  const outSheet = getOrCreateSheet("NoDrawStreaks_ExcludePromoted");
  outSheet.clearContents();
  outSheet.appendRow(["Season", "League", "Team", "StreakLength", "StartDate", "EndDate", "Matches"]);

  leagueSheets.forEach(league => {
    const sheet = ss.getSheetByName(league.name);
    if (!sheet) {
      Logger.log(`⚠️ גיליון ${league.name} לא נמצא.`);
      return;
    }

    const data = sheet.getDataRange().getValues();
    const header = data[0].map(normalizeName);
    const rows = data.slice(1);

    const h = {
      season: header.indexOf("season"),
      date: header.indexOf("date"),
      home: header.indexOf("home"),
      away: header.indexOf("away"),
      isDraw: header.indexOf("isdraw")
    };

    const matchesByTeam = {}; // { season: { team: [games...] } }

    rows.forEach(row => {
      const season = row[h.season];
      const date = row[h.date];
      const home = row[h.home];
      const away = row[h.away];
      const isDraw = row[h.isDraw] === true || row[h.isDraw] === "TRUE";

      if (!season || !home || !away) return;

      if (!matchesByTeam[season]) matchesByTeam[season] = {};
      [home, away].forEach(t => {
        if (!matchesByTeam[season][t]) matchesByTeam[season][t] = [];
      });

      matchesByTeam[season][home].push({ date, vs: "vs " + away, isDraw, opp: away, self: home });
      matchesByTeam[season][away].push({ date, vs: "@ " + home, isDraw, opp: home, self: away });
    });

    for (let season in matchesByTeam) {
      const promotedSet = (promotedMap[season] && promotedMap[season][league.code]) || new Set();

      for (let team in matchesByTeam[season]) {
        const games = matchesByTeam[season][team].sort((a, b) => new Date(a.date) - new Date(b.date));
        let streak = [];
        let resultLog = [];
        let startDate = null;

        games.forEach(game => {
          const oppNorm = normalizeName(game.opp);

          if (game.isDraw) {
            if (streak.length >= 8 && streak.length <= 18) {
              outSheet.appendRow([
                season, league.code, team, streak.length,
                startDate, streak.at(-1).date, resultLog.join(", ")
              ]);
            }
            streak = [];
            resultLog = [];
            startDate = null;
            return;
          }

          if (promotedSet.has(oppNorm)) return; // לא שובר, רק מדלג

          if (streak.length === 0) startDate = game.date;
          streak.push(game);
          resultLog.push(game.vs);
        });

        if (streak.length >= 8 && streak.length <= 18) {
          outSheet.appendRow([
            season, league.code, team, streak.length,
            startDate, streak.at(-1).date, resultLog.join(", ")
          ]);
        }
      }
    }
  });

  Logger.log("🏁 ניתוח רצפים הסתיים (ללא יריבות מקבוצות שעלו ליגה).");
}
