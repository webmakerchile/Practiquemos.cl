import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, Platform, Alert, ActivityIndicator, Linking } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import Colors from '@/constants/colors';
import { useUser } from '@/lib/UserContext';
import { getApiUrl, getToken, apiRequest } from '@/lib/query-client';

let Purchases: any = null;
if (Platform.OS === 'ios') {
  try {
    Purchases = require('react-native-purchases').default;
  } catch {}
}

const RC_IOS_API_KEY = process.env.EXPO_PUBLIC_RC_IOS_API_KEY || '';
const RC_PRODUCT_IDS = {
  premium_10: 'premium_10_days',
  premium_30: 'premium_30_days',
};

export default function PlansScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { isPremium, user, refreshUser } = useUser();
  const webTopInset = Platform.OS === 'web' ? 67 : 0;
  const [loading, setLoading] = useState<string | null>(null);
  const [restoring, setRestoring] = useState(false);
  const [rcPackages, setRcPackages] = useState<any[]>([]);
  const useRevenueCat = Platform.OS === 'ios' && !!Purchases;

  useEffect(() => {
    if (useRevenueCat && RC_IOS_API_KEY && user) {
      const initRC = async () => {
        try {
          Purchases.configure({ apiKey: RC_IOS_API_KEY, appUserID: user.id });
          const offerings = await Purchases.getOfferings();
          if (offerings.current?.availablePackages) {
            setRcPackages(offerings.current.availablePackages);
          }
        } catch {}
      };
      initRC();
    }
  }, [useRevenueCat, user]);

  const features = [
    { icon: 'infinite-outline' as const, text: 'Examenes ilimitados' },
    { icon: 'book-outline' as const, text: 'Explicaciones detalladas' },
    { icon: 'analytics-outline' as const, text: 'Estadisticas avanzadas' },
    { icon: 'bulb-outline' as const, text: 'Test Inteligente con IA' },
    { icon: 'star-outline' as const, text: 'Favoritos ilimitados' },
    { icon: 'layers-outline' as const, text: 'Todas las categorias' },
  ];

  const handleiOSPurchase = async (plan: string) => {
    if (!user) {
      Alert.alert('Inicia sesión', 'Necesitas una cuenta para comprar un plan Premium.', [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Iniciar sesión', onPress: () => router.push('/login') },
      ]);
      return;
    }

    if (!RC_IOS_API_KEY) {
      Alert.alert('Error', 'El sistema de pagos no está configurado. Contacta soporte.');
      return;
    }

    setLoading(plan);
    try {
      const productId = RC_PRODUCT_IDS[plan as keyof typeof RC_PRODUCT_IDS];
      const targetPackage = rcPackages.find(
        (p: any) => p.product?.identifier === productId
      );

      if (targetPackage) {
        await Purchases.purchasePackage(targetPackage);
      } else {
        const { customerInfo } = await Purchases.purchaseProduct(productId);
      }

      try {
        await apiRequest('POST', '/api/payments/revenucat-activate', { plan });
      } catch {}

      await refreshUser();
      Alert.alert('¡Éxito!', 'Tu plan Premium ha sido activado.');
    } catch (err: any) {
      if (!err.userCancelled) {
        Alert.alert('Error', 'No se pudo completar la compra. Intenta nuevamente.');
      }
    } finally {
      setLoading(null);
    }
  };

  const handleMercadoPagoPurchase = async (plan: string) => {
    if (!user) {
      Alert.alert('Inicia sesión', 'Necesitas una cuenta para comprar un plan Premium.', [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Iniciar sesión', onPress: () => router.push('/login') },
      ]);
      return;
    }

    setLoading(plan);
    try {
      const token = getToken();
      const apiUrl = getApiUrl();
      const url = new URL('/api/payments/create-preference', apiUrl).toString();

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ plan }),
      });

      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.message || 'Error al crear pago');
      }

      const data = await response.json();
      const paymentUrl = data.initPoint;

      if (Platform.OS === 'web') {
        window.open(paymentUrl, '_blank');
      } else {
        await Linking.openURL(paymentUrl);
      }
    } catch (err: any) {
      Alert.alert('Error', err.message || 'No se pudo procesar el pago. Intenta nuevamente.');
    } finally {
      setLoading(null);
    }
  };

  const handleRestorePurchases = async () => {
    if (!Purchases) return;
    setRestoring(true);
    try {
      const customerInfo = await Purchases.restorePurchases();
      const entitlements = customerInfo?.entitlements?.active || {};
      const hasActive = Object.keys(entitlements).length > 0;

      if (hasActive) {
        try {
          await apiRequest('POST', '/api/payments/revenucat-activate', {});
        } catch {}
        await refreshUser();
        Alert.alert('¡Compra restaurada!', 'Tu plan Premium ha sido restaurado exitosamente.');
      } else {
        Alert.alert('Sin compras previas', 'No se encontraron compras anteriores asociadas a tu cuenta.');
      }
    } catch (err: any) {
      Alert.alert('Error', 'No se pudieron restaurar las compras. Intenta nuevamente.');
    } finally {
      setRestoring(false);
    }
  };

  const handlePurchase = (plan: string) => {
    if (useRevenueCat) {
      handleiOSPurchase(plan);
    } else {
      handleMercadoPagoPurchase(plan);
    }
  };

  return (
    <View style={styles.container}>
      <LinearGradient colors={['#7c3aed', '#5b21b6']} style={[styles.header, { paddingTop: (insets.top || webTopInset) + 12 }]}>
        <Pressable onPress={() => router.back()} hitSlop={10}>
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </Pressable>
        <Text style={styles.headerTitle}>Packs Premium</Text>
        <View style={{ width: 24 }} />
      </LinearGradient>

      <ScrollView contentContainerStyle={[styles.content, { paddingBottom: (Platform.OS === 'web' ? 34 : insets.bottom) + 20 }]}>
        {isPremium && (
          <View style={styles.activeCard}>
            <Ionicons name="checkmark-circle" size={24} color={Colors.success} />
            <Text style={styles.activeText}>Tu plan Premium esta activo</Text>
          </View>
        )}

        <Text style={styles.subtitle}>Acceso completo a todos los recursos</Text>

        <View style={styles.featuresList}>
          {features.map((f, i) => (
            <View key={i} style={styles.featureRow}>
              <Ionicons name={f.icon as any} size={22} color="#7c3aed" />
              <Text style={styles.featureText}>{f.text}</Text>
            </View>
          ))}
        </View>

        <View style={styles.planCard}>
          <View style={styles.planBadge}><Text style={styles.planBadgeText}>Mas Popular</Text></View>
          <Text style={styles.planName}>Premium 30 Dias</Text>
          <Text style={styles.planPrice}>$4.990 CLP</Text>
          <Text style={styles.planPeriod}>30 dias de acceso completo</Text>
          <Pressable
            style={({ pressed }) => [styles.planBtn, pressed && { opacity: 0.8 }, loading === 'premium_30' && { opacity: 0.6 }]}
            onPress={() => handlePurchase('premium_30')}
            disabled={loading !== null}
          >
            {loading === 'premium_30' ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.planBtnText}>Obtener Premium</Text>
            )}
          </Pressable>
          {!useRevenueCat && (
            <View style={styles.mpBadge}>
              <Ionicons name="shield-checkmark" size={14} color="#009ee3" />
              <Text style={styles.mpBadgeText}>Pago seguro con Mercado Pago</Text>
            </View>
          )}
        </View>

        <View style={styles.planCardAlt}>
          <Text style={styles.planName}>Premium 10 Dias</Text>
          <Text style={styles.planPrice}>$2.990 CLP</Text>
          <Text style={styles.planPeriod}>10 dias de acceso completo</Text>
          <Pressable
            style={({ pressed }) => [styles.planBtnAlt, pressed && { opacity: 0.8 }, loading === 'premium_10' && { opacity: 0.6 }]}
            onPress={() => handlePurchase('premium_10')}
            disabled={loading !== null}
          >
            {loading === 'premium_10' ? (
              <ActivityIndicator color={Colors.text} />
            ) : (
              <Text style={styles.planBtnAltText}>Obtener Premium</Text>
            )}
          </Pressable>
          {!useRevenueCat && (
            <View style={styles.mpBadge}>
              <Ionicons name="shield-checkmark" size={14} color="#009ee3" />
              <Text style={styles.mpBadgeText}>Pago seguro con Mercado Pago</Text>
            </View>
          )}
        </View>

        <View style={styles.freeCard}>
          <Text style={styles.planName}>Plan Gratuito</Text>
          <Text style={styles.planPrice}>Gratis</Text>
          <Text style={styles.planPeriod}>1 test diario gratuito</Text>
        </View>

        {useRevenueCat && (
          <View style={styles.iosSection}>
            <Pressable
              onPress={handleRestorePurchases}
              disabled={restoring}
              style={({ pressed }) => [styles.restoreBtn, (pressed || restoring) && { opacity: 0.6 }]}
            >
              {restoring ? (
                <ActivityIndicator size="small" color="#7c3aed" />
              ) : (
                <>
                  <Ionicons name="refresh-outline" size={18} color="#7c3aed" />
                  <Text style={styles.restoreBtnText}>Restaurar Compras</Text>
                </>
              )}
            </Pressable>

            <View style={styles.iosInfoBox}>
              <Ionicons name="logo-apple" size={16} color="#64748b" />
              <Text style={styles.iosInfoText}>
                Las compras se procesan a través de tu cuenta de Apple. Para gestionar o cancelar tu plan, ve a Ajustes {'>'} tu nombre {'>'} Suscripciones en tu dispositivo iOS.
              </Text>
            </View>
          </View>
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
  activeCard: { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: '#dcfce7', borderRadius: 12, padding: 14, marginBottom: 16 },
  activeText: { fontSize: 15, fontFamily: 'Nunito_700Bold', color: '#166534' },
  subtitle: { fontSize: 18, fontFamily: 'Nunito_700Bold', color: Colors.text, marginBottom: 16 },
  featuresList: { marginBottom: 24, gap: 10 },
  featureRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  featureText: { fontSize: 15, fontFamily: 'Nunito_600SemiBold', color: Colors.text },
  planCard: { backgroundColor: Colors.surface, borderRadius: 16, padding: 20, marginBottom: 12, borderWidth: 2, borderColor: '#7c3aed', alignItems: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.08, shadowRadius: 6, elevation: 3 },
  planBadge: { backgroundColor: '#7c3aed', paddingHorizontal: 12, paddingVertical: 4, borderRadius: 12, marginBottom: 10 },
  planBadgeText: { color: '#fff', fontSize: 12, fontFamily: 'Nunito_700Bold' },
  planName: { fontSize: 18, fontFamily: 'Nunito_700Bold', color: Colors.text },
  planPrice: { fontSize: 28, fontFamily: 'Nunito_800ExtraBold', color: '#7c3aed', marginTop: 4 },
  planPeriod: { fontSize: 14, fontFamily: 'Nunito_400Regular', color: Colors.textSecondary, marginBottom: 16 },
  planBtn: { backgroundColor: '#7c3aed', paddingVertical: 14, paddingHorizontal: 40, borderRadius: 14, width: '100%', alignItems: 'center', minHeight: 48, justifyContent: 'center' },
  planBtnText: { color: '#fff', fontSize: 16, fontFamily: 'Nunito_700Bold' },
  planCardAlt: { backgroundColor: Colors.surface, borderRadius: 16, padding: 20, marginBottom: 12, alignItems: 'center', borderWidth: 1, borderColor: Colors.border },
  planBtnAlt: { backgroundColor: Colors.surfaceSecondary, paddingVertical: 14, paddingHorizontal: 40, borderRadius: 14, width: '100%', alignItems: 'center', borderWidth: 1, borderColor: Colors.border, minHeight: 48, justifyContent: 'center' },
  planBtnAltText: { color: Colors.text, fontSize: 16, fontFamily: 'Nunito_700Bold' },
  freeCard: { backgroundColor: Colors.surfaceSecondary, borderRadius: 16, padding: 20, alignItems: 'center' },
  mpBadge: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 10 },
  mpBadgeText: { fontSize: 12, fontFamily: 'Nunito_600SemiBold', color: '#009ee3' },
  iosSection: { marginTop: 16, gap: 12 },
  restoreBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, paddingVertical: 14, borderRadius: 12, borderWidth: 1.5, borderColor: '#7c3aed', backgroundColor: Colors.surface, minHeight: 48 },
  restoreBtnText: { fontSize: 15, fontFamily: 'Nunito_700Bold', color: '#7c3aed' },
  iosInfoBox: { flexDirection: 'row', alignItems: 'flex-start', gap: 10, backgroundColor: '#f1f5f9', borderRadius: 12, padding: 14, borderWidth: 1, borderColor: '#e2e8f0' },
  iosInfoText: { flex: 1, fontSize: 12, fontFamily: 'Nunito_400Regular', color: '#64748b', lineHeight: 18 },
});
