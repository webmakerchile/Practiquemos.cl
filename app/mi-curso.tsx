import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import Colors from '@/constants/colors';
import { useUser } from '@/lib/UserContext';
import { apiRequest } from '@/lib/query-client';
import { categorias } from '@/lib/mockDatabase';

interface Progress {
  category: string;
  totalAnswered: number;
  totalCorrect: number;
}

export default function MiCursoScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { isLoggedIn, licenseType } = useUser();
  const [progress, setProgress] = useState<Progress[]>([]);
  const [loading, setLoading] = useState(true);
  const webTopInset = Platform.OS === 'web' ? 67 : 0;

  useEffect(() => {
    if (!isLoggedIn) { setLoading(false); return; }
    apiRequest('GET', `/api/progress/${licenseType}`)
      .then(res => res.json())
      .then(data => setProgress(data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [isLoggedIn, licenseType]);

  const getProgressForCategory = (cat: string) => {
    const p = progress.find(pr => pr.category === cat);
    if (!p || p.totalAnswered === 0) return { answered: 0, correct: 0, pct: 0 };
    return { answered: p.totalAnswered, correct: p.totalCorrect, pct: Math.round((p.totalCorrect / p.totalAnswered) * 100) };
  };

  const totalAnswered = progress.reduce((s, p) => s + p.totalAnswered, 0);
  const totalCorrect = progress.reduce((s, p) => s + p.totalCorrect, 0);
  const overallPct = totalAnswered > 0 ? Math.round((totalCorrect / totalAnswered) * 100) : 0;

  return (
    <View style={styles.container}>
      <LinearGradient colors={[Colors.primary, Colors.primaryLight]} style={[styles.header, { paddingTop: (insets.top || webTopInset) + 12 }]}>
        <Pressable onPress={() => router.back()} hitSlop={10}>
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </Pressable>
        <Text style={styles.headerTitle}>Mi Curso</Text>
        <View style={{ width: 24 }} />
      </LinearGradient>

      <ScrollView contentContainerStyle={[styles.content, { paddingBottom: (Platform.OS === 'web' ? 34 : insets.bottom) + 20 }]}>
        <View style={styles.overviewCard}>
          <View style={styles.overviewCircle}>
            <Text style={styles.overviewPct}>{overallPct}%</Text>
          </View>
          <View style={styles.overviewInfo}>
            <Text style={styles.overviewTitle}>Tu progreso general</Text>
            <Text style={styles.overviewStat}>{totalAnswered} preguntas respondidas</Text>
            <Text style={styles.overviewStat}>{totalCorrect} respuestas correctas</Text>
          </View>
        </View>

        <Text style={styles.sectionTitle}>Progreso por Categoria</Text>

        {categorias.map(cat => {
          const { answered, correct, pct } = getProgressForCategory(cat);
          const barColor = pct >= 75 ? Colors.success : pct >= 50 ? Colors.accent : Colors.primaryLight;
          return (
            <Pressable
              key={cat}
              onPress={() => router.push({ pathname: '/exam', params: { mode: 'category', category: cat, licenseType } })}
              style={({ pressed }) => [styles.categoryCard, pressed && { opacity: 0.7 }]}
            >
              <View style={styles.categoryHeader}>
                <Text style={styles.categoryName}>{cat}</Text>
                <Text style={[styles.categoryPct, { color: barColor }]}>{pct}%</Text>
              </View>
              <View style={styles.progressBar}>
                <View style={[styles.progressFill, { width: `${Math.max(pct, 2)}%`, backgroundColor: barColor }]} />
              </View>
              <Text style={styles.categoryStat}>{answered > 0 ? `${correct}/${answered} correctas` : 'Sin practicar'}</Text>
            </Pressable>
          );
        })}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  header: { paddingBottom: 16, paddingHorizontal: 16, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  headerTitle: { color: '#fff', fontSize: 20, fontFamily: 'Nunito_700Bold' },
  content: { padding: 16 },
  overviewCard: { flexDirection: 'row', backgroundColor: Colors.surface, borderRadius: 16, padding: 20, marginBottom: 20, alignItems: 'center', gap: 16, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.08, shadowRadius: 6, elevation: 3 },
  overviewCircle: { width: 80, height: 80, borderRadius: 40, backgroundColor: Colors.primary, justifyContent: 'center', alignItems: 'center' },
  overviewPct: { color: '#fff', fontSize: 24, fontFamily: 'Nunito_800ExtraBold' },
  overviewInfo: { flex: 1 },
  overviewTitle: { fontSize: 16, fontFamily: 'Nunito_700Bold', color: Colors.text, marginBottom: 4 },
  overviewStat: { fontSize: 13, fontFamily: 'Nunito_400Regular', color: Colors.textSecondary },
  sectionTitle: { fontSize: 17, fontFamily: 'Nunito_700Bold', color: Colors.text, marginBottom: 12 },
  categoryCard: { backgroundColor: Colors.surface, borderRadius: 12, padding: 14, marginBottom: 8, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.06, shadowRadius: 3, elevation: 2 },
  categoryHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 },
  categoryName: { fontSize: 15, fontFamily: 'Nunito_600SemiBold', color: Colors.text },
  categoryPct: { fontSize: 15, fontFamily: 'Nunito_800ExtraBold' },
  progressBar: { height: 8, backgroundColor: Colors.surfaceSecondary, borderRadius: 4, overflow: 'hidden', marginBottom: 4 },
  progressFill: { height: '100%', borderRadius: 4 },
  categoryStat: { fontSize: 12, fontFamily: 'Nunito_400Regular', color: Colors.textMuted },
});
