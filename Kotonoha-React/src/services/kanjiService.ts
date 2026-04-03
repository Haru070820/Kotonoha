// =============================================
// kanjiService.ts — KanjiAPI.dev에서 상용한자 2136자 불러오기
// =============================================

const KANJI_API_BASE = 'https://kanjiapi.dev/v1';
const LS_KANJI_CACHE = 'kotonoha_kanji_api_cache';
const LS_KANJI_CACHE_TS = 'kotonoha_kanji_api_ts';
const CACHE_DURATION = 7 * 24 * 60 * 60 * 1000; // 7일

export interface KanjiEntry {
  k: string;         // 한자
  on: string;        // 음독
  kun: string;       // 훈독
  kr: string;        // 한국어 음
  meaning: string;   // 의미
  grade: number;     // 학년 (1-6: 교육한자, 8: 상용한자)
  jlpt: number | null;
  strokes: number;
}

export interface KanjiByLevel {
  N5: KanjiEntry[];
  N4: KanjiEntry[];
  N3: KanjiEntry[];
  N2: KanjiEntry[];
  N1: KanjiEntry[];
  기타: KanjiEntry[];
}

// ── JLPT 레벨 매핑 (grade 기반 추정) ──
function estimateJlptFromGrade(grade: number, jlpt: number | null): string {
  if (jlpt) {
    if (jlpt >= 4) return 'N5';
    if (jlpt === 3) return 'N4';
    if (jlpt === 2) return 'N3';
    if (jlpt === 1) return 'N2';
  }
  // grade 기반 추정
  if (grade <= 2) return 'N5';
  if (grade <= 4) return 'N4';
  if (grade <= 6) return 'N3';
  if (grade === 8) return 'N2';
  return 'N1';
}

// ── 한자 → 한국어 음 매핑 (기본 제공) ──
// KanjiAPI.dev는 한국어 음을 제공하지 않으므로, meanings에서 의미를 추출합니다.
function formatMeanings(meanings: string[]): string {
  return meanings.slice(0, 3).join(', ');
}

function formatReadings(readings: string[]): string {
  return readings.slice(0, 3).join('・');
}

import { kanjiKrMap } from '../data/kanjiKrMap';

// ── API에서 한 한자 상세 불러오기 ──
async function fetchKanjiDetail(kanji: string): Promise<KanjiEntry | null> {
  try {
    const res = await fetch(`${KANJI_API_BASE}/kanji/${encodeURIComponent(kanji)}`);
    if (!res.ok) return null;
    const data = await res.json();
    return {
      k: data.kanji,
      on: formatReadings(data.on_readings || []),
      kun: formatReadings(data.kun_readings || []),
      kr: kanjiKrMap[data.kanji] || '',
      meaning: formatMeanings(data.meanings || []),
      grade: data.grade || 0,
      jlpt: data.jlpt || null,
      strokes: data.stroke_count || 0,
    };
  } catch {
    return null;
  }
}

// ── 전체 상용한자 목록 불러오기 ──
async function fetchJouyouList(): Promise<string[]> {
  const res = await fetch(`${KANJI_API_BASE}/kanji/jouyou`);
  if (!res.ok) throw new Error('Failed to fetch jouyou list');
  return await res.json();
}

// ── 배치로 상세 불러오기 (동시 요청 제한) ──
async function fetchKanjiDetailsBatch(
  kanjiList: string[],
  onProgress?: (loaded: number, total: number) => void,
  concurrency = 20
): Promise<KanjiEntry[]> {
  const results: KanjiEntry[] = [];
  let loaded = 0;

  for (let i = 0; i < kanjiList.length; i += concurrency) {
    const batch = kanjiList.slice(i, i + concurrency);
    const promises = batch.map(k => fetchKanjiDetail(k));
    const batchResults = await Promise.all(promises);
    
    for (const r of batchResults) {
      if (r) results.push(r);
    }
    
    loaded += batch.length;
    if (onProgress) onProgress(loaded, kanjiList.length);
  }

  return results;
}

// ── 레벨별로 정리 ──
function groupByLevel(entries: KanjiEntry[]): KanjiByLevel {
  const groups: KanjiByLevel = { N5: [], N4: [], N3: [], N2: [], N1: [], '기타': [] };
  
  for (const entry of entries) {
    const level = estimateJlptFromGrade(entry.grade, entry.jlpt);
    if (level in groups) {
      (groups as any)[level].push(entry);
    } else {
      groups['기타'].push(entry);
    }
  }
  
  return groups;
}

// ── 메인 함수: 캐시 우선, 없으면 API 호출 ──
export async function loadAllKanji(
  onProgress?: (loaded: number, total: number) => void,
  forceRefresh: boolean = false
): Promise<KanjiByLevel> {
  // 1. 캐시 확인
  if (!forceRefresh) {
    try {
      const cached = localStorage.getItem(LS_KANJI_CACHE);
      const cachedTs = localStorage.getItem(LS_KANJI_CACHE_TS);
      if (cached && cachedTs) {
        const age = Date.now() - parseInt(cachedTs);
        if (age < CACHE_DURATION) {
          const parsed = JSON.parse(cached) as KanjiEntry[];
          if (parsed.length > 2000) {
            return groupByLevel(parsed);
          }
        }
      }
    } catch { /* ignore */ }
  }

  // 2. API 호출
  const kanjiList = await fetchJouyouList();
  const entries = await fetchKanjiDetailsBatch(kanjiList, onProgress, 20);

  // 3. 캐시 저장
  try {
    localStorage.setItem(LS_KANJI_CACHE, JSON.stringify(entries));
    localStorage.setItem(LS_KANJI_CACHE_TS, String(Date.now()));
  } catch { /* storage full */ }

  return groupByLevel(entries);
}

// ── 캐시에서 즉시 불러오기 (동기) ──
export function loadKanjiFromCache(): KanjiByLevel | null {
  try {
    const cached = localStorage.getItem(LS_KANJI_CACHE);
    if (cached) {
      const parsed = JSON.parse(cached) as KanjiEntry[];
      if (parsed.length > 100) {
        return groupByLevel(parsed);
      }
    }
  } catch { /* ignore */ }
  return null;
}
