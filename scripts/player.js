// 가사 학습 플레이어 로직
// STATE
let currentSong = null, pinnedWord = null, hoveredWord = null;
let favs = JSON.parse(localStorage.getItem('kotonoha_favs') || '[]');

function init() {
  renderSongList();
  updateFavCount();
  renderFavPanel();
  const params = new URLSearchParams(window.location.search);
  const sid = parseInt(params.get('song'));
  if (sid) loadSong(sid);
  document.addEventListener('click', e => {
    if (!e.target.closest('.word-token') && !e.target.closest('#tooltip')) unpinTooltip();
  });
}

function renderSongList() {
  document.getElementById('songList').innerHTML = songs.map(s => `
    <div class="song-item ${currentSong?.id===s.id?'active':''}" onclick="loadSong(${s.id})">
      <div class="s-title">${s.title}</div>
      <div class="s-artist">${s.titleKr} · ${s.artist}</div>
      <span class="s-tag">${s.tag}</span>
    </div>`).join('') + `
    <div class="song-item" style="opacity:0.45;cursor:default;pointer-events:none;border-style:dashed;">
      <div class="s-title" style="font-size:0.9em;">추가 예정</div>
      <div class="s-artist">Coming soon…</div>
    </div>`;
}

function loadSong(id) {
  currentSong = songs.find(s => s.id === id);
  if (!currentSong) return;
  document.getElementById('songTitle').textContent = currentSong.title + ' (' + currentSong.titleKr + ')';
  document.getElementById('songArtist').textContent = currentSong.artist;
  unpinTooltip();
  renderLyrics();
  renderSongList();
}

// LYRICS RENDERING
function renderLyrics() {
  const c = document.getElementById('lyricsContainer');
  c.innerHTML = currentSong.lyrics.map(line => `
    <div class="lyrics-row">
      <div class="lyrics-jp-line">${buildJpHTML(line.jp)}</div>
      <div class="lyrics-pron-line">${line.pron}</div>
      <div class="lyrics-ko-line">${line.ko}</div>
    </div>`).join('');
  attachTokenEvents();
}

function buildJpHTML(segments) {
  let html = '';
  for (const seg of segments) {
    if (Array.isArray(seg)) {
      if (Array.isArray(seg[0])) {
        // 중첩 배열 (e.g. [['kanji','furi'],'trailing text']) -> 재귀 처리
        html += buildJpHTML(seg);
      } else {
        const key = seg[0], furi = seg[1];
        const isFav = favs.some(f => f.word === key);
        const hasDict = !!wordDB[key];
        html += `<span class="word-token${isFav?' favorited':''}${pinnedWord===key?' pinned':''}" data-word="${escH(key)}"${hasDict?' data-hasdict':''}>`;
        html += escH(key);
        html += `</span>`;
        // trailing 텍스트/배열 처리
        for (let i = 2; i < seg.length; i++) {
          if (Array.isArray(seg[i])) html += buildJpHTML([seg[i]]);
          else html += tokenizePlain(String(seg[i]));
        }
      }
    } else {
      html += tokenizePlain(String(seg));
    }
  }
  return html;
}

function tokenizePlain(text) {
  let res = '', i = 0;
  const chars = [...text];
  while (i < chars.length) {
    let matched = false;
    for (let len = 8; len >= 2; len--) {
      if (i + len > chars.length) continue;
      const cand = chars.slice(i, i+len).join('');
      if (wordDB[cand]) {
        const isFav = favs.some(f => f.word === cand);
        res += `<span class="word-token${isFav?' favorited':''}${pinnedWord===cand?' pinned':''}" data-word="${escH(cand)}" data-hasdict>${escH(cand)}</span>`;
        i += len; matched = true; break;
      }
    }
    if (!matched) {
      const ch = chars[i];
      if (wordDB[ch]) {
        const isFav = favs.some(f => f.word === ch);
        res += `<span class="word-token${isFav?' favorited':''}${pinnedWord===ch?' pinned':''}" data-word="${escH(ch)}" data-hasdict>${escH(ch)}</span>`;
      } else {
        res += escH(ch);
      }
      i++;
    }
  }
  return res;
}

function escH(s) { return s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;'); }

function attachTokenEvents() {
  document.querySelectorAll('.word-token[data-hasdict]').forEach(el => {
    el.addEventListener('mouseenter', e => { if (!pinnedWord) { hoveredWord = el.dataset.word; showTooltip(e, hoveredWord, false); } });
    el.addEventListener('mousemove', e => { if (!pinnedWord) moveTooltip(e); });
    el.addEventListener('mouseleave', () => { if (!pinnedWord) { hoveredWord = null; hideTooltip(); } });
    el.addEventListener('click', e => {
      e.stopPropagation();
      const word = el.dataset.word;
      if (pinnedWord === word) { unpinTooltip(); return; }
      unpinTooltip();
      pinnedWord = word;
      document.querySelectorAll(`.word-token[data-word="${escH(word)}"]`).forEach(t => t.classList.add('pinned'));
      showTooltip(e, word, true);
    });
  });
}

function unpinTooltip() {
  pinnedWord = null;
  document.querySelectorAll('.word-token').forEach(t => t.classList.remove('pinned'));
  hideTooltip();
}

// TOOLTIP
function showTooltip(e, word, pinned) {
  const data = wordDB[word]; if (!data) return;
  document.getElementById('tt-word').textContent = data.word;
  document.getElementById('tt-kanji').textContent = data.kanji || '';
  document.getElementById('tt-reading').textContent = data.reading;
  document.getElementById('tt-meaning').innerHTML = data.meanings.map((m,i) => `<li data-num="${i+1}">${m}</li>`).join('');
  const isFav = favs.some(f => f.word === word);
  const btn = document.getElementById('tt-fav-btn');
  btn.textContent = isFav ? '★ 즐겨찾기됨' : '☆ 즐겨찾기';
  btn.classList.toggle('on', isFav);
  const hint = document.getElementById('tt-pin-hint');
  const tooltip = document.getElementById('tooltip');
  hint.textContent = pinned ? '📌 고정됨 · 다시 클릭해서 해제' : '클릭하면 고정됩니다';
  tooltip.classList.toggle('pinned-state', pinned);
  tooltip.classList.add('show');
  hoveredWord = word;
  if (!pinned) moveTooltip(e);
  else {
    // position pinned tooltip near click
    const tw = 280, th = 220;
    let x = e.clientX + 18, y = e.clientY + 18;
    if (x + tw > window.innerWidth) x = e.clientX - tw - 8;
    if (y + th > window.innerHeight) y = e.clientY - th - 8;
    tooltip.style.left = x + 'px'; tooltip.style.top = y + 'px';
  }
}

function moveTooltip(e) {
  if (pinnedWord) return;
  const tooltip = document.getElementById('tooltip');
  const tw = 280, th = 220;
  let x = e.clientX + 18, y = e.clientY + 18;
  if (x + tw > window.innerWidth) x = e.clientX - tw - 8;
  if (y + th > window.innerHeight) y = e.clientY - th - 8;
  tooltip.style.left = x + 'px'; tooltip.style.top = y + 'px';
}

function hideTooltip() {
  if (pinnedWord) return;
  const t = document.getElementById('tooltip');
  t.classList.remove('show'); t.classList.remove('pinned-state');
}

// FAVORITES
function toggleFavFromTooltip() {
  const word = pinnedWord || hoveredWord;
  if (!word || !wordDB[word]) return;
  const data = wordDB[word];
  const idx = favs.findIndex(f => f.word === word);
  if (idx >= 0) favs.splice(idx, 1);
  else favs.push({word: data.word, kanji: data.kanji, reading: data.reading, meanings: data.meanings});
  localStorage.setItem('kotonoha_favs', JSON.stringify(favs));
  updateFavCount(); renderFavPanel(); renderLyrics();
  if (pinnedWord) {
    document.querySelectorAll(`.word-token[data-word="${escH(word)}"]`).forEach(t => t.classList.add('pinned'));
    const isFav = favs.some(f => f.word === word);
    const btn = document.getElementById('tt-fav-btn');
    btn.textContent = isFav ? '★ 즐겨찾기됨' : '☆ 즐겨찾기';
    btn.classList.toggle('on', isFav);
  }
}
function updateFavCount() { document.getElementById('favCountDisplay').textContent = favs.length; }
function renderFavPanel() {
  const c = document.getElementById('favList');
  if (!favs.length) { c.innerHTML = '<div class="empty-state"><div class="big">☆</div><div>즐겨찾기한 단어가 없어요<br>단어를 클릭 후 즐겨찾기 버튼을 눌러보세요</div></div>'; return; }
  c.innerHTML = favs.map((f,i) => `<div class="fav-word-item"><button class="fav-remove" onclick="removeFav(${i})">✕</button><div class="fav-word-jp">★ ${f.word} <span style="font-size:0.8rem;color:var(--muted)">${f.kanji}</span></div><div class="fav-word-reading">${f.reading}</div><div class="fav-word-meaning">${f.meanings[0]}</div></div>`).join('');
}
function removeFav(i) { favs.splice(i,1); localStorage.setItem('kotonoha_favs',JSON.stringify(favs)); updateFavCount(); renderFavPanel(); if (currentSong) renderLyrics(); }
function toggleFavPanel() { document.getElementById('favPanel').classList.toggle('open'); }
window.onload = init;
