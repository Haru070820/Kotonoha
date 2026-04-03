import { useState, useEffect, useMemo } from 'react';
import styles from './Community.module.css';

// ── 상수 ──
const LS_POSTS = 'kotonoha_community_posts';
const BADGE_MAP: Record<string, string> = { question: '질문', share: '공유', tip: '팁', request: '요청' };
const BADGE_CLASS: Record<string, string> = { question: 'badgeQuestion', share: 'badgeShare', tip: 'badgeTip', request: 'badgeRequest' };

interface Post {
  id: number; type: string; title: string; body: string;
  author: string; date: string; tags: string[]; likes: number;
  comments: { author: string; text: string; date: string }[];
}

// ── 샘플 데이터 ──
const samplePosts: Post[] = [
  { id:1, type:'tip', title:'「は」와 「が」의 차이점 — 주어를 나타내는 두 조사', body:'「は」는 이미 알고 있는 주제를 제시할 때, 「が」는 새로운 정보나 강조할 때 사용해요.\n\n例) 「私は学生です」→ "나는 학생입니다" (나라는 주제 제시)\n「誰が来ましたか？」→ "누가 왔어요?" (누구인지 강조)\n\n노래 가사에서도 이 차이를 주의 깊게 보면 뉘앙스가 달라져요!', author:'운영자', date:'2025-01-10', tags:['문법','N5','팁'], likes:28, comments:[] },
  { id:2, type:'tip', title:'일상생활에서 자주 쓰이는 일본어 표현 모음', body:'매일 쓰는 기본 표현을 정리했어요!\n\n① いただきます — 잘 먹겠습니다\n② ごちそうさま — 잘 먹었습니다\n③ お疲れ様です — 수고하셨습니다\n④ よろしくお願いします — 잘 부탁드립니다\n⑤ 大丈夫です — 괜찮습니다\n\n일본 드라마나 노래에서도 정말 자주 들리는 표현이에요.', author:'운영자', date:'2025-01-08', tags:['일상','N5','N4','팁'], likes:35, comments:[] },
  { id:3, type:'tip', title:'「～てしまう」와 「～ちゃう」 — 구어체 축약 패턴', body:'가사에서 자주 등장하는 「～てしまう」는 "~해버리다"라는 뜻으로, 후회나 완료의 뉘앙스가 있어요.\n\n구어체에서는 줄여서 「～ちゃう」로 쓰입니다.\n例) 忘れてしまう → 忘れちゃう (잊어버리다)\n食べてしまった → 食べちゃった (먹어버렸다)\n\n猫(고양이) 가사의 「飲み込んでしまった」도 같은 패턴이에요!', author:'운영자', date:'2025-01-06', tags:['문법','N4','N3','팁'], likes:22, comments:[] },
];

const POSTS_VERSION = 2;

export default function Community() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [currentTab, setCurrentTab] = useState('all');
  const [selectedType, setSelectedType] = useState('question');
  const [writeModalOpen, setWriteModalOpen] = useState(false);
  const [detailPost, setDetailPost] = useState<Post | null>(null);

  // Write form
  const [writeTitle, setWriteTitle] = useState('');
  const [writeBody, setWriteBody] = useState('');
  const [writeTags, setWriteTags] = useState('');
  // Comment
  const [commentInput, setCommentInput] = useState('');

  // ── 데이터 로드 ──
  useEffect(() => {
    let stored = JSON.parse(localStorage.getItem(LS_POSTS) || 'null');
    if (!stored || localStorage.getItem('kotonoha_posts_ver') !== String(POSTS_VERSION)) {
      stored = samplePosts;
      localStorage.setItem(LS_POSTS, JSON.stringify(stored));
      localStorage.setItem('kotonoha_posts_ver', String(POSTS_VERSION));
    }
    setPosts(stored);
  }, []);

  const savePosts = (newPosts: Post[]) => {
    setPosts(newPosts);
    localStorage.setItem(LS_POSTS, JSON.stringify(newPosts));
  };

  // ── ESC 키 ──
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') { setWriteModalOpen(false); setDetailPost(null); }
    };
    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, []);

  // ── 피드 필터 ──
  const feedPosts = useMemo(() => {
    return posts
      .filter(p => currentTab === 'all' || p.type === currentTab)
      .sort((a, b) => b.id - a.id);
  }, [posts, currentTab]);

  // ── 인기 태그 ──
  const hotTags = useMemo(() => {
    const map: Record<string, number> = {};
    posts.forEach(p => p.tags.forEach(t => map[t] = (map[t] || 0) + 1));
    return Object.entries(map).sort((a, b) => b[1] - a[1]).slice(0, 12).map(([tag]) => tag);
  }, [posts]);

  // ── 인기 단어 ──
  const rankWords = useMemo(() => {
    try {
      return JSON.parse(localStorage.getItem('kotonoha_favs') || '[]').slice(0, 5);
    } catch { return []; }
  }, []);

  // ── 태그 필터 ──
  const [filterTag, setFilterTag] = useState<string | null>(null);
  const displayPosts = filterTag
    ? posts.filter(p => p.tags.includes(filterTag)).sort((a, b) => b.id - a.id)
    : feedPosts;

  // ── 글쓰기 ──
  const submitPost = () => {
    if (!writeTitle.trim()) { alert('제목을 입력해주세요'); return; }
    if (!writeBody.trim()) { alert('내용을 입력해주세요'); return; }
    const now = new Date();
    const date = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
    const tags = writeTags.split(',').map(t => t.trim()).filter(Boolean);
    const newPost: Post = {
      id: Date.now(), type: selectedType, title: writeTitle.trim(), body: writeBody.trim(),
      author: '나', date, tags, likes: 0, comments: []
    };
    savePosts([newPost, ...posts]);
    setWriteTitle(''); setWriteBody(''); setWriteTags('');
    setWriteModalOpen(false);
  };

  // ── 글 삭제 ──
  const deletePost = (id: number) => {
    if (!window.confirm('이 글을 삭제할까요?')) return;
    savePosts(posts.filter(p => p.id !== id));
    if (detailPost?.id === id) setDetailPost(null);
  };

  // ── 좋아요 ──
  const likePost = (id: number) => {
    const updated = posts.map(p => p.id === id ? { ...p, likes: p.likes + 1 } : p);
    savePosts(updated);
    if (detailPost?.id === id) setDetailPost(updated.find(p => p.id === id) || null);
  };

  // ── 댓글 ──
  const submitComment = () => {
    if (!commentInput.trim() || !detailPost) return;
    const now = new Date();
    const date = `${now.getMonth() + 1}/${now.getDate()}`;
    const comment = { author: '나', text: commentInput.trim(), date };
    const updated = posts.map(p => p.id === detailPost.id ? { ...p, comments: [...p.comments, comment] } : p);
    savePosts(updated);
    setDetailPost(updated.find(p => p.id === detailPost.id) || null);
    setCommentInput('');
  };

  return (
    <div className={styles.wrap}>
      <div className={styles.topBar}>
        <h1>커뮤니티</h1>
        <button className={styles.writeBtn} onClick={() => setWriteModalOpen(true)}>
          <span className="material-symbols-outlined" style={{ fontSize: '1rem' }}>edit</span> 글쓰기
        </button>
      </div>

      <div className={styles.mainGrid}>
        {/* 피드 영역 */}
        <div className={styles.feed}>
          {/* 탭 */}
          <div className={styles.tabs}>
            {['all', 'question', 'share', 'tip', 'request'].map(t => (
              <button key={t} className={`${styles.tab} ${currentTab === t ? styles.active : ''}`}
                onClick={() => { setCurrentTab(t); setFilterTag(null); }}>
                {t === 'all' ? '전체' : BADGE_MAP[t]}
              </button>
            ))}
          </div>

          {/* 태그 필터 표시 */}
          {filterTag && (
            <div style={{ fontSize: '0.82rem', color: 'var(--muted)', marginBottom: 12 }}>
              #{filterTag} 태그 결과 {displayPosts.length}건{' '}
              <button onClick={() => setFilterTag(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--accent-gold)', fontSize: '0.82rem' }}>전체보기</button>
            </div>
          )}

          {/* 게시글 목록 */}
          {displayPosts.length === 0 ? (
            <div style={{ textAlign: 'center', padding: 40, color: 'var(--muted)' }}>게시글이 없어요. 첫 글을 작성해보세요!</div>
          ) : (
            displayPosts.map(p => (
              <div key={p.id} className={styles.postCard} onClick={() => { setDetailPost(p); setCommentInput(''); }}>
                <div className={styles.postTop}>
                  <span className={`${styles.postBadge} ${styles[BADGE_CLASS[p.type]]}`}>{BADGE_MAP[p.type]}</span>
                  <div className={styles.postTitle}>{p.title}</div>
                  {p.author === '나' && (
                    <button className={styles.postDeleteBtn} onClick={e => { e.stopPropagation(); deletePost(p.id); }}>삭제</button>
                  )}
                </div>
                <div className={styles.postPreview}>{p.body.slice(0, 80)}{p.body.length > 80 ? '…' : ''}</div>
                <div className={styles.postFooter}>
                  <span className={styles.postStat}>
                    <span className="material-symbols-outlined" style={{ fontSize: '0.9rem', verticalAlign: '-2px' }}>chat_bubble</span> {p.comments.length}
                  </span>
                  <span className={styles.postStat}>
                    <span className="material-symbols-outlined ms-filled" style={{ fontSize: '0.9rem', verticalAlign: '-2px', color: '#e74c3c' }}>favorite</span> {p.likes}
                  </span>
                  <span className={styles.postStat}>
                    <span className="material-symbols-outlined" style={{ fontSize: '0.9rem', verticalAlign: '-2px' }}>schedule</span> {p.date}
                  </span>
                  <span className={styles.postStat}>by {p.author}</span>
                  <div className={styles.postTagList}>
                    {p.tags.map(t => <span key={t} className={styles.postTag}>{t}</span>)}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* 사이드바 */}
        <aside className={styles.aside}>
          <div className={styles.asideSection}>
            <div className={styles.asideTitle}>🔥 인기 태그</div>
            <div className={styles.hotTags}>
              {hotTags.map(t => (
                <span key={t} className={styles.hotTag} onClick={() => setFilterTag(t)}>#{t}</span>
              ))}
            </div>
          </div>
          <div className={styles.asideSection}>
            <div className={styles.asideTitle}>⭐ 나의 즐겨찾기 단어</div>
            {rankWords.length === 0 ? (
              <div style={{ fontSize: '0.8rem', color: 'var(--muted)' }}>즐겨찾기한 단어가 없어요</div>
            ) : (
              rankWords.map((f: any, i: number) => (
                <div key={i} className={styles.rankItem}>
                  <span className={styles.rankNum}>{i + 1}</span>
                  <span className={styles.rankWord}>{f.word}</span>
                  <span style={{ fontSize: '0.75rem', color: 'var(--muted)', marginLeft: 'auto' }}>{f.meanings?.[0] || ''}</span>
                </div>
              ))
            )}
          </div>
        </aside>
      </div>

      {/* 글쓰기 모달 */}
      {writeModalOpen && (
        <div className={styles.modalOverlay} onClick={e => { if (e.target === e.currentTarget) setWriteModalOpen(false); }}>
          <div className={styles.modalBox}>
            <div className={styles.modalHeader}>
              <div className={styles.modalTitle}>새 글 작성</div>
              <button className={styles.modalClose} onClick={() => setWriteModalOpen(false)}>✕</button>
            </div>
            <div className={styles.modalBody}>
              <div className={styles.typeChips}>
                {['question', 'share', 'tip', 'request'].map(t => (
                  <button key={t} className={`${styles.typeChip} ${selectedType === t ? styles.active : ''}`}
                    onClick={() => setSelectedType(t)}>{BADGE_MAP[t]}</button>
                ))}
              </div>
              <input type="text" placeholder="제목" value={writeTitle} onChange={e => setWriteTitle(e.target.value)} className={styles.writeInput} />
              <textarea placeholder="내용을 입력하세요" value={writeBody} onChange={e => setWriteBody(e.target.value)} className={styles.writeTextarea} rows={6} />
              <input type="text" placeholder="태그 (쉼표로 구분)" value={writeTags} onChange={e => setWriteTags(e.target.value)} className={styles.writeInput} />
              <button className={styles.submitBtn} onClick={submitPost}>작성하기</button>
            </div>
          </div>
        </div>
      )}

      {/* 상세 모달 */}
      {detailPost && (
        <div className={styles.modalOverlay} onClick={e => { if (e.target === e.currentTarget) setDetailPost(null); }}>
          <div className={styles.modalBox} style={{ maxWidth: 640 }}>
            <div className={styles.modalHeader}>
              <span className={`${styles.postBadge} ${styles[BADGE_CLASS[detailPost.type]]}`}>{BADGE_MAP[detailPost.type]}</span>
              <div className={styles.modalTitle} style={{ flex: 1 }}>{detailPost.title}</div>
              <button className={styles.modalClose} onClick={() => setDetailPost(null)}>✕</button>
            </div>
            <div className={styles.detailMeta}>
              <span>by {detailPost.author}</span>
              <span>{detailPost.date}</span>
              <span>
                <span className="material-symbols-outlined ms-filled" style={{ fontSize: '0.9rem', verticalAlign: '-2px', color: '#e74c3c' }}>favorite</span>{' '}
                <b>{detailPost.likes}</b>{' '}
                <button onClick={() => likePost(detailPost.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '0.82rem', color: 'var(--accent-gold)' }}>좋아요</button>
              </span>
              {detailPost.author === '나' && (
                <button className={styles.postDeleteBtn} onClick={() => { setDetailPost(null); deletePost(detailPost.id); }}>삭제</button>
              )}
            </div>
            <div className={styles.detailBody}>{detailPost.body}</div>

            {/* 댓글 */}
            <div className={styles.commentSection}>
              <div className={styles.asideTitle}>💬 댓글</div>
              {detailPost.comments.length === 0 ? (
                <div style={{ fontSize: '0.82rem', color: 'var(--muted)', padding: '8px 0' }}>첫 댓글을 남겨보세요!</div>
              ) : (
                detailPost.comments.map((c, i) => (
                  <div key={i} className={styles.commentItem}>
                    <div className={styles.commentAuthor}>{c.author} <span className={styles.commentTime}>{c.date}</span></div>
                    <div className={styles.commentText}>{c.text}</div>
                  </div>
                ))
              )}
              <div className={styles.commentForm}>
                <input type="text" placeholder="댓글을 입력하세요" value={commentInput} onChange={e => setCommentInput(e.target.value)}
                  className={styles.writeInput} onKeyDown={e => { if (e.key === 'Enter') submitComment(); }} />
                <button className={styles.submitBtn} onClick={submitComment} style={{ padding: '8px 16px', fontSize: '0.82rem' }}>작성</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
