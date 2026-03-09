// ── 설정 로드 + 다크모드 즉시 적용 ──
const settings = JSON.parse(localStorage.getItem('kotonoha_settings') || '{}');
if (settings.darkMode) document.body.classList.add('dark');

// ── 초기 UI 반영 ──
window.onload = function () {
  document.getElementById('sw-dark').checked     = !!settings.darkMode;
  document.getElementById('sw-yomigana').checked = settings.yomigana !== false;
  document.getElementById('sw-romaji').checked   = settings.romaji   !== false;
  document.getElementById('sw-korean').checked   = settings.korean   !== false;
  updateFavLimitDisplay();
  renderDataChips();
};

// ── 설정 저장 헬퍼 ──
function saveSetting(key, val) {
  const s = JSON.parse(localStorage.getItem('kotonoha_settings') || '{}');
  s[key] = val;
  localStorage.setItem('kotonoha_settings', JSON.stringify(s));
  showSaved();
}

// ── 다크모드 즉시 반영 ──
function applyDark(on) {
  document.body.classList.toggle('dark', on);
}

// ── 즐겨찾기 제한 ──
function getFavLimit() {
  return parseInt(localStorage.getItem('kotonoha_fav_limit') || '50');
}
function updateFavLimitDisplay() {
  const limit = getFavLimit();
  document.getElementById('favLimitDisplay').textContent = limit;
  // 활성 세그먼트 표시
  document.querySelectorAll('.segment-btn').forEach(btn => {
    btn.classList.toggle('active', parseInt(btn.textContent) === limit);
  });
}
function changeFavLimit(delta) {
  let limit = getFavLimit() + delta;
  if (limit < 10) limit = 10;
  if (limit > 500) limit = 500;
  setFavLimit(limit);
}
function setFavLimit(val) {
  localStorage.setItem('kotonoha_fav_limit', String(val));
  updateFavLimitDisplay();
  showSaved();
}

// ── 데이터 통계 ──
function renderDataChips() {
  const favs    = JSON.parse(localStorage.getItem('kotonoha_favs')          || '[]');
  const kanji   = JSON.parse(localStorage.getItem('kotonoha_kanji_done')    || '[]');
  const likes   = JSON.parse(localStorage.getItem('kotonoha_song_likes')    || '[]');
  const bms     = JSON.parse(localStorage.getItem('kotonoha_song_bookmarks')|| '[]');
  document.getElementById('dataChips').innerHTML = `
    <div class="data-chip">즐겨찾기 단어 <strong>${favs.length}개</strong></div>
    <div class="data-chip">완료 한자 <strong>${kanji.length}자</strong></div>
    <div class="data-chip">좋아요 노래 <strong>${likes.length}곡</strong></div>
    <div class="data-chip">북마크 노래 <strong>${bms.length}곡</strong></div>
  `;
}

// ── 데이터 초기화 ──
function clearData(key, label) {
  if (!confirm(`${label}를 모두 삭제할까요?\n이 작업은 되돌릴 수 없습니다.`)) return;
  localStorage.removeItem(key);
  renderDataChips();
  showSaved('삭제 완료');
}
function clearLikesBM() {
  if (!confirm('좋아요와 북마크를 모두 삭제할까요?')) return;
  localStorage.removeItem('kotonoha_song_likes');
  localStorage.removeItem('kotonoha_song_bookmarks');
  renderDataChips();
  showSaved('삭제 완료');
}

// ── 저장 피드백 ──
function showSaved(msg) {
  const el = document.getElementById('saveStatus');
  el.textContent = msg || '✓ 자동 저장됨';
  el.className = 'save-status saved';
  clearTimeout(window._saveTimer);
  window._saveTimer = setTimeout(() => {
    el.textContent = '변경 사항이 자동 저장됩니다';
    el.className = 'save-status';
  }, 2000);
}
