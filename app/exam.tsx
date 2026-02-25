import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, Platform, Modal, Image } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSequence,
  withTiming,
  withDelay,
  FadeIn,
  ZoomIn,
} from 'react-native-reanimated';
import * as Speech from 'expo-speech';
import Colors from '@/constants/colors';
import { useUser } from '@/lib/UserContext';
import { apiRequest } from '@/lib/query-client';
import MascotaCopiloto, { MascotaState } from '@/components/MascotaCopiloto';
import { getQuestionImage } from '@/lib/questionImages';
import { playCorrect, playIncorrect, loadSounds, unloadSounds } from '@/lib/sounds';
import {
  Question, getRandomExam, getEasyExam, getHardExam, getCategoryExam,
  getQuestionsByLicense, categorias, EXAM_CONFIG,
} from '@/lib/mockDatabase';

function StreakBadge({ streak }: { streak: number }) {
  if (streak < 2) return null;
  const labels: Record<number, string> = {
    2: '🔥 x2 racha',
    3: '🔥🔥 x3 en fila',
    4: '⚡ x4 ¡imparable!',
    5: '🚀 x5 ¡LEGENDARIO!',
  };
  const label = labels[Math.min(streak, 5)] || `🏆 x${streak} ¡INCREÍBLE!`;
  return (
    <Animated.View entering={ZoomIn.duration(300)} style={styles.streakBadge}>
      <Text style={styles.streakText}>{label}</Text>
    </Animated.View>
  );
}

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
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [streak, setStreak] = useState(0);
  const [showStreak, setShowStreak] = useState(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const correctFlash = useSharedValue(0);

  useEffect(() => {
    loadSounds();
    return () => {
      Speech.stop();
      unloadSounds();
    };
  }, []);

  useEffect(() => {
    let qs: Question[] = [];
    if (mode === 'easy') qs = getEasyExam(35, lt);
    else if (mode === 'hard') qs = getHardExam(35, lt);
    else if (mode === 'category' && selectedCategory) qs = getCategoryExam(selectedCategory, lt);
    else if (mode === 'smart') {
      const all = getQuestionsByLicense(lt);
      qs = [...all].sort(() => Math.random() - 0.5).slice(0, 35);
    } else qs = getRandomExam(35, lt);
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

  useEffect(() => {
    Speech.stop();
    setIsSpeaking(false);
    setShowExplanation(false);
    correctFlash.value = 0;
  }, [currentIndex]);

  const currentQuestion = questions[currentIndex];

  const humanizeText = (text: string): string => {
    return text
      .replace(/\.\s+/g, '... ')
      .replace(/:\s*/g, ':... ')
      .replace(/\?\s*/g, '?... ')
      .replace(/;\s*/g, ';... ')
      .replace(/,\s*/g, ', ');
  };

  const speakHuman = (text: string) => {
    Speech.speak(humanizeText(text), {
      language: 'es-419',
      rate: 0.85,
      pitch: 1.05,
      onDone: () => setIsSpeaking(false),
      onStopped: () => setIsSpeaking(false),
      onError: () => setIsSpeaking(false),
    });
  };

  const handleSpeak = async () => {
    if (isSpeaking) {
      Speech.stop();
      setIsSpeaking(false);
      return;
    }
    if (!currentQuestion) return;
    setIsSpeaking(true);
    const text = currentQuestion.pregunta + '. ' + currentQuestion.opciones.map((o, i) =>
      `Opción ${String.fromCharCode(65 + i)}: ${o}`).join('. ');
    speakHuman(text);
  };

  const handleSpeakExplanation = async () => {
    if (isSpeaking) {
      Speech.stop();
      setIsSpeaking(false);
      return;
    }
    if (!currentQuestion?.explicacionTexto) return;
    setIsSpeaking(true);
    const correctLetter = String.fromCharCode(65 + currentQuestion.respuestaCorrecta);
    const correctOption = currentQuestion.opciones[currentQuestion.respuestaCorrecta];
    const text = `La respuesta correcta es la opción ${correctLetter}: ${correctOption}. ${currentQuestion.explicacionTexto}`;
    speakHuman(text);
  };

  const handleAnswer = (optionIndex: number) => {
    if (answers[currentIndex] !== undefined) return;
    setAnswers(prev => ({ ...prev, [currentIndex]: optionIndex }));

    const correct = optionIndex === currentQuestion.respuestaCorrecta;

    if (correct) {
      playCorrect();
      correctFlash.value = withSequence(
        withTiming(1, { duration: 100 }),
        withDelay(400, withTiming(0, { duration: 300 }))
      );
      const newStreak = streak + 1;
      setStreak(newStreak);
      if (newStreak >= 2) {
        setShowStreak(true);
        setTimeout(() => setShowStreak(false), 2000);
      }
    } else {
      playIncorrect();
      setStreak(0);
    }

    if (learningMode) setShowExplanation(true);

    if (isLoggedIn && currentQuestion) {
      apiRequest('POST', '/api/progress', {
        licenseType: lt,
        category: currentQuestion.categoria,
        correct,
      }).catch(() => {});
    }
  };

  const goNext = () => {
    Speech.stop();
    setIsSpeaking(false);
    setShowExplanation(false);
    if (currentIndex < questions.length - 1) {
      setCurrentIndex(currentIndex + 1);
    } else {
      finishExam();
    }
  };

  const goPrev = () => {
    Speech.stop();
    setIsSpeaking(false);
    setShowExplanation(false);
    if (currentIndex > 0) setCurrentIndex(currentIndex - 1);
  };

  const jumpTo = (idx: number) => {
    Speech.stop();
    setIsSpeaking(false);
    setShowExplanation(false);
    setCurrentIndex(idx);
    setShowQuestionGrid(false);
  };

  const finishExam = useCallback(() => {
    if (examFinished) return;
    setExamFinished(true);
    Speech.stop();
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
        examMode: mode, licenseType: lt,
        totalQuestions: questions.length, correctAnswers: correct,
        score, passed, timeSpent, categoryBreakdown,
      }).catch(() => {});
    } else {
      incrementFreeExams();
    }

    router.replace({
      pathname: '/results',
      params: {
        score: score.toString(), correct: correct.toString(),
        total: questions.length.toString(), passed: passed ? 'true' : 'false',
        mode, timeSpent: timeSpent.toString(),
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
    if (answers[currentIndex] === undefined) return isSpeaking ? 'speaking' : 'thinking';
    return answers[currentIndex] === currentQuestion?.respuestaCorrecta ? 'correct' : 'incorrect';
  };

  const correctFlashStyle = useAnimatedStyle(() => ({
    position: 'absolute' as const,
    top: 0, left: 0, right: 0, bottom: 0,
    backgroundColor: '#22c55e',
    opacity: correctFlash.value * 0.15,
    pointerEvents: 'none' as any,
    zIndex: 10,
  }));

  const answeredCount = Object.keys(answers).length;

  const modeTitle = useMemo(() => {
    if (mode === 'daily') return 'Test del día';
    if (mode === 'easy') return 'Test Fácil';
    if (mode === 'hard') return 'Test Difícil';
    if (mode === 'smart') return 'Test Inteligente';
    if (mode === 'category') return selectedCategory || 'Por Categoría';
    return 'Examen';
  }, [mode, selectedCategory]);

  if (showCategoryPicker) {
    return (
      <View style={styles.container}>
        <View style={[styles.header, { paddingTop: (insets.top || webTopInset) + 12 }]}>
          <Pressable onPress={() => router.back()} hitSlop={10}>
            <Ionicons name="arrow-back" size={24} color="#fff" />
          </Pressable>
          <Text style={styles.headerTitle}>Selecciona Categoría</Text>
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

  const questionVisual = currentQuestion ? getQuestionImage(currentQuestion) : null;

  return (
    <View style={styles.container}>
      <Animated.View style={correctFlashStyle} />

      <View style={[styles.header, { paddingTop: (insets.top || webTopInset) + 8 }]}>
        <Pressable onPress={() => setShowExitConfirm(true)} hitSlop={10}>
          <Ionicons name="menu" size={24} color="#fff" />
        </Pressable>
        <Text style={styles.headerTitle}>{modeTitle}</Text>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
          {showTimer && (
            <View style={styles.timerInHeader}>
              <Ionicons name="time" size={13} color={timeLeft < 120 ? '#fca5a5' : '#fff'} />
              <Text style={[styles.timerInHeaderText, timeLeft < 120 && { color: '#fca5a5' }]}>
                {formatTime(timeLeft)}
              </Text>
            </View>
          )}
          <Pressable onPress={() => setShowTimer(!showTimer)} hitSlop={8}>
            <Ionicons name={showTimer ? 'eye-off-outline' : 'eye-outline'} size={18} color="rgba(255,255,255,0.7)" />
          </Pressable>
        </View>
      </View>

      <View style={styles.progressBar}>
        <View style={[styles.progressFill, { width: `${(answeredCount / questions.length) * 100}%` as any }]} />
      </View>

      <View style={styles.metaRow}>
        <View style={styles.learningBtn}>
          <Pressable onPress={() => setLearningMode(!learningMode)} style={styles.learningInner}>
            <Ionicons name={learningMode ? 'book' : 'book-outline'} size={16} color={learningMode ? Colors.primary : Colors.textMuted} />
            <Text style={[styles.learningText, learningMode && { color: Colors.primary }]}>
              {learningMode ? 'Aprendizaje ON' : 'Aprendizaje OFF'}
            </Text>
          </Pressable>
        </View>
        <Text style={styles.examMeta}>
          {answeredCount}/{questions.length} respondidas
        </Text>
      </View>

      <ScrollView style={styles.questionScroll} contentContainerStyle={{ paddingBottom: 130 }}>
        <View style={styles.questionHeader}>
          <View style={styles.questionBadge}>
            <Text style={styles.questionBadgeText}>
              {currentIndex + 1} / {questions.length}
            </Text>
          </View>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
            <Pressable onPress={handleSpeak} hitSlop={10} style={[styles.speakButton, isSpeaking && styles.speakButtonActive]}>
              <Ionicons name={isSpeaking ? 'volume-high' : 'volume-medium-outline'} size={20} color={isSpeaking ? '#fff' : Colors.primary} />
            </Pressable>
            {isLoggedIn && (
              <Pressable onPress={() => toggleFavorite(currentQuestion.id)} hitSlop={10}>
                <Ionicons name={favorites.has(currentQuestion.id) ? 'star' : 'star-outline'} size={22} color={Colors.accent} />
              </Pressable>
            )}
          </View>
        </View>

        {showStreak && <StreakBadge streak={streak} />}

        {questionVisual && (
          <View style={styles.imageContainer}>
            <Image
              source={questionVisual.source}
              style={styles.questionImage}
              resizeMode="contain"
            />
          </View>
        )}

        <Text style={styles.questionText}>{currentQuestion.pregunta}</Text>

        <View style={styles.optionsList}>
          {currentQuestion.opciones.map((opt, idx) => {
            const answered = answers[currentIndex] !== undefined;
            const isSelected = answers[currentIndex] === idx;
            const isCorrect = idx === currentQuestion.respuestaCorrecta;
            let optStyle = styles.option;
            let textColor = Colors.text;
            let borderColor = Colors.border;

            if (answered && learningMode) {
              if (isCorrect) {
                optStyle = styles.optionCorrect;
                textColor = '#166534';
                borderColor = Colors.success;
              } else if (isSelected && !isCorrect) {
                optStyle = styles.optionWrong;
                textColor = '#92400e';
                borderColor = '#f59e0b';
              }
            } else if (isSelected) {
              optStyle = styles.optionSelected;
              textColor = '#fff';
              borderColor = Colors.primary;
            }

            return (
              <Pressable
                key={idx}
                onPress={() => handleAnswer(idx)}
                disabled={answered}
                style={({ pressed }) => [optStyle, { borderColor }, pressed && !answered && { transform: [{ scale: 0.98 }], opacity: 0.85 }]}
              >
                <View style={[styles.optionLetter, isSelected && !answered && { backgroundColor: 'rgba(255,255,255,0.2)' }]}>
                  <Text style={[styles.optionLabel, { color: textColor }]}>{String.fromCharCode(65 + idx)}</Text>
                </View>
                <Text style={[styles.optionText, { color: textColor }]}>{opt}</Text>
                {answered && learningMode && isCorrect && (
                  <Animated.View entering={ZoomIn.duration(300)}>
                    <Ionicons name="checkmark-circle" size={24} color={Colors.success} />
                  </Animated.View>
                )}
                {answered && learningMode && isSelected && !isCorrect && (
                  <Ionicons name="alert-circle" size={24} color="#f59e0b" />
                )}
              </Pressable>
            );
          })}
        </View>

        {answers[currentIndex] !== undefined && (
          <MascotaCopiloto
            state={getMascotaState()}
            onExplanationPress={() => setShowExplanation(!showExplanation)}
            compact
            isSpeaking={isSpeaking}
            questionIndex={currentIndex}
          />
        )}

        {answers[currentIndex] === undefined && (
          <MascotaCopiloto
            state={getMascotaState()}
            compact
            isSpeaking={isSpeaking}
            questionIndex={currentIndex}
          />
        )}

        {showExplanation && learningMode && (
          <Animated.View entering={FadeIn.duration(250)} style={styles.explanationBox}>
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                <Ionicons name="information-circle" size={18} color={Colors.primary} />
                <Text style={styles.explanationTitle}>Explicación</Text>
              </View>
              <Pressable
                onPress={handleSpeakExplanation}
                hitSlop={10}
                style={[styles.explanationSpeakBtn, isSpeaking && styles.explanationSpeakBtnActive]}
              >
                <Ionicons
                  name={isSpeaking ? 'volume-high' : 'volume-medium-outline'}
                  size={16}
                  color={isSpeaking ? '#fff' : Colors.primary}
                />
                <Text style={[styles.explanationSpeakText, isSpeaking && { color: '#fff' }]}>
                  {isSpeaking ? 'Detener' : 'Escuchar'}
                </Text>
              </Pressable>
            </View>
            <Text style={styles.explanationText}>{currentQuestion.explicacionTexto}</Text>
          </Animated.View>
        )}
      </ScrollView>

      <View style={[styles.navBar, { paddingBottom: Platform.OS === 'web' ? 34 : (insets.bottom || 10) }]}>
        <Pressable
          onPress={goPrev}
          disabled={currentIndex === 0}
          style={[styles.navBtn, currentIndex === 0 && { opacity: 0.35 }]}
        >
          <Ionicons name="arrow-back" size={22} color="#fff" />
        </Pressable>

        <Pressable onPress={() => setShowQuestionGrid(true)} style={styles.gridBtn}>
          <Ionicons name="grid" size={16} color="#fff" />
          <Text style={styles.gridText}>{answeredCount}/{questions.length}</Text>
          <Ionicons name="chevron-up" size={16} color="#fff" />
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
              <Ionicons name="grid" size={16} color="#fff" />
              <Text style={styles.gridHeaderText}>Índice ({answeredCount}/{questions.length})</Text>
              <Ionicons name="chevron-down" size={16} color="#fff" />
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
                    <Text style={[styles.gridCellText, (isCurrent || isCorrect || isWrong || answered) && { color: '#fff' }]}>
                      {idx + 1}
                    </Text>
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
            <Image source={require('../assets/images/mascota-pensando.png')} style={{ width: 80, height: 80, marginBottom: 8 }} resizeMode="contain" />
            <Text style={styles.exitTitle}>¿Abandonar el examen?</Text>
            <Text style={styles.exitDesc}>Tu progreso no se guardará hasta completar el examen.</Text>
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
  header: {
    backgroundColor: Colors.primary,
    paddingBottom: 10,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerTitle: { color: '#fff', fontSize: 17, fontFamily: 'Nunito_700Bold', flex: 1, marginHorizontal: 12 },
  timerInHeader: { flexDirection: 'row', alignItems: 'center', gap: 3 },
  timerInHeaderText: { color: '#fff', fontSize: 13, fontFamily: 'Nunito_700Bold' },
  progressBar: { height: 4, backgroundColor: Colors.border },
  progressFill: { height: 4, backgroundColor: Colors.accent },
  metaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  learningBtn: {},
  learningInner: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  learningText: { fontSize: 13, fontFamily: 'Nunito_600SemiBold', color: Colors.textMuted },
  examMeta: { fontSize: 13, fontFamily: 'Nunito_600SemiBold', color: Colors.textSecondary },
  questionScroll: { flex: 1 },
  questionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 12,
  },
  questionBadge: {
    backgroundColor: Colors.primary,
    paddingHorizontal: 14,
    paddingVertical: 5,
    borderRadius: 20,
  },
  questionBadgeText: { color: '#fff', fontSize: 13, fontFamily: 'Nunito_700Bold' },
  speakButton: {
    backgroundColor: Colors.primaryLight,
    borderRadius: 20,
    padding: 7,
  },
  speakButtonActive: { backgroundColor: Colors.primary },
  streakBadge: {
    alignSelf: 'center',
    backgroundColor: Colors.accent,
    paddingHorizontal: 20,
    paddingVertical: 6,
    borderRadius: 20,
    marginTop: 8,
    shadowColor: Colors.accent,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 6,
  },
  streakText: { color: '#fff', fontSize: 14, fontFamily: 'Nunito_800ExtraBold' },
  imageContainer: {
    marginHorizontal: 16,
    marginTop: 10,
    backgroundColor: '#f8fafc',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: Colors.border,
    overflow: 'hidden',
    alignItems: 'center',
    paddingVertical: 8,
  },
  questionImage: {
    width: '90%',
    height: 180,
  },
  questionText: {
    fontSize: 17,
    fontFamily: 'Nunito_600SemiBold',
    color: Colors.text,
    paddingHorizontal: 16,
    paddingTop: 14,
    paddingBottom: 12,
    lineHeight: 26,
  },
  optionsList: { paddingHorizontal: 16, gap: 9 },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    padding: 14,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: Colors.border,
    gap: 10,
  },
  optionSelected: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.primary,
    padding: 14,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: Colors.primary,
    gap: 10,
  },
  optionCorrect: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#dcfce7',
    padding: 14,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: Colors.success,
    gap: 10,
  },
  optionWrong: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fffbeb',
    padding: 14,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: '#f59e0b',
    gap: 10,
  },
  optionLetter: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: 'rgba(0,0,0,0.07)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  optionLabel: { fontSize: 14, fontFamily: 'Nunito_800ExtraBold' },
  optionText: { flex: 1, fontSize: 15, fontFamily: 'Nunito_400Regular', lineHeight: 22 },
  explanationBox: {
    marginHorizontal: 16,
    marginTop: 4,
    backgroundColor: '#f0f9ff',
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: '#bae6fd',
  },
  explanationTitle: { fontSize: 14, fontFamily: 'Nunito_700Bold', color: Colors.primary },
  explanationText: { fontSize: 14, fontFamily: 'Nunito_400Regular', color: Colors.text, lineHeight: 22 },
  explanationSpeakBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#eff6ff',
    borderRadius: 14,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderWidth: 1,
    borderColor: '#bfdbfe',
  },
  explanationSpeakBtnActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  explanationSpeakText: {
    fontSize: 12,
    fontFamily: 'Nunito_600SemiBold',
    color: Colors.primary,
  },
  navBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingTop: 8,
    backgroundColor: Colors.surface,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    gap: 8,
  },
  navBtn: {
    backgroundColor: Colors.primary,
    width: 46,
    height: 46,
    borderRadius: 23,
    justifyContent: 'center',
    alignItems: 'center',
  },
  gridBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#6366f1',
    paddingVertical: 12,
    borderRadius: 23,
    gap: 6,
  },
  gridText: { color: '#fff', fontSize: 14, fontFamily: 'Nunito_700Bold' },
  gridOverlay: { flex: 1, justifyContent: 'flex-end' },
  gridBackdrop: { flex: 1 },
  gridContainer: {
    backgroundColor: Colors.surface,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 10,
    maxHeight: 400,
  },
  gridHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#6366f1',
    paddingVertical: 12,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    gap: 6,
  },
  gridHeaderText: { color: '#fff', fontSize: 14, fontFamily: 'Nunito_700Bold' },
  gridContent: { flexDirection: 'row', flexWrap: 'wrap', padding: 16, gap: 8 },
  gridCell: {
    width: 42,
    height: 42,
    borderRadius: 8,
    backgroundColor: Colors.surfaceSecondary,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  gridCellCurrent: { backgroundColor: Colors.primary, borderColor: Colors.primary },
  gridCellCorrect: { backgroundColor: Colors.success, borderColor: Colors.success },
  gridCellWrong: { backgroundColor: '#f59e0b', borderColor: '#f59e0b' },
  gridCellAnswered: { backgroundColor: Colors.primaryLight, borderColor: Colors.primaryLight },
  gridCellText: { fontSize: 14, fontFamily: 'Nunito_700Bold', color: Colors.text },
  exitOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  exitModal: {
    backgroundColor: Colors.surface,
    borderRadius: 24,
    padding: 28,
    width: '100%',
    maxWidth: 340,
    alignItems: 'center',
  },
  exitClose: { position: 'absolute' as const, top: 14, right: 14 },
  exitTitle: { fontSize: 18, fontFamily: 'Nunito_700Bold', color: Colors.text, marginBottom: 8, textAlign: 'center' },
  exitDesc: { fontSize: 14, fontFamily: 'Nunito_400Regular', color: Colors.textSecondary, textAlign: 'center', marginBottom: 20, lineHeight: 22 },
  exitBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#dc2626',
    paddingVertical: 14,
    paddingHorizontal: 28,
    borderRadius: 14,
  },
  exitBtnText: { color: '#fff', fontSize: 16, fontFamily: 'Nunito_700Bold' },
  categoryBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: Colors.surface,
    padding: 16,
    borderRadius: 14,
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 3,
    elevation: 2,
  },
  categoryBtnText: { fontSize: 16, fontFamily: 'Nunito_600SemiBold', color: Colors.text },
  loadingText: { fontSize: 16, fontFamily: 'Nunito_400Regular', color: Colors.textMuted },
});
