import { useState, useEffect } from 'react';
import { useSettings } from '../hooks/useSettings';
import { useTTS } from '../hooks/useTTS';
import styles from './Settings.module.css';

export default function Settings() {
  const { settings, updateSettings } = useSettings();
  const { speak } = useTTS();
  const [saveMsg, setSaveMsg] = useState('변경 사항이 자동 저장됩니다');
  const [saved, setSaved] = useState(false);

  // ── 데이터 통계 ──
  const [dataStats, setDataStats] = useState({ favs: 0, kanji: 0, likes: 0, bms: 0 });

  const refreshDataStats = () => {
    const favs = JSON.parse(localStorage.getItem('kotonoha_favs') || '[]');
    const kanji = JSON.parse(localStorage.getItem('kotonoha_kanji_done') || '[]');
    const likes = JSON.parse(localStorage.getItem('kotonoha_song_likes') || '[]');
    const bms = JSON.parse(localStorage.getItem('kotonoha_song_bookmarks') || '[]');
    setDataStats({ favs: favs.length, kanji: kanji.length, likes: likes.length, bms: bms.length });
  };

  useEffect(() => { refreshDataStats(); }, []);

  const showSaved = (msg?: string) => {
    setSaveMsg(msg || '✓ 자동 저장됨');
    setSaved(true);
    setTimeout(() => { setSaveMsg('변경 사항이 자동 저장됩니다'); setSaved(false); }, 2000);
  };

  const handleToggle = (key: string, value: boolean) => {
    updateSettings({ [key]: value } as any);
    showSaved();
  };

  const handleFavLimitChange = (delta: number) => {
    let limit = (settings.favLimit || 50) + delta;
    if (limit < 10) limit = 10;
    if (limit > 500) limit = 500;
    updateSettings({ favLimit: limit });
    showSaved();
  };

  const setFavLimit = (val: number) => {
    updateSettings({ favLimit: val });
    showSaved();
  };

  const clearData = (key: string, label: string) => {
    if (!window.confirm(`${label}를 모두 삭제할까요?\n이 작업은 되돌릴 수 없습니다.`)) return;
    localStorage.removeItem(key);
    refreshDataStats();
    showSaved('삭제 완료');
  };

  const clearLikesBM = () => {
    if (!window.confirm('좋아요와 북마크를 모두 삭제할까요?')) return;
    localStorage.removeItem('kotonoha_song_likes');
    localStorage.removeItem('kotonoha_song_bookmarks');
    refreshDataStats();
    showSaved('삭제 완료');
  };

  return (
    <>
      <div className={styles.hero}>
        <h1>⚙️ 설정</h1>
        <p>코토노하를 나에게 맞게 설정해보세요</p>
      </div>

      <div className={styles.wrap}>
        {/* 화면 설정 */}
        <div className={styles.section}>
          <div className={styles.sectionTitle}>🌙 화면 설정</div>

          <div className={styles.row}>
            <div className={styles.rowInfo}>
              <div className={styles.rowLabel}>다크 모드</div>
              <div className={styles.rowDesc}>어두운 배경으로 눈의 피로를 줄여요</div>
            </div>
            <label className={styles.toggleSwitch}>
              <input type="checkbox" checked={settings.darkMode} onChange={e => handleToggle('darkMode', e.target.checked)} />
              <span className={styles.toggleSlider}></span>
            </label>
          </div>

          <div className={styles.row}>
            <div className={styles.rowInfo}>
              <div className={styles.rowLabel}>홈 화면 오늘의 카드</div>
              <div className={styles.rowDesc}>홈 화면 상단에 표시될 '오늘의 단어'를 선택하세요</div>
            </div>
            <div className={styles.segmentControl} style={{ minWidth: 160 }}>
              <button className={`${styles.segmentBtn} ${settings.todayCardMode === 'word' ? styles.active : ''}`} onClick={() => { updateSettings({ todayCardMode: 'word' }); showSaved(); }}>단어</button>
              <button className={`${styles.segmentBtn} ${settings.todayCardMode === 'kanji' ? styles.active : ''}`} onClick={() => { updateSettings({ todayCardMode: 'kanji' }); showSaved(); }}>한자</button>
            </div>
          </div>
        </div>

        {/* TTS 설정 */}
        <div className={styles.section}>
          <div className={styles.sectionTitle}>🔊 TTS 음성 설정</div>

          <div className={styles.row}>
            <div className={styles.rowInfo}>
              <div className={styles.rowLabel}>발음 미리보기</div>
              <div className={styles.rowDesc}>음성으로 테스트 발음을 들어보세요</div>
            </div>
            <button
              className={styles.ttsTestBtn}
              onClick={() => speak('こんにちは、コトノハへようこそ')}
            >
              <span className="material-symbols-outlined" style={{ fontSize: '1rem' }}>volume_up</span> 테스트 듣기
            </button>
          </div>
        </div>

        {/* 가사 표시 설정 */}
        <div className={styles.section}>
          <div className={styles.sectionTitle}>🎵 가사 표시 설정</div>

          <div className={styles.row}>
            <div className={styles.rowInfo}>
              <div className={styles.rowLabel}>요미가나 · 후리가나</div>
              <div className={styles.rowDesc}>한자 위에 히라가나 독음을 표시해요</div>
            </div>
            <label className={styles.toggleSwitch}>
              <input type="checkbox" checked={settings.yomigana} onChange={e => handleToggle('yomigana', e.target.checked)} />
              <span className={styles.toggleSlider}></span>
            </label>
          </div>

          <div className={styles.row}>
            <div className={styles.rowInfo}>
              <div className={styles.rowLabel}>로마자 표기 (발음)</div>
              <div className={styles.rowDesc}>가사 아래 한국어 발음 표기를 표시해요</div>
            </div>
            <label className={styles.toggleSwitch}>
              <input type="checkbox" checked={settings.romaji} onChange={e => handleToggle('romaji', e.target.checked)} />
              <span className={styles.toggleSlider}></span>
            </label>
          </div>

          <div className={styles.row}>
            <div className={styles.rowInfo}>
              <div className={styles.rowLabel}>문법 학습 모드</div>
              <div className={styles.rowDesc}>가사에서 주요 조사와 어미를 강조하고 설명을 표시해요</div>
            </div>
            <label className={styles.toggleSwitch}>
              <input type="checkbox" checked={settings.grammarMode} onChange={e => handleToggle('grammarMode', e.target.checked)} />
              <span className={styles.toggleSlider}></span>
            </label>
          </div>

          <div className={styles.row}>
            <div className={styles.rowInfo}>
              <div className={styles.rowLabel}>한국어 번역</div>
              <div className={styles.rowDesc}>각 가사 줄 아래 한국어 번역을 표시해요</div>
            </div>
            <label className={styles.toggleSwitch}>
              <input type="checkbox" checked={settings.korean} onChange={e => handleToggle('korean', e.target.checked)} />
              <span className={styles.toggleSlider}></span>
            </label>
          </div>
        </div>

        {/* 즐겨찾기 설정 */}
        <div className={styles.section}>
          <div className={styles.sectionTitle}>★ 즐겨찾기 설정</div>

          <div className={styles.row}>
            <div className={styles.rowInfo}>
              <div className={styles.rowLabel}>즐겨찾기 단어 최대 개수</div>
              <div className={styles.rowDesc}>가사 학습에서 저장할 수 있는 최대 단어 수</div>
            </div>
            <div className={styles.limitBtns}>
              <button className={styles.limitBtn} onClick={() => handleFavLimitChange(-10)}>−</button>
              <div className={styles.favLimitDisplay}>{settings.favLimit}</div>
              <button className={styles.limitBtn} onClick={() => handleFavLimitChange(10)}>+</button>
            </div>
          </div>

          <div className={styles.row} style={{ flexDirection: 'column', alignItems: 'flex-start', gap: 10 }}>
            <div className={styles.rowLabel}>빠른 선택</div>
            <div className={styles.segmentControl}>
              {[30, 50, 100, 200].map(v => (
                <button key={v} className={`${styles.segmentBtn} ${settings.favLimit === v ? styles.active : ''}`} onClick={() => setFavLimit(v)}>{v}개</button>
              ))}
            </div>
          </div>
        </div>

        {/* 데이터 관리 */}
        <div className={styles.section}>
          <div className={styles.sectionTitle}>🗂️ 데이터 관리</div>

          <div className={styles.row} style={{ flexDirection: 'column', alignItems: 'flex-start', gap: 10 }}>
            <div className={styles.rowLabel}>저장된 데이터</div>
            <div className={styles.dataChips}>
              <div className={styles.dataChip}>즐겨찾기 단어 <strong>{dataStats.favs}개</strong></div>
              <div className={styles.dataChip}>완료 한자 <strong>{dataStats.kanji}자</strong></div>
              <div className={styles.dataChip}>좋아요 노래 <strong>{dataStats.likes}곡</strong></div>
              <div className={styles.dataChip}>북마크 노래 <strong>{dataStats.bms}곡</strong></div>
            </div>
          </div>

          <div className={styles.row}>
            <div className={styles.rowInfo}>
              <div className={styles.rowLabel}>즐겨찾기 단어 초기화</div>
              <div className={styles.rowDesc}>저장된 모든 즐겨찾기 단어를 삭제해요</div>
            </div>
            <button className={styles.dangerBtn} onClick={() => clearData('kotonoha_favs', '즐겨찾기 단어')}>초기화</button>
          </div>

          <div className={styles.row}>
            <div className={styles.rowInfo}>
              <div className={styles.rowLabel}>한자 학습 기록 초기화</div>
              <div className={styles.rowDesc}>완료 체크한 모든 한자 기록을 삭제해요</div>
            </div>
            <button className={styles.dangerBtn} onClick={() => clearData('kotonoha_kanji_done', '한자 학습 기록')}>초기화</button>
          </div>

          <div className={styles.row}>
            <div className={styles.rowInfo}>
              <div className={styles.rowLabel}>좋아요 · 북마크 초기화</div>
              <div className={styles.rowDesc}>노래 좋아요와 북마크를 모두 삭제해요</div>
            </div>
            <button className={styles.dangerBtn} onClick={clearLikesBM}>초기화</button>
          </div>
        </div>
      </div>

      {/* 저장 바 */}
      <div className={styles.saveBar}>
        <span className={`${styles.saveStatus} ${saved ? styles.saved : ''}`}>{saveMsg}</span>
        <button className={styles.btnSave} onClick={() => showSaved()}>✓ 저장됨</button>
      </div>
    </>
  );
}
