const fs = require('fs');

const songsJs = fs.readFileSync('scripts/songs.js', 'utf8');
const wordDbJs = fs.readFileSync('scripts/wordDB.js', 'utf8');

const wordKeys = new Set();
const regexWord = /'([^']+)'\s*:\s*\{/g;
let match;
while ((match = regexWord.exec(wordDbJs)) !== null) {
  wordKeys.add(match[1]);
}

const lines = [];
const regexJp = /jp\s*:\s*"([^"]+)"/g;
while ((match = regexJp.exec(songsJs)) !== null) {
  lines.push(match[1]);
}

let missing = new Set();
for (const line of lines) {
  let i = 0;
  while (i < line.length) {
    if (/[一-龯]/.test(line[i])) {
      let matched = false;
      for (let len = 8; len >= 1; len--) {
        if (i + len > line.length) continue;
        const cand = line.substring(i, i + len);
        if (wordKeys.has(cand)) {
          matched = true;
          i += len - 1; // Advance loop
          break;
        }
      }
      if (!matched) {
        // Find contiguous kanji missing
        let mk = line[i];
        missing.add(mk);
      }
    }
    i++;
  }
}

console.log("Missing Kanji Characters:");
console.log(Array.from(missing).join(' '));
