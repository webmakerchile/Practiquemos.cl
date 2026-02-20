import React from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, Platform, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import Colors from '@/constants/colors';
import { useUser } from '@/lib/UserContext';

export default function PlansScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { isPremium, user } = useUser();
  const webTopInset = Platform.OS === 'web' ? 67 : 0;

  const features = [
    { icon: 'infinite-outline' as const, text: 'Examenes ilimitados' },
    { icon: 'book-outline' as const, text: 'Explicaciones detalladas' },
    { icon: 'analytics-outline' as const, text: 'Estadisticas avanzadas' },
    { icon: 'brain' as const, text: 'Test Inteligente con IA', lib: 'MaterialCommunityIcons' },
    { icon: 'star-outline' as const, text: 'Favoritos ilimitados' },
    { icon: 'layers-outline' as const, text: 'Todas las categorias' },
  ];

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
          <Pressable style={({ pressed }) => [styles.planBtn, pressed && { opacity: 0.8 }]}
            onPress={() => Alert.alert('Pago', 'Contacta al administrador para activar tu plan Premium.')}>
            <Text style={styles.planBtnText}>Obtener Premium</Text>
          </Pressable>
        </View>

        <View style={styles.planCardAlt}>
          <Text style={styles.planName}>Premium 10 Dias</Text>
          <Text style={styles.planPrice}>$2.990 CLP</Text>
          <Text style={styles.planPeriod}>10 dias de acceso completo</Text>
          <Pressable style={({ pressed }) => [styles.planBtnAlt, pressed && { opacity: 0.8 }]}
            onPress={() => Alert.alert('Pago', 'Contacta al administrador para activar tu plan Premium.')}>
            <Text style={styles.planBtnAltText}>Obtener Premium</Text>
          </Pressable>
        </View>

        <View style={styles.freeCard}>
          <Text style={styles.planName}>Plan Gratuito</Text>
          <Text style={styles.planPrice}>Gratis</Text>
          <Text style={styles.planPeriod}>1 test diario gratuito</Text>
        </View>
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
  planBtn: { backgroundColor: '#7c3aed', paddingVertical: 14, paddingHorizontal: 40, borderRadius: 14, width: '100%', alignItems: 'center' },
  planBtnText: { color: '#fff', fontSize: 16, fontFamily: 'Nunito_700Bold' },
  planCardAlt: { backgroundColor: Colors.surface, borderRadius: 16, padding: 20, marginBottom: 12, alignItems: 'center', borderWidth: 1, borderColor: Colors.border },
  planBtnAlt: { backgroundColor: Colors.surfaceSecondary, paddingVertical: 14, paddingHorizontal: 40, borderRadius: 14, width: '100%', alignItems: 'center', borderWidth: 1, borderColor: Colors.border },
  planBtnAltText: { color: Colors.text, fontSize: 16, fontFamily: 'Nunito_700Bold' },
  freeCard: { backgroundColor: Colors.surfaceSecondary, borderRadius: 16, padding: 20, alignItems: 'center' },
});
