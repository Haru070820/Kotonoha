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
let playerCat = 'all'; // 'all' | 'popular' | 'new' | 'artist'
let selectedArtist = null;

// ── 음악 스트리밍 링크 ──
const musicLinks = {
  1: { yt:'https://music.youtube.com/search?q=DISH%2F%2F+%E7%8C%AB', apple:'https://music.apple.com/search?term=DISH+%E7%8C%AB', spotify:'https://open.spotify.com/search/DISH%20%E7%8C%AB' },
  3: { yt:'https://music.youtube.com/search?q=King+Gnu+%E3%82%AB%E3%83%A1%E3%83%AC%E3%82%AA%E3%83%B3', apple:'https://music.apple.com/search?term=King+Gnu+%E3%82%AB%E3%83%A1%E3%83%AC%E3%82%AA%E3%83%B3', spotify:'https://open.spotify.com/search/King%20Gnu%20%E3%82%AB%E3%83%A1%E3%83%AC%E3%82%AA%E3%83%B3' },
  4: { yt:'https://music.youtube.com/search?q=Yorushika+%E3%83%92%E3%83%83%E3%83%81%E3%82%B3%E3%83%83%E3%82%AF', apple:'https://music.apple.com/search?term=Yorushika+Hitchcock', spotify:'https://open.spotify.com/search/Yorushika%20%E3%83%92%E3%83%83%E3%83%81%E3%82%B3%E3%83%83%E3%82%AF' },
  5: { yt:'https://music.youtube.com/search?q=DISH%2F%2F+%E6%B2%88%E4%B8%81%E8%8A%B1', apple:'https://music.apple.com/search?term=DISH+%E6%B2%88%E4%B8%81%E8%8A%B1', spotify:'https://open.spotify.com/search/DISH%20%E6%B2%88%E4%B8%81%E8%8A%B1' },
  6: { yt:'https://music.youtube.com/search?q=Yorushika+%E5%BF%98%E3%82%8C%E3%81%A6%E3%81%8F%E3%81%A0%E3%81%95%E3%81%84', apple:'https://music.apple.com/search?term=Yorushika+%E5%BF%98%E3%82%8C%E3%81%A6%E3%81%8F%E3%81%A0%E3%81%95%E3%81%84', spotify:'https://open.spotify.com/search/Yorushika%20%E5%BF%98%E3%82%8C%E3%81%A6%E3%81%8F%E3%81%A0%E3%81%95%E3%81%84' },
  7: { yt:'https://music.youtube.com/search?q=pompadols+%E6%82%AA%E9%A3%9F', apple:'https://music.apple.com/search?term=pompadols+%E6%82%AA%E9%A3%9F', spotify:'https://open.spotify.com/search/pompadols%20%E6%82%AA%E9%A3%9F' },
  8: { yt:'https://music.youtube.com/search?q=RADWIMPS+Sparkle', apple:'https://music.apple.com/search?term=RADWIMPS+Sparkle', spotify:'https://open.spotify.com/search/RADWIMPS%20Sparkle' },
};

// ── INIT ──
async function init() {
  applySettings();
  try {
    const promises = artists.map(a => fetch(`data/${a.file}`).then(r => r.json()));
    const arrays = await Promise.all(promises);
    songs = arrays.flat();
  } catch(e) { console.error('Failed to load songs', e); }
  
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

// ── 필터 모드 (좋아요/북마크/카테고리 필터) ──
function applyFilterMode(filter) {
  if (filter === 'popular' || filter === 'new' || filter === 'artist') {
    setPlayerCat(filter);
    return;
  }
  const ids = filter === 'liked' ? songLikes : filter === 'bookmarked' ? songBMs : null;
  if (!ids) return;
  const el = document.getElementById('songSearchPlayer');
  if (el) el.value = '';
  renderSongList(ids);
}

// ── 카테고리 탭 전환 ──
function setPlayerCat(cat){
  if (cat !== 'artist') selectedArtist = null;
  playerCat = cat;
  document.querySelectorAll('.p-cat-tab').forEach(t=>t.classList.remove('active'));
  document.querySelectorAll('.p-cat-tab').forEach(t=>{
    if((cat==='all'&&t.textContent==='전체')||(cat==='popular'&&t.textContent==='인기')||(cat==='new'&&t.textContent==='최신')||(cat==='artist'&&t.textContent==='가수'))
      t.classList.add('active');
  });
  renderSongList();
}

// ── 노래 리스트 렌더 ──
function renderSongList(filterIds) {
  if (playerCat === 'artist' && !selectedArtist && !filterIds) {
    document.getElementById('songList').innerHTML = artists.map(a => `
      <div class="song-item" onclick="selectArtist('${a.name.replace(/'/g, "\\'")}')" style="cursor:pointer; display:flex; align-items:center; padding:12px 16px;">
        <div class="s-title" style="font-size:1.05rem;"><span class="material-symbols-outlined" style="vertical-align:-4px; margin-right:6px; color:var(--accent-gold);">mic</span> ${a.name}</div>
      </div>
    `).join('');
    return;
  }

  const q = (document.getElementById('songSearchPlayer')?.value || '').toLowerCase().trim();
  let list = songs;
  if (filterIds) list = list.filter(s => filterIds.includes(s.id));
  // 카테고리 필터 적용
  if (playerCat === 'popular') list = list.filter(s => s.tag === '인기' || s.tag === '추천');
  else if (playerCat === 'new') list = list.filter(s => s.tag === '신규');
  else if (playerCat === 'artist' && selectedArtist) {
    list = list.filter(s => s.artist === selectedArtist);
  }
  if (q) list = list.filter(s =>
    s.title.toLowerCase().includes(q) || s.titleKr.includes(q) || s.artist.toLowerCase().includes(q)
  );
  
  let html = '';
  if (playerCat === 'artist' && selectedArtist) {
    html += `<div class="song-item" onclick="selectArtist(null)" style="cursor:pointer; background:var(--paper); margin-bottom:10px; text-align:center; font-weight:bold; color:var(--accent-gold);">
      ← 가수 목록으로 돌아가기
    </div>`;
  }

  html += list.map(s => {
    const bm = songBMs.includes(s.id);
    return `<div class="song-item${currentSong?.id===s.id?' active':''}" onclick="loadSong(${s.id})">
      <div class="s-title">${s.title}</div>
      <div class="s-artist">${s.titleKr} · ${s.artist}</div>
      <div class="s-actions" onclick="event.stopPropagation()" style="display:flex;gap:4px;margin-top:4px">
        <button class="s-bm-btn${bm?' on':''}"  onclick="toggleBM(${s.id},this)"   style="background:none;border:none;cursor:pointer;font-size:0.9rem;padding:2px 4px;color:${bm?'var(--accent-gold)':'var(--muted)'}"><span class="material-symbols-outlined${bm?' ms-filled':''}" style="font-size:1.1rem">bookmark</span></button>
        <button onclick="openMusicPopup(event,${s.id})" style="background:none;border:none;cursor:pointer;font-size:0.9rem;padding:2px 4px;color:var(--muted)" title="음악 듣기"><span class="material-symbols-outlined" style="font-size:1.1rem">headphones</span></button>
      </div>
      <span class="s-tag">${s.tag}</span>
    </div>`;
  }).join('') + (list.length===0
    ? '<div style="padding:16px;text-align:center;color:var(--muted);font-size:0.82rem;">결과 없음</div>'
    : '');

  document.getElementById('songList').innerHTML = html;
}

function selectArtist(artistName) {
  selectedArtist = artistName;
  const searchInput = document.getElementById('songSearchPlayer');
  if (searchInput) searchInput.value = '';
  renderSongList();
}

// ── 북마크 ──
function toggleBM(id, btn) {
  const idx = songBMs.indexOf(id);
  if (idx>=0) songBMs.splice(idx,1); else songBMs.push(id);
  localStorage.setItem(LS_BM, JSON.stringify(songBMs));
  const on = songBMs.includes(id);
  const icon=btn.querySelector('.material-symbols-outlined'); if(icon){icon.classList.toggle('ms-filled',on);} btn.classList.toggle('on',on);
  btn.style.color = on ? 'var(--accent-gold)' : 'var(--muted)';
}

// ── 음악 바로 가기 팝업 ──
let _musicPopup=null;
function openMusicPopup(e,songId){
  closeMusicPopup();
  const links=musicLinks[songId];
  if(!links) return;
  const popup=document.createElement('div');
  popup.className='music-popup';
  popup.innerHTML=`
    <div class="music-popup-title"><span class="material-symbols-outlined" style="font-size:1rem;vertical-align:-2px">headphones</span> 음악 듣기</div>
    <a href="${links.yt}" target="_blank" class="music-popup-link music-yt"><span class="material-symbols-outlined" style="font-size:1rem">play_circle</span> YouTube Music</a>
    <a href="${links.apple}" target="_blank" class="music-popup-link music-apple"><span class="material-symbols-outlined" style="font-size:1rem">music_note</span> Apple Music</a>
    <a href="${links.spotify}" target="_blank" class="music-popup-link music-spotify"><span class="material-symbols-outlined" style="font-size:1rem">graphic_eq</span> Spotify</a>
  `;
  document.body.appendChild(popup);
  const rect=e.target.closest('button').getBoundingClientRect();
  popup.style.top=(rect.bottom+6)+'px';
  popup.style.left=Math.min(rect.left, window.innerWidth-200)+'px';
  _musicPopup=popup;
  setTimeout(()=>document.addEventListener('click',closeMusicPopupOnOutside),0);
}
function closeMusicPopup(){
  if(_musicPopup){_musicPopup.remove();_musicPopup=null;}
  document.removeEventListener('click',closeMusicPopupOnOutside);
}
function closeMusicPopupOnOutside(e){
  if(_musicPopup && !_musicPopup.contains(e.target))closeMusicPopup();
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
  // 스크롤 맨 위로
  document.querySelector('.player-area')?.scrollTo(0, 0);
  window.scrollTo(0, 0);
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

function renderWord(w) {
  const data = wordDB[w];
  if (!data || !/[一-龯]/.test(w)) return escH(w);
  const furi = data.reading.split(' ')[0];
  
  let kEnd = w.length - 1;
  let fEnd = furi.length - 1;
  while(kEnd >= 0 && fEnd >= 0 && w[kEnd] === furi[fEnd]) {
    kEnd--;
    fEnd--;
  }
  
  let kStart = 0;
  let fStart = 0;
  while(kStart <= kEnd && fStart <= fEnd && w[kStart] === furi[fStart]) {
    kStart++;
    fStart++;
  }
  
  const prefix = w.substring(0, kStart);
  const suffix = w.substring(kEnd + 1);
  const innerK = w.substring(kStart, kEnd + 1);
  const innerF = furi.substring(fStart, fEnd + 1);
  
  return escH(prefix) + `<ruby>${escH(innerK)}<rt>${escH(innerF)}</rt></ruby>` + escH(suffix);
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
        if (furi) {
          html+=`<ruby>${escH(key)}<rt>${escH(furi)}</rt></ruby>`;
        } else {
          html+=hasDict ? renderWord(key) : escH(key);
        }
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
        res+=`<span class="word-token${isFav?' favorited':''}${pinnedWord===cand?' pinned':''}" data-word="${escH(cand)}" data-hasdict>${renderWord(cand)}</span>`;
        i+=len; matched=true; break;
      }
    }
    if(!matched){
      const ch=chars[i];
      if(wordDB[ch]){const isFav=favs.some(f=>f.word===ch);
        res+=`<span class="word-token${isFav?' favorited':''}${pinnedWord===ch?' pinned':''}" data-word="${escH(ch)}" data-hasdict>${renderWord(ch)}</span>`;
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
  document.getElementById('tt-reading').textContent=data.reading.replace(' [', ' · ').replace(']', '');
  document.getElementById('tt-meaning').innerHTML  =data.meanings.map((m,i)=>`<li data-num="${i+1}">${m}</li>`).join('');
  // TTS 스피커 버튼
  const ttTts=document.getElementById('tt-tts-btn');
  if(ttTts) ttTts.innerHTML=ttsBtn(data.kanji||data.word, 'tt-tts');
  const isFav=favs.some(f=>f.word===word);
  const btn=document.getElementById('tt-fav-btn');
  btn.innerHTML=isFav?'<span class="material-symbols-outlined ms-filled" style="font-size:0.9rem;vertical-align:-2px">star</span> 즐겨찾기됨':'<span class="material-symbols-outlined" style="font-size:0.9rem;vertical-align:-2px">star</span> 즐겨찾기'; btn.classList.toggle('on',isFav);
  document.getElementById('tt-pin-hint').innerHTML=pinned?'<span class="material-symbols-outlined" style="font-size:0.85rem;vertical-align:-2px">push_pin</span> 고정됨 · 다시 클릭해서 해제':'클릭하면 고정됩니다';
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
    btn.innerHTML=isFav?'<span class="material-symbols-outlined ms-filled" style="font-size:0.9rem;vertical-align:-2px">star</span> 즐겨찾기됨':'<span class="material-symbols-outlined" style="font-size:0.9rem;vertical-align:-2px">star</span> 즐겨찾기'; btn.classList.toggle('on',isFav);
  }
}
function updateFavCount(){
  const limit=parseInt(localStorage.getItem('kotonoha_fav_limit')||'50');
  document.getElementById('favCountDisplay').textContent=`${favs.length}/${limit}`;
}
function renderFavPanel(){
  const c=document.getElementById('favList');
  if(!favs.length){c.innerHTML='<div class="empty-state"><div class="big"><span class="material-symbols-outlined" style="font-size:2.5rem">star</span></div><div>즐겨찾기한 단어가 없어요<br>단어를 클릭 후 즐겨찾기 버튼을 눌러보세요</div></div>';return;}
  c.innerHTML=favs.map((f,i)=>`<div class="fav-word-item"><button class="fav-remove" onclick="removeFav(${i})">✕</button>
    <div class="fav-word-jp"><span class="material-symbols-outlined ms-filled" style="font-size:0.85rem;color:var(--accent-gold);vertical-align:-2px">star</span> ${f.word} <span style="font-size:0.8rem;color:var(--muted)">${f.kanji||''}</span></div>
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
