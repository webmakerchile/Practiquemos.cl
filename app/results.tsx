import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  Platform,
} from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import Animated, { FadeInDown, FadeInUp, ZoomIn } from 'react-native-reanimated';
import Colors from '@/constants/colors';
import MascotaCopiloto from '@/components/MascotaCopiloto';

export default function ResultsScreen() {
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams<{
    correct: string;
    total: string;
    score: string;
    passed: string;
    breakdown: string;
  }>();
  const webTopInset = Platform.OS === 'web' ? 67 : 0;
  const webBottomInset = Platform.OS === 'web' ? 34 : 0;

  const correct = parseInt(params.correct || '0');
  const total = parseInt(params.total || '35');
  const score = parseInt(params.score || '0');
  const passed = params.passed === '1';
  const breakdown: Record<string, { correct: number; total: number }> = params.breakdown
    ? JSON.parse(params.breakdown)
    : {};

  const handleGoHome = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    router.replace('/');
  };

  const handleRetry = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    router.replace('/exam');
  };

  return (
    <View style={styles.root}>
      <ScrollView
        contentContainerStyle={[
          styles.content,
          {
            paddingTop: (insets.top || webTopInset) + 20,
            paddingBottom: (insets.bottom || webBottomInset) + 24,
          },
        ]}
        showsVerticalScrollIndicator={false}
      >
        <Animated.View entering={ZoomIn.duration(600)}>
          <LinearGradient
            colors={passed ? [Colors.success, '#22c55e'] : [Colors.primary, Colors.primaryLight]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.scoreCard}
          >
            <View style={styles.scoreCircle}>
              <Text style={styles.scoreValue}>{score}%</Text>
              <Text style={styles.scoreLabel}>{correct}/{total}</Text>
            </View>
            <Text style={styles.scoreTitle}>
              {passed ? 'Aprobado' : 'Resultado del ensayo'}
            </Text>
          </LinearGradient>
        </Animated.View>

        <Animated.View entering={FadeInDown.duration(500).delay(200)}>
          <MascotaCopiloto
            state={passed ? 'celebrate' : 'encourage'}
            message={
              passed
                ? 'Vamos por esa licencia'
                : 'Aún no es el resultado que buscamos, pero vamos bien. Revisemos los temas donde necesitas reforzar'
            }
          />
        </Animated.View>

        <Animated.View entering={FadeInDown.duration(500).delay(400)} style={styles.section}>
          <Text style={styles.sectionTitle}>Desglose por categoría</Text>

          {Object.entries(breakdown).map(([category, data], index) => {
            const catScore = data.total > 0 ? data.correct / data.total : 0;
            const isGood = catScore >= 0.75;

            return (
              <Animated.View
                key={category}
                entering={FadeInDown.duration(400).delay(500 + index * 80)}
                style={styles.categoryCard}
              >
                <View style={styles.categoryHeader}>
                  <View style={[styles.categoryIcon, { backgroundColor: isGood ? Colors.success + '12' : Colors.warning + '12' }]}>
                    <Ionicons
                      name={isGood ? 'checkmark-circle' : 'alert-circle'}
                      size={18}
                      color={isGood ? Colors.success : Colors.warning}
                    />
                  </View>
                  <View style={styles.categoryInfo}>
                    <Text style={styles.categoryName}>{category}</Text>
                    <Text style={styles.categoryScore}>
                      {data.correct}/{data.total} correctas
                    </Text>
                  </View>
                  <Text style={[styles.categoryPercent, { color: isGood ? Colors.success : Colors.warning }]}>
                    {Math.round(catScore * 100)}%
                  </Text>
                </View>

                <View style={styles.categoryBar}>
                  <View
                    style={[
                      styles.categoryBarFill,
                      {
                        width: `${catScore * 100}%`,
                        backgroundColor: isGood ? Colors.success : Colors.warning,
                      },
                    ]}
                  />
                </View>
              </Animated.View>
            );
          })}
        </Animated.View>

        {!passed && (
          <Animated.View entering={FadeInDown.duration(500).delay(700)} style={styles.tipCard}>
            <View style={styles.tipHeader}>
              <MaterialCommunityIcons name="lightbulb-on-outline" size={20} color={Colors.accent} />
              <Text style={styles.tipTitle}>Consejo de tu copiloto</Text>
            </View>
            <Text style={styles.tipText}>
              Enfócate en las categorías con menor puntaje. Practicar varias veces las mismas preguntas te ayuda a memorizar mejor los conceptos.
            </Text>
          </Animated.View>
        )}

        <Animated.View entering={FadeInUp.duration(500).delay(800)} style={styles.actions}>
          <Pressable
            onPress={handleRetry}
            style={({ pressed }) => [
              styles.primaryButton,
              { opacity: pressed ? 0.9 : 1, transform: [{ scale: pressed ? 0.97 : 1 }] },
            ]}
          >
            <Ionicons name="refresh" size={20} color="#fff" />
            <Text style={styles.primaryButtonText}>Nuevo ensayo</Text>
          </Pressable>

          <Pressable
            onPress={handleGoHome}
            style={({ pressed }) => [
              styles.secondaryButton,
              { opacity: pressed ? 0.9 : 1, transform: [{ scale: pressed ? 0.97 : 1 }] },
            ]}
          >
            <Ionicons name="home" size={20} color={Colors.primary} />
            <Text style={styles.secondaryButtonText}>Volver al inicio</Text>
          </Pressable>
        </Animated.View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  content: {
    paddingHorizontal: 20,
    gap: 16,
  },
  scoreCard: {
    borderRadius: 24,
    padding: 32,
    alignItems: 'center',
    gap: 16,
  },
  scoreCircle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 4,
    borderColor: 'rgba(255,255,255,0.4)',
  },
  scoreValue: {
    fontSize: 36,
    fontFamily: 'Nunito_800ExtraBold',
    color: '#fff',
  },
  scoreLabel: {
    fontSize: 14,
    fontFamily: 'Nunito_600SemiBold',
    color: 'rgba(255,255,255,0.8)',
  },
  scoreTitle: {
    fontSize: 22,
    fontFamily: 'Nunito_800ExtraBold',
    color: '#fff',
  },
  section: {
    gap: 10,
  },
  sectionTitle: {
    fontSize: 18,
    fontFamily: 'Nunito_700Bold',
    color: Colors.text,
    marginBottom: 4,
  },
  categoryCard: {
    backgroundColor: Colors.surface,
    borderRadius: 14,
    padding: 14,
    gap: 10,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  categoryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  categoryIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  categoryInfo: {
    flex: 1,
    gap: 2,
  },
  categoryName: {
    fontSize: 14,
    fontFamily: 'Nunito_700Bold',
    color: Colors.text,
  },
  categoryScore: {
    fontSize: 12,
    fontFamily: 'Nunito_400Regular',
    color: Colors.textSecondary,
  },
  categoryPercent: {
    fontSize: 18,
    fontFamily: 'Nunito_800ExtraBold',
  },
  categoryBar: {
    height: 6,
    backgroundColor: Colors.surfaceSecondary,
    borderRadius: 3,
    overflow: 'hidden',
  },
  categoryBarFill: {
    height: '100%',
    borderRadius: 3,
  },
  tipCard: {
    backgroundColor: Colors.accentSoft,
    borderRadius: 16,
    padding: 16,
    gap: 8,
    borderWidth: 1,
    borderColor: Colors.accent + '25',
  },
  tipHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  tipTitle: {
    fontSize: 14,
    fontFamily: 'Nunito_700Bold',
    color: Colors.text,
  },
  tipText: {
    fontSize: 14,
    fontFamily: 'Nunito_400Regular',
    color: Colors.textSecondary,
    lineHeight: 22,
  },
  actions: {
    gap: 12,
    marginTop: 8,
  },
  primaryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: Colors.primary,
    paddingVertical: 16,
    borderRadius: 16,
  },
  primaryButtonText: {
    fontSize: 16,
    fontFamily: 'Nunito_700Bold',
    color: '#fff',
  },
  secondaryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: Colors.primary + '10',
    paddingVertical: 16,
    borderRadius: 16,
  },
  secondaryButtonText: {
    fontSize: 16,
    fontFamily: 'Nunito_700Bold',
    color: Colors.primary,
  },
});
