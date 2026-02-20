import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, Pressable, Platform, KeyboardAvoidingView, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import Colors from '@/constants/colors';
import { useUser } from '@/lib/UserContext';

export default function RegisterScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { register } = useUser();
  const [fullName, setFullName] = useState('');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const webTopInset = Platform.OS === 'web' ? 67 : 0;

  const handleRegister = async () => {
    if (!username.trim() || !password.trim()) {
      setError('Usuario y contrasena son requeridos');
      return;
    }
    if (password !== confirmPassword) {
      setError('Las contrasenas no coinciden');
      return;
    }
    if (password.length < 4) {
      setError('La contrasena debe tener al menos 4 caracteres');
      return;
    }
    setLoading(true);
    setError('');
    const result = await register(username.trim(), password, fullName.trim() || undefined, email.trim() || undefined);
    setLoading(false);
    if (result.success) {
      router.replace('/');
    } else {
      setError(result.error || 'Error al registrarse');
    }
  };

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <LinearGradient colors={[Colors.primary, Colors.primaryDark]} style={[styles.header, { paddingTop: (insets.top || webTopInset) + 12 }]}>
        <Pressable onPress={() => router.back()} hitSlop={10} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </Pressable>
        <Text style={styles.headerTitle}>Crear Cuenta</Text>
      </LinearGradient>
      <ScrollView contentContainerStyle={styles.content}>
        {error ? <Text style={styles.errorText}>{error}</Text> : null}

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Nombre completo</Text>
          <View style={styles.inputWrapper}>
            <Ionicons name="person-outline" size={20} color={Colors.textMuted} />
            <TextInput style={styles.input} value={fullName} onChangeText={setFullName} placeholder="Juan Perez" />
          </View>
        </View>
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Usuario *</Text>
          <View style={styles.inputWrapper}>
            <Ionicons name="at" size={20} color={Colors.textMuted} />
            <TextInput style={styles.input} value={username} onChangeText={setUsername} placeholder="usuario123" autoCapitalize="none" autoCorrect={false} />
          </View>
        </View>
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Email</Text>
          <View style={styles.inputWrapper}>
            <Ionicons name="mail-outline" size={20} color={Colors.textMuted} />
            <TextInput style={styles.input} value={email} onChangeText={setEmail} placeholder="correo@ejemplo.com" keyboardType="email-address" autoCapitalize="none" />
          </View>
        </View>
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Contrasena *</Text>
          <View style={styles.inputWrapper}>
            <Ionicons name="lock-closed-outline" size={20} color={Colors.textMuted} />
            <TextInput style={styles.input} value={password} onChangeText={setPassword} placeholder="Minimo 4 caracteres" secureTextEntry />
          </View>
        </View>
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Confirmar Contrasena *</Text>
          <View style={styles.inputWrapper}>
            <Ionicons name="lock-closed-outline" size={20} color={Colors.textMuted} />
            <TextInput style={styles.input} value={confirmPassword} onChangeText={setConfirmPassword} placeholder="Repite tu contrasena" secureTextEntry />
          </View>
        </View>

        <Pressable onPress={handleRegister} disabled={loading} style={({ pressed }) => [styles.btn, pressed && { opacity: 0.8 }, loading && { opacity: 0.6 }]}>
          <Text style={styles.btnText}>{loading ? 'Creando cuenta...' : 'Registrarse'}</Text>
        </Pressable>

        <View style={styles.loginRow}>
          <Text style={styles.loginText}>Ya tienes cuenta? </Text>
          <Pressable onPress={() => router.replace('/login')}>
            <Text style={styles.loginLink}>Inicia Sesion</Text>
          </Pressable>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  header: { paddingBottom: 20, paddingHorizontal: 16, flexDirection: 'row', alignItems: 'center', gap: 12 },
  backBtn: { padding: 4 },
  headerTitle: { color: '#fff', fontSize: 20, fontFamily: 'Nunito_700Bold' },
  content: { padding: 24 },
  errorText: { color: '#dc2626', fontSize: 14, fontFamily: 'Nunito_600SemiBold', marginBottom: 12, textAlign: 'center' },
  inputGroup: { marginBottom: 14 },
  label: { fontSize: 14, fontFamily: 'Nunito_600SemiBold', color: Colors.text, marginBottom: 6 },
  inputWrapper: { flexDirection: 'row', alignItems: 'center', backgroundColor: Colors.surface, borderRadius: 12, borderWidth: 1, borderColor: Colors.border, paddingHorizontal: 14, gap: 10 },
  input: { flex: 1, paddingVertical: 14, fontSize: 16, fontFamily: 'Nunito_400Regular', color: Colors.text },
  btn: { backgroundColor: Colors.primary, paddingVertical: 16, borderRadius: 14, alignItems: 'center', marginTop: 8 },
  btnText: { color: '#fff', fontSize: 17, fontFamily: 'Nunito_700Bold' },
  loginRow: { flexDirection: 'row', justifyContent: 'center', marginTop: 20 },
  loginText: { fontSize: 14, fontFamily: 'Nunito_400Regular', color: Colors.textSecondary },
  loginLink: { fontSize: 14, fontFamily: 'Nunito_700Bold', color: Colors.primary },
});
