import React, { useEffect, useState, useRef, useCallback } from 'react';
import { View, Text, StyleSheet, Pressable, Image } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withSequence,
  withDelay,
  withRepeat,
  withTiming,
  Easing,
} from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import Colors from '@/constants/colors';

export type MascotaState = 'idle' | 'correct' | 'incorrect' | 'celebrate' | 'encourage' | 'speaking' | 'thinking';

const MASCOT_IMAGES: Record<MascotaState, any> = {
  idle: require('../assets/images/mascota-cuerpo.png'),
  correct: require('../assets/images/mascota-cuerpo.png'),
  incorrect: require('../assets/images/mascota-pensando.png'),
  celebrate: require('../assets/images/mascota-cuerpo.png'),
  encourage: require('../assets/images/mascota-pensando.png'),
  speaking: require('../assets/images/mascota-hablando.png'),
  thinking: require('../assets/images/mascota-pensando.png'),
};

interface MascotaCopilotoProps {
  state: MascotaState;
  message?: string;
  onExplanationPress?: () => void;
  compact?: boolean;
  onSpeakPress?: () => void;
  isSpeaking?: boolean;
  questionIndex?: number;
}

const thinkingMessages = [
  'Piénsalo bien antes de responder 🤔',
  'Tómate tu tiempo, sin apuros ⏳',
  'Lee todas las opciones con calma 📋',
  'Confía en lo que has estudiado 📚',
  '¡Tú puedes con esta! 💪',
  'Recuerda lo que aprendiste 🧠',
  'Analiza cada opción antes de elegir 🔍',
  'No te apures, piensa con calma 🌟',
  'Imagina que estás en la calle, ¿qué harías? 🚗',
  'La respuesta correcta siempre tiene lógica ✨',
  'Descarta las opciones que no tienen sentido 🎯',
  'Vas bien, sigue concentrado 🐾',
];

const correctMessages = [
  '¡Excelente! ¡Eso es! 🎉',
  '¡Muy bien! ¡Sigue así! ⭐',
  '¡Perfecto! ¡Eres un crack! 🏆',
  '¡Correcto! ¡Así se hace! 🎯',
  '¡Genial! ¡Vas muy bien! 🚀',
  '¡Bravo! ¡Lo sabías! 👏',
  '¡Impecable! Sigamos así 💯',
  '¡Eso! La práctica hace al maestro 🌟',
];

const incorrectMessages = [
  'Tranquilo, cada error nos enseña 📖',
  'No te preocupes, aprendamos juntos 🤝',
  'Revisa la explicación, ¡lo tendrás! 💡',
  'Así se aprende, de los errores 🌱',
  'La próxima la aciertas, ¡seguro! 🙌',
];

const mascotaMessages: Record<MascotaState, string[]> = {
  idle: ['¡Estoy contigo, sigamos practicando! 🐾', '¡Tú puedes lograrlo! 💪'],
  correct: correctMessages,
  incorrect: incorrectMessages,
  celebrate: ['¡FELICITACIONES! ¡Aprobaste! 🎊🏆🎉', '¡Increíble resultado! ¡Orgulloso de ti! ⭐'],
  encourage: ['¡Aún puedes mejorar! ¡Repasemos! 💪', '¡No te rindas! ¡Inténtalo de nuevo! 🔥'],
  speaking: ['Escucha con atención 🎧', 'Te estoy leyendo... 🗣️'],
  thinking: thinkingMessages,
};

function getProgressiveMessage(state: MascotaState, questionIndex: number, timerTick: number): string {
  const msgs = mascotaMessages[state];
  if (state === 'thinking' || state === 'idle') {
    const baseIndex = questionIndex % msgs.length;
    const offset = timerTick % msgs.length;
    return msgs[(baseIndex + offset) % msgs.length];
  }
  if (state === 'correct' || state === 'incorrect') {
    return msgs[questionIndex % msgs.length];
  }
  if (state === 'speaking') {
    return msgs[questionIndex % msgs.length];
  }
  return msgs[questionIndex % msgs.length];
}

export default function MascotaCopiloto({
  state,
  message,
  onExplanationPress,
  compact = false,
  onSpeakPress,
  isSpeaking = false,
  questionIndex = 0,
}: MascotaCopilotoProps) {
  const scale = useSharedValue(1);
  const bounceY = useSharedValue(0);
  const rotation = useSharedValue(0);

  const displayState = isSpeaking ? 'speaking' : state;

  const [timerTick, setTimerTick] = useState(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const prevQuestionIndex = useRef(questionIndex);

  useEffect(() => {
    if (prevQuestionIndex.current !== questionIndex) {
      setTimerTick(0);
      prevQuestionIndex.current = questionIndex;
    }
  }, [questionIndex]);

  useEffect(() => {
    if (displayState === 'thinking' || displayState === 'idle') {
      if (timerRef.current) clearInterval(timerRef.current);
      timerRef.current = setInterval(() => {
        setTimerTick(t => t + 1);
      }, 8000);
      return () => {
        if (timerRef.current) clearInterval(timerRef.current);
      };
    } else {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    }
  }, [displayState]);

  useEffect(() => {
    if (displayState === 'correct' || displayState === 'celebrate') {
      scale.value = withSequence(
        withSpring(1.2, { damping: 3, stiffness: 200 }),
        withSpring(0.95, { damping: 8 }),
        withSpring(1.05, { damping: 8 }),
        withSpring(1, { damping: 10 })
      );
      bounceY.value = withSequence(
        withTiming(-16, { duration: 150, easing: Easing.out(Easing.ease) }),
        withTiming(4, { duration: 100 }),
        withTiming(-8, { duration: 100 }),
        withTiming(0, { duration: 100 })
      );
    } else if (displayState === 'incorrect' || displayState === 'encourage') {
      rotation.value = withSequence(
        withTiming(-8, { duration: 100 }),
        withTiming(8, { duration: 100 }),
        withTiming(-6, { duration: 100 }),
        withTiming(6, { duration: 100 }),
        withTiming(0, { duration: 100 })
      );
    } else if (displayState === 'speaking') {
      bounceY.value = withRepeat(
        withSequence(
          withTiming(-4, { duration: 300, easing: Easing.inOut(Easing.ease) }),
          withTiming(0, { duration: 300, easing: Easing.inOut(Easing.ease) }),
        ),
        -1,
        true
      );
    } else if (displayState === 'thinking') {
      rotation.value = withRepeat(
        withSequence(
          withTiming(-3, { duration: 600, easing: Easing.inOut(Easing.ease) }),
          withTiming(3, { duration: 600, easing: Easing.inOut(Easing.ease) }),
        ),
        -1,
        true
      );
    } else {
      bounceY.value = withRepeat(
        withSequence(
          withDelay(1500, withTiming(-5, { duration: 700, easing: Easing.inOut(Easing.ease) })),
          withTiming(0, { duration: 700, easing: Easing.inOut(Easing.ease) }),
        ),
        -1,
        true
      );
    }
  }, [displayState]);

  const animStyle = useAnimatedStyle(() => ({
    transform: [
      { scale: scale.value },
      { translateY: bounceY.value },
      { rotate: `${rotation.value}deg` },
    ],
  }));

  const displayMessage = message || getProgressiveMessage(displayState, questionIndex, timerTick);
  const imgSize = compact ? 60 : 88;

  const getBubbleStyle = () => {
    switch (displayState) {
      case 'correct':
      case 'celebrate':
        return { backgroundColor: '#dcfce7', borderColor: Colors.success + '50' };
      case 'incorrect':
      case 'encourage':
        return { backgroundColor: '#fff7ed', borderColor: Colors.warning + '50' };
      case 'speaking':
        return { backgroundColor: '#eff6ff', borderColor: Colors.primary + '50' };
      case 'thinking':
        return { backgroundColor: '#faf5ff', borderColor: '#a855f750' };
      default:
        return { backgroundColor: Colors.surfaceSecondary, borderColor: Colors.border };
    }
  };

  return (
    <View style={[styles.container, compact && styles.containerCompact]}>
      <View style={{ alignItems: 'center', gap: 4 }}>
        <Animated.View style={[{ width: imgSize, height: imgSize }, animStyle]}>
          <Image
            source={MASCOT_IMAGES[displayState]}
            style={{ width: imgSize, height: imgSize }}
            resizeMode="contain"
          />
        </Animated.View>
        {onSpeakPress && (
          <Pressable
            onPress={onSpeakPress}
            style={[styles.speakBtn, isSpeaking && styles.speakBtnActive]}
            hitSlop={8}
          >
            <Ionicons
              name={isSpeaking ? 'volume-high' : 'volume-medium-outline'}
              size={14}
              color={isSpeaking ? '#fff' : Colors.primary}
            />
          </Pressable>
        )}
      </View>

      <View style={[styles.speechBubble, getBubbleStyle(), compact && styles.speechBubbleCompact]}>
        <Text style={[styles.messageText, compact && styles.messageTextCompact]}>
          {displayMessage}
        </Text>
        {(displayState === 'incorrect') && onExplanationPress && (
          <Pressable
            onPress={onExplanationPress}
            style={({ pressed }) => [styles.explanationButton, pressed && { opacity: 0.8 }]}
          >
            <Ionicons name="book-outline" size={14} color="#fff" />
            <Text style={styles.explanationButtonText}>Ver explicación</Text>
          </Pressable>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 10,
  },
  containerCompact: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    gap: 8,
  },
  speakBtn: {
    backgroundColor: Colors.primaryLight,
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 3,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  speakBtnActive: {
    backgroundColor: Colors.primary,
  },
  speechBubble: {
    flex: 1,
    borderRadius: 16,
    borderWidth: 1,
    padding: 12,
    gap: 8,
    minHeight: 60,
    justifyContent: 'center',
  },
  speechBubbleCompact: {
    padding: 10,
    borderRadius: 12,
    minHeight: 50,
  },
  messageText: {
    fontSize: 14,
    lineHeight: 21,
    fontFamily: 'Nunito_600SemiBold',
    color: Colors.text,
  },
  messageTextCompact: {
    fontSize: 13,
    lineHeight: 19,
  },
  explanationButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 20,
    alignSelf: 'flex-start',
    backgroundColor: Colors.primary,
  },
  explanationButtonText: {
    color: '#fff',
    fontSize: 13,
    fontFamily: 'Nunito_700Bold',
  },
});
