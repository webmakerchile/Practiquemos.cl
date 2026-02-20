import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, Pressable, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import Colors from '@/constants/colors';
import { useUser } from '@/lib/UserContext';
import { apiRequest } from '@/lib/query-client';

interface HistoryResult {
  id: string;
  examMode: string;
  licenseType: string;
  totalQuestions: number;
  correctAnswers: number;
  score: number;
  passed: boolean;
  timeSpent: number;
  createdAt: string;
}

export default function HistoryScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { isLoggedIn } = useUser();
  const [results, setResults] = useState<HistoryResult[]>([]);
  const [loading, setLoading] = useState(true);
  const webTopInset = Platform.OS === 'web' ? 67 : 0;

  useEffect(() => {
    if (!isLoggedIn) { setLoading(false); return; }
    apiRequest('GET', '/api/exam-results')
      .then(res => res.json())
      .then(data => setResults(data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [isLoggedIn]);

  const getModeLabel = (mode: string) => {
    const labels: Record<string, string> = {
      daily: 'Test Diario', easy: 'Test Facil', hard: 'Test Dificil',
      smart: 'Test Inteligente', category: 'Por Categoria',
    };
    return labels[mode] || mode;
  };

  const formatDate = (d: string) => {
    const date = new Date(d);
    return date.toLocaleDateString('es-CL', { day: 'numeric', month: 'short', year: 'numeric' });
  };

  return (
    <View style={styles.container}>
      <LinearGradient colors={[Colors.primary, Colors.primaryLight]} style={[styles.header, { paddingTop: (insets.top || webTopInset) + 12 }]}>
        <Pressable onPress={() => router.back()} hitSlop={10}>
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </Pressable>
        <Text style={styles.headerTitle}>Mi Historial</Text>
        <View style={{ width: 24 }} />
      </LinearGradient>

      <FlatList
        data={results}
        keyExtractor={item => item.id}
        contentContainerStyle={{ padding: 12, paddingBottom: (Platform.OS === 'web' ? 34 : insets.bottom) + 20 }}
        renderItem={({ item }) => (
          <View style={styles.resultCard}>
            <View style={styles.resultHeader}>
              <Text style={styles.resultMode}>{getModeLabel(item.examMode)}</Text>
              <View style={[styles.resultBadge, { backgroundColor: item.passed ? Colors.success : Colors.accent }]}>
                <Text style={styles.resultBadgeText}>{item.passed ? 'Aprobado' : 'Practicando'}</Text>
              </View>
            </View>
            <View style={styles.resultStats}>
              <View style={styles.resultStat}>
                <Text style={styles.resultScore}>{item.score}%</Text>
                <Text style={styles.resultLabel}>Puntaje</Text>
              </View>
              <View style={styles.resultStat}>
                <Text style={styles.resultScore}>{item.correctAnswers}/{item.totalQuestions}</Text>
                <Text style={styles.resultLabel}>Correctas</Text>
              </View>
              <View style={styles.resultStat}>
                <Text style={styles.resultScore}>{Math.floor((item.timeSpent || 0) / 60)}:{((item.timeSpent || 0) % 60).toString().padStart(2, '0')}</Text>
                <Text style={styles.resultLabel}>Tiempo</Text>
              </View>
            </View>
            <Text style={styles.resultDate}>{formatDate(item.createdAt)}</Text>
          </View>
        )}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Ionicons name="time-outline" size={48} color={Colors.textMuted} />
            <Text style={styles.emptyTitle}>{loading ? 'Cargando...' : 'Sin examenes'}</Text>
            <Text style={styles.emptyDesc}>Completa examenes para ver tu historial aqui.</Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  header: { paddingBottom: 16, paddingHorizontal: 16, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  headerTitle: { color: '#fff', fontSize: 20, fontFamily: 'Nunito_700Bold' },
  resultCard: { backgroundColor: Colors.surface, borderRadius: 14, padding: 16, marginBottom: 10, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.06, shadowRadius: 4, elevation: 2 },
  resultHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  resultMode: { fontSize: 16, fontFamily: 'Nunito_700Bold', color: Colors.text },
  resultBadge: { paddingHorizontal: 10, paddingVertical: 3, borderRadius: 10 },
  resultBadgeText: { color: '#fff', fontSize: 12, fontFamily: 'Nunito_700Bold' },
  resultStats: { flexDirection: 'row', gap: 16, marginBottom: 6 },
  resultStat: { alignItems: 'center' },
  resultScore: { fontSize: 18, fontFamily: 'Nunito_800ExtraBold', color: Colors.primary },
  resultLabel: { fontSize: 12, fontFamily: 'Nunito_400Regular', color: Colors.textSecondary },
  resultDate: { fontSize: 12, fontFamily: 'Nunito_400Regular', color: Colors.textMuted },
  emptyState: { alignItems: 'center', paddingTop: 60, gap: 8 },
  emptyTitle: { fontSize: 18, fontFamily: 'Nunito_700Bold', color: Colors.text },
  emptyDesc: { fontSize: 14, fontFamily: 'Nunito_400Regular', color: Colors.textSecondary, textAlign: 'center' },
});
