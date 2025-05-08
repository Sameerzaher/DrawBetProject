# season_2017.py
import requests
import pandas as pd
import os
from collections import defaultdict

API_KEY = '6a993986f93728afa713943ad9db3623'
LEAGUE_ID = 140
SEASON = 2017

HEADERS = {
    'x-apisports-key': API_KEY
}

OUTPUT_FOLDER = os.path.join(os.path.dirname(__file__), '..', 'data', 'raw')

def fetch_fixtures():
    url = f"https://v3.football.api-sports.io/fixtures?league={LEAGUE_ID}&season={SEASON}"
    res = requests.get(url, headers=HEADERS)
    data = res.json()
    fixtures = data.get('response', [])
    matches = []

    for f in fixtures:
        if f['fixture']['status']['short'] != 'FT':
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

def enrich_team_matches(fixtures_df, team_name):
    df = fixtures_df[(fixtures_df['home'] == team_name) | (fixtures_df['away'] == team_name)].copy()
    df['Home/Away'] = df['home'].apply(lambda x: 'Home' if x == team_name else 'Away')

    def get_result(row):
        if row['score_home'] == row['score_away']:
            return 'Draw'
        elif (row['home'] == team_name and row['score_home'] > row['score_away']) or \
             (row['away'] == team_name and row['score_away'] > row['score_home']):
            return 'Win'
        else:
            return 'Loss'

    df['Result'] = df.apply(get_result, axis=1)
    df['Draw?'] = df['Result'] == 'Draw'
    df['Fixture Status'] = 'סיום'

    df['Goals For'] = df.apply(lambda row: row['score_home'] if row['home'] == team_name else row['score_away'], axis=1)
    df['Goals Against'] = df.apply(lambda row: row['score_away'] if row['home'] == team_name else row['score_home'], axis=1)
    df['Goal Difference'] = df['Goals For'] - df['Goals Against']

    df['Points'] = df['Result'].map({'Win': 3, 'Draw': 1, 'Loss': 0})
    df['Total Points'] = df['Points'].cumsum()
    df['GF_cum'] = df['Goals For'].cumsum()
    df['GA_cum'] = df['Goals Against'].cumsum()
    df['Cumulative GD'] = df['GF_cum'].astype(str) + '-' + df['GA_cum'].astype(str)
    df['Draw Count'] = df['Draw?'].astype(int).cumsum()
    df['Draw % This Season'] = (df['Draw Count'] / (df.index + 1) * 100).round(1)

    no_draw_streak, draw_streak = [], []
    nds = ds = 0
    for draw in df['Draw?']:
        nds = 0 if draw else nds + 1
        ds = ds + 1 if draw else 0
        no_draw_streak.append(nds)
        draw_streak.append(ds)

    df['Non-Draw Streak'] = no_draw_streak
    df['Draw Streak'] = draw_streak

    df = df.rename(columns={'home': 'Home', 'away': 'Opponent', 'date': 'Date', 'matchday': 'Matchday'})
    df['Team ID'] = 0
    df['Team Name'] = team_name
    df['League ID'] = LEAGUE_ID
    df['Season'] = pd.to_datetime(df['Date']).dt.year
    df['Score'] = df['score_home'].astype(str) + ':' + df['score_away'].astype(str)

    return df[[
        'Team ID', 'Team Name', 'League ID', 'Season', 'Matchday', 'Date', 'Opponent',
        'Score', 'Result', 'Draw?', 'Fixture Status', 'Goals For', 'Goals Against',
        'Goal Difference', 'Cumulative GD', 'Draw Streak', 'Non-Draw Streak',
        'Total Points', 'Draw Count', 'Draw % This Season', 'Home/Away']]

def save_csv(df, filename):
    os.makedirs(OUTPUT_FOLDER, exist_ok=True)
    full_path = os.path.join(OUTPUT_FOLDER, filename)
    df.to_csv(full_path, index=False, encoding='utf-8')
    print(f"✅ Saved: {full_path}")

def main():
    print(f"📦 Fetching fixtures for season {SEASON}...")
    fixtures_df = fetch_fixtures()
    if fixtures_df.empty:
        print(f"❌ No fixtures for season {SEASON}")
        return

    teams = set(fixtures_df['home']).union(set(fixtures_df['away']))
    season_data = [enrich_team_matches(fixtures_df, team) for team in teams]
    full_df = pd.concat(season_data)
    save_csv(full_df, f'season_{SEASON}.csv')
    print("🎯 Done!")

if __name__ == '__main__':
    main()