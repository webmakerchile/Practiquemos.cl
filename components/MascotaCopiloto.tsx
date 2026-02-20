import React, { useEffect } from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
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

type MascotaState = 'idle' | 'correct' | 'incorrect' | 'celebrate' | 'encourage';

interface MascotaCopilotoProps {
  state: MascotaState;
  message?: string;
  onExplanationPress?: () => void;
  compact?: boolean;
}

const mascotaMessages: Record<MascotaState, string[]> = {
  idle: ['Estoy contigo, sigamos practicando'],
  correct: [
    'Bien hecho, sigamos practicando',
    'Excelente, vas muy bien',
    'Asi se hace, sigue asi',
  ],
  incorrect: [
    'Revisemos juntos qué pasó...',
    'No te preocupes, aprendamos de esto',
    'Tranquilo, cada error nos enseña algo',
  ],
  celebrate: ['Vamos por esa licencia'],
  encourage: [
    'Aún no es el resultado que buscamos, pero vamos bien',
    'Revisemos los temas donde puedes reforzar',
  ],
};

function getRandomMessage(state: MascotaState): string {
  const msgs = mascotaMessages[state];
  return msgs[Math.floor(Math.random() * msgs.length)];
}

export default function MascotaCopiloto({ state, message, onExplanationPress, compact = false }: MascotaCopilotoProps) {
  const scale = useSharedValue(1);
  const rotation = useSharedValue(0);
  const bounceY = useSharedValue(0);
  const tailWag = useSharedValue(0);

  useEffect(() => {
    if (state === 'correct' || state === 'celebrate') {
      scale.value = withSequence(
        withSpring(1.15, { damping: 4 }),
        withSpring(1, { damping: 8 })
      );
      bounceY.value = withSequence(
        withSpring(-8, { damping: 4 }),
        withSpring(0, { damping: 8 })
      );
      tailWag.value = withRepeat(
        withSequence(
          withTiming(15, { duration: 150, easing: Easing.inOut(Easing.ease) }),
          withTiming(-15, { duration: 150, easing: Easing.inOut(Easing.ease) }),
        ),
        4,
        true
      );
    } else if (state === 'incorrect' || state === 'encourage') {
      rotation.value = withSequence(
        withTiming(-5, { duration: 200 }),
        withTiming(5, { duration: 200 }),
        withTiming(0, { duration: 200 })
      );
    } else {
      bounceY.value = withRepeat(
        withSequence(
          withDelay(2000, withTiming(-3, { duration: 800, easing: Easing.inOut(Easing.ease) })),
          withTiming(0, { duration: 800, easing: Easing.inOut(Easing.ease) }),
        ),
        -1,
        true
      );
    }
  }, [state]);

  const bodyStyle = useAnimatedStyle(() => ({
    transform: [
      { scale: scale.value },
      { rotate: `${rotation.value}deg` },
      { translateY: bounceY.value },
    ],
  }));

  const tailStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${tailWag.value}deg` }],
  }));

  const displayMessage = message || getRandomMessage(state);

  const getMascotColor = () => {
    switch (state) {
      case 'correct':
      case 'celebrate':
        return Colors.success;
      case 'incorrect':
      case 'encourage':
        return Colors.warning;
      default:
        return Colors.primary;
    }
  };

  const getBubbleColor = () => {
    switch (state) {
      case 'correct':
      case 'celebrate':
        return Colors.successLight;
      case 'incorrect':
      case 'encourage':
        return Colors.warningLight;
      default:
        return Colors.surfaceSecondary;
    }
  };

  const size = compact ? 40 : 56;

  return (
    <View style={[styles.container, compact && styles.containerCompact]}>
      <Animated.View style={[styles.mascotBody, bodyStyle, { width: size, height: size, borderRadius: size / 2 }]}>
        <View style={[styles.mascotInner, { width: size, height: size, borderRadius: size / 2, backgroundColor: '#F5E6D3' }]}>
          <View style={styles.face}>
            <View style={[styles.eye, styles.leftEye, compact && styles.eyeSmall]}>
              {(state === 'correct' || state === 'celebrate') ? (
                <View style={[styles.happyEye, compact && styles.happyEyeSmall]} />
              ) : (
                <View style={[styles.pupil, compact && styles.pupilSmall]} />
              )}
            </View>
            <View style={[styles.eye, styles.rightEye, compact && styles.eyeSmall]}>
              {(state === 'correct' || state === 'celebrate') ? (
                <View style={[styles.happyEye, compact && styles.happyEyeSmall]} />
              ) : (
                <View style={[styles.pupil, compact && styles.pupilSmall]} />
              )}
            </View>
            <View style={[styles.nose, compact && styles.noseSmall]} />
            {(state === 'correct' || state === 'celebrate') && (
              <View style={[styles.mouth, compact && styles.mouthSmall]} />
            )}
          </View>
          <Animated.View style={[styles.ear, styles.leftEar, compact && styles.earSmall, tailStyle]} />
          <Animated.View style={[styles.ear, styles.rightEar, compact && styles.earSmall, { transform: [{ scaleX: -1 }] }]} />
        </View>
      </Animated.View>

      <View style={[styles.speechBubble, { backgroundColor: getBubbleColor(), borderColor: getMascotColor() + '30' }, compact && styles.speechBubbleCompact]}>
        <Text style={[styles.messageText, compact && styles.messageTextCompact, { color: Colors.text }]}>
          {displayMessage}
        </Text>
        {state === 'incorrect' && onExplanationPress && (
          <Pressable
            onPress={onExplanationPress}
            style={({ pressed }) => [
              styles.explanationButton,
              { backgroundColor: Colors.primary, opacity: pressed ? 0.8 : 1 },
            ]}
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
  mascotBody: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  mascotInner: {
    overflow: 'hidden',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#E8D5C0',
  },
  face: {
    position: 'relative',
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  eye: {
    position: 'absolute',
    width: 8,
    height: 8,
    backgroundColor: '#fff',
    borderRadius: 4,
    justifyContent: 'center',
    alignItems: 'center',
    top: '30%',
  },
  eyeSmall: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  leftEye: {
    left: '25%',
  },
  rightEye: {
    right: '25%',
  },
  pupil: {
    width: 4,
    height: 4,
    backgroundColor: '#3B2F2F',
    borderRadius: 2,
  },
  pupilSmall: {
    width: 3,
    height: 3,
    borderRadius: 1.5,
  },
  happyEye: {
    width: 6,
    height: 3,
    borderTopLeftRadius: 3,
    borderTopRightRadius: 3,
    backgroundColor: '#3B2F2F',
  },
  happyEyeSmall: {
    width: 5,
    height: 2.5,
  },
  nose: {
    position: 'absolute',
    width: 6,
    height: 4,
    backgroundColor: '#8B6F5C',
    borderRadius: 3,
    top: '48%',
  },
  noseSmall: {
    width: 4,
    height: 3,
  },
  mouth: {
    position: 'absolute',
    width: 12,
    height: 6,
    borderBottomLeftRadius: 6,
    borderBottomRightRadius: 6,
    borderWidth: 1.5,
    borderTopWidth: 0,
    borderColor: '#8B6F5C',
    top: '58%',
  },
  mouthSmall: {
    width: 8,
    height: 4,
    borderWidth: 1,
  },
  ear: {
    position: 'absolute',
    width: 14,
    height: 20,
    backgroundColor: '#D4B896',
    borderRadius: 7,
    top: -6,
  },
  earSmall: {
    width: 10,
    height: 14,
    borderRadius: 5,
    top: -4,
  },
  leftEar: {
    left: 4,
    transform: [{ rotate: '-20deg' }],
  },
  rightEar: {
    right: 4,
    transform: [{ rotate: '20deg' }, { scaleX: -1 }],
  },
  speechBubble: {
    flex: 1,
    borderRadius: 16,
    borderWidth: 1,
    padding: 12,
    gap: 8,
  },
  speechBubbleCompact: {
    padding: 10,
    borderRadius: 12,
  },
  messageText: {
    fontSize: 14,
    lineHeight: 20,
    fontFamily: 'Nunito_600SemiBold',
  },
  messageTextCompact: {
    fontSize: 13,
    lineHeight: 18,
  },
  explanationButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 20,
    alignSelf: 'flex-start',
  },
  explanationButtonText: {
    color: '#fff',
    fontSize: 13,
    fontFamily: 'Nunito_700Bold',
  },
});
