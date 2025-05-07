// פונקציה להוספת ערך Odd_D לכל שורה בגיליון MatchesAll על פי נתוני API
function enrichMatchesWithOdds() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName("MatchesAll");
  const data = sheet.getDataRange().getValues();
  const headers = data[0];
  const rows = data.slice(1);

  const h = {
    season: headers.indexOf("Season"),
    matchday: headers.indexOf("Matchday"),
    home: headers.indexOf("Home"),
    away: headers.indexOf("Away"),
  };

  // הוספת עמודת Odd_D אם חסרה
  if (!headers.includes("Odd_D")) {
    sheet.getRange(1, headers.length + 1).setValue("Odd_D");
  }

  const updated = [];

  rows.forEach((row, i) => {
    const season = row[h.season];
    const home = row[h.home];
    const away = row[h.away];
    const md = row[h.matchday];

    // קריאה ל־API (דמה / פיקטיבית כאן)
    const odd_d = fetchOddFromApi(season, home, away, md);
    updated.push([odd_d]);
  });

  // כתיבת הערכים לעמודה האחרונה (Odd_D)
  const col = headers.length + 1;
  sheet.getRange(2, col, updated.length, 1).setValues(updated);
  Logger.log("✅ Odd_D values added to MatchesAll");
}

// פונקציה פיקטיבית שמחזירה ערך Odd להדגמה בלבד
function fetchOddFromApi(season, home, away, md) {
  // כאן אתה אמור לבצע קריאה חיה ל־API (לדוגמה עם UrlFetchApp), בהתאם להרשאות שיש לך
  // כדי לבדוק: לכתוב את ה־season, home, away ולחפש במאגר שלך את הערך האמיתי

  // דוגמה דמה: מחזיר מספר אקראי בין 2.8 ל־4.2
  return (Math.random() * (4.2 - 2.8) + 2.8).toFixed(2);
}
