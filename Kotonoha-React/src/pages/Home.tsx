import { useState, useEffect, useMemo, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { kanjiDB } from '../data/kanjiDB';
import { useSettings } from '../hooks/useSettings';
import { useBookmarks } from '../hooks/useBookmarks';
import './Home.css';

// ── 홈 노래 목록 ──
const homeSongs = [
  { id:1, title:'猫',         titleKr:'고양이',    artist:'DISH//',   tag:'추천', level:'N3' },
  { id:3, title:'カメレオン',  titleKr:'카멜레온',  artist:'King Gnu', tag:'인기', level:'N2' },
  { id:4, title:'ヒッチコック',titleKr:'히치콕',   artist:'Yorushika', tag:'추천', level:'N3' },
  { id:5, title:'沈丁花',     titleKr:'서향꽃',   artist:'DISH//',   tag:'신규', level:'N4' },
  { id:6, title:'忘れてください', titleKr:'잊어주세요', artist:'Yorushika', tag:'추천', level:'N3' },
  { id:7, title:'悪食',       titleKr:'악식',     artist:'pompadols', tag:'신규', level:'N3' },
  { id:8, title:'Sparkle',   titleKr:'스파클',   artist:'RADWIMPS', tag:'인기', level:'N2' },
];

// ── 음악 스트리밍 링크 ──
const musicLinks: Record<number, { yt: string; apple: string; spotify: string }> = {
  1: { yt:'https://music.youtube.com/search?q=DISH%2F%2F+%E7%8C%AB', apple:'https://music.apple.com/search?term=DISH+%E7%8C%AB', spotify:'https://open.spotify.com/search/DISH%20%E7%8C%AB' },
  3: { yt:'https://music.youtube.com/search?q=King+Gnu+%E3%82%AB%E3%83%A1%E3%83%AC%E3%82%AA%E3%83%B3', apple:'https://music.apple.com/search?term=King+Gnu+%E3%82%AB%E3%83%A1%E3%83%AC%E3%82%AA%E3%83%B3', spotify:'https://open.spotify.com/search/King%20Gnu%20%E3%82%AB%E3%83%A1%E3%83%AC%E3%82%AA%E3%83%B3' },
  4: { yt:'https://music.youtube.com/search?q=Yorushika+%E3%83%92%E3%83%83%E3%83%81%E3%82%B3%E3%83%83%E3%82%AF', apple:'https://music.apple.com/search?term=Yorushika+Hitchcock', spotify:'https://open.spotify.com/search/Yorushika%20%E3%83%92%E3%83%83%E3%83%81%E3%82%B3%E3%83%83%E3%82%AF' },
  5: { yt:'https://music.youtube.com/search?q=DISH%2F%2F+%E6%B2%88%E4%B8%81%E8%8A%B1', apple:'https://music.apple.com/search?term=DISH+%E6%B2%88%E4%B8%81%E8%8A%B1', spotify:'https://open.spotify.com/search/DISH%20%E6%B2%88%E4%B8%81%E8%8A%B1' },
  6: { yt:'https://music.youtube.com/search?q=Yorushika+%E5%BF%98%E3%82%8C%E3%81%A6%E3%81%8F%E3%81%A0%E3%81%95%E3%81%84', apple:'https://music.apple.com/search?term=Yorushika+%E5%BF%98%E3%82%8C%E3%81%A6%E3%81%8F%E3%81%A0%E3%81%95%E3%81%84', spotify:'https://open.spotify.com/search/Yorushika%20%E5%BF%98%E3%82%8C%E3%81%A6%E3%81%8F%E3%81%A0%E3%81%95%E3%81%84' },
  7: { yt:'https://music.youtube.com/search?q=pompadols+%E6%82%AA%E9%A3%9F', apple:'https://music.apple.com/search?term=pompadols+%E6%82%AA%E9%A3%9F', spotify:'https://open.spotify.com/search/pompadols%20%E6%82%AA%E9%A3%9F' },
  8: { yt:'https://music.youtube.com/search?q=RADWIMPS+Sparkle', apple:'https://music.apple.com/search?term=RADWIMPS+Sparkle', spotify:'https://open.spotify.com/search/RADWIMPS%20Sparkle' },
};

// ── 오늘의 단어 ──
const todayWords = [
  {word:'美しい',reading:'うつくしい · utsukushii',meaning:'아름답다, 예쁘다',level:'N3', example:'美しい景色に感動しました。', ex_ko:'아름다운 경치에 감동했습니다.'},
  {word:'夢',    reading:'ゆめ · yume',             meaning:'꿈',              level:'N4', example:'私の夢は歌手になることです。', ex_ko:'제 꿈은 가수가 되는 것입니다.'},
  {word:'輝く',  reading:'かがやく · kagayaku',     meaning:'빛나다, 반짝이다',level:'N3', example:'夜空に星が輝いています。', ex_ko:'밤하늘에 별이 반짝이고 있습니다.'},
  {word:'懐かしい',reading:'なつかしい · natsukashii',meaning:'그립다, 옛날 생각이 나다',level:'N2', example:'昔の写真を見ると懐かしい気分になる。', ex_ko:'옛날 사진을 보면 그리운 기분이 든다.'},
  {word:'切ない',reading:'せつない · setsunai',      meaning:'가슴이 아프다, 애틋하다',level:'N2', example:'秋の風が吹くと、少し切ない。', ex_ko:'가을바람이 불면 조금 애틋하다.'},
  {word:'儚い',  reading:'はかない · hakanai',       meaning:'덧없다, 무상하다',level:'N1', example:'人の命は儚いものだ。', ex_ko:'사람의 목숨은 덧없는 것이다.'},
  {word:'勇気',  reading:'ゆうき · yūki',            meaning:'용기',            level:'N4', example:'勇気があれば、何でもできます。', ex_ko:'용기가 있다면 무엇이든 할 수 있습니다.'},
];

// ── 아티스트 데이터 ──
const artistData = [
  { name:'DISH//',    initial:'D',  gradient:'linear-gradient(135deg,#d4a017,#f7c948)', songs:[1,5] },
  { name:'Yorushika', initial:'Y',  gradient:'linear-gradient(135deg,#6e48aa,#9d50bb)', songs:[4,6] },
  { name:'King Gnu',  initial:'K',  gradient:'linear-gradient(135deg,#2c3e50,#3498db)', songs:[3] },
  { name:'pompadols', initial:'P',  gradient:'linear-gradient(135deg,#e74c3c,#f39c12)', songs:[7] },
  { name:'RADWIMPS',  initial:'R',  gradient:'linear-gradient(135deg,#e67e22,#e74c3c)', songs:[8] },
];

export default function Home() {
  const navigate = useNavigate();
  const { settings } = useSettings();
  const { toggleBookmark, isBookmarked } = useBookmarks();

  // ── 상태 ──
  const [currentMusicTab, setCurrentMusicTab] = useState<'popular' | 'new' | 'artist' | 'popular-all' | 'new-all'>('popular');
  const [favArtists, setFavArtists] = useState<string[]>([]);
  const [musicPopup, setMusicPopup] = useState<{ songId: number; x: number; y: number } | null>(null);
  const [favModalOpen, setFavModalOpen] = useState(false);
  const [kanjiModalOpen, setKanjiModalOpen] = useState(false);
  const musicPopupRef = useRef<HTMLDivElement>(null);

  // ── 통계 ──
  const [stats, setStats] = useState({ favCount: 0, kanjiCount: 0, likedCount: 0, bookmarkCount: 0 });

  useEffect(() => {
    const favs = JSON.parse(localStorage.getItem('kotonoha_favs') || '[]');
    const kanji = JSON.parse(localStorage.getItem('kotonoha_kanji_done') || '[]');
    const likes = JSON.parse(localStorage.getItem('kotonoha_song_likes') || '[]');
    const bms = JSON.parse(localStorage.getItem('kotonoha_song_bookmarks') || '[]');
    setStats({ favCount: favs.length, kanjiCount: kanji.length, likedCount: likes.length, bookmarkCount: bms.length });
  }, [favModalOpen, kanjiModalOpen]);

  // ── 아티스트 즐겨찾기 ──
  useEffect(() => {
    try {
      const stored = localStorage.getItem('kotonoha_fav_artists');
      if (stored) setFavArtists(JSON.parse(stored));
    } catch { /* ignore */ }
  }, []);

  const toggleArtistFav = (name: string) => {
    setFavArtists(prev => {
      const next = prev.includes(name) ? prev.filter(n => n !== name) : [...prev, name];
      localStorage.setItem('kotonoha_fav_artists', JSON.stringify(next));
      return next;
    });
  };

  // ── 뮤직 팝업 외부 클릭 닫기 ──
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

  // ── ESC로 모달 닫기 ──
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') { setFavModalOpen(false); setKanjiModalOpen(false); }
    };
    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, []);

  // ── 오늘의 카드 ──
  const todayCard = useMemo(() => {
    const day = new Date().getDate();
    if (settings.todayCardMode === 'kanji') {
      const allKanji: any[] = [];
      for (const lvl in kanjiDB) {
        (kanjiDB as any)[lvl].forEach((k: any) => allKanji.push({ ...k, level: lvl }));
      }
      if (allKanji.length === 0) return null;
      const item = allKanji[day % allKanji.length];
      const reading = [item.on, item.kun].filter(Boolean).join(' · ');
      const meaning = [item.kr ? `[${item.kr}]` : '', item.meaning].filter(Boolean).join(' ');
      return { type: 'kanji' as const, word: item.k, reading, meaning, level: item.level, example: '', ex_ko: '', link: '/kanji' };
    } else {
      const tw = todayWords[day % todayWords.length];
      return { type: 'word' as const, word: tw.word, reading: tw.reading, meaning: tw.meaning, level: tw.level, example: tw.example, ex_ko: tw.ex_ko, link: '/jlpt' };
    }
  }, [settings.todayCardMode]);

  // ── 미리보기 데이터 ──
  const popularSongs = homeSongs.filter(s => s.tag === '인기' || s.tag === '추천');
  const newSongs = homeSongs.filter(s => s.tag === '신규');

  // ── 현재 탭 표시 데이터 ──
  const baseTab = currentMusicTab.replace('-all', '') as 'popular' | 'new' | 'artist';

  // ── 즐겨찾기 모달 데이터 ──
  const favList = useMemo(() => {
    try { return JSON.parse(localStorage.getItem('kotonoha_favs') || '[]'); } catch { return []; }
  }, [favModalOpen]);

  const deleteFav = (index: number) => {
    const favs = JSON.parse(localStorage.getItem('kotonoha_favs') || '[]');
    favs.splice(index, 1);
    localStorage.setItem('kotonoha_favs', JSON.stringify(favs));
    setFavModalOpen(false);
    setTimeout(() => setFavModalOpen(true), 0);
  };

  // ── 한자 모달 데이터 ──
  const kanjiDone = useMemo(() => {
    try { return JSON.parse(localStorage.getItem('kotonoha_kanji_done') || '[]'); } catch { return []; }
  }, [kanjiModalOpen]);

  // ── 노래 카드 렌더 ──
  const SongCard = ({ s, i }: { s: typeof homeSongs[0]; i: number }) => {
    const bm = isBookmarked(s.id);
    return (
      <Link to={`/player/${s.id}`} className="song-item">
        <span className="song-num">{String(i + 1).padStart(2, '0')}</span>
        <div className="song-info">
          <div className="song-title">{s.title} ({s.titleKr})</div>
          <div className="song-artist">{s.artist}</div>
        </div>
        <div className="song-actions" onClick={e => { e.preventDefault(); e.stopPropagation(); }}>
          <button className={`song-bm-btn${bm ? ' on' : ''}`} onClick={() => toggleBookmark(s.id)} title="북마크">
            <span className={`material-symbols-outlined${bm ? ' ms-filled' : ''}`} style={{ fontSize: '1.1rem' }}>bookmark</span>
          </button>
          <button className="song-music-btn" onClick={(e) => {
            const rect = (e.target as HTMLElement).closest('button')!.getBoundingClientRect();
            setMusicPopup({ songId: s.id, x: Math.min(rect.left, window.innerWidth - 200), y: rect.bottom + 6 });
          }} title="음악 듣기">
            <span className="material-symbols-outlined" style={{ fontSize: '1.1rem' }}>headphones</span>
          </button>
        </div>
        <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
          {s.level && <span className="song-tag" style={{ color: 'var(--accent-gold)', borderColor: 'var(--accent-gold)', fontWeight: 700 }}>{s.level}</span>}
          <span className="song-tag">{s.tag}</span>
        </div>
      </Link>
    );
  };

  // ── 바로가기 링크 정보 ──
  const gotoInfo = baseTab === 'popular'
    ? { title: '인기 곡 바로가기', desc: '인기 · 추천 곡 가사 학습하기' }
    : baseTab === 'new'
    ? { title: '최신 곡 바로가기', desc: '최신 곡 가사 학습하기' }
    : { title: '전체 곡 바로가기', desc: '전체 노래 가사 학습하기' };

  return (
    <>
      <section className="hero">
        <h2>J-POP으로 배우는</h2>
        <h1>日本語 学習</h1>
        <p>좋아하는 노래 가사를 분석하며 자연스럽게 일본어를 익혀보세요. 단어 뜻과 발음을 바로 확인하고, 즐겨찾기로 나만의 단어장을 만들 수 있어요.</p>
      </section>

      {/* 오늘의 카드 */}
      {todayCard && (
        <div className="today-banner-wrap">
          <div className="today-banner" onClick={() => navigate(todayCard.link)}>
            <div>
              <div className="today-label">{todayCard.type === 'kanji' ? "TODAY'S KANJI" : "TODAY'S WORD"}</div>
              <div className="today-word" id="todayWord">{todayCard.word}</div>
              <div className="today-reading" id="todayReading">{todayCard.reading}</div>
            </div>
            <div>
              <div className="today-meaning" id="todayMeaning">{todayCard.meaning}</div>
              {todayCard.example && (
                <div className="today-example" id="todayExample">
                  {todayCard.example}<br />
                  <span style={{ opacity: 0.85, fontSize: '0.82rem' }}>[{todayCard.ex_ko}]</span>
                </div>
              )}
              <div style={{ marginTop: 12, textAlign: 'right' }}>
                <span className="today-level" id="todayLevel">{todayCard.level}</span>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="main-content">
        {/* 통계 바 */}
        <div className="stats-bar">
          <div className="stat-box clickable" onClick={() => setFavModalOpen(true)}>
            <div className="stat-num">{stats.favCount}</div>
            <div className="stat-label">즐겨찾기 단어</div>
          </div>
          <div className="stat-box clickable" onClick={() => setKanjiModalOpen(true)}>
            <div className="stat-num">{stats.kanjiCount}</div>
            <div className="stat-label">학습 완료 한자</div>
          </div>
          <div className="stat-box clickable" onClick={() => navigate('/player')}>
            <div className="stat-num">{stats.likedCount}</div>
            <div className="stat-label">좋아요 노래</div>
          </div>
          <div className="stat-box clickable" onClick={() => navigate('/player')}>
            <div className="stat-num">{stats.bookmarkCount}</div>
            <div className="stat-label">북마크 노래</div>
          </div>
        </div>

        {/* 음악으로 배우기 */}
        <div className="section">
          <div className="section-title">음악으로 배우기 <span className="en">Learn through Music</span></div>

          {/* 탭 */}
          <div className="music-tabs">
            <button className={`music-tab ${baseTab === 'popular' ? 'active' : ''}`} onClick={() => setCurrentMusicTab('popular')}>
              <span className="material-symbols-outlined" style={{ fontSize: '1rem' }}>local_fire_department</span> 인기 곡
            </button>
            <button className={`music-tab ${baseTab === 'new' ? 'active' : ''}`} onClick={() => setCurrentMusicTab('new')}>
              <span className="material-symbols-outlined" style={{ fontSize: '1rem' }}>new_releases</span> 최신 곡
            </button>
            <button className={`music-tab ${baseTab === 'artist' ? 'active' : ''}`} onClick={() => setCurrentMusicTab('artist')}>
              <span className="material-symbols-outlined" style={{ fontSize: '1rem' }}>person</span> 가수 별
            </button>
          </div>

          {/* 인기 곡 패널 */}
          {currentMusicTab === 'popular' && (
            <div className="music-panel">
              <div className="music-panel-header">
                <span className="music-panel-label">
                  <span className="material-symbols-outlined" style={{ fontSize: '1rem', color: 'var(--accent-gold)', verticalAlign: '-2px' }}>local_fire_department</span> 인기 곡
                </span>
                <button className="music-more-btn" onClick={() => setCurrentMusicTab('popular-all')}>전체 보기 →</button>
              </div>
              <div className="music-preview">
                {popularSongs.slice(0, 2).map((s, i) => <SongCard key={s.id} s={s} i={i} />)}
              </div>
            </div>
          )}

          {/* 최신 곡 패널 */}
          {currentMusicTab === 'new' && (
            <div className="music-panel">
              <div className="music-panel-header">
                <span className="music-panel-label">
                  <span className="material-symbols-outlined" style={{ fontSize: '1rem', color: 'var(--accent-gold)', verticalAlign: '-2px' }}>new_releases</span> 최신 곡
                </span>
                <button className="music-more-btn" onClick={() => setCurrentMusicTab('new-all')}>전체 보기 →</button>
              </div>
              <div className="music-preview">
                {newSongs.slice(0, 2).map((s, i) => <SongCard key={s.id} s={s} i={i} />)}
              </div>
            </div>
          )}

          {/* 가수 별 패널 */}
          {currentMusicTab === 'artist' && (
            <div className="music-panel">
              <div className="music-panel-header">
                <span className="music-panel-label">
                  <span className="material-symbols-outlined" style={{ fontSize: '1rem', color: 'var(--accent-gold)', verticalAlign: '-2px' }}>person</span> 가수 별
                </span>
                <button className="music-more-btn" onClick={() => navigate('/player')}>전체 보기 →</button>
              </div>
              <div className="artist-grid">
                {artistData.map(a => {
                  const fav = favArtists.includes(a.name);
                  return (
                    <div className="artist-card" key={a.name}>
                      <Link to={`/player/${a.songs[0]}`} className="artist-img-wrap" style={{ background: a.gradient }}>
                        <span className="artist-initial">{a.initial}</span>
                      </Link>
                      <div className="artist-card-info">
                        <span className="artist-card-name">{a.name}</span>
                        <span className="artist-card-count">{a.songs.length}곡</span>
                        <button className={`artist-fav-btn${fav ? ' on' : ''}`} onClick={() => toggleArtistFav(a.name)} title="즐겨찾기">
                          <span className={`material-symbols-outlined${fav ? ' ms-filled' : ''}`} style={{ fontSize: '1rem' }}>favorite</span>
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* 전체 곡 리스트 (인기/최신 전체보기) */}
          {(currentMusicTab === 'popular-all' || currentMusicTab === 'new-all') && (
            <div className="music-panel">
              <div className="music-panel-header">
                <span className="music-panel-label" id="fullListLabel">
                  {currentMusicTab === 'popular-all' ? (
                    <><span className="material-symbols-outlined" style={{ fontSize: '1rem', color: 'var(--accent-gold)', verticalAlign: '-2px' }}>local_fire_department</span> 인기 · 추천 곡</>
                  ) : (
                    <><span className="material-symbols-outlined" style={{ fontSize: '1rem', color: 'var(--accent-gold)', verticalAlign: '-2px' }}>new_releases</span> 최신 곡</>
                  )}
                </span>
                <button className="music-more-btn" onClick={() => setCurrentMusicTab('popular')}>← 돌아가기</button>
              </div>
              <div className="song-list">
                {(currentMusicTab === 'popular-all' ? popularSongs : newSongs).map((s, i) => (
                  <SongCard key={s.id} s={s} i={i} />
                ))}
              </div>
              {(currentMusicTab === 'popular-all' ? popularSongs : newSongs).length === 0 && (
                <div className="song-no-result">검색 결과가 없어요 🎵</div>
              )}
            </div>
          )}

          {/* 플레이어 바로가기 */}
          <Link to="/player" className="song-item player-goto-item" style={{ marginTop: 12 }}>
            <span className="song-num" style={{ color: 'var(--accent-gold)' }}>▶</span>
            <div className="song-info">
              <div className="song-title" style={{ color: 'var(--accent-gold)' }}>{gotoInfo.title}</div>
              <div className="song-artist">{gotoInfo.desc}</div>
            </div>
            <span className="song-tag" style={{ borderColor: 'var(--accent-gold)', color: 'var(--accent-gold)' }}>이동</span>
          </Link>
        </div>

        {/* 학습 메뉴 */}
        <div className="section">
          <div className="section-title">학습 메뉴 <span className="en">Study Menu</span></div>
          <div className="card-grid">
            <Link to="/kana" className="card card-kana">
              <div className="card-icon"><span className="material-symbols-outlined" style={{ fontSize: '2rem' }}>translate</span></div>
              <div className="card-title">히라가나 &amp; 가타카나</div>
              <div className="card-desc">50음도표와 함께 기초 문자를 익혀보세요</div>
            </Link>
            <Link to="/jlpt" className="card card-jlpt">
              <div className="card-icon"><span className="material-symbols-outlined" style={{ fontSize: '2rem' }}>school</span></div>
              <div className="card-title">JLPT 단어 학습</div>
              <div className="card-desc">N5부터 N1까지 급수별 필수 단어를 암기하세요</div>
              <span className="card-badge">N5~N1</span>
            </Link>
            <Link to="/kanji" className="card card-kanji">
              <div className="card-icon" style={{ fontFamily: "'Noto Serif JP',serif", fontSize: '2rem', fontWeight: 900 }}>字</div>
              <div className="card-title">상용한자 2136자</div>
              <div className="card-desc">JLPT 급수별 한자를 학습하고 완료 체크하세요</div>
              <span className="card-badge">2136字</span>
            </Link>
            <Link to="/player" className="card card-music">
              <div className="card-icon"><span className="material-symbols-outlined" style={{ fontSize: '2rem' }}>music_note</span></div>
              <div className="card-title">J-POP 가사 학습</div>
              <div className="card-desc">노래 가사에서 단어를 찾고 즐겨찾기로 저장하세요</div>
            </Link>
          </div>
        </div>
      </div>

      {/* 음악 팝업 */}
      {musicPopup && musicLinks[musicPopup.songId] && (
        <div className="music-popup" ref={musicPopupRef} style={{ top: musicPopup.y, left: musicPopup.x }}>
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

      {/* 즐겨찾기 모달 */}
      {favModalOpen && (
        <div className="modal-overlay open" onClick={e => { if (e.target === e.currentTarget) setFavModalOpen(false); }}>
          <div className="modal-box">
            <div className="modal-header">
              <div className="modal-title">
                <span className="material-symbols-outlined ms-filled" style={{ fontSize: '1.1rem', color: 'var(--accent-gold)', verticalAlign: '-2px', marginRight: 4 }}>star</span> 즐겨찾기 단어
              </div>
              <button className="modal-close" onClick={() => setFavModalOpen(false)}>✕</button>
            </div>
            <div className="modal-body">
              {favList.length === 0 ? (
                <div className="modal-empty">
                  <div className="big"><span className="material-symbols-outlined" style={{ fontSize: '2.5rem' }}>star</span></div>
                  아직 즐겨찾기한 단어가 없어요.<br /><small>가사 학습에서 단어를 클릭해 추가해보세요!</small>
                </div>
              ) : (
                <>
                  <div style={{ fontSize: '0.75rem', color: 'var(--muted)', marginBottom: 10 }}>{favList.length} / {settings.favLimit}개</div>
                  {favList.map((f: any, i: number) => (
                    <div className="fav-item" key={i}>
                      <div className="fav-jp">{f.word}</div>
                      <div className="fav-info">
                        <div className="fav-reading">{f.reading || ''}</div>
                        <div className="fav-meaning">{Array.isArray(f.meanings) ? f.meanings.join(' · ') : (f.meaning || '')}</div>
                      </div>
                      <button className="fav-delete" onClick={() => deleteFav(i)} title="삭제">
                        <span className="material-symbols-outlined" style={{ fontSize: '1rem' }}>delete</span>
                      </button>
                    </div>
                  ))}
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* 한자 모달 */}
      {kanjiModalOpen && (
        <div className="modal-overlay open" onClick={e => { if (e.target === e.currentTarget) setKanjiModalOpen(false); }}>
          <div className="modal-box">
            <div className="modal-header">
              <div className="modal-title">
                <span className="material-symbols-outlined ms-filled" style={{ fontSize: '1.1rem', color: 'var(--accent-green)', verticalAlign: '-2px', marginRight: 4 }}>check_circle</span> 학습 완료 한자
              </div>
              <button className="modal-close" onClick={() => setKanjiModalOpen(false)}>✕</button>
            </div>
            <div className="modal-body">
              {kanjiDone.length === 0 ? (
                <div className="modal-empty">
                  <div className="big"><span className="material-symbols-outlined" style={{ fontSize: '2.5rem' }}>menu_book</span></div>
                  아직 완료한 한자가 없어요.<br /><small>한자 탭에서 학습 완료 체크를 해보세요!</small>
                </div>
              ) : (
                <>
                  <div style={{ marginBottom: 10, fontSize: '0.78rem', color: 'var(--muted)' }}>총 {kanjiDone.length}자 완료</div>
                  <div className="kanji-grid-modal">
                    {kanjiDone.map((k: string) => (
                      <div className="kanji-item" key={k} title={k}>{k}</div>
                    ))}
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
