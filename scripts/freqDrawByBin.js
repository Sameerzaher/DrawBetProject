function freqDrawByBin() {
  const bins = [
    { name: '0–3', min: 0, max: 3 },
    { name: '4–7', min: 4, max: 7 },
    { name: '8+', min: 8, max: 99 }
  ];

  const matches = loadSheet("MatchesAll"); // הנחה שיש utility כזה
  const posMap = buildPosMap(); // מיום 5 – מחזיר mapping של מיקומי קבוצות

  // אתחול מונה לכל bin
  const stats = {};
  bins.forEach(bin => {
    stats[bin.name] = { total: 0, draws: 0 };
  });

  // מעבר על כל משחק
  for (let i = 1; i < matches.length; i++) { // i=1 כדי לדלג על header
    const row = matches[i];
    const [season, matchday, date, home, away, scoreHome, scoreAway, fixtureStatus, isDrawStr] = row;

    if (fixtureStatus !== 'Played') continue;

    const isDraw = isDrawStr === true || isDrawStr === "TRUE"; // התאמה לסוגי ערכים
    const homeRank = posMap?.[season]?.[matchday]?.[home];
    const awayRank = posMap?.[season]?.[matchday]?.[away];

    if (homeRank === undefined || awayRank === undefined) continue;

    const absDiff = Math.abs(homeRank - awayRank);

    // מציאת bin מתאים
    const binObj = bins.find(bin => absDiff >= bin.min && absDiff <= bin.max);
    if (!binObj) continue;

    stats[binObj.name].total++;
    if (isDraw) stats[binObj.name].draws++;
  }

  // הכנת תוצאה לגיליון
  const output = [["Bin", "Total", "Draws", "P_Draw"]];
  bins.forEach(bin => {
    const s = stats[bin.name];
    const p = s.total > 0 ? s.draws / s.total : 0;
    output.push([bin.name, s.total, s.draws, p]);
  });

  writeSheet("ProbBins", output); // utility שמחליף גיליון קיים
  Logger.log("freqDrawByBin completed with %s bins", output.length - 1);
}
