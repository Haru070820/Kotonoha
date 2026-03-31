import { Link } from 'react-router-dom';
import { MdPlayArrow, MdMenuBook, MdQuiz, MdSchool } from 'react-icons/md';
import kingGnuSongs from '../data/KingGnuSongs.json';
import dishSongs from '../data/DISHSongs.json';
import './Home.css';

const allSongs = [...kingGnuSongs, ...dishSongs].slice(0, 5); // Just show top 5 for layout

export default function Home() {
  return (
    <>
      <div className="hero">
        <h2>KOTONOHA LEARNING Apps</h2>
        <h1>언어를 듣다,<br/>마음을 읽다</h1>
        <p>J-POP 플레이어로 가사와 후리가나를 익히고, 나만의 단어장으로 즐겁게 일본어 실력을 키워보세요.</p>
      </div>

      <div className="today-banner-wrap">
        <div className="today-banner">
          <div>
            <div className="today-label">TODAY'S WORD</div>
            <div className="today-word">今日 <span className="today-level">N5</span></div>
            <div className="today-reading">きょう</div>
            <div className="today-meaning">오늘, 금일</div>
          </div>
          <div className="today-example">
            今日は何をしますか？<br/>(오늘은 무엇을 합니까?)
          </div>
        </div>
      </div>

      <div className="main-content container">
        
        <div className="stats-bar">
          <div className="stat-box clickable">
            <div className="stat-num">120</div>
            <div className="stat-label">외운 단어</div>
          </div>
          <div className="stat-box clickable">
            <div className="stat-num">35</div>
            <div className="stat-label">저장한 곡</div>
          </div>
          <div className="stat-box">
            <div className="stat-num">6.5<span>h</span></div>
            <div className="stat-label">총 학습 시간</div>
          </div>
          <div className="stat-box clickable">
            <div className="stat-num">Lv.3</div>
            <div className="stat-label">나의 레벨</div>
          </div>
        </div>

        <div className="section">
          <h2 className="section-title">빠른 이동 <span className="en">Shortcuts</span></h2>
          <div className="card-grid">
            <Link to="/player/king-gnu-hakujitsu" className="card card-music">
              <div className="card-badge">Music</div>
              <MdPlayArrow className="card-icon" />
              <div className="card-title">J-POP 플레이어</div>
              <div className="card-desc">가사, 후리가나와 함께<br/>노래를 들으며 학습하세요.</div>
            </Link>
            
            <Link to="/kana" className="card card-kana">
              <div className="card-badge">Kana</div>
              <MdSchool className="card-icon" />
              <div className="card-title">가나 50음도</div>
              <div className="card-desc">히라가나, 가타카나의<br/>발음과 쓰는 법을 연습하세요.</div>
            </Link>
            
            <Link to="/jlpt" className="card card-jlpt">
              <div className="card-badge">Vocab</div>
              <MdQuiz className="card-icon" />
              <div className="card-title">JLPT 단어</div>
              <div className="card-desc">N5부터 N1까지<br/>필수 어휘를 마스터하세요.</div>
            </Link>

            <Link to="/kanji" className="card card-kanji">
              <div className="card-badge">Kanji</div>
              <MdMenuBook className="card-icon" />
              <div className="card-title">상용 한자</div>
              <div className="card-desc">일본어 학습에 필수적인<br/>주요 한자 리스트입니다.</div>
            </Link>
          </div>
        </div>

        <div className="section">
          <h2 className="section-title">오리지널 추천 곡 <span className="en">Recommended</span></h2>
          <div className="song-list">
            {allSongs.map((song, index) => (
              <Link to={`/player/${song.id}`} key={song.id} className="song-item">
                <div className="song-num">{(index + 1).toString().padStart(2, '0')}</div>
                <div className="song-info">
                  <h3 className="song-title">{song.title}</h3>
                  <p className="song-artist">{song.titleKr} · {song.artist}</p>
                </div>
                <div className="song-tag">가사 지원</div>
              </Link>
            ))}
          </div>
        </div>

      </div>
    </>
  );
}
