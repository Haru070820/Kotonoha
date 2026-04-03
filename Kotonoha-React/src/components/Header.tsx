import { Link, useLocation } from 'react-router-dom';
import { MdHome, MdTranslate, MdSchool, MdMenuBook, MdMusicNote, MdSettings, MdClose } from 'react-icons/md';
import { useState, useEffect } from 'react';
import './Header.css';

export default function Header() {
  const [menuOpen, setMenuOpen] = useState(false);
  const location = useLocation();

  // Close sidebar on route change
  useEffect(() => {
    setMenuOpen(false);
  }, [location.pathname]);

  // ESC key to close
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setMenuOpen(false);
    };
    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, []);

  // Prevent body scroll when sidebar open
  useEffect(() => {
    document.body.style.overflow = menuOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [menuOpen]);

  const toggleMenu = () => setMenuOpen(!menuOpen);
  const isActive = (path: string) => location.pathname === path ? 'active' : '';

  return (
    <>
      <header>
        <div className="header-left">
          <button className={`hamburger ${menuOpen ? 'open' : ''}`} onClick={toggleMenu} aria-label="메뉴">
            <span></span>
            <span></span>
            <span></span>
          </button>
          <Link to="/" className="logo">
            <div className="logo-jp">言の葉</div>
            <div className="logo-kr">kotonoha</div>
          </Link>
        </div>

        <nav className="header-nav">
          <Link to="/" className={isActive('/')}>홈</Link>
          <Link
            to="/community"
            className={isActive('/community')}
            style={{ color: 'var(--muted)', pointerEvents: 'none', cursor: 'default' }}
            title="현재 준비 중입니다"
          >커뮤니티</Link>
          <Link to="/settings" className={isActive('/settings')} style={{ opacity: 0.7, padding: '6px 10px', display: 'flex', alignItems: 'center' }} title="설정">
            <MdSettings size={18} />
          </Link>
        </nav>
      </header>

      {/* Sidebar Overlay */}
      <div
        className={`sidebar-overlay ${menuOpen ? 'open' : ''}`}
        onClick={() => setMenuOpen(false)}
      />

      {/* Slide Sidebar */}
      <nav className={`slide-sidebar ${menuOpen ? 'open' : ''}`}>
        <div className="sb-header">
          <Link to="/" className="sb-logo" onClick={() => setMenuOpen(false)}>
            <div className="sb-logo-jp">言の葉</div>
            <div className="sb-logo-kr">kotonoha</div>
          </Link>
          <button className="sb-close" onClick={() => setMenuOpen(false)}>
            <MdClose />
          </button>
        </div>

        <div className="sb-nav">
          <Link to="/" className={isActive('/')} onClick={() => setMenuOpen(false)}>
            <span className="sb-icon"><MdHome /></span>홈
          </Link>
          <Link to="/kana" className={isActive('/kana')} onClick={() => setMenuOpen(false)}>
            <span className="sb-icon"><MdTranslate /></span>가나
          </Link>
          <Link to="/jlpt" className={isActive('/jlpt')} onClick={() => setMenuOpen(false)}>
            <span className="sb-icon"><MdSchool /></span>JLPT
          </Link>
          <Link to="/kanji" className={isActive('/kanji')} onClick={() => setMenuOpen(false)}>
            <span className="sb-icon"><MdMenuBook /></span>한자
          </Link>
          <Link to="/player" className={location.pathname.startsWith('/player') ? 'active' : ''} onClick={() => setMenuOpen(false)}>
            <span className="sb-icon"><MdMusicNote /></span>가사 학습
          </Link>
          <Link to="/grammar" className={isActive('/grammar')} onClick={() => setMenuOpen(false)}>
            <span className="sb-icon"><MdSchool /></span>문법 배우기
          </Link>
          <div className="sb-divider"></div>
          <Link to="/settings" className={isActive('/settings')} onClick={() => setMenuOpen(false)}>
            <span className="sb-icon"><MdSettings /></span>설정
          </Link>
        </div>

        <div className="sb-footer">
          言の葉 코토노하 v2
        </div>
      </nav>
    </>
  );
}
