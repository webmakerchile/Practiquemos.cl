import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  Platform,
  Alert,
} from 'react-native';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import Animated, { FadeInDown } from 'react-native-reanimated';
import Colors from '@/constants/colors';
import { useUser } from '@/lib/UserContext';

const plans = [
  {
    id: 'free' as const,
    name: 'Gratuito',
    price: '$0',
    period: '',
    features: [
      '1 ensayo completo de demo',
      'Feedback del copiloto',
      'Explicaciones básicas',
    ],
    icon: 'gift-outline' as const,
    color: Colors.textSecondary,
  },
  {
    id: 'premium_10' as const,
    name: 'Premium 10 días',
    price: '$2.990',
    period: '/10 días',
    features: [
      'Ensayos ilimitados',
      'Base de datos completa (800+ preguntas)',
      'Audios de explicación',
      'Revisión de errores detallada',
      'Estadísticas avanzadas',
    ],
    icon: 'star' as const,
    color: Colors.accent,
    popular: false,
  },
  {
    id: 'premium_30' as const,
    name: 'Premium 30 días',
    price: '$4.990',
    period: '/30 días',
    features: [
      'Todo lo del plan de 10 días',
      'Mejor relación precio/día',
      'Acceso por 30 días completos',
      'Soporte prioritario',
    ],
    icon: 'trophy' as const,
    color: Colors.primary,
    popular: true,
  },
];

export default function PlansScreen() {
  const insets = useSafeAreaInsets();
  const { plan: currentPlan, isPremium, setPlan } = useUser();
  const webTopInset = Platform.OS === 'web' ? 67 : 0;
  const webBottomInset = Platform.OS === 'web' ? 34 : 0;

  const handleSelectPlan = (planId: 'free' | 'premium_10' | 'premium_30') => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    if (planId === 'free') return;

    Alert.alert(
      'Activar plan',
      `¿Deseas activar el plan ${planId === 'premium_10' ? 'Premium 10 días' : 'Premium 30 días'}? (Demo - se activará gratis para prueba)`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Activar',
          onPress: () => {
            setPlan(planId);
            Alert.alert('Plan activado', 'Tu plan Premium ha sido activado exitosamente.');
          },
        },
      ]
    );
  };

  return (
    <View style={styles.root}>
      <View style={[styles.header, { paddingTop: (insets.top || webTopInset) + 8 }]}>
        <Pressable onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="chevron-back" size={24} color={Colors.text} />
        </Pressable>
        <Text style={styles.headerTitle}>Planes</Text>
        <View style={{ width: 36 }} />
      </View>

      <ScrollView
        contentContainerStyle={[
          styles.content,
          { paddingBottom: (insets.bottom || webBottomInset) + 24 },
        ]}
        showsVerticalScrollIndicator={false}
      >
        <Animated.View entering={FadeInDown.duration(500)}>
          <Text style={styles.title}>Elige tu plan</Text>
          <Text style={styles.subtitle}>
            Accede a todo el contenido para prepararte con confianza
          </Text>
        </Animated.View>

        {plans.map((p, index) => {
          const isCurrentPlan = p.id === currentPlan || (p.id === 'free' && !isPremium && currentPlan === 'free');
          const isPremiumPlan = p.id !== 'free';

          return (
            <Animated.View
              key={p.id}
              entering={FadeInDown.duration(500).delay(150 + index * 100)}
            >
              <Pressable
                onPress={() => handleSelectPlan(p.id)}
                disabled={isCurrentPlan}
                style={({ pressed }) => [
                  styles.planCard,
                  p.popular && styles.planCardPopular,
                  isCurrentPlan && styles.planCardActive,
                  { opacity: pressed ? 0.95 : 1, transform: [{ scale: pressed ? 0.98 : 1 }] },
                ]}
              >
                {p.popular && (
                  <View style={styles.popularBadge}>
                    <Text style={styles.popularText}>Más popular</Text>
                  </View>
                )}

                <View style={styles.planHeader}>
                  <View style={[styles.planIcon, { backgroundColor: p.color + '15' }]}>
                    <Ionicons name={p.icon} size={22} color={p.color} />
                  </View>
                  <View style={styles.planInfo}>
                    <Text style={styles.planName}>{p.name}</Text>
                    <View style={styles.priceRow}>
                      <Text style={styles.planPrice}>{p.price}</Text>
                      {p.period ? <Text style={styles.planPeriod}>{p.period}</Text> : null}
                    </View>
                  </View>
                  {isCurrentPlan && (
                    <View style={styles.activeBadge}>
                      <Ionicons name="checkmark-circle" size={16} color={Colors.success} />
                      <Text style={styles.activeText}>Activo</Text>
                    </View>
                  )}
                </View>

                <View style={styles.featuresList}>
                  {p.features.map((feature, i) => (
                    <View key={i} style={styles.featureRow}>
                      <Ionicons
                        name="checkmark"
                        size={16}
                        color={isPremiumPlan ? Colors.success : Colors.textMuted}
                      />
                      <Text style={styles.featureText}>{feature}</Text>
                    </View>
                  ))}
                </View>

                {isPremiumPlan && !isCurrentPlan && (
                  <LinearGradient
                    colors={p.popular ? [Colors.primary, Colors.primaryLight] : [Colors.accent, '#fbbf24']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={styles.planButton}
                  >
                    <Text style={styles.planButtonText}>Elegir plan</Text>
                  </LinearGradient>
                )}
              </Pressable>
            </Animated.View>
          );
        })}

        <Animated.View entering={FadeInDown.duration(500).delay(600)}>
          <View style={styles.guaranteeCard}>
            <MaterialCommunityIcons name="shield-check" size={24} color={Colors.success} />
            <View style={styles.guaranteeContent}>
              <Text style={styles.guaranteeName}>Pago 100% seguro</Text>
              <Text style={styles.guaranteeDesc}>
                Si no apruebas, te extendemos el acceso sin costo
              </Text>
            </View>
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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingBottom: 12,
    backgroundColor: Colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  backBtn: {
    width: 36,
    height: 36,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 17,
    fontFamily: 'Nunito_700Bold',
    color: Colors.text,
  },
  content: {
    padding: 20,
    gap: 14,
  },
  title: {
    fontSize: 24,
    fontFamily: 'Nunito_800ExtraBold',
    color: Colors.text,
  },
  subtitle: {
    fontSize: 15,
    fontFamily: 'Nunito_400Regular',
    color: Colors.textSecondary,
    lineHeight: 22,
    marginBottom: 4,
  },
  planCard: {
    backgroundColor: Colors.surface,
    borderRadius: 18,
    padding: 18,
    gap: 14,
    borderWidth: 1.5,
    borderColor: Colors.border,
  },
  planCardPopular: {
    borderColor: Colors.primary,
    borderWidth: 2,
  },
  planCardActive: {
    borderColor: Colors.success + '60',
    backgroundColor: Colors.successLight,
  },
  popularBadge: {
    position: 'absolute',
    top: -10,
    right: 16,
    backgroundColor: Colors.primary,
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 10,
  },
  popularText: {
    color: '#fff',
    fontSize: 11,
    fontFamily: 'Nunito_700Bold',
  },
  planHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  planIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  planInfo: {
    flex: 1,
    gap: 2,
  },
  planName: {
    fontSize: 16,
    fontFamily: 'Nunito_700Bold',
    color: Colors.text,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 2,
  },
  planPrice: {
    fontSize: 22,
    fontFamily: 'Nunito_800ExtraBold',
    color: Colors.text,
  },
  planPeriod: {
    fontSize: 13,
    fontFamily: 'Nunito_400Regular',
    color: Colors.textSecondary,
  },
  activeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: Colors.success + '15',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
  },
  activeText: {
    fontSize: 12,
    fontFamily: 'Nunito_700Bold',
    color: Colors.success,
  },
  featuresList: {
    gap: 8,
  },
  featureRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  featureText: {
    fontSize: 14,
    fontFamily: 'Nunito_400Regular',
    color: Colors.textSecondary,
    flex: 1,
  },
  planButton: {
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: 'center',
  },
  planButtonText: {
    fontSize: 15,
    fontFamily: 'Nunito_700Bold',
    color: '#fff',
  },
  guaranteeCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: Colors.successLight,
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.success + '20',
  },
  guaranteeContent: {
    flex: 1,
    gap: 2,
  },
  guaranteeName: {
    fontSize: 14,
    fontFamily: 'Nunito_700Bold',
    color: Colors.text,
  },
  guaranteeDesc: {
    fontSize: 13,
    fontFamily: 'Nunito_400Regular',
    color: Colors.textSecondary,
  },
});
