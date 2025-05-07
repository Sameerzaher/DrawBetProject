function logStrictNoDrawStreaksDetails() {
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

  // ✅ ניקוי בטוח לשם קבוצה
  function normalizeName(name) {
    return (name || "").toString().toLowerCase().trim();
  }

  // טעינת קבוצות חזקות
  const strongData = strongSheet.getDataRange().getValues();
  const strongMap = {}; // { season: { ENG: [], ESP: [] } }

  strongData.slice(1).forEach(row => {
    const [season, league, t1,, t2,, t3] = row;
    if (!season || !league) return; // דילוג על שורה חסרה
    if (!strongMap[season]) strongMap[season] = {};
    strongMap[season][league] = [t1, t2, t3].map(normalizeName).filter(x => x);
  });

  const outSheet = getOrCreateSheet("NoDrawStreaksDetails_Strict");
  outSheet.clearContents();
  outSheet.appendRow(["Season", "League", "Team", "StreakLength", "StartDate", "EndDate", "Matches"]);

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
      const strongTeams = (strongMap[season] && strongMap[season][league.code]) || [];

      for (let team in matchesByTeam[season]) {
        const games = matchesByTeam[season][team].sort((a, b) => new Date(a.date) - new Date(b.date));
        let streak = [];
        let resultLog = [];
        let startDate = null;

        games.forEach(game => {
          const teamNorm = normalizeName(game.self);
          const oppNorm = normalizeName(game.opp);
          const isStrong = strongTeams.includes(teamNorm) || strongTeams.includes(oppNorm);

          if (game.isDraw || isStrong) {
            if (streak.length >= 8 && streak.length <= 18) {
              outSheet.appendRow([
                season, league.code, team, streak.length,
                startDate, streak[streak.length - 1].date,
                resultLog.join(", ")
              ]);
            }
            streak = [];
            resultLog = [];
            startDate = null;
            return;
          }

          if (streak.length === 0) startDate = game.date;
          streak.push(game);
          resultLog.push(game.vs);
        });

        if (streak.length >= 8 && streak.length <= 18) {
          outSheet.appendRow([
            season, league.code, team, streak.length,
            startDate, streak[streak.length - 1].date,
            resultLog.join(", ")
          ]);
        }
      }
    }
  });

  Logger.log("🎯 סקריפט הרצפים הקפדני הושלם בהצלחה.");
}
