import React from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, Platform } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import Colors from '@/constants/colors';
import MascotaCopiloto from '@/components/MascotaCopiloto';
import { useUser } from '@/lib/UserContext';

export default function ResultsScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { isPremium, freeExamsRemaining } = useUser();
  const params = useLocalSearchParams<{
    score: string; correct: string; total: string;
    passed: string; mode: string; timeSpent: string;
    categoryBreakdown: string;
  }>();
  const webTopInset = Platform.OS === 'web' ? 67 : 0;

  const score = parseInt(params.score || '0');
  const correct = parseInt(params.correct || '0');
  const total = parseInt(params.total || '0');
  const passed = params.passed === 'true';
  const timeSpent = parseInt(params.timeSpent || '0');
  const breakdown: Record<string, { correct: number; total: number }> = params.categoryBreakdown ? JSON.parse(params.categoryBreakdown) : {};

  const formatTime = (s: number) => `${Math.floor(s / 60)}:${(s % 60).toString().padStart(2, '0')}`;

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={passed ? [Colors.success, '#15803d'] : [Colors.accent, '#d97706']}
        style={[styles.header, { paddingTop: (insets.top || webTopInset) + 16 }]}
      >
        <MascotaCopiloto
          state={passed ? 'celebrate' : 'encourage'}
          message={passed ? 'Felicidades, excelente resultado!' : 'Sigamos practicando, vas por buen camino!'}
        />
        <View style={styles.scoreCircle}>
          <Text style={styles.scoreText}>{score}%</Text>
          <Text style={styles.scoreLabel}>{correct}/{total} correctas</Text>
        </View>
        <Text style={styles.resultLabel}>{passed ? 'Aprobado' : 'Sigue practicando'}</Text>
      </LinearGradient>

      <ScrollView style={styles.content} contentContainerStyle={{ paddingBottom: (Platform.OS === 'web' ? 34 : insets.bottom) + 80 }}>
        <View style={styles.statsRow}>
          <View style={styles.statCard}>
            <Ionicons name="time-outline" size={22} color={Colors.primary} />
            <Text style={styles.statValue}>{formatTime(timeSpent)}</Text>
            <Text style={styles.statLabel}>Tiempo</Text>
          </View>
          <View style={styles.statCard}>
            <Ionicons name="checkmark-circle-outline" size={22} color={Colors.success} />
            <Text style={styles.statValue}>{correct}</Text>
            <Text style={styles.statLabel}>Correctas</Text>
          </View>
          <View style={styles.statCard}>
            <Ionicons name="close-circle-outline" size={22} color="#dc2626" />
            <Text style={styles.statValue}>{total - correct}</Text>
            <Text style={styles.statLabel}>Incorrectas</Text>
          </View>
        </View>

        <Text style={styles.sectionTitle}>Desglose por Categoria</Text>
        {Object.entries(breakdown).map(([cat, data]) => {
          const pct = Math.round((data.correct / data.total) * 100);
          return (
            <View key={cat} style={styles.categoryRow}>
              <View style={styles.categoryInfo}>
                <Text style={styles.categoryName}>{cat}</Text>
                <Text style={styles.categoryScore}>{data.correct}/{data.total}</Text>
              </View>
              <View style={styles.progressBar}>
                <View style={[styles.progressFill, { width: `${pct}%`, backgroundColor: pct >= 75 ? Colors.success : Colors.accent }]} />
              </View>
            </View>
          );
        })}

        {!isPremium && (
          <View style={styles.premiumUpsell}>
            <LinearGradient colors={['#7c3aed', '#5b21b6']} style={styles.premiumUpsellGradient}>
              <Ionicons name="diamond" size={28} color="#fbbf24" />
              <Text style={styles.premiumUpsellTitle}>Mejora tu preparación</Text>
              <Text style={styles.premiumUpsellDesc}>
                Con Premium accedes a explicaciones detalladas, tests avanzados, test por contenidos y exámenes ilimitados.
              </Text>
              {freeExamsRemaining > 0 ? (
                <Text style={styles.premiumUpsellCounter}>
                  Te quedan {freeExamsRemaining} examen{freeExamsRemaining !== 1 ? 'es' : ''} gratuito{freeExamsRemaining !== 1 ? 's' : ''}
                </Text>
              ) : (
                <Text style={styles.premiumUpsellCounter}>
                  Has usado todos tus exámenes gratuitos
                </Text>
              )}
              <Pressable onPress={() => router.push('/plans')} style={styles.premiumUpsellBtn}>
                <Text style={styles.premiumUpsellBtnText}>Ver Planes Premium</Text>
              </Pressable>
            </LinearGradient>
          </View>
        )}
      </ScrollView>

      <View style={[styles.footer, { paddingBottom: Platform.OS === 'web' ? 34 : (insets.bottom || 10) }]}>
        <Pressable onPress={() => router.replace('/')} style={styles.homeBtn}>
          <Ionicons name="home-outline" size={20} color="#fff" />
          <Text style={styles.homeBtnText}>Volver al Inicio</Text>
        </Pressable>
        <Pressable onPress={() => router.replace({ pathname: '/exam', params: { mode: params.mode || 'daily' } })} style={styles.retryBtn}>
          <Ionicons name="refresh" size={20} color={Colors.primary} />
          <Text style={styles.retryBtnText}>Repetir</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  header: { paddingBottom: 24, alignItems: 'center' },
  scoreCircle: { width: 110, height: 110, borderRadius: 55, backgroundColor: 'rgba(255,255,255,0.25)', justifyContent: 'center', alignItems: 'center', marginBottom: 8 },
  scoreText: { fontSize: 36, fontFamily: 'Nunito_800ExtraBold', color: '#fff' },
  scoreLabel: { fontSize: 13, fontFamily: 'Nunito_600SemiBold', color: 'rgba(255,255,255,0.9)' },
  resultLabel: { fontSize: 22, fontFamily: 'Nunito_800ExtraBold', color: '#fff' },
  content: { flex: 1, padding: 16 },
  statsRow: { flexDirection: 'row', gap: 8, marginBottom: 20 },
  statCard: { flex: 1, backgroundColor: Colors.surface, borderRadius: 12, padding: 14, alignItems: 'center', gap: 4, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.06, shadowRadius: 3, elevation: 2 },
  statValue: { fontSize: 20, fontFamily: 'Nunito_800ExtraBold', color: Colors.text },
  statLabel: { fontSize: 12, fontFamily: 'Nunito_400Regular', color: Colors.textSecondary },
  sectionTitle: { fontSize: 17, fontFamily: 'Nunito_700Bold', color: Colors.text, marginBottom: 12 },
  categoryRow: { marginBottom: 12 },
  categoryInfo: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 },
  categoryName: { fontSize: 14, fontFamily: 'Nunito_600SemiBold', color: Colors.text },
  categoryScore: { fontSize: 14, fontFamily: 'Nunito_700Bold', color: Colors.primary },
  progressBar: { height: 8, backgroundColor: Colors.surfaceSecondary, borderRadius: 4, overflow: 'hidden' },
  progressFill: { height: '100%', borderRadius: 4 },
  footer: { flexDirection: 'row', paddingHorizontal: 16, paddingTop: 10, gap: 10, backgroundColor: Colors.surface, borderTopWidth: 1, borderTopColor: Colors.border },
  homeBtn: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, backgroundColor: Colors.primary, paddingVertical: 14, borderRadius: 12 },
  homeBtnText: { color: '#fff', fontSize: 15, fontFamily: 'Nunito_700Bold' },
  retryBtn: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, backgroundColor: Colors.surfaceSecondary, paddingVertical: 14, borderRadius: 12, borderWidth: 1, borderColor: Colors.border },
  retryBtnText: { color: Colors.primary, fontSize: 15, fontFamily: 'Nunito_700Bold' },
  premiumUpsell: { marginTop: 20, borderRadius: 16, overflow: 'hidden' as const },
  premiumUpsellGradient: { padding: 20, alignItems: 'center' as const },
  premiumUpsellTitle: { fontSize: 20, fontFamily: 'Nunito_800ExtraBold', color: '#fff', marginTop: 8, marginBottom: 6 },
  premiumUpsellDesc: { fontSize: 14, fontFamily: 'Nunito_400Regular', color: 'rgba(255,255,255,0.9)', textAlign: 'center' as const, lineHeight: 20, marginBottom: 10 },
  premiumUpsellCounter: { fontSize: 13, fontFamily: 'Nunito_700Bold', color: '#fbbf24', marginBottom: 14 },
  premiumUpsellBtn: { backgroundColor: '#fff', paddingVertical: 12, paddingHorizontal: 28, borderRadius: 12 },
  premiumUpsellBtnText: { color: '#7c3aed', fontSize: 15, fontFamily: 'Nunito_700Bold' },
});
