import { useState, useEffect } from 'react';

export interface FavoriteWord {
  word: string;
  kanji: string;
  reading: string;
  meanings: string[];
}

export function useFavorites() {
  const [favs, setFavs] = useState<FavoriteWord[]>([]);

  useEffect(() => {
    try {
      const stored = localStorage.getItem('kotonoha_favs');
      if (stored) {
        setFavs(JSON.parse(stored));
      }
    } catch {
      // Ignore
    }
  }, []);

  const saveToStorage = (newFavs: FavoriteWord[]) => {
    localStorage.setItem('kotonoha_favs', JSON.stringify(newFavs));
    setFavs(newFavs);
  };

  const toggleFav = (wordData: FavoriteWord) => {
    const idx = favs.findIndex(f => f.word === wordData.word);
    if (idx >= 0) {
      const newFavs = [...favs];
      newFavs.splice(idx, 1);
      saveToStorage(newFavs);
    } else {
      saveToStorage([...favs, wordData]);
    }
  };

  const removeFav = (index: number) => {
    const newFavs = [...favs];
    newFavs.splice(index, 1);
    saveToStorage(newFavs);
  };

  const isFav = (word: string) => {
    return favs.some(f => f.word === word);
  };

  return { favs, toggleFav, removeFav, isFav };
}
