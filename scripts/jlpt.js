// JLPT 단어 학습 로직
let currentLevel = 'N5';
let displayCount = 12;
let favs = JSON.parse(localStorage.getItem('kotonoha_favs') || '[]');
let filtered = [];

const levelColors = { N5: '#27ae60', N4: '#2980b9', N3: '#8e44ad', N2: '#e67e22', N1: '#c0392b' };

function switchLevel(level) {
  currentLevel = level;
  displayCount = 12;
  document.querySelectorAll('.level-tab').forEach(t => t.classList.toggle('active', t.dataset.level === level));
  renderTodayWord();
  filterWords();
}

function renderTodayWord() {
  const words = jlptWords[currentLevel];
  const d = new Date(); const w = words[d.getDate() % words.length];
  document.getElementById('todayHighlight').innerHTML = `
    <div class="today-badge">오늘의 ${currentLevel} 단어</div>
    <div class="today-info">
      <div class="today-word" style="color:${levelColors[currentLevel]}">${w.word}</div>
      <div class="today-reading">${w.reading}</div>
      <div class="today-meaning">${w.meanings.join(', ')}</div>
    </div>
  `;
}

function filterWords() {
  const q = document.getElementById('searchInput').value.toLowerCase();
  const pos = document.getElementById('posFilter').value;
  const words = jlptWords[currentLevel];

  filtered = words.filter(w => {
    const matchQ = !q || w.word.includes(q) || w.reading.toLowerCase().includes(q) || w.meanings.join().includes(q);
    const matchPos = !pos || w.pos === pos;
    return matchQ && matchPos;
  });

  document.getElementById('wordCountPill').textContent = filtered.length + '개';
  renderWords();
}

function renderWords() {
  const visible = filtered.slice(0, displayCount);
  const color = levelColors[currentLevel];

  document.getElementById('wordGrid').innerHTML = visible.map(w => {
    const isFav = favs.some(f => f.word === w.word);
    return `
      <div class="word-card" style="--level-color:${color}">
        <div class="wc-header">
          <div>
            <div class="wc-word">${w.word}</div>
            <div class="wc-kanji">${w.kanji || ''}</div>
          </div>
          <button class="wc-fav ${isFav ? 'on' : ''}" onclick="toggleFav('${w.word}')">${isFav ? '★' : '☆'}</button>
        </div>
        <div class="wc-reading">${w.reading}</div>
        <div class="wc-divider"></div>
        <span class="wc-pos">${w.pos}</span>
        <div class="wc-meaning">${w.meanings.map((m,i) => `${i+1}. ${m}`).join('<br>')}</div>
      </div>
    `;
  }).join('');

  document.getElementById('loadMoreBtn').style.display = filtered.length > displayCount ? 'block' : 'none';
}

function loadMore() {
  displayCount += 12;
  renderWords();
}

function toggleFav(word) {
  const allWords = Object.values(jlptWords).flat();
  const data = allWords.find(w => w.word === word);
  if (!data) return;

  const idx = favs.findIndex(f => f.word === word);
  if (idx >= 0) {
    favs.splice(idx, 1);
  } else {
    favs.push({ word: data.word, kanji: data.kanji || '', reading: data.reading, meanings: data.meanings });
  }
  localStorage.setItem('kotonoha_favs', JSON.stringify(favs));
  renderWords();
}

window.onload = () => {
  renderTodayWord();
  filterWords();
};
