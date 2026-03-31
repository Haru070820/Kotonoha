import { Link } from 'react-router-dom';
import { MdTranslate, MdSchool, MdMenuBook, MdBook } from 'react-icons/md';
import './Study.css';

export default function Study() {
  const menus = [
    { to: '/kana', title: '가나 (Kana)', subtitle: '기초 오십음도', icon: <MdTranslate size={32} /> },
    { to: '/jlpt', title: 'JLPT 단어', subtitle: '급수별 단어장', icon: <MdSchool size={32} /> },
    { to: '/kanji', title: '상용한자', subtitle: '단계별 한자', icon: <MdMenuBook size={32} /> },
    { to: '/grammar', title: '필수 문법', subtitle: '기초 문법 요소', icon: <MdBook size={32} /> },
  ];

  return (
    <div className="study-container">
      <h1 className="page-title">학습 메뉴</h1>
      <div className="study-grid">
        {menus.map(menu => (
          <Link to={menu.to} key={menu.to} className="card study-card">
            <div className="icon-circle">{menu.icon}</div>
            <h3 className="study-title">{menu.title}</h3>
            <p className="study-subtitle">{menu.subtitle}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
