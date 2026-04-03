import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import styles from './Player.module.css';
import { useSettings } from '../hooks/useSettings';
import { useTTS } from '../hooks/useTTS';
import { useFavorites } from '../hooks/useFavorites';
import { useBookmarks } from '../hooks/useBookmarks';
import { buildJpHtml, tokenizePlain } from '../utils/tokenizer';
import Tooltip from '../components/Tooltip';

// Import all JSON data
import kingGnuSongs from '../data/KingGnuSongs.json';
import dishSongs from '../data/DISHSongs.json';
import radwimpsSongs from '../data/RADWIMPSSongs.json';
import yorushikaSongs from '../data/YorushikaSongs.json';
import pompadollsSongs from '../data/pompadollsSongs.json';
import { wordDB } from '../data/wordDB';

const allSongs: any[] = [
  ...kingGnuSongs, ...dishSongs, ...radwimpsSongs, ...yorushikaSongs, ...pompadollsSongs
];

const artistList = [
  { name: 'DISH//' },
  { name: 'King Gnu' },
  { name: 'Yorushika' },
  { name: 'pompadolls' },
  { name: 'RADWIMPS' },
];

// ── 음악 링크 ──
const musicLinks: Record<number, { yt: string; apple: string; spotify: string }> = {
  1: { yt:'https://music.youtube.com/search?q=DISH%2F%2F+%E7%8C%AB', apple:'https://music.apple.com/search?term=DISH+%E7%8C%AB', spotify:'https://open.spotify.com/search/DISH%20%E7%8C%AB' },
  3: { yt:'https://music.youtube.com/search?q=King+Gnu+%E3%82%AB%E3%83%A1%E3%83%AC%E3%82%AA%E3%83%B3', apple:'https://music.apple.com/search?term=King+Gnu+%E3%82%AB%E3%83%A1%E3%83%AC%E3%82%AA%E3%83%B3', spotify:'https://open.spotify.com/search/King%20Gnu%20%E3%82%AB%E3%83%A1%E3%83%AC%E3%82%AA%E3%83%B3' },
  4: { yt:'https://music.youtube.com/search?q=Yorushika+%E3%83%92%E3%83%83%E3%83%81%E3%82%B3%E3%83%83%E3%82%AF', apple:'https://music.apple.com/search?term=Yorushika+Hitchcock', spotify:'https://open.spotify.com/search/Yorushika%20%E3%83%92%E3%83%83%E3%83%81%E3%82%B3%E3%83%83%E3%82%AF' },
  5: { yt:'https://music.youtube.com/search?q=DISH%2F%2F+%E6%B2%88%E4%B8%81%E8%8A%B1', apple:'https://music.apple.com/search?term=DISH+%E6%B2%88%E4%B8%81%E8%8A%B1', spotify:'https://open.spotify.com/search/DISH%20%E6%B2%88%E4%B8%81%E8%8A%B1' },
  6: { yt:'https://music.youtube.com/search?q=Yorushika+%E5%BF%98%E3%82%8C%E3%81%A6%E3%81%8F%E3%81%A0%E3%81%95%E3%81%84', apple:'https://music.apple.com/search?term=Yorushika+%E5%BF%98%E3%82%8C%E3%81%A6%E3%81%8F%E3%81%A0%E3%81%95%E3%81%84', spotify:'https://open.spotify.com/search/Yorushika%20%E5%BF%98%E3%82%8C%E3%81%A6%E3%81%8F%E3%81%A0%E3%81%95%E3%81%84' },
  7: { yt:'https://music.youtube.com/search?q=pompadolls+%E6%82%AA%E9%A3%9F', apple:'https://music.apple.com/search?term=pompadolls+%E6%82%AA%E9%A3%9F', spotify:'https://open.spotify.com/search/pompadolls%20%E6%82%AA%E9%A3%9F' },
  8: { yt:'https://music.youtube.com/search?q=RADWIMPS+Sparkle', apple:'https://music.apple.com/search?term=RADWIMPS+Sparkle', spotify:'https://open.spotify.com/search/RADWIMPS%20Sparkle' },
};

export default function Player() {
  const { id } = useParams<{ id: string }>();
  const [currentSong, setCurrentSong] = useState<any>(null);
  const { settings } = useSettings();
  const { favs, toggleFav, isFav, removeFav } = useFavorites();
  const { speak } = useTTS();
  const { toggleBookmark, isBookmarked } = useBookmarks();

  // Sidebar state
  const [playerCat, setPlayerCat] = useState<'all' | 'popular' | 'new' | 'artist'>('all');
  const [selectedArtist, setSelectedArtist] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [favPanelOpen, setFavPanelOpen] = useState(false);
  const [musicPopup, setMusicPopup] = useState<{ songId: number; x: number; y: number } | null>(null);
  const musicPopupRef = useRef<HTMLDivElement>(null);

  // Tooltip State
  const [hoveredWord, setHoveredWord] = useState<{ word: string, type: 'word' | 'grammar', x: number, y: number } | null>(null);
  const [pinnedWord, setPinnedWord] = useState<{ word: string, type: 'word' | 'grammar', x: number, y: number } | null>(null);

  useEffect(() => {
    if (id) {
      const songId = parseInt(id, 10);
      const song = allSongs.find(s => s.id === songId);
      if (song) setCurrentSong(song);
      window.scrollTo(0, 0);
    }
  }, [id]);

  // Click outside to close pinned tooltip
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target.closest('.word-token') && !target.closest('.grammar-token') && !target.closest(`.${styles.tooltip}`)) {
        setPinnedWord(null);
        setHoveredWord(null);
      }
    };
    document.addEventListener('click', handleClick);
    return () => document.removeEventListener('click', handleClick);
  }, []);

  // Music popup close on outside click
  useEffect(() => {
    if (!musicPopup) return;
    const close = (e: MouseEvent) => {
      if (musicPopupRef.current && !musicPopupRef.current.contains(e.target as Node)) {
        setMusicPopup(null);
      }
    };
    setTimeout(() => document.addEventListener('click', close), 0);
    return () => document.removeEventListener('click', close);
  }, [musicPopup]);

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
      setPinnedWord(null);
    } else {
      setPinnedWord({ word, type, x: e.clientX, y: e.clientY });
    }
  };

  // ── 사이드바 곡 필터링 ──
  const filteredSongs = useMemo(() => {
    let list = [...allSongs];
    if (playerCat === 'popular') list = list.filter(s => s.tag === '인기' || s.tag === '추천');
    else if (playerCat === 'new') list = list.filter(s => s.tag === '신규');
    else if (playerCat === 'artist' && selectedArtist) list = list.filter(s => s.artist === selectedArtist);

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      list = list.filter(s =>
        s.title.toLowerCase().includes(q) || s.titleKr.includes(q) || (s.artist && s.artist.toLowerCase().includes(q))
      );
    }
    return list;
  }, [playerCat, selectedArtist, searchQuery]);

  const handleCatChange = (cat: 'all' | 'popular' | 'new' | 'artist') => {
    if (cat !== 'artist') setSelectedArtist(null);
    setPlayerCat(cat);
    setSearchQuery('');
  };

  const favLimit = settings.favLimit || 50;

  return (
    <div className={styles.layout}>
      {/* Sidebar List */}
      <div className={styles.sidebar}>
        <div className={styles.sidebarTitle}>SONG LIST · 곡 목록</div>

        {/* Category Tabs */}
        <div className={styles.catTabs}>
          {(['all', 'popular', 'new', 'artist'] as const).map(cat => (
            <button
              key={cat}
              className={`${styles.catTab} ${playerCat === cat ? styles.active : ''}`}
              onClick={() => handleCatChange(cat)}
            >
              {{ all: '전체', popular: '인기', new: '최신', artist: '가수' }[cat]}
            </button>
          ))}
        </div>

        {/* Search */}
        <div className={styles.searchWrap}>
          <span className="material-symbols-outlined" style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: 'var(--muted)', fontSize: '0.9rem', pointerEvents: 'none' }}>search</span>
          <input
            type="text"
            placeholder="노래 검색…"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className={styles.searchInput}
          />
        </div>

        {/* Artist Overview */}
        {playerCat === 'artist' && !selectedArtist && !searchQuery && (
          <div>
            {artistList.map(a => (
              <div key={a.name} className={styles.songItem} onClick={() => setSelectedArtist(a.name)} style={{ cursor: 'pointer' }}>
                <div className={styles.sTitle}>
                  <span className="material-symbols-outlined" style={{ verticalAlign: '-4px', marginRight: 6, color: 'var(--accent-gold)' }}>mic</span>
                  {a.name}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Back to artist list */}
        {playerCat === 'artist' && selectedArtist && (
          <div className={styles.songItem} onClick={() => setSelectedArtist(null)} style={{ cursor: 'pointer', textAlign: 'center', fontWeight: 'bold', color: 'var(--accent-gold)' }}>
            ← 가수 목록으로 돌아가기
          </div>
        )}

        {/* Song List */}
        {!(playerCat === 'artist' && !selectedArtist && !searchQuery) && (
          filteredSongs.length > 0 ? filteredSongs.map(s => {
            const bm = isBookmarked(s.id);
            return (
              <Link key={s.id} to={`/player/${s.id}`} className={`${styles.songItem} ${currentSong?.id === s.id ? styles.active : ''}`}>
                <div className={styles.sTitle}>{s.title}</div>
                <div className={styles.sArtist}>{s.titleKr} · {s.artist}</div>
                <div className={styles.sActions} onClick={e => e.preventDefault()}>
                  <button className={`${styles.sBmBtn} ${bm ? styles.on : ''}`} onClick={(e) => { e.preventDefault(); e.stopPropagation(); toggleBookmark(s.id); }}>
                    <span className={`material-symbols-outlined${bm ? ' ms-filled' : ''}`} style={{ fontSize: '1.1rem' }}>bookmark</span>
                  </button>
                  <button onClick={(e) => {
                    e.preventDefault(); e.stopPropagation();
                    const rect = (e.target as HTMLElement).closest('button')!.getBoundingClientRect();
                    setMusicPopup({ songId: s.id, x: Math.min(rect.left, window.innerWidth - 200), y: rect.bottom + 6 });
                  }} className={styles.sMusicBtn} title="음악 듣기">
                    <span className="material-symbols-outlined" style={{ fontSize: '1.1rem' }}>headphones</span>
                  </button>
                </div>
                <div style={{ display: 'flex', gap: 6, alignItems: 'center', marginTop: 4 }}>
                  {s.level && <span className={styles.sLevelBadge}>{s.level}</span>}
                  <span className={styles.sTag}>{s.tag}</span>
                </div>
              </Link>
            );
          }) : (
            <div style={{ padding: 16, textAlign: 'center', color: 'var(--muted)', fontSize: '0.82rem' }}>결과 없음</div>
          )
        )}
      </div>

      {/* Main Lyrics Area */}
      <div className={styles.playerArea}>
        {currentSong ? (
          <>
            <div className={styles.songHeader}>
              <h2>
                {currentSong.title} ({currentSong.titleKr})
                {currentSong.level && <span className={styles.sLevelBadge} style={{ fontSize: '0.75rem', verticalAlign: 'middle', marginLeft: 8 }}>{currentSong.level}</span>}
              </h2>
              <p>{currentSong.artist}</p>
            </div>

            {/* Fav Bar */}
            <div className={styles.favBar}>
              <span className={styles.favBarText}>즐겨찾기: <strong>{favs.length}/{favLimit}</strong>개</span>
              <button className={styles.viewFavsBtn} onClick={() => setFavPanelOpen(!favPanelOpen)}>
                <span className="material-symbols-outlined ms-filled" style={{ fontSize: '0.85rem', verticalAlign: '-2px' }}>star</span> 즐겨찾기 보기
              </button>
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
                  ? tokenizePlain(line.jp, tokenCtx)
                  : buildJpHtml(line.jp, tokenCtx);

                return (
                  <div key={idx} className={styles.lyricsRow}>
                    <div className={styles.lyricsJpLine}>{jpNodes}</div>
                    {settings.romaji && <div className={styles.lyricsPronLine}>{line.pron}</div>}
                    {settings.korean !== false && <div className={styles.lyricsKoLine}>{line.ko}</div>}
                  </div>
                );
              })}
            </div>
          </>
        ) : (
          <div className={styles.emptyState}>
            <div className="big"><span className="material-symbols-outlined" style={{ fontSize: '2.5rem' }}>music_note</span></div>
            <div>왼쪽에서 노래를 선택하면 가사가 표시됩니다</div>
            <div style={{ marginTop: 10, fontSize: '0.8rem' }}>단어에 <b>마우스를 올리면</b> 뜻 미리보기 · <b>클릭하면</b> 고정</div>
          </div>
        )}
      </div>

      {/* Fav Panel */}
      <div className={`${styles.favPanel} ${favPanelOpen ? styles.open : ''}`}>
        <div className={styles.favPanelTitle}>
          <span className="material-symbols-outlined ms-filled" style={{ fontSize: '1rem', color: 'var(--accent-gold)', verticalAlign: '-2px', marginRight: 4 }}>star</span> 즐겨찾기 단어장
          <button className={styles.closePanel} onClick={() => setFavPanelOpen(false)}>✕</button>
        </div>
        {favs.length === 0 ? (
          <div className={styles.emptyState}>즐겨찾기한 단어가 없어요</div>
        ) : (
          favs.map((f, i) => (
            <div className={styles.favWordItem} key={i}>
              <button className={styles.favRemove} onClick={() => removeFav(i)}>✕</button>
              <div className={styles.favWordJp}>{f.word} <span style={{ fontSize: '0.8rem', color: 'var(--muted)' }}>{f.kanji || ''}</span></div>
              <div className={styles.favWordReading}>{f.reading}</div>
              <div className={styles.favWordMeaning}>{f.meanings[0]}</div>
            </div>
          ))
        )}
      </div>

      {/* Music Popup */}
      {musicPopup && musicLinks[musicPopup.songId] && (
        <div className="music-popup" ref={musicPopupRef} style={{ top: musicPopup.y, left: musicPopup.x, position: 'fixed', zIndex: 9999 }}>
          <div className="music-popup-title">
            <span className="material-symbols-outlined" style={{ fontSize: '1rem', verticalAlign: '-2px' }}>headphones</span> 음악 듣기
          </div>
          <a href={musicLinks[musicPopup.songId].yt} target="_blank" rel="noreferrer" className="music-popup-link music-yt">
            <span className="material-symbols-outlined" style={{ fontSize: '1rem' }}>play_circle</span> YouTube Music
          </a>
          <a href={musicLinks[musicPopup.songId].apple} target="_blank" rel="noreferrer" className="music-popup-link music-apple">
            <span className="material-symbols-outlined" style={{ fontSize: '1rem' }}>music_note</span> Apple Music
          </a>
          <a href={musicLinks[musicPopup.songId].spotify} target="_blank" rel="noreferrer" className="music-popup-link music-spotify">
            <span className="material-symbols-outlined" style={{ fontSize: '1rem' }}>graphic_eq</span> Spotify
          </a>
        </div>
      )}

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
            const wd = pinnedWord ? pinnedWord.word : hoveredWord!.word;
            const d = (wordDB as any)[wd];
            if (d) toggleFav(d);
          }}
          onTts={(txt) => speak(txt)}
        />
      )}
    </div>
  );
}
