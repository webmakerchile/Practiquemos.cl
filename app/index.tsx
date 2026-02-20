import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  Platform,
  Dimensions,
} from 'react-native';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons, MaterialCommunityIcons, Feather } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import Animated, {
  FadeInDown,
  FadeInUp,
} from 'react-native-reanimated';
import Colors from '@/constants/colors';
import { useUser } from '@/lib/UserContext';
import MascotaCopiloto from '@/components/MascotaCopiloto';

const { width } = Dimensions.get('window');

export default function HomeScreen() {
  const insets = useSafeAreaInsets();
  const { isPremium, canTakeExam, examHistory, plan } = useUser();
  const webTopInset = Platform.OS === 'web' ? 67 : 0;
  const webBottomInset = Platform.OS === 'web' ? 34 : 0;

  const handleStartExam = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    if (!canTakeExam) {
      router.push('/plans');
      return;
    }
    router.push('/exam');
  };

  const lastExam = examHistory.length > 0 ? examHistory[0] : null;
  const bestScore = examHistory.length > 0
    ? Math.max(...examHistory.map(e => Math.round(e.score * 100)))
    : 0;

  return (
    <View style={styles.root}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[
          styles.scrollContent,
          {
            paddingTop: (insets.top || webTopInset) + 16,
            paddingBottom: (insets.bottom || webBottomInset) + 24,
          },
        ]}
        showsVerticalScrollIndicator={false}
      >
        <Animated.View entering={FadeInDown.duration(600).delay(100)}>
          <LinearGradient
            colors={[Colors.primary, Colors.primaryLight]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.heroCard}
          >
            <View style={styles.heroContent}>
              <View style={styles.heroChip}>
                <MaterialCommunityIcons name="steering" size={14} color={Colors.accent} />
                <Text style={styles.heroChipText}>Examen Chile 2026</Text>
              </View>

              <Text style={styles.heroTitle}>
                Practiquemos juntos{'\n'}hasta que apruebes
              </Text>
              <Text style={styles.heroSubtitle}>
                No manejas solo, practicas con tu copiloto
              </Text>

              <Pressable
                onPress={handleStartExam}
                style={({ pressed }) => [
                  styles.heroButton,
                  { opacity: pressed ? 0.9 : 1, transform: [{ scale: pressed ? 0.97 : 1 }] },
                ]}
              >
                <Ionicons name="play" size={20} color={Colors.primary} />
                <Text style={styles.heroButtonText}>
                  {canTakeExam ? 'Comenzar ensayo' : 'Ver planes'}
                </Text>
              </Pressable>
            </View>

            <View style={styles.heroDecor}>
              <View style={[styles.circle, styles.circle1]} />
              <View style={[styles.circle, styles.circle2]} />
            </View>
          </LinearGradient>
        </Animated.View>

        <Animated.View entering={FadeInDown.duration(600).delay(200)}>
          <MascotaCopiloto
            state={lastExam?.passed ? 'correct' : 'idle'}
            message={
              lastExam
                ? lastExam.passed
                  ? 'Vas excelente, sigue asi'
                  : 'Sigamos practicando juntos, cada intento te acerca más'
                : 'Hola, soy tu copiloto. Vamos a estudiar juntos'
            }
            compact
          />
        </Animated.View>

        {examHistory.length > 0 && (
          <Animated.View entering={FadeInDown.duration(600).delay(300)} style={styles.statsRow}>
            <View style={styles.statCard}>
              <View style={[styles.statIcon, { backgroundColor: Colors.primaryLight + '15' }]}>
                <Ionicons name="document-text" size={20} color={Colors.primary} />
              </View>
              <Text style={styles.statValue}>{examHistory.length}</Text>
              <Text style={styles.statLabel}>Ensayos</Text>
            </View>
            <View style={styles.statCard}>
              <View style={[styles.statIcon, { backgroundColor: Colors.success + '15' }]}>
                <Ionicons name="trophy" size={20} color={Colors.success} />
              </View>
              <Text style={styles.statValue}>{bestScore}%</Text>
              <Text style={styles.statLabel}>Mejor nota</Text>
            </View>
            <View style={styles.statCard}>
              <View style={[styles.statIcon, { backgroundColor: Colors.accent + '15' }]}>
                <Ionicons name="checkmark-circle" size={20} color={Colors.accent} />
              </View>
              <Text style={styles.statValue}>
                {examHistory.filter(e => e.passed).length}
              </Text>
              <Text style={styles.statLabel}>Aprobados</Text>
            </View>
          </Animated.View>
        )}

        <Animated.View entering={FadeInDown.duration(600).delay(400)} style={styles.section}>
          <Text style={styles.sectionTitle}>Prepárate</Text>

          <Pressable
            onPress={handleStartExam}
            style={({ pressed }) => [
              styles.actionCard,
              { opacity: pressed ? 0.95 : 1, transform: [{ scale: pressed ? 0.98 : 1 }] },
            ]}
          >
            <View style={[styles.actionIcon, { backgroundColor: Colors.primary + '12' }]}>
              <Ionicons name="reader" size={24} color={Colors.primary} />
            </View>
            <View style={styles.actionContent}>
              <Text style={styles.actionTitle}>Ensayo completo</Text>
              <Text style={styles.actionDesc}>35 preguntas, 45 min</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={Colors.textMuted} />
          </Pressable>

          {examHistory.length > 0 && (
            <Pressable
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                router.push('/history');
              }}
              style={({ pressed }) => [
                styles.actionCard,
                { opacity: pressed ? 0.95 : 1, transform: [{ scale: pressed ? 0.98 : 1 }] },
              ]}
            >
              <View style={[styles.actionIcon, { backgroundColor: Colors.success + '12' }]}>
                <Feather name="bar-chart-2" size={24} color={Colors.success} />
              </View>
              <View style={styles.actionContent}>
                <Text style={styles.actionTitle}>Mi progreso</Text>
                <Text style={styles.actionDesc}>{examHistory.length} ensayos realizados</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color={Colors.textMuted} />
            </Pressable>
          )}

          <Pressable
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              router.push('/plans');
            }}
            style={({ pressed }) => [
              styles.actionCard,
              { opacity: pressed ? 0.95 : 1, transform: [{ scale: pressed ? 0.98 : 1 }] },
            ]}
          >
            <View style={[styles.actionIcon, { backgroundColor: Colors.accent + '12' }]}>
              <Ionicons name="star" size={24} color={Colors.accent} />
            </View>
            <View style={styles.actionContent}>
              <Text style={styles.actionTitle}>
                {isPremium ? 'Mi plan Premium' : 'Planes'}
              </Text>
              <Text style={styles.actionDesc}>
                {isPremium ? 'Acceso total activo' : 'Desbloquea todo el contenido'}
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={Colors.textMuted} />
          </Pressable>
        </Animated.View>

        <Animated.View entering={FadeInDown.duration(600).delay(500)} style={styles.section}>
          <Text style={styles.sectionTitle}>Patrocinadores</Text>
          <View style={styles.sponsorCard}>
            <View style={styles.sponsorIcon}>
              <MaterialCommunityIcons name="school" size={28} color={Colors.primary} />
            </View>
            <View style={styles.sponsorContent}>
              <Text style={styles.sponsorName}>Escuela de Conductores CAPCHILE</Text>
              <Text style={styles.sponsorDesc}>Formando conductores responsables</Text>
            </View>
          </View>
        </Animated.View>

        <Animated.View entering={FadeInUp.duration(600).delay(600)}>
          <View style={styles.planBanner}>
            <Text style={styles.planBannerLabel}>
              {isPremium ? 'Plan Premium activo' : 'Plan Gratuito: 1 ensayo de demo'}
            </Text>
            {!isPremium && (
              <Text style={styles.planBannerCta}>
                {canTakeExam ? 'Ensayo disponible' : 'Actualiza para más ensayos'}
              </Text>
            )}
          </View>
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
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    gap: 16,
  },
  heroCard: {
    borderRadius: 24,
    overflow: 'hidden',
    position: 'relative',
  },
  heroContent: {
    padding: 24,
    gap: 12,
    zIndex: 1,
  },
  heroChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(255,255,255,0.15)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    alignSelf: 'flex-start',
  },
  heroChipText: {
    color: '#fff',
    fontSize: 12,
    fontFamily: 'Nunito_700Bold',
  },
  heroTitle: {
    fontSize: 26,
    fontFamily: 'Nunito_800ExtraBold',
    color: '#fff',
    lineHeight: 32,
  },
  heroSubtitle: {
    fontSize: 15,
    fontFamily: 'Nunito_400Regular',
    color: 'rgba(255,255,255,0.85)',
    lineHeight: 22,
  },
  heroButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#fff',
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 16,
    alignSelf: 'flex-start',
    marginTop: 4,
  },
  heroButtonText: {
    fontSize: 16,
    fontFamily: 'Nunito_700Bold',
    color: Colors.primary,
  },
  heroDecor: {
    position: 'absolute',
    right: -20,
    top: -20,
    width: 200,
    height: 200,
  },
  circle: {
    position: 'absolute',
    borderRadius: 100,
    backgroundColor: 'rgba(255,255,255,0.08)',
  },
  circle1: {
    width: 160,
    height: 160,
    right: -20,
    top: -20,
  },
  circle2: {
    width: 100,
    height: 100,
    right: 20,
    top: 80,
  },
  statsRow: {
    flexDirection: 'row',
    gap: 10,
  },
  statCard: {
    flex: 1,
    backgroundColor: Colors.surface,
    borderRadius: 16,
    padding: 14,
    alignItems: 'center',
    gap: 6,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  statIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  statValue: {
    fontSize: 20,
    fontFamily: 'Nunito_800ExtraBold',
    color: Colors.text,
  },
  statLabel: {
    fontSize: 11,
    fontFamily: 'Nunito_600SemiBold',
    color: Colors.textSecondary,
  },
  section: {
    gap: 10,
  },
  sectionTitle: {
    fontSize: 18,
    fontFamily: 'Nunito_700Bold',
    color: Colors.text,
    marginBottom: 2,
  },
  actionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    borderRadius: 16,
    padding: 16,
    gap: 14,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  actionIcon: {
    width: 48,
    height: 48,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  actionContent: {
    flex: 1,
    gap: 2,
  },
  actionTitle: {
    fontSize: 16,
    fontFamily: 'Nunito_700Bold',
    color: Colors.text,
  },
  actionDesc: {
    fontSize: 13,
    fontFamily: 'Nunito_400Regular',
    color: Colors.textSecondary,
  },
  sponsorCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    borderRadius: 16,
    padding: 16,
    gap: 14,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  sponsorIcon: {
    width: 48,
    height: 48,
    borderRadius: 14,
    backgroundColor: Colors.primary + '10',
    justifyContent: 'center',
    alignItems: 'center',
  },
  sponsorContent: {
    flex: 1,
    gap: 2,
  },
  sponsorName: {
    fontSize: 15,
    fontFamily: 'Nunito_700Bold',
    color: Colors.text,
  },
  sponsorDesc: {
    fontSize: 13,
    fontFamily: 'Nunito_400Regular',
    color: Colors.textSecondary,
  },
  planBanner: {
    backgroundColor: Colors.accentSoft,
    borderRadius: 14,
    padding: 14,
    alignItems: 'center',
    gap: 4,
    borderWidth: 1,
    borderColor: Colors.accent + '30',
  },
  planBannerLabel: {
    fontSize: 13,
    fontFamily: 'Nunito_700Bold',
    color: Colors.text,
  },
  planBannerCta: {
    fontSize: 12,
    fontFamily: 'Nunito_400Regular',
    color: Colors.textSecondary,
  },
});
