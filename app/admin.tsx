import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, Platform, Modal, TextInput, Alert, FlatList } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import Colors from '@/constants/colors';
import { useUser } from '@/lib/UserContext';
import { apiRequest } from '@/lib/query-client';

interface AdminUser {
  id: string;
  username: string;
  fullName: string | null;
  email: string | null;
  role: string;
  plan: string;
  planExpiry: string | null;
  createdAt: string;
  lastLogin: string | null;
}

export default function AdminScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { isAdmin } = useUser();
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState<AdminUser | null>(null);
  const [formData, setFormData] = useState({ username: '', password: '', fullName: '', email: '', plan: 'free', role: 'user' });
  const [editData, setEditData] = useState({ password: '', plan: '', role: '' });
  const [formError, setFormError] = useState('');
  const webTopInset = Platform.OS === 'web' ? 67 : 0;

  const loadUsers = useCallback(async () => {
    try {
      const res = await apiRequest('GET', '/api/admin/users');
      const data = await res.json();
      setUsers(data);
    } catch (err) {
      console.error('Failed to load users', err);
    }
    setLoading(false);
  }, []);

  useEffect(() => { loadUsers(); }, [loadUsers]);

  const handleCreate = async () => {
    if (!formData.username || !formData.password) {
      setFormError('Usuario y contrasena son requeridos');
      return;
    }
    try {
      await apiRequest('POST', '/api/admin/users', formData);
      setShowCreateModal(false);
      setFormData({ username: '', password: '', fullName: '', email: '', plan: 'free', role: 'user' });
      setFormError('');
      loadUsers();
    } catch (err: any) {
      setFormError(err.message?.includes('400') ? 'El usuario ya existe' : 'Error al crear usuario');
    }
  };

  const handleEdit = async () => {
    if (!selectedUser) return;
    const updates: any = {};
    if (editData.password) updates.password = editData.password;
    if (editData.plan) updates.plan = editData.plan;
    if (editData.role) updates.role = editData.role;
    try {
      await apiRequest('PUT', `/api/admin/users/${selectedUser.id}`, updates);
      setShowEditModal(false);
      setSelectedUser(null);
      setEditData({ password: '', plan: '', role: '' });
      loadUsers();
    } catch (err: any) {
      setFormError('Error al actualizar usuario');
    }
  };

  const handleDelete = async (userId: string) => {
    try {
      await apiRequest('DELETE', `/api/admin/users/${userId}`);
      loadUsers();
    } catch (err: any) {
      Alert.alert('Error', 'No se pudo eliminar el usuario');
    }
  };

  const openEdit = (u: AdminUser) => {
    setSelectedUser(u);
    setEditData({ password: '', plan: u.plan, role: u.role });
    setFormError('');
    setShowEditModal(true);
  };

  const getPlanLabel = (plan: string) => {
    if (plan === 'premium_10') return 'Premium 10 dias';
    if (plan === 'premium_30') return 'Premium 30 dias';
    return 'Gratuito';
  };

  if (!isAdmin) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <Text style={styles.noAccess}>Acceso denegado</Text>
        <Pressable onPress={() => router.back()}>
          <Text style={styles.backLink}>Volver</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <LinearGradient colors={['#dc2626', '#b91c1c']} style={[styles.header, { paddingTop: (insets.top || webTopInset) + 12 }]}>
        <Pressable onPress={() => router.back()} hitSlop={10}>
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </Pressable>
        <Text style={styles.headerTitle}>Panel Administrador</Text>
        <Pressable onPress={() => { setFormError(''); setShowCreateModal(true); }}>
          <Ionicons name="add-circle" size={28} color="#fff" />
        </Pressable>
      </LinearGradient>

      <Pressable onPress={() => router.push('/admin-questions')} style={styles.questionsBtn}>
        <Ionicons name="document-text-outline" size={22} color="#fff" />
        <Text style={styles.questionsBtnText}>Gestionar Preguntas</Text>
        <Ionicons name="chevron-forward" size={20} color="rgba(255,255,255,0.7)" />
      </Pressable>

      <View style={styles.statsRow}>
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>{users.length}</Text>
          <Text style={styles.statLabel}>Usuarios</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>{users.filter(u => u.plan !== 'free').length}</Text>
          <Text style={styles.statLabel}>Premium</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>{users.filter(u => u.role === 'admin').length}</Text>
          <Text style={styles.statLabel}>Admins</Text>
        </View>
      </View>

      <FlatList
        data={users}
        keyExtractor={item => item.id}
        contentContainerStyle={{ paddingBottom: (Platform.OS === 'web' ? 34 : insets.bottom) + 20, paddingHorizontal: 12 }}
        renderItem={({ item }) => (
          <View style={styles.userCard}>
            <View style={styles.userInfo}>
              <View style={styles.userRow}>
                <Text style={styles.userName}>{item.username}</Text>
                {item.role === 'admin' && (
                  <View style={styles.adminBadge}><Text style={styles.adminBadgeText}>Admin</Text></View>
                )}
              </View>
              {item.fullName && <Text style={styles.userDetail}>{item.fullName}</Text>}
              {item.email && <Text style={styles.userDetail}>{item.email}</Text>}
              <Text style={styles.userPlan}>{getPlanLabel(item.plan)}</Text>
            </View>
            <View style={styles.userActions}>
              <Pressable onPress={() => openEdit(item)} style={styles.actionBtn}>
                <Ionicons name="create-outline" size={20} color={Colors.primary} />
              </Pressable>
              <Pressable onPress={() => handleDelete(item.id)} style={styles.actionBtn}>
                <Ionicons name="trash-outline" size={20} color="#dc2626" />
              </Pressable>
            </View>
          </View>
        )}
        ListEmptyComponent={<Text style={styles.emptyText}>{loading ? 'Cargando...' : 'No hay usuarios'}</Text>}
      />

      <Modal visible={showCreateModal} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Crear Usuario</Text>
              <Pressable onPress={() => setShowCreateModal(false)}><Ionicons name="close" size={24} color={Colors.text} /></Pressable>
            </View>
            {formError ? <Text style={styles.formError}>{formError}</Text> : null}
            <TextInput style={styles.formInput} placeholder="Usuario *" value={formData.username} onChangeText={v => setFormData(p => ({ ...p, username: v }))} autoCapitalize="none" />
            <TextInput style={styles.formInput} placeholder="Contrasena *" value={formData.password} onChangeText={v => setFormData(p => ({ ...p, password: v }))} secureTextEntry />
            <TextInput style={styles.formInput} placeholder="Nombre completo" value={formData.fullName} onChangeText={v => setFormData(p => ({ ...p, fullName: v }))} />
            <TextInput style={styles.formInput} placeholder="Email" value={formData.email} onChangeText={v => setFormData(p => ({ ...p, email: v }))} keyboardType="email-address" autoCapitalize="none" />
            <Text style={styles.formLabel}>Plan</Text>
            <View style={styles.planSelector}>
              {(['free', 'premium_10', 'premium_30'] as const).map(p => (
                <Pressable key={p} onPress={() => setFormData(prev => ({ ...prev, plan: p }))} style={[styles.planOption, formData.plan === p && styles.planOptionActive]}>
                  <Text style={[styles.planOptionText, formData.plan === p && styles.planOptionTextActive]}>{getPlanLabel(p)}</Text>
                </Pressable>
              ))}
            </View>
            <Text style={styles.formLabel}>Rol</Text>
            <View style={styles.planSelector}>
              {['user', 'admin'].map(r => (
                <Pressable key={r} onPress={() => setFormData(prev => ({ ...prev, role: r }))} style={[styles.planOption, formData.role === r && styles.planOptionActive]}>
                  <Text style={[styles.planOptionText, formData.role === r && styles.planOptionTextActive]}>{r === 'admin' ? 'Administrador' : 'Usuario'}</Text>
                </Pressable>
              ))}
            </View>
            <Pressable onPress={handleCreate} style={styles.createBtn}>
              <Text style={styles.createBtnText}>Crear Usuario</Text>
            </Pressable>
          </View>
        </View>
      </Modal>

      <Modal visible={showEditModal} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Editar: {selectedUser?.username}</Text>
              <Pressable onPress={() => setShowEditModal(false)}><Ionicons name="close" size={24} color={Colors.text} /></Pressable>
            </View>
            {formError ? <Text style={styles.formError}>{formError}</Text> : null}
            <Text style={styles.formLabel}>Nueva Contrasena (dejar vacio para no cambiar)</Text>
            <TextInput style={styles.formInput} placeholder="Nueva contrasena" value={editData.password} onChangeText={v => setEditData(p => ({ ...p, password: v }))} secureTextEntry />
            <Text style={styles.formLabel}>Plan</Text>
            <View style={styles.planSelector}>
              {(['free', 'premium_10', 'premium_30'] as const).map(p => (
                <Pressable key={p} onPress={() => setEditData(prev => ({ ...prev, plan: p }))} style={[styles.planOption, editData.plan === p && styles.planOptionActive]}>
                  <Text style={[styles.planOptionText, editData.plan === p && styles.planOptionTextActive]}>{getPlanLabel(p)}</Text>
                </Pressable>
              ))}
            </View>
            <Text style={styles.formLabel}>Rol</Text>
            <View style={styles.planSelector}>
              {['user', 'admin'].map(r => (
                <Pressable key={r} onPress={() => setEditData(prev => ({ ...prev, role: r }))} style={[styles.planOption, editData.role === r && styles.planOptionActive]}>
                  <Text style={[styles.planOptionText, editData.role === r && styles.planOptionTextActive]}>{r === 'admin' ? 'Administrador' : 'Usuario'}</Text>
                </Pressable>
              ))}
            </View>
            <Pressable onPress={handleEdit} style={styles.createBtn}>
              <Text style={styles.createBtnText}>Guardar Cambios</Text>
            </Pressable>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  header: { paddingBottom: 16, paddingHorizontal: 16, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  headerTitle: { color: '#fff', fontSize: 20, fontFamily: 'Nunito_700Bold' },
  noAccess: { fontSize: 18, fontFamily: 'Nunito_700Bold', color: Colors.text },
  backLink: { fontSize: 16, fontFamily: 'Nunito_600SemiBold', color: Colors.primary, marginTop: 12 },
  statsRow: { flexDirection: 'row', padding: 12, gap: 8 },
  statCard: { flex: 1, backgroundColor: Colors.surface, borderRadius: 12, padding: 12, alignItems: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.06, shadowRadius: 3, elevation: 2 },
  statNumber: { fontSize: 24, fontFamily: 'Nunito_800ExtraBold', color: Colors.primary },
  statLabel: { fontSize: 12, fontFamily: 'Nunito_600SemiBold', color: Colors.textSecondary },
  userCard: { flexDirection: 'row', backgroundColor: Colors.surface, borderRadius: 12, padding: 14, marginVertical: 4, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.06, shadowRadius: 3, elevation: 2 },
  userInfo: { flex: 1 },
  userRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  userName: { fontSize: 16, fontFamily: 'Nunito_700Bold', color: Colors.text },
  adminBadge: { backgroundColor: '#dc2626', paddingHorizontal: 6, paddingVertical: 1, borderRadius: 6 },
  adminBadgeText: { color: '#fff', fontSize: 10, fontFamily: 'Nunito_700Bold' },
  userDetail: { fontSize: 13, fontFamily: 'Nunito_400Regular', color: Colors.textSecondary },
  userPlan: { fontSize: 13, fontFamily: 'Nunito_600SemiBold', color: Colors.primary, marginTop: 2 },
  userActions: { justifyContent: 'center', gap: 8 },
  actionBtn: { padding: 6 },
  emptyText: { textAlign: 'center', fontSize: 14, fontFamily: 'Nunito_400Regular', color: Colors.textMuted, marginTop: 40 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', padding: 20 },
  modalContent: { backgroundColor: Colors.surface, borderRadius: 16, padding: 20, maxHeight: '85%' },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  modalTitle: { fontSize: 18, fontFamily: 'Nunito_700Bold', color: Colors.text },
  formError: { color: '#dc2626', fontSize: 13, fontFamily: 'Nunito_600SemiBold', marginBottom: 8 },
  formInput: { backgroundColor: Colors.surfaceSecondary, borderRadius: 10, padding: 14, fontSize: 15, fontFamily: 'Nunito_400Regular', marginBottom: 10, borderWidth: 1, borderColor: Colors.border },
  formLabel: { fontSize: 13, fontFamily: 'Nunito_600SemiBold', color: Colors.text, marginBottom: 6, marginTop: 4 },
  planSelector: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginBottom: 10 },
  planOption: { paddingHorizontal: 12, paddingVertical: 8, borderRadius: 8, backgroundColor: Colors.surfaceSecondary, borderWidth: 1, borderColor: Colors.border },
  planOptionActive: { backgroundColor: Colors.primary, borderColor: Colors.primary },
  planOptionText: { fontSize: 13, fontFamily: 'Nunito_600SemiBold', color: Colors.text },
  planOptionTextActive: { color: '#fff' },
  createBtn: { backgroundColor: Colors.primary, paddingVertical: 14, borderRadius: 12, alignItems: 'center', marginTop: 8 },
  createBtnText: { color: '#fff', fontSize: 16, fontFamily: 'Nunito_700Bold' },
  questionsBtn: { flexDirection: 'row', alignItems: 'center', backgroundColor: Colors.primary, marginHorizontal: 12, marginTop: 12, padding: 14, borderRadius: 12, gap: 10 },
  questionsBtnText: { flex: 1, color: '#fff', fontSize: 16, fontFamily: 'Nunito_700Bold' },
});
