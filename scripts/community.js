// ── 설정 로드 ──
const settings = JSON.parse(localStorage.getItem('kotonoha_settings') || '{}');
if (settings.darkMode) document.body.classList.add('dark');

// ── 상수 ──
const LS_POSTS = 'kotonoha_community_posts';
const BADGE_MAP = { question:'질문', share:'공유', tip:'팁', request:'요청' };
const BADGE_COLOR = { question:'badge-question', share:'badge-share', tip:'badge-tip', request:'badge-request' };

// ── 샘플 데이터 (첫 방문 시 삽입) ──
const samplePosts = [
  { id:1, type:'tip', title:'「は」와 「が」의 차이점 — 주어를 나타내는 두 조사', body:'「は」는 이미 알고 있는 주제를 제시할 때, 「が」는 새로운 정보나 강조할 때 사용해요.\n\n例) 「私は学生です」→ "나는 학생입니다" (나라는 주제 제시)\n「誰が来ましたか？」→ "누가 왔어요?" (누구인지 강조)\n\n노래 가사에서도 이 차이를 주의 깊게 보면 뉘앙스가 달라져요!', author:'운영자', date:'2025-01-10', tags:['문법','N5','팁'], likes:28, comments:[] },
  { id:2, type:'tip', title:'일상생활에서 자주 쓰이는 일본어 표현 모음', body:'매일 쓰는 기본 표현을 정리했어요!\n\n① いただきます — 잘 먹겠습니다\n② ごちそうさま — 잘 먹었습니다\n③ お疲れ様です — 수고하셨습니다\n④ よろしくお願いします — 잘 부탁드립니다\n⑤ 大丈夫です — 괜찮습니다\n\n일본 드라마나 노래에서도 정말 자주 들리는 표현이에요.', author:'운영자', date:'2025-01-08', tags:['일상','N5','N4','팁'], likes:35, comments:[] },
  { id:3, type:'tip', title:'「～てしまう」와 「～ちゃう」 — 구어체 축약 패턴', body:'가사에서 자주 등장하는 「～てしまう」는 "~해버리다"라는 뜻으로, 후회나 완료의 뉘앙스가 있어요.\n\n구어체에서는 줄여서 「～ちゃう」로 쓰입니다.\n例) 忘れてしまう → 忘れちゃう (잊어버리다)\n食べてしまった → 食べちゃった (먹어버렸다)\n\n猫(고양이) 가사의 「飲み込んでしまった」도 같은 패턴이에요!', author:'운영자', date:'2025-01-06', tags:['문법','N4','N3','팁'], likes:22, comments:[] },
];

let posts = JSON.parse(localStorage.getItem(LS_POSTS) || 'null');
const POSTS_VERSION = 2; // bump to force refresh sample data
if (!posts || localStorage.getItem('kotonoha_posts_ver') !== String(POSTS_VERSION)) {
  posts = samplePosts;
  localStorage.setItem(LS_POSTS, JSON.stringify(posts));
  localStorage.setItem('kotonoha_posts_ver', String(POSTS_VERSION));
}

let currentTab = 'all';
let selectedType = 'question';
let currentPostId = null;

// ── 탭 전환 ──
function switchTab(tab, btn) {
  currentTab = tab;
  document.querySelectorAll('.comm-tab').forEach(t => t.classList.remove('active'));
  btn.classList.add('active');
  renderFeed();
}

// ── 피드 렌더 ──
function renderFeed() {
  const list = posts.filter(p => currentTab === 'all' || p.type === currentTab)
                    .sort((a,b) => b.id - a.id);
  const feed = document.getElementById('postFeed');
  if (!list.length) {
    feed.innerHTML = '<div style="text-align:center;padding:40px;color:var(--muted);">게시글이 없어요. 첫 글을 작성해보세요!</div>';
    return;
  }
  feed.innerHTML = list.map(p => `
    <div class="post-card" onclick="openDetail(${p.id})">
      <div class="post-top">
        <span class="post-badge ${BADGE_COLOR[p.type]}">${BADGE_MAP[p.type]}</span>
        <div class="post-title">${p.title}</div>
        ${p.author==='나' ? `<button class="post-delete-btn" onclick="event.stopPropagation();deletePost(${p.id})" title="삭제">삭제</button>` : ''}
      </div>
      <div class="post-preview">${p.body.slice(0,80)}${p.body.length>80?'…':''}</div>
      <div class="post-footer">
        <span class="post-stat"><span class="material-symbols-outlined" style="font-size:0.9rem;vertical-align:-2px">chat_bubble</span> ${p.comments.length}</span>
        <span class="post-stat"><span class="material-symbols-outlined ms-filled" style="font-size:0.9rem;vertical-align:-2px;color:#e74c3c">favorite</span> ${p.likes}</span>
        <span class="post-stat"><span class="material-symbols-outlined" style="font-size:0.9rem;vertical-align:-2px">schedule</span> ${p.date}</span>
        <span class="post-stat">by ${p.author}</span>
        <div class="post-tag-list">${p.tags.map(t=>`<span class="post-tag">${t}</span>`).join('')}</div>
      </div>
    </div>`).join('');
}

// ── 인기 태그 ──
function renderHotTags() {
  const tagCount = {};
  posts.forEach(p => p.tags.forEach(t => tagCount[t] = (tagCount[t]||0)+1));
  const sorted = Object.entries(tagCount).sort((a,b)=>b[1]-a[1]).slice(0,12);
  document.getElementById('hotTags').innerHTML = sorted
    .map(([tag]) => `<span class="hot-tag" onclick="filterTag('${tag}')">#${tag}</span>`).join('');
}
function filterTag(tag) {
  // 탭을 all로 리셋하고 태그로 필터링
  currentTab = 'all';
  document.querySelectorAll('.comm-tab').forEach(t=>t.classList.remove('active'));
  document.querySelector('.comm-tab').classList.add('active');
  const feed = document.getElementById('postFeed');
  const list = posts.filter(p=>p.tags.includes(tag)).sort((a,b)=>b.id-a.id);
  feed.innerHTML = `<div style="font-size:0.82rem;color:var(--muted);margin-bottom:12px;">#${tag} 태그 결과 ${list.length}건 <button onclick="renderFeed()" style="background:none;border:none;cursor:pointer;color:var(--accent-gold);font-size:0.82rem;">전체보기</button></div>`
    + list.map(p => `<div class="post-card" onclick="openDetail(${p.id})">
      <div class="post-top"><span class="post-badge ${BADGE_COLOR[p.type]}">${BADGE_MAP[p.type]}</span><div class="post-title">${p.title}</div></div>
      <div class="post-preview">${p.body.slice(0,80)}…</div>
      <div class="post-footer"><span class="post-stat"><span class="material-symbols-outlined ms-filled" style="font-size:0.9rem;vertical-align:-2px;color:#e74c3c">favorite</span> ${p.likes}</span><div class="post-tag-list">${p.tags.map(t=>`<span class="post-tag">${t}</span>`).join('')}</div></div>
    </div>`).join('');
}

// ── 인기 단어 ──
function renderRankWords() {
  const favs = JSON.parse(localStorage.getItem('kotonoha_favs')||'[]');
  const el = document.getElementById('rankWords');
  if (!favs.length) { el.innerHTML='<div style="font-size:0.8rem;color:var(--muted)">즐겨찾기한 단어가 없어요</div>'; return; }
  el.innerHTML = favs.slice(0,5).map((f,i)=>`
    <div class="rank-item">
      <span class="rank-num">${i+1}</span>
      <span class="rank-word">${f.word}</span>
      <span style="font-size:0.75rem;color:var(--muted);margin-left:auto">${f.meanings?.[0]||''}</span>
    </div>`).join('');
}

// ── 글 삭제 ──
function deletePost(id) {
  if (!confirm('이 글을 삭제할까요?')) return;
  posts = posts.filter(p => p.id !== id);
  localStorage.setItem(LS_POSTS, JSON.stringify(posts));
  // 상세 모달 열려있으면 닫기
  if (currentPostId === id) closeDetail();
  renderFeed();
  renderHotTags();
}

// ── 글쓰기 모달 ──
function openWriteModal() { document.getElementById('writeModal').classList.add('open'); }
function closeWriteModal() {
  document.getElementById('writeModal').classList.remove('open');
  document.getElementById('writeTitle').value = '';
  document.getElementById('writeBody').value  = '';
  document.getElementById('writeTags').value  = '';
}
function selectType(type, btn) {
  selectedType = type;
  document.querySelectorAll('.type-chip').forEach(c=>c.classList.remove('active'));
  btn.classList.add('active');
}
function submitPost() {
  const title = document.getElementById('writeTitle').value.trim();
  const body  = document.getElementById('writeBody').value.trim();
  const tags  = document.getElementById('writeTags').value.split(',').map(t=>t.trim()).filter(Boolean);
  if (!title) { alert('제목을 입력해주세요'); return; }
  if (!body)  { alert('내용을 입력해주세요'); return; }
  const now = new Date();
  const date = `${now.getFullYear()}-${String(now.getMonth()+1).padStart(2,'0')}-${String(now.getDate()).padStart(2,'0')}`;
  posts.unshift({ id: Date.now(), type:selectedType, title, body, author:'나', date, tags, likes:0, comments:[] });
  localStorage.setItem(LS_POSTS, JSON.stringify(posts));
  closeWriteModal();
  renderFeed();
  renderHotTags();
}

// ── 상세 모달 ──
function openDetail(id) {
  currentPostId = id;
  const p = posts.find(x=>x.id===id); if (!p) return;
  document.getElementById('detailBadge').textContent  = BADGE_MAP[p.type];
  document.getElementById('detailBadge').className    = `post-badge ${BADGE_COLOR[p.type]}`;
  document.getElementById('detailTitle').textContent  = p.title;
  document.getElementById('detailMeta').innerHTML     =
    `<span>by ${p.author}</span><span>${p.date}</span><span><span class="material-symbols-outlined ms-filled" style="font-size:0.9rem;vertical-align:-2px;color:#e74c3c">favorite</span> <b id="likeCount">${p.likes}</b> <button onclick="likePost(${id})" style="background:none;border:none;cursor:pointer;font-size:0.82rem;color:var(--accent-gold)">좋아요</button></span>${p.author==='나'?`<button class="post-delete-btn" onclick="closeDetail();deletePost(${id})">삭제</button>`:''}`;
  document.getElementById('detailBody').textContent   = p.body;
  renderComments(p);
  document.getElementById('detailModal').classList.add('open');
}
function closeDetail() {
  document.getElementById('detailModal').classList.remove('open');
  document.getElementById('commentInput').value = '';
  currentPostId = null;
}
function likePost(id) {
  const p = posts.find(x=>x.id===id); if(!p) return;
  p.likes++;
  localStorage.setItem(LS_POSTS, JSON.stringify(posts));
  document.getElementById('likeCount').textContent = p.likes;
  renderFeed();
}
function renderComments(p) {
  const el = document.getElementById('commentList');
  if (!p.comments.length) { el.innerHTML='<div style="font-size:0.82rem;color:var(--muted);padding:8px 0">첫 댓글을 남겨보세요!</div>'; return; }
  el.innerHTML = p.comments.map(c=>`
    <div class="comment-item">
      <div class="comment-author">${c.author}<span class="comment-time">${c.date}</span></div>
      <div class="comment-text">${c.text}</div>
    </div>`).join('');
}
function submitComment() {
  const text = document.getElementById('commentInput').value.trim();
  if (!text || !currentPostId) return;
  const p = posts.find(x=>x.id===currentPostId); if (!p) return;
  const now = new Date();
  const date = `${now.getMonth()+1}/${now.getDate()}`;
  p.comments.push({ author:'나', text, date });
  localStorage.setItem(LS_POSTS, JSON.stringify(posts));
  document.getElementById('commentInput').value = '';
  renderComments(p);
  renderFeed();
}

document.addEventListener('keydown', e => { if(e.key==='Escape'){closeWriteModal();closeDetail();} });

window.onload = function() {
  renderFeed();
  renderHotTags();
  renderRankWords();
};
