// Today's word
  const todayWords = [
    { word: '美しい', reading: 'うつくしい · utsukushii', meaning: '아름답다, 예쁘다', level: 'N3' },
    { word: '夢', reading: 'ゆめ · yume', meaning: '꿈', level: 'N4' },
    { word: '輝く', reading: 'かがやく · kagayaku', meaning: '빛나다, 반짝이다', level: 'N3' },
    { word: '懐かしい', reading: 'なつかしい · natsukashii', meaning: '그립다, 옛날 생각이 나다', level: 'N2' },
    { word: '切ない', reading: 'せつない · setsunai', meaning: '가슴이 아프다, 애틋하다', level: 'N2' },
    { word: '儚い', reading: 'はかない · hakanai', meaning: '덧없다, 무상하다', level: 'N1' },
    { word: '勇気', reading: 'ゆうき · yūki', meaning: '용기', level: 'N4' },
  ];
  const d = new Date(); const idx = d.getDate() % todayWords.length;
  const tw = todayWords[idx];
  document.getElementById('todayWord').textContent = tw.word;
  document.getElementById('todayReading').textContent = tw.reading;
  document.getElementById('todayMeaning').textContent = tw.meaning;
  document.getElementById('todayLevel').textContent = tw.level;

  // Stats from localStorage
  const favs = JSON.parse(localStorage.getItem('kotonoha_favs') || '[]');
  document.getElementById('favCount').textContent = favs.length;
  const kanjiDone = JSON.parse(localStorage.getItem('kotonoha_kanji_done') || '[]');
  document.getElementById('kanjiCount').textContent = kanjiDone.length;

  function openFavModal() {
    renderFavModal();
    document.getElementById('favModal').classList.add('open');
  }

  function renderFavModal() {
    const body = document.getElementById('favModalBody');
    const favs = JSON.parse(localStorage.getItem('kotonoha_favs') || '[]');
    if (favs.length === 0) {
      body.innerHTML = '<div class="modal-empty"><div class="big">☆</div>아직 즐겨찾기한 단어가 없어요.<br><small>가사 학습에서 단어를 클릭해 추가해보세요!</small></div>';
    } else {
      body.innerHTML = favs.map((f, i) => `
        <div class="fav-item" id="fav-item-${i}">
          <div class="fav-jp">${f.word}</div>
          <div class="fav-info">
            <div class="fav-reading">${f.reading || ''}</div>
            <div class="fav-meaning">${Array.isArray(f.meanings) ? f.meanings.join(' · ') : (f.meaning || '')}</div>
          </div>
          <button class="fav-delete" onclick="deleteFav(${i})" title="삭제">🗑️</button>
        </div>`).join('');
    }
    document.getElementById('favCount').textContent = favs.length;
  }

  function deleteFav(index) {
    const favs = JSON.parse(localStorage.getItem('kotonoha_favs') || '[]');
    favs.splice(index, 1);
    localStorage.setItem('kotonoha_favs', JSON.stringify(favs));
    renderFavModal();
  }

  function openKanjiModal() {
    const body = document.getElementById('kanjiModalBody');
    if (kanjiDone.length === 0) {
      body.innerHTML = '<div class="modal-empty"><div class="big">字</div>아직 완료한 한자가 없어요.<br><small>한자 탭에서 학습 완료 체크를 해보세요!</small></div>';
    } else {
      body.innerHTML = `<div style="margin-bottom:10px;font-size:0.78rem;color:var(--muted);">총 ${kanjiDone.length}자 완료</div><div class="kanji-grid">` +
        kanjiDone.map(k => `<div class="kanji-item" title="${k}">${k}</div>`).join('') +
        '</div>';
    }
    document.getElementById('kanjiModal').classList.add('open');
  }

  function closeModal(id) {
    document.getElementById(id).classList.remove('open');
  }

  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') {
      closeModal('favModal');
      closeModal('kanjiModal');
    }
  });