function runQAonMatchesAll() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName("MatchesAll");
  if (!sheet) {
    Logger.log("❌ גיליון MatchesAll לא נמצא.");
    return;
  }

  const data = sheet.getDataRange().getValues();
  const headers = data[0];
  const rows = data.slice(1);

  const h = {
    season: headers.indexOf("Season"),
    matchday: headers.indexOf("Matchday"),
    date: headers.indexOf("Date"),
    home: headers.indexOf("Home"),
    away: headers.indexOf("Away"),
    scoreHome: headers.indexOf("ScoreHome"),
    scoreAway: headers.indexOf("ScoreAway"),
    isDraw: headers.indexOf("isDraw")
  };

  const issues = [];

  // בדיקה: תאריכים חסרים
  rows.forEach(row => {
    if (!row[h.date]) {
      issues.push(["Missing Date", "חסר תאריך משחק", row[h.season], row[h.matchday], row[h.home], row[h.away]]);
    }
  });

  // בדיקה: isDraw ≠ תוצאה בפועל
  rows.forEach(row => {
    const sH = parseInt(row[h.scoreHome], 10);
    const sA = parseInt(row[h.scoreAway], 10);
    const isDraw = row[h.isDraw] === true || row[h.isDraw] === "TRUE";

    if (!isNaN(sH) && !isNaN(sA) && (sH === sA && !isDraw)) {
      issues.push(["Bad isDraw", "התוצאה תיקו אבל isDraw=FALSE", row[h.season], row[h.matchday], row[h.home], row[h.away]]);
    }
    if (!isNaN(sH) && !isNaN(sA) && (sH !== sA && isDraw)) {
      issues.push(["Bad isDraw", "isDraw=TRUE אבל התוצאה לא תיקו", row[h.season], row[h.matchday], row[h.home], row[h.away]]);
    }
  });

  // בדיקה: מחזורים חסרים (גאפ)
  const matchdaysBySeason = {};
  rows.forEach(row => {
    const season = row[h.season];
    const md = parseInt(row[h.matchday], 10);
    if (!matchdaysBySeason[season]) matchdaysBySeason[season] = new Set();
    if (!isNaN(md)) matchdaysBySeason[season].add(md);
  });

  Object.entries(matchdaysBySeason).forEach(([season, mdSet]) => {
    const matchdays = [...mdSet].sort((a, b) => a - b);
    for (let i = 1; i < matchdays.length; i++) {
      const expected = matchdays[i - 1] + 1;
      if (matchdays[i] !== expected) {
        issues.push(["Gap in MD", `חסר Matchday ${expected}`, parseInt(season), "", "", ""]);
      }
    }
  });

  // בדיקה: כפילויות משחקים באותו מחזור
  const fixtureSet = new Set();
  rows.forEach(row => {
    const key = `${row[h.season]}|${row[h.matchday]}|${row[h.home]}|${row[h.away]}`;
    if (fixtureSet.has(key)) {
      issues.push(["Double Fixture", "משחק כפול בין אותן קבוצות באותו מחזור", row[h.season], row[h.matchday], row[h.home], row[h.away]]);
    } else {
      fixtureSet.add(key);
    }
  });

  // כתיבת התוצאות לגיליון Data_QA_Report
  const qaSheet = ss.getSheetByName("Data_QA_Report") || ss.insertSheet("Data_QA_Report");
  qaSheet.clearContents();
  const header = ["Type", "Description", "Season", "Matchday", "Home", "Away"];
  qaSheet.getRange(1, 1, 1, header.length).setValues([header]);

  if (issues.length > 0) {
    qaSheet.getRange(2, 1, issues.length, header.length).setValues(issues);
    Logger.log(`🔍 נמצאו ${issues.length} בעיות – נרשמו ל־Data_QA_Report`);
  } else {
    Logger.log("✅ אין בעיות ב־MatchesAll לפי הבדיקות הנוכחיות.");
  }
}
