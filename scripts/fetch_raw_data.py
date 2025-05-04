import requests
import pandas as pd
import os

API_KEY = '6a993986f93728afa713943ad9db3623'  # ← שים כאן את המפתח שלך
LEAGUE_ID = 140
SEASONS = list(range(2017, 2025))

# נתיב לתיקייה data/raw – יחסי לסקריפט עצמו
OUTPUT_FOLDER = os.path.join(os.path.dirname(__file__), '..', 'data', 'raw')

HEADERS = {
    'x-apisports-key': API_KEY
}

def fetch_standings(season):
    url = f"https://v3.football.api-sports.io/standings?league={LEAGUE_ID}&season={season}"
    res = requests.get(url, headers=HEADERS)
    data = res.json()
    try:
        table = data['response'][0]['league']['standings'][0]
        return pd.DataFrame([{
            'Rank': row['rank'],
            'Team': row['team']['name'],
            'Points': row['points'],
            'Season': season
        } for row in table])
    except Exception as e:
        print(f"❌ Failed to fetch season {season}: {e}")
        return pd.DataFrame()

def save_csv(df, filename):
    os.makedirs(OUTPUT_FOLDER, exist_ok=True)
    full_path = os.path.join(OUTPUT_FOLDER, filename)
    df.to_csv(full_path, index=False, encoding='utf-8')
    print(f"✅ Saved: {full_path}")

def main():
    for season in SEASONS:
        df = fetch_standings(season)
        if not df.empty:
            save_csv(df, f'standings_{season}.csv')
    print("🎯 Done fetching all seasons.")

if __name__ == '__main__':
    main()

