import React from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import Colors from '@/constants/colors';

export default function NosotrosScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const webTopInset = Platform.OS === 'web' ? 67 : 0;

  return (
    <View style={styles.container}>
      <LinearGradient colors={[Colors.primary, Colors.primaryDark]} style={[styles.header, { paddingTop: (insets.top || webTopInset) + 12 }]}>
        <Pressable onPress={() => router.back()} hitSlop={10}>
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </Pressable>
        <Text style={styles.headerTitle}>Quienes Somos</Text>
        <View style={{ width: 24 }} />
      </LinearGradient>

      <ScrollView contentContainerStyle={[styles.content, { paddingBottom: (Platform.OS === 'web' ? 34 : insets.bottom) + 20 }]}>
        <View style={styles.iconCircle}>
          <Ionicons name="information-circle" size={48} color={Colors.primary} />
        </View>

        <Text style={styles.title}>Practiquemos.cl</Text>
        <Text style={styles.subtitle}>Tu companero para la licencia de conducir</Text>

        <View style={styles.missionCard}>
          <Ionicons name="heart" size={24} color="#dc2626" />
          <Text style={styles.missionTitle}>Nuestra Mision</Text>
          <Text style={styles.missionText}>
            Ayudar a obtener la licencia de conducir a todas aquellas personas que no cuentan con el tiempo o la economia necesaria para asistir a una escuela de conduccion presencial.
          </Text>
        </View>

        <View style={styles.statsRow}>
          <View style={styles.statBox}>
            <Text style={styles.statNum}>200+</Text>
            <Text style={styles.statLabel}>Preguntas</Text>
          </View>
          <View style={styles.statBox}>
            <Text style={styles.statNum}>6</Text>
            <Text style={styles.statLabel}>Categorias</Text>
          </View>
          <View style={styles.statBox}>
            <Text style={styles.statNum}>4</Text>
            <Text style={styles.statLabel}>Licencias</Text>
          </View>
        </View>

        <View style={styles.featureCard}>
          <Text style={styles.featureTitle}>Que ofrecemos?</Text>
          {[
            'Preguntas actualizadas del examen oficial chileno',
            'Explicaciones detalladas de cada respuesta',
            'Multiples modos de practica adaptados a tu nivel',
            'Temario completo con todo el material de estudio',
            'Seguimiento de tu progreso por categoria',
            'Mascota copiloto que te acompana en tu aprendizaje',
          ].map((feat, i) => (
            <View key={i} style={styles.featureRow}>
              <Ionicons name="checkmark-circle" size={18} color={Colors.success} />
              <Text style={styles.featureText}>{feat}</Text>
            </View>
          ))}
        </View>

        <Text style={styles.version}>Version 1.0.0</Text>
        <Text style={styles.copyright}>2024 Practiquemos.cl - Todos los derechos reservados</Text>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  header: { paddingBottom: 16, paddingHorizontal: 16, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  headerTitle: { color: '#fff', fontSize: 20, fontFamily: 'Nunito_700Bold' },
  content: { padding: 20, alignItems: 'center' },
  iconCircle: { width: 80, height: 80, borderRadius: 40, backgroundColor: Colors.surfaceSecondary, justifyContent: 'center', alignItems: 'center', marginBottom: 12 },
  title: { fontSize: 26, fontFamily: 'Nunito_800ExtraBold', color: Colors.text },
  subtitle: { fontSize: 14, fontFamily: 'Nunito_400Regular', color: Colors.textSecondary, marginBottom: 24 },
  missionCard: { width: '100%', backgroundColor: Colors.surface, borderRadius: 16, padding: 20, alignItems: 'center', gap: 8, marginBottom: 20, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.08, shadowRadius: 6, elevation: 3 },
  missionTitle: { fontSize: 18, fontFamily: 'Nunito_700Bold', color: Colors.text },
  missionText: { fontSize: 14, fontFamily: 'Nunito_400Regular', color: Colors.textSecondary, textAlign: 'center', lineHeight: 24 },
  statsRow: { flexDirection: 'row', gap: 10, marginBottom: 20, width: '100%' },
  statBox: { flex: 1, backgroundColor: Colors.primary, borderRadius: 14, padding: 14, alignItems: 'center' },
  statNum: { fontSize: 22, fontFamily: 'Nunito_800ExtraBold', color: '#fff' },
  statLabel: { fontSize: 12, fontFamily: 'Nunito_600SemiBold', color: 'rgba(255,255,255,0.8)' },
  featureCard: { width: '100%', backgroundColor: Colors.surface, borderRadius: 16, padding: 20, gap: 10, marginBottom: 24 },
  featureTitle: { fontSize: 17, fontFamily: 'Nunito_700Bold', color: Colors.text, marginBottom: 4 },
  featureRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 8 },
  featureText: { flex: 1, fontSize: 14, fontFamily: 'Nunito_400Regular', color: Colors.textSecondary, lineHeight: 22 },
  version: { fontSize: 13, fontFamily: 'Nunito_600SemiBold', color: Colors.textMuted },
  copyright: { fontSize: 12, fontFamily: 'Nunito_400Regular', color: Colors.textMuted, marginTop: 4 },
});
