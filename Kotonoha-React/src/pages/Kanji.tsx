import React, { useState, useMemo, useEffect } from 'react';
import styles from './Kanji.module.css';
import { kanjiDB } from '../data/kanjiDB';
import { useTTS } from '../hooks/useTTS';
import { MdClose, MdVolumeUp, MdCheckCircle } from 'react-icons/md';

type Level = 'N5' | 'N4' | 'N3' | 'N2' | 'N1';
const levelColors: Record<Level, string> = {
  N5: '#27ae60', N4: '#2980b9', N3: '#8e44ad', N2: '#e67e22', N1: '#c0392b'
};
const PAGE_SIZE = 60;

export default function Kanji() {
  const [currentLevel, setCurrentLevel] = useState<Level>('N5');
  const [currentFilter, setCurrentFilter] = useState<'all' | 'done' | 'undone'>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [query, setQuery] = useState('');
  const [done, setDone] = useState<string[]>([]);
  const [selected, setSelected] = useState<any>(null);
  const { speak } = useTTS();

  // Load done from localStorage
  useEffect(() => {
    try {
      const stored = localStorage.getItem('kotonoha_kanji_done');
      if (stored) setDone(JSON.parse(stored));
    } catch { /* ignore */ }
  }, []);

  const saveDone = (newDone: string[]) => {
    setDone(newDone);
    localStorage.setItem('kotonoha_kanji_done', JSON.stringify(newDone));
  };

  const allKanji = (kanjiDB as any)[currentLevel] || [];

  const filtered = useMemo(() => {
    return allKanji.filter((item: any) => {
      const matchQ = !query || item.k.includes(query) || item.on.includes(query) || item.kun.includes(query) || item.meaning.includes(query) || (item.kr && item.kr.includes(query));
      const isDone = done.includes(item.k);
      const matchF = currentFilter === 'all' || (currentFilter === 'done' && isDone) || (currentFilter === 'undone' && !isDone);
      return matchQ && matchF;
    });
  }, [allKanji, query, currentFilter, done]);

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const visible = filtered.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  const switchLevel = (lv: Level) => {
    setCurrentLevel(lv);
    setCurrentPage(1);
    setQuery('');
  };

  const toggleDone = (k: string) => {
    const idx = done.indexOf(k);
    if (idx >= 0) {
      const newDone = [...done];
      newDone.splice(idx, 1);
      saveDone(newDone);
    } else {
      saveDone([...done, k]);
    }
  };

  const progressPct = ((done.length / 2136) * 100).toFixed(1);

  return (
    <>
      {/* 진행 바 */}
      <div className={styles.progressSection}>
        <div className={styles.progressInner}>
          <div className={styles.progressStats}>
            <div className={styles.progStat}>
              <div className={styles.progNum}>{done.length}</div>
              <div className={styles.progLabel}>학습 완료</div>
            </div>
            <div className={styles.progStat}>
              <div className={styles.progNum}>2,136</div>
              <div className={styles.progLabel}>상용한자 총수</div>
            </div>
            <div className={styles.progressBarWrap}>
              <div className={styles.progressBarBg}>
                <div className={styles.progressBarFill} style={{ width: `${progressPct}%` }}></div>
              </div>
              <div className={styles.progressPct}>{progressPct}% 완료</div>
            </div>
          </div>
        </div>
      </div>

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

        {/* 컨트롤 바 */}
        <div className={styles.controls}>
          <input
            type="text" placeholder="한자, 음독, 훈독, 의미 검색..."
            value={query} onChange={e => { setQuery(e.target.value); setCurrentPage(1); }}
          />
          <button
            className={`${styles.filterBtn} ${currentFilter === 'all' ? styles.active : ''}`}
            onClick={() => { setCurrentFilter('all'); setCurrentPage(1); }}
          >전체</button>
          <button
            className={`${styles.filterBtn} ${currentFilter === 'undone' ? styles.active : ''}`}
            onClick={() => { setCurrentFilter('undone'); setCurrentPage(1); }}
          >미학습</button>
          <button
            className={`${styles.filterBtn} ${currentFilter === 'done' ? styles.active : ''}`}
            onClick={() => { setCurrentFilter('done'); setCurrentPage(1); }}
          >완료</button>
          <span className={styles.countPill}>{filtered.length}字</span>
        </div>

        {/* 한자 그리드 */}
        <div className={styles.kanjiGrid}>
          {visible.map((item: any, idx: number) => {
            const isDone = done.includes(item.k);
            const firstOn = item.on.split('・')[0];
            return (
              <div
                key={idx}
                className={`${styles.kanjiCard} ${isDone ? styles.done : ''}`}
                onClick={() => setSelected(item)}
              >
                <span className={styles.kanjiDoneMark}>✓</span>
                <div className={styles.kanjiChar}>{item.k}</div>
                <div className={styles.kanjiKr}>{item.kr || ''}</div>
                <div className={styles.kanjiOn}>{firstOn}</div>
              </div>
            );
          })}
        </div>

        {/* 페이지네이션 */}
        {totalPages > 1 && (
          <div className={styles.pagination}>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
              <button
                key={p}
                className={`${styles.pageBtn} ${p === currentPage ? styles.active : ''}`}
                onClick={() => { setCurrentPage(p); window.scrollTo(0, 0); }}
              >
                {p}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* 상세 패널 */}
      <div className={`${styles.detailPanel} ${selected ? styles.open : ''}`}>
        {selected && (
          <>
            <button className={styles.dpClose} onClick={() => setSelected(null)}><MdClose size={22} /></button>
            <span className={styles.dpLevelBadge} style={{ background: levelColors[currentLevel] }}>{currentLevel}</span>
            <span className={styles.dpChar}>{selected.k}</span>

            <div className={styles.dpSection}>
              <div className={styles.dpLabel}>음독 · ON</div>
              <div className={styles.dpValue}>
                {selected.on || '-'}
                {selected.on && selected.on !== '-' && (
                  <button className={styles.dpTtsBtn} onClick={() => speak(selected.on.split('・')[0])} title="발음 듣기">
                    <MdVolumeUp size={16} />
                  </button>
                )}
              </div>
            </div>
            <div className={styles.dpSection}>
              <div className={styles.dpLabel}>훈독 · KUN</div>
              <div className={styles.dpValue}>
                {selected.kun || '-'}
                {selected.kun && selected.kun !== '-' && (
                  <button className={styles.dpTtsBtn} onClick={() => {
                    let firstKun = selected.kun.split('・')[0].split(',')[0].trim();
                    firstKun = firstKun.replace(/（[^）]*）/g, '').replace(/\([^)]*\)/g, '');
                    speak(firstKun);
                  }} title="발음 듣기">
                    <MdVolumeUp size={16} />
                  </button>
                )}
              </div>
            </div>

            <div className={styles.dpDivider}></div>

            <div className={styles.dpSection}>
              <div className={styles.dpLabel}>한국 한자음</div>
              <div className={styles.dpValue}>{selected.kr || '-'}</div>
            </div>
            <div className={styles.dpSection}>
              <div className={styles.dpLabel}>의미</div>
              <div className={styles.dpValue}>{selected.meaning}</div>
            </div>

            <button
              className={`${styles.dpDoneBtn} ${done.includes(selected.k) ? styles.active : ''}`}
              onClick={() => toggleDone(selected.k)}
            >
              {done.includes(selected.k) ? (
                <><MdCheckCircle style={{ verticalAlign: -3 }} /> 학습 완료됨 (다시 클릭해서 취소)</>
              ) : (
                '○ 학습 완료 체크'
              )}
            </button>
          </>
        )}
      </div>

      {/* 패널 오버레이(모바일) */}
      {selected && (
        <div
          style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.3)', zIndex:140, display:'none' }}
          onClick={() => setSelected(null)}
        />
      )}
    </>
  );
}
