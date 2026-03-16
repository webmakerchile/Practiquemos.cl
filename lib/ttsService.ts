import { Platform } from 'react-native';
import { Audio } from 'expo-av';
import { getApiUrl } from './query-client';

let currentSound: Audio.Sound | null = null;
let currentWebAudio: HTMLAudioElement | null = null;
let onDoneCallback: (() => void) | null = null;
let onErrorCallback: (() => void) | null = null;

const audioCache = new Map<string, string>();
const pendingRequests = new Map<string, Promise<string>>();

function getCacheKey(text: string): string {
  let hash = 0;
  for (let i = 0; i < text.length; i++) {
    const char = text.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash |= 0;
  }
  return 'tts_' + Math.abs(hash).toString(36);
}

function humanizeForProfesora(text: string): string {
  return text
    .replace(/\.\s+/g, '... ')
    .replace(/:\s*/g, ':... ')
    .replace(/\?\s*/g, '?... ')
    .replace(/;\s*/g, ';... ');
}

async function fetchAudioBlob(text: string): Promise<string> {
  const humanized = humanizeForProfesora(text);
  const key = getCacheKey(humanized);

  const cached = audioCache.get(key);
  if (cached) return cached;

  const pending = pendingRequests.get(key);
  if (pending) return pending;

  const promise = (async () => {
    try {
      const apiUrl = getApiUrl();
      const url = new URL('/api/tts', apiUrl).toString();
      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: humanized }),
      });

      if (!response.ok) throw new Error(`TTS error: ${response.status}`);

      const blob = await response.blob();
      const blobUrl = URL.createObjectURL(blob);
      audioCache.set(key, blobUrl);
      return blobUrl;
    } finally {
      pendingRequests.delete(key);
    }
  })();

  pendingRequests.set(key, promise);
  return promise;
}

export function prefetchAudio(text: string): void {
  fetchAudioBlob(text).catch(() => {});
}

export function prefetchExamAudio(questions: Array<{ pregunta: string; opciones: string[]; explicacionTexto?: string; respuestaCorrecta: number }>): void {
  const batch = questions.slice(0, 10);
  batch.forEach((q, i) => {
    setTimeout(() => {
      const opciones = q.opciones.map((o, j) =>
        `La ${String.fromCharCode(65 + j)}, ${o}`).join('. ');
      const questionText = `${q.pregunta} Las opciones son: ${opciones}`;
      prefetchAudio(questionText);

      if (q.explicacionTexto) {
        const correctLetter = String.fromCharCode(65 + q.respuestaCorrecta);
        const correctOption = q.opciones[q.respuestaCorrecta];
        const explText = `La respuesta correcta es la ${correctLetter}, ${correctOption}. ${q.explicacionTexto}`;
        prefetchAudio(explText);
      }
    }, i * 500);
  });
}

export async function speakWithNova(
  text: string,
  callbacks?: { onDone?: () => void; onError?: () => void }
): Promise<void> {
  await stopNova();

  onDoneCallback = callbacks?.onDone || null;
  onErrorCallback = callbacks?.onError || null;

  try {
    const blobUrl = await fetchAudioBlob(text);

    if (Platform.OS === 'web') {
      const audio = new window.Audio(blobUrl);
      currentWebAudio = audio;
      audio.onended = () => {
        currentWebAudio = null;
        onDoneCallback?.();
      };
      audio.onerror = () => {
        currentWebAudio = null;
        onErrorCallback?.();
      };
      await audio.play();
    } else {
      const { sound } = await Audio.Sound.createAsync(
        { uri: blobUrl },
        { shouldPlay: true }
      );
      currentSound = sound;

      sound.setOnPlaybackStatusUpdate((status) => {
        if (status.isLoaded && status.didJustFinish) {
          cleanupSound();
          onDoneCallback?.();
        }
      });
    }
  } catch (err) {
    console.error('TTS Nova error:', err);
    cleanupSound();
    onErrorCallback?.();
  }
}

export async function stopNova(): Promise<void> {
  if (Platform.OS === 'web' && currentWebAudio) {
    currentWebAudio.pause();
    currentWebAudio.currentTime = 0;
    currentWebAudio = null;
  }
  if (currentSound) {
    try {
      await currentSound.stopAsync();
      await currentSound.unloadAsync();
    } catch {}
    currentSound = null;
  }
  onDoneCallback = null;
  onErrorCallback = null;
}

function cleanupSound() {
  if (currentSound) {
    currentSound.unloadAsync().catch(() => {});
    currentSound = null;
  }
}
