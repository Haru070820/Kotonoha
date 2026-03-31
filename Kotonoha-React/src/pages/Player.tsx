import React, { useState, useEffect, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import styles from './Player.module.css';
import { useSettings } from '../hooks/useSettings';
import { useTTS } from '../hooks/useTTS';
import { useFavorites } from '../hooks/useFavorites';
import { buildJpHtml } from '../utils/tokenizer';
import Tooltip from '../components/Tooltip';

// Import all JSON data
import kingGnuSongs from '../data/KingGnuSongs.json';
import dishSongs from '../data/DISHSongs.json';
import radwimpsSongs from '../data/RADWIMPSSongs.json';
import yorushikaSongs from '../data/YorushikaSongs.json';
import pompadollsSongs from '../data/pompadollsSongs.json';

const allSongs = [
  ...kingGnuSongs, ...dishSongs, ...radwimpsSongs, ...yorushikaSongs, ...pompadollsSongs
];

export default function Player() {
  const { id } = useParams<{ id: string }>();
  const [currentSong, setCurrentSong] = useState<any>(null);
  const { settings } = useSettings();
  const { favs, toggleFav, isFav } = useFavorites();
  const { speak } = useTTS();

  // Tooltip State
  const [hoveredWord, setHoveredWord] = useState<{ word: string, type: 'word' | 'grammar', x: number, y: number } | null>(null);
  const [pinnedWord, setPinnedWord] = useState<{ word: string, type: 'word' | 'grammar', x: number, y: number } | null>(null);

  useEffect(() => {
    if (id) {
      const songId = parseInt(id, 10);
      const song = allSongs.find(s => s.id === songId);
      if (song) setCurrentSong(song);
      
      // Auto-scroll to top when page opens
      window.scrollTo(0, 0);
    }
  }, [id]);

  useEffect(() => {
    // Click outside to close pinned tooltip
    const handleClick = (e: MouseEvent) => {
      // @ts-ignore
      if (!e.target?.closest('.word-token') && !e.target?.closest('.grammar-token') && !e.target?.closest(`.${Tooltip.name}`)) {
        setPinnedWord(null);
        setHoveredWord(null);
      }
    };
    document.addEventListener('click', handleClick);
    return () => document.removeEventListener('click', handleClick);
  }, []);

  const handleTokenHover = (e: React.MouseEvent, word: string, type: 'word' | 'grammar') => {
    if (!pinnedWord) {
      setHoveredWord({ word, type, x: e.clientX, y: e.clientY });
    }
  };

  const handleTokenLeave = () => {
    if (!pinnedWord) setHoveredWord(null);
  };

  const handleTokenClick = (e: React.MouseEvent, word: string, type: 'word' | 'grammar') => {
    e.stopPropagation();
    if (pinnedWord && pinnedWord.word === word) {
      setPinnedWord(null); // Unpin if already pinned
    } else {
      setPinnedWord({ word, type, x: e.clientX, y: e.clientY });
    }
  };

  if (!currentSong) return <div style={{padding: 40, textAlign:'center'}}>노래를 찾을 수 없습니다.</div>;

  return (
    <div className={styles.layout}>
      {/* Sidebar List */}
      <div className={styles.sidebar}>
        <div className={styles.sidebarTitle}>전체 곡 목록</div>
        {allSongs.slice(0, 15).map(s => (
          <Link key={s.id} to={`/player/${s.id}`} className={`${styles.songItem} ${s.id === currentSong.id ? styles.active : ''}`}>
            <div className={styles.sTitle}>{s.title}</div>
            <div className={styles.sArtist}>{s.titleKr} · {s.artist}</div>
            <div style={{ marginTop: 6 }}>
              {s.level && <span className={styles.sLevelBadge}>{s.level}</span>}
              <span className={styles.sTag}>{s.tag}</span>
            </div>
          </Link>
        ))}
        {allSongs.length > 15 && <div style={{textAlign:'center', fontSize: '0.8rem', color:'var(--muted)', marginTop: 10}}>+ 다른 곡은 홈 화면을 참고하세요.</div>}
      </div>

      {/* Main Lyrics Area */}
      <div className={styles.playerArea}>
        <div className={styles.songHeader}>
          <h2>{currentSong.title} {currentSong.level && <span className={styles.sLevelBadge}>{currentSong.level}</span>}</h2>
          <p>{currentSong.titleKr} · {currentSong.artist}</p>
        </div>

        <div className={styles.lyricsContainer}>
          {currentSong.lyrics.map((line: any, idx: number) => {
            const tokenCtx = {
              grammarOn: settings.grammarMode,
              favs,
              pinnedWord: pinnedWord?.word || null,
              onTokenHover: handleTokenHover,
              onTokenLeave: handleTokenLeave,
              onTokenClick: handleTokenClick
            };

            const jpNodes = typeof line.jp === 'string' 
              ? buildJpHtml([[line.jp, null]], tokenCtx) // fallback mock for string if tokenizer isn't full parser
              : buildJpHtml(line.jp, tokenCtx);

            return (
              <div key={idx} className={styles.lyricsRow}>
                <div className={styles.lyricsJpLine}>{jpNodes}</div>
                {settings.romaji && <div className={styles.lyricsPronLine}>{line.pron}</div>}
                <div className={styles.lyricsKoLine}>{line.ko}</div>
              </div>
            );
          })}
        </div>
      </div>

      {/* RENDER TOOLTIP */}
      {(pinnedWord || hoveredWord) && (
        <Tooltip
          x={pinnedWord ? pinnedWord.x : hoveredWord!.x}
          y={pinnedWord ? pinnedWord.y : hoveredWord!.y}
          word={pinnedWord ? pinnedWord.word : hoveredWord!.word}
          type={pinnedWord ? pinnedWord.type : hoveredWord!.type}
          isPinned={!!pinnedWord}
          isFav={isFav(pinnedWord ? pinnedWord.word : hoveredWord!.word)}
          onToggleFav={() => {
            // @ts-ignore
            import('../data/wordDB').then(({wordDB}) => {
              const wd = pinnedWord ? pinnedWord.word : hoveredWord!.word;
              // @ts-ignore
              const d = wordDB[wd];
              if(d) toggleFav(d);
            });
          }}
          onTts={(txt) => speak(txt)}
        />
      )}
    </div>
  );
}
