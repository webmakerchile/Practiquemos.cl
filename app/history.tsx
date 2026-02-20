import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Pressable,
  Platform,
} from 'react-native';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import Animated, { FadeInDown } from 'react-native-reanimated';
import Colors from '@/constants/colors';
import { useUser, ExamResult } from '@/lib/UserContext';

function formatDate(timestamp: number): string {
  const d = new Date(timestamp);
  const day = d.getDate().toString().padStart(2, '0');
  const month = (d.getMonth() + 1).toString().padStart(2, '0');
  const year = d.getFullYear();
  const hours = d.getHours().toString().padStart(2, '0');
  const mins = d.getMinutes().toString().padStart(2, '0');
  return `${day}/${month}/${year} ${hours}:${mins}`;
}

function HistoryItem({ item, index }: { item: ExamResult; index: number }) {
  const scorePercent = Math.round(item.score * 100);

  return (
    <Animated.View entering={FadeInDown.duration(400).delay(index * 60)}>
      <View style={styles.card}>
        <View style={styles.cardLeft}>
          <View style={[styles.statusDot, { backgroundColor: item.passed ? Colors.success : Colors.warning }]} />
          <View style={styles.cardInfo}>
            <Text style={styles.cardTitle}>
              Ensayo #{item.id.slice(-4)}
            </Text>
            <Text style={styles.cardDate}>{formatDate(item.date)}</Text>
          </View>
        </View>

        <View style={styles.cardRight}>
          <Text style={[styles.cardScore, { color: item.passed ? Colors.success : Colors.warning }]}>
            {scorePercent}%
          </Text>
          <Text style={styles.cardDetail}>
            {item.correctAnswers}/{item.totalQuestions}
          </Text>
        </View>
      </View>
    </Animated.View>
  );
}

export default function HistoryScreen() {
  const insets = useSafeAreaInsets();
  const { examHistory, clearHistory } = useUser();
  const webTopInset = Platform.OS === 'web' ? 67 : 0;
  const webBottomInset = Platform.OS === 'web' ? 34 : 0;

  const passed = examHistory.filter(e => e.passed).length;
  const avgScore = examHistory.length > 0
    ? Math.round(examHistory.reduce((sum, e) => sum + e.score * 100, 0) / examHistory.length)
    : 0;

  return (
    <View style={styles.root}>
      <View style={[styles.header, { paddingTop: (insets.top || webTopInset) + 8 }]}>
        <Pressable onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="chevron-back" size={24} color={Colors.text} />
        </Pressable>
        <Text style={styles.headerTitle}>Mi progreso</Text>
        <View style={{ width: 36 }} />
      </View>

      {examHistory.length > 0 && (
        <View style={styles.summaryRow}>
          <View style={styles.summaryCard}>
            <Text style={styles.summaryValue}>{examHistory.length}</Text>
            <Text style={styles.summaryLabel}>Ensayos</Text>
          </View>
          <View style={styles.summaryCard}>
            <Text style={[styles.summaryValue, { color: Colors.success }]}>{passed}</Text>
            <Text style={styles.summaryLabel}>Aprobados</Text>
          </View>
          <View style={styles.summaryCard}>
            <Text style={[styles.summaryValue, { color: Colors.primary }]}>{avgScore}%</Text>
            <Text style={styles.summaryLabel}>Promedio</Text>
          </View>
        </View>
      )}

      <FlatList
        data={examHistory}
        keyExtractor={(item) => item.id}
        renderItem={({ item, index }) => <HistoryItem item={item} index={index} />}
        contentContainerStyle={[
          styles.list,
          { paddingBottom: (insets.bottom || webBottomInset) + 24 },
          examHistory.length === 0 && styles.emptyContainer,
        ]}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Ionicons name="document-text-outline" size={48} color={Colors.textMuted} />
            <Text style={styles.emptyTitle}>Sin ensayos aún</Text>
            <Text style={styles.emptyText}>
              Tus resultados aparecerán aquí después de completar un ensayo
            </Text>
            <Pressable
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                router.replace('/exam');
              }}
              style={({ pressed }) => [
                styles.emptyButton,
                { opacity: pressed ? 0.9 : 1 },
              ]}
            >
              <Ionicons name="play" size={18} color="#fff" />
              <Text style={styles.emptyButtonText}>Comenzar ensayo</Text>
            </Pressable>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingBottom: 12,
    backgroundColor: Colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  backBtn: {
    width: 36,
    height: 36,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 17,
    fontFamily: 'Nunito_700Bold',
    color: Colors.text,
  },
  summaryRow: {
    flexDirection: 'row',
    gap: 10,
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  summaryCard: {
    flex: 1,
    backgroundColor: Colors.surface,
    borderRadius: 14,
    padding: 14,
    alignItems: 'center',
    gap: 4,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  summaryValue: {
    fontSize: 22,
    fontFamily: 'Nunito_800ExtraBold',
    color: Colors.text,
  },
  summaryLabel: {
    fontSize: 11,
    fontFamily: 'Nunito_600SemiBold',
    color: Colors.textSecondary,
  },
  list: {
    paddingHorizontal: 20,
    gap: 8,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: Colors.surface,
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  cardLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  statusDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  cardInfo: {
    gap: 2,
  },
  cardTitle: {
    fontSize: 15,
    fontFamily: 'Nunito_700Bold',
    color: Colors.text,
  },
  cardDate: {
    fontSize: 12,
    fontFamily: 'Nunito_400Regular',
    color: Colors.textSecondary,
  },
  cardRight: {
    alignItems: 'flex-end',
    gap: 2,
  },
  cardScore: {
    fontSize: 20,
    fontFamily: 'Nunito_800ExtraBold',
  },
  cardDetail: {
    fontSize: 12,
    fontFamily: 'Nunito_400Regular',
    color: Colors.textSecondary,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  empty: {
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 40,
  },
  emptyTitle: {
    fontSize: 18,
    fontFamily: 'Nunito_700Bold',
    color: Colors.text,
  },
  emptyText: {
    fontSize: 14,
    fontFamily: 'Nunito_400Regular',
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
  },
  emptyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: Colors.primary,
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 14,
    marginTop: 8,
  },
  emptyButtonText: {
    fontSize: 15,
    fontFamily: 'Nunito_700Bold',
    color: '#fff',
  },
});
