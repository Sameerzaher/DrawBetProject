function qaStandings_2022() {
  const season = 2022;
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const standings = ss.getSheetByName(`Standings ${season}`);
  const matches = ss.getSheetByName(`Raw Matches ${season}`);
  
  if (!standings || !matches) {
    Logger.log(`⚠️ חסר גיליון בעונה ${season}`);
    return;
  }

  const sData = standings.getDataRange().getValues();
  const mData = matches.getDataRange().getValues();

  const sIdx = {
    matchday: sData[0].indexOf("Matchday"),
    team: sData[0].indexOf("Team")
  };

  const mIdx = {
    home: mData[0].indexOf("Home"),
    away: mData[0].indexOf("Away")
  };

  const sRows = sData.slice(1).filter(r => r.join("").trim() !== "");
  const mRows = mData.slice(1).filter(r => r.join("").trim() !== "");

  const sTeams = new Set(sRows.map(r => r[sIdx.team]));
  const mTeams = new Set();
  mRows.forEach(r => {
    mTeams.add(r[mIdx.home]);
    mTeams.add(r[mIdx.away]);
  });

  const missing = [...mTeams].filter(t => !sTeams.has(t));

  const mdCount = {};
  sRows.forEach(r => {
    const md = r[sIdx.matchday];
    mdCount[md] = (mdCount[md] || 0) + 1;
  });

  let out = ss.getSheetByName(`Standings_QA_${season}`);
  if (!out) out = ss.insertSheet(`Standings_QA_${season}`);
  else out.clear();

  let i = 1;
  out.getRange(i++, 1).setValue(`QA לעונה ${season}`);
  out.getRange(i++, 1).setValue(`סה״כ קבוצות: ${sTeams.size}`);
  out.getRange(i++, 1).setValue(`קבוצות חסרות:`);

  if (missing.length === 0) {
    out.getRange(i++, 1).setValue("✔️ אין");
  } else {
    missing.forEach(t => out.getRange(i++, 1).setValue(`❌ ${t}`));
  }

  i++;
  out.getRange(i++, 1).setValue("מחזורים → קבוצות:");
  Object.entries(mdCount).forEach(([md, c]) => {
    out.getRange(i++, 1).setValue(md);
    out.getRange(i - 1, 2).setValue(c);
  });

  Logger.log(`✅ QA הסתיים לעונה ${season}`);
}
