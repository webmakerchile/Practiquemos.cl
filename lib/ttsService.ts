import { Platform } from 'react-native';
import { Audio } from 'expo-av';
import { getApiUrl } from './query-client';

let currentSound: Audio.Sound | null = null;
let currentWebAudio: HTMLAudioElement | null = null;
let onDoneCallback: (() => void) | null = null;
let onErrorCallback: (() => void) | null = null;

function humanizeForProfesora(text: string): string {
  return text
    .replace(/\.\s+/g, '... ')
    .replace(/:\s*/g, ':... ')
    .replace(/\?\s*/g, '?... ')
    .replace(/;\s*/g, ';... ');
}

export async function speakWithNova(
  text: string,
  callbacks?: { onDone?: () => void; onError?: () => void }
): Promise<void> {
  await stopNova();

  onDoneCallback = callbacks?.onDone || null;
  onErrorCallback = callbacks?.onError || null;

  const humanized = humanizeForProfesora(text);

  try {
    const apiUrl = getApiUrl();
    const url = new URL('/api/tts', apiUrl).toString();
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text: humanized }),
    });

    if (!response.ok) {
      throw new Error(`TTS error: ${response.status}`);
    }

    const blob = await response.blob();
    const blobUrl = URL.createObjectURL(blob);

    if (Platform.OS === 'web') {
      const audio = new window.Audio(blobUrl);
      currentWebAudio = audio;
      audio.onended = () => {
        URL.revokeObjectURL(blobUrl);
        currentWebAudio = null;
        onDoneCallback?.();
      };
      audio.onerror = () => {
        URL.revokeObjectURL(blobUrl);
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
          URL.revokeObjectURL(blobUrl);
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
