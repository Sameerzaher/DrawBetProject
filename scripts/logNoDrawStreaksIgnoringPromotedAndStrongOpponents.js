// גרסה סופית: מוחקת רצפים שבהם קבוצת המקור (Team) היא קבוצה חזקה או עולה חדשה
function logNoDrawStreaksStrictExcludeStrongAndPromotedTeams() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();

  const leagueSheets = [
    { name: "MatchesAll_ENG", code: "ENG" },
    { name: "MatchesAll_ESP", code: "ESP" }
  ];

  const strongSheet = ss.getSheetByName("StrongTeams");
  const promotedSheet = ss.getSheetByName("PromotedTeams_All");
  if (!strongSheet || !promotedSheet) {
    Logger.log("❌ StrongTeams או PromotedTeams_All חסרים.");
    return;
  }

  function normalizeName(name) {
    const map = {
      "man city": "manchester city",
      "man united": "manchester united",
      "man utd": "manchester united",
      "athletico madrid": "atletico madrid",
      "r. madrid": "real madrid",
      "barca": "barcelona",
      "psg": "paris saint-germain"
      // ניתן להוסיף עוד שמות נפוצים לפי הצורך
    };

    const clean = (name || '')
      .toString()
      .toLowerCase()
      .replace(/\bfc\b/g, '')
      .replace(/[\u200B-\u200D\uFEFF]/g, '')
      .replace(/[^\w\s]/g, '')
      .replace(/\s+/g, ' ')
      .trim();

    return map[clean] || clean;
  }

  const strongMap = {};
  strongSheet.getDataRange().getValues().slice(1).forEach(row => {
    const [season, league, t1,, t2,, t3] = row;
    if (!season || !league) return;
    if (!strongMap[season]) strongMap[season] = {};
    strongMap[season][league] = [t1, t2, t3].map(normalizeName).filter(x => x);
  });

  const promotedMap = {};
  promotedSheet.getDataRange().getValues().slice(1).forEach(row => {
    const [season, league, team] = row;
    if (!season || !league || !team) return;
    if (!promotedMap[season]) promotedMap[season] = {};
    if (!promotedMap[season][league]) promotedMap[season][league] = new Set();
    promotedMap[season][league].add(normalizeName(team));
  });

  const outSheet = getOrCreateSheet("NoDrawStreaks_Strict_Filtered");
  outSheet.clearContents();
  outSheet.appendRow(["Season", "League", "Team", "StreakLength", "StartDate", "EndDate", "Matches", "BlockedTeams"]);

  let currentRow = 2;

  leagueSheets.forEach(league => {
    const sheet = ss.getSheetByName(league.name);
    if (!sheet) return;

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

    const matchesByTeam = {};
    rows.forEach(row => {
      const season = row[h.season];
      const date = row[h.date];
      const home = row[h.home];
      const away = row[h.away];
      const isDraw = row[h.isDraw] === true || row[h.isDraw] === "TRUE";
      if (!season || !home || !away) return;

      if (!matchesByTeam[season]) matchesByTeam[season] = {};
      [home, away].forEach(team => {
        if (!matchesByTeam[season][team]) matchesByTeam[season][team] = [];
      });

      matchesByTeam[season][home].push({ date, vs: "vs " + away, isDraw, opp: away, self: home });
      matchesByTeam[season][away].push({ date, vs: "@ " + home, isDraw, opp: home, self: away });
    });

    for (let season in matchesByTeam) {
      const strong = (strongMap[season] && strongMap[season][league.code]) || [];
      const promoted = (promotedMap[season] && promotedMap[season][league.code]) || new Set();

      for (let team in matchesByTeam[season]) {
        const teamNorm = normalizeName(team);
        if (strong.includes(teamNorm) || promoted.has(teamNorm)) {
          Logger.log(`❌ דילוג על קבוצה חזקה או עולה: ${team} (${season} ${league.code})`);
          continue;
        }

        const games = matchesByTeam[season][team].sort((a, b) => new Date(a.date) - new Date(b.date));
        let streak = [];
        let resultLog = [];
        let blocked = [];
        let startDate = null;

        games.forEach(game => {
          const oppNorm = normalizeName(game.opp);
          const isOpponentStrong = strong.includes(oppNorm);
          const isOpponentPromoted = promoted.has(oppNorm);

          if (game.isDraw) {
            if (streak.length >= 8 && streak.length <= 18) {
              outSheet.appendRow([
                season, league.code, team, streak.length,
                startDate, streak.at(-1).date,
                resultLog.join(", "), blocked.join(", ")
              ]);
              currentRow++;
            }
            streak = [];
            resultLog = [];
            blocked = [];
            startDate = null;
            return;
          }

          if (isOpponentStrong || isOpponentPromoted) {
            blocked.push(game.vs);
            return;
          }

          if (streak.length === 0) startDate = game.date;
          streak.push(game);
          resultLog.push(game.vs);
        });

        if (streak.length >= 8 && streak.length <= 18) {
          outSheet.appendRow([
            season, league.code, team, streak.length,
            startDate, streak.at(-1).date,
            resultLog.join(", "), blocked.join(", ")
          ]);
          currentRow++;
        }
      }
    }
  });

  Logger.log("✅ סינון מוחלט לפי קבוצות חזקות או עולות בוצע בהצלחה.");
}
