import React, { useState } from 'react';
import { View, Text, StyleSheet, Pressable, Platform, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import Colors from '@/constants/colors';
import { speakWithNova, stopNova } from '@/lib/ttsService';

const PREVIEW_TEXTS = [
  'Hola, soy tu copiloto de estudio. Te ayudaré a preparar tu examen de conducir.',
  '¿Qué efecto tiene la alta velocidad sobre el campo visual del conductor? Piénsalo un momento.',
  'Se debe mantener una distancia mínima de 10 metros de un paradero de buses al estacionar.',
];

export default function VoiceSettingsScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const webTopInset = Platform.OS === 'web' ? 67 : 0;

  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handlePreview = async (text: string) => {
    if (isPlaying) {
      stopNova();
      setIsPlaying(false);
      setIsLoading(false);
      return;
    }
    setIsLoading(true);
    setIsPlaying(true);
    speakWithNova(text, {
      onDone: () => { setIsPlaying(false); setIsLoading(false); },
      onError: () => { setIsPlaying(false); setIsLoading(false); },
    });
    setTimeout(() => setIsLoading(false), 3000);
  };

  return (
    <View style={styles.container}>
      <LinearGradient colors={[Colors.primary, Colors.primaryDark]} style={[styles.header, { paddingTop: (insets.top || webTopInset) + 12 }]}>
        <Pressable onPress={() => { stopNova(); router.back(); }} hitSlop={10}>
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </Pressable>
        <Text style={styles.headerTitle}>Voz del Copiloto</Text>
        <View style={{ width: 24 }} />
      </LinearGradient>

      <View style={[styles.content, { paddingBottom: (Platform.OS === 'web' ? 34 : insets.bottom) + 20 }]}>
        <View style={styles.voiceCard}>
          <View style={styles.voiceIcon}>
            <Text style={{ fontSize: 40 }}>🎙️</Text>
          </View>
          <Text style={styles.voiceName}>Nova</Text>
          <Text style={styles.voiceDesc}>Voz femenina HD con estilo profesora</Text>
          <View style={styles.badges}>
            <View style={styles.badge}>
              <Text style={styles.badgeText}>Alta calidad</Text>
            </View>
            <View style={styles.badge}>
              <Text style={styles.badgeText}>Español neutro</Text>
            </View>
          </View>
        </View>

        <Text style={styles.sectionTitle}>Escuchar ejemplos</Text>

        {PREVIEW_TEXTS.map((text, i) => (
          <Pressable
            key={i}
            onPress={() => handlePreview(text)}
            style={({ pressed }) => [styles.previewCard, pressed && { opacity: 0.7 }]}
          >
            <View style={styles.previewContent}>
              <Text style={styles.previewText} numberOfLines={2}>{text}</Text>
            </View>
            {isLoading && isPlaying ? (
              <ActivityIndicator size="small" color={Colors.primary} />
            ) : (
              <View style={[styles.playBtn, isPlaying && styles.playBtnActive]}>
                <Ionicons
                  name={isPlaying ? 'stop' : 'play'}
                  size={18}
                  color={isPlaying ? '#fff' : Colors.primary}
                />
              </View>
            )}
          </Pressable>
        ))}

        <View style={styles.infoCard}>
          <Ionicons name="information-circle-outline" size={20} color={Colors.primary} />
          <Text style={styles.infoText}>
            Esta voz se usa en los exámenes y en el temario cuando presionas el botón de audio. La primera vez puede tardar unos segundos en cargar.
          </Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  header: { paddingBottom: 16, paddingHorizontal: 16, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  headerTitle: { color: '#fff', fontSize: 20, fontFamily: 'Nunito_700Bold' },
  content: { flex: 1, padding: 16 },
  voiceCard: {
    backgroundColor: Colors.surface,
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    marginBottom: 24,
    borderWidth: 2,
    borderColor: Colors.primary,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  voiceIcon: { marginBottom: 12 },
  voiceName: { fontSize: 22, fontFamily: 'Nunito_800ExtraBold', color: Colors.text, marginBottom: 4 },
  voiceDesc: { fontSize: 14, fontFamily: 'Nunito_400Regular', color: Colors.textSecondary, marginBottom: 12 },
  badges: { flexDirection: 'row', gap: 8 },
  badge: {
    backgroundColor: '#dcfce7',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
  },
  badgeText: { fontSize: 12, fontFamily: 'Nunito_600SemiBold', color: '#16a34a' },
  sectionTitle: { fontSize: 16, fontFamily: 'Nunito_700Bold', color: Colors.text, marginBottom: 12 },
  previewCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    borderRadius: 12,
    padding: 14,
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 2,
    elevation: 1,
  },
  previewContent: { flex: 1, marginRight: 12 },
  previewText: { fontSize: 13, fontFamily: 'Nunito_400Regular', color: Colors.textSecondary, textAlign: 'justify' },
  playBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#eff6ff',
    justifyContent: 'center',
    alignItems: 'center',
  },
  playBtnActive: { backgroundColor: Colors.primary },
  infoCard: {
    flexDirection: 'row',
    backgroundColor: '#eff6ff',
    borderRadius: 12,
    padding: 14,
    marginTop: 16,
    gap: 10,
    alignItems: 'flex-start',
  },
  infoText: { flex: 1, fontSize: 13, fontFamily: 'Nunito_400Regular', color: Colors.textSecondary, textAlign: 'justify' },
});
