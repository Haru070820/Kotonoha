// ── 설정 로드 (다크모드 즉시 적용) ──
const settings = JSON.parse(localStorage.getItem('kotonoha_settings') || '{}');
if (settings.darkMode) document.body.classList.add('dark');

// ── 홈 노래 목록 ──
const homeSongs = [
  { id:1, title:'猫',         titleKr:'고양이',    artist:'DISH//',   tag:'추천', level:'N3' },
  { id:3, title:'カメレオン',  titleKr:'카멜레온',  artist:'King Gnu', tag:'인기', level:'N2' },
  { id:4, title:'ヒッチコック',titleKr:'히치콕',   artist:'Yorushika', tag:'추천', level:'N3' },
  { id:5, title:'沈丁花',     titleKr:'서향꽃',   artist:'DISH//',   tag:'신규', level:'N4' },
  { id:6, title:'忘れてください', titleKr:'잊어주세요', artist:'Yorushika', tag:'추천', level:'N3' },
  { id:7, title:'悪食',       titleKr:'악식',     artist:'pompadols', tag:'신규', level:'N3' },
  { id:8, title:'Sparkle',   titleKr:'스파클',   artist:'RADWIMPS', tag:'인기', level:'N2' },
];

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

const LS_LIKES='kotonoha_song_likes', LS_BM='kotonoha_song_bookmarks';
const LS_FAVS='kotonoha_favs', LS_KANJI='kotonoha_kanji_done';
let songLikes=JSON.parse(localStorage.getItem(LS_LIKES)||'[]');
let songBMs  =JSON.parse(localStorage.getItem(LS_BM)||'[]');

// ── 오늘의 카드 (단어 or 한자) ──
const todayWords=[
  {word:'美しい',reading:'うつくしい · utsukushii',meaning:'아름답다, 예쁘다',level:'N3', example:'美しい景色に感動しました。', ex_ko:'아름다운 경치에 감동했습니다.'},
  {word:'夢',    reading:'ゆめ · yume',             meaning:'꿈',              level:'N4', example:'私の夢は歌手になることです。', ex_ko:'제 꿈은 가수가 되는 것입니다.'},
  {word:'輝く',  reading:'かがやく · kagayaku',     meaning:'빛나다, 반짝이다',level:'N3', example:'夜空に星が輝いています。', ex_ko:'밤하늘에 별이 반짝이고 있습니다.'},
  {word:'懐かしい',reading:'なつかしい · natsukashii',meaning:'그립다, 옛날 생각이 나다',level:'N2', example:'昔の写真を見ると懐かしい気分になる。', ex_ko:'옛날 사진을 보면 그리운 기분이 든다.'},
  {word:'切ない',reading:'せつない · setsunai',      meaning:'가슴이 아프다, 애틋하다',level:'N2', example:'秋の風が吹くと、少し切ない。', ex_ko:'가을바람이 불면 조금 애틋하다.'},
  {word:'儚い',  reading:'はかない · hakanai',       meaning:'덧없다, 무상하다',level:'N1', example:'人の命は儚いものだ。', ex_ko:'사람의 목숨은 덧없는 것이다.'},
  {word:'勇気',  reading:'ゆうき · yūki',            meaning:'용기',            level:'N4', example:'勇気があれば、何でもできます。', ex_ko:'용기가 있다면 무엇이든 할 수 있습니다.'},
];
(function(){
  const todayCardMode = settings.todayCardMode || 'word';
  const day = new Date().getDate();

  const exEl = document.getElementById('todayExample');

  if (todayCardMode === 'kanji' && typeof kanjiDB !== 'undefined') {
    const allKanji = [];
    for (const lvl in kanjiDB) {
      allKanji.push(...kanjiDB[lvl].map(k => ({...k, level: lvl})));
    }
    const kItem = allKanji[day % allKanji.length];
    
    document.querySelector('.today-label').textContent = "TODAY'S KANJI";
    document.getElementById('todayWord').textContent = kItem.k;
    
    const reading = [];
    if(kItem.on) reading.push(kItem.on);
    if(kItem.kun) reading.push(kItem.kun);
    document.getElementById('todayReading').textContent = reading.join(' · ');
    
    const meaning = [];
    if(kItem.kr) meaning.push(`[${kItem.kr}]`);
    if(kItem.meaning) meaning.push(kItem.meaning);
    document.getElementById('todayMeaning').textContent = meaning.join(' ');
    
    document.getElementById('todayLevel').textContent = kItem.level;
    if(exEl) exEl.textContent = '';
    document.querySelector('.today-banner').onclick = () => location.href = 'kanji.html';
  } else {
    const tw=todayWords[day % todayWords.length];
    document.querySelector('.today-label').textContent = "TODAY'S WORD";
    document.getElementById('todayWord').textContent   =tw.word;
    document.getElementById('todayReading').textContent=tw.reading;
    document.getElementById('todayMeaning').textContent=tw.meaning;
    document.getElementById('todayLevel').textContent  =tw.level;
    if(exEl) exEl.innerHTML = `${tw.example}<br><span style="opacity:0.85;font-size:0.82rem">[${tw.ex_ko}]</span>`;
    document.querySelector('.today-banner').onclick = () => location.href = 'jlpt.html';
  }
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

// ── 아티스트 데이터 ──
const artistData = [
  { name:'DISH//',    initial:'D',  gradient:'linear-gradient(135deg,#d4a017,#f7c948)', songs:[1,5] },
  { name:'Yorushika', initial:'Y',  gradient:'linear-gradient(135deg,#6e48aa,#9d50bb)', songs:[4,6] },
  { name:'King Gnu',  initial:'K',  gradient:'linear-gradient(135deg,#2c3e50,#3498db)', songs:[3] },
  { name:'pompadols', initial:'P',  gradient:'linear-gradient(135deg,#e74c3c,#f39c12)', songs:[7] },
  { name:'RADWIMPS',  initial:'R',  gradient:'linear-gradient(135deg,#e67e22,#e74c3c)', songs:[8] },
];
const LS_FAV_ARTISTS='kotonoha_fav_artists';
let favArtists=JSON.parse(localStorage.getItem(LS_FAV_ARTISTS)||'[]');

// ── 노래 카드 HTML ──
function songCardHTML(s, i){
  const bm=songBMs.includes(s.id);
  return `<a href="player.html?song=${s.id}" class="song-item">
    <span class="song-num">${String(i+1).padStart(2,'0')}</span>
    <div class="song-info">
      <div class="song-title">${s.title} (${s.titleKr})</div>
      <div class="song-artist">${s.artist}</div>
    </div>
    <div class="song-actions" onclick="event.preventDefault();event.stopPropagation()">
      <button class="song-bm-btn${bm?' on':''}" onclick="toggleBookmark(${s.id},this)" title="북마크"><span class="material-symbols-outlined${bm?' ms-filled':''}" style="font-size:1.1rem">bookmark</span></button>
      <button class="song-music-btn" onclick="openMusicPopup(event,${s.id})" title="음악 듣기"><span class="material-symbols-outlined" style="font-size:1.1rem">headphones</span></button>
    </div>
    <div style="display:flex; gap:6px; align-items:center;">
      ${s.level ? `<span class="song-tag" style="color:var(--accent-gold); border-color:var(--accent-gold); font-weight:700">${s.level}</span>` : ''}
      <span class="song-tag">${s.tag}</span>
    </div>
  </a>`;
}

// ── 미리보기 렌더 ──
function renderPreviews(){
  const popular=homeSongs.filter(s=>s.tag==='인기'||s.tag==='추천');
  const newest =homeSongs.filter(s=>s.tag==='신규');

  const pp=document.getElementById('previewPopular');
  if(pp) pp.innerHTML = popular.slice(0,2).map((s,i)=>songCardHTML(s,i)).join('');

  const pn=document.getElementById('previewNew');
  if(pn) pn.innerHTML = newest.slice(0,2).map((s,i)=>songCardHTML(s,i)).join('');

  renderArtistGrid();
}

// ── 전체 리스트 렌더 ──
function renderSongList(list){
  const el=document.getElementById('songListHome');
  const nr=document.getElementById('songNoResult');
  if(!list.length){el.innerHTML='';nr.style.display='block';return;}
  nr.style.display='none';
  el.innerHTML=list.map((s,i)=>songCardHTML(s,i)).join('');
}

// ── 아티스트 그리드 ──
function renderArtistGrid(){
  const grid=document.getElementById('artistGrid');
  if(!grid) return;
  grid.innerHTML = artistData.map(a=>{
    const fav=favArtists.includes(a.name);
    return `<div class="artist-card">
      <a href="player.html?song=${a.songs[0]}" class="artist-img-wrap" style="background:${a.gradient}">
        <span class="artist-initial">${a.initial}</span>
      </a>
      <div class="artist-card-info">
        <span class="artist-card-name">${a.name}</span>
        <span class="artist-card-count">${a.songs.length}곡</span>
        <button class="artist-fav-btn${fav?' on':''}" onclick="toggleArtistFav('${a.name}',this)" title="즐겨찾기">
          <span class="material-symbols-outlined${fav?' ms-filled':''}" style="font-size:1rem">favorite</span>
        </button>
      </div>
    </div>`;
  }).join('');
}

function toggleArtistFav(name,btn){
  const idx=favArtists.indexOf(name);
  if(idx>=0)favArtists.splice(idx,1); else favArtists.push(name);
  localStorage.setItem(LS_FAV_ARTISTS,JSON.stringify(favArtists));
  const on=favArtists.includes(name);
  const icon=btn.querySelector('.material-symbols-outlined');
  if(icon) icon.classList.toggle('ms-filled',on);
  btn.classList.toggle('on',on);
}

// ── 북마크 ──
function toggleBookmark(id,btn){
  const idx=songBMs.indexOf(id);
  if(idx>=0)songBMs.splice(idx,1); else songBMs.push(id);
  localStorage.setItem(LS_BM,JSON.stringify(songBMs));
  const on=songBMs.includes(id);
  const icon=btn.querySelector('.material-symbols-outlined'); if(icon){icon.classList.toggle('ms-filled',on);} btn.classList.toggle('on',on);
  refreshStats();
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

// ── 탭 전환 ──
let currentMusicTab='popular';
function showMusicTab(tab){
  currentMusicTab=tab;
  // 탭 버튼 활성화
  document.querySelectorAll('.music-tab').forEach(t=>t.classList.remove('active'));
  const base=tab.replace('-all','');
  document.querySelectorAll('.music-tab').forEach(t=>{
    if((base==='popular'&&t.textContent.includes('인기'))||(base==='new'&&t.textContent.includes('최신'))||(base==='artist'&&t.textContent.includes('가수')))
      t.classList.add('active');
  });
  // 패널 전환
  ['popular','new','artist','full'].forEach(p=>{
    const el=document.getElementById('panel-'+p);
    if(el) el.style.display='none';
  });
  if(tab==='popular-all'){
    document.getElementById('panel-full').style.display='block';
    document.getElementById('fullListLabel').innerHTML='<span class="material-symbols-outlined" style="font-size:1rem;color:var(--accent-gold);vertical-align:-2px">local_fire_department</span> 인기 · 추천 곡';
    renderSongList(homeSongs.filter(s=>s.tag==='인기'||s.tag==='추천'));
  } else if(tab==='new-all'){
    document.getElementById('panel-full').style.display='block';
    document.getElementById('fullListLabel').innerHTML='<span class="material-symbols-outlined" style="font-size:1rem;color:var(--accent-gold);vertical-align:-2px">new_releases</span> 최신 곡';
    renderSongList(homeSongs.filter(s=>s.tag==='신규'));
  } else {
    document.getElementById('panel-'+tab).style.display='block';
  }
  // 바로가기 링크 업데이트
  const gotoLink=document.getElementById('playerGotoLink');
  const gotoTitle=document.getElementById('gotoTitle');
  const gotoDesc=document.getElementById('gotoDesc');
  if(gotoLink&&gotoTitle&&gotoDesc){
    if(base==='popular'){
      gotoTitle.textContent='인기 곡 바로가기'; gotoDesc.textContent='인기 · 추천 곡 가사 학습하기';
      gotoLink.href='player.html?filter=popular';
    } else if(base==='new'){
      gotoTitle.textContent='최신 곡 바로가기'; gotoDesc.textContent='최신 곡 가사 학습하기';
      gotoLink.href='player.html?filter=new';
    } else {
      gotoTitle.textContent='전체 곡 바로가기'; gotoDesc.textContent='전체 노래 가사 학습하기';
      gotoLink.href='player.html';
    }
  }
}

// ── 즐겨찾기 모달 ──
function openFavModal(){renderFavModal();document.getElementById('favModal').classList.add('open');}
function renderFavModal(){
  const body=document.getElementById('favModalBody');
  const favs=JSON.parse(localStorage.getItem(LS_FAVS)||'[]');
  const limit=parseInt(localStorage.getItem('kotonoha_fav_limit')||'50');
  if(!favs.length){
    body.innerHTML='<div class="modal-empty"><div class="big"><span class="material-symbols-outlined" style="font-size:2.5rem">star</span></div>아직 즐겨찾기한 단어가 없어요.<br><small>가사 학습에서 단어를 클릭해 추가해보세요!</small></div>';
  } else {
    body.innerHTML=`<div style="font-size:0.75rem;color:var(--muted);margin-bottom:10px;">${favs.length} / ${limit}개</div>`+
      favs.map((f,i)=>`<div class="fav-item">
        <div class="fav-jp">${f.word}</div>
        <div class="fav-info">
          <div class="fav-reading">${f.reading||''}</div>
          <div class="fav-meaning">${Array.isArray(f.meanings)?f.meanings.join(' · '):(f.meaning||'')}</div>
        </div>
        <button class="fav-delete" onclick="deleteFav(${i})" title="삭제"><span class="material-symbols-outlined" style="font-size:1rem">delete</span></button>
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
    body.innerHTML='<div class="modal-empty"><div class="big"><span class="material-symbols-outlined" style="font-size:2.5rem">menu_book</span></div>아직 완료한 한자가 없어요.<br><small>한자 탭에서 학습 완료 체크를 해보세요!</small></div>';
  } else {
    body.innerHTML=`<div style="margin-bottom:10px;font-size:0.78rem;color:var(--muted);">총 ${done.length}자 완료</div><div class="kanji-grid">`+
      done.map(k=>`<div class="kanji-item" title="${k}">${k}</div>`).join('')+'</div>';
  }
  document.getElementById('kanjiModal').classList.add('open');
}
function closeModal(id){document.getElementById(id).classList.remove('open');}
document.addEventListener('keydown',e=>{if(e.key==='Escape'){closeModal('favModal');closeModal('kanjiModal');}});

window.onload=function(){ refreshStats(); renderPreviews(); };
