import { useState, useEffect } from 'react';

export interface AppSettings {
  darkMode: boolean;
  yomigana: boolean;
  romaji: boolean;
  korean: boolean;
  grammarMode: boolean;
  ttsGender: 'female' | 'male';
  todayCardMode: 'word' | 'kanji';
  favLimit: number;
}

const defaultSettings: AppSettings = {
  darkMode: false,
  yomigana: true,
  romaji: true,
  korean: true,
  grammarMode: true,
  ttsGender: 'female',
  todayCardMode: 'word',
  favLimit: 50
};

export function useSettings() {
  const [settings, setSettings] = useState<AppSettings>(defaultSettings);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    try {
      const stored = localStorage.getItem('kotonoha_settings');
      if (stored) {
        setSettings({ ...defaultSettings, ...JSON.parse(stored) });
      }
      // Migrate old favLimit from separate key
      const oldLimit = localStorage.getItem('kotonoha_fav_limit');
      if (oldLimit) {
        setSettings(prev => ({ ...prev, favLimit: parseInt(oldLimit) || 50 }));
      }
    } catch {
      // Ignore
    }
    setIsLoaded(true);
  }, []);

  useEffect(() => {
    if (!isLoaded) return;
    localStorage.setItem('kotonoha_settings', JSON.stringify(settings));
    // Keep old key in sync for backward compatibility
    localStorage.setItem('kotonoha_fav_limit', String(settings.favLimit));

    // Apply global values
    if (settings.darkMode) {
      document.body.classList.add('dark');
    } else {
      document.body.classList.remove('dark');
    }

    document.documentElement.dataset.yomigana = settings.yomigana ? '1' : '0';
    document.documentElement.dataset.romaji = settings.romaji ? '1' : '0';
    document.documentElement.dataset.grammar = settings.grammarMode ? '1' : '0';
  }, [settings, isLoaded]);

  const updateSettings = (partial: Partial<AppSettings>) => {
    setSettings(prev => ({ ...prev, ...partial }));
  };

  return { settings, updateSettings, isLoaded };
}
