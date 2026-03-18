import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, Platform, Modal, TextInput, Alert, FlatList, ActivityIndicator } from 'react-native';
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
  licenseType: string | null;
  createdAt: string;
  lastLogin: string | null;
}

type FilterType = 'all' | 'free' | 'premium' | 'admin';

const LICENSE_LABELS: Record<string, string> = {
  clase_b: 'Clase B',
  clase_a2: 'Clase A2',
  clase_a4: 'Clase A4',
  clase_c: 'Clase C',
  clase_d: 'Clase D',
  clase_e: 'Clase E',
};

const LICENSE_COLORS: Record<string, string> = {
  clase_b: '#1d4ed8',
  clase_a2: '#7c3aed',
  clase_a4: '#ea580c',
  clase_c: '#16a34a',
  clase_d: '#d97706',
  clase_e: '#dc2626',
};

export default function AdminScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { isAdmin } = useUser();
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<AdminUser | null>(null);
  const [selectedUser, setSelectedUser] = useState<AdminUser | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState<FilterType>('all');
  const [formData, setFormData] = useState({ username: '', password: '', fullName: '', email: '', plan: 'free', role: 'user', licenseType: 'clase_b' });
  const [editData, setEditData] = useState({ password: '', fullName: '', email: '', plan: '', role: '', licenseType: '' });
  const [formError, setFormError] = useState('');
  const [saving, setSaving] = useState(false);
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

  const filteredUsers = users.filter(u => {
    const matchesSearch = !searchQuery ||
      u.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (u.fullName && u.fullName.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (u.email && u.email.toLowerCase().includes(searchQuery.toLowerCase()));

    if (!matchesSearch) return false;

    switch (activeFilter) {
      case 'free': return u.plan === 'free';
      case 'premium': return u.plan !== 'free';
      case 'admin': return u.role === 'admin';
      default: return true;
    }
  });

  const handleCreate = async () => {
    if (!formData.username || !formData.password) {
      setFormError('Usuario y contraseña son requeridos');
      return;
    }
    setSaving(true);
    try {
      await apiRequest('POST', '/api/admin/users', formData);
      setShowCreateModal(false);
      setFormData({ username: '', password: '', fullName: '', email: '', plan: 'free', role: 'user', licenseType: 'clase_b' });
      setFormError('');
      loadUsers();
    } catch (err: any) {
      try {
        const errText = err.message || '';
        const jsonStart = errText.indexOf('{');
        if (jsonStart >= 0) {
          const data = JSON.parse(errText.substring(jsonStart));
          setFormError(data?.message || 'Error al crear usuario');
        } else {
          setFormError('Error al crear usuario');
        }
      } catch {
        setFormError('Error al crear usuario');
      }
    }
    setSaving(false);
  };

  const handleEdit = async () => {
    if (!selectedUser) return;
    const updates: any = {};
    if (editData.password) updates.password = editData.password;
    if (editData.plan && editData.plan !== selectedUser.plan) updates.plan = editData.plan;
    if (editData.role && editData.role !== selectedUser.role) updates.role = editData.role;
    if (editData.fullName !== (selectedUser.fullName || '')) updates.fullName = editData.fullName;
    if (editData.email !== (selectedUser.email || '')) updates.email = editData.email;

    if (Object.keys(updates).length === 0) {
      setShowEditModal(false);
      return;
    }

    setSaving(true);
    try {
      await apiRequest('PUT', `/api/admin/users/${selectedUser.id}`, updates);
      setShowEditModal(false);
      setSelectedUser(null);
      setFormError('');
      loadUsers();
    } catch (err: any) {
      try {
        const errText = err.message || '';
        const jsonStart = errText.indexOf('{');
        if (jsonStart >= 0) {
          const data = JSON.parse(errText.substring(jsonStart));
          setFormError(data?.message || 'Error al actualizar usuario');
        } else {
          setFormError('Error al actualizar usuario');
        }
      } catch {
        setFormError('Error al actualizar usuario');
      }
    }
    setSaving(false);
  };

  const confirmDelete = (user: AdminUser) => {
    setDeleteTarget(user);
    setShowDeleteConfirm(true);
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      await apiRequest('DELETE', `/api/admin/users/${deleteTarget.id}`);
      setShowDeleteConfirm(false);
      setDeleteTarget(null);
      loadUsers();
    } catch (err: any) {
      Alert.alert('Error', 'No se pudo eliminar el usuario');
      setShowDeleteConfirm(false);
    }
  };

  const openEdit = (u: AdminUser) => {
    setSelectedUser(u);
    setEditData({
      password: '',
      fullName: u.fullName || '',
      email: u.email || '',
      plan: u.plan,
      role: u.role,
      licenseType: u.licenseType || 'clase_b',
    });
    setFormError('');
    setShowEditModal(true);
  };

  const openDetail = (u: AdminUser) => {
    setSelectedUser(u);
    setShowDetailModal(true);
  };

  const getPlanLabel = (plan: string) => {
    if (plan === 'premium_10') return 'Premium 10 días';
    if (plan === 'premium_30') return 'Premium 30 días';
    return 'Gratuito';
  };

  const getPlanColor = (plan: string) => {
    if (plan === 'premium_10') return '#f59e0b';
    if (plan === 'premium_30') return '#16a34a';
    return Colors.textSecondary;
  };

  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return 'Nunca';
    const d = new Date(dateStr);
    return d.toLocaleDateString('es-CL', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' });
  };

  const formatExpiryDate = (dateStr: string | null) => {
    if (!dateStr) return null;
    const d = new Date(dateStr);
    const now = new Date();
    const diffDays = Math.ceil((d.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    const formatted = d.toLocaleDateString('es-CL', { day: '2-digit', month: '2-digit', year: 'numeric' });
    if (diffDays < 0) return `Expirado (${formatted})`;
    if (diffDays === 0) return `Expira hoy`;
    return `${diffDays} días restantes (${formatted})`;
  };

  const getExpiryColor = (dateStr: string | null) => {
    if (!dateStr) return Colors.textSecondary;
    const d = new Date(dateStr);
    const now = new Date();
    const diffDays = Math.ceil((d.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    if (diffDays < 0) return '#dc2626';
    if (diffDays <= 3) return '#f59e0b';
    return '#16a34a';
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

  const premiumCount = users.filter(u => u.plan !== 'free').length;
  const adminCount = users.filter(u => u.role === 'admin').length;
  const activeCount = users.filter(u => {
    if (!u.planExpiry) return u.plan !== 'free';
    return new Date(u.planExpiry) > new Date();
  }).length;

  return (
    <View style={styles.container}>
      <LinearGradient colors={['#dc2626', '#b91c1c']} style={[styles.header, { paddingTop: (insets.top || webTopInset) + 12 }]}>
        <Pressable onPress={() => router.back()} hitSlop={10}>
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </Pressable>
        <Text style={styles.headerTitle}>Panel Administrador</Text>
        <Pressable onPress={() => { setFormError(''); setFormData({ username: '', password: '', fullName: '', email: '', plan: 'free', role: 'user', licenseType: 'clase_b' }); setShowCreateModal(true); }}>
          <Ionicons name="add-circle" size={28} color="#fff" />
        </Pressable>
      </LinearGradient>

      <Pressable onPress={() => router.push('/admin-questions')} style={styles.questionsBtn}>
        <Ionicons name="document-text-outline" size={22} color="#fff" />
        <Text style={styles.questionsBtnText}>Gestionar Preguntas</Text>
        <Ionicons name="chevron-forward" size={20} color="rgba(255,255,255,0.7)" />
      </Pressable>

      <View style={styles.statsRow}>
        <Pressable style={styles.statCard} onPress={() => setActiveFilter('all')}>
          <Text style={styles.statNumber}>{users.length}</Text>
          <Text style={styles.statLabel}>Usuarios</Text>
          {activeFilter === 'all' && <View style={styles.statIndicator} />}
        </Pressable>
        <Pressable style={styles.statCard} onPress={() => setActiveFilter('premium')}>
          <Text style={[styles.statNumber, { color: '#16a34a' }]}>{premiumCount}</Text>
          <Text style={styles.statLabel}>Premium</Text>
          {activeFilter === 'premium' && <View style={[styles.statIndicator, { backgroundColor: '#16a34a' }]} />}
        </Pressable>
        <Pressable style={styles.statCard} onPress={() => setActiveFilter('free')}>
          <Text style={[styles.statNumber, { color: '#f59e0b' }]}>{users.length - premiumCount}</Text>
          <Text style={styles.statLabel}>Gratuitos</Text>
          {activeFilter === 'free' && <View style={[styles.statIndicator, { backgroundColor: '#f59e0b' }]} />}
        </Pressable>
        <Pressable style={styles.statCard} onPress={() => setActiveFilter('admin')}>
          <Text style={[styles.statNumber, { color: '#dc2626' }]}>{adminCount}</Text>
          <Text style={styles.statLabel}>Admins</Text>
          {activeFilter === 'admin' && <View style={[styles.statIndicator, { backgroundColor: '#dc2626' }]} />}
        </Pressable>
      </View>

      <View style={styles.searchContainer}>
        <Ionicons name="search" size={18} color={Colors.textMuted} style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Buscar por nombre, usuario o email..."
          placeholderTextColor={Colors.textMuted}
          value={searchQuery}
          onChangeText={setSearchQuery}
          autoCapitalize="none"
        />
        {searchQuery ? (
          <Pressable onPress={() => setSearchQuery('')} style={styles.clearSearch}>
            <Ionicons name="close-circle" size={18} color={Colors.textMuted} />
          </Pressable>
        ) : null}
      </View>

      {activeFilter !== 'all' && (
        <View style={styles.filterInfo}>
          <Text style={styles.filterText}>
            Mostrando: {activeFilter === 'premium' ? 'Premium' : activeFilter === 'free' ? 'Gratuitos' : 'Administradores'} ({filteredUsers.length})
          </Text>
          <Pressable onPress={() => setActiveFilter('all')}>
            <Text style={styles.clearFilter}>Limpiar filtro</Text>
          </Pressable>
        </View>
      )}

      <FlatList
        data={filteredUsers}
        keyExtractor={item => item.id}
        contentContainerStyle={{ paddingBottom: (Platform.OS === 'web' ? 34 : insets.bottom) + 20, paddingHorizontal: 12 }}
        renderItem={({ item }) => (
          <Pressable onPress={() => openDetail(item)} style={styles.userCard}>
            <View style={styles.userInfo}>
              <View style={styles.userRow}>
                <View style={[styles.avatarCircle, { backgroundColor: item.role === 'admin' ? '#dc2626' : Colors.primary }]}>
                  <Text style={styles.avatarText}>{(item.username[0] || '?').toUpperCase()}</Text>
                </View>
                <View style={{ flex: 1 }}>
                  <View style={styles.nameRow}>
                    <Text style={styles.userName} numberOfLines={1}>{item.username}</Text>
                    {item.role === 'admin' && (
                      <View style={styles.adminBadge}><Text style={styles.adminBadgeText}>Admin</Text></View>
                    )}
                  </View>
                  {item.fullName ? <Text style={styles.userDetail} numberOfLines={1}>{item.fullName}</Text> : null}
                  {item.email ? <Text style={styles.userDetail} numberOfLines={1}>{item.email}</Text> : null}
                </View>
              </View>
              <View style={styles.userMeta}>
                <View style={[styles.planBadge, { backgroundColor: getPlanColor(item.plan) + '18' }]}>
                  <Text style={[styles.planBadgeText, { color: getPlanColor(item.plan) }]}>{getPlanLabel(item.plan)}</Text>
                </View>
                {item.licenseType && LICENSE_LABELS[item.licenseType] && (
                  <View style={[styles.licenseBadge, { backgroundColor: (LICENSE_COLORS[item.licenseType] || Colors.primary) + '18' }]}>
                    <Text style={[styles.licenseBadgeText, { color: LICENSE_COLORS[item.licenseType] || Colors.primary }]}>
                      {LICENSE_LABELS[item.licenseType]}
                    </Text>
                  </View>
                )}
                {item.plan !== 'free' && item.planExpiry && (
                  <Text style={[styles.expiryMini, { color: getExpiryColor(item.planExpiry) }]}>
                    {formatExpiryDate(item.planExpiry)}
                  </Text>
                )}
              </View>
            </View>
            <View style={styles.userActions}>
              <Pressable onPress={() => openEdit(item)} style={styles.actionBtn} hitSlop={6}>
                <Ionicons name="create-outline" size={20} color={Colors.primary} />
              </Pressable>
              <Pressable onPress={() => confirmDelete(item)} style={styles.actionBtn} hitSlop={6}>
                <Ionicons name="trash-outline" size={20} color="#dc2626" />
              </Pressable>
            </View>
          </Pressable>
        )}
        ListEmptyComponent={
          <Text style={styles.emptyText}>
            {loading ? 'Cargando...' : searchQuery ? 'No se encontraron usuarios' : 'No hay usuarios registrados'}
          </Text>
        }
      />

      {/* Create User Modal */}
      <Modal visible={showCreateModal} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <ScrollView contentContainerStyle={styles.modalScrollContent}>
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Crear Usuario</Text>
                <Pressable onPress={() => setShowCreateModal(false)}><Ionicons name="close" size={24} color={Colors.text} /></Pressable>
              </View>
              {formError ? <Text style={styles.formError}>{formError}</Text> : null}

              <Text style={styles.formLabel}>Usuario *</Text>
              <TextInput style={styles.formInput} placeholder="Nombre de usuario" value={formData.username} onChangeText={v => setFormData(p => ({ ...p, username: v }))} autoCapitalize="none" />

              <Text style={styles.formLabel}>Contraseña *</Text>
              <TextInput style={styles.formInput} placeholder="Contraseña" value={formData.password} onChangeText={v => setFormData(p => ({ ...p, password: v }))} secureTextEntry />

              <Text style={styles.formLabel}>Nombre completo</Text>
              <TextInput style={styles.formInput} placeholder="Nombre y apellido" value={formData.fullName} onChangeText={v => setFormData(p => ({ ...p, fullName: v }))} />

              <Text style={styles.formLabel}>Email</Text>
              <TextInput style={styles.formInput} placeholder="correo@ejemplo.cl" value={formData.email} onChangeText={v => setFormData(p => ({ ...p, email: v }))} keyboardType="email-address" autoCapitalize="none" />

              <Text style={styles.formLabel}>Tipo de Licencia</Text>
              <View style={styles.optionGrid}>
                {Object.entries(LICENSE_LABELS).map(([key, label]) => (
                  <Pressable key={key} onPress={() => setFormData(prev => ({ ...prev, licenseType: key }))} style={[styles.optionBtn, formData.licenseType === key && { backgroundColor: LICENSE_COLORS[key], borderColor: LICENSE_COLORS[key] }]}>
                    <Text style={[styles.optionBtnText, formData.licenseType === key && { color: '#fff' }]}>{label}</Text>
                  </Pressable>
                ))}
              </View>

              <Text style={styles.formLabel}>Plan</Text>
              <View style={styles.optionGrid}>
                {(['free', 'premium_10', 'premium_30'] as const).map(p => (
                  <Pressable key={p} onPress={() => setFormData(prev => ({ ...prev, plan: p }))} style={[styles.optionBtn, formData.plan === p && styles.optionBtnActive]}>
                    <Text style={[styles.optionBtnText, formData.plan === p && styles.optionBtnTextActive]}>{getPlanLabel(p)}</Text>
                  </Pressable>
                ))}
              </View>

              <Text style={styles.formLabel}>Rol</Text>
              <View style={styles.optionGrid}>
                {['user', 'admin'].map(r => (
                  <Pressable key={r} onPress={() => setFormData(prev => ({ ...prev, role: r }))} style={[styles.optionBtn, formData.role === r && styles.optionBtnActive]}>
                    <Text style={[styles.optionBtnText, formData.role === r && styles.optionBtnTextActive]}>{r === 'admin' ? 'Administrador' : 'Usuario'}</Text>
                  </Pressable>
                ))}
              </View>

              <Pressable onPress={handleCreate} style={[styles.submitBtn, saving && { opacity: 0.6 }]} disabled={saving}>
                {saving ? <ActivityIndicator color="#fff" /> : <Text style={styles.submitBtnText}>Crear Usuario</Text>}
              </Pressable>
            </View>
          </ScrollView>
        </View>
      </Modal>

      {/* Edit User Modal */}
      <Modal visible={showEditModal} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <ScrollView contentContainerStyle={styles.modalScrollContent}>
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Editar: {selectedUser?.username}</Text>
                <Pressable onPress={() => setShowEditModal(false)}><Ionicons name="close" size={24} color={Colors.text} /></Pressable>
              </View>
              {formError ? <Text style={styles.formError}>{formError}</Text> : null}

              <Text style={styles.formLabel}>Nombre completo</Text>
              <TextInput style={styles.formInput} placeholder="Nombre y apellido" value={editData.fullName} onChangeText={v => setEditData(p => ({ ...p, fullName: v }))} />

              <Text style={styles.formLabel}>Email</Text>
              <TextInput style={styles.formInput} placeholder="correo@ejemplo.cl" value={editData.email} onChangeText={v => setEditData(p => ({ ...p, email: v }))} keyboardType="email-address" autoCapitalize="none" />

              <Text style={styles.formLabel}>Nueva contraseña (dejar vacío para no cambiar)</Text>
              <TextInput style={styles.formInput} placeholder="Nueva contraseña" value={editData.password} onChangeText={v => setEditData(p => ({ ...p, password: v }))} secureTextEntry />

              <Text style={styles.formLabel}>Plan</Text>
              <View style={styles.optionGrid}>
                {(['free', 'premium_10', 'premium_30'] as const).map(p => (
                  <Pressable key={p} onPress={() => setEditData(prev => ({ ...prev, plan: p }))} style={[styles.optionBtn, editData.plan === p && styles.optionBtnActive]}>
                    <Text style={[styles.optionBtnText, editData.plan === p && styles.optionBtnTextActive]}>{getPlanLabel(p)}</Text>
                  </Pressable>
                ))}
              </View>
              {editData.plan !== 'free' && selectedUser?.planExpiry && (
                <Text style={[styles.expiryInfo, { color: getExpiryColor(selectedUser.planExpiry) }]}>
                  Vigencia actual: {formatExpiryDate(selectedUser.planExpiry)}
                </Text>
              )}
              {editData.plan !== 'free' && editData.plan !== selectedUser?.plan && (
                <Text style={styles.expiryNote}>
                  Al cambiar el plan se renovará la vigencia automáticamente
                </Text>
              )}

              <Text style={styles.formLabel}>Rol</Text>
              <View style={styles.optionGrid}>
                {['user', 'admin'].map(r => (
                  <Pressable key={r} onPress={() => setEditData(prev => ({ ...prev, role: r }))} style={[styles.optionBtn, editData.role === r && styles.optionBtnActive]}>
                    <Text style={[styles.optionBtnText, editData.role === r && styles.optionBtnTextActive]}>{r === 'admin' ? 'Administrador' : 'Usuario'}</Text>
                  </Pressable>
                ))}
              </View>

              <Pressable onPress={handleEdit} style={[styles.submitBtn, saving && { opacity: 0.6 }]} disabled={saving}>
                {saving ? <ActivityIndicator color="#fff" /> : <Text style={styles.submitBtnText}>Guardar Cambios</Text>}
              </Pressable>
            </View>
          </ScrollView>
        </View>
      </Modal>

      {/* User Detail Modal */}
      <Modal visible={showDetailModal} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Detalle del Usuario</Text>
              <Pressable onPress={() => setShowDetailModal(false)}><Ionicons name="close" size={24} color={Colors.text} /></Pressable>
            </View>
            {selectedUser && (
              <View>
                <View style={styles.detailHeader}>
                  <View style={[styles.detailAvatar, { backgroundColor: selectedUser.role === 'admin' ? '#dc2626' : Colors.primary }]}>
                    <Text style={styles.detailAvatarText}>{(selectedUser.username[0] || '?').toUpperCase()}</Text>
                  </View>
                  <Text style={styles.detailUsername}>{selectedUser.username}</Text>
                  {selectedUser.role === 'admin' && (
                    <View style={styles.adminBadge}><Text style={styles.adminBadgeText}>Admin</Text></View>
                  )}
                </View>

                <View style={styles.detailRow}>
                  <Ionicons name="person-outline" size={16} color={Colors.textSecondary} />
                  <Text style={styles.detailLabel}>Nombre:</Text>
                  <Text style={styles.detailValue}>{selectedUser.fullName || 'No registrado'}</Text>
                </View>
                <View style={styles.detailRow}>
                  <Ionicons name="mail-outline" size={16} color={Colors.textSecondary} />
                  <Text style={styles.detailLabel}>Email:</Text>
                  <Text style={styles.detailValue}>{selectedUser.email || 'No registrado'}</Text>
                </View>
                <View style={styles.detailRow}>
                  <Ionicons name="car-outline" size={16} color={Colors.textSecondary} />
                  <Text style={styles.detailLabel}>Licencia:</Text>
                  <Text style={[styles.detailValue, { color: LICENSE_COLORS[selectedUser.licenseType || ''] || Colors.text }]}>
                    {LICENSE_LABELS[selectedUser.licenseType || ''] || 'No definida'}
                  </Text>
                </View>
                <View style={styles.detailRow}>
                  <Ionicons name="diamond-outline" size={16} color={Colors.textSecondary} />
                  <Text style={styles.detailLabel}>Plan:</Text>
                  <Text style={[styles.detailValue, { color: getPlanColor(selectedUser.plan) }]}>{getPlanLabel(selectedUser.plan)}</Text>
                </View>
                {selectedUser.plan !== 'free' && selectedUser.planExpiry && (
                  <View style={styles.detailRow}>
                    <Ionicons name="time-outline" size={16} color={Colors.textSecondary} />
                    <Text style={styles.detailLabel}>Vigencia:</Text>
                    <Text style={[styles.detailValue, { color: getExpiryColor(selectedUser.planExpiry) }]}>
                      {formatExpiryDate(selectedUser.planExpiry)}
                    </Text>
                  </View>
                )}
                <View style={styles.detailRow}>
                  <Ionicons name="calendar-outline" size={16} color={Colors.textSecondary} />
                  <Text style={styles.detailLabel}>Registro:</Text>
                  <Text style={styles.detailValue}>{formatDate(selectedUser.createdAt)}</Text>
                </View>
                <View style={styles.detailRow}>
                  <Ionicons name="log-in-outline" size={16} color={Colors.textSecondary} />
                  <Text style={styles.detailLabel}>Último login:</Text>
                  <Text style={styles.detailValue}>{formatDate(selectedUser.lastLogin)}</Text>
                </View>

                <View style={styles.detailActions}>
                  <Pressable onPress={() => { setShowDetailModal(false); openEdit(selectedUser); }} style={styles.detailActionBtn}>
                    <Ionicons name="create-outline" size={18} color="#fff" />
                    <Text style={styles.detailActionText}>Editar</Text>
                  </Pressable>
                  <Pressable onPress={() => { setShowDetailModal(false); confirmDelete(selectedUser); }} style={[styles.detailActionBtn, { backgroundColor: '#dc2626' }]}>
                    <Ionicons name="trash-outline" size={18} color="#fff" />
                    <Text style={styles.detailActionText}>Eliminar</Text>
                  </Pressable>
                </View>
              </View>
            )}
          </View>
        </View>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal visible={showDeleteConfirm} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.confirmContent}>
            <Ionicons name="warning" size={40} color="#dc2626" style={{ alignSelf: 'center', marginBottom: 12 }} />
            <Text style={styles.confirmTitle}>Eliminar Usuario</Text>
            <Text style={styles.confirmText}>
              ¿Estás seguro de que quieres eliminar al usuario <Text style={{ fontFamily: 'Nunito_700Bold' }}>{deleteTarget?.username}</Text>? Esta acción no se puede deshacer y se eliminarán todos sus datos.
            </Text>
            <View style={styles.confirmButtons}>
              <Pressable onPress={() => setShowDeleteConfirm(false)} style={styles.cancelBtn}>
                <Text style={styles.cancelBtnText}>Cancelar</Text>
              </Pressable>
              <Pressable onPress={handleDelete} style={styles.deleteBtn}>
                <Text style={styles.deleteBtnText}>Eliminar</Text>
              </Pressable>
            </View>
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
  statsRow: { flexDirection: 'row', padding: 12, gap: 6 },
  statCard: { flex: 1, backgroundColor: Colors.surface, borderRadius: 12, padding: 10, alignItems: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.06, shadowRadius: 3, elevation: 2, position: 'relative' as const },
  statNumber: { fontSize: 22, fontFamily: 'Nunito_800ExtraBold', color: Colors.primary },
  statLabel: { fontSize: 11, fontFamily: 'Nunito_600SemiBold', color: Colors.textSecondary },
  statIndicator: { position: 'absolute' as const, bottom: 0, left: '20%' as any, right: '20%' as any, height: 3, backgroundColor: Colors.primary, borderTopLeftRadius: 3, borderTopRightRadius: 3 },
  searchContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: Colors.surface, marginHorizontal: 12, borderRadius: 12, borderWidth: 1, borderColor: Colors.border, paddingHorizontal: 12, marginBottom: 8 },
  searchIcon: { marginRight: 8 },
  searchInput: { flex: 1, fontSize: 14, fontFamily: 'Nunito_400Regular', paddingVertical: 12, color: Colors.text },
  clearSearch: { padding: 4 },
  filterInfo: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 16, marginBottom: 6 },
  filterText: { fontSize: 13, fontFamily: 'Nunito_600SemiBold', color: Colors.textSecondary },
  clearFilter: { fontSize: 13, fontFamily: 'Nunito_600SemiBold', color: Colors.primary },
  userCard: { flexDirection: 'row', backgroundColor: Colors.surface, borderRadius: 12, padding: 14, marginVertical: 4, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.06, shadowRadius: 3, elevation: 2 },
  userInfo: { flex: 1 },
  userRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  nameRow: { flexDirection: 'row', alignItems: 'center', gap: 6, flexWrap: 'wrap' },
  avatarCircle: { width: 38, height: 38, borderRadius: 19, alignItems: 'center', justifyContent: 'center' },
  avatarText: { color: '#fff', fontSize: 16, fontFamily: 'Nunito_700Bold' },
  userName: { fontSize: 15, fontFamily: 'Nunito_700Bold', color: Colors.text },
  adminBadge: { backgroundColor: '#dc2626', paddingHorizontal: 6, paddingVertical: 1, borderRadius: 6 },
  adminBadgeText: { color: '#fff', fontSize: 10, fontFamily: 'Nunito_700Bold' },
  userDetail: { fontSize: 12, fontFamily: 'Nunito_400Regular', color: Colors.textSecondary, marginLeft: 48 },
  userMeta: { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', gap: 6, marginTop: 6, marginLeft: 48 },
  planBadge: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: 6 },
  planBadgeText: { fontSize: 11, fontFamily: 'Nunito_700Bold' },
  licenseBadge: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: 6 },
  licenseBadgeText: { fontSize: 11, fontFamily: 'Nunito_700Bold' },
  expiryMini: { fontSize: 10, fontFamily: 'Nunito_600SemiBold' },
  userActions: { justifyContent: 'center', gap: 8 },
  actionBtn: { padding: 6 },
  emptyText: { textAlign: 'center', fontSize: 14, fontFamily: 'Nunito_400Regular', color: Colors.textMuted, marginTop: 40 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', padding: 20 },
  modalScrollContent: { flexGrow: 1, justifyContent: 'center' },
  modalContent: { backgroundColor: Colors.surface, borderRadius: 16, padding: 20, maxHeight: '90%' },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  modalTitle: { fontSize: 18, fontFamily: 'Nunito_700Bold', color: Colors.text },
  formError: { color: '#dc2626', fontSize: 13, fontFamily: 'Nunito_600SemiBold', marginBottom: 8, backgroundColor: '#fef2f2', padding: 10, borderRadius: 8 },
  formInput: { backgroundColor: Colors.surfaceSecondary, borderRadius: 10, padding: 14, fontSize: 15, fontFamily: 'Nunito_400Regular', marginBottom: 10, borderWidth: 1, borderColor: Colors.border, color: Colors.text },
  formLabel: { fontSize: 13, fontFamily: 'Nunito_600SemiBold', color: Colors.text, marginBottom: 6, marginTop: 4 },
  optionGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginBottom: 10 },
  optionBtn: { paddingHorizontal: 12, paddingVertical: 8, borderRadius: 8, backgroundColor: Colors.surfaceSecondary, borderWidth: 1, borderColor: Colors.border },
  optionBtnActive: { backgroundColor: Colors.primary, borderColor: Colors.primary },
  optionBtnText: { fontSize: 13, fontFamily: 'Nunito_600SemiBold', color: Colors.text },
  optionBtnTextActive: { color: '#fff' },
  expiryInfo: { fontSize: 12, fontFamily: 'Nunito_600SemiBold', marginBottom: 8, marginTop: -4 },
  expiryNote: { fontSize: 12, fontFamily: 'Nunito_400Regular', color: Colors.primary, marginBottom: 8, marginTop: -4, fontStyle: 'italic' as const },
  submitBtn: { backgroundColor: Colors.primary, paddingVertical: 14, borderRadius: 12, alignItems: 'center', marginTop: 8 },
  submitBtnText: { color: '#fff', fontSize: 16, fontFamily: 'Nunito_700Bold' },
  questionsBtn: { flexDirection: 'row', alignItems: 'center', backgroundColor: Colors.primary, marginHorizontal: 12, marginTop: 12, padding: 14, borderRadius: 12, gap: 10 },
  questionsBtnText: { flex: 1, color: '#fff', fontSize: 16, fontFamily: 'Nunito_700Bold' },
  detailHeader: { alignItems: 'center', marginBottom: 16, gap: 6 },
  detailAvatar: { width: 56, height: 56, borderRadius: 28, alignItems: 'center', justifyContent: 'center' },
  detailAvatarText: { color: '#fff', fontSize: 24, fontFamily: 'Nunito_700Bold' },
  detailUsername: { fontSize: 18, fontFamily: 'Nunito_700Bold', color: Colors.text },
  detailRow: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: Colors.border },
  detailLabel: { fontSize: 13, fontFamily: 'Nunito_600SemiBold', color: Colors.textSecondary, width: 90 },
  detailValue: { fontSize: 14, fontFamily: 'Nunito_600SemiBold', color: Colors.text, flex: 1, textAlign: 'right' as const },
  detailActions: { flexDirection: 'row', gap: 10, marginTop: 16 },
  detailActionBtn: { flex: 1, flexDirection: 'row', backgroundColor: Colors.primary, paddingVertical: 12, borderRadius: 10, alignItems: 'center', justifyContent: 'center', gap: 6 },
  detailActionText: { color: '#fff', fontSize: 14, fontFamily: 'Nunito_700Bold' },
  confirmContent: { backgroundColor: Colors.surface, borderRadius: 16, padding: 24 },
  confirmTitle: { fontSize: 18, fontFamily: 'Nunito_700Bold', color: Colors.text, textAlign: 'center', marginBottom: 8 },
  confirmText: { fontSize: 14, fontFamily: 'Nunito_400Regular', color: Colors.textSecondary, textAlign: 'center', lineHeight: 20, marginBottom: 20 },
  confirmButtons: { flexDirection: 'row', gap: 10 },
  cancelBtn: { flex: 1, paddingVertical: 12, borderRadius: 10, alignItems: 'center', backgroundColor: Colors.surfaceSecondary, borderWidth: 1, borderColor: Colors.border },
  cancelBtnText: { fontSize: 15, fontFamily: 'Nunito_600SemiBold', color: Colors.text },
  deleteBtn: { flex: 1, paddingVertical: 12, borderRadius: 10, alignItems: 'center', backgroundColor: '#dc2626' },
  deleteBtnText: { fontSize: 15, fontFamily: 'Nunito_700Bold', color: '#fff' },
});
