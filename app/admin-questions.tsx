import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, Pressable, Platform, Modal, TextInput, FlatList, ScrollView, Alert, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import Colors from '@/constants/colors';
import { useUser } from '@/lib/UserContext';
import { apiRequest } from '@/lib/query-client';
import { categorias, licenseTypes } from '@/lib/mockDatabase';
import { invalidateQuestionsCache } from '@/lib/mockDatabase';

interface QuestionItem {
  id: number;
  pregunta: string;
  opciones: string[];
  respuestaCorrecta: number;
  explicacionTexto: string;
  categoria: string;
  dificultad: string;
  licenseTypes: string[];
  oficial: boolean;
  urlAudio: string;
  enabled: boolean;
}

const DIFICULTAD_OPTIONS = ['facil', 'media', 'dificil'] as const;
const ALL_LICENSE_IDS = licenseTypes.map(l => l.id);

const emptyForm = (): QuestionItem => ({
  id: 0,
  pregunta: '',
  opciones: ['', '', '', ''],
  respuestaCorrecta: 0,
  explicacionTexto: '',
  categoria: categorias[0],
  dificultad: 'media',
  licenseTypes: ['clase_b', 'clase_a2', 'clase_a4', 'clase_c', 'clase_d', 'clase_e'],
  oficial: false,
  urlAudio: '',
  enabled: true,
});

export default function AdminQuestionsScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { isAdmin } = useUser();
  const webTopInset = Platform.OS === 'web' ? 67 : 0;

  const [questions, setQuestions] = useState<QuestionItem[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [filterCategory, setFilterCategory] = useState('');
  const [filterLicense, setFilterLicense] = useState('');
  const [filterDificultad, setFilterDificultad] = useState('');
  const [filterOficial, setFilterOficial] = useState<string>('');
  const [showFilters, setShowFilters] = useState(false);

  const [showEditModal, setShowEditModal] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editForm, setEditForm] = useState<QuestionItem>(emptyForm());
  const [formError, setFormError] = useState('');
  const [saving, setSaving] = useState(false);

  const loadQuestions = useCallback(async (p: number = 1) => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      params.set('page', String(p));
      params.set('limit', '30');
      if (search) params.set('search', search);
      if (filterCategory) params.set('category', filterCategory);
      if (filterLicense) params.set('licenseType', filterLicense);
      if (filterDificultad) params.set('dificultad', filterDificultad);
      if (filterOficial) params.set('oficial', filterOficial);

      const res = await apiRequest('GET', `/api/admin/questions?${params.toString()}`);
      const data = await res.json();
      setQuestions(data.questions);
      setTotal(data.total);
      setPage(data.page);
      setTotalPages(data.totalPages);
    } catch (err) {
      console.error('Error loading questions', err);
    }
    setLoading(false);
  }, [search, filterCategory, filterLicense, filterDificultad, filterOficial]);

  useEffect(() => { loadQuestions(1); }, [loadQuestions]);

  const handleSearch = () => {
    setSearch(searchInput);
  };

  const openEdit = (q: QuestionItem) => {
    setEditForm({ ...q, opciones: [...q.opciones] });
    setFormError('');
    setShowEditModal(true);
  };

  const openCreate = () => {
    setEditForm(emptyForm());
    setFormError('');
    setShowCreateModal(true);
  };

  const handleSave = async () => {
    if (!editForm.pregunta.trim()) { setFormError('La pregunta es requerida'); return; }
    const validOpciones = editForm.opciones.filter(o => o.trim() !== '');
    if (validOpciones.length < 2) { setFormError('Se necesitan al menos 2 opciones'); return; }
    if (editForm.respuestaCorrecta >= validOpciones.length) { setFormError('La respuesta correcta no es valida'); return; }
    if (editForm.licenseTypes.length === 0) { setFormError('Selecciona al menos un tipo de licencia'); return; }

    setSaving(true);
    setFormError('');
    try {
      const payload = {
        pregunta: editForm.pregunta.trim(),
        opciones: validOpciones,
        respuestaCorrecta: editForm.respuestaCorrecta,
        explicacionTexto: editForm.explicacionTexto.trim(),
        categoria: editForm.categoria,
        dificultad: editForm.dificultad,
        licenseTypes: editForm.licenseTypes,
        oficial: editForm.oficial,
        urlAudio: editForm.urlAudio || '',
      };

      if (showCreateModal) {
        await apiRequest('POST', '/api/admin/questions', payload);
      } else {
        await apiRequest('PUT', `/api/admin/questions/${editForm.id}`, payload);
      }
      setShowEditModal(false);
      setShowCreateModal(false);
      invalidateQuestionsCache();
      loadQuestions(page);
    } catch (err: any) {
      const msg = err.message || 'Error al guardar';
      try {
        const parsed = JSON.parse(msg.split(': ').slice(1).join(': '));
        setFormError(parsed.message || msg);
      } catch {
        setFormError(msg);
      }
    }
    setSaving(false);
  };

  const handleDelete = async (id: number) => {
    if (Platform.OS === 'web') {
      if (!window.confirm('¿Desactivar esta pregunta? No aparecera en los examenes.')) return;
    } else {
      return new Promise<void>((resolve) => {
        Alert.alert('Desactivar pregunta', '¿Desactivar esta pregunta? No aparecera en los examenes.', [
          { text: 'Cancelar', style: 'cancel', onPress: () => resolve() },
          { text: 'Desactivar', style: 'destructive', onPress: async () => {
            try {
              await apiRequest('DELETE', `/api/admin/questions/${id}`);
              invalidateQuestionsCache();
              loadQuestions(page);
            } catch {}
            resolve();
          }},
        ]);
      });
    }
    try {
      await apiRequest('DELETE', `/api/admin/questions/${id}`);
      invalidateQuestionsCache();
      loadQuestions(page);
    } catch {}
  };

  const toggleLicenseType = (lt: string) => {
    setEditForm(prev => {
      const has = prev.licenseTypes.includes(lt);
      return {
        ...prev,
        licenseTypes: has
          ? prev.licenseTypes.filter(t => t !== lt)
          : [...prev.licenseTypes, lt],
      };
    });
  };

  const updateOption = (index: number, value: string) => {
    setEditForm(prev => {
      const newOpciones = [...prev.opciones];
      newOpciones[index] = value;
      return { ...prev, opciones: newOpciones };
    });
  };

  const addOption = () => {
    if (editForm.opciones.length >= 6) return;
    setEditForm(prev => ({ ...prev, opciones: [...prev.opciones, ''] }));
  };

  const removeOption = (index: number) => {
    if (editForm.opciones.length <= 2) return;
    setEditForm(prev => {
      const newOpciones = prev.opciones.filter((_, i) => i !== index);
      let newCorrect = prev.respuestaCorrecta;
      if (index === prev.respuestaCorrecta) newCorrect = 0;
      else if (index < prev.respuestaCorrecta) newCorrect = prev.respuestaCorrecta - 1;
      return { ...prev, opciones: newOpciones, respuestaCorrecta: newCorrect };
    });
  };

  const clearFilters = () => {
    setFilterCategory('');
    setFilterLicense('');
    setFilterDificultad('');
    setFilterOficial('');
    setSearch('');
    setSearchInput('');
  };

  const hasActiveFilters = filterCategory || filterLicense || filterDificultad || filterOficial || search;

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

  const renderQuestion = ({ item }: { item: QuestionItem }) => (
    <Pressable onPress={() => openEdit(item)} style={[styles.questionCard, !item.enabled && styles.questionCardDisabled]}>
      <View style={styles.questionCardHeader}>
        <View style={styles.idBadge}>
          <Text style={styles.idBadgeText}>#{item.id}</Text>
        </View>
        <View style={styles.catBadge}>
          <Text style={styles.catBadgeText}>{item.categoria}</Text>
        </View>
        {item.oficial && (
          <View style={styles.oficialBadge}>
            <Text style={styles.oficialBadgeText}>Oficial</Text>
          </View>
        )}
        {!item.enabled && (
          <View style={styles.disabledBadge}>
            <Text style={styles.disabledBadgeText}>Desactivada</Text>
          </View>
        )}
      </View>
      <Text style={styles.questionText} numberOfLines={2}>{item.pregunta}</Text>
      <View style={styles.questionMeta}>
        <Text style={styles.metaText}>{item.opciones.length} opciones</Text>
        <Text style={styles.metaDot}> · </Text>
        <Text style={styles.metaText}>{item.dificultad}</Text>
        <Text style={styles.metaDot}> · </Text>
        <Text style={[styles.metaCorrect]}>R: {String.fromCharCode(65 + item.respuestaCorrecta)}</Text>
      </View>
      <View style={styles.licenseBadges}>
        {item.licenseTypes.map(lt => (
          <View key={lt} style={styles.licenseChip}>
            <Text style={styles.licenseChipText}>{lt.replace('clase_', '').toUpperCase()}</Text>
          </View>
        ))}
      </View>
    </Pressable>
  );

  const renderEditModal = (isCreate: boolean) => (
    <Modal visible={isCreate ? showCreateModal : showEditModal} transparent animationType="slide">
      <View style={styles.modalOverlay}>
        <View style={[styles.modalContent, { maxHeight: '92%' }]}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>{isCreate ? 'Nueva Pregunta' : `Editar #${editForm.id}`}</Text>
            <Pressable onPress={() => { setShowEditModal(false); setShowCreateModal(false); }} testID="close-modal" accessibilityLabel="Cerrar">
              <Text style={{ fontSize: 22, color: Colors.text, fontWeight: 'bold' }}>X</Text>
            </Pressable>
          </View>

          <ScrollView showsVerticalScrollIndicator={false}>
            {formError ? <Text style={styles.formError}>{formError}</Text> : null}

            <Text style={styles.formLabel}>Pregunta *</Text>
            <TextInput
              style={[styles.formInput, styles.formTextarea]}
              value={editForm.pregunta}
              onChangeText={v => setEditForm(p => ({ ...p, pregunta: v }))}
              multiline
              numberOfLines={3}
              placeholder="Escribe la pregunta..."
            />

            <Text style={styles.formLabel}>Opciones *</Text>
            {editForm.opciones.map((op, idx) => (
              <View key={idx} style={styles.optionRow}>
                <Pressable
                  onPress={() => setEditForm(p => ({ ...p, respuestaCorrecta: idx }))}
                  style={[styles.optionRadio, editForm.respuestaCorrecta === idx && styles.optionRadioActive]}
                >
                  <Text style={[styles.optionLetter, editForm.respuestaCorrecta === idx && styles.optionLetterActive]}>
                    {String.fromCharCode(65 + idx)}
                  </Text>
                </Pressable>
                <TextInput
                  style={[styles.formInput, styles.optionInput]}
                  value={op}
                  onChangeText={v => updateOption(idx, v)}
                  placeholder={`Opcion ${String.fromCharCode(65 + idx)}`}
                />
                {editForm.opciones.length > 2 && (
                  <Pressable onPress={() => removeOption(idx)} style={styles.removeOptionBtn}>
                    <Ionicons name="close-circle" size={22} color="#dc2626" />
                  </Pressable>
                )}
              </View>
            ))}
            {editForm.opciones.length < 6 && (
              <Pressable onPress={addOption} style={styles.addOptionBtn}>
                <Ionicons name="add-circle-outline" size={18} color={Colors.primary} />
                <Text style={styles.addOptionText}>Agregar opcion</Text>
              </Pressable>
            )}
            <Text style={styles.correctHint}>Toca la letra para marcar la respuesta correcta</Text>

            <Text style={styles.formLabel}>Explicacion</Text>
            <TextInput
              style={[styles.formInput, styles.formTextarea]}
              value={editForm.explicacionTexto}
              onChangeText={v => setEditForm(p => ({ ...p, explicacionTexto: v }))}
              multiline
              numberOfLines={3}
              placeholder="Explicacion de la respuesta correcta..."
            />

            <Text style={styles.formLabel}>Categoria *</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipScroll}>
              {categorias.map(cat => (
                <Pressable
                  key={cat}
                  onPress={() => setEditForm(p => ({ ...p, categoria: cat }))}
                  style={[styles.chip, editForm.categoria === cat && styles.chipActive]}
                >
                  <Text style={[styles.chipText, editForm.categoria === cat && styles.chipTextActive]}>{cat}</Text>
                </Pressable>
              ))}
            </ScrollView>

            <Text style={styles.formLabel}>Dificultad</Text>
            <View style={styles.chipRow}>
              {DIFICULTAD_OPTIONS.map(d => (
                <Pressable
                  key={d}
                  onPress={() => setEditForm(p => ({ ...p, dificultad: d }))}
                  style={[styles.chip, editForm.dificultad === d && styles.chipActive]}
                >
                  <Text style={[styles.chipText, editForm.dificultad === d && styles.chipTextActive]}>
                    {d === 'facil' ? 'Facil' : d === 'media' ? 'Media' : 'Dificil'}
                  </Text>
                </Pressable>
              ))}
            </View>

            <Text style={styles.formLabel}>Tipos de Licencia *</Text>
            <View style={styles.chipRow}>
              {licenseTypes.map(lt => (
                <Pressable
                  key={lt.id}
                  onPress={() => toggleLicenseType(lt.id)}
                  style={[styles.chip, editForm.licenseTypes.includes(lt.id) && styles.chipActive]}
                >
                  <Text style={[styles.chipText, editForm.licenseTypes.includes(lt.id) && styles.chipTextActive]}>
                    {lt.name}
                  </Text>
                </Pressable>
              ))}
            </View>

            <View style={styles.switchRow}>
              <Text style={styles.formLabel}>Pregunta Oficial CONASET</Text>
              <Pressable
                onPress={() => setEditForm(p => ({ ...p, oficial: !p.oficial }))}
                style={[styles.toggleBtn, editForm.oficial && styles.toggleBtnActive]}
              >
                <Text style={[styles.toggleText, editForm.oficial && styles.toggleTextActive]}>
                  {editForm.oficial ? 'SI' : 'NO'}
                </Text>
              </Pressable>
            </View>

            <View style={{ height: 16 }} />

            <View style={styles.modalActions}>
              {!isCreate && (
                <Pressable onPress={() => { setShowEditModal(false); handleDelete(editForm.id); }} style={styles.deleteBtn}>
                  <Ionicons name="trash-outline" size={18} color="#dc2626" />
                  <Text style={styles.deleteBtnText}>Desactivar</Text>
                </Pressable>
              )}
              <Pressable onPress={handleSave} style={[styles.saveBtn, saving && { opacity: 0.6 }]} disabled={saving}>
                {saving ? (
                  <ActivityIndicator color="#fff" size="small" />
                ) : (
                  <Text style={styles.saveBtnText}>{isCreate ? 'Crear Pregunta' : 'Guardar Cambios'}</Text>
                )}
              </Pressable>
            </View>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );

  return (
    <View style={styles.container}>
      <LinearGradient colors={['#dc2626', '#b91c1c']} style={[styles.header, { paddingTop: (insets.top || webTopInset) + 12 }]}>
        <Pressable onPress={() => router.back()} testID="back-btn" style={styles.headerBtn}>
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </Pressable>
        <View style={{ flex: 1, marginHorizontal: 12 }}>
          <Text style={styles.headerTitle}>Preguntas</Text>
          <Text style={styles.headerSubtitle}>{total} total</Text>
        </View>
        <Pressable onPress={openCreate} testID="add-question-btn" style={styles.headerBtn}>
          <Ionicons name="add-circle" size={28} color="#fff" />
          <Text style={{ color: '#fff', fontSize: 11, fontFamily: 'Nunito_600SemiBold' }}>Nueva</Text>
        </Pressable>
      </LinearGradient>

      <View style={styles.searchRow}>
        <View style={styles.searchBox}>
          <Ionicons name="search" size={18} color={Colors.textMuted} />
          <TextInput
            style={styles.searchInput}
            value={searchInput}
            onChangeText={setSearchInput}
            onSubmitEditing={handleSearch}
            placeholder="Buscar pregunta..."
            placeholderTextColor={Colors.textMuted}
            returnKeyType="search"
          />
          {searchInput ? (
            <Pressable onPress={() => { setSearchInput(''); setSearch(''); }}>
              <Ionicons name="close-circle" size={18} color={Colors.textMuted} />
            </Pressable>
          ) : null}
        </View>
        <Pressable onPress={() => setShowFilters(!showFilters)} style={[styles.filterBtn, hasActiveFilters && styles.filterBtnActive]}>
          <Ionicons name="options-outline" size={20} color={hasActiveFilters ? '#fff' : Colors.text} />
        </Pressable>
      </View>

      {showFilters && (
        <View style={styles.filtersPanel}>
          <View style={styles.filterRow}>
            <Text style={styles.filterLabel}>Categoria:</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <Pressable onPress={() => setFilterCategory('')} style={[styles.filterChip, !filterCategory && styles.filterChipActive]}>
                <Text style={[styles.filterChipText, !filterCategory && styles.filterChipTextActive]}>Todas</Text>
              </Pressable>
              {categorias.map(cat => (
                <Pressable key={cat} onPress={() => setFilterCategory(cat)} style={[styles.filterChip, filterCategory === cat && styles.filterChipActive]}>
                  <Text style={[styles.filterChipText, filterCategory === cat && styles.filterChipTextActive]}>{cat}</Text>
                </Pressable>
              ))}
            </ScrollView>
          </View>
          <View style={styles.filterRow}>
            <Text style={styles.filterLabel}>Licencia:</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <Pressable onPress={() => setFilterLicense('')} style={[styles.filterChip, !filterLicense && styles.filterChipActive]}>
                <Text style={[styles.filterChipText, !filterLicense && styles.filterChipTextActive]}>Todas</Text>
              </Pressable>
              {licenseTypes.map(lt => (
                <Pressable key={lt.id} onPress={() => setFilterLicense(lt.id)} style={[styles.filterChip, filterLicense === lt.id && styles.filterChipActive]}>
                  <Text style={[styles.filterChipText, filterLicense === lt.id && styles.filterChipTextActive]}>{lt.name}</Text>
                </Pressable>
              ))}
            </ScrollView>
          </View>
          <View style={styles.filterRow}>
            <Text style={styles.filterLabel}>Dificultad:</Text>
            <View style={{ flexDirection: 'row', gap: 6 }}>
              <Pressable onPress={() => setFilterDificultad('')} style={[styles.filterChip, !filterDificultad && styles.filterChipActive]}>
                <Text style={[styles.filterChipText, !filterDificultad && styles.filterChipTextActive]}>Todas</Text>
              </Pressable>
              {DIFICULTAD_OPTIONS.map(d => (
                <Pressable key={d} onPress={() => setFilterDificultad(d)} style={[styles.filterChip, filterDificultad === d && styles.filterChipActive]}>
                  <Text style={[styles.filterChipText, filterDificultad === d && styles.filterChipTextActive]}>
                    {d === 'facil' ? 'Facil' : d === 'media' ? 'Media' : 'Dificil'}
                  </Text>
                </Pressable>
              ))}
            </View>
          </View>
          <View style={styles.filterRow}>
            <Text style={styles.filterLabel}>Oficial:</Text>
            <View style={{ flexDirection: 'row', gap: 6 }}>
              <Pressable onPress={() => setFilterOficial('')} style={[styles.filterChip, !filterOficial && styles.filterChipActive]}>
                <Text style={[styles.filterChipText, !filterOficial && styles.filterChipTextActive]}>Todas</Text>
              </Pressable>
              <Pressable onPress={() => setFilterOficial('true')} style={[styles.filterChip, filterOficial === 'true' && styles.filterChipActive]}>
                <Text style={[styles.filterChipText, filterOficial === 'true' && styles.filterChipTextActive]}>Oficial</Text>
              </Pressable>
              <Pressable onPress={() => setFilterOficial('false')} style={[styles.filterChip, filterOficial === 'false' && styles.filterChipActive]}>
                <Text style={[styles.filterChipText, filterOficial === 'false' && styles.filterChipTextActive]}>No oficial</Text>
              </Pressable>
            </View>
          </View>
          {hasActiveFilters && (
            <Pressable onPress={clearFilters} style={styles.clearFiltersBtn}>
              <Ionicons name="close-circle-outline" size={16} color={Colors.primary} />
              <Text style={styles.clearFiltersText}>Limpiar filtros</Text>
            </Pressable>
          )}
        </View>
      )}

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Colors.primary} />
          <Text style={styles.loadingText}>Cargando preguntas...</Text>
        </View>
      ) : (
        <FlatList
          data={questions}
          keyExtractor={item => String(item.id)}
          renderItem={renderQuestion}
          contentContainerStyle={{ paddingHorizontal: 12, paddingBottom: (Platform.OS === 'web' ? 34 : insets.bottom) + 20 }}
          ListEmptyComponent={<Text style={styles.emptyText}>No se encontraron preguntas</Text>}
          ListFooterComponent={
            totalPages > 1 ? (
              <View style={styles.pagination}>
                <Pressable
                  onPress={() => { if (page > 1) loadQuestions(page - 1); }}
                  disabled={page <= 1}
                  style={[styles.pageBtn, page <= 1 && styles.pageBtnDisabled]}
                >
                  <Ionicons name="chevron-back" size={20} color={page <= 1 ? Colors.textMuted : Colors.primary} />
                </Pressable>
                <Text style={styles.pageText}>Pagina {page} de {totalPages}</Text>
                <Pressable
                  onPress={() => { if (page < totalPages) loadQuestions(page + 1); }}
                  disabled={page >= totalPages}
                  style={[styles.pageBtn, page >= totalPages && styles.pageBtnDisabled]}
                >
                  <Ionicons name="chevron-forward" size={20} color={page >= totalPages ? Colors.textMuted : Colors.primary} />
                </Pressable>
              </View>
            ) : null
          }
        />
      )}

      {renderEditModal(false)}
      {renderEditModal(true)}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  header: { paddingBottom: 12, paddingHorizontal: 16, flexDirection: 'row', alignItems: 'center' } as const,
  headerBtn: { padding: 8, alignItems: 'center', justifyContent: 'center', minWidth: 44, minHeight: 44 } as const,
  headerTitle: { color: '#fff', fontSize: 20, fontFamily: 'Nunito_700Bold' },
  headerSubtitle: { color: 'rgba(255,255,255,0.8)', fontSize: 12, fontFamily: 'Nunito_600SemiBold' },
  noAccess: { fontSize: 18, fontFamily: 'Nunito_700Bold', color: Colors.text },
  backLink: { fontSize: 16, fontFamily: 'Nunito_600SemiBold', color: Colors.primary, marginTop: 12 },

  searchRow: { flexDirection: 'row', paddingHorizontal: 12, paddingVertical: 8, gap: 8 },
  searchBox: { flex: 1, flexDirection: 'row', alignItems: 'center', backgroundColor: Colors.surface, borderRadius: 10, paddingHorizontal: 12, gap: 8, borderWidth: 1, borderColor: Colors.border },
  searchInput: { flex: 1, fontSize: 14, fontFamily: 'Nunito_400Regular', paddingVertical: 10, color: Colors.text },
  filterBtn: { width: 44, height: 44, borderRadius: 10, backgroundColor: Colors.surface, justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: Colors.border },
  filterBtnActive: { backgroundColor: Colors.primary, borderColor: Colors.primary },

  filtersPanel: { backgroundColor: Colors.surface, marginHorizontal: 12, borderRadius: 12, padding: 12, marginBottom: 8, gap: 8, borderWidth: 1, borderColor: Colors.border },
  filterRow: { gap: 4 },
  filterLabel: { fontSize: 12, fontFamily: 'Nunito_600SemiBold', color: Colors.textSecondary, marginBottom: 2 },
  filterChip: { paddingHorizontal: 10, paddingVertical: 5, borderRadius: 8, backgroundColor: Colors.surfaceSecondary, marginRight: 6 },
  filterChipActive: { backgroundColor: Colors.primary },
  filterChipText: { fontSize: 12, fontFamily: 'Nunito_600SemiBold', color: Colors.text },
  filterChipTextActive: { color: '#fff' },
  clearFiltersBtn: { flexDirection: 'row', alignItems: 'center', gap: 4, alignSelf: 'flex-start', paddingVertical: 4 },
  clearFiltersText: { fontSize: 13, fontFamily: 'Nunito_600SemiBold', color: Colors.primary },

  questionCard: { backgroundColor: Colors.surface, borderRadius: 12, padding: 14, marginVertical: 4, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.06, shadowRadius: 3, elevation: 2 },
  questionCardDisabled: { opacity: 0.5 },
  questionCardHeader: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginBottom: 6 },
  idBadge: { backgroundColor: Colors.surfaceSecondary, paddingHorizontal: 8, paddingVertical: 2, borderRadius: 6 },
  idBadgeText: { fontSize: 11, fontFamily: 'Nunito_700Bold', color: Colors.textSecondary },
  catBadge: { backgroundColor: '#eff6ff', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 6 },
  catBadgeText: { fontSize: 11, fontFamily: 'Nunito_600SemiBold', color: Colors.primary },
  oficialBadge: { backgroundColor: '#fef3c7', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 6 },
  oficialBadgeText: { fontSize: 11, fontFamily: 'Nunito_700Bold', color: '#92400e' },
  disabledBadge: { backgroundColor: '#fee2e2', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 6 },
  disabledBadgeText: { fontSize: 11, fontFamily: 'Nunito_700Bold', color: '#dc2626' },
  questionText: { fontSize: 14, fontFamily: 'Nunito_600SemiBold', color: Colors.text, lineHeight: 20, marginBottom: 6 },
  questionMeta: { flexDirection: 'row', alignItems: 'center', marginBottom: 4 },
  metaText: { fontSize: 12, fontFamily: 'Nunito_400Regular', color: Colors.textMuted },
  metaDot: { fontSize: 12, color: Colors.textMuted },
  metaCorrect: { fontSize: 12, fontFamily: 'Nunito_700Bold', color: Colors.success },
  licenseBadges: { flexDirection: 'row', flexWrap: 'wrap', gap: 4 },
  licenseChip: { backgroundColor: '#f0f9ff', paddingHorizontal: 6, paddingVertical: 1, borderRadius: 4 },
  licenseChipText: { fontSize: 10, fontFamily: 'Nunito_700Bold', color: Colors.primary },

  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', gap: 12 },
  loadingText: { fontSize: 14, fontFamily: 'Nunito_400Regular', color: Colors.textMuted },
  emptyText: { textAlign: 'center', fontSize: 14, fontFamily: 'Nunito_400Regular', color: Colors.textMuted, marginTop: 40 },

  pagination: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', paddingVertical: 16, gap: 16 },
  pageBtn: { width: 40, height: 40, borderRadius: 10, backgroundColor: Colors.surface, justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: Colors.border },
  pageBtnDisabled: { opacity: 0.4 },
  pageText: { fontSize: 14, fontFamily: 'Nunito_600SemiBold', color: Colors.text },

  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', padding: 16 },
  modalContent: { backgroundColor: Colors.surface, borderRadius: 16, padding: 20 },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  modalTitle: { fontSize: 18, fontFamily: 'Nunito_700Bold', color: Colors.text },
  formError: { color: '#dc2626', fontSize: 13, fontFamily: 'Nunito_600SemiBold', marginBottom: 8, backgroundColor: '#fef2f2', padding: 8, borderRadius: 8 },
  formLabel: { fontSize: 13, fontFamily: 'Nunito_600SemiBold', color: Colors.text, marginBottom: 4, marginTop: 8 },
  formInput: { backgroundColor: Colors.surfaceSecondary, borderRadius: 10, padding: 12, fontSize: 14, fontFamily: 'Nunito_400Regular', borderWidth: 1, borderColor: Colors.border, color: Colors.text },
  formTextarea: { minHeight: 70, textAlignVertical: 'top', marginBottom: 4 },

  optionRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 6 },
  optionRadio: { width: 32, height: 32, borderRadius: 16, backgroundColor: Colors.surfaceSecondary, justifyContent: 'center', alignItems: 'center', borderWidth: 2, borderColor: Colors.border },
  optionRadioActive: { backgroundColor: Colors.success, borderColor: Colors.success },
  optionLetter: { fontSize: 14, fontFamily: 'Nunito_700Bold', color: Colors.textSecondary },
  optionLetterActive: { color: '#fff' },
  optionInput: { flex: 1, marginBottom: 0 },
  removeOptionBtn: { padding: 4 },
  addOptionBtn: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingVertical: 6 },
  addOptionText: { fontSize: 13, fontFamily: 'Nunito_600SemiBold', color: Colors.primary },
  correctHint: { fontSize: 11, fontFamily: 'Nunito_400Regular', color: Colors.textMuted, fontStyle: 'italic', marginTop: 2 },

  chipScroll: { marginBottom: 4 },
  chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginBottom: 4 },
  chip: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8, backgroundColor: Colors.surfaceSecondary, borderWidth: 1, borderColor: Colors.border, marginBottom: 4 },
  chipActive: { backgroundColor: Colors.primary, borderColor: Colors.primary },
  chipText: { fontSize: 12, fontFamily: 'Nunito_600SemiBold', color: Colors.text },
  chipTextActive: { color: '#fff' },

  switchRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 8 },
  toggleBtn: { paddingHorizontal: 16, paddingVertical: 6, borderRadius: 8, backgroundColor: Colors.surfaceSecondary, borderWidth: 1, borderColor: Colors.border },
  toggleBtnActive: { backgroundColor: Colors.success, borderColor: Colors.success },
  toggleText: { fontSize: 13, fontFamily: 'Nunito_700Bold', color: Colors.text },
  toggleTextActive: { color: '#fff' },

  modalActions: { flexDirection: 'row', gap: 10, marginTop: 8 },
  deleteBtn: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingVertical: 12, paddingHorizontal: 16, borderRadius: 10, borderWidth: 1, borderColor: '#fecaca', backgroundColor: '#fef2f2' },
  deleteBtnText: { fontSize: 14, fontFamily: 'Nunito_600SemiBold', color: '#dc2626' },
  saveBtn: { flex: 1, backgroundColor: Colors.primary, paddingVertical: 14, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  saveBtnText: { color: '#fff', fontSize: 16, fontFamily: 'Nunito_700Bold' },
});
