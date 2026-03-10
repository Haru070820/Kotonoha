// ── Kotonoha TTS 공용 유틸리티 ──
// Web Speech API를 사용하여 일본어 텍스트를 음성으로 읽어줍니다.

(function () {
  // 지원 여부 확인
  const synth = window.speechSynthesis;

  /**
   * 설정에서 음성 성별을 가져옵니다.
   * @returns {'female'|'male'}
   */
  function getVoiceGender() {
    const s = JSON.parse(localStorage.getItem('kotonoha_settings') || '{}');
    return s.ttsGender || 'female';
  }

  /**
   * 일본어 음성 목록에서 설정된 성별에 맞는 음성을 반환합니다.
   * @param {'female'|'male'} gender
   * @returns {SpeechSynthesisVoice|null}
   */
  function pickVoice(gender) {
    const voices = synth.getVoices();
    const jpVoices = voices.filter(v => v.lang.startsWith('ja'));
    if (!jpVoices.length) return null;

    // 여성/남성 키워드 매칭 시도
    const femaleKeywords = ['female', 'woman', 'kyoko', 'haruka', 'ayumi', 'f '];
    const maleKeywords   = ['male', 'man', 'otoya', 'ichiro', 'kenji', 'm '];
    const keywords = gender === 'female' ? femaleKeywords : maleKeywords;

    const matched = jpVoices.find(v =>
      keywords.some(k => v.name.toLowerCase().includes(k))
    );
    // 매칭 없으면 순서로 추정: 0번=여성, 1번=남성 (대부분의 OS 기준)
    if (matched) return matched;
    if (gender === 'female') return jpVoices[0];
    return jpVoices[jpVoices.length > 1 ? 1 : 0];
  }

  /**
   * 일본어 텍스트를 TTS로 읽어줍니다.
   * @param {string} text - 읽을 텍스트
   * @param {HTMLElement|null} btn - 애니메이션을 적용할 버튼 요소 (선택)
   */
  window.speakJapanese = function (text, btn) {
    if (!synth) return;
    synth.cancel(); // 이전 재생 중단

    const utt = new SpeechSynthesisUtterance(text);
    utt.lang = 'ja-JP';
    utt.rate = 0.9;
    utt.pitch = 1.0;

    const gender = getVoiceGender();

    function doSpeak() {
      const voice = pickVoice(gender);
      if (voice) utt.voice = voice;
      if (btn) {
        btn.classList.add('tts-speaking');
        utt.onend = () => btn.classList.remove('tts-speaking');
        utt.onerror = () => btn.classList.remove('tts-speaking');
      }
      synth.speak(utt);
    }

    // 음성 목록이 아직 로드되지 않았을 경우 대기
    if (synth.getVoices().length === 0) {
      synth.addEventListener('voiceschanged', doSpeak, { once: true });
    } else {
      doSpeak();
    }
  };

  /**
   * TTS 스피커 버튼 HTML을 반환합니다.
   * @param {string} text - 읽을 텍스트 (JS 문자열 이스케이프 필요 없음)
   * @param {string} [extraClass] - 추가 클래스명
   * @returns {string} HTML 문자열
   */
  window.ttsBtn = function (text, extraClass) {
    const escaped = text.replace(/\\/g, '\\\\').replace(/'/g, "\\'");
    return `<button class="tts-btn${extraClass ? ' ' + extraClass : ''}" onclick="event.stopPropagation();speakJapanese('${escaped}',this)" title="발음 듣기" aria-label="발음 듣기">
      <span class="material-symbols-outlined">volume_up</span>
    </button>`;
  };
})();
