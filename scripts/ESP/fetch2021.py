# fetch_2017.py
import requests
import pandas as pd
import os

# הגדרות בסיס
API_KEY = '6a993986f93728afa713943ad9db3623'
LA_LIGA_ID = 140
SEASON = 2021

# נתיב יעד: data/raw/ESP/matches/
OUTPUT_FOLDER = os.path.join(os.path.dirname(__file__), '..', '..', 'data', 'raw', 'ESP')
OUTPUT_DIR = os.path.join(OUTPUT_FOLDER, 'matches')

# כותרות לקריאה ל-API
HEADERS = {
    "x-apisports-key": API_KEY
}

def fetch_fixtures_for_season(season):
    print(f"🔍 Fetching season {season}...")

    url = "https://v3.football.api-sports.io/fixtures"
    params = {
        "league": LA_LIGA_ID,
        "season": season
    }

    try:
        response = requests.get(url, headers=HEADERS, params=params)

        if response.status_code != 200:
            print(f"❌ Error {response.status_code} for season {season}: {response.text}")
            return

        data = response.json().get("response", [])
        if not data:
            print(f"⚠️ No data for season {season}")
            return

        rows = []
        for match in data:
            fixture = match["fixture"]
            league = match["league"]
            teams = match["teams"]
            goals = match["goals"]

            row = {
                "Season": season,
                "Date": fixture["date"][:10],
                "Matchday": league.get("round", "Unknown"),
                "Home": teams["home"]["name"],
                "Away": teams["away"]["name"],
                "ScoreHome": goals["home"],
                "ScoreAway": goals["away"],
                "FixtureStatus": fixture["status"]["short"]
            }
            rows.append(row)

        df = pd.DataFrame(rows)

        # יצירת תיקייה אם לא קיימת
        os.makedirs(OUTPUT_DIR, exist_ok=True)

        filename = os.path.join(OUTPUT_DIR, f"matches_{season}.csv")
        df.to_csv(filename, index=False, encoding='utf-8-sig')
        print(f"✅ Saved: {os.path.abspath(filename)}")

    except Exception as e:
        print(f"❌ Exception for season {season}: {e}")

def main():
    fetch_fixtures_for_season(SEASON)

if __name__ == "__main__":
    main()
    print("🚀 Script executed successfully.")
