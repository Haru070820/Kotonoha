import { useState, useEffect } from 'react';

export function useBookmarks() {
  const [bookmarks, setBookmarks] = useState<number[]>([]);
  const [likes, setLikes] = useState<number[]>([]);

  useEffect(() => {
    try {
      const storedBM = localStorage.getItem('kotonoha_song_bookmarks');
      if (storedBM) setBookmarks(JSON.parse(storedBM));

      const storedLikes = localStorage.getItem('kotonoha_song_likes');
      if (storedLikes) setLikes(JSON.parse(storedLikes));
    } catch {
      // Ignore
    }
  }, []);

  const toggleBookmark = (songId: number) => {
    const idx = bookmarks.indexOf(songId);
    let newBM = [...bookmarks];
    if (idx >= 0) {
      newBM.splice(idx, 1);
    } else {
      newBM.push(songId);
    }
    localStorage.setItem('kotonoha_song_bookmarks', JSON.stringify(newBM));
    setBookmarks(newBM);
  };

  const isBookmarked = (songId: number) => bookmarks.includes(songId);

  return { bookmarks, toggleBookmark, isBookmarked, likes };
}
