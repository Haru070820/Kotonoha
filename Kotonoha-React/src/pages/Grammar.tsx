import React, { useState, useMemo } from 'react';
import styles from './Grammar.module.css';
import { grammarDB } from '../data/grammarDB';
import { useTTS } from '../hooks/useTTS';
import { MdVolumeUp, MdExpandMore } from 'react-icons/md';

export default function Grammar() {
  const [query, setQuery] = useState('');
  const [expandedKey, setExpandedKey] = useState<string | null>(null);
  const { speak } = useTTS();

  const entries = useMemo(() => {
    return Object.entries(grammarDB as Record<string, { title: string; desc: string }>)
      .filter(([token, data]) => {
        if (!query) return true;
        const q = query.toLowerCase();
        return token.includes(q) || data.title.toLowerCase().includes(q) || data.desc.toLowerCase().includes(q);
      });
  }, [query]);

  const toggleExpand = (key: string) => {
    setExpandedKey(prev => prev === key ? null : key);
  };

  return (
    <div className={styles.pageWrap}>
      <h1 className={styles.pageTitle}>文法ポイント</h1>
      <p className={styles.pageDesc}>노래 가사에 자주 등장하는 일본어 문법 요소 모음</p>

      <div className={styles.searchBar}>
        <input
          type="text"
          placeholder="문법 요소, 제목, 설명 검색..."
          value={query}
          onChange={e => setQuery(e.target.value)}
        />
        <span className={styles.countBadge}>{entries.length}개</span>
      </div>

      <div className={styles.grammarList}>
        {entries.map(([token, data]) => {
          const isOpen = expandedKey === token;
          return (
            <div
              key={token}
              className={`${styles.grammarCard} ${isOpen ? styles.expanded : ''}`}
              onClick={() => toggleExpand(token)}
            >
              <div className={styles.gcHeader}>
                <div className={styles.gcToken}>{token}</div>
                <div className={styles.gcInfo}>
                  <div className={styles.gcTitle}>{data.title}</div>
                </div>
                <button
                  className={styles.ttsBtn}
                  onClick={e => { e.stopPropagation(); speak(token); }}
                  title="발음 듣기"
                >
                  <MdVolumeUp size={18} />
                </button>
                <span className={`${styles.gcArrow} ${isOpen ? styles.open : ''}`}>
                  <MdExpandMore size={22} />
                </span>
              </div>
              <div className={`${styles.gcBody} ${isOpen ? styles.open : ''}`}>
                <div className={styles.gcDesc}>{data.desc}</div>
              </div>
            </div>
          );
        })}
      </div>

      {entries.length === 0 && (
        <div style={{ textAlign: 'center', padding: 40, color: 'var(--muted)' }}>
          <div style={{ fontSize: '2.5rem', marginBottom: 12 }}>📖</div>
          <div>검색 결과가 없습니다.</div>
        </div>
      )}
    </div>
  );
}
