import { useState, useMemo, useEffect } from 'react';
import styles from './Kanji.module.css';
import { kanjiDB } from '../data/kanjiDB';
import { loadAllKanji, loadKanjiFromCache } from '../services/kanjiService';
import type { KanjiByLevel } from '../services/kanjiService';
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

  // API 데이터 상태
  const [apiData, setApiData] = useState<KanjiByLevel | null>(null);
  const [loading, setLoading] = useState(false);
  const [loadProgress, setLoadProgress] = useState({ loaded: 0, total: 0 });
  const [dataSource, setDataSource] = useState<'local' | 'cache' | 'api'>('local');

  // Load done from localStorage
  useEffect(() => {
    try {
      const stored = localStorage.getItem('kotonoha_kanji_done');
      if (stored) setDone(JSON.parse(stored));
    } catch { /* ignore */ }
  }, []);

  // 시작 시 캐시 확인 → API 호출
  useEffect(() => {
    const cached = loadKanjiFromCache();
    if (cached && cached.N5.length > 0) {
      setApiData(cached);
      setDataSource('cache');
    } else {
      // 캐시 없으면 API 호출
      fetchFromApi();
    }
  }, []);

  const fetchFromApi = async (forceRefresh = false) => {
    setLoading(true);
    try {
      const data = await loadAllKanji((loaded, total) => {
        setLoadProgress({ loaded, total });
      }, forceRefresh);
      setApiData(data);
      setDataSource('api');
    } catch (err) {
      console.warn('KanjiAPI 로드 실패, 로컬 데이터 사용:', err);
      setDataSource('local');
    }
    setLoading(false);
  };

  const saveDone = (newDone: string[]) => {
    setDone(newDone);
    localStorage.setItem('kotonoha_kanji_done', JSON.stringify(newDone));
  };

  // API 데이터가 있으면 사용, 없으면 로컬 fallback
  const allKanji = useMemo(() => {
    if (apiData && apiData[currentLevel] && apiData[currentLevel].length > 0) {
      return apiData[currentLevel];
    }
    return (kanjiDB as any)[currentLevel] || [];
  }, [apiData, currentLevel]);

  // 총 한자 수
  const totalKanjiCount = useMemo(() => {
    if (apiData) {
      return Object.values(apiData).reduce((sum, arr) => sum + arr.length, 0);
    }
    return 2136;
  }, [apiData]);

  const filtered = useMemo(() => {
    return allKanji.filter((item: any) => {
      const matchQ = !query || item.k.includes(query) || (item.on && item.on.includes(query)) || (item.kun && item.kun.includes(query)) || (item.meaning && item.meaning.includes(query)) || (item.kr && item.kr.includes(query));
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

  const progressPct = ((done.length / totalKanjiCount) * 100).toFixed(1);

  return (
    <>
      {/* 로딩 표시 */}
      {loading && (
        <div className={styles.loadingBar}>
          <div className={styles.loadingInner}>
            <span className="material-symbols-outlined" style={{ fontSize: '1.2rem', animation: 'spin 1s linear infinite' }}>sync</span>
            KanjiAPI에서 상용한자 불러오는 중... {loadProgress.loaded}/{loadProgress.total}자
            <div className={styles.loadingProgress}>
              <div className={styles.loadingFill} style={{ width: loadProgress.total ? `${(loadProgress.loaded / loadProgress.total * 100)}%` : '0%' }}></div>
            </div>
          </div>
        </div>
      )}

      {/* 진행 바 */}
      <div className={styles.progressSection}>
        <div className={styles.progressInner}>
          <div className={styles.progressStats}>
            <div className={styles.progStat}>
              <div className={styles.progNum}>{done.length}</div>
              <div className={styles.progLabel}>학습 완료</div>
            </div>
            <div className={styles.progStat}>
              <div className={styles.progNum}>{totalKanjiCount.toLocaleString()}</div>
              <div className={styles.progLabel}>상용한자 총수</div>
            </div>
            <div className={styles.progressBarWrap}>
              <div className={styles.progressBarBg}>
                <div className={styles.progressBarFill} style={{ width: `${progressPct}%` }}></div>
              </div>
              <div className={styles.progressPct}>{progressPct}% 완료</div>
            </div>
          </div>
          {/* 데이터 출처 표시 */}
          <div style={{ textAlign: 'center', fontSize: '0.7rem', color: 'var(--muted)', marginTop: 6 }}>
            {dataSource === 'api' && '✓ KanjiAPI.dev에서 불러옴'}
            {dataSource === 'cache' && (
              <>✓ 캐시에서 불러옴 <button onClick={() => fetchFromApi(true)} style={{ background: 'none', border: 'none', color: 'var(--accent-gold)', cursor: 'pointer', fontSize: '0.7rem', textDecoration: 'underline' }}>새로고침</button></>
            )}
            {dataSource === 'local' && '⚠ 로컬 데이터 사용 중'}
            {' · '}{currentLevel}: {allKanji.length}자
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
              {apiData && <span style={{ fontSize: '0.65rem', opacity: 0.7, marginLeft: 3 }}>({(apiData[lv] || []).length})</span>}
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
            const firstOn = item.on ? item.on.split('・')[0] : '';
            return (
              <div
                key={idx}
                className={`${styles.kanjiCard} ${isDone ? styles.done : ''}`}
                onClick={() => setSelected(item)}
              >
                <span className={styles.kanjiDoneMark}>✓</span>
                <div className={styles.kanjiChar}>{item.k}</div>
                <div className={styles.kanjiKr}>
                  {item.kr ? item.kr.split('/')[0].split(',')[0].trim() : ''}
                </div>
                <div className={styles.kanjiOn}>{firstOn}</div>
              </div>
            );
          })}
        </div>

        {/* 결과 없음 */}
        {visible.length === 0 && !loading && (
          <div style={{ textAlign: 'center', padding: 40, color: 'var(--muted)' }}>
            {query ? '검색 결과가 없습니다' : '해당 한자가 없습니다'}
          </div>
        )}

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
            
            {/* 한국 한자음을 한자 아래로 이동, 1개로 줄이기 */}
            {selected.kr && (
              <div className={styles.dpKrTitle}>
                {selected.kr.split('/')[0].split(',')[0].trim()}
              </div>
            )}

            <div className={styles.dpSection}>
              <div className={styles.dpLabel}>음독 ( 音読み )</div>
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
              <div className={styles.dpLabel}>훈독 ( 訓読み )</div>
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
              <div className={styles.dpLabel}>뜻 · 의미</div>
              <div className={styles.dpValue}>
                {(() => {
                  let meaningStr = (kanjiDB as any)[currentLevel]?.find((k: any) => k.k === selected.k)?.meaning;
                  
                  // 로컬 DB 의미가 없을 경우, 영어 대신 한국어 뜻(kr)에서 추출 (예: 쉴 휴 -> 쉴)
                  if (!meaningStr && selected.kr) {
                    const firstKr = selected.kr.split('/')[0].split(',')[0].trim();
                    const parts = firstKr.split(' ');
                    if (parts.length > 1) {
                      parts.pop(); // 음(eum) 제거
                      meaningStr = parts.join(' ');
                    } else {
                      meaningStr = firstKr;
                    }
                  }

                  if (!meaningStr) return '-';

                  // 콤마로 구분된 뜻 중에서 숫자가 있으면 맨 앞으로 이동
                  const segments = meaningStr.split(',').map((s: string) => s.trim());
                  const nums = segments.filter((p: string) => /^\d+$/.test(p));
                  const text = segments.filter((p: string) => !/^\d+$/.test(p));
                  return [...nums, ...text].join(', ');
                })()}
              </div>
            </div>
            {selected.strokes && (
              <div className={styles.dpSection}>
                <div className={styles.dpLabel}>획수</div>
                <div className={styles.dpValue}>{selected.strokes}획</div>
              </div>
            )}

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
