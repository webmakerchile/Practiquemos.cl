import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, Platform, Modal, Alert } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Colors from '@/constants/colors';
import { useUser } from '@/lib/UserContext';
import { apiRequest } from '@/lib/query-client';
import MascotaCopiloto from '@/components/MascotaCopiloto';
import {
  Question, getRandomExam, getEasyExam, getHardExam, getCategoryExam,
  getQuestionsByLicense, categorias, EXAM_CONFIG,
} from '@/lib/mockDatabase';

type MascotaState = 'idle' | 'correct' | 'incorrect' | 'celebrate' | 'encourage';

export default function ExamScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ mode: string; licenseType: string; category?: string }>();
  const insets = useSafeAreaInsets();
  const { isLoggedIn, incrementFreeExams, licenseType: userLicense } = useUser();

  const mode = params.mode || 'daily';
  const lt = params.licenseType || userLicense || 'clase_b';
  const webTopInset = Platform.OS === 'web' ? 67 : 0;

  const [showCategoryPicker, setShowCategoryPicker] = useState(mode === 'category' && !params.category);
  const [selectedCategory, setSelectedCategory] = useState(params.category || '');
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [showExplanation, setShowExplanation] = useState(false);
  const [learningMode, setLearningMode] = useState(true);
  const [timeLeft, setTimeLeft] = useState(EXAM_CONFIG.timeLimit);
  const [showTimer, setShowTimer] = useState(true);
  const [showQuestionGrid, setShowQuestionGrid] = useState(false);
  const [showExitConfirm, setShowExitConfirm] = useState(false);
  const [favorites, setFavorites] = useState<Set<number>>(new Set());
  const [examFinished, setExamFinished] = useState(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    let qs: Question[] = [];
    if (mode === 'easy') qs = getEasyExam(35, lt);
    else if (mode === 'hard') qs = getHardExam(35, lt);
    else if (mode === 'category' && selectedCategory) qs = getCategoryExam(selectedCategory, lt);
    else if (mode === 'smart') {
      const all = getQuestionsByLicense(lt);
      qs = [...all].sort(() => Math.random() - 0.5).slice(0, 35);
    }
    else qs = getRandomExam(35, lt);
    if (qs.length > 0) setQuestions(qs);
  }, [mode, lt, selectedCategory]);

  useEffect(() => {
    if (questions.length === 0 || examFinished) return;
    timerRef.current = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timerRef.current!);
          finishExam();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [questions, examFinished]);

  const currentQuestion = questions[currentIndex];

  const handleAnswer = (optionIndex: number) => {
    if (answers[currentIndex] !== undefined) return;
    setAnswers(prev => ({ ...prev, [currentIndex]: optionIndex }));
    if (learningMode) setShowExplanation(true);

    if (isLoggedIn && currentQuestion) {
      const correct = optionIndex === currentQuestion.respuestaCorrecta;
      apiRequest('POST', '/api/progress', { licenseType: lt, category: currentQuestion.categoria, correct }).catch(() => {});
    }
  };

  const goNext = () => {
    setShowExplanation(false);
    if (currentIndex < questions.length - 1) {
      setCurrentIndex(currentIndex + 1);
    } else {
      finishExam();
    }
  };

  const goPrev = () => {
    setShowExplanation(false);
    if (currentIndex > 0) setCurrentIndex(currentIndex - 1);
  };

  const jumpTo = (idx: number) => {
    setShowExplanation(false);
    setCurrentIndex(idx);
    setShowQuestionGrid(false);
  };

  const finishExam = useCallback(() => {
    if (examFinished) return;
    setExamFinished(true);
    if (timerRef.current) clearInterval(timerRef.current);

    let correct = 0;
    const categoryBreakdown: Record<string, { correct: number; total: number }> = {};
    questions.forEach((q, idx) => {
      if (!categoryBreakdown[q.categoria]) categoryBreakdown[q.categoria] = { correct: 0, total: 0 };
      categoryBreakdown[q.categoria].total++;
      if (answers[idx] === q.respuestaCorrecta) {
        correct++;
        categoryBreakdown[q.categoria].correct++;
      }
    });
    const score = Math.round((correct / questions.length) * 100);
    const passed = score >= EXAM_CONFIG.passingScore * 100;
    const timeSpent = EXAM_CONFIG.timeLimit - timeLeft;

    if (isLoggedIn) {
      apiRequest('POST', '/api/exam-results', {
        examMode: mode,
        licenseType: lt,
        totalQuestions: questions.length,
        correctAnswers: correct,
        score,
        passed,
        timeSpent,
        categoryBreakdown,
      }).catch(() => {});
    } else {
      incrementFreeExams();
    }

    router.replace({
      pathname: '/results',
      params: {
        score: score.toString(),
        correct: correct.toString(),
        total: questions.length.toString(),
        passed: passed ? 'true' : 'false',
        mode,
        timeSpent: timeSpent.toString(),
        categoryBreakdown: JSON.stringify(categoryBreakdown),
      },
    });
  }, [examFinished, questions, answers, timeLeft, mode, lt, isLoggedIn]);

  const toggleFavorite = async (questionId: number) => {
    if (!isLoggedIn) return;
    const newFavs = new Set(favorites);
    if (newFavs.has(questionId)) {
      newFavs.delete(questionId);
      apiRequest('DELETE', `/api/favorites/${questionId}/${lt}`).catch(() => {});
    } else {
      newFavs.add(questionId);
      apiRequest('POST', '/api/favorites', { questionId, licenseType: lt }).catch(() => {});
    }
    setFavorites(newFavs);
  };

  const formatTime = (s: number) => {
    const min = Math.floor(s / 60);
    const sec = s % 60;
    return `${min}:${sec.toString().padStart(2, '0')}`;
  };

  const getMascotaState = (): MascotaState => {
    if (answers[currentIndex] === undefined) return 'idle';
    return answers[currentIndex] === currentQuestion?.respuestaCorrecta ? 'correct' : 'incorrect';
  };

  const answeredCount = Object.keys(answers).length;

  const modeTitle = useMemo(() => {
    if (mode === 'daily') return 'Test del dia';
    if (mode === 'easy') return 'Test Facil';
    if (mode === 'hard') return 'Test Dificil';
    if (mode === 'smart') return 'Test Inteligente';
    if (mode === 'category') return selectedCategory || 'Por Categoria';
    return 'Examen';
  }, [mode, selectedCategory]);

  if (showCategoryPicker) {
    return (
      <View style={styles.container}>
        <View style={[styles.header, { paddingTop: (insets.top || webTopInset) + 12 }]}>
          <Pressable onPress={() => router.back()} hitSlop={10}>
            <Ionicons name="arrow-back" size={24} color="#fff" />
          </Pressable>
          <Text style={styles.headerTitle}>Selecciona Categoria</Text>
          <View style={{ width: 24 }} />
        </View>
        <ScrollView contentContainerStyle={{ padding: 16 }}>
          {categorias.map(cat => (
            <Pressable key={cat} onPress={() => { setSelectedCategory(cat); setShowCategoryPicker(false); }}
              style={({ pressed }) => [styles.categoryBtn, pressed && { opacity: 0.7 }]}>
              <Text style={styles.categoryBtnText}>{cat}</Text>
              <Ionicons name="chevron-forward" size={20} color={Colors.textMuted} />
            </Pressable>
          ))}
        </ScrollView>
      </View>
    );
  }

  if (questions.length === 0) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <Text style={styles.loadingText}>Cargando preguntas...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={[styles.header, { paddingTop: (insets.top || webTopInset) + 8 }]}>
        <Pressable onPress={() => setShowExitConfirm(true)} hitSlop={10}>
          <Ionicons name="menu" size={24} color="#fff" />
        </Pressable>
        <Text style={styles.headerTitle}>{modeTitle}</Text>
        <View style={{ width: 24 }} />
      </View>

      {showTimer && (
        <View style={styles.timerRow}>
          <View style={styles.timerBadge}>
            <Ionicons name="time" size={16} color="#dc2626" />
            <Text style={styles.timerText}>{formatTime(timeLeft)} MINUTOS</Text>
          </View>
          <Pressable onPress={() => setShowTimer(false)} hitSlop={10}>
            <Ionicons name="close" size={18} color={Colors.textMuted} />
          </Pressable>
        </View>
      )}

      <View style={styles.learningToggle}>
        <Pressable onPress={() => setLearningMode(!learningMode)} style={styles.learningBtn}>
          <Ionicons name={learningMode ? 'book' : 'book-outline'} size={18} color={learningMode ? Colors.primary : Colors.textMuted} />
          <Text style={[styles.learningText, learningMode && { color: Colors.primary }]}>Modo Aprendizaje</Text>
        </Pressable>
        <Text style={styles.examMeta}>{questions.length} Total Preguntas</Text>
        <Text style={styles.examMeta}>Minimo para aprobar: {Math.ceil(questions.length * EXAM_CONFIG.passingScore)} puntos</Text>
      </View>

      <ScrollView style={styles.questionScroll} contentContainerStyle={{ paddingBottom: 120 }}>
        <View style={styles.questionHeader}>
          <View style={styles.questionBadge}>
            <Text style={styles.questionBadgeText}>Pregunta {currentIndex + 1} de {questions.length}</Text>
          </View>
          {isLoggedIn && (
            <Pressable onPress={() => toggleFavorite(currentQuestion.id)} hitSlop={10}>
              <Ionicons name={favorites.has(currentQuestion.id) ? 'star' : 'star-outline'} size={24} color={Colors.accent} />
            </Pressable>
          )}
        </View>

        <Text style={styles.questionText}>{currentQuestion.pregunta}</Text>

        <View style={styles.optionsList}>
          {currentQuestion.opciones.map((opt, idx) => {
            const answered = answers[currentIndex] !== undefined;
            const isSelected = answers[currentIndex] === idx;
            const isCorrect = idx === currentQuestion.respuestaCorrecta;
            let optStyle = styles.option;
            let textColor = Colors.text;
            if (answered && learningMode) {
              if (isCorrect) { optStyle = styles.optionCorrect; textColor = '#166534'; }
              else if (isSelected && !isCorrect) { optStyle = styles.optionWrong; textColor = '#991b1b'; }
            } else if (isSelected) {
              optStyle = styles.optionSelected;
              textColor = '#fff';
            }

            return (
              <Pressable key={idx} onPress={() => handleAnswer(idx)} disabled={answered}
                style={({ pressed }) => [optStyle, pressed && !answered && { opacity: 0.7 }]}>
                <Text style={[styles.optionLabel, { color: textColor }]}>{String.fromCharCode(65 + idx)}.</Text>
                <Text style={[styles.optionText, { color: textColor }]}>{opt}</Text>
                {answered && learningMode && isCorrect && <Ionicons name="checkmark-circle" size={22} color={Colors.success} />}
                {answered && learningMode && isSelected && !isCorrect && <Ionicons name="close-circle" size={22} color="#dc2626" />}
              </Pressable>
            );
          })}
        </View>

        {answers[currentIndex] !== undefined && learningMode && (
          <MascotaCopiloto
            state={getMascotaState()}
            onExplanationPress={() => setShowExplanation(true)}
            compact
          />
        )}

        {showExplanation && learningMode && (
          <View style={styles.explanationBox}>
            <Text style={styles.explanationTitle}>Explicacion</Text>
            <Text style={styles.explanationText}>{currentQuestion.explicacionTexto}</Text>
          </View>
        )}
      </ScrollView>

      <View style={[styles.navBar, { paddingBottom: Platform.OS === 'web' ? 34 : (insets.bottom || 10) }]}>
        <Pressable onPress={goPrev} disabled={currentIndex === 0} style={[styles.navBtn, currentIndex === 0 && { opacity: 0.4 }]}>
          <Ionicons name="arrow-back" size={22} color="#fff" />
        </Pressable>

        <Pressable onPress={() => setShowQuestionGrid(true)} style={styles.gridBtn}>
          <Ionicons name="grid" size={18} color="#fff" />
          <Text style={styles.gridText}>Indice de preguntas ({answeredCount}/{questions.length})</Text>
          <Ionicons name="chevron-up" size={18} color="#fff" />
        </Pressable>

        {currentIndex === questions.length - 1 ? (
          <Pressable onPress={finishExam} style={[styles.navBtn, { backgroundColor: Colors.success }]}>
            <Ionicons name="checkmark" size={22} color="#fff" />
          </Pressable>
        ) : (
          <Pressable onPress={goNext} style={styles.navBtn}>
            <Ionicons name="arrow-forward" size={22} color="#fff" />
          </Pressable>
        )}
      </View>

      <Modal visible={showQuestionGrid} transparent animationType="slide">
        <View style={styles.gridOverlay}>
          <Pressable style={styles.gridBackdrop} onPress={() => setShowQuestionGrid(false)} />
          <View style={[styles.gridContainer, { paddingBottom: Platform.OS === 'web' ? 34 : (insets.bottom || 10) }]}>
            <Pressable onPress={() => setShowQuestionGrid(false)} style={styles.gridHeader}>
              <Ionicons name="grid" size={18} color="#fff" />
              <Text style={styles.gridHeaderText}>Indice de preguntas ({answeredCount}/{questions.length})</Text>
              <Ionicons name="chevron-down" size={18} color="#fff" />
            </Pressable>
            <View style={styles.gridContent}>
              {questions.map((_, idx) => {
                const answered = answers[idx] !== undefined;
                const isCorrect = answered && learningMode && answers[idx] === questions[idx].respuestaCorrecta;
                const isWrong = answered && learningMode && answers[idx] !== questions[idx].respuestaCorrecta;
                const isCurrent = idx === currentIndex;
                return (
                  <Pressable key={idx} onPress={() => jumpTo(idx)}
                    style={[styles.gridCell, isCurrent && styles.gridCellCurrent,
                      isCorrect && styles.gridCellCorrect, isWrong && styles.gridCellWrong,
                      answered && !learningMode && styles.gridCellAnswered]}>
                    <Text style={[styles.gridCellText, (isCurrent || isCorrect || isWrong || answered) && { color: '#fff' }]}>{idx + 1}</Text>
                  </Pressable>
                );
              })}
            </View>
          </View>
        </View>
      </Modal>

      <Modal visible={showExitConfirm} transparent animationType="fade">
        <View style={styles.exitOverlay}>
          <View style={styles.exitModal}>
            <Pressable style={styles.exitClose} onPress={() => setShowExitConfirm(false)}>
              <Ionicons name="close" size={24} color={Colors.text} />
            </Pressable>
            <View style={styles.exitWarningCircle}>
              <Ionicons name="warning" size={36} color={Colors.accent} />
            </View>
            <Text style={styles.exitTitle}>Abandonar el examen?</Text>
            <Text style={styles.exitDesc}>Estas realizando un examen. Tu progreso no se guardara hasta completar el examen.</Text>
            <Pressable onPress={() => { setShowExitConfirm(false); router.back(); }} style={styles.exitBtn}>
              <Ionicons name="log-out-outline" size={20} color="#fff" />
              <Text style={styles.exitBtnText}>Salir del Examen</Text>
            </Pressable>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  header: { backgroundColor: Colors.primary, paddingBottom: 12, paddingHorizontal: 16, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  headerTitle: { color: '#fff', fontSize: 18, fontFamily: 'Nunito_700Bold' },
  timerRow: { flexDirection: 'row', justifyContent: 'flex-end', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 6, gap: 8 },
  timerBadge: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: '#fef2f2', paddingHorizontal: 12, paddingVertical: 4, borderRadius: 16 },
  timerText: { color: '#dc2626', fontSize: 13, fontFamily: 'Nunito_700Bold' },
  learningToggle: { paddingHorizontal: 16, paddingVertical: 8, alignItems: 'center' },
  learningBtn: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 4 },
  learningText: { fontSize: 14, fontFamily: 'Nunito_600SemiBold', color: Colors.textMuted },
  examMeta: { fontSize: 13, fontFamily: 'Nunito_400Regular', color: Colors.textSecondary },
  questionScroll: { flex: 1 },
  questionHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingTop: 12 },
  questionBadge: { backgroundColor: Colors.primary, paddingHorizontal: 14, paddingVertical: 6, borderRadius: 20 },
  questionBadgeText: { color: '#fff', fontSize: 13, fontFamily: 'Nunito_700Bold' },
  questionText: { fontSize: 17, fontFamily: 'Nunito_600SemiBold', color: Colors.text, paddingHorizontal: 16, paddingVertical: 16, lineHeight: 26 },
  optionsList: { paddingHorizontal: 16, gap: 8 },
  option: { flexDirection: 'row', alignItems: 'center', backgroundColor: Colors.surface, padding: 16, borderRadius: 12, borderWidth: 1, borderColor: Colors.border, gap: 10 },
  optionSelected: { flexDirection: 'row', alignItems: 'center', backgroundColor: Colors.primary, padding: 16, borderRadius: 12, borderWidth: 1, borderColor: Colors.primary, gap: 10 },
  optionCorrect: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#dcfce7', padding: 16, borderRadius: 12, borderWidth: 1, borderColor: Colors.success, gap: 10 },
  optionWrong: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fef2f2', padding: 16, borderRadius: 12, borderWidth: 1, borderColor: '#dc2626', gap: 10 },
  optionLabel: { fontSize: 15, fontFamily: 'Nunito_700Bold', minWidth: 22 },
  optionText: { flex: 1, fontSize: 15, fontFamily: 'Nunito_400Regular', lineHeight: 22 },
  explanationBox: { marginHorizontal: 16, marginTop: 12, backgroundColor: '#f0f9ff', borderRadius: 12, padding: 16, borderWidth: 1, borderColor: '#bae6fd' },
  explanationTitle: { fontSize: 15, fontFamily: 'Nunito_700Bold', color: Colors.primary, marginBottom: 6 },
  explanationText: { fontSize: 14, fontFamily: 'Nunito_400Regular', color: Colors.text, lineHeight: 22 },
  navBar: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12, paddingTop: 8, backgroundColor: Colors.surface, borderTopWidth: 1, borderTopColor: Colors.border, gap: 8 },
  navBtn: { backgroundColor: Colors.primary, width: 44, height: 44, borderRadius: 22, justifyContent: 'center', alignItems: 'center' },
  gridBtn: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: '#6366f1', paddingVertical: 10, borderRadius: 22, gap: 6 },
  gridText: { color: '#fff', fontSize: 13, fontFamily: 'Nunito_700Bold' },
  gridOverlay: { flex: 1, justifyContent: 'flex-end' },
  gridBackdrop: { flex: 1 },
  gridContainer: { backgroundColor: Colors.surface, borderTopLeftRadius: 20, borderTopRightRadius: 20, shadowColor: '#000', shadowOffset: { width: 0, height: -4 }, shadowOpacity: 0.1, shadowRadius: 10, elevation: 10 },
  gridHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: '#6366f1', paddingVertical: 12, borderTopLeftRadius: 20, borderTopRightRadius: 20, gap: 6 },
  gridHeaderText: { color: '#fff', fontSize: 14, fontFamily: 'Nunito_700Bold' },
  gridContent: { flexDirection: 'row', flexWrap: 'wrap', padding: 16, gap: 8 },
  gridCell: { width: 44, height: 44, borderRadius: 8, backgroundColor: Colors.surfaceSecondary, justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: Colors.border },
  gridCellCurrent: { backgroundColor: Colors.primary, borderColor: Colors.primary },
  gridCellCorrect: { backgroundColor: Colors.success, borderColor: Colors.success },
  gridCellWrong: { backgroundColor: '#dc2626', borderColor: '#dc2626' },
  gridCellAnswered: { backgroundColor: Colors.primaryLight, borderColor: Colors.primaryLight },
  gridCellText: { fontSize: 15, fontFamily: 'Nunito_700Bold', color: Colors.text },
  exitOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center', padding: 20 },
  exitModal: { backgroundColor: Colors.surface, borderRadius: 20, padding: 24, width: '100%', maxWidth: 340, alignItems: 'center' },
  exitClose: { position: 'absolute' as const, top: 12, right: 12 },
  exitWarningCircle: { width: 64, height: 64, borderRadius: 32, backgroundColor: Colors.accentSoft, justifyContent: 'center', alignItems: 'center', marginBottom: 16 },
  exitTitle: { fontSize: 18, fontFamily: 'Nunito_700Bold', color: Colors.text, marginBottom: 8 },
  exitDesc: { fontSize: 14, fontFamily: 'Nunito_400Regular', color: Colors.textSecondary, textAlign: 'center', marginBottom: 20, lineHeight: 22 },
  exitBtn: { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: '#dc2626', paddingVertical: 14, paddingHorizontal: 28, borderRadius: 14 },
  exitBtnText: { color: '#fff', fontSize: 16, fontFamily: 'Nunito_700Bold' },
  categoryBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: Colors.surface, padding: 16, borderRadius: 12, marginBottom: 8, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.06, shadowRadius: 3, elevation: 2 },
  categoryBtnText: { fontSize: 16, fontFamily: 'Nunito_600SemiBold', color: Colors.text },
  loadingText: { fontSize: 16, fontFamily: 'Nunito_400Regular', color: Colors.textMuted },
});
