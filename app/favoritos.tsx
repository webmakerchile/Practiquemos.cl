import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import Colors from '@/constants/colors';
import { useUser } from '@/lib/UserContext';
import { apiRequest } from '@/lib/query-client';
import { fetchQuestionsByLicense } from '@/lib/mockDatabase';
import type { Question } from '@/lib/mockDatabase';

export default function FavoritosScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { isLoggedIn, licenseType } = useUser();
  const [favoriteIds, setFavoriteIds] = useState<number[]>([]);
  const [allQuestions, setAllQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const webTopInset = Platform.OS === 'web' ? 67 : 0;

  useEffect(() => {
    if (!isLoggedIn) { setLoading(false); return; }
    Promise.all([
      apiRequest('GET', `/api/favorites/${licenseType}`).then(res => res.json()),
      fetchQuestionsByLicense(licenseType),
    ]).then(([favIds, questions]) => {
      setFavoriteIds(favIds);
      setAllQuestions(questions);
    }).catch(() => {}).finally(() => setLoading(false));
  }, [isLoggedIn, licenseType]);

  const favoriteQuestions = allQuestions.filter(q => favoriteIds.includes(q.id));

  const removeFavorite = async (questionId: number) => {
    await apiRequest('DELETE', `/api/favorites/${questionId}/${licenseType}`).catch(() => {});
    setFavoriteIds(prev => prev.filter(id => id !== questionId));
  };

  return (
    <View style={styles.container}>
      <LinearGradient colors={[Colors.accent, '#d97706']} style={[styles.header, { paddingTop: (insets.top || webTopInset) + 12 }]}>
        <Pressable onPress={() => router.back()} hitSlop={10}>
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </Pressable>
        <Text style={styles.headerTitle}>Mis Favoritos</Text>
        <View style={{ width: 24 }} />
      </LinearGradient>

      <ScrollView contentContainerStyle={[styles.content, { paddingBottom: (Platform.OS === 'web' ? 34 : insets.bottom) + 20 }]}>
        {loading ? (
          <Text style={styles.emptyText}>Cargando...</Text>
        ) : favoriteQuestions.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons name="star-outline" size={48} color={Colors.textMuted} />
            <Text style={styles.emptyTitle}>Sin favoritos</Text>
            <Text style={styles.emptyDesc}>Marca preguntas como favoritas durante los examenes para repasarlas aqui.</Text>
          </View>
        ) : (
          favoriteQuestions.map(q => (
            <View key={q.id} style={styles.questionCard}>
              <View style={styles.questionHeader}>
                <View style={styles.catBadge}>
                  <Text style={styles.catBadgeText}>{q.categoria}</Text>
                </View>
                <Pressable onPress={() => removeFavorite(q.id)} hitSlop={10}>
                  <Ionicons name="star" size={22} color={Colors.accent} />
                </Pressable>
              </View>
              <Text style={styles.questionText}>{q.pregunta}</Text>
              <Pressable onPress={() => setExpandedId(expandedId === q.id ? null : q.id)}>
                <Text style={styles.showAnswer}>{expandedId === q.id ? 'Ocultar respuesta' : 'Ver respuesta'}</Text>
              </Pressable>
              {expandedId === q.id && (
                <View style={styles.answerBox}>
                  <Text style={styles.correctAnswer}>Respuesta: {q.opciones[q.respuestaCorrecta]}</Text>
                  <Text style={styles.explanationText}>{q.explicacionTexto}</Text>
                </View>
              )}
            </View>
          ))
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  header: { paddingBottom: 16, paddingHorizontal: 16, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  headerTitle: { color: '#fff', fontSize: 20, fontFamily: 'Nunito_700Bold' },
  content: { padding: 16 },
  emptyText: { textAlign: 'center', fontSize: 14, fontFamily: 'Nunito_400Regular', color: Colors.textMuted, marginTop: 40 },
  emptyState: { alignItems: 'center', paddingTop: 60, gap: 8 },
  emptyTitle: { fontSize: 18, fontFamily: 'Nunito_700Bold', color: Colors.text },
  emptyDesc: { fontSize: 14, fontFamily: 'Nunito_400Regular', color: Colors.textSecondary, textAlign: 'center', lineHeight: 22 },
  questionCard: { backgroundColor: Colors.surface, borderRadius: 14, padding: 16, marginBottom: 10, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.06, shadowRadius: 4, elevation: 2 },
  questionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  catBadge: { backgroundColor: Colors.surfaceSecondary, paddingHorizontal: 10, paddingVertical: 3, borderRadius: 8 },
  catBadgeText: { fontSize: 12, fontFamily: 'Nunito_600SemiBold', color: Colors.primary },
  questionText: { fontSize: 15, fontFamily: 'Nunito_600SemiBold', color: Colors.text, lineHeight: 22, marginBottom: 8 },
  showAnswer: { fontSize: 14, fontFamily: 'Nunito_700Bold', color: Colors.primary },
  answerBox: { marginTop: 8, backgroundColor: '#f0f9ff', borderRadius: 10, padding: 12, gap: 4 },
  correctAnswer: { fontSize: 14, fontFamily: 'Nunito_700Bold', color: Colors.success },
  explanationText: { fontSize: 13, fontFamily: 'Nunito_400Regular', color: Colors.textSecondary, lineHeight: 20 },
});
