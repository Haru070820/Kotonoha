// 한자 학습 로직
let currentLevel = 'N5';
let currentFilter = 'all';
let currentPage = 1;
const PAGE_SIZE = 60;
let done = JSON.parse(localStorage.getItem('kotonoha_kanji_done') || '[]');
let filtered = [];
let selectedKanji = null;

const levelColors = { N5: '#27ae60', N4: '#2980b9', N3: '#8e44ad', N2: '#e67e22', N1: '#c0392b' };

function switchLevel(level) {
  currentLevel = level;
  currentPage = 1;
  document.querySelectorAll('.level-tab').forEach(t => t.classList.toggle('active', t.dataset.level === level));
  applyFilter();
}

function setFilter(f) {
  currentFilter = f;
  currentPage = 1;
  ['filterAll','filterUndone','filterDone'].forEach(id => document.getElementById(id).classList.remove('active'));
  document.getElementById(f === 'all' ? 'filterAll' : f === 'undone' ? 'filterUndone' : 'filterDone').classList.add('active');
  applyFilter();
}

function applyFilter() {
  const q = document.getElementById('searchInput').value;
  const all = kanjiDB[currentLevel] || [];
  filtered = all.filter(item => {
    const matchQ = !q || item.k.includes(q) || item.on.includes(q) || item.kun.includes(q) || item.meaning.includes(q);
    const isDone = done.includes(item.k);
    const matchF = currentFilter === 'all' || (currentFilter === 'done' && isDone) || (currentFilter === 'undone' && !isDone);
    return matchQ && matchF;
  });
  document.getElementById('countPill').textContent = filtered.length + '字';
  renderGrid();
  renderPagination();
}

function filterKanji() { currentPage = 1; applyFilter(); }

function renderGrid() {
  const start = (currentPage - 1) * PAGE_SIZE;
  const visible = filtered.slice(start, start + PAGE_SIZE);

  document.getElementById('kanjiGrid').innerHTML = visible.map(item => {
    const isDone = done.includes(item.k);
    const firstOn = item.on.split('・')[0];
    return `
      <div class="kanji-card ${isDone ? 'done' : ''}" onclick='openDetail(${JSON.stringify(item)})'>
        <span class="kanji-done-mark">✓</span>
        <div class="kanji-char">${item.k}</div>
        <div class="kanji-kr" style="font-size:0.62rem;color:#a08060;margin-top:2px;font-family:'Noto Sans KR',sans-serif">${item.kr||''}</div>
        <div class="kanji-on">${firstOn}</div>
      </div>
    `;
  }).join('');

  updateProgress();
}

function renderPagination() {
  const total = Math.ceil(filtered.length / PAGE_SIZE);
  if (total <= 1) { document.getElementById('pagination').innerHTML = ''; return; }
  let html = '';
  for (let i = 1; i <= total; i++) {
    html += `<button class="page-btn ${i === currentPage ? 'active' : ''}" onclick="goPage(${i})">${i}</button>`;
  }
  document.getElementById('pagination').innerHTML = html;
}

function goPage(p) { currentPage = p; renderGrid(); renderPagination(); window.scrollTo(0,0); }

function updateProgress() {
  const total = 2136;
  document.getElementById('doneCount').textContent = done.length;
  document.getElementById('progressFill').style.width = (done.length / total * 100) + '%';
  document.getElementById('progressPct').textContent = (done.length / total * 100).toFixed(1) + '% 완료';
}

function openDetail(item) {
  selectedKanji = item;
  document.getElementById('dpChar').textContent = item.k;
  document.getElementById('dpLevel').textContent = currentLevel;
  document.getElementById('dpLevel').style.background = levelColors[currentLevel];
  
  const onText = item.on || '-';
  const kunText = item.kun || '-';
  document.getElementById('dpOn').textContent = onText;
  document.getElementById('dpKun').textContent = kunText;
  document.getElementById('dpKr').textContent = item.kr || '-';
  document.getElementById('dpMeaning').textContent = item.meaning;

  const onTtsWrap = document.getElementById('dpOnTts');
  if (onText !== '-') {
    const firstOn = onText.split('・')[0].split(',')[0].trim();
    // Use kana for TTS instead of kanji to avoid cutoff/wrong reading
    onTtsWrap.innerHTML = ttsBtn(firstOn, 'dp-tts');
  } else {
    onTtsWrap.innerHTML = '';
  }

  const kunTtsWrap = document.getElementById('dpKunTts');
  if (kunText !== '-') {
    // Some kunyomi have parentheses or okurigana variations, grab raw
    let firstKun = kunText.split('・')[0].split(',')[0].trim();
    firstKun = firstKun.replace(/（[^）]*）/g, '').replace(/\([^\)]*\)/g, '');
    kunTtsWrap.innerHTML = ttsBtn(firstKun, 'dp-tts');
  } else {
    kunTtsWrap.innerHTML = '';
  }

  const isDone = done.includes(item.k);
  const btn = document.getElementById('dpDoneBtn');
  btn.textContent = isDone ? '✓ 학습 완료됨 (다시 클릭해서 취소)' : '○ 학습 완료 체크';
  btn.classList.toggle('active', isDone);
  document.getElementById('detailPanel').classList.add('open');
}

function closeDetail() {
  document.getElementById('detailPanel').classList.remove('open');
  selectedKanji = null;
}

function toggleDoneFromPanel() {
  if (!selectedKanji) return;
  const k = selectedKanji.k;
  const idx = done.indexOf(k);
  if (idx >= 0) done.splice(idx, 1);
  else done.push(k);
  localStorage.setItem('kotonoha_kanji_done', JSON.stringify(done));

  const isDone = done.includes(k);
  const btn = document.getElementById('dpDoneBtn');
  btn.textContent = isDone ? '✓ 학습 완료됨 (다시 클릭해서 취소)' : '○ 학습 완료 체크';
  btn.classList.toggle('active', isDone);
  renderGrid();
}

window.onload = () => {
  document.getElementById('filterAll').classList.add('active');
  applyFilter();
};
