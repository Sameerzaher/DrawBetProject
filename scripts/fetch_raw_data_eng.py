import requests
import pandas as pd
import time
import os

API_KEY = "6a993986f93728afa713943ad9db3623"  # ← שים כאן את ה-API KEY שלך
LEAGUE_ID = 39  # Premier League (England)
SEASONS = list(range(2017, 2025))

# נתיב תיקיית היעד
save_dir = r"..\data\raw\england"
os.makedirs(save_dir, exist_ok=True)  # יוצרת את התיקייה אם לא קיימת

headers = {
    "x-apisports-key": API_KEY
}

for season in SEASONS:
    print(f"Fetching data for season {season}...")
    url = f"https://v3.football.api-sports.io/fixtures?league={LEAGUE_ID}&season={season}&status=FT"
    
    response = requests.get(url, headers=headers)
    data = response.json()

    if response.status_code != 200 or "response" not in data:
        print(f"Failed to fetch data for season {season}: {data}")
        continue

    season_fixtures = []

    for fixture in data["response"]:
        match = fixture["fixture"]
        teams = fixture["teams"]
        goals = fixture["goals"]

        season_fixtures.append({
            "season": season,
            "date": match["date"],
            "home": teams["home"]["name"],
            "away": teams["away"]["name"],
            "home_goals": goals["home"],
            "away_goals": goals["away"],
            "is_draw": goals["home"] == goals["away"]
        })

    # יצירת DataFrame ושמירה לקובץ CSV בתוך התיקייה הרצויה
    df = pd.DataFrame(season_fixtures)
    filename = os.path.join(save_dir, f"matches_eng_{season}.csv")
    df.to_csv(filename, index=False)
    print(f"✓ Saved {len(df)} matches to {filename}")

    time.sleep(1.2)  # מנוחה כדי לא להיחסם מה-API
