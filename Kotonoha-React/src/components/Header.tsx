import { Link, useLocation } from 'react-router-dom';
import { MdHome, MdMenuBook, MdQuiz, MdForum, MdSettings, MdClose } from 'react-icons/md';
import { useState } from 'react';
import './Header.css';

export default function Header() {
  const [menuOpen, setMenuOpen] = useState(false);
  const location = useLocation();

  const toggleMenu = () => setMenuOpen(!menuOpen);

  const isActive = (path: string) => location.pathname === path ? 'active' : '';

  const navLinks = [
    { to: '/', title: '홈', icon: <MdHome /> },
    { to: '/study', title: '학습', icon: <MdMenuBook /> },
    { to: '/jlpt', title: 'JLPT (의사)', icon: <MdQuiz /> },
    { to: '/community', title: '커뮤니티', icon: <MdForum /> },
  ];

  return (
    <>
      <header>
        <div className="header-left">
          <button className={`hamburger ${menuOpen ? 'open' : ''}`} onClick={toggleMenu}>
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
          <Link to="/community" className={isActive('/community')}>커뮤니티</Link>
          <Link to="/settings" className={isActive('/settings')} style={{ opacity: 0.7, fontSize: '1rem', padding: '6px 10px' }}>
            <MdSettings style={{ verticalAlign: 'middle' }}/>
          </Link>
        </nav>
      </header>

      {/* Sidebar Overlay */}
      <div 
        className={`sidebar-overlay ${menuOpen ? 'open' : ''}`} 
        onClick={() => setMenuOpen(false)}
      ></div>

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
          {navLinks.map((link) => (
            <Link key={link.to} to={link.to} className={isActive(link.to)} onClick={() => setMenuOpen(false)}>
              <span className="sb-icon">{link.icon}</span>
              {link.title}
            </Link>
          ))}
          <div className="sb-divider"></div>
          <Link to="/settings" className={isActive('/settings')} onClick={() => setMenuOpen(false)}>
            <span className="sb-icon"><MdSettings /></span>
            설정
          </Link>
        </div>

        <div className="sb-footer">
          © 2026 Kotonoha App
        </div>
      </nav>
    </>
  );
}
