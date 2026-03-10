const kanaData = {
  vowels: [
    { hira: 'あ', kata: 'ア', romaji: 'a' },
    { hira: 'い', kata: 'イ', romaji: 'i' },
    { hira: 'う', kata: 'ウ', romaji: 'u' },
    { hira: 'え', kata: 'エ', romaji: 'e' },
    { hira: 'お', kata: 'オ', romaji: 'o' },
  ],
  rows: [
    [
      { hira: 'か', kata: 'カ', romaji: 'ka' }, { hira: 'き', kata: 'キ', romaji: 'ki' },
      { hira: 'く', kata: 'ク', romaji: 'ku' }, { hira: 'け', kata: 'ケ', romaji: 'ke' }, { hira: 'こ', kata: 'コ', romaji: 'ko' }
    ],
    [
      { hira: 'さ', kata: 'サ', romaji: 'sa' }, { hira: 'し', kata: 'シ', romaji: 'shi' },
      { hira: 'す', kata: 'ス', romaji: 'su' }, { hira: 'せ', kata: 'セ', romaji: 'se' }, { hira: 'そ', kata: 'ソ', romaji: 'so' }
    ],
    [
      { hira: 'た', kata: 'タ', romaji: 'ta' }, { hira: 'ち', kata: 'チ', romaji: 'chi' },
      { hira: 'つ', kata: 'ツ', romaji: 'tsu' }, { hira: 'て', kata: 'テ', romaji: 'te' }, { hira: 'と', kata: 'ト', romaji: 'to' }
    ],
    [
      { hira: 'な', kata: 'ナ', romaji: 'na' }, { hira: 'に', kata: 'ニ', romaji: 'ni' },
      { hira: 'ぬ', kata: 'ヌ', romaji: 'nu' }, { hira: 'ね', kata: 'ネ', romaji: 'ne' }, { hira: 'の', kata: 'ノ', romaji: 'no' }
    ],
    [
      { hira: 'は', kata: 'ハ', romaji: 'ha' }, { hira: 'ひ', kata: 'ヒ', romaji: 'hi' },
      { hira: 'ふ', kata: 'フ', romaji: 'fu' }, { hira: 'へ', kata: 'ヘ', romaji: 'he' }, { hira: 'ほ', kata: 'ホ', romaji: 'ho' }
    ],
    [
      { hira: 'ま', kata: 'マ', romaji: 'ma' }, { hira: 'み', kata: 'ミ', romaji: 'mi' },
      { hira: 'む', kata: 'ム', romaji: 'mu' }, { hira: 'め', kata: 'メ', romaji: 'me' }, { hira: 'も', kata: 'モ', romaji: 'mo' }
    ],
    [
      { hira: 'や', kata: 'ヤ', romaji: 'ya' }, { hira: '', kata: '', romaji: '' },
      { hira: 'ゆ', kata: 'ユ', romaji: 'yu' }, { hira: '', kata: '', romaji: '' }, { hira: 'よ', kata: 'ヨ', romaji: 'yo' }
    ],
    [
      { hira: 'ら', kata: 'ラ', romaji: 'ra' }, { hira: 'り', kata: 'リ', romaji: 'ri' },
      { hira: 'る', kata: 'ル', romaji: 'ru' }, { hira: 'れ', kata: 'レ', romaji: 're' }, { hira: 'ろ', kata: 'ロ', romaji: 'ro' }
    ],
    [
      { hira: 'わ', kata: 'ワ', romaji: 'wa' }, { hira: '', kata: '', romaji: '' },
      { hira: '', kata: '', romaji: '' }, { hira: '', kata: '', romaji: '' }, { hira: 'を', kata: 'ヲ', romaji: 'wo' }
    ],
    [
      { hira: 'ん', kata: 'ン', romaji: 'n' }, { hira: '', kata: '', romaji: '' },
      { hira: '', kata: '', romaji: '' }, { hira: '', kata: '', romaji: '' }, { hira: '', kata: '', romaji: '' }
    ],
  ],
  dakuten: [
    [
      { hira: 'が', kata: 'ガ', romaji: 'ga' }, { hira: 'ぎ', kata: 'ギ', romaji: 'gi' },
      { hira: 'ぐ', kata: 'グ', romaji: 'gu' }, { hira: 'げ', kata: 'ゲ', romaji: 'ge' }, { hira: 'ご', kata: 'ゴ', romaji: 'go' }
    ],
    [
      { hira: 'ざ', kata: 'ザ', romaji: 'za' }, { hira: 'じ', kata: 'ジ', romaji: 'ji' },
      { hira: 'ず', kata: 'ズ', romaji: 'zu' }, { hira: 'ぜ', kata: 'ゼ', romaji: 'ze' }, { hira: 'ぞ', kata: 'ゾ', romaji: 'zo' }
    ],
    [
      { hira: 'だ', kata: 'ダ', romaji: 'da' }, { hira: 'ぢ', kata: 'ヂ', romaji: 'di' },
      { hira: 'づ', kata: 'ヅ', romaji: 'du' }, { hira: 'で', kata: 'デ', romaji: 'de' }, { hira: 'ど', kata: 'ド', romaji: 'do' }
    ],
    [
      { hira: 'ば', kata: 'バ', romaji: 'ba' }, { hira: 'び', kata: 'ビ', romaji: 'bi' },
      { hira: 'ぶ', kata: 'ブ', romaji: 'bu' }, { hira: 'べ', kata: 'ベ', romaji: 'be' }, { hira: 'ぼ', kata: 'ボ', romaji: 'bo' }
    ],
    [
      { hira: 'ぱ', kata: 'パ', romaji: 'pa' }, { hira: 'ぴ', kata: 'ピ', romaji: 'pi' },
      { hira: 'ぷ', kata: 'プ', romaji: 'pu' }, { hira: 'ぺ', kata: 'ペ', romaji: 'pe' }, { hira: 'ぽ', kata: 'ポ', romaji: 'po' }
    ],
  ]
};

let mode = 'hira';

function switchMode(m) {
  mode = m;
  ['hira','kata','both'].forEach(id => {
    document.getElementById('btn-' + id).classList.toggle('active', id === m);
  });
  renderAll();
}

function renderCard(item) {
  if (!item.hira && !item.kata) return `<div class="kana-card empty"></div>`;
  const main = mode === 'kata' ? item.kata : item.hira;
  const other = mode === 'kata' ? item.hira : item.kata;
  const showBoth = mode === 'both';
  return `
    <div class="kana-card" onclick='openModal(${JSON.stringify(item)})'>
      <span class="kana-main">${showBoth ? item.hira : main}</span>
      ${showBoth ? `<span class="kana-other">${item.kata}</span>` : ''}
      <span class="kana-sub">${item.romaji}</span>
    </div>
  `;
}

function renderGrid(items) {
  return `<div class="kana-grid">${items.map(renderCard).join('')}</div>`;
}

function renderAll() {
  const content = document.getElementById('kanaContent');
  let html = '';

  html += `<div class="row-label">모음 · Vowels</div>`;
  html += renderGrid(kanaData.vowels);

  html += `<div class="row-label">자음행 · Consonant Rows</div>`;
  kanaData.rows.forEach(row => {
    html += renderGrid(row);
  });

  html += `<hr class="section-divider">`;
  html += `<div class="section-head">탁음 · 반탁음 <span class="badge">濁音 · 半濁音</span></div>`;
  kanaData.dakuten.forEach(row => {
    html += renderGrid(row);
  });

  content.innerHTML = html;
}

function openModal(item) {
  const main = mode === 'kata' ? item.kata : item.hira;
  document.getElementById('modalMain').textContent = main || item.hira;
  document.getElementById('modalRomaji').textContent = item.romaji.toUpperCase();
  document.getElementById('modalHira').textContent = item.hira || '-';
  document.getElementById('modalKata').textContent = item.kata || '-';
  // TTS 버튼 삽입
  const ttsEl = document.getElementById('modalTtsBtn');
  if (ttsEl) ttsEl.innerHTML = ttsBtn(main || item.hira, 'kana-tts');
  document.getElementById('modalOverlay').classList.add('open');
}

function closeModal(e) {
  if (!e || e.target === document.getElementById('modalOverlay') || e.currentTarget.classList.contains('modal-close')) {
    document.getElementById('modalOverlay').classList.remove('open');
  }
}

window.onload = renderAll;