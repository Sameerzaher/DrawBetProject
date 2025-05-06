function summarizeDraws_2020() {
  const season = 2020;
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(`DrawAnalysis_${season}`);
  if (!sheet) {
    Logger.log(`❌ גיליון DrawAnalysis_${season} לא נמצא`);
    return;
  }

  const data = sheet.getDataRange().getValues();
  const bins = [
    { name: '0–3', min: 0, max: 3 },
    { name: '4–7', min: 4, max: 7 },
    { name: '8+', min: 8, max: 99 }
  ];
  const stats = {};
  bins.forEach(bin => {
    stats[bin.name] = { total: 0, draws: 0 };
  });

  const header = data[0];
  const col = {};
  header.forEach((h, i) => col[h] = i);

  for (let i = 1; i < data.length; i++) {
    const row = data[i];
    const isDraw = row[col["isDraw"]] === true || row[col["isDraw"]] === "TRUE";
    const posDiff = Number(row[col["posDiff"]]);
    const bin = bins.find(b => posDiff >= b.min && posDiff <= b.max);
    if (bin) {
      stats[bin.name].total++;
      if (isDraw) stats[bin.name].draws++;
    }
  }

  const output = [["Bin", "Total", "Draws", "P_Draw"]];
  bins.forEach(bin => {
    const s = stats[bin.name];
    const p = s.total > 0 ? s.draws / s.total : 0;
    output.push([bin.name, s.total, s.draws, p]);
  });

  writeSheet(`DrawSummary_${season}`, output);
  Logger.log(`✅ סיכום תיקו לעונה ${season} נשמר ב־DrawSummary_${season}`);
}
