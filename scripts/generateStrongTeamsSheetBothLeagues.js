function generateStrongTeamsByRankOnly() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const outSheet = getOrCreateSheet("StrongTeams");
  outSheet.clearContents();
  outSheet.appendRow(["Season", "League", "Team1", "Team2", "Team3"]);

  const leagues = [
    { code: "ENG", sheetName: "StandingsAll_ENG" },
    { code: "ESP", sheetName: "StandingsAll_ESP" }
  ];
  const seasons = [2018, 2019, 2020, 2021, 2022, 2023, 2024];

  leagues.forEach(league => {
    const sheet = ss.getSheetByName(league.sheetName);
    if (!sheet) {
      Logger.log(`⚠️ גיליון ${league.sheetName} לא נמצא`);
      return;
    }

    const data = sheet.getDataRange().getValues();
    const header = data[0].map(h => h.toString().toLowerCase());
    const rows = data.slice(1);

    const h = {
      season: header.indexOf("season"),
      matchday: header.indexOf("matchday"),
      team: header.indexOf("team"),
      rank: header.indexOf("rank")
    };

    if (Object.values(h).some(i => i === -1)) {
      Logger.log(`❌ עמודות חסרות בגיליון ${league.sheetName}`);
      return;
    }

    seasons.forEach(season => {
      const prevSeason = season - 1;
      const seasonRows = rows.filter(r => r[h.season] === prevSeason);
      if (seasonRows.length === 0) {
        Logger.log(`⚠️ אין נתונים לעונה ${prevSeason} בליגה ${league.code}`);
        return;
      }

      const lastMD = Math.max(...seasonRows.map(r => r[h.matchday]));
      const finalRows = seasonRows.filter(r => r[h.matchday] === lastMD);

      finalRows.sort((a, b) => a[h.rank] - b[h.rank]);

      const top3 = finalRows.slice(0, 3).map(r => r[h.team]);

      outSheet.appendRow([
        season,
        league.code,
        top3[0], top3[1], top3[2]
      ]);

      Logger.log(`✅ ${league.code} ${season}: ${top3.join(", ")}`);
    });
  });
}
