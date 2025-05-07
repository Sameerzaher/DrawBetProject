// פונקציה אחת לכל עונה לחישוב תוכנית קלי לעונת draw
function computeKelly_2017() {
  const season = 2017;
  const drawSummarySheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(`DrawSummary_${season}`);
  const drawAnalysisSheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(`DrawAnalysis_${season}`);
  if (!drawSummarySheet || !drawAnalysisSheet) {
    Logger.log(`❌ חסר גיליון DrawAnalysis או DrawSummary לעונה ${season}`);
    return;
  }

  const summaryData = drawSummarySheet.getDataRange().getValues();
  const binProbs = {};
  for (let i = 1; i < summaryData.length; i++) {
    const [binName, , , prob] = summaryData[i];
    binProbs[binName] = parseFloat(prob);
  }

  const data = drawAnalysisSheet.getDataRange().getValues();
  const output = [["Season", "MD", "Home", "Away", "isDraw", "posDiff", "Odd_D", "P", "Edge", "Kelly"]];
  const col = {};
  data[0].forEach((h, i) => col[h] = i);

  for (let i = 1; i < data.length; i++) {
    const row = data[i];
    const posDiff = Number(row[col["posDiff"]]);
    const isDraw = row[col["isDraw"]];
    const home = row[col["Home"]];
    const away = row[col["Away"]];
    const md = row[col["Matchday"]];
    const odd_d_raw = row[col["Odd_D"]];
    const odd_d = typeof odd_d_raw === 'string' ? parseFloat(odd_d_raw.replace(',', '.')) : parseFloat(odd_d_raw);

    const binName =
      posDiff <= 3 ? "0–3" :
      posDiff <= 7 ? "4–7" : "8+";

    const p = binProbs[binName];
    const edge = (p && odd_d) ? (p * odd_d - 1) : 0;
    const kelly = (edge > 0 && odd_d > 1) ? ((p * odd_d - 1) / (odd_d - 1)) : 0;

    output.push([season, md, home, away, isDraw, posDiff, odd_d, p, edge, kelly]);
  }

  writeSheet(`KellyPlan_${season}`, output);
  Logger.log(`✅ Kelly Plan נוצר לעונה ${season} (${output.length - 1} שורות)`);
}
