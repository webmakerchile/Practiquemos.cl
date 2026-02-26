import { Platform } from 'react-native';
import { Audio } from 'expo-av';

let correctSounds: Audio.Sound[] = [];
let incorrectSounds: Audio.Sound[] = [];
let loaded = false;

export async function loadSounds() {
  if (loaded) return;
  try {
    await Audio.setAudioModeAsync({ playsInSilentModeIOS: true });
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
    for (const file of correctFiles) {
      const { sound } = await Audio.Sound.createAsync(file, { shouldPlay: false, volume: 0.8 });
      correctSounds.push(sound);
    }
    for (const file of incorrectFiles) {
      const { sound } = await Audio.Sound.createAsync(file, { shouldPlay: false, volume: 0.7 });
      incorrectSounds.push(sound);
    }
    loaded = true;
  } catch (_) {}
}

export async function playCorrect() {
  try {
    if (!loaded) await loadSounds();
    if (correctSounds.length > 0) {
      const sound = correctSounds[Math.floor(Math.random() * correctSounds.length)];
      await sound.setPositionAsync(0);
      await sound.playAsync();
    }
  } catch (_) {}
}

export async function playIncorrect() {
  try {
    if (!loaded) await loadSounds();
    if (incorrectSounds.length > 0) {
      const sound = incorrectSounds[Math.floor(Math.random() * incorrectSounds.length)];
      await sound.setPositionAsync(0);
      await sound.playAsync();
    }
  } catch (_) {}
}

export function unloadSounds() {
  correctSounds.forEach(s => s.unloadAsync().catch(() => {}));
  incorrectSounds.forEach(s => s.unloadAsync().catch(() => {}));
  correctSounds = [];
  incorrectSounds = [];
  loaded = false;
}
