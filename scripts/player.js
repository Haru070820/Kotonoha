// ── 설정 로드 ──
const settings = JSON.parse(localStorage.getItem('kotonoha_settings') || '{}');
if (settings.darkMode) document.body.classList.add('dark');

// ── STATE ──
let currentSong = null, pinnedWord = null, hoveredWord = null;
let favs = JSON.parse(localStorage.getItem('kotonoha_favs') || '[]');
const LS_LIKES = 'kotonoha_song_likes';
const LS_BM    = 'kotonoha_song_bookmarks';
let songLikes = JSON.parse(localStorage.getItem(LS_LIKES) || '[]');
let songBMs   = JSON.parse(localStorage.getItem(LS_BM)    || '[]');

// ── INIT ──
function init() {
  applySettings();
  renderSongList();
  updateFavCount();
  renderFavPanel();
  const params = new URLSearchParams(window.location.search);
  const sid = parseInt(params.get('song'));
  const filter = params.get('filter');
  if (sid) loadSong(sid);
  if (filter) applyFilterMode(filter);
  document.addEventListener('click', e => {
    if (!e.target.closest('.word-token') && !e.target.closest('#tooltip')) unpinTooltip();
  });
}

// ── 설정 적용 (요미가나, 로마자) ──
function applySettings() {
  const s = JSON.parse(localStorage.getItem('kotonoha_settings') || '{}');
  document.documentElement.dataset.yomigana = s.yomigana !== false ? '1' : '0';
  document.documentElement.dataset.romaji   = s.romaji   !== false ? '1' : '0';
}

// ── 필터 모드 (좋아요/북마크 필터) ──
function applyFilterMode(filter) {
  const ids = filter === 'liked' ? songLikes : filter === 'bookmarked' ? songBMs : null;
  if (!ids) return;
  const el = document.getElementById('songSearchPlayer');
  if (el) el.value = '';
  renderSongList(ids);
}

// ── 노래 리스트 렌더 ──
function renderSongList(filterIds) {
  const q = (document.getElementById('songSearchPlayer')?.value || '').toLowerCase().trim();
  let list = songs;
  if (filterIds) list = list.filter(s => filterIds.includes(s.id));
  if (q) list = list.filter(s =>
    s.title.toLowerCase().includes(q) || s.titleKr.includes(q) || s.artist.toLowerCase().includes(q)
  );
  document.getElementById('songList').innerHTML = list.map(s => {
    const liked = songLikes.includes(s.id), bm = songBMs.includes(s.id);
    return `<div class="song-item${currentSong?.id===s.id?' active':''}" onclick="loadSong(${s.id})">
      <div class="s-title">${s.title}</div>
      <div class="s-artist">${s.titleKr} · ${s.artist}</div>
      <div class="s-actions" onclick="event.stopPropagation()" style="display:flex;gap:4px;margin-top:4px">
        <button class="s-like-btn${liked?' on':''}" onclick="toggleLike(${s.id},this)" style="background:none;border:none;cursor:pointer;font-size:0.9rem;padding:2px 4px;">${liked?'❤️':'🤍'}</button>
        <button class="s-bm-btn${bm?' on':''}"  onclick="toggleBM(${s.id},this)"   style="background:none;border:none;cursor:pointer;font-size:0.9rem;padding:2px 4px;">${bm?'🔖':'📄'}</button>
      </div>
      <span class="s-tag">${s.tag}</span>
    </div>`;
  }).join('') + (list.length===0
    ? '<div style="padding:16px;text-align:center;color:var(--muted);font-size:0.82rem;">결과 없음</div>'
    : `<div class="song-item" style="opacity:0.4;cursor:default;pointer-events:none;border-style:dashed;">
        <div class="s-title" style="font-size:0.9em;">추가 예정</div>
        <div class="s-artist">Coming soon…</div>
      </div>`);
}

// ── 좋아요 / 북마크 ──
function toggleLike(id, btn) {
  const idx = songLikes.indexOf(id);
  if (idx>=0) songLikes.splice(idx,1); else songLikes.push(id);
  localStorage.setItem(LS_LIKES, JSON.stringify(songLikes));
  const on = songLikes.includes(id);
  btn.textContent = on?'❤️':'🤍'; btn.classList.toggle('on',on);
}
function toggleBM(id, btn) {
  const idx = songBMs.indexOf(id);
  if (idx>=0) songBMs.splice(idx,1); else songBMs.push(id);
  localStorage.setItem(LS_BM, JSON.stringify(songBMs));
  const on = songBMs.includes(id);
  btn.textContent = on?'🔖':'📄'; btn.classList.toggle('on',on);
}

// ── 노래 로드 ──
function loadSong(id) {
  currentSong = songs.find(s => s.id === id);
  if (!currentSong) return;
  document.getElementById('songTitle').textContent = currentSong.title + ' (' + currentSong.titleKr + ')';
  document.getElementById('songArtist').textContent = currentSong.artist;
  unpinTooltip();
  renderLyrics();
  renderSongList();
}

// ── 가사 렌더 ──
function renderLyrics() {
  const s = JSON.parse(localStorage.getItem('kotonoha_settings') || '{}');
  const showPron = s.romaji !== false;
  const c = document.getElementById('lyricsContainer');
  c.innerHTML = currentSong.lyrics.map(line => {
    // jp가 문자열이면 tokenizePlain, 배열이면 buildJpHTML
    const jpHtml = typeof line.jp === 'string' ? tokenizePlain(line.jp) : buildJpHTML(line.jp);
    return `<div class="lyrics-row">
      <div class="lyrics-jp-line">${jpHtml}</div>
      ${showPron ? `<div class="lyrics-pron-line">${line.pron}</div>` : ''}
      <div class="lyrics-ko-line">${line.ko}</div>
    </div>`;
  }).join('');
  attachTokenEvents();
}

function buildJpHTML(segments) {
  let html = '';
  for (const seg of segments) {
    if (Array.isArray(seg)) {
      if (Array.isArray(seg[0])) { html += buildJpHTML(seg); }
      else {
        const key=seg[0], furi=seg[1];
        const isFav=favs.some(f=>f.word===key), hasDict=!!wordDB[key];
        html+=`<span class="word-token${isFav?' favorited':''}${pinnedWord===key?' pinned':''}" data-word="${escH(key)}"${hasDict?' data-hasdict':''}>`;
        html+=escH(key);
        html+=`</span>`;
        for(let i=2;i<seg.length;i++){
          if(Array.isArray(seg[i])) html+=buildJpHTML([seg[i]]);
          else html+=tokenizePlain(String(seg[i]));
        }
      }
    } else { html+=tokenizePlain(String(seg)); }
  }
  return html;
}

function tokenizePlain(text) {
  let res='',i=0; const chars=[...text];
  while(i<chars.length){
    let matched=false;
    for(let len=8;len>=2;len--){
      if(i+len>chars.length) continue;
      const cand=chars.slice(i,i+len).join('');
      if(wordDB[cand]){
        const isFav=favs.some(f=>f.word===cand);
        res+=`<span class="word-token${isFav?' favorited':''}${pinnedWord===cand?' pinned':''}" data-word="${escH(cand)}" data-hasdict>${escH(cand)}</span>`;
        i+=len; matched=true; break;
      }
    }
    if(!matched){
      const ch=chars[i];
      if(wordDB[ch]){const isFav=favs.some(f=>f.word===ch);
        res+=`<span class="word-token${isFav?' favorited':''}${pinnedWord===ch?' pinned':''}" data-word="${escH(ch)}" data-hasdict>${escH(ch)}</span>`;
      } else res+=escH(ch);
      i++;
    }
  }
  return res;
}
function escH(s){return s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');}

function attachTokenEvents() {
  document.querySelectorAll('.word-token[data-hasdict]').forEach(el=>{
    el.addEventListener('mouseenter',e=>{if(!pinnedWord){hoveredWord=el.dataset.word;showTooltip(e,hoveredWord,false);}});
    el.addEventListener('mousemove', e=>{if(!pinnedWord) moveTooltip(e);});
    el.addEventListener('mouseleave',()=>{if(!pinnedWord){hoveredWord=null;hideTooltip();}});
    el.addEventListener('click',e=>{
      e.stopPropagation(); const word=el.dataset.word;
      if(pinnedWord===word){unpinTooltip();return;}
      unpinTooltip(); pinnedWord=word;
      document.querySelectorAll(`.word-token[data-word="${escH(word)}"]`).forEach(t=>t.classList.add('pinned'));
      showTooltip(e,word,true);
    });
  });
}
function unpinTooltip(){
  pinnedWord=null;
  document.querySelectorAll('.word-token').forEach(t=>t.classList.remove('pinned'));
  hideTooltip();
}

// ── 툴팁 ──
function showTooltip(e,word,pinned){
  const data=wordDB[word]; if(!data) return;
  document.getElementById('tt-word').textContent   =data.word;
  document.getElementById('tt-kanji').textContent  =data.kanji||'';
  document.getElementById('tt-reading').textContent=data.reading;
  document.getElementById('tt-meaning').innerHTML  =data.meanings.map((m,i)=>`<li data-num="${i+1}">${m}</li>`).join('');
  const isFav=favs.some(f=>f.word===word);
  const btn=document.getElementById('tt-fav-btn');
  btn.textContent=isFav?'★ 즐겨찾기됨':'☆ 즐겨찾기'; btn.classList.toggle('on',isFav);
  document.getElementById('tt-pin-hint').textContent=pinned?'📌 고정됨 · 다시 클릭해서 해제':'클릭하면 고정됩니다';
  const tooltip=document.getElementById('tooltip');
  tooltip.classList.toggle('pinned-state',pinned); tooltip.classList.add('show');
  hoveredWord=word;
  if(!pinned) moveTooltip(e);
  else {
    const tw=280,th=220; let x=e.clientX+18,y=e.clientY+18;
    if(x+tw>window.innerWidth) x=e.clientX-tw-8;
    if(y+th>window.innerHeight) y=e.clientY-th-8;
    tooltip.style.left=x+'px'; tooltip.style.top=y+'px';
  }
}
function moveTooltip(e){
  if(pinnedWord) return;
  const tooltip=document.getElementById('tooltip');
  const tw=280,th=220; let x=e.clientX+18,y=e.clientY+18;
  if(x+tw>window.innerWidth) x=e.clientX-tw-8;
  if(y+th>window.innerHeight) y=e.clientY-th-8;
  tooltip.style.left=x+'px'; tooltip.style.top=y+'px';
}
function hideTooltip(){
  if(pinnedWord) return;
  const t=document.getElementById('tooltip');
  t.classList.remove('show'); t.classList.remove('pinned-state');
}

// ── 즐겨찾기 (제한 체크) ──
function toggleFavFromTooltip(){
  const word=pinnedWord||hoveredWord;
  if(!word||!wordDB[word]) return;
  const data=wordDB[word];
  const idx=favs.findIndex(f=>f.word===word);
  if(idx>=0){
    favs.splice(idx,1);
  } else {
    const limit=parseInt(localStorage.getItem('kotonoha_fav_limit')||'50');
    if(favs.length>=limit){
      alert(`즐겨찾기는 최대 ${limit}개까지 저장할 수 있어요.\n설정 페이지에서 제한을 변경할 수 있습니다.`);
      return;
    }
    favs.push({word:data.word,kanji:data.kanji,reading:data.reading,meanings:data.meanings});
  }
  localStorage.setItem('kotonoha_favs',JSON.stringify(favs));
  updateFavCount(); renderFavPanel(); renderLyrics();
  if(pinnedWord){
    document.querySelectorAll(`.word-token[data-word="${escH(word)}"]`).forEach(t=>t.classList.add('pinned'));
    const isFav=favs.some(f=>f.word===word);
    const btn=document.getElementById('tt-fav-btn');
    btn.textContent=isFav?'★ 즐겨찾기됨':'☆ 즐겨찾기'; btn.classList.toggle('on',isFav);
  }
}
function updateFavCount(){
  const limit=parseInt(localStorage.getItem('kotonoha_fav_limit')||'50');
  document.getElementById('favCountDisplay').textContent=`${favs.length}/${limit}`;
}
function renderFavPanel(){
  const c=document.getElementById('favList');
  if(!favs.length){c.innerHTML='<div class="empty-state"><div class="big">☆</div><div>즐겨찾기한 단어가 없어요<br>단어를 클릭 후 즐겨찾기 버튼을 눌러보세요</div></div>';return;}
  c.innerHTML=favs.map((f,i)=>`<div class="fav-word-item"><button class="fav-remove" onclick="removeFav(${i})">✕</button>
    <div class="fav-word-jp">★ ${f.word} <span style="font-size:0.8rem;color:var(--muted)">${f.kanji||''}</span></div>
    <div class="fav-word-reading">${f.reading}</div>
    <div class="fav-word-meaning">${f.meanings[0]}</div>
  </div>`).join('');
}
function removeFav(i){
  favs.splice(i,1); localStorage.setItem('kotonoha_favs',JSON.stringify(favs));
  updateFavCount(); renderFavPanel(); if(currentSong) renderLyrics();
}
function toggleFavPanel(){document.getElementById('favPanel').classList.toggle('open');}

window.onload=init;
