import requests
import pandas as pd
import os
from collections import defaultdict

API_KEY = '6a993986f93728afa713943ad9db3623'  # ← שים כאן את המפתח שלך
LEAGUE_ID = 140  # La Liga
SEASONS = list(range(2017, 2025))

HEADERS = {
    'x-apisports-key': API_KEY
}

OUTPUT_FOLDER = os.path.join(os.path.dirname(__file__), '..', 'data', 'raw')

def fetch_fixtures(season):
    url = f"https://v3.football.api-sports.io/fixtures?league={LEAGUE_ID}&season={season}"
    res = requests.get(url, headers=HEADERS)
    data = res.json()
    fixtures = data.get('response', [])
    matches = []

    for f in fixtures:
        if f['fixture']['status']['short'] != 'FT':  # רק משחקים שהסתיימו
            continue
        matches.append({
            'matchday': f['league']['round'].replace('Regular Season - ', ''),
            'date': f['fixture']['date'],
            'home': f['teams']['home']['name'],
            'away': f['teams']['away']['name'],
            'score_home': f['goals']['home'],
            'score_away': f['goals']['away']
        })

    df = pd.DataFrame(matches)
    df['matchday'] = df['matchday'].astype(int)
    df = df.sort_values(['matchday', 'date'])
    return df

def simulate_standings(fixtures_df, season):
    points = defaultdict(int)
    results = []

    all_teams = set(fixtures_df['home']).union(set(fixtures_df['away']))

    for md in sorted(fixtures_df['matchday'].unique()):
        md_games = fixtures_df[fixtures_df['matchday'] == md]

        # עדכון ניקוד
        for _, game in md_games.iterrows():
            home, away = game['home'], game['away']
            gh, ga = game['score_home'], game['score_away']

            if gh > ga:
                points[home] += 3
            elif gh < ga:
                points[away] += 3
            else:
                points[home] += 1
                points[away] += 1

        # בניית טבלה למחזור
        table = pd.DataFrame([{
            'Matchday': md,
            'Team': team,
            'Points': points[team]
        } for team in all_teams])

        table = table.sort_values(['Points', 'Team'], ascending=[False, True])
        table['Rank'] = range(1, len(table) + 1)
        results.append(table[['Matchday', 'Team', 'Rank']])

    full_table = pd.concat(results)
    full_table['Season'] = season
    return full_table[['Season', 'Matchday', 'Team', 'Rank']]

def save_csv(df, filename):
    os.makedirs(OUTPUT_FOLDER, exist_ok=True)
    full_path = os.path.join(OUTPUT_FOLDER, filename)
    df.to_csv(full_path, index=False, encoding='utf-8')
    print(f"✅ Saved: {full_path}")

def main():
    for season in SEASONS:
        print(f"📦 Fetching fixtures for {season}...")
        fixtures_df = fetch_fixtures(season)
        if fixtures_df.empty:
            print(f"❌ No fixtures for {season}")
            continue
        standings_df = simulate_standings(fixtures_df, season)
        save_csv(standings_df, f'standings_{season}.csv')
    print("🎯 Done building standings for all seasons.")

if __name__ == '__main__':
    main()
