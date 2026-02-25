import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, Platform, Modal, Image } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Colors from '@/constants/colors';
import { useUser } from '@/lib/UserContext';
import { licenseTypes } from '@/lib/mockDatabase';
import MascotaCopiloto from '@/components/MascotaCopiloto';

interface MenuItemProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  onPress: () => void;
  badge?: string;
  badgeColor?: string;
  locked?: boolean;
}

function MenuItem({ icon, title, description, onPress, badge, badgeColor, locked }: MenuItemProps) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [styles.menuItem, pressed && styles.menuItemPressed]}
    >
      <View style={styles.menuIcon}>{icon}</View>
      <View style={styles.menuContent}>
        <View style={styles.menuTitleRow}>
          <Text style={styles.menuTitle}>{title}</Text>
          {badge && (
            <View style={[styles.badge, { backgroundColor: badgeColor || Colors.success }]}>
              <Text style={styles.badgeText}>{badge}</Text>
            </View>
          )}
          {locked && (
            <Ionicons name="lock-closed" size={14} color={Colors.textMuted} />
          )}
        </View>
        <Text style={styles.menuDescription}>{description}</Text>
      </View>
      <Ionicons name="chevron-forward" size={20} color={Colors.textMuted} />
    </Pressable>
  );
}

export default function HomeScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { user, isLoggedIn, isPremium, canTakeExam, licenseType, setLicenseType, isAdmin } = useUser();
  const [showLicensePicker, setShowLicensePicker] = useState(false);
  const [showDrawer, setShowDrawer] = useState(false);

  const currentLicense = licenseTypes.find(l => l.id === licenseType) || licenseTypes[0];
  const webTopInset = Platform.OS === 'web' ? 67 : 0;

  const startExam = (mode: string) => {
    router.push({ pathname: '/exam', params: { mode, licenseType } });
  };

  return (
    <View style={styles.container}>
      <View style={[styles.header, { paddingTop: (insets.top || webTopInset) + 8 }]}>
        <View style={styles.headerActions}>
          <Pressable onPress={() => setShowDrawer(true)} hitSlop={12} style={styles.headerBtn}>
            <Ionicons name="menu" size={24} color={Colors.text} />
          </Pressable>
          <Pressable onPress={() => router.push(isLoggedIn ? '/perfil' : '/login')} hitSlop={12} style={styles.headerBtn}>
            <Ionicons name="person-circle-outline" size={26} color={Colors.primary} />
          </Pressable>
        </View>

        <View style={styles.logoSection}>
          <Image
            source={require('../assets/images/logo-texto.png')}
            style={styles.logoImg}
            resizeMode="contain"
          />
        </View>

        <View style={styles.welcomeSection}>
          {isLoggedIn && (
            <Text style={styles.welcomeTitle}>
              ¡Hola, {user?.fullName?.split(' ')[0] || user?.username}! 👋
            </Text>
          )}
          <Pressable onPress={() => setShowLicensePicker(true)} style={styles.licenseSelector}>
            <Ionicons name="car-outline" size={15} color={Colors.primary} />
            <Text style={styles.licenseName}>{currentLicense.name} — {currentLicense.description}</Text>
            <Ionicons name="chevron-down" size={15} color={Colors.primary} />
          </Pressable>
          {!isLoggedIn && (
            <View style={styles.authLinks}>
              <Pressable onPress={() => router.push('/login')}>
                <Text style={styles.authLink}>Inicia Sesión</Text>
              </Pressable>
              <Text style={styles.authSeparator}> · </Text>
              <Pressable onPress={() => router.push('/register')}>
                <Text style={styles.authLink}>Regístrate Gratis</Text>
              </Pressable>
            </View>
          )}
        </View>
      </View>

      <ScrollView style={styles.menuList} contentContainerStyle={[styles.menuListContent, { paddingBottom: (Platform.OS === 'web' ? 34 : insets.bottom) + 20 }]}>
        <MascotaCopiloto state="idle" message="Preparemos juntos tu examen de conducir" compact />

        <MenuItem
          icon={<MaterialCommunityIcons name="school" size={28} color={Colors.primary} />}
          title="Mi Curso"
          description="Almacena todos tus avances para que sepas cuando estas preparad@ para el examen teorico."
          onPress={() => isLoggedIn ? router.push('/mi-curso') : router.push('/login')}
          locked={!isLoggedIn}
        />
        <MenuItem
          icon={<MaterialCommunityIcons name="shuffle-variant" size={28} color={Colors.primary} />}
          title="Test Aleatorio Diario"
          description="Test de conducir generado de forma aleatoria con preguntas del examen oficial y sus explicaciones."
          onPress={() => startExam('daily')}
          badge={!isLoggedIn ? 'Sin Registro' : undefined}
          badgeColor={Colors.success}
        />
        <MenuItem
          icon={<Ionicons name="book-outline" size={28} color={Colors.primary} />}
          title="Temario y Libros"
          description="Resumen y manual del Libro de la Conduccion en Chile. Todo el contenido para aprobar el examen."
          onPress={() => router.push('/temario')}
        />
        <MenuItem
          icon={<MaterialCommunityIcons name="brain" size={28} color={Colors.accent} />}
          title="Test Inteligente"
          description="Mediante un algoritmo, te mostrara las preguntas mas convenientes para agilizar tu aprendizaje."
          onPress={() => isPremium ? startExam('smart') : router.push('/plans')}
          locked={!isPremium}
        />
        <MenuItem
          icon={<Ionicons name="happy-outline" size={28} color={Colors.success} />}
          title="Test Facil"
          description="El test con las preguntas mas FACILES del examen."
          onPress={() => startExam('easy')}
        />
        <MenuItem
          icon={<Ionicons name="flame-outline" size={28} color="#dc2626" />}
          title="Test Dificil"
          description="El test con las preguntas mas DIFICILES del examen."
          onPress={() => startExam('hard')}
        />
        <MenuItem
          icon={<Ionicons name="layers-outline" size={28} color={Colors.primary} />}
          title="Test por Categoria"
          description="Practica preguntas organizadas por tema: Ley de Transito, Señalizacion, Mecanica y mas."
          onPress={() => startExam('category')}
        />
        <MenuItem
          icon={<Ionicons name="star-outline" size={28} color={Colors.accent} />}
          title="Mis Favoritos"
          description="Repasa las preguntas que has marcado como favoritas para reforzar tu estudio."
          onPress={() => isLoggedIn ? router.push('/favoritos') : router.push('/login')}
          locked={!isLoggedIn}
        />
        <MenuItem
          icon={<Ionicons name="diamond-outline" size={28} color="#7c3aed" />}
          title="Packs Premium"
          description="Acceso ilimitado a todos los examenes, explicaciones detalladas y estadisticas avanzadas."
          onPress={() => router.push('/plans')}
        />
        <MenuItem
          icon={<Ionicons name="time-outline" size={28} color={Colors.primary} />}
          title="Mi Historial"
          description="Revisa todos tus examenes anteriores y tu progreso a lo largo del tiempo."
          onPress={() => isLoggedIn ? router.push('/history') : router.push('/login')}
          locked={!isLoggedIn}
        />
        <MenuItem
          icon={<Ionicons name="mail-outline" size={28} color={Colors.success} />}
          title="Contacto"
          description="Si tienes alguna duda, incidencia o quieres compartir tus preguntas del examen."
          onPress={() => router.push('/contacto')}
        />
        <MenuItem
          icon={<Ionicons name="information-circle-outline" size={28} color={Colors.primary} />}
          title="Quienes Somos"
          description="Nuestra mision es ayudar a obtener la licencia de conducir a todas las personas."
          onPress={() => router.push('/nosotros')}
        />
        {isAdmin && (
          <MenuItem
            icon={<Ionicons name="settings-outline" size={28} color="#dc2626" />}
            title="Panel Administrador"
            description="Gestionar usuarios, planes y configuracion del sistema."
            onPress={() => router.push('/admin')}
            badge="Admin"
            badgeColor="#dc2626"
          />
        )}
      </ScrollView>

      <Modal visible={showLicensePicker} transparent animationType="fade">
        <Pressable style={styles.modalOverlay} onPress={() => setShowLicensePicker(false)}>
          <View style={styles.licenseModal}>
            <Text style={styles.licenseModalTitle}>SELECCIONA TU LICENCIA</Text>
            {licenseTypes.map(lt => (
              <Pressable
                key={lt.id}
                onPress={() => { setLicenseType(lt.id); setShowLicensePicker(false); }}
                style={[styles.licenseOption, licenseType === lt.id && styles.licenseOptionActive]}
              >
                <Text style={[styles.licenseOptionText, licenseType === lt.id && styles.licenseOptionTextActive]}>{lt.name}</Text>
                <Text style={styles.licenseOptionDesc}>{lt.description}</Text>
              </Pressable>
            ))}
          </View>
        </Pressable>
      </Modal>

      <Modal visible={showDrawer} transparent animationType="slide">
        <View style={styles.drawerOverlay}>
          <View style={[styles.drawer, { paddingTop: (insets.top || webTopInset) + 16 }]}>
            <View style={styles.drawerHeader}>
              {isLoggedIn ? (
                <View>
                  <Text style={styles.drawerUser}>{user?.fullName || user?.username}</Text>
                  <Text style={styles.drawerPlan}>{isPremium ? 'Plan Premium' : 'Plan Gratuito'}</Text>
                </View>
              ) : (
                <View>
                  <Pressable onPress={() => { setShowDrawer(false); router.push('/login'); }}>
                    <View style={styles.drawerLoginBtn}>
                      <Text style={styles.drawerLoginText}>Login</Text>
                    </View>
                  </Pressable>
                  <Pressable onPress={() => { setShowDrawer(false); router.push('/register'); }}>
                    <Text style={styles.drawerRegisterText}>No tienes cuenta? Registro</Text>
                  </Pressable>
                </View>
              )}
              <Pressable onPress={() => setShowDrawer(false)} hitSlop={10}>
                <Ionicons name="close" size={28} color={Colors.text} />
              </Pressable>
            </View>
            <View style={styles.drawerDivider} />
            {[
              { icon: 'home-outline' as const, label: 'Home', route: '/' },
              ...(isLoggedIn ? [{ icon: 'person-outline' as const, label: 'Mi Perfil', route: '/perfil' }] : []),
              { icon: 'book-outline' as const, label: 'Temario', route: '/temario' },
              { icon: 'diamond-outline' as const, label: 'Planes', route: '/plans' },
              { icon: 'mail-outline' as const, label: 'Contacto', route: '/contacto' },
            ].map(item => (
              <Pressable key={item.label} style={styles.drawerItem} onPress={() => { setShowDrawer(false); router.push(item.route as any); }}>
                <Ionicons name={item.icon} size={22} color={Colors.text} />
                <Text style={styles.drawerItemText}>{item.label}</Text>
              </Pressable>
            ))}
            {isAdmin && (
              <Pressable style={styles.drawerItem} onPress={() => { setShowDrawer(false); router.push('/admin'); }}>
                <Ionicons name="settings-outline" size={22} color="#dc2626" />
                <Text style={[styles.drawerItemText, { color: '#dc2626' }]}>Administrador</Text>
              </Pressable>
            )}
          </View>
          <Pressable style={styles.drawerBackdrop} onPress={() => setShowDrawer(false)} />
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  header: { backgroundColor: '#fff', paddingBottom: 16, paddingHorizontal: 16, borderBottomWidth: 1, borderBottomColor: Colors.border, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 6, elevation: 3 },
  headerActions: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 },
  headerBtn: { padding: 4 },
  logoSection: { alignItems: 'center', paddingVertical: 8 },
  logoImg: { height: 110, width: '100%', maxWidth: 380 },
  licenseSelector: { flexDirection: 'row', alignItems: 'center', gap: 5, backgroundColor: Colors.primaryLight + '30', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20, marginTop: 6, borderWidth: 1, borderColor: Colors.primary + '30' },
  licenseName: { color: Colors.primary, fontSize: 13, fontFamily: 'Nunito_600SemiBold', flexShrink: 1 },
  welcomeSection: { alignItems: 'center' },
  welcomeTitle: { color: Colors.text, fontSize: 20, fontFamily: 'Nunito_800ExtraBold', textAlign: 'center', marginBottom: 2 },
  authLinks: { flexDirection: 'row', alignItems: 'center', marginTop: 6 },
  authLink: { color: Colors.accent, fontSize: 14, fontFamily: 'Nunito_700Bold', textDecorationLine: 'underline' },
  authSeparator: { color: Colors.textMuted, fontSize: 14, fontFamily: 'Nunito_400Regular' },
  menuList: { flex: 1 },
  menuListContent: { paddingTop: 8 },
  menuItem: { flexDirection: 'row', alignItems: 'center', backgroundColor: Colors.surface, marginHorizontal: 12, marginVertical: 5, padding: 16, borderRadius: 14, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.06, shadowRadius: 4, elevation: 2 },
  menuItemPressed: { opacity: 0.7, transform: [{ scale: 0.98 }] },
  menuIcon: { width: 44, height: 44, borderRadius: 22, backgroundColor: Colors.surfaceSecondary, justifyContent: 'center', alignItems: 'center', marginRight: 12 },
  menuContent: { flex: 1, marginRight: 8 },
  menuTitleRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 3 },
  menuTitle: { fontSize: 16, fontFamily: 'Nunito_700Bold', color: Colors.text },
  menuDescription: { fontSize: 13, fontFamily: 'Nunito_400Regular', color: Colors.textSecondary, lineHeight: 18 },
  badge: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: 10 },
  badgeText: { color: '#fff', fontSize: 10, fontFamily: 'Nunito_700Bold' },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center' },
  licenseModal: { backgroundColor: '#1e293b', borderRadius: 20, padding: 20, width: '85%', maxWidth: 340 },
  licenseModalTitle: { color: '#fff', fontSize: 14, fontFamily: 'Nunito_700Bold', marginBottom: 16, textAlign: 'center', letterSpacing: 1 },
  licenseOption: { paddingVertical: 14, paddingHorizontal: 16, borderRadius: 12, marginBottom: 4 },
  licenseOptionActive: { backgroundColor: Colors.primary },
  licenseOptionText: { color: '#fff', fontSize: 17, fontFamily: 'Nunito_700Bold' },
  licenseOptionTextActive: { color: '#fff' },
  licenseOptionDesc: { color: 'rgba(255,255,255,0.6)', fontSize: 12, fontFamily: 'Nunito_400Regular', marginTop: 2 },
  drawerOverlay: { flex: 1, flexDirection: 'row' },
  drawer: { width: '75%', maxWidth: 300, backgroundColor: Colors.surface, paddingHorizontal: 16, paddingBottom: 40, shadowColor: '#000', shadowOffset: { width: 2, height: 0 }, shadowOpacity: 0.2, shadowRadius: 10, elevation: 10 },
  drawerBackdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)' },
  drawerHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 },
  drawerUser: { fontSize: 18, fontFamily: 'Nunito_700Bold', color: Colors.text },
  drawerPlan: { fontSize: 13, fontFamily: 'Nunito_400Regular', color: Colors.textSecondary },
  drawerLoginBtn: { backgroundColor: Colors.primary, paddingHorizontal: 24, paddingVertical: 8, borderRadius: 20, marginBottom: 6 },
  drawerLoginText: { color: '#fff', fontSize: 15, fontFamily: 'Nunito_700Bold', textAlign: 'center' },
  drawerRegisterText: { color: Colors.primary, fontSize: 13, fontFamily: 'Nunito_400Regular', textAlign: 'center' },
  drawerDivider: { height: 1, backgroundColor: Colors.border, marginBottom: 12 },
  drawerItem: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 14 },
  drawerItemText: { fontSize: 16, fontFamily: 'Nunito_600SemiBold', color: Colors.text },
});
