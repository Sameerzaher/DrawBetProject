import pandas as pd
import os

# מיקום הקבצים
input_dir = r"C:\Users\samee\Documents\Developmet\DrawBetProject\data\raw\england"
output_dir = r"C:\Users\samee\Documents\Developmet\DrawBetProject\data\processed\england\standings_by_season"
os.makedirs(output_dir, exist_ok=True)

seasons = list(range(2017, 2025))

for season in seasons:
    input_file = os.path.join(input_dir, f"matches_eng_{season}.csv")
    if not os.path.exists(input_file):
        print(f"⚠️ קובץ לא נמצא: {input_file}")
        continue

    df = pd.read_csv(input_file)
    df['date'] = pd.to_datetime(df['date'])
    df = df.sort_values('date')

    teams = pd.unique(df[['home', 'away']].values.ravel())
    table = {team: {"PTS": 0, "GF": 0, "GA": 0, "MP": 0} for team in teams}

    standings = []
    matchday = 1
    games_in_day = 0
    current_day_matches = []

    for _, row in df.iterrows():
        home, away = row['home'], row['away']
        hg, ag = int(row['home_goals']), int(row['away_goals'])

        table[home]["GF"] += hg
        table[home]["GA"] += ag
        table[home]["MP"] += 1

        table[away]["GF"] += ag
        table[away]["GA"] += hg
        table[away]["MP"] += 1

        if hg > ag:
            table[home]["PTS"] += 3
        elif hg < ag:
            table[away]["PTS"] += 3
        else:
            table[home]["PTS"] += 1
            table[away]["PTS"] += 1

        current_day_matches.append((home, away))
        games_in_day += 1

        if games_in_day == 10:
            snapshot = []
            for team, stats in table.items():
                gd = stats["GF"] - stats["GA"]
                snapshot.append({
                    "Season": season,
                    "Matchday": matchday,
                    "Team": team,
                    "Points": stats["PTS"],
                    "GD": gd,
                    "GF": stats["GF"],
                    "MP": stats["MP"]
                })

            ranked = pd.DataFrame(snapshot)
            ranked = ranked.sort_values(["Points", "GD", "GF"], ascending=False)
            ranked["Rank"] = range(1, len(ranked) + 1)
            standings.append(ranked)

            matchday += 1
            games_in_day = 0
            current_day_matches = []

    if standings:
        df_season = pd.concat(standings)
        output_file = os.path.join(output_dir, f"standings_eng_{season}.csv")
        df_season.to_csv(output_file, index=False)
        print(f"✓ נשמר: {output_file}")
    else:
        print(f"⚠️ לא נוצרו מחזורים לעונה {season}")
