import React, { createContext, useContext, useState, useEffect, useCallback, useMemo, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface VoiceSettings {
  voiceId: string | null;
  voiceName: string | null;
  rate: number;
  pitch: number;
}

interface VoiceContextValue {
  voiceSettings: VoiceSettings;
  setVoiceId: (id: string | null, name: string | null) => void;
  setRate: (rate: number) => void;
  setPitch: (pitch: number) => void;
  getSpeechOptions: () => { language: string; rate: number; pitch: number; voice?: string };
}

const STORAGE_KEY = '@practiquemos_voice';

const DEFAULT_SETTINGS: VoiceSettings = {
  voiceId: null,
  voiceName: null,
  rate: 0.85,
  pitch: 1.05,
};

const VoiceContext = createContext<VoiceContextValue | null>(null);

export function VoiceProvider({ children }: { children: ReactNode }) {
  const [voiceSettings, setVoiceSettings] = useState<VoiceSettings>(DEFAULT_SETTINGS);

  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY).then(saved => {
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          setVoiceSettings({ ...DEFAULT_SETTINGS, ...parsed });
        } catch {}
      }
    });
  }, []);

  const persist = useCallback((settings: VoiceSettings) => {
    AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(settings)).catch(() => {});
  }, []);

  const setVoiceId = useCallback((id: string | null, name: string | null) => {
    setVoiceSettings(prev => {
      const next = { ...prev, voiceId: id, voiceName: name };
      persist(next);
      return next;
    });
  }, [persist]);

  const setRate = useCallback((rate: number) => {
    setVoiceSettings(prev => {
      const next = { ...prev, rate };
      persist(next);
      return next;
    });
  }, [persist]);

  const setPitch = useCallback((pitch: number) => {
    setVoiceSettings(prev => {
      const next = { ...prev, pitch };
      persist(next);
      return next;
    });
  }, [persist]);

  const getSpeechOptions = useCallback(() => {
    const opts: { language: string; rate: number; pitch: number; voice?: string } = {
      language: 'es-419',
      rate: voiceSettings.rate,
      pitch: voiceSettings.pitch,
    };
    if (voiceSettings.voiceId) {
      opts.voice = voiceSettings.voiceId;
    }
    return opts;
  }, [voiceSettings]);

  const value = useMemo(() => ({
    voiceSettings,
    setVoiceId,
    setRate,
    setPitch,
    getSpeechOptions,
  }), [voiceSettings, setVoiceId, setRate, setPitch, getSpeechOptions]);

  return (
    <VoiceContext.Provider value={value}>
      {children}
    </VoiceContext.Provider>
  );
}

export function useVoice() {
  const ctx = useContext(VoiceContext);
  if (!ctx) throw new Error('useVoice must be used within VoiceProvider');
  return ctx;
}
