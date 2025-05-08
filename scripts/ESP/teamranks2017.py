import pandas as pd
import os
from collections import defaultdict

SEASON = 2017
INPUT_FILE = os.path.join("..", "..", "data", "raw", "ESP", "matches", f"matches_{SEASON}.csv")
OUTPUT_FILE = os.path.join("..", "..", "data", "raw", "ESP", f"team_ranks_{SEASON}.csv")

def simulate_standings(df):
    points = defaultdict(int)
    all_teams = set(df["Home"]).union(set(df["Away"]))
    standings = []

    df["Matchday"] = df["Matchday"].astype(str).str.extract(r'(\d+)').astype(int)
    df = df[df["FixtureStatus"] == "FT"]
    df = df.sort_values(["Matchday", "Date"])

    for md in sorted(df["Matchday"].unique()):
        matchday_games = df[df["Matchday"] == md]

        for _, game in matchday_games.iterrows():
            home, away = game["Home"], game["Away"]
            gh, ga = game["ScoreHome"], game["ScoreAway"]

            if pd.isna(gh) or pd.isna(ga):
                continue

            if gh > ga:
                points[home] += 3
            elif gh < ga:
                points[away] += 3
            else:
                points[home] += 1
                points[away] += 1

        table = pd.DataFrame([{
            "Season": SEASON,
            "Matchday": md,
            "Team": team,
            "Points": points[team]
        } for team in all_teams])

        table = table.sort_values(["Points", "Team"], ascending=[False, True])
        table["Rank"] = range(1, len(table) + 1)
        standings.append(table)

    return pd.concat(standings, ignore_index=True)

def main():
    if not os.path.exists(INPUT_FILE):
        print(f"❌ File not found: {INPUT_FILE}")
        return

    df = pd.read_csv(INPUT_FILE)
    final_df = simulate_standings(df)
    os.makedirs(os.path.dirname(OUTPUT_FILE), exist_ok=True)
    final_df.to_csv(OUTPUT_FILE, index=False, encoding="utf-8-sig")
    print(f"✅ Saved: {os.path.abspath(OUTPUT_FILE)}")

if __name__ == "__main__":
    main()