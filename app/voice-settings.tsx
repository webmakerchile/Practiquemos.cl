import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, Pressable, Platform, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import * as Speech from 'expo-speech';
import Colors from '@/constants/colors';
import { useVoice } from '@/lib/VoiceContext';

const PREVIEW_TEXT = 'Hola, soy tu copiloto de estudio. Te ayudaré a preparar tu examen de conducir.';

interface VoiceItem {
  identifier: string;
  name: string;
  language: string;
  quality?: string;
}

export default function VoiceSettingsScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { voiceSettings, setVoiceId, setRate, setPitch } = useVoice();
  const webTopInset = Platform.OS === 'web' ? 67 : 0;

  const [voices, setVoices] = useState<VoiceItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [playingId, setPlayingId] = useState<string | null>(null);
  const [localRate, setLocalRate] = useState(voiceSettings.rate);
  const [localPitch, setLocalPitch] = useState(voiceSettings.pitch);

  useEffect(() => {
    loadVoices();
  }, []);

  const loadVoices = async () => {
    try {
      const allVoices = await Speech.getAvailableVoicesAsync();
      const spanishVoices = allVoices
        .filter(v => v.language.startsWith('es'))
        .sort((a, b) => {
          const aQuality = (a as any).quality === 'Enhanced' ? 0 : 1;
          const bQuality = (b as any).quality === 'Enhanced' ? 0 : 1;
          if (aQuality !== bQuality) return aQuality - bQuality;
          return a.name.localeCompare(b.name);
        });
      setVoices(spanishVoices);
    } catch {
      setVoices([]);
    } finally {
      setLoading(false);
    }
  };

  const previewVoice = (voice: VoiceItem) => {
    if (playingId === voice.identifier) {
      Speech.stop();
      setPlayingId(null);
      return;
    }
    Speech.stop();
    setPlayingId(voice.identifier);
    Speech.speak(PREVIEW_TEXT, {
      voice: voice.identifier,
      language: voice.language,
      rate: localRate,
      pitch: localPitch,
      onDone: () => setPlayingId(null),
      onStopped: () => setPlayingId(null),
      onError: () => setPlayingId(null),
    });
  };

  const selectVoice = (voice: VoiceItem) => {
    setVoiceId(voice.identifier, voice.name);
  };

  const selectDefault = () => {
    setVoiceId(null, null);
  };

  const handleRateChange = (delta: number) => {
    const newRate = Math.round(Math.max(0.5, Math.min(1.5, localRate + delta)) * 100) / 100;
    setLocalRate(newRate);
    setRate(newRate);
  };

  const handlePitchChange = (delta: number) => {
    const newPitch = Math.round(Math.max(0.5, Math.min(1.5, localPitch + delta)) * 100) / 100;
    setLocalPitch(newPitch);
    setPitch(newPitch);
  };

  const previewDefault = () => {
    if (playingId === '__default__') {
      Speech.stop();
      setPlayingId(null);
      return;
    }
    Speech.stop();
    setPlayingId('__default__');
    Speech.speak(PREVIEW_TEXT, {
      language: 'es-419',
      rate: localRate,
      pitch: localPitch,
      onDone: () => setPlayingId(null),
      onStopped: () => setPlayingId(null),
      onError: () => setPlayingId(null),
    });
  };

  const getLanguageLabel = (lang: string) => {
    if (lang.includes('MX') || lang === 'es-MX') return 'Mexico';
    if (lang.includes('ES') || lang === 'es-ES') return 'España';
    if (lang.includes('AR') || lang === 'es-AR') return 'Argentina';
    if (lang.includes('CL') || lang === 'es-CL') return 'Chile';
    if (lang.includes('CO') || lang === 'es-CO') return 'Colombia';
    if (lang.includes('PE') || lang === 'es-PE') return 'Peru';
    if (lang.includes('419') || lang === 'es-419') return 'Latinoamérica';
    if (lang === 'es' || lang === 'es-US') return 'Español';
    return lang.replace('es-', '');
  };

  const isSelected = (voiceId: string) => voiceSettings.voiceId === voiceId;

  const renderVoice = ({ item }: { item: VoiceItem }) => {
    const selected = isSelected(item.identifier);
    const isPlaying = playingId === item.identifier;
    const qualityLabel = (item as any).quality;

    return (
      <View style={[styles.voiceCard, selected && styles.voiceCardSelected]}>
        <Pressable
          style={styles.voiceInfo}
          onPress={() => selectVoice(item)}
        >
          <View style={[styles.radioOuter, selected && styles.radioOuterSelected]}>
            {selected && <View style={styles.radioInner} />}
          </View>
          <View style={styles.voiceDetails}>
            <Text style={[styles.voiceName, selected && styles.voiceNameSelected]}>{item.name}</Text>
            <View style={styles.voiceTags}>
              <View style={styles.tag}>
                <Text style={styles.tagText}>{getLanguageLabel(item.language)}</Text>
              </View>
              {qualityLabel && (
                <View style={[styles.tag, qualityLabel === 'Enhanced' && styles.tagEnhanced]}>
                  <Text style={[styles.tagText, qualityLabel === 'Enhanced' && styles.tagEnhancedText]}>
                    {qualityLabel === 'Enhanced' ? 'Alta calidad' : qualityLabel === 'Default' ? 'Estándar' : qualityLabel}
                  </Text>
                </View>
              )}
            </View>
          </View>
        </Pressable>
        <Pressable
          onPress={() => previewVoice(item)}
          style={({ pressed }) => [styles.playBtn, isPlaying && styles.playBtnActive, pressed && { opacity: 0.7 }]}
        >
          <Ionicons
            name={isPlaying ? 'stop' : 'play'}
            size={20}
            color={isPlaying ? '#fff' : Colors.primary}
          />
        </Pressable>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <LinearGradient colors={[Colors.primary, Colors.primaryDark]} style={[styles.header, { paddingTop: (insets.top || webTopInset) + 12 }]}>
        <Pressable onPress={() => { Speech.stop(); router.back(); }} hitSlop={10}>
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </Pressable>
        <Text style={styles.headerTitle}>Configurar Voz</Text>
        <View style={{ width: 24 }} />
      </LinearGradient>

      <FlatList
        data={voices}
        keyExtractor={item => item.identifier}
        renderItem={renderVoice}
        contentContainerStyle={[styles.listContent, { paddingBottom: (Platform.OS === 'web' ? 34 : insets.bottom) + 20 }]}
        ListHeaderComponent={
          <View>
            <View style={styles.controlsCard}>
              <Text style={styles.controlsTitle}>Ajustes de voz</Text>

              <View style={styles.sliderRow}>
                <Text style={styles.sliderLabel}>Velocidad</Text>
                <View style={styles.sliderControls}>
                  <Pressable onPress={() => handleRateChange(-0.05)} style={styles.sliderBtn}>
                    <Ionicons name="remove" size={18} color={Colors.primary} />
                  </Pressable>
                  <Text style={styles.sliderValue}>{localRate.toFixed(2)}</Text>
                  <Pressable onPress={() => handleRateChange(0.05)} style={styles.sliderBtn}>
                    <Ionicons name="add" size={18} color={Colors.primary} />
                  </Pressable>
                </View>
              </View>

              <View style={styles.sliderRow}>
                <Text style={styles.sliderLabel}>Tono</Text>
                <View style={styles.sliderControls}>
                  <Pressable onPress={() => handlePitchChange(-0.05)} style={styles.sliderBtn}>
                    <Ionicons name="remove" size={18} color={Colors.primary} />
                  </Pressable>
                  <Text style={styles.sliderValue}>{localPitch.toFixed(2)}</Text>
                  <Pressable onPress={() => handlePitchChange(0.05)} style={styles.sliderBtn}>
                    <Ionicons name="add" size={18} color={Colors.primary} />
                  </Pressable>
                </View>
              </View>
            </View>

            <Text style={styles.sectionTitle}>Voces en español disponibles</Text>
            <Text style={styles.sectionSubtitle}>
              Toca una voz para seleccionarla. Usa el botón de play para escucharla.
            </Text>

            <View style={[styles.voiceCard, !voiceSettings.voiceId && styles.voiceCardSelected]}>
              <Pressable style={styles.voiceInfo} onPress={selectDefault}>
                <View style={[styles.radioOuter, !voiceSettings.voiceId && styles.radioOuterSelected]}>
                  {!voiceSettings.voiceId && <View style={styles.radioInner} />}
                </View>
                <View style={styles.voiceDetails}>
                  <Text style={[styles.voiceName, !voiceSettings.voiceId && styles.voiceNameSelected]}>
                    Voz predeterminada del sistema
                  </Text>
                  <View style={styles.voiceTags}>
                    <View style={styles.tag}>
                      <Text style={styles.tagText}>Latinoamérica</Text>
                    </View>
                  </View>
                </View>
              </Pressable>
              <Pressable
                onPress={previewDefault}
                style={({ pressed }) => [styles.playBtn, playingId === '__default__' && styles.playBtnActive, pressed && { opacity: 0.7 }]}
              >
                <Ionicons
                  name={playingId === '__default__' ? 'stop' : 'play'}
                  size={20}
                  color={playingId === '__default__' ? '#fff' : Colors.primary}
                />
              </Pressable>
            </View>

            {loading && (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={Colors.primary} />
                <Text style={styles.loadingText}>Cargando voces disponibles...</Text>
              </View>
            )}
          </View>
        }
        ListEmptyComponent={
          !loading ? (
            <View style={styles.emptyContainer}>
              <Ionicons name="volume-mute-outline" size={48} color={Colors.textMuted} />
              <Text style={styles.emptyText}>
                No se encontraron voces en español adicionales en este dispositivo.
                La voz predeterminada del sistema se usará automáticamente.
              </Text>
            </View>
          ) : null
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  header: { paddingBottom: 16, paddingHorizontal: 16, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  headerTitle: { color: '#fff', fontSize: 20, fontFamily: 'Nunito_700Bold' },
  listContent: { padding: 16 },
  controlsCard: {
    backgroundColor: Colors.surface,
    borderRadius: 14,
    padding: 16,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
  controlsTitle: { fontSize: 16, fontFamily: 'Nunito_700Bold', color: Colors.text, marginBottom: 14 },
  sliderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  sliderLabel: { fontSize: 14, fontFamily: 'Nunito_600SemiBold', color: Colors.textSecondary, width: 80 },
  sliderControls: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  sliderBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.surfaceSecondary,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  sliderValue: { fontSize: 16, fontFamily: 'Nunito_700Bold', color: Colors.text, width: 48, textAlign: 'center' },
  sectionTitle: { fontSize: 16, fontFamily: 'Nunito_700Bold', color: Colors.text, marginBottom: 4 },
  sectionSubtitle: { fontSize: 13, fontFamily: 'Nunito_400Regular', color: Colors.textSecondary, marginBottom: 14, textAlign: 'justify' },
  voiceCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    borderRadius: 12,
    padding: 14,
    marginBottom: 8,
    borderWidth: 2,
    borderColor: 'transparent',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 2,
    elevation: 1,
  },
  voiceCardSelected: {
    borderColor: Colors.primary,
    backgroundColor: '#eff6ff',
  },
  voiceInfo: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 12 },
  radioOuter: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    borderColor: Colors.textMuted,
    justifyContent: 'center',
    alignItems: 'center',
  },
  radioOuterSelected: { borderColor: Colors.primary },
  radioInner: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: Colors.primary,
  },
  voiceDetails: { flex: 1, gap: 4 },
  voiceName: { fontSize: 14, fontFamily: 'Nunito_600SemiBold', color: Colors.text },
  voiceNameSelected: { color: Colors.primary, fontFamily: 'Nunito_700Bold' },
  voiceTags: { flexDirection: 'row', gap: 6, flexWrap: 'wrap' },
  tag: {
    backgroundColor: Colors.surfaceSecondary,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
  },
  tagText: { fontSize: 11, fontFamily: 'Nunito_600SemiBold', color: Colors.textSecondary },
  tagEnhanced: { backgroundColor: '#dcfce7' },
  tagEnhancedText: { color: '#16a34a' },
  playBtn: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: '#eff6ff',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
  },
  playBtnActive: { backgroundColor: Colors.primary },
  loadingContainer: { alignItems: 'center', paddingVertical: 30, gap: 12 },
  loadingText: { fontSize: 14, fontFamily: 'Nunito_400Regular', color: Colors.textSecondary },
  emptyContainer: { alignItems: 'center', paddingVertical: 30, gap: 12, paddingHorizontal: 20 },
  emptyText: { fontSize: 14, fontFamily: 'Nunito_400Regular', color: Colors.textSecondary, textAlign: 'center' },
});
