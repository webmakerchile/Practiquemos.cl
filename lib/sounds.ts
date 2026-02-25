import { Platform } from 'react-native';
import { Audio } from 'expo-av';

let correctSound: Audio.Sound | null = null;
let incorrectSound: Audio.Sound | null = null;
let loaded = false;

export async function loadSounds() {
  if (loaded) return;
  try {
    await Audio.setAudioModeAsync({ playsInSilentModeIOS: true });
    const { sound: c } = await Audio.Sound.createAsync(
      require('../assets/sounds/correct.wav'),
      { shouldPlay: false, volume: 0.8 }
    );
    const { sound: w } = await Audio.Sound.createAsync(
      require('../assets/sounds/incorrect.wav'),
      { shouldPlay: false, volume: 0.7 }
    );
    correctSound = c;
    incorrectSound = w;
    loaded = true;
  } catch (_) {}
}

export async function playCorrect() {
  try {
    if (!loaded) await loadSounds();
    if (correctSound) {
      await correctSound.setPositionAsync(0);
      await correctSound.playAsync();
    }
  } catch (_) {}
}

export async function playIncorrect() {
  try {
    if (!loaded) await loadSounds();
    if (incorrectSound) {
      await incorrectSound.setPositionAsync(0);
      await incorrectSound.playAsync();
    }
  } catch (_) {}
}

export function unloadSounds() {
  correctSound?.unloadAsync().catch(() => {});
  incorrectSound?.unloadAsync().catch(() => {});
  correctSound = null;
  incorrectSound = null;
  loaded = false;
}
