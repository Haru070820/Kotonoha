import React, { useState } from 'react';
import styles from './Kana.module.css';
import { useTTS } from '../hooks/useTTS';
import { MdClose, MdVolumeUp } from 'react-icons/md';

const kanaData = {
  vowels: [
    { hira: 'あ', kata: 'ア', romaji: 'a' }, { hira: 'い', kata: 'イ', romaji: 'i' },
    { hira: 'う', kata: 'ウ', romaji: 'u' }, { hira: 'え', kata: 'エ', romaji: 'e' }, { hira: 'お', kata: 'オ', romaji: 'o' },
  ],
  rows: [
    [ { hira: 'か', kata: 'カ', romaji: 'ka' }, { hira: 'き', kata: 'キ', romaji: 'ki' }, { hira: 'く', kata: 'ク', romaji: 'ku' }, { hira: 'け', kata: 'ケ', romaji: 'ke' }, { hira: 'こ', kata: 'コ', romaji: 'ko' } ],
    [ { hira: 'さ', kata: 'サ', romaji: 'sa' }, { hira: 'し', kata: 'シ', romaji: 'shi' }, { hira: 'す', kata: 'ス', romaji: 'su' }, { hira: 'せ', kata: 'セ', romaji: 'se' }, { hira: 'そ', kata: 'ソ', romaji: 'so' } ],
    [ { hira: 'た', kata: 'タ', romaji: 'ta' }, { hira: 'ち', kata: 'チ', romaji: 'chi' }, { hira: 'つ', kata: 'ツ', romaji: 'tsu' }, { hira: 'て', kata: 'テ', romaji: 'te' }, { hira: 'と', kata: 'ト', romaji: 'to' } ],
    [ { hira: 'な', kata: 'ナ', romaji: 'na' }, { hira: 'に', kata: 'ニ', romaji: 'ni' }, { hira: 'ぬ', kata: 'ヌ', romaji: 'nu' }, { hira: 'ね', kata: 'ネ', romaji: 'ne' }, { hira: 'の', kata: 'ノ', romaji: 'no' } ],
    [ { hira: 'は', kata: 'ハ', romaji: 'ha' }, { hira: 'ひ', kata: 'ヒ', romaji: 'hi' }, { hira: 'ふ', kata: 'フ', romaji: 'fu' }, { hira: 'へ', kata: 'ヘ', romaji: 'he' }, { hira: 'ほ', kata: 'ホ', romaji: 'ho' } ],
    [ { hira: 'ま', kata: 'マ', romaji: 'ma' }, { hira: 'み', kata: 'ミ', romaji: 'mi' }, { hira: 'む', kata: 'ム', romaji: 'mu' }, { hira: 'め', kata: 'メ', romaji: 'me' }, { hira: 'も', kata: 'モ', romaji: 'mo' } ],
    [ { hira: 'や', kata: 'ヤ', romaji: 'ya' }, { hira: '', kata: '', romaji: '' }, { hira: 'ゆ', kata: 'ユ', romaji: 'yu' }, { hira: '', kata: '', romaji: '' }, { hira: 'よ', kata: 'ヨ', romaji: 'yo' } ],
    [ { hira: 'ら', kata: 'ラ', romaji: 'ra' }, { hira: 'り', kata: 'リ', romaji: 'ri' }, { hira: 'る', kata: 'ル', romaji: 'ru' }, { hira: 'れ', kata: 'レ', romaji: 're' }, { hira: 'ろ', kata: 'ロ', romaji: 'ro' } ],
    [ { hira: 'わ', kata: 'ワ', romaji: 'wa' }, { hira: '', kata: '', romaji: '' }, { hira: '', kata: '', romaji: '' }, { hira: '', kata: '', romaji: '' }, { hira: 'を', kata: 'ヲ', romaji: 'wo' } ],
    [ { hira: 'ん', kata: 'ン', romaji: 'n' }, { hira: '', kata: '', romaji: '' }, { hira: '', kata: '', romaji: '' }, { hira: '', kata: '', romaji: '' }, { hira: '', kata: '', romaji: '' } ],
  ],
  dakuten: [
    [ { hira: 'が', kata: 'ガ', romaji: 'ga' }, { hira: 'ぎ', kata: 'ギ', romaji: 'gi' }, { hira: 'ぐ', kata: 'グ', romaji: 'gu' }, { hira: 'げ', kata: 'ゲ', romaji: 'ge' }, { hira: 'ご', kata: 'ゴ', romaji: 'go' } ],
    [ { hira: 'ざ', kata: 'ザ', romaji: 'za' }, { hira: 'じ', kata: 'ジ', romaji: 'ji' }, { hira: 'ず', kata: 'ズ', romaji: 'zu' }, { hira: 'ぜ', kata: 'ゼ', romaji: 'ze' }, { hira: 'ぞ', kata: 'ゾ', romaji: 'zo' } ],
    [ { hira: 'だ', kata: 'ダ', romaji: 'da' }, { hira: 'ぢ', kata: 'ヂ', romaji: 'di' }, { hira: 'づ', kata: 'ヅ', romaji: 'du' }, { hira: 'で', kata: 'デ', romaji: 'de' }, { hira: 'ど', kata: 'ド', romaji: 'do' } ],
    [ { hira: 'ば', kata: 'バ', romaji: 'ba' }, { hira: 'び', kata: 'ビ', romaji: 'bi' }, { hira: 'ぶ', kata: 'ブ', romaji: 'bu' }, { hira: 'べ', kata: 'ベ', romaji: 'be' }, { hira: 'ぼ', kata: 'ボ', romaji: 'bo' } ],
    [ { hira: 'ぱ', kata: 'パ', romaji: 'pa' }, { hira: 'ぴ', kata: 'ピ', romaji: 'pi' }, { hira: 'ぷ', kata: 'プ', romaji: 'pu' }, { hira: 'ぺ', kata: 'ペ', romaji: 'pe' }, { hira: 'ぽ', kata: 'ポ', romaji: 'po' } ],
  ]
};

export default function Kana() {
  const [mode, setMode] = useState<'hira' | 'kata' | 'both'>('hira');
  const [selected, setSelected] = useState<any>(null);
  const { speak } = useTTS();

  const renderCard = (item: any, idx: number) => {
    if (!item.hira && !item.kata) return <div key={idx} className={`${styles.kanaCard} ${styles.empty}`}></div>;
    const main = mode === 'kata' ? item.kata : item.hira;
    
    return (
      <div key={idx} className={styles.kanaCard} onClick={() => setSelected(item)}>
        <span className={styles.kanaMain}>{mode === 'both' ? item.hira : main}</span>
        {mode === 'both' && <span className={styles.kanaOther}>{item.kata}</span>}
        <span className={styles.kanaSub}>{item.romaji}</span>
      </div>
    );
  };

  const renderGrid = (items: any[], keyPrefix: string) => (
    <div className={styles.kanaGrid} key={keyPrefix}>
      {items.map((item, idx) => renderCard(item, idx))}
    </div>
  );

  return (
    <div className="container" style={{maxWidth: 800}}>
      <div className={styles.toggleBar}>
        <button className={`${styles.toggleBtn} ${mode==='hira' ? styles.active : ''}`} onClick={() => setMode('hira')}>히라가나</button>
        <button className={`${styles.toggleBtn} ${mode==='kata' ? styles.active : ''}`} onClick={() => setMode('kata')}>가타카나</button>
        <button className={`${styles.toggleBtn} ${mode==='both' ? styles.active : ''}`} onClick={() => setMode('both')}>모두</button>
      </div>

      <div className={styles.rowLabel}>모음 · Vowels</div>
      {renderGrid(kanaData.vowels, 'vowels')}

      <div className={styles.rowLabel}>자음행 · Consonant Rows</div>
      {kanaData.rows.map((row, idx) => renderGrid(row, `row-${idx}`))}

      <hr className={styles.sectionDivider} />
      <div className={styles.sectionHead}>탁음 · 반탁음 <span className={styles.badge}>濁音 · 半濁音</span></div>
      {kanaData.dakuten.map((row, idx) => renderGrid(row, `dakuten-${idx}`))}

      {/* Modal */}
      {selected && (
        <div className={styles.modalOverlay} onClick={() => setSelected(null)}>
          <div className={styles.modal} onClick={e => e.stopPropagation()}>
            <button className={styles.modalClose} onClick={() => setSelected(null)}><MdClose /></button>
            
            <div className={styles.modalKana}>{mode === 'kata' ? selected.kata : selected.hira || selected.hira}</div>
            <div className={styles.modalRomaji}>{selected.romaji.toUpperCase()}</div>
            
            <div style={{marginTop: 12}}>
              <button 
                onClick={() => speak(mode === 'kata' ? selected.kata : selected.hira)}
                style={{
                  background:'none', border:'1px solid var(--border)', borderRadius:8, 
                  padding:'6px 16px', color:'var(--muted)', cursor:'pointer'
                }}
              >
                <MdVolumeUp size={24} style={{verticalAlign: 'middle'}}/> 발음 듣기
              </button>
            </div>

            <div className={styles.modalPair}>
              <div className={styles.modalPairItem}>
                <label>히라가나</label>
                <span>{selected.hira || '-'}</span>
              </div>
              <div className={styles.modalPairItem}>
                <label>가타카나</label>
                <span>{selected.kata || '-'}</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
