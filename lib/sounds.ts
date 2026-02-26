import { Platform } from 'react-native';
import { Audio } from 'expo-av';

let correctSounds: Audio.Sound[] = [];
let incorrectSounds: Audio.Sound[] = [];
let loaded = false;
let loadError = false;

let correctIndex = 0;
let incorrectIndex = 0;
let lastType: 'correct' | 'incorrect' | null = null;

const correctFiles = [
  require('../assets/sounds/correct.wav'),
  require('../assets/sounds/correct2.wav'),
  require('../assets/sounds/correct3.wav'),
];
const incorrectFiles = [
  require('../assets/sounds/incorrect.wav'),
  require('../assets/sounds/incorrect2.wav'),
  require('../assets/sounds/incorrect3.wav'),
];

const correctWebFreqs = [[523, 659, 784], [660, 880, 0], [440, 554, 660]];
const incorrectWebFreqs = [[294, 220], [262, 196], [247, 185]];
let webCorrectIndex = 0;
let webIncorrectIndex = 0;

function playWebTone(type: 'correct' | 'incorrect') {
  try {
    const AudioContext = (window as any).AudioContext || (window as any).webkitAudioContext;
    if (!AudioContext) return;
    const ctx = new AudioContext();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);

    if (type === 'correct') {
      const pick = correctWebFreqs[webCorrectIndex];
      osc.type = 'sine';
      osc.frequency.setValueAtTime(pick[0], ctx.currentTime);
      if (pick[1]) osc.frequency.linearRampToValueAtTime(pick[1], ctx.currentTime + 0.15);
      if (pick[2]) osc.frequency.linearRampToValueAtTime(pick[2], ctx.currentTime + 0.25);
      gain.gain.setValueAtTime(0.3, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.35);
      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + 0.35);
      if (webCorrectIndex < correctWebFreqs.length - 1) webCorrectIndex++;
    } else {
      const pick = incorrectWebFreqs[webIncorrectIndex];
      osc.type = 'sine';
      osc.frequency.setValueAtTime(pick[0], ctx.currentTime);
      osc.frequency.linearRampToValueAtTime(pick[1], ctx.currentTime + 0.3);
      gain.gain.setValueAtTime(0.25, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.35);
      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + 0.35);
      if (webIncorrectIndex < incorrectWebFreqs.length - 1) webIncorrectIndex++;
    }
    setTimeout(() => ctx.close(), 500);
  } catch (_) {}
}

export async function loadSounds() {
  if (loaded || loadError) return;
  if (Platform.OS === 'web') {
    loaded = true;
    return;
  }
  try {
    await Audio.setAudioModeAsync({ playsInSilentModeIOS: true });
    for (const file of correctFiles) {
      const { sound } = await Audio.Sound.createAsync(file, { shouldPlay: false, volume: 0.8 });
      correctSounds.push(sound);
    }
    for (const file of incorrectFiles) {
      const { sound } = await Audio.Sound.createAsync(file, { shouldPlay: false, volume: 0.7 });
      incorrectSounds.push(sound);
    }
    loaded = true;
  } catch (e) {
    console.warn('Sound load error:', e);
    loadError = true;
  }
}

export async function playCorrect() {
  if (lastType !== 'correct') {
    correctIndex = 0;
    webCorrectIndex = 0;
    lastType = 'correct';
  }

  if (Platform.OS === 'web') {
    playWebTone('correct');
    return;
  }
  try {
    if (!loaded) await loadSounds();
    if (correctSounds.length > 0) {
      const sound = correctSounds[correctIndex];
      await sound.setPositionAsync(0);
      await sound.playAsync();
      if (correctIndex < correctSounds.length - 1) correctIndex++;
    }
  } catch (e) {
    console.warn('Play correct error:', e);
  }
}

export async function playIncorrect() {
  if (lastType !== 'incorrect') {
    incorrectIndex = 0;
    webIncorrectIndex = 0;
    lastType = 'incorrect';
  }

  if (Platform.OS === 'web') {
    playWebTone('incorrect');
    return;
  }
  try {
    if (!loaded) await loadSounds();
    if (incorrectSounds.length > 0) {
      const sound = incorrectSounds[incorrectIndex];
      await sound.setPositionAsync(0);
      await sound.playAsync();
      if (incorrectIndex < incorrectSounds.length - 1) incorrectIndex++;
    }
  } catch (e) {
    console.warn('Play incorrect error:', e);
  }
}

export function unloadSounds() {
  correctSounds.forEach(s => s.unloadAsync().catch(() => {}));
  incorrectSounds.forEach(s => s.unloadAsync().catch(() => {}));
  correctSounds = [];
  incorrectSounds = [];
  loaded = false;
  loadError = false;
  correctIndex = 0;
  incorrectIndex = 0;
  webCorrectIndex = 0;
  webIncorrectIndex = 0;
  lastType = null;
}
