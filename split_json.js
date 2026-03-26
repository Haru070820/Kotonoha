const fs = require('fs');

eval(fs.readFileSync('c:/Users/user/바탕 화면/Kotonoha/scripts/songs.js', 'utf8'));

const artistsObj = {
  'DISH//': 'DISHSongs.json',
  'King Gnu': 'KingGnuSongs.json',
  'Yorushika': 'YorushikaSongs.json',
  'pompadolls': 'pompadollsSongs.json',
  'RADWIMPS': 'RADWIMPSSongs.json'
};

if (!fs.existsSync('c:/Users/user/바탕 화면/Kotonoha/data')) {
  fs.mkdirSync('c:/Users/user/바탕 화면/Kotonoha/data');
}

for (const [artist, filename] of Object.entries(artistsObj)) {
  const artistSongs = songs.filter(s => s.artist === artist);
  fs.writeFileSync(`c:/Users/user/바탕 화면/Kotonoha/data/${filename}`, JSON.stringify(artistSongs, null, 2));
}

console.log("JSON Split Done");
