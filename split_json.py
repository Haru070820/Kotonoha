import re, json, os

with open('c:/Users/user/바탕 화면/Kotonoha/scripts/songs.js', 'r', encoding='utf-8') as f:
    text = f.read()

m = re.search(r'const\s+songs\s*=\s*\[(.*?)\];', text, re.DOTALL)
content = '[' + m.group(1) + ']'

content = re.sub(r'(?<=[\{,])(\s*)(id|title|titleKr|artist|tag|lyrics|jp|pron|ko)\s*:', r'\1"\2":', content)

# There is a single quote used? Let's hope there's no syntax errors in eval JSON.
# We also have single quotes in strings. No, strings in songs.js are double-quoted.

try:
    data = json.loads(content)
except json.JSONDecodeError as e:
    print("JSON Decode Error:", e)
    # let's try reading the file line by line and formatting it if json.loads fails
    import sys
    sys.exit(1)

os.makedirs('c:/Users/user/바탕 화면/Kotonoha/data', exist_ok=True)

artists = {
  'DISH//': 'DISHSongs.json',
  'King Gnu': 'KingGnuSongs.json',
  'Yorushika': 'YorushikaSongs.json',
  'pompadolls': 'pompadollsSongs.json',
  'RADWIMPS': 'RADWIMPSSongs.json'
}

for artist, filename in artists.items():
    artist_data = [s for s in data if s['artist'] == artist]
    with open(f'c:/Users/user/바탕 화면/Kotonoha/data/{filename}', 'w', encoding='utf-8') as f:
        json.dump(artist_data, f, ensure_ascii=False, indent=2)

print("Done")
