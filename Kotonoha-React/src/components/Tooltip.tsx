import React from 'react';
import styles from './Tooltip.module.css';
import { wordDB } from '../data/wordDB';
import { grammarDB } from '../data/grammarDB';
import { MdVolumeUp, MdStar, MdStarBorder, MdPushPin } from 'react-icons/md';

interface TooltipProps {
  x: number;
  y: number;
  word: string;
  type: 'word' | 'grammar';
  isPinned: boolean;
  isFav: boolean;
  onToggleFav: () => void;
  onTts: (text: string) => void;
}

export default function Tooltip({ x, y, word, type, isPinned, isFav, onToggleFav, onTts }: TooltipProps) {
  let content = null;

  if (type === 'word') {
    // @ts-ignore
    const data = wordDB[word] as any;
    if (!data) return null;
    
    content = (
      <>
        <div className={styles.ttHeader}>
          <div>
            <div className={styles.ttWord}>{data.word}</div>
            <div className={styles.ttKanji}>{data.kanji || ''}</div>
          </div>
          <button 
            className="tts-btn" 
            onClick={(e) => { e.stopPropagation(); onTts(data.kanji || data.word); }}
            style={{ color: 'var(--muted)', background: 'none', border: '1px solid var(--border)', borderRadius: 6, padding: '2px 4px', cursor: 'pointer' }}
          >
            <MdVolumeUp size={20} />
          </button>
        </div>
        <div className={styles.ttReading}>{data.reading.replace(' [', ' · ').replace(']', '')}</div>
        <div className={styles.ttDivider}></div>
        <ul className={styles.ttMeaning}>
          {data.meanings.map((m: string, i: number) => (
            <li key={i}>{i+1}. {m}</li>
          ))}
        </ul>
        <button className={`${styles.ttFavBtn} ${isFav ? styles.on : ''}`} onClick={(e) => { e.stopPropagation(); onToggleFav(); }}>
          {isFav ? <MdStar style={{verticalAlign: -2}} /> : <MdStarBorder style={{verticalAlign: -2}} />} 
          {isFav ? ' 즐겨찾기됨' : ' 즐겨찾기'}
        </button>
      </>
    );
  } else if (type === 'grammar') {
    // @ts-ignore
    const data = grammarDB[word] as any;
    if (!data) return null;

    content = (
      <>
        <div className={styles.ttHeader}>
          <div>
            <div className={styles.ttWord}>{word}</div>
            <div className={styles.ttKanji}>문법 요소</div>
          </div>
        </div>
        <div className={styles.ttReading}>{data.title}</div>
        <div className={styles.ttDivider}></div>
        <ul className={styles.ttMeaning}>
          <li>{data.desc}</li>
        </ul>
      </>
    );
  }

  // Adjust positioning to not overflow screen
  let finalX = x + 18;
  let finalY = y + 18;
  if (finalX + 280 > window.innerWidth) finalX = x - 280 - 8;
  if (finalY + 220 > window.innerHeight) finalY = y - 220 - 8;

  const style: React.CSSProperties = {
    left: finalX,
    top: finalY,
    // Add transitioning for smooth movement when not pinned
    transition: isPinned ? 'none' : 'left 0.1s, top 0.1s' 
  };

  return (
    <div className={`${styles.tooltip} ${isPinned ? styles.pinnedState : ''} ${styles.show}`} style={{...style, position: 'fixed'}}>
      {content}
      <div className={styles.ttPinHint}>
        {isPinned ? <><MdPushPin style={{verticalAlign:-2}}/> 고정됨</> : '클릭하면 고정됩니다'}
      </div>
    </div>
  );
}
