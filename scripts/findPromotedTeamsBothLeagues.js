function findPromotedTeamsBothLeagues() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const leagues = [
    { sheet: "StandingsAll_ENG", code: "ENG" },
    { sheet: "StandingsAll_ESP", code: "ESP" }
  ];

  const output = [["Season", "League", "Promoted Team"]];

  leagues.forEach(league => {
    const sheet = ss.getSheetByName(league.sheet);
    if (!sheet) {
      Logger.log(`❌ גיליון ${league.sheet} לא נמצא.`);
      return;
    }

    const data = sheet.getDataRange().getValues();
    const headers = data[0];
    const rows = data.slice(1);

    const h = {
      season: headers.indexOf("Season"),
      matchday: headers.indexOf("Matchday"),
      team: headers.indexOf("Team")
    };

    const seasonTeams = {}; // season → Set(teams)

    rows.forEach(row => {
      const season = row[h.season];
      const matchday = row[h.matchday];
      const team = row[h.team];
      if (matchday === 1 && team) {
        if (!seasonTeams[season]) seasonTeams[season] = new Set();
        seasonTeams[season].add(team.toString().trim());
      }
    });

    const seasons = Object.keys(seasonTeams).map(Number).sort();

    for (let i = 1; i < seasons.length; i++) {
      const prev = seasonTeams[seasons[i - 1]];
      const curr = seasonTeams[seasons[i]];

      const promoted = [...curr].filter(team => !prev.has(team));
      promoted.forEach(team => {
        output.push([seasons[i], league.code, team]);
      });
    }
  });

  const outSheet = getOrCreateSheet("PromotedTeams_All");
  outSheet.clearContents();
  outSheet.getRange(1, 1, output.length, 3).setValues(output);

  Logger.log("🎯 העולות החדשות לשתי הליגות נרשמו בהצלחה.");
}
