import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, Platform } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import Colors from '@/constants/colors';
import { temarioChapters } from '@/lib/mockDatabase';

export default function TemarioDetailScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { chapterId } = useLocalSearchParams<{ chapterId: string }>();
  const webTopInset = Platform.OS === 'web' ? 67 : 0;

  const chapter = temarioChapters.find(c => c.id === chapterId);
  const [expandedSection, setExpandedSection] = useState<number | null>(0);

  if (!chapter) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <Text>Capitulo no encontrado</Text>
        <Pressable onPress={() => router.back()}>
          <Text style={{ color: Colors.primary, marginTop: 12 }}>Volver</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <LinearGradient colors={[Colors.primary, Colors.primaryLight]} style={[styles.header, { paddingTop: (insets.top || webTopInset) + 12 }]}>
        <Pressable onPress={() => router.back()} hitSlop={10}>
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </Pressable>
        <View style={styles.headerContent}>
          <Text style={styles.headerTitle}>{chapter.title}</Text>
          <Text style={styles.headerSections}>{chapter.sections.length} secciones</Text>
        </View>
        <Ionicons name={chapter.icon as any} size={28} color="rgba(255,255,255,0.6)" />
      </LinearGradient>

      <ScrollView contentContainerStyle={[styles.content, { paddingBottom: (Platform.OS === 'web' ? 34 : insets.bottom) + 20 }]}>
        {chapter.sections.map((section, idx) => (
          <View key={idx} style={styles.sectionCard}>
            <Pressable onPress={() => setExpandedSection(expandedSection === idx ? null : idx)} style={styles.sectionHeader}>
              <View style={styles.sectionNum}>
                <Text style={styles.sectionNumText}>{idx + 1}</Text>
              </View>
              <Text style={styles.sectionTitle}>{section.title}</Text>
              <Ionicons name={expandedSection === idx ? 'chevron-up' : 'chevron-down'} size={20} color={Colors.textMuted} />
            </Pressable>
            {expandedSection === idx && (
              <View style={styles.sectionBody}>
                <Text style={styles.sectionText}>{section.content}</Text>
              </View>
            )}
          </View>
        ))}

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
  sectionCard: { backgroundColor: Colors.surface, borderRadius: 14, marginBottom: 10, overflow: 'hidden', shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.06, shadowRadius: 4, elevation: 2 },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', padding: 16, gap: 12 },
  sectionNum: { width: 32, height: 32, borderRadius: 16, backgroundColor: Colors.primary, justifyContent: 'center', alignItems: 'center' },
  sectionNumText: { color: '#fff', fontSize: 14, fontFamily: 'Nunito_700Bold' },
  sectionTitle: { flex: 1, fontSize: 15, fontFamily: 'Nunito_700Bold', color: Colors.text },
  sectionBody: { paddingHorizontal: 16, paddingBottom: 16, paddingTop: 4 },
  sectionText: { fontSize: 14, fontFamily: 'Nunito_400Regular', color: Colors.textSecondary, lineHeight: 24 },
  practiceBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, backgroundColor: Colors.primary, paddingVertical: 16, borderRadius: 14, marginTop: 16 },
  practiceBtnText: { color: '#fff', fontSize: 15, fontFamily: 'Nunito_700Bold' },
});
