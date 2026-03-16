import React from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, Platform, Alert, Image } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import Colors from '@/constants/colors';
import { useUser } from '@/lib/UserContext';

export default function PerfilScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { user, isPremium, logout, isAdmin } = useUser();
  const webTopInset = Platform.OS === 'web' ? 67 : 0;

  const handleLogout = async () => {
    await logout();
    router.replace('/');
  };

  const getPlanLabel = () => {
    if (user?.plan === 'premium_10') return 'Premium 10 dias';
    if (user?.plan === 'premium_30') return 'Premium 30 dias';
    return 'Gratuito';
  };

  return (
    <View style={styles.container}>
      <LinearGradient colors={[Colors.primary, Colors.primaryDark]} style={[styles.header, { paddingTop: (insets.top || webTopInset) + 12 }]}>
        <Pressable onPress={() => router.back()} hitSlop={10}>
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </Pressable>
        <Text style={styles.headerTitle}>Mi Perfil</Text>
        <View style={{ width: 24 }} />
      </LinearGradient>

      <ScrollView contentContainerStyle={[styles.content, { paddingBottom: (Platform.OS === 'web' ? 34 : insets.bottom) + 20 }]}>
        <View style={styles.avatarSection}>
          <View style={styles.avatar}>
            <Image
              source={require('../assets/images/logo-texto.png')}
              style={{ width: 160, height: 60 }}
              resizeMode="contain"
            />
          </View>
          <Text style={styles.userName}>{user?.fullName || user?.username}</Text>
          <Text style={styles.userHandle}>@{user?.username}</Text>
          {isAdmin && <View style={styles.adminBadge}><Text style={styles.adminBadgeText}>Administrador</Text></View>}
        </View>

        <View style={styles.infoCard}>
          <View style={styles.infoRow}>
            <Ionicons name="diamond-outline" size={20} color={Colors.primary} />
            <Text style={styles.infoLabel}>Plan</Text>
            <Text style={[styles.infoValue, isPremium && { color: Colors.accent }]}>{getPlanLabel()}</Text>
          </View>
          {user?.email && (
            <View style={styles.infoRow}>
              <Ionicons name="mail-outline" size={20} color={Colors.primary} />
              <Text style={styles.infoLabel}>Email</Text>
              <Text style={styles.infoValue}>{user.email}</Text>
            </View>
          )}
          <View style={styles.infoRow}>
            <Ionicons name="car-outline" size={20} color={Colors.primary} />
            <Text style={styles.infoLabel}>Licencia</Text>
            <Text style={styles.infoValue}>{user?.licenseType?.replace('clase_', 'Clase ').toUpperCase()}</Text>
          </View>
        </View>

        <Pressable onPress={() => router.push('/plans')} style={({ pressed }) => [styles.actionBtn, pressed && { opacity: 0.7 }]}>
          <Ionicons name="diamond-outline" size={22} color={Colors.primary} />
          <Text style={styles.actionText}>{isPremium ? 'Gestionar Plan' : 'Obtener Premium'}</Text>
          <Ionicons name="chevron-forward" size={20} color={Colors.textMuted} />
        </Pressable>

        <Pressable onPress={() => router.push('/history')} style={({ pressed }) => [styles.actionBtn, pressed && { opacity: 0.7 }]}>
          <Ionicons name="time-outline" size={22} color={Colors.primary} />
          <Text style={styles.actionText}>Mi Historial</Text>
          <Ionicons name="chevron-forward" size={20} color={Colors.textMuted} />
        </Pressable>

        <Pressable onPress={() => router.push('/mi-curso')} style={({ pressed }) => [styles.actionBtn, pressed && { opacity: 0.7 }]}>
          <Ionicons name="school-outline" size={22} color={Colors.primary} />
          <Text style={styles.actionText}>Mi Curso</Text>
          <Ionicons name="chevron-forward" size={20} color={Colors.textMuted} />
        </Pressable>

        <Pressable onPress={() => router.push('/voice-settings')} style={({ pressed }) => [styles.actionBtn, pressed && { opacity: 0.7 }]}>
          <Ionicons name="volume-high-outline" size={22} color={Colors.primary} />
          <Text style={styles.actionText}>Configurar Voz</Text>
          <Ionicons name="chevron-forward" size={20} color={Colors.textMuted} />
        </Pressable>

        {isAdmin && (
          <Pressable onPress={() => router.push('/admin')} style={({ pressed }) => [styles.actionBtn, pressed && { opacity: 0.7 }]}>
            <Ionicons name="settings-outline" size={22} color="#dc2626" />
            <Text style={[styles.actionText, { color: '#dc2626' }]}>Panel Administrador</Text>
            <Ionicons name="chevron-forward" size={20} color={Colors.textMuted} />
          </Pressable>
        )}

        <Pressable onPress={handleLogout} style={styles.logoutBtn}>
          <Ionicons name="log-out-outline" size={20} color="#dc2626" />
          <Text style={styles.logoutText}>Cerrar Sesion</Text>
        </Pressable>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  header: { paddingBottom: 16, paddingHorizontal: 16, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  headerTitle: { color: '#fff', fontSize: 20, fontFamily: 'Nunito_700Bold' },
  content: { padding: 16 },
  avatarSection: { alignItems: 'center', marginBottom: 24 },
  avatar: { width: 96, height: 96, justifyContent: 'center', alignItems: 'center', marginBottom: 10 },
  userName: { fontSize: 22, fontFamily: 'Nunito_800ExtraBold', color: Colors.text },
  userHandle: { fontSize: 14, fontFamily: 'Nunito_400Regular', color: Colors.textSecondary },
  adminBadge: { backgroundColor: '#dc2626', paddingHorizontal: 10, paddingVertical: 3, borderRadius: 10, marginTop: 6 },
  adminBadgeText: { color: '#fff', fontSize: 12, fontFamily: 'Nunito_700Bold' },
  infoCard: { backgroundColor: Colors.surface, borderRadius: 14, padding: 16, marginBottom: 16, gap: 12, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.06, shadowRadius: 4, elevation: 2 },
  infoRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  infoLabel: { flex: 1, fontSize: 14, fontFamily: 'Nunito_600SemiBold', color: Colors.textSecondary },
  infoValue: { fontSize: 14, fontFamily: 'Nunito_700Bold', color: Colors.text },
  actionBtn: { flexDirection: 'row', alignItems: 'center', backgroundColor: Colors.surface, padding: 16, borderRadius: 12, marginBottom: 8, gap: 12, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.04, shadowRadius: 2, elevation: 1 },
  actionText: { flex: 1, fontSize: 15, fontFamily: 'Nunito_600SemiBold', color: Colors.text },
  logoutBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, marginTop: 20, paddingVertical: 14, borderRadius: 12, borderWidth: 1, borderColor: '#fecaca' },
  logoutText: { fontSize: 15, fontFamily: 'Nunito_700Bold', color: '#dc2626' },
});
