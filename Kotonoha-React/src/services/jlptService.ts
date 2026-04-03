// =============================================
// jlptService.ts — JLPT Vocabulary API에서 급수별 단어 불러오기
// =============================================

const JLPT_API_BASE = 'https://jlpt-vocab-api.vercel.app/api/words';
const LS_JLPT_CACHE_PREFIX = 'kotonoha_jlpt_cache_';
const LS_JLPT_CACHE_TS = 'kotonoha_jlpt_cache_ts';
const CACHE_DURATION = 7 * 24 * 60 * 60 * 1000; // 7일

export interface JlptWord {
  word: string;
  kanji: string;
  reading: string;
  pos: string;
  meanings: string[];
  level: number;
}

export interface JlptWordsByLevel {
  N5: JlptWord[];
  N4: JlptWord[];
  N3: JlptWord[];
  N2: JlptWord[];
  N1: JlptWord[];
}

// ── API 응답 파싱 ──
interface ApiWord {
  word: string;
  meaning: string;
  furigana: string;
  romaji: string;
  level: number;
}

function apiWordToJlptWord(w: ApiWord): JlptWord {
  // meaning 에서 한국어 의미는 없으므로 영어 의미를 그대로 사용
  return {
    word: w.word,
    kanji: `[${w.word}]`,
    reading: `${w.furigana} · ${w.romaji}`,
    pos: '', // API에 품사 정보 없음
    meanings: w.meaning.split(',').map(s => s.trim()),
    level: w.level,
  };
}

// ── 한 급수의 전체 단어 불러오기 ──
async function fetchLevelWords(level: number): Promise<JlptWord[]> {
  const res = await fetch(`${JLPT_API_BASE}/all?level=${level}`);
  if (!res.ok) throw new Error(`Failed to fetch JLPT N${level}`);
  const data = await res.json();
  
  // API가 배열을 직접 반환하는 경우와 {words: [...]} 객체를 반환하는 경우 둘 다 처리
  const words: ApiWord[] = Array.isArray(data) ? data : (data.words || data);
  return words.map(apiWordToJlptWord);
}

// ── 메인 함수: 전체 급수 불러오기 ──
export async function loadAllJlptWords(
  onProgress?: (level: number, total: number) => void
): Promise<JlptWordsByLevel> {
  // 1. 캐시 확인
  try {
    const cachedTs = localStorage.getItem(LS_JLPT_CACHE_TS);
    if (cachedTs && (Date.now() - parseInt(cachedTs)) < CACHE_DURATION) {
      const result: JlptWordsByLevel = { N5: [], N4: [], N3: [], N2: [], N1: [] };
      let allCached = true;
      for (const lvl of [5, 4, 3, 2, 1]) {
        const cached = localStorage.getItem(`${LS_JLPT_CACHE_PREFIX}${lvl}`);
        if (cached) {
          const key = `N${lvl}` as keyof JlptWordsByLevel;
          result[key] = JSON.parse(cached);
        } else {
          allCached = false;
          break;
        }
      }
      if (allCached && result.N5.length > 0) {
        return result;
      }
    }
  } catch { /* ignore */ }

  // 2. API 호출 (N5 → N1 순서)
  const result: JlptWordsByLevel = { N5: [], N4: [], N3: [], N2: [], N1: [] };
  const levels = [5, 4, 3, 2, 1];
  
  for (let i = 0; i < levels.length; i++) {
    const lvl = levels[i];
    if (onProgress) onProgress(lvl, levels.length);
    
    try {
      const words = await fetchLevelWords(lvl);
      const key = `N${lvl}` as keyof JlptWordsByLevel;
      result[key] = words;
      
      // 레벨별 캐시 저장
      try {
        localStorage.setItem(`${LS_JLPT_CACHE_PREFIX}${lvl}`, JSON.stringify(words));
      } catch { /* storage full */ }
    } catch (err) {
      console.warn(`Failed to fetch JLPT N${lvl}:`, err);
    }
  }

  // 3. 타임스탬프 저장
  try {
    localStorage.setItem(LS_JLPT_CACHE_TS, String(Date.now()));
  } catch { /* ignore */ }

  return result;
}

// ── 캐시에서 즉시 불러오기 (동기) ──
export function loadJlptFromCache(): JlptWordsByLevel | null {
  try {
    const result: JlptWordsByLevel = { N5: [], N4: [], N3: [], N2: [], N1: [] };
    let hasData = false;
    for (const lvl of [5, 4, 3, 2, 1]) {
      const cached = localStorage.getItem(`${LS_JLPT_CACHE_PREFIX}${lvl}`);
      if (cached) {
        const key = `N${lvl}` as keyof JlptWordsByLevel;
        result[key] = JSON.parse(cached);
        hasData = true;
      }
    }
    return hasData ? result : null;
  } catch {
    return null;
  }
}
