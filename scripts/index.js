// ── 설정 로드 (다크모드 즉시 적용) ──
const settings = JSON.parse(localStorage.getItem('kotonoha_settings') || '{}');
if (settings.darkMode) document.body.classList.add('dark');

// ── 홈 노래 목록 ──
const homeSongs = [
  { id:1, title:'猫',         titleKr:'고양이',    artist:'DISH//',   tag:'추천' },
  { id:2, title:'さよならモルテン', titleKr:'안녕 모르텐', artist:'Yorushika', tag:'추천' },
  { id:3, title:'カメレオン',  titleKr:'카멜레온',  artist:'King Gnu', tag:'인기' },
  { id:4, title:'ヒッチコック',titleKr:'히치콕',   artist:'Yorushika', tag:'추천' },
  { id:5, title:'沈丁花',     titleKr:'서향꽃',   artist:'DISH//',   tag:'신규' },
];
const LS_LIKES='kotonoha_song_likes', LS_BM='kotonoha_song_bookmarks';
const LS_FAVS='kotonoha_favs', LS_KANJI='kotonoha_kanji_done';
let songLikes=JSON.parse(localStorage.getItem(LS_LIKES)||'[]');
let songBMs  =JSON.parse(localStorage.getItem(LS_BM)||'[]');

// ── 오늘의 단어 ──
const todayWords=[
  {word:'美しい',reading:'うつくしい · utsukushii',meaning:'아름답다, 예쁘다',level:'N3'},
  {word:'夢',    reading:'ゆめ · yume',             meaning:'꿈',              level:'N4'},
  {word:'輝く',  reading:'かがやく · kagayaku',     meaning:'빛나다, 반짝이다',level:'N3'},
  {word:'懐かしい',reading:'なつかしい · natsukashii',meaning:'그립다, 옛날 생각이 나다',level:'N2'},
  {word:'切ない',reading:'せつない · setsunai',      meaning:'가슴이 아프다, 애틋하다',level:'N2'},
  {word:'儚い',  reading:'はかない · hakanai',       meaning:'덧없다, 무상하다',level:'N1'},
  {word:'勇気',  reading:'ゆうき · yūki',            meaning:'용기',            level:'N4'},
];
(function(){
  const tw=todayWords[new Date().getDate()%todayWords.length];
  document.getElementById('todayWord').textContent   =tw.word;
  document.getElementById('todayReading').textContent=tw.reading;
  document.getElementById('todayMeaning').textContent=tw.meaning;
  document.getElementById('todayLevel').textContent  =tw.level;
})();

// ── 통계 새로고침 ──
function refreshStats(){
  const favs =JSON.parse(localStorage.getItem(LS_FAVS)||'[]');
  const kanji=JSON.parse(localStorage.getItem(LS_KANJI)||'[]');
  const lk   =JSON.parse(localStorage.getItem(LS_LIKES)||'[]');
  const bm   =JSON.parse(localStorage.getItem(LS_BM)||'[]');
  document.getElementById('favCount').textContent      =favs.length;
  document.getElementById('kanjiCount').textContent    =kanji.length;
  document.getElementById('likedCount').textContent    =lk.length;
  document.getElementById('bookmarkCount').textContent =bm.length;
}

// ── 노래 리스트 렌더 ──
function renderSongList(list){
  const el=document.getElementById('songListHome');
  const nr=document.getElementById('songNoResult');
  if(!list.length){el.innerHTML='';nr.style.display='block';return;}
  nr.style.display='none';
  el.innerHTML=list.map((s,i)=>{
    const liked=songLikes.includes(s.id), bm=songBMs.includes(s.id);
    return `<a href="player.html?song=${s.id}" class="song-item">
      <span class="song-num">${String(i+1).padStart(2,'0')}</span>
      <div class="song-info">
        <div class="song-title">${s.title} (${s.titleKr})</div>
        <div class="song-artist">${s.artist}</div>
      </div>
      <div class="song-actions" onclick="event.preventDefault();event.stopPropagation()">
        <button class="song-like-btn${liked?' on':''}" onclick="toggleLike(${s.id},this)" title="좋아요">${liked?'❤️':'🤍'}</button>
        <button class="song-bm-btn${bm?' on':''}" onclick="toggleBookmark(${s.id},this)" title="북마크">${bm?'🔖':'📄'}</button>
      </div>
      <span class="song-tag">${s.tag}</span>
    </a>`;
  }).join('');
}

// ── 좋아요 / 북마크 ──
function toggleLike(id,btn){
  const idx=songLikes.indexOf(id);
  if(idx>=0)songLikes.splice(idx,1); else songLikes.push(id);
  localStorage.setItem(LS_LIKES,JSON.stringify(songLikes));
  const on=songLikes.includes(id);
  btn.textContent=on?'❤️':'🤍'; btn.classList.toggle('on',on);
  refreshStats();
}
function toggleBookmark(id,btn){
  const idx=songBMs.indexOf(id);
  if(idx>=0)songBMs.splice(idx,1); else songBMs.push(id);
  localStorage.setItem(LS_BM,JSON.stringify(songBMs));
  const on=songBMs.includes(id);
  btn.textContent=on?'🔖':'📄'; btn.classList.toggle('on',on);
  refreshStats();
}

// ── 노래 검색 ──
function filterSongs(){
  const q=document.getElementById('songSearchInput').value.toLowerCase().trim();
  renderSongList(homeSongs.filter(s=>
    !q||s.title.toLowerCase().includes(q)||s.titleKr.includes(q)||s.artist.toLowerCase().includes(q)
  ));
}

// ── 즐겨찾기 모달 ──
function openFavModal(){renderFavModal();document.getElementById('favModal').classList.add('open');}
function renderFavModal(){
  const body=document.getElementById('favModalBody');
  const favs=JSON.parse(localStorage.getItem(LS_FAVS)||'[]');
  const limit=parseInt(localStorage.getItem('kotonoha_fav_limit')||'50');
  if(!favs.length){
    body.innerHTML='<div class="modal-empty"><div class="big">☆</div>아직 즐겨찾기한 단어가 없어요.<br><small>가사 학습에서 단어를 클릭해 추가해보세요!</small></div>';
  } else {
    body.innerHTML=`<div style="font-size:0.75rem;color:var(--muted);margin-bottom:10px;">${favs.length} / ${limit}개</div>`+
      favs.map((f,i)=>`<div class="fav-item">
        <div class="fav-jp">${f.word}</div>
        <div class="fav-info">
          <div class="fav-reading">${f.reading||''}</div>
          <div class="fav-meaning">${Array.isArray(f.meanings)?f.meanings.join(' · '):(f.meaning||'')}</div>
        </div>
        <button class="fav-delete" onclick="deleteFav(${i})" title="삭제">🗑️</button>
      </div>`).join('');
  }
  document.getElementById('favCount').textContent=favs.length;
}
function deleteFav(i){
  const favs=JSON.parse(localStorage.getItem(LS_FAVS)||'[]');
  favs.splice(i,1); localStorage.setItem(LS_FAVS,JSON.stringify(favs)); renderFavModal();
}

// ── 한자 모달 ──
function openKanjiModal(){
  const body=document.getElementById('kanjiModalBody');
  const done=JSON.parse(localStorage.getItem(LS_KANJI)||'[]');
  if(!done.length){
    body.innerHTML='<div class="modal-empty"><div class="big">字</div>아직 완료한 한자가 없어요.<br><small>한자 탭에서 학습 완료 체크를 해보세요!</small></div>';
  } else {
    body.innerHTML=`<div style="margin-bottom:10px;font-size:0.78rem;color:var(--muted);">총 ${done.length}자 완료</div><div class="kanji-grid">`+
      done.map(k=>`<div class="kanji-item" title="${k}">${k}</div>`).join('')+'</div>';
  }
  document.getElementById('kanjiModal').classList.add('open');
}
function closeModal(id){document.getElementById(id).classList.remove('open');}
document.addEventListener('keydown',e=>{if(e.key==='Escape'){closeModal('favModal');closeModal('kanjiModal');}});

window.onload=function(){refreshStats();renderSongList(homeSongs);};
