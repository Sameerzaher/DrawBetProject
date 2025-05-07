// משתנה גלובלי למיפוי מיקומים בליגה האנגלית
var posMapENG = {};

function mergeEngStandingsAll() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const seasons = [2017, 2018, 2019, 2020, 2021, 2022, 2023, 2024];
  const combined = [];
  const posMap = {};

  seasons.forEach(season => {
    const sheet = ss.getSheetByName(`Standings ENG ${season}`);
    if (!sheet) {
      Logger.log(`⚠️ גיליון Standings ENG ${season} חסר`);
      return;
    }

    const data = sheet.getDataRange().getValues();
    const headers = data[0];
    const h = {
      matchday: headers.indexOf("Matchday"),
      team: headers.indexOf("Team"),
      rank: headers.indexOf("Rank")
    };

    if (Object.values(h).includes(-1)) {
      Logger.log(`❌ עמודות חסרות בגיליון Standings ENG ${season}`);
      return;
    }

    const rows = data.slice(1).filter(row => row[h.team] && row[h.matchday]);

    rows.forEach(row => {
      const matchday = row[h.matchday];
      const team = row[h.team];
      const rank = parseInt(row[h.rank], 10);

      if (!posMap[season]) posMap[season] = {};
      if (!posMap[season][matchday]) posMap[season][matchday] = {};
      posMap[season][matchday][team] = rank;

      combined.push([season, matchday, team, rank]);
    });

    Logger.log(`✅ ENG ${season}: נוספו ${rows.length} רשומות`);
  });

  // שמירה למשתנה גלובלי
  posMapENG = posMap;

  // כתיבה לגיליון StandingsAll_ENG
  const outSheet = ss.getSheetByName("StandingsAll_ENG") || ss.insertSheet("StandingsAll_ENG");
  outSheet.clearContents();
  outSheet.getRange(1, 1, 1, 4).setValues([["Season", "Matchday", "Team", "Rank"]]);

  if (combined.length > 0) {
    outSheet.getRange(2, 1, combined.length, 4).setValues(combined);
  }

  Logger.log(`🎯 StandingsAll_ENG נבנה עם ${combined.length} שורות`);

  // QA מחזור ראשון
  seasons.forEach(season => {
    const md1 = posMap[season] && posMap[season][1];
    if (!md1) {
      Logger.log(`⚠️ אין נתוני מחזור 1 לעונה ${season}`);
      return;
    }

    const teams = Object.keys(md1);
    Logger.log(`📊 ENG ${season} מחזור 1: ${teams.length} קבוצות`);
    if (teams.length < 20) {
      Logger.log(`⚠️ קבוצות חסרות בעונה ${season} מחזור 1: ${20 - teams.length}`);
    }
  });
}
