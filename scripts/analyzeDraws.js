function analyzeDraws_2017() {
  const season = 2017;
  const matches = loadSheet("MatchesAll");
  const posMap = buildPosMap();

  const header = matches[0];
  const colIndex = {};
  header.forEach((col, i) => colIndex[col.trim()] = i);

  const output = [["Season", "Matchday", "Home", "Away", "isDraw", "posDiff", "Odd_D"]]; // ✅ נוספה עמודת Odd_D

  for (let i = 1; i < matches.length; i++) {
    const row = matches[i];
    const rowSeason = parseInt(row[colIndex["Season"]]);
    if (rowSeason !== season) continue;

    const matchday = parseInt(row[colIndex["Matchday"]]);
    const home = row[colIndex["Home"]];
    const away = row[colIndex["Away"]];
    const isDrawStr = row[colIndex["isDraw"]];
    const isDraw = (isDrawStr === true || isDrawStr === "TRUE");

    const oddRaw = row[colIndex["Odd_D"]]; // ✅ שולף את הסיכוי לתיקו מה- MatchesAll
    const odd_d = typeof oddRaw === 'string' ? parseFloat(oddRaw.replace(',', '.')) : parseFloat(oddRaw);

    const homeRank = posMap?.[season]?.[matchday]?.[home];
    const awayRank = posMap?.[season]?.[matchday]?.[away];

    if (homeRank === undefined || awayRank === undefined) {
      Logger.log(`❌ חסר Rank: עונה ${season}, MD ${matchday}, ${home} vs ${away}`);
      continue;
    }

    const posDiff = Math.abs(homeRank - awayRank);
    output.push([season, matchday, home, away, isDraw, posDiff, odd_d]); // ✅ נוספה Odd_D
  }

  writeSheet(`DrawAnalysis_${season}`, output);
  Logger.log(`✅ analyzeDraws_${season} הושלם עם ${output.length - 1} שורות`);
}
