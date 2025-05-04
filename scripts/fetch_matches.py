import requests
import pandas as pd
import os
from time import sleep

API_KEY = '6a993986f93728afa713943ad9db3623'
LA_LIGA_ID = 140
SEASONS = list(range(2017, 2025))
OUTPUT_DIR = os.path.join("..", "data", "raw")

HEADERS = {
    "x-apisports-key": API_KEY
}

def fetch_fixtures_for_season(season):
    print(f"🔍 Fetching season {season}...")

    url = f"https://v3.football.api-sports.io/fixtures"
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
        filename = os.path.join(OUTPUT_DIR, f"matches_{season}.csv")
        df.to_csv(filename, index=False, encoding='utf-8-sig')
        print(f"✅ Saved: {filename}")

    except Exception as e:
        print(f"❌ Exception for season {season}: {e}")

def main():
    os.makedirs(OUTPUT_DIR, exist_ok=True)

    for season in SEASONS:
        fetch_fixtures_for_season(season)
        sleep(1.2)  # Respect API limits

    print("\n🎉 All done!")

if __name__ == "__main__":
    main()
