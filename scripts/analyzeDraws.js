function analyzeDraws_2017() {
  const season = 2017;
  const matches = loadSheet("MatchesAll");
  const posMap = buildPosMap();

  const header = matches[0];
  const colIndex = {};
  header.forEach((col, i) => colIndex[col] = i);

  const output = [["Season", "Matchday", "Home", "Away", "isDraw", "posDiff", "Odd_D"]];

  for (let i = 1; i < matches.length; i++) {
    const row = matches[i];
    const rowSeason = parseInt(row[colIndex["Season"]]);
    if (rowSeason !== season) continue;

    // ✔ תיקון: חילוץ מספר מחזור מתוך טקסט כמו "Regular Season - 1"
    const matchdayRaw = row[colIndex["Matchday"]];
    const matchdayMatch = matchdayRaw?.toString().match(/\d+/);
    const matchday = matchdayMatch ? parseInt(matchdayMatch[0]) : NaN;
    if (isNaN(matchday)) {
      Logger.log(`⚠️ מחזור לא מזוהה בשורה ${i + 1}: ${matchdayRaw}`);
      continue;
    }

    const home = row[colIndex["Home"]];
    const away = row[colIndex["Away"]];
    const isDrawStr = row[colIndex["isDraw"]];
    const isDraw = (isDrawStr === true || isDrawStr === "TRUE");

    const odd_d_raw = row[colIndex["Odd_D"]];
    const odd_d = typeof odd_d_raw === 'string' ? parseFloat(odd_d_raw.replace(',', '.')) : odd_d_raw;

    const homeRank = posMap?.[season]?.[matchday]?.[home];
    const awayRank = posMap?.[season]?.[matchday]?.[away];

    if (homeRank === undefined || awayRank === undefined) {
      Logger.log(`❌ חסר Rank: עונה ${season}, MD ${matchday}, ${home} vs ${away}`);
      continue;
    }

    const posDiff = Math.abs(homeRank - awayRank);
    output.push([season, matchday, home, away, isDraw, posDiff, odd_d]);
  }

  writeSheet(`DrawAnalysis_${season}`, output);
  Logger.log(`✅ analyzeDraws_${season} הושלם עם ${output.length - 1} שורות`);
}
