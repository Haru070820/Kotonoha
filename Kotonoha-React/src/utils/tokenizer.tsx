import React from 'react';
import { wordDB } from '../data/wordDB';
import { grammarDB } from '../data/grammarDB';

interface TokenizeContext {
  grammarOn: boolean;
  favs: { word: string }[];
  pinnedWord: string | null;
  onTokenHover: (e: React.MouseEvent, word: string, type: 'word' | 'grammar') => void;
  onTokenLeave: () => void;
  onTokenClick: (e: React.MouseEvent, word: string, type: 'word' | 'grammar') => void;
}

export function renderWordHtml(word: string): React.ReactNode {
  // @ts-ignore
  const data = wordDB[word] as { reading: string };
  if (!data || !/[一-龯]/.test(word)) return word;
  
  const furi = data.reading.split(' ')[0];
  
  let kEnd = word.length - 1;
  let fEnd = furi.length - 1;
  while(kEnd >= 0 && fEnd >= 0 && word[kEnd] === furi[fEnd]) { kEnd--; fEnd--; }
  
  let kStart = 0;
  let fStart = 0;
  while(kStart <= kEnd && fStart <= fEnd && word[kStart] === furi[fStart]) { kStart++; fStart++; }
  
  const prefix = word.substring(0, kStart);
  const suffix = word.substring(kEnd + 1);
  const innerK = word.substring(kStart, kEnd + 1);
  const innerF = furi.substring(fStart, fEnd + 1);
  
  return (
    <>
      {prefix}
      <ruby>
        {innerK}
        <rt>{innerF}</rt>
      </ruby>
      {suffix}
    </>
  );
}

export function tokenizePlain(text: string, ctx: TokenizeContext): React.ReactNode[] {
  const elements: React.ReactNode[] = [];
  let i = 0;
  const chars = Array.from(text);

  let keyId = 0;

  while (i < chars.length) {
    let matched = false;

    if (ctx.grammarOn) {
      for (let len = 4; len >= 1; len--) {
        const cand = chars.slice(i, i + len).join('');
        // @ts-ignore
        if (grammarDB[cand]) {
          elements.push(
            <span
              key={`g-${i}-${keyId++}`}
              className={`grammar-token ${ctx.pinnedWord === cand ? 'pinned' : ''}`}
              onMouseEnter={(e) => ctx.onTokenHover(e, cand, 'grammar')}
              onMouseLeave={ctx.onTokenLeave}
              onClick={(e) => ctx.onTokenClick(e, cand, 'grammar')}
            >
              {cand}
            </span>
          );
          i += len;
          matched = true;
          break;
        }
      }
      if (matched) continue;
    }

    // Word Match
    for (let len = 8; len >= 2; len--) {
      if (i + len > chars.length) continue;
      const cand = chars.slice(i, i + len).join('');
      // @ts-ignore
      if (wordDB[cand]) {
        const isFav = ctx.favs.some(f => f.word === cand);
        elements.push(
          <span
            key={`w-${i}-${keyId++}`}
            className={`word-token ${isFav ? 'favorited' : ''} ${ctx.pinnedWord === cand ? 'pinned' : ''}`}
            onMouseEnter={(e) => ctx.onTokenHover(e, cand, 'word')}
            onMouseLeave={ctx.onTokenLeave}
            onClick={(e) => ctx.onTokenClick(e, cand, 'word')}
          >
            {renderWordHtml(cand)}
          </span>
        );
        i += len;
        matched = true;
        break;
      }
    }

    if (!matched) {
      const ch = chars[i];
      // @ts-ignore
      if (wordDB[ch]) {
        const isFav = ctx.favs.some(f => f.word === ch);
        elements.push(
          <span
            key={`wc-${i}-${keyId++}`}
            className={`word-token ${isFav ? 'favorited' : ''} ${ctx.pinnedWord === ch ? 'pinned' : ''}`}
            onMouseEnter={(e) => ctx.onTokenHover(e, ch, 'word')}
            onMouseLeave={ctx.onTokenLeave}
            onClick={(e) => ctx.onTokenClick(e, ch, 'word')}
          >
            {renderWordHtml(ch)}
          </span>
        );
      } else {
        elements.push(<React.Fragment key={`txt-${i}-${keyId++}`}>{ch}</React.Fragment>);
      }
      i++;
    }
  }

  return elements;
}

export function buildJpHtml(segments: any[], ctx: TokenizeContext): React.ReactNode[] {
  let elements: React.ReactNode[] = [];
  let keyId = 0;

  for (const seg of segments) {
    if (Array.isArray(seg)) {
      if (Array.isArray(seg[0])) {
        elements = elements.concat(buildJpHtml(seg, ctx));
      } else {
        const key = seg[0];
        const furi = seg[1];
        // @ts-ignore
        const hasDict = !!wordDB[key];
        const isFav = ctx.favs.some(f => f.word === key);
        
        elements.push(
          <span
            key={`bj-${keyId++}`}
            className={`word-token ${isFav ? 'favorited' : ''} ${ctx.pinnedWord === key ? 'pinned' : ''} ${hasDict ? 'hasdict' : ''}`}
            {...(hasDict ? {
              onMouseEnter: (e) => ctx.onTokenHover(e, key, 'word'),
              onMouseLeave: ctx.onTokenLeave,
              onClick: (e) => ctx.onTokenClick(e, key, 'word')
            } : {})}
          >
            {furi ? (
              <ruby>
                {key}
                <rt>{furi}</rt>
              </ruby>
            ) : hasDict ? renderWordHtml(key) : key}
          </span>
        );
        
        for (let i = 2; i < seg.length; i++) {
          elements = elements.concat(Array.isArray(seg[i]) ? buildJpHtml([seg[i]], ctx) : tokenizePlain(String(seg[i]), ctx));
        }
      }
    } else {
      elements = elements.concat(tokenizePlain(String(seg), ctx));
    }
  }
  return elements;
}
