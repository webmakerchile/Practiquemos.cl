import React, { useState } from 'react';
import {
  View, Text, StyleSheet, TextInput, Pressable,
  Platform, KeyboardAvoidingView, ScrollView, Image,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { FadeInRight, FadeOutLeft, ZoomIn } from 'react-native-reanimated';
import Colors from '@/constants/colors';
import { useUser } from '@/lib/UserContext';
import { licenseTypes } from '@/lib/mockDatabase';
import { apiRequest } from '@/lib/query-client';

const STEPS = ['Tipo de Licencia', 'Tus Datos', 'Crear Cuenta'];

const LICENSE_ICONS: Record<string, string> = {
  clase_b: '🚗',
  clase_c: '🚕',
  clase_d: '🚌',
  clase_e: '🚒',
};

const LICENSE_COLORS: Record<string, string[]> = {
  clase_b: ['#1d4ed8', '#1e40af'],
  clase_c: ['#0891b2', '#0e7490'],
  clase_d: ['#7c3aed', '#6d28d9'],
  clase_e: ['#dc2626', '#b91c1c'],
};

export default function RegisterScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { register, setLicenseType } = useUser();
  const webTopInset = Platform.OS === 'web' ? 67 : 0;

  const [step, setStep] = useState(0);
  const [selectedLicense, setSelectedLicense] = useState('clase_b');
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const goNext = () => {
    setError('');
    if (step === 1) {
      if (!fullName.trim()) {
        setError('Por favor ingresa tu nombre completo');
        return;
      }
    }
    if (step < STEPS.length - 1) setStep(step + 1);
  };

  const goBack = () => {
    setError('');
    if (step > 0) setStep(step - 1);
    else router.back();
  };

  const handleRegister = async () => {
    if (!username.trim()) {
      setError('El nombre de usuario es requerido');
      return;
    }
    if (password.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres');
      return;
    }
    if (password !== confirmPassword) {
      setError('Las contraseñas no coinciden');
      return;
    }
    setLoading(true);
    setError('');
    const result = await register(
      username.trim().toLowerCase(),
      password,
      fullName.trim() || undefined,
      email.trim() || undefined
    );
    if (result.success) {
      setLicenseType(selectedLicense);
      apiRequest('PUT', '/api/profile', { licenseType: selectedLicense }).catch(() => {});
      router.replace('/');
    } else {
      setLoading(false);
      setError(result.error || 'Error al registrarse. Intenta de nuevo.');
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <LinearGradient
        colors={[Colors.primary, Colors.primaryDark]}
        style={[styles.header, { paddingTop: (insets.top || webTopInset) + 12 }]}
      >
        <Pressable onPress={goBack} hitSlop={10} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={22} color="#fff" />
        </Pressable>
        <View style={{ flex: 1, alignItems: 'center' }}>
          <Text style={styles.headerTitle}>Crear Cuenta</Text>
          <Text style={styles.headerStep}>Paso {step + 1} de {STEPS.length}: {STEPS[step]}</Text>
        </View>
        <View style={{ width: 38 }} />
      </LinearGradient>

      <View style={styles.stepsRow}>
        {STEPS.map((_, i) => (
          <View key={i} style={[styles.stepDot, i <= step && styles.stepDotActive, i < step && styles.stepDotDone]}>
            {i < step ? (
              <Ionicons name="checkmark" size={12} color="#fff" />
            ) : (
              <Text style={[styles.stepDotText, i === step && { color: '#fff' }]}>{i + 1}</Text>
            )}
          </View>
        ))}
      </View>

      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        {error ? (
          <Animated.View entering={ZoomIn.duration(200)} style={styles.errorBox}>
            <Ionicons name="alert-circle" size={18} color="#dc2626" />
            <Text style={styles.errorText}>{error}</Text>
          </Animated.View>
        ) : null}

        {step === 0 && (
          <Animated.View entering={FadeInRight.duration(300)} style={styles.stepContent}>
            <Image
              source={require('../assets/images/mascota-cuerpo.png')}
              style={styles.mascotImg}
            />
            <Text style={styles.stepTitle}>¿Qué licencia vas a rendir?</Text>
            <Text style={styles.stepSubtitle}>
              Selecciona el tipo de licencia para personalizar tu práctica
            </Text>
            <View style={styles.licenseGrid}>
              {licenseTypes.map(lt => {
                const isSelected = selectedLicense === lt.id;
                const colors = LICENSE_COLORS[lt.id] || ['#1d4ed8', '#1e40af'];
                return (
                  <Pressable
                    key={lt.id}
                    onPress={() => setSelectedLicense(lt.id)}
                    style={({ pressed }) => [
                      styles.licenseCard,
                      isSelected && styles.licenseCardSelected,
                      pressed && { transform: [{ scale: 0.97 }] },
                    ]}
                  >
                    {isSelected ? (
                      <LinearGradient colors={colors as [string, string]} style={styles.licenseCardInner}>
                        <Text style={styles.licenseEmoji}>{LICENSE_ICONS[lt.id]}</Text>
                        <Text style={[styles.licenseCardName, { color: '#fff' }]}>{lt.name}</Text>
                        <Text style={[styles.licenseCardDesc, { color: 'rgba(255,255,255,0.85)' }]}>{lt.description}</Text>
                        <View style={styles.selectedCheck}>
                          <Ionicons name="checkmark-circle" size={20} color="#fff" />
                        </View>
                      </LinearGradient>
                    ) : (
                      <View style={styles.licenseCardInner}>
                        <Text style={styles.licenseEmoji}>{LICENSE_ICONS[lt.id]}</Text>
                        <Text style={styles.licenseCardName}>{lt.name}</Text>
                        <Text style={styles.licenseCardDesc}>{lt.description}</Text>
                      </View>
                    )}
                  </Pressable>
                );
              })}
            </View>
          </Animated.View>
        )}

        {step === 1 && (
          <Animated.View entering={FadeInRight.duration(300)} style={styles.stepContent}>
            <Image
              source={require('../assets/images/mascota-hablando.png')}
              style={styles.mascotImg}
            />
            <Text style={styles.stepTitle}>Cuéntanos sobre ti</Text>
            <Text style={styles.stepSubtitle}>Tus datos nos ayudan a personalizar tu experiencia</Text>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Nombre Completo *</Text>
              <View style={styles.inputWrapper}>
                <Ionicons name="person" size={20} color={Colors.primary} />
                <TextInput
                  style={styles.input}
                  value={fullName}
                  onChangeText={setFullName}
                  placeholder="Ej: María González"
                  placeholderTextColor={Colors.textMuted}
                  autoCapitalize="words"
                />
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Correo Electrónico</Text>
              <View style={styles.inputWrapper}>
                <Ionicons name="mail" size={20} color={Colors.primary} />
                <TextInput
                  style={styles.input}
                  value={email}
                  onChangeText={setEmail}
                  placeholder="correo@ejemplo.com"
                  placeholderTextColor={Colors.textMuted}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoCorrect={false}
                />
              </View>
            </View>

            <View style={styles.infoBox}>
              <Ionicons name="shield-checkmark" size={16} color={Colors.primary} />
              <Text style={styles.infoText}>
                Tu información está protegida y solo se usa para{'\n'}personalizar tu aprendizaje
              </Text>
            </View>
          </Animated.View>
        )}

        {step === 2 && (
          <Animated.View entering={FadeInRight.duration(300)} style={styles.stepContent}>
            <Image
              source={require('../assets/images/mascota-pensando.png')}
              style={styles.mascotImg}
            />
            <Text style={styles.stepTitle}>Crea tus credenciales</Text>
            <Text style={styles.stepSubtitle}>Elige un usuario y contraseña seguros</Text>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Nombre de Usuario *</Text>
              <View style={styles.inputWrapper}>
                <Ionicons name="at" size={20} color={Colors.primary} />
                <TextInput
                  style={styles.input}
                  value={username}
                  onChangeText={v => setUsername(v.replace(/\s/g, '').toLowerCase())}
                  placeholder="tu_usuario"
                  placeholderTextColor={Colors.textMuted}
                  autoCapitalize="none"
                  autoCorrect={false}
                />
              </View>
              <Text style={styles.hint}>Solo letras, números y guion bajo</Text>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Contraseña *</Text>
              <View style={styles.inputWrapper}>
                <Ionicons name="lock-closed" size={20} color={Colors.primary} />
                <TextInput
                  style={styles.input}
                  value={password}
                  onChangeText={setPassword}
                  placeholder="Mínimo 6 caracteres"
                  placeholderTextColor={Colors.textMuted}
                  secureTextEntry={!showPass}
                />
                <Pressable onPress={() => setShowPass(!showPass)} hitSlop={8}>
                  <Ionicons name={showPass ? 'eye-off' : 'eye'} size={20} color={Colors.textMuted} />
                </Pressable>
              </View>
              {password.length > 0 && (
                <View style={styles.strengthRow}>
                  {[...Array(4)].map((_, i) => (
                    <View
                      key={i}
                      style={[
                        styles.strengthBar,
                        password.length > i * 3 && {
                          backgroundColor: password.length < 6 ? '#f59e0b' : password.length < 10 ? Colors.primary : Colors.success
                        }
                      ]}
                    />
                  ))}
                  <Text style={styles.strengthLabel}>
                    {password.length < 6 ? 'Débil' : password.length < 10 ? 'Buena' : 'Fuerte'}
                  </Text>
                </View>
              )}
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Confirmar Contraseña *</Text>
              <View style={[styles.inputWrapper, confirmPassword && password !== confirmPassword && styles.inputError]}>
                <Ionicons name="lock-closed" size={20} color={
                  confirmPassword ? (password === confirmPassword ? Colors.success : '#dc2626') : Colors.primary
                } />
                <TextInput
                  style={styles.input}
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                  placeholder="Repite tu contraseña"
                  placeholderTextColor={Colors.textMuted}
                  secureTextEntry={!showPass}
                />
                {confirmPassword.length > 0 && (
                  <Ionicons
                    name={password === confirmPassword ? 'checkmark-circle' : 'close-circle'}
                    size={20}
                    color={password === confirmPassword ? Colors.success : '#dc2626'}
                  />
                )}
              </View>
            </View>
          </Animated.View>
        )}
      </ScrollView>

      <View style={[styles.bottomActions, { paddingBottom: Platform.OS === 'web' ? 34 : (insets.bottom || 16) }]}>
        {step < STEPS.length - 1 ? (
          <Pressable
            onPress={goNext}
            style={({ pressed }) => [styles.primaryBtn, pressed && { opacity: 0.85 }]}
          >
            <Text style={styles.primaryBtnText}>Continuar</Text>
            <Ionicons name="arrow-forward" size={20} color="#fff" />
          </Pressable>
        ) : (
          <Pressable
            onPress={handleRegister}
            disabled={loading}
            style={({ pressed }) => [styles.primaryBtn, (pressed || loading) && { opacity: 0.75 }]}
          >
            {loading ? (
              <Text style={styles.primaryBtnText}>Creando cuenta...</Text>
            ) : (
              <>
                <Ionicons name="person-add" size={20} color="#fff" />
                <Text style={styles.primaryBtnText}>¡Crear mi cuenta!</Text>
              </>
            )}
          </Pressable>
        )}

        {step === 0 && (
          <View style={styles.loginRow}>
            <Text style={styles.loginText}>¿Ya tienes cuenta? </Text>
            <Pressable onPress={() => router.replace('/login')}>
              <Text style={styles.loginLink}>Inicia Sesión</Text>
            </Pressable>
          </View>
        )}
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  header: {
    paddingBottom: 16,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
  },
  backBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: 'rgba(255,255,255,0.15)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: { color: '#fff', fontSize: 18, fontFamily: 'Nunito_700Bold' },
  headerStep: { color: 'rgba(255,255,255,0.8)', fontSize: 12, fontFamily: 'Nunito_400Regular', marginTop: 2 },
  stepsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    backgroundColor: Colors.surface,
  },
  stepDot: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: Colors.border,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: Colors.border,
  },
  stepDotActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  stepDotDone: {
    backgroundColor: Colors.success,
    borderColor: Colors.success,
  },
  stepDotText: { fontSize: 12, fontFamily: 'Nunito_700Bold', color: Colors.textMuted },
  content: { padding: 20, flexGrow: 1 },
  errorBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#fef2f2',
    borderRadius: 12,
    padding: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#fecaca',
  },
  errorText: { flex: 1, color: '#dc2626', fontSize: 14, fontFamily: 'Nunito_600SemiBold' },
  stepContent: { gap: 4 },
  mascotImg: { width: 90, height: 90, resizeMode: 'contain', alignSelf: 'center', marginBottom: 4 },
  stepTitle: {
    fontSize: 22,
    fontFamily: 'Nunito_800ExtraBold',
    color: Colors.text,
    textAlign: 'center',
    marginBottom: 6,
  },
  stepSubtitle: {
    fontSize: 14,
    fontFamily: 'Nunito_400Regular',
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 21,
    marginBottom: 20,
  },
  licenseGrid: { gap: 12 },
  licenseCard: {
    borderRadius: 18,
    borderWidth: 2,
    borderColor: Colors.border,
    overflow: 'hidden',
  },
  licenseCardSelected: {
    borderColor: Colors.primary,
  },
  licenseCardInner: {
    padding: 18,
    backgroundColor: Colors.surface,
    position: 'relative',
  },
  licenseEmoji: { fontSize: 28, marginBottom: 6 },
  licenseCardName: {
    fontSize: 17,
    fontFamily: 'Nunito_700Bold',
    color: Colors.text,
    marginBottom: 2,
  },
  licenseCardDesc: {
    fontSize: 13,
    fontFamily: 'Nunito_400Regular',
    color: Colors.textSecondary,
  },
  selectedCheck: { position: 'absolute', top: 12, right: 12 },
  inputGroup: { marginBottom: 16 },
  label: {
    fontSize: 14,
    fontFamily: 'Nunito_700Bold',
    color: Colors.text,
    marginBottom: 8,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: Colors.border,
    paddingHorizontal: 14,
    gap: 10,
  },
  inputError: { borderColor: '#dc2626' },
  input: {
    flex: 1,
    paddingVertical: 14,
    fontSize: 16,
    fontFamily: 'Nunito_400Regular',
    color: Colors.text,
  },
  hint: { fontSize: 12, fontFamily: 'Nunito_400Regular', color: Colors.textMuted, marginTop: 4, paddingLeft: 4 },
  strengthRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 6, paddingLeft: 4 },
  strengthBar: { flex: 1, height: 4, borderRadius: 2, backgroundColor: Colors.border },
  strengthLabel: { fontSize: 12, fontFamily: 'Nunito_600SemiBold', color: Colors.textSecondary, marginLeft: 4 },
  infoBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    backgroundColor: '#eff6ff',
    borderRadius: 12,
    padding: 14,
    marginTop: 12,
    borderWidth: 1,
    borderColor: '#dbeafe',
  },
  infoText: { flex: 1, fontSize: 13, fontFamily: 'Nunito_400Regular', color: '#1e40af', lineHeight: 20 },
  bottomActions: {
    padding: 16,
    paddingTop: 0,
    gap: 12,
    backgroundColor: Colors.background,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  primaryBtn: {
    backgroundColor: Colors.primary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 16,
    borderRadius: 16,
    marginTop: 8,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  primaryBtnText: { color: '#fff', fontSize: 17, fontFamily: 'Nunito_800ExtraBold' },
  loginRow: { flexDirection: 'row', justifyContent: 'center', paddingTop: 4 },
  loginText: { fontSize: 14, fontFamily: 'Nunito_400Regular', color: Colors.textSecondary },
  loginLink: { fontSize: 14, fontFamily: 'Nunito_700Bold', color: Colors.primary },
});
