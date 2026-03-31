import { useState, useEffect, useCallback } from 'react';

export function useTTS() {
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [isSpeaking, setIsSpeaking] = useState(false);

  useEffect(() => {
    const synth = window.speechSynthesis;
    if (!synth) return;

    const loadVoices = () => {
      setVoices(synth.getVoices().filter(v => v.lang.startsWith('ja')));
    };

    loadVoices();
    if (synth.onvoiceschanged !== undefined) {
      synth.onvoiceschanged = loadVoices;
    }
  }, []);

  const getVoiceGender = useCallback(() => {
    try {
      const s = JSON.parse(localStorage.getItem('kotonoha_settings') || '{}');
      return s.ttsGender || 'female';
    } catch {
      return 'female';
    }
  }, []);

  const pickVoice = useCallback((gender: string) => {
    if (!voices.length) return null;

    const femaleKeywords = ['female', 'woman', 'kyoko', 'haruka', 'ayumi', 'f '];
    const maleKeywords   = ['male', 'man', 'otoya', 'ichiro', 'kenji', 'm '];
    const keywords = gender === 'female' ? femaleKeywords : maleKeywords;

    const matched = voices.find(v =>
      keywords.some(k => v.name.toLowerCase().includes(k))
    );
    if (matched) return matched;
    
    // Fallback: assume first is female, second is male typically
    if (gender === 'female') return voices[0];
    return voices.length > 1 ? voices[1] : voices[0];
  }, [voices]);

  const speak = useCallback((text: string, onEnd?: () => void) => {
    const synth = window.speechSynthesis;
    if (!synth) return;

    synth.cancel();

    const utt = new SpeechSynthesisUtterance(text);
    utt.lang = 'ja-JP';
    utt.rate = 0.9;
    utt.pitch = 1.0;

    const voice = pickVoice(getVoiceGender());
    if (voice) {
      utt.voice = voice;
    }

    setIsSpeaking(true);
    
    utt.onend = () => {
      setIsSpeaking(false);
      if (onEnd) onEnd();
    };
    utt.onerror = () => {
      setIsSpeaking(false);
      if (onEnd) onEnd();
    };

    synth.speak(utt);
  }, [getVoiceGender, pickVoice]);

  const stop = useCallback(() => {
    window.speechSynthesis?.cancel();
    setIsSpeaking(false);
  }, []);

  return { speak, stop, isSpeaking, voicesLoaded: voices.length > 0 };
}
