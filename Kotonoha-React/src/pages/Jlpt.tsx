import React, { useState, useMemo } from 'react';
import styles from './Jlpt.module.css';
import { jlptWords } from '../data/jlptDB';
import { useTTS } from '../hooks/useTTS';
import { useFavorites } from '../hooks/useFavorites';
import { MdVolumeUp } from 'react-icons/md';

type Level = 'N5' | 'N4' | 'N3' | 'N2' | 'N1';

const levelColors: Record<Level, string> = {
  N5: '#27ae60', N4: '#2980b9', N3: '#8e44ad', N2: '#e67e22', N1: '#c0392b'
};

export default function Jlpt() {
  const [currentLevel, setCurrentLevel] = useState<Level>('N5');
  const [query, setQuery] = useState('');
  const [posFilter, setPosFilter] = useState('');
  const [displayCount, setDisplayCount] = useState(12);
  const { speak } = useTTS();
  const { favs, toggleFav, isFav } = useFavorites();

  const words = (jlptWords as any)[currentLevel] || [];

  const filtered = useMemo(() => {
    const q = query.toLowerCase();
    return words.filter((w: any) => {
      const matchQ = !q || w.word.includes(q) || w.reading.toLowerCase().includes(q) || w.meanings.join().includes(q);
      const matchPos = !posFilter || w.pos === posFilter;
      return matchQ && matchPos;
    });
  }, [words, query, posFilter]);

  const visible = filtered.slice(0, displayCount);

  // 오늘의 단어
  const todayWord = useMemo(() => {
    const d = new Date();
    return words[d.getDate() % words.length];
  }, [words]);

  const switchLevel = (level: Level) => {
    setCurrentLevel(level);
    setDisplayCount(12);
    setQuery('');
    setPosFilter('');
  };

  const handleToggleFav = (w: any) => {
    toggleFav({
      word: w.word,
      kanji: w.kanji || '',
      reading: w.reading,
      meanings: w.meanings
    });
  };

  // 품사 목록 추출
  const posList = useMemo(() => {
    const s = new Set<string>();
    words.forEach((w: any) => s.add(w.pos));
    return Array.from(s);
  }, [words]);

  const color = levelColors[currentLevel];

  return (
    <div className={styles.pageWrap}>
      {/* 레벨 탭 */}
      <div className={styles.levelTabs}>
        {(['N5','N4','N3','N2','N1'] as Level[]).map(lv => (
          <button
            key={lv}
            className={`${styles.levelTab} ${currentLevel === lv ? styles.active : ''}`}
            style={currentLevel === lv ? { background: levelColors[lv] } : {}}
            onClick={() => switchLevel(lv)}
          >
            {lv}
          </button>
        ))}
      </div>

      {/* 오늘의 단어 */}
      {todayWord && (
        <div className={styles.todayHighlight}>
          <div className={styles.todayBadge}>오늘의 {currentLevel} 단어</div>
          <div className={styles.todayInfo}>
            <div className={styles.todayWord} style={{ color }}>{todayWord.word}</div>
            <div className={styles.todayReading}>{todayWord.reading}</div>
            <div className={styles.todayMeaning}>{todayWord.meanings.join(', ')}</div>
          </div>
        </div>
      )}

      {/* 필터 바 */}
      <div className={styles.filterBar}>
        <input
          type="text"
          placeholder="단어, 읽기, 의미 검색..."
          value={query}
          onChange={e => { setQuery(e.target.value); setDisplayCount(12); }}
        />
        <select value={posFilter} onChange={e => { setPosFilter(e.target.value); setDisplayCount(12); }}>
          <option value="">전체 품사</option>
          {posList.map(p => <option key={p} value={p}>{p}</option>)}
        </select>
        <span className={styles.statsPill}>{filtered.length}개</span>
      </div>

      {/* 단어 카드 그리드 */}
      <div className={styles.wordGrid}>
        {visible.map((w: any, idx: number) => {
          const fav = isFav(w.word);
          const readText = w.kanji ? w.kanji : w.word;
          return (
            <div key={idx} className={styles.wordCard} style={{ '--level-color': color } as React.CSSProperties}>
              <div className={styles.wcHeader}>
                <div>
                  <div className={styles.wcWord}>{w.word}</div>
                  <div className={styles.wcKanji}>{w.kanji || ''}</div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <button className={styles.ttsBtn} onClick={() => speak(readText)} title="발음 듣기">
                    <MdVolumeUp size={16} />
                  </button>
                  <button
                    className={`${styles.wcFav} ${fav ? styles.wcFavOn : ''}`}
                    onClick={() => handleToggleFav(w)}
                  >
                    {fav ? '★' : '☆'}
                  </button>
                </div>
              </div>
              <div className={styles.wcReading}>{w.reading}</div>
              <div className={styles.wcDivider}></div>
              <span className={styles.wcPos}>{w.pos}</span>
              <div className={styles.wcMeaning}>
                {w.meanings.map((m: string, i: number) => (
                  <React.Fragment key={i}>{i + 1}. {m}{i < w.meanings.length - 1 && <br />}</React.Fragment>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {/* 더 보기 */}
      {filtered.length > displayCount && (
        <button className={styles.loadMore} onClick={() => setDisplayCount(prev => prev + 12)}>
          더 보기 ({filtered.length - displayCount}개 남음)
        </button>
      )}
    </div>
  );
}
