import React from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, Platform, Linking } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import Colors from '@/constants/colors';

export default function ContactoScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const webTopInset = Platform.OS === 'web' ? 67 : 0;

  return (
    <View style={styles.container}>
      <LinearGradient colors={[Colors.success, '#15803d']} style={[styles.header, { paddingTop: (insets.top || webTopInset) + 12 }]}>
        <Pressable onPress={() => router.back()} hitSlop={10}>
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </Pressable>
        <Text style={styles.headerTitle}>Contacto</Text>
        <View style={{ width: 24 }} />
      </LinearGradient>

      <ScrollView contentContainerStyle={[styles.content, { paddingBottom: (Platform.OS === 'web' ? 34 : insets.bottom) + 20 }]}>
        <View style={styles.iconCircle}>
          <Ionicons name="mail" size={40} color={Colors.success} />
        </View>
        <Text style={styles.title}>Como podemos ayudarte?</Text>
        <Text style={styles.desc}>Si tienes alguna incidencia, duda sobre el servicio, o quieres compartir tus preguntas del examen, no dudes en contactarnos.</Text>

        <Pressable style={styles.contactCard} onPress={() => Linking.openURL('mailto:contacto@practiquemos.cl')}>
          <Ionicons name="mail-outline" size={24} color={Colors.primary} />
          <View style={styles.contactInfo}>
            <Text style={styles.contactLabel}>Email</Text>
            <Text style={styles.contactValue}>contacto@practiquemos.cl</Text>
          </View>
        </Pressable>

        <Pressable style={styles.contactCard} onPress={() => Linking.openURL('https://wa.me/56912345678')}>
          <Ionicons name="logo-whatsapp" size={24} color="#25D366" />
          <View style={styles.contactInfo}>
            <Text style={styles.contactLabel}>WhatsApp</Text>
            <Text style={styles.contactValue}>+56 9 1234 5678</Text>
          </View>
        </Pressable>

        <Pressable style={styles.contactCard} onPress={() => Linking.openURL('https://instagram.com/practiquemos.cl')}>
          <Ionicons name="logo-instagram" size={24} color="#E1306C" />
          <View style={styles.contactInfo}>
            <Text style={styles.contactLabel}>Instagram</Text>
            <Text style={styles.contactValue}>@practiquemos.cl</Text>
          </View>
        </Pressable>

        <View style={styles.helpBox}>
          <Text style={styles.helpTitle}>Preguntas frecuentes</Text>
          <Text style={styles.helpItem}>Como puedo compartir preguntas del examen?</Text>
          <Text style={styles.helpAnswer}>Envianos un correo con las preguntas que recuerdas de tu examen y las agregaremos a nuestra base de datos.</Text>
          <Text style={styles.helpItem}>Como activo mi plan Premium?</Text>
          <Text style={styles.helpAnswer}>Contactanos por WhatsApp o email, te indicaremos los metodos de pago disponibles.</Text>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  header: { paddingBottom: 16, paddingHorizontal: 16, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  headerTitle: { color: '#fff', fontSize: 20, fontFamily: 'Nunito_700Bold' },
  content: { padding: 20, alignItems: 'center' },
  iconCircle: { width: 80, height: 80, borderRadius: 40, backgroundColor: '#dcfce7', justifyContent: 'center', alignItems: 'center', marginBottom: 16 },
  title: { fontSize: 22, fontFamily: 'Nunito_800ExtraBold', color: Colors.text, marginBottom: 8, textAlign: 'center' },
  desc: { fontSize: 14, fontFamily: 'Nunito_400Regular', color: Colors.textSecondary, textAlign: 'center', lineHeight: 22, marginBottom: 24 },
  contactCard: { flexDirection: 'row', alignItems: 'center', width: '100%', backgroundColor: Colors.surface, padding: 16, borderRadius: 14, marginBottom: 10, gap: 14, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.06, shadowRadius: 4, elevation: 2 },
  contactInfo: { flex: 1 },
  contactLabel: { fontSize: 12, fontFamily: 'Nunito_600SemiBold', color: Colors.textMuted },
  contactValue: { fontSize: 15, fontFamily: 'Nunito_700Bold', color: Colors.text },
  helpBox: { width: '100%', backgroundColor: Colors.surface, borderRadius: 14, padding: 16, marginTop: 16 },
  helpTitle: { fontSize: 17, fontFamily: 'Nunito_700Bold', color: Colors.text, marginBottom: 12 },
  helpItem: { fontSize: 14, fontFamily: 'Nunito_700Bold', color: Colors.primary, marginTop: 8 },
  helpAnswer: { fontSize: 13, fontFamily: 'Nunito_400Regular', color: Colors.textSecondary, lineHeight: 20 },
});
