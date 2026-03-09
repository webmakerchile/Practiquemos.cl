import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, Platform, Image } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import * as Speech from 'expo-speech';
import Colors from '@/constants/colors';
import { temarioChapters } from '@/lib/mockDatabase';
import { useVoice } from '@/lib/VoiceContext';

const CHAPTER_IMAGES: Record<string, any> = {
  ch1: require('../assets/images/questions/licencia.png'),
  ch2: require('../assets/images/questions/senal-pare.png'),
  ch3: require('../assets/images/questions/senales-tipos.png'),
  ch4: require('../assets/images/questions/motor.png'),
  ch5: require('../assets/images/questions/primeros-auxilios.png'),
  ch6: require('../assets/images/questions/conduccion-defensiva.png'),
};

const SECTION_IMAGE_KEYWORDS: Record<string, any> = {
  'licencia': require('../assets/images/questions/licencia.png'),
  'cinturón': require('../assets/images/questions/silla-infantil.png'),
  'celular': require('../assets/images/questions/celular.png'),
  'velocidad': require('../assets/images/questions/velocidad-urbana.png'),
  'alcohol': require('../assets/images/questions/alcohol.png'),
  'estacionamiento': require('../assets/images/questions/estacionamiento.png'),
  'adelantamiento': require('../assets/images/questions/adelantamiento.png'),
  'semáforo': require('../assets/images/questions/semaforo-rojo.png'),
  'rotonda': require('../assets/images/questions/rotonda.png'),
  'PARE': require('../assets/images/questions/senal-pare.png'),
  'señal': require('../assets/images/questions/senales-tipos.png'),
  'escuela': require('../assets/images/questions/zona-escolar.png'),
  'peatón': require('../assets/images/questions/cruce-peatonal.png'),
  'neumático': require('../assets/images/questions/neumaticos.png'),
  'freno': require('../assets/images/questions/frenos.png'),
  'motor': require('../assets/images/questions/motor.png'),
  'RCP': require('../assets/images/questions/primeros-auxilios.png'),
  'herida': require('../assets/images/questions/primeros-auxilios.png'),
  'fractura': require('../assets/images/questions/primeros-auxilios.png'),
  'extintor': require('../assets/images/questions/extintor.png'),
  'lluvia': require('../assets/images/questions/lluvia.png'),
  'niebla': require('../assets/images/questions/niebla.png'),
  'túnel': require('../assets/images/questions/tunel.png'),
  'fatiga': require('../assets/images/questions/fatiga.png'),
  'airbag': require('../assets/images/questions/airbag.png'),
  'emisión': require('../assets/images/questions/medio-ambiente.png'),
  'contaminación': require('../assets/images/questions/medio-ambiente.png'),
  'punto ciego': require('../assets/images/questions/punto-ciego.png'),
  'espejo': require('../assets/images/questions/espejos.png'),
  'luces': require('../assets/images/questions/conduccion-nocturna.png'),
  'nocturna': require('../assets/images/questions/conduccion-nocturna.png'),
};

function getSectionImage(title: string, chapterId: string): any {
  for (const [keyword, img] of Object.entries(SECTION_IMAGE_KEYWORDS)) {
    if (title.toLowerCase().includes(keyword.toLowerCase())) return img;
  }
  return CHAPTER_IMAGES[chapterId] || null;
}

export default function TemarioDetailScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { chapterId } = useLocalSearchParams<{ chapterId: string }>();
  const { getSpeechOptions } = useVoice();
  const webTopInset = Platform.OS === 'web' ? 67 : 0;

  const chapter = temarioChapters.find(c => c.id === chapterId);
  const [expandedSection, setExpandedSection] = useState<number | null>(0);
  const [speakingIdx, setSpeakingIdx] = useState<number | null>(null);

  useEffect(() => {
    return () => { Speech.stop(); };
  }, []);

  const handleSpeak = (text: string, idx: number) => {
    if (speakingIdx === idx) {
      Speech.stop();
      setSpeakingIdx(null);
      return;
    }
    Speech.stop();
    setSpeakingIdx(idx);
    const humanized = text
      .replace(/\.\s+/g, '... ')
      .replace(/:\s*/g, ':... ')
      .replace(/\?\s*/g, '?... ')
      .replace(/;\s*/g, ';... ')
      .replace(/,\s*/g, ', ');
    Speech.speak(humanized, {
      ...getSpeechOptions(),
      onDone: () => setSpeakingIdx(null),
      onStopped: () => setSpeakingIdx(null),
      onError: () => setSpeakingIdx(null),
    });
  };

  if (!chapter) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <Text>Capítulo no encontrado</Text>
        <Pressable onPress={() => router.back()}>
          <Text style={{ color: Colors.primary, marginTop: 12 }}>Volver</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <LinearGradient colors={[Colors.primary, Colors.primaryLight]} style={[styles.header, { paddingTop: (insets.top || webTopInset) + 12 }]}>
        <Pressable onPress={() => { Speech.stop(); router.back(); }} hitSlop={10}>
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </Pressable>
        <View style={styles.headerContent}>
          <Text style={styles.headerTitle}>{chapter.title}</Text>
          <Text style={styles.headerSections}>{chapter.sections.length} secciones</Text>
        </View>
        <Ionicons name={chapter.icon as any} size={28} color="rgba(255,255,255,0.6)" />
      </LinearGradient>

      <ScrollView contentContainerStyle={[styles.content, { paddingBottom: (Platform.OS === 'web' ? 34 : insets.bottom) + 20 }]}>
        {CHAPTER_IMAGES[chapterId || ''] && (
          <View style={styles.chapterImgWrap}>
            <Image source={CHAPTER_IMAGES[chapterId || '']} style={styles.chapterImg} resizeMode="contain" />
          </View>
        )}

        {chapter.sections.map((section, idx) => {
          const sectionImg = getSectionImage(section.title, chapterId || '');
          return (
            <View key={idx} style={styles.sectionCard}>
              <Pressable onPress={() => { setExpandedSection(expandedSection === idx ? null : idx); }} style={styles.sectionHeader}>
                <View style={styles.sectionNum}>
                  <Text style={styles.sectionNumText}>{idx + 1}</Text>
                </View>
                <Text style={styles.sectionTitle}>{section.title}</Text>
                <Ionicons name={expandedSection === idx ? 'chevron-up' : 'chevron-down'} size={20} color={Colors.textMuted} />
              </Pressable>
              {expandedSection === idx && (
                <View style={styles.sectionBody}>
                  {sectionImg && (
                    <View style={styles.sectionImgWrap}>
                      <Image source={sectionImg} style={styles.sectionImg} resizeMode="contain" />
                    </View>
                  )}
                  <Text style={styles.sectionText}>{section.content}</Text>
                  <Pressable
                    onPress={() => handleSpeak(section.title + '. ' + section.content, idx)}
                    style={[styles.speakBtn, speakingIdx === idx && styles.speakBtnActive]}
                  >
                    <Ionicons
                      name={speakingIdx === idx ? 'stop-circle' : 'volume-high'}
                      size={18}
                      color={speakingIdx === idx ? '#fff' : Colors.primary}
                    />
                    <Text style={[styles.speakBtnText, speakingIdx === idx && styles.speakBtnTextActive]}>
                      {speakingIdx === idx ? 'Detener' : 'Escuchar'}
                    </Text>
                  </Pressable>
                </View>
              )}
            </View>
          );
        })}

        <Pressable
          onPress={() => router.push({ pathname: '/exam', params: { mode: 'category', category: chapter.title } })}
          style={({ pressed }) => [styles.practiceBtn, pressed && { opacity: 0.8 }]}
        >
          <Ionicons name="school-outline" size={20} color="#fff" />
          <Text style={styles.practiceBtnText}>Practicar preguntas de {chapter.title}</Text>
        </Pressable>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  header: { paddingBottom: 16, paddingHorizontal: 16, flexDirection: 'row', alignItems: 'center', gap: 12 },
  headerContent: { flex: 1 },
  headerTitle: { color: '#fff', fontSize: 20, fontFamily: 'Nunito_700Bold' },
  headerSections: { color: 'rgba(255,255,255,0.7)', fontSize: 13, fontFamily: 'Nunito_400Regular' },
  content: { padding: 16 },
  chapterImgWrap: { alignItems: 'center', marginBottom: 16, backgroundColor: Colors.surface, borderRadius: 14, padding: 16, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.06, shadowRadius: 4, elevation: 2 },
  chapterImg: { width: 120, height: 120 },
  sectionCard: { backgroundColor: Colors.surface, borderRadius: 14, marginBottom: 10, overflow: 'hidden', shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.06, shadowRadius: 4, elevation: 2 },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', padding: 16, gap: 12 },
  sectionNum: { width: 32, height: 32, borderRadius: 16, backgroundColor: Colors.primary, justifyContent: 'center', alignItems: 'center' },
  sectionNumText: { color: '#fff', fontSize: 14, fontFamily: 'Nunito_700Bold' },
  sectionTitle: { flex: 1, fontSize: 15, fontFamily: 'Nunito_700Bold', color: Colors.text },
  sectionBody: { paddingHorizontal: 16, paddingBottom: 16, paddingTop: 4 },
  sectionImgWrap: { alignItems: 'center', marginBottom: 12, backgroundColor: '#f8fafc', borderRadius: 10, padding: 10 },
  sectionImg: { width: 80, height: 80 },
  sectionText: { fontSize: 14, fontFamily: 'Nunito_400Regular', color: Colors.textSecondary, lineHeight: 24, textAlign: 'justify' as const },
  speakBtn: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 12, alignSelf: 'flex-start', paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20, backgroundColor: '#eef2ff', borderWidth: 1, borderColor: Colors.primary + '30' },
  speakBtnActive: { backgroundColor: Colors.primary, borderColor: Colors.primary },
  speakBtnText: { fontSize: 13, fontFamily: 'Nunito_700Bold', color: Colors.primary },
  speakBtnTextActive: { color: '#fff' },
  practiceBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, backgroundColor: Colors.primary, paddingVertical: 16, borderRadius: 14, marginTop: 16 },
  practiceBtnText: { color: '#fff', fontSize: 15, fontFamily: 'Nunito_700Bold' },
});
