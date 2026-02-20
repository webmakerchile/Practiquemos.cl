import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  Platform,
  Modal,
  ScrollView,
  Alert,
} from 'react-native';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons, Feather } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import Animated, {
  FadeIn,
  FadeInDown,
  SlideInRight,
  SlideInLeft,
} from 'react-native-reanimated';
import Colors from '@/constants/colors';
import { useUser, ExamResult } from '@/lib/UserContext';
import { getRandomExam, EXAM_CONFIG, Question } from '@/lib/mockDatabase';
import MascotaCopiloto from '@/components/MascotaCopiloto';

function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}

export default function ExamScreen() {
  const insets = useSafeAreaInsets();
  const { isPremium, canTakeExam, incrementFreeExams, addExamResult } = useUser();
  const webTopInset = Platform.OS === 'web' ? 67 : 0;
  const webBottomInset = Platform.OS === 'web' ? 34 : 0;

  const [questions] = useState<Question[]>(() => getRandomExam(EXAM_CONFIG.questionsPerExam));
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [timeLeft, setTimeLeft] = useState(EXAM_CONFIG.timeLimit);
  const [showFeedback, setShowFeedback] = useState(false);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [showExplanation, setShowExplanation] = useState(false);
  const [slideDirection, setSlideDirection] = useState<'right' | 'left'>('right');
  const [questionKey, setQuestionKey] = useState(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const question = questions[currentIndex];
  const isAnswered = answers[question.id] !== undefined;
  const isCorrect = answers[question.id] === question.respuestaCorrecta;

  useEffect(() => {
    timerRef.current = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          if (timerRef.current) clearInterval(timerRef.current);
          finishExam();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  const finishExam = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current);

    let correct = 0;
    const categoryBreakdown: Record<string, { correct: number; total: number }> = {};

    questions.forEach(q => {
      const cat = q.categoria;
      if (!categoryBreakdown[cat]) categoryBreakdown[cat] = { correct: 0, total: 0 };
      categoryBreakdown[cat].total++;

      if (answers[q.id] === q.respuestaCorrecta) {
        correct++;
        categoryBreakdown[cat].correct++;
      }
    });

    const score = correct / questions.length;
    const passed = score >= EXAM_CONFIG.passingScore;

    const result: ExamResult = {
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
      date: Date.now(),
      totalQuestions: questions.length,
      correctAnswers: correct,
      score,
      passed,
      categoryBreakdown,
    };

    addExamResult(result);
    if (!isPremium) incrementFreeExams();

    router.replace({
      pathname: '/results',
      params: {
        correct: correct.toString(),
        total: questions.length.toString(),
        score: (score * 100).toFixed(0),
        passed: passed ? '1' : '0',
        breakdown: JSON.stringify(categoryBreakdown),
      },
    });
  }, [answers, questions, isPremium]);

  const handleAnswer = (optionIndex: number) => {
    if (isAnswered) return;

    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setSelectedAnswer(optionIndex);
    setAnswers(prev => ({ ...prev, [question.id]: optionIndex }));
    setShowFeedback(true);
  };

  const goNext = () => {
    if (currentIndex < questions.length - 1) {
      setSlideDirection('right');
      setShowFeedback(false);
      setSelectedAnswer(null);
      setShowExplanation(false);
      setCurrentIndex(prev => prev + 1);
      setQuestionKey(prev => prev + 1);
    }
  };

  const goPrev = () => {
    if (currentIndex > 0) {
      setSlideDirection('left');
      setShowFeedback(false);
      setSelectedAnswer(null);
      setShowExplanation(false);
      setCurrentIndex(prev => prev - 1);
      setQuestionKey(prev => prev + 1);
    }
  };

  const handleFinish = () => {
    const unanswered = questions.length - Object.keys(answers).length;
    if (unanswered > 0) {
      Alert.alert(
        'Terminar ensayo',
        `Tienes ${unanswered} preguntas sin responder. ¿Deseas terminar de todas formas?`,
        [
          { text: 'Seguir practicando', style: 'cancel' },
          { text: 'Terminar', onPress: finishExam },
        ]
      );
    } else {
      finishExam();
    }
  };

  const handleExit = () => {
    Alert.alert(
      'Salir del ensayo',
      '¿Seguro que quieres salir? Perderás tu progreso actual.',
      [
        { text: 'Continuar ensayo', style: 'cancel' },
        { text: 'Salir', style: 'destructive', onPress: () => router.back() },
      ]
    );
  };

  const progress = Object.keys(answers).length / questions.length;
  const timeWarning = timeLeft < 300;

  const getOptionStyle = (index: number) => {
    if (!isAnswered) {
      return selectedAnswer === index ? styles.optionSelected : styles.optionDefault;
    }
    if (index === question.respuestaCorrecta) {
      return styles.optionCorrect;
    }
    if (index === answers[question.id] && index !== question.respuestaCorrecta) {
      return styles.optionIncorrect;
    }
    return styles.optionDefault;
  };

  const getOptionTextStyle = (index: number) => {
    if (!isAnswered) return styles.optionTextDefault;
    if (index === question.respuestaCorrecta) return styles.optionTextCorrect;
    if (index === answers[question.id] && index !== question.respuestaCorrecta) return styles.optionTextIncorrect;
    return styles.optionTextDefault;
  };

  const getOptionIcon = (index: number) => {
    if (!isAnswered) return null;
    if (index === question.respuestaCorrecta) {
      return <Ionicons name="checkmark-circle" size={22} color={Colors.success} />;
    }
    if (index === answers[question.id] && index !== question.respuestaCorrecta) {
      return <Ionicons name="close-circle" size={22} color={Colors.warning} />;
    }
    return null;
  };

  return (
    <View style={[styles.root, { paddingTop: (insets.top || webTopInset) }]}>
      <View style={styles.header}>
        <Pressable onPress={handleExit} style={styles.headerBtn}>
          <Ionicons name="close" size={24} color={Colors.textSecondary} />
        </Pressable>

        <View style={styles.headerCenter}>
          <View style={styles.progressBarBg}>
            <View style={[styles.progressBarFill, { width: `${progress * 100}%` }]} />
          </View>
          <Text style={styles.progressText}>
            {currentIndex + 1}/{questions.length}
          </Text>
        </View>

        <View style={[styles.timerChip, timeWarning && styles.timerWarning]}>
          <Ionicons name="time-outline" size={14} color={timeWarning ? Colors.warning : Colors.textSecondary} />
          <Text style={[styles.timerText, timeWarning && styles.timerTextWarning]}>
            {formatTime(timeLeft)}
          </Text>
        </View>
      </View>

      <ScrollView
        style={styles.content}
        contentContainerStyle={styles.contentInner}
        showsVerticalScrollIndicator={false}
      >
        <Animated.View
          key={questionKey}
          entering={slideDirection === 'right' ? SlideInRight.duration(300) : SlideInLeft.duration(300)}
        >
          <View style={styles.categoryChip}>
            <Ionicons name="folder-outline" size={12} color={Colors.primary} />
            <Text style={styles.categoryText}>{question.categoria}</Text>
          </View>

          <Text style={styles.questionText}>{question.pregunta}</Text>

          <View style={styles.optionsContainer}>
            {question.opciones.map((opcion, index) => (
              <Pressable
                key={index}
                onPress={() => handleAnswer(index)}
                disabled={isAnswered}
                style={({ pressed }) => [
                  styles.option,
                  getOptionStyle(index),
                  !isAnswered && pressed && styles.optionPressed,
                ]}
              >
                <View style={styles.optionLetter}>
                  <Text style={[styles.optionLetterText, isAnswered && index === question.respuestaCorrecta && { color: Colors.success }]}>
                    {String.fromCharCode(65 + index)}
                  </Text>
                </View>
                <Text style={[styles.optionText, getOptionTextStyle(index)]}>
                  {opcion}
                </Text>
                {getOptionIcon(index)}
              </Pressable>
            ))}
          </View>

          {question.urlAudio !== null && (
            <Pressable style={styles.audioButton}>
              <Ionicons name="volume-medium" size={18} color={Colors.primary} />
              <Text style={styles.audioButtonText}>Escuchemos juntos la explicación</Text>
            </Pressable>
          )}
        </Animated.View>

        {showFeedback && isAnswered && (
          <Animated.View entering={FadeInDown.duration(400)}>
            <MascotaCopiloto
              state={isCorrect ? 'correct' : 'incorrect'}
              onExplanationPress={isCorrect ? undefined : () => setShowExplanation(true)}
              compact
            />
          </Animated.View>
        )}

        {(showExplanation || (showFeedback && isCorrect)) && (
          <Animated.View entering={FadeIn.duration(300)} style={styles.explanationCard}>
            <View style={styles.explanationHeader}>
              <Ionicons name="bulb-outline" size={18} color={Colors.accent} />
              <Text style={styles.explanationTitle}>Explicación</Text>
            </View>
            <Text style={styles.explanationText}>{question.explicacionTexto}</Text>
          </Animated.View>
        )}
      </ScrollView>

      <View style={[styles.footer, { paddingBottom: (insets.bottom || webBottomInset) + 12 }]}>
        <Pressable
          onPress={goPrev}
          disabled={currentIndex === 0}
          style={({ pressed }) => [
            styles.navButton,
            currentIndex === 0 && styles.navButtonDisabled,
            { opacity: pressed && currentIndex > 0 ? 0.8 : 1 },
          ]}
        >
          <Ionicons name="chevron-back" size={20} color={currentIndex === 0 ? Colors.textMuted : Colors.text} />
          <Text style={[styles.navButtonText, currentIndex === 0 && styles.navButtonTextDisabled]}>Atrás</Text>
        </Pressable>

        {currentIndex === questions.length - 1 || Object.keys(answers).length === questions.length ? (
          <Pressable
            onPress={handleFinish}
            style={({ pressed }) => [
              styles.finishButton,
              { opacity: pressed ? 0.9 : 1, transform: [{ scale: pressed ? 0.97 : 1 }] },
            ]}
          >
            <Ionicons name="checkmark-done" size={20} color="#fff" />
            <Text style={styles.finishButtonText}>Terminar</Text>
          </Pressable>
        ) : (
          <Pressable
            onPress={goNext}
            style={({ pressed }) => [
              styles.nextButton,
              { opacity: pressed ? 0.9 : 1, transform: [{ scale: pressed ? 0.97 : 1 }] },
            ]}
          >
            <Text style={styles.nextButtonText}>Siguiente</Text>
            <Ionicons name="chevron-forward" size={20} color="#fff" />
          </Pressable>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    backgroundColor: Colors.surface,
  },
  headerBtn: {
    width: 36,
    height: 36,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerCenter: {
    flex: 1,
    gap: 4,
  },
  progressBarBg: {
    height: 6,
    backgroundColor: Colors.surfaceSecondary,
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: Colors.primary,
    borderRadius: 3,
  },
  progressText: {
    fontSize: 11,
    fontFamily: 'Nunito_600SemiBold',
    color: Colors.textSecondary,
    textAlign: 'center',
  },
  timerChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: Colors.surfaceSecondary,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
  },
  timerWarning: {
    backgroundColor: Colors.warningLight,
  },
  timerText: {
    fontSize: 13,
    fontFamily: 'Nunito_700Bold',
    color: Colors.textSecondary,
  },
  timerTextWarning: {
    color: Colors.warning,
  },
  content: {
    flex: 1,
  },
  contentInner: {
    padding: 20,
    gap: 16,
  },
  categoryChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: Colors.primary + '10',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    alignSelf: 'flex-start',
    marginBottom: 8,
  },
  categoryText: {
    fontSize: 12,
    fontFamily: 'Nunito_700Bold',
    color: Colors.primary,
  },
  questionText: {
    fontSize: 18,
    fontFamily: 'Nunito_700Bold',
    color: Colors.text,
    lineHeight: 26,
    marginBottom: 16,
  },
  optionsContainer: {
    gap: 10,
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 14,
    borderWidth: 1.5,
    gap: 12,
  },
  optionDefault: {
    backgroundColor: Colors.surface,
    borderColor: Colors.border,
  },
  optionSelected: {
    backgroundColor: Colors.primary + '08',
    borderColor: Colors.primary + '40',
  },
  optionPressed: {
    backgroundColor: Colors.surfaceSecondary,
  },
  optionCorrect: {
    backgroundColor: Colors.successLight,
    borderColor: Colors.success + '50',
  },
  optionIncorrect: {
    backgroundColor: Colors.warningLight,
    borderColor: Colors.warning + '50',
  },
  optionLetter: {
    width: 28,
    height: 28,
    borderRadius: 8,
    backgroundColor: Colors.surfaceSecondary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  optionLetterText: {
    fontSize: 13,
    fontFamily: 'Nunito_700Bold',
    color: Colors.textSecondary,
  },
  optionText: {
    flex: 1,
    fontSize: 15,
    lineHeight: 22,
    fontFamily: 'Nunito_600SemiBold',
  },
  optionTextDefault: {
    color: Colors.text,
  },
  optionTextCorrect: {
    color: Colors.success,
  },
  optionTextIncorrect: {
    color: Colors.warningText,
  },
  audioButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: Colors.primary + '08',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    marginTop: 8,
    alignSelf: 'flex-start',
  },
  audioButtonText: {
    fontSize: 13,
    fontFamily: 'Nunito_600SemiBold',
    color: Colors.primary,
  },
  explanationCard: {
    backgroundColor: Colors.accentSoft,
    borderRadius: 14,
    padding: 16,
    gap: 8,
    borderWidth: 1,
    borderColor: Colors.accent + '25',
  },
  explanationHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  explanationTitle: {
    fontSize: 14,
    fontFamily: 'Nunito_700Bold',
    color: Colors.text,
  },
  explanationText: {
    fontSize: 14,
    fontFamily: 'Nunito_400Regular',
    color: Colors.textSecondary,
    lineHeight: 22,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 12,
    backgroundColor: Colors.surface,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    gap: 12,
  },
  navButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    backgroundColor: Colors.surfaceSecondary,
  },
  navButtonDisabled: {
    opacity: 0.5,
  },
  navButtonText: {
    fontSize: 14,
    fontFamily: 'Nunito_600SemiBold',
    color: Colors.text,
  },
  navButtonTextDisabled: {
    color: Colors.textMuted,
  },
  nextButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: Colors.primary,
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 12,
  },
  nextButtonText: {
    fontSize: 14,
    fontFamily: 'Nunito_700Bold',
    color: '#fff',
  },
  finishButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: Colors.success,
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 12,
  },
  finishButtonText: {
    fontSize: 14,
    fontFamily: 'Nunito_700Bold',
    color: '#fff',
  },
});
