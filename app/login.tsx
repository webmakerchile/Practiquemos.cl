import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, Pressable, Platform, Alert, KeyboardAvoidingView, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import Colors from '@/constants/colors';
import { useUser } from '@/lib/UserContext';

export default function LoginScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { login } = useUser();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const webTopInset = Platform.OS === 'web' ? 67 : 0;

  const handleLogin = async () => {
    if (!username.trim() || !password.trim()) {
      setError('Completa todos los campos');
      return;
    }
    setLoading(true);
    setError('');
    const result = await login(username.trim(), password);
    setLoading(false);
    if (result.success) {
      router.replace('/');
    } else {
      setError(result.error || 'Error al iniciar sesion');
    }
  };

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <LinearGradient colors={[Colors.primary, Colors.primaryDark]} style={[styles.header, { paddingTop: (insets.top || webTopInset) + 12 }]}>
        <Pressable onPress={() => router.back()} hitSlop={10} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </Pressable>
        <Text style={styles.headerTitle}>Iniciar Sesion</Text>
      </LinearGradient>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.mascotRow}>
          <View style={styles.mascotCircle}>
            <Ionicons name="person" size={48} color={Colors.primary} />
          </View>
        </View>

        {error ? <Text style={styles.errorText}>{error}</Text> : null}

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Usuario</Text>
          <View style={styles.inputWrapper}>
            <Ionicons name="person-outline" size={20} color={Colors.textMuted} />
            <TextInput
              style={styles.input}
              value={username}
              onChangeText={setUsername}
              placeholder="Tu nombre de usuario"
              autoCapitalize="none"
              autoCorrect={false}
            />
          </View>
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Contrasena</Text>
          <View style={styles.inputWrapper}>
            <Ionicons name="lock-closed-outline" size={20} color={Colors.textMuted} />
            <TextInput
              style={styles.input}
              value={password}
              onChangeText={setPassword}
              placeholder="Tu contrasena"
              secureTextEntry
            />
          </View>
        </View>

        <Pressable
          onPress={handleLogin}
          disabled={loading}
          style={({ pressed }) => [styles.loginBtn, pressed && { opacity: 0.8 }, loading && { opacity: 0.6 }]}
        >
          <Text style={styles.loginBtnText}>{loading ? 'Ingresando...' : 'Ingresar'}</Text>
        </Pressable>

        <View style={styles.registerRow}>
          <Text style={styles.registerText}>No tienes cuenta? </Text>
          <Pressable onPress={() => router.replace('/register')}>
            <Text style={styles.registerLink}>Registrate</Text>
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
  content: { padding: 24, alignItems: 'center' },
  mascotRow: { marginBottom: 24 },
  mascotCircle: { width: 90, height: 90, borderRadius: 45, backgroundColor: Colors.surfaceSecondary, justifyContent: 'center', alignItems: 'center', borderWidth: 3, borderColor: Colors.primary },
  errorText: { color: '#dc2626', fontSize: 14, fontFamily: 'Nunito_600SemiBold', marginBottom: 12, textAlign: 'center' },
  inputGroup: { width: '100%', marginBottom: 16 },
  label: { fontSize: 14, fontFamily: 'Nunito_600SemiBold', color: Colors.text, marginBottom: 6 },
  inputWrapper: { flexDirection: 'row', alignItems: 'center', backgroundColor: Colors.surface, borderRadius: 12, borderWidth: 1, borderColor: Colors.border, paddingHorizontal: 14, gap: 10 },
  input: { flex: 1, paddingVertical: 14, fontSize: 16, fontFamily: 'Nunito_400Regular', color: Colors.text },
  loginBtn: { width: '100%', backgroundColor: Colors.primary, paddingVertical: 16, borderRadius: 14, alignItems: 'center', marginTop: 8 },
  loginBtnText: { color: '#fff', fontSize: 17, fontFamily: 'Nunito_700Bold' },
  registerRow: { flexDirection: 'row', marginTop: 20 },
  registerText: { fontSize: 14, fontFamily: 'Nunito_400Regular', color: Colors.textSecondary },
  registerLink: { fontSize: 14, fontFamily: 'Nunito_700Bold', color: Colors.primary },
});
