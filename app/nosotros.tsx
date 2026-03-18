import React from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, Platform, Image } from 'react-native';
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
        <Image source={require('@/assets/images/logo-texto.png')} style={styles.logo} resizeMode="contain" />

        <Text style={styles.title}>Practiquemos.cl</Text>
        <Text style={styles.subtitle}>Tu compañero para la licencia de conducir</Text>

        <View style={styles.sectionCard}>
          <View style={styles.sectionHeaderRow}>
            <View style={styles.sectionIconCircle}>
              <Ionicons name="flag" size={24} color={Colors.primary} />
            </View>
            <Text style={styles.sectionTitle}>Nuestra Misión</Text>
          </View>
          <Image source={require('@/assets/images/mascota-hablando.png')} style={styles.mascotImage} resizeMode="contain" />
          <Text style={styles.sectionText}>
            Ayudar a obtener la licencia de conducir a todas aquellas personas que no cuentan con el tiempo o la economía necesaria para asistir a una escuela de conducción presencial. Queremos democratizar el acceso a la educación vial de calidad, brindando herramientas prácticas y accesibles para que cada persona pueda prepararse de manera efectiva desde cualquier lugar.
          </Text>
        </View>

        <View style={styles.sectionCard}>
          <View style={styles.sectionHeaderRow}>
            <View style={[styles.sectionIconCircle, { backgroundColor: '#fef3c7' }]}>
              <Ionicons name="people" size={24} color={Colors.accent} />
            </View>
            <Text style={styles.sectionTitle}>Quiénes Somos</Text>
          </View>
          <Image source={require('@/assets/images/mascota-cuerpo.png')} style={styles.mascotImage} resizeMode="contain" />
          <Text style={styles.sectionText}>
            Somos una escuela de conductores reconocida por el ministerio de transporte. Contamos con años de experiencia formando conductores responsables y comprometidos con la seguridad vial en Chile. Nuestro equipo está conformado por profesionales apasionados por la educación y la tecnología, dedicados a ofrecer la mejor experiencia de aprendizaje.
          </Text>
        </View>

        <View style={styles.sectionCard}>
          <View style={styles.sectionHeaderRow}>
            <View style={[styles.sectionIconCircle, { backgroundColor: '#dcfce7' }]}>
              <Ionicons name="trophy" size={24} color={Colors.success} />
            </View>
            <Text style={styles.sectionTitle}>Nuestros Objetivos</Text>
          </View>
          <Image source={require('@/assets/images/mascota-pensando.png')} style={styles.mascotImage} resizeMode="contain" />
          <Text style={styles.sectionText}>
            Que tengas los conocimientos óptimos para que saques tu licencia de conducir. Nos enfocamos en que domines tanto la teoría como la práctica, cubriendo todas las categorías del examen oficial chileno para que te presentes con total confianza y seguridad el día de tu evaluación.
          </Text>
        </View>

        <View style={styles.statsRow}>
          <View style={styles.statBox}>
            <Text style={styles.statNum}>1000+</Text>
            <Text style={styles.statLabel}>Preguntas</Text>
          </View>
          <View style={styles.statBox}>
            <Text style={styles.statNum}>10</Text>
            <Text style={styles.statLabel}>Categorías</Text>
          </View>
          <View style={styles.statBox}>
            <Text style={styles.statNum}>6</Text>
            <Text style={styles.statLabel}>Licencias</Text>
          </View>
        </View>

        <View style={styles.featureCard}>
          <Text style={styles.featureTitle}>¿Qué ofrecemos?</Text>
          {[
            'Preguntas actualizadas del examen oficial chileno',
            'Explicaciones detalladas de cada respuesta',
            'Múltiples modos de práctica adaptados a tu nivel',
            'Temario completo con todo el material de estudio',
            'Seguimiento de tu progreso por categoría',
            'Mascota copiloto que te acompaña en tu aprendizaje',
          ].map((feat, i) => (
            <View key={i} style={styles.featureRow}>
              <Ionicons name="checkmark-circle" size={18} color={Colors.success} />
              <Text style={styles.featureText}>{feat}</Text>
            </View>
          ))}
        </View>

        <Pressable onPress={() => router.push('/legal')} style={styles.legalBtn}>
          <Ionicons name="document-text-outline" size={18} color={Colors.primary} />
          <Text style={styles.legalBtnText}>Política de Privacidad y Términos de Servicio</Text>
        </Pressable>

        <Text style={styles.version}>Versión 1.0.0</Text>
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
  logo: { width: 220, height: 60, marginBottom: 8 },
  title: { fontSize: 26, fontFamily: 'Nunito_800ExtraBold', color: Colors.text },
  subtitle: { fontSize: 14, fontFamily: 'Nunito_400Regular', color: Colors.textSecondary, marginBottom: 24 },
  sectionCard: {
    width: '100%',
    backgroundColor: Colors.surface,
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    gap: 12,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 3,
  },
  sectionHeaderRow: { flexDirection: 'row', alignItems: 'center', gap: 10, alignSelf: 'flex-start' },
  sectionIconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#dbeafe',
    justifyContent: 'center',
    alignItems: 'center',
  },
  sectionTitle: { fontSize: 18, fontFamily: 'Nunito_700Bold', color: Colors.text },
  sectionText: { fontSize: 14, fontFamily: 'Nunito_400Regular', color: Colors.textSecondary, textAlign: 'justify', lineHeight: 24 },
  mascotImage: { width: 100, height: 100 },
  statsRow: { flexDirection: 'row', gap: 10, marginBottom: 16, marginTop: 8, width: '100%' },
  statBox: { flex: 1, backgroundColor: Colors.primary, borderRadius: 14, padding: 14, alignItems: 'center' },
  statNum: { fontSize: 22, fontFamily: 'Nunito_800ExtraBold', color: '#fff' },
  statLabel: { fontSize: 12, fontFamily: 'Nunito_600SemiBold', color: 'rgba(255,255,255,0.8)' },
  featureCard: { width: '100%', backgroundColor: Colors.surface, borderRadius: 16, padding: 20, gap: 10, marginBottom: 24 },
  featureTitle: { fontSize: 17, fontFamily: 'Nunito_700Bold', color: Colors.text, marginBottom: 4 },
  featureRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 8 },
  featureText: { flex: 1, fontSize: 14, fontFamily: 'Nunito_400Regular', color: Colors.textSecondary, textAlign: 'justify', lineHeight: 22 },
  legalBtn: { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: Colors.surface, paddingVertical: 14, paddingHorizontal: 20, borderRadius: 14, marginBottom: 16, width: '100%', justifyContent: 'center' },
  legalBtnText: { fontSize: 14, fontFamily: 'Nunito_600SemiBold', color: Colors.primary },
  version: { fontSize: 13, fontFamily: 'Nunito_600SemiBold', color: Colors.textMuted },
  copyright: { fontSize: 12, fontFamily: 'Nunito_400Regular', color: Colors.textMuted, marginTop: 4 },
});
