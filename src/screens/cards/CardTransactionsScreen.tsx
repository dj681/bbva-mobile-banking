import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  RefreshControl,
  Platform,
} from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { useCards } from '@/hooks/useCards';
import { useTheme } from '@/hooks/useTheme';
import { EmptyState } from '@/components/common/EmptyState';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { Badge } from '@/components/common/Badge';
import { formatCurrency, formatDate } from '@/utils/formatters';
import type { CardsStackParamList, CardTransaction } from '@/types';

type Route = RouteProp<CardsStackParamList, 'CardTransactions'>;

const MOCK_CARD_TRANSACTIONS: CardTransaction[] = [];

const CATEGORIES = ['Todas', 'Alimentación', 'Transporte', 'Ocio', 'Restaurante', 'Combustible', 'Retirada', 'Suscripción'];

export const CardTransactionsScreen: React.FC = () => {
  const navigation = useNavigation();
  const route = useRoute<Route>();
  const { cardId } = route.params;
  const { theme } = useTheme();
  const { cards, isLoading } = useCards();

  const card = cards.find(c => c.id === cardId);

  const [refreshing, setRefreshing] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('Todas');
  const [dateFilter, setDateFilter] = useState('');
  const [transactions, setTransactions] = useState<CardTransaction[]>(MOCK_CARD_TRANSACTIONS);

  const isDark = theme === 'dark';
  const colors = {
    bg: isDark ? '#1a1a2e' : '#F5F5F5',
    card: isDark ? '#16213e' : '#FFFFFF',
    text: isDark ? '#FFFFFF' : '#003366',
    subtext: isDark ? '#aaaaaa' : '#666666',
    primary: '#003366',
    secondary: '#00A8E8',
    border: isDark ? '#333355' : '#E0E0E0',
    success: '#4CAF50',
    error: '#F44336',
  };
  const styles = makeStyles(colors);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await new Promise(r => setTimeout(r, 1000));
    setRefreshing(false);
  }, []);

  const filtered = transactions.filter(tx =>
    (selectedCategory === 'Todas' || tx.category === selectedCategory)
  );

  const currentMonthSpend = transactions
    .filter(tx => tx.type === 'purchase' && tx.amount < 0)
    .reduce((sum, tx) => sum + Math.abs(tx.amount), 0);

  const categoryIcon = (cat: string) => {
    const icons: Record<string, string> = { Alimentación: '🛒', Transporte: '🚌', Ocio: '🎮', Restaurante: '🍽️', Combustible: '⛽', Retirada: '🏧', Suscripción: '📺', Reembolso: '↩️' };
    return icons[cat] || '💳';
  };

  const renderTransaction = ({ item }: { item: CardTransaction }) => (
    <View style={styles.txItem}>
      <View style={styles.txIconWrap}>
        <Text style={styles.txIcon}>{categoryIcon(item.category)}</Text>
      </View>
      <View style={styles.txInfo}>
        <Text style={styles.txMerchant}>{item.merchant}</Text>
        <Text style={styles.txMeta}>{item.category} • {formatDate(item.date)}</Text>
        {item.isPending && <Text style={styles.pendingBadge}>Pendiente</Text>}
      </View>
      <Text style={[styles.txAmount, { color: item.amount < 0 ? colors.error : colors.success }]}>
        {item.amount > 0 ? '+' : ''}{formatCurrency(item.amount, item.currency)}
      </Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}><Text style={styles.backText}>‹ Volver</Text></TouchableOpacity>
        <View style={{ alignItems: 'center' }}>
          <Text style={styles.headerTitle}>{card?.holderName ?? 'Tarjeta'}</Text>
          <Text style={styles.headerSub}>{card?.cardNumber ?? ''}</Text>
        </View>
        <View style={{ width: 60 }} />
      </View>

      <View style={styles.summaryCard}>
        <Text style={styles.summaryLabel}>Gastos del mes</Text>
        <Text style={styles.summaryAmount}>{formatCurrency(currentMonthSpend, 'EUR')}</Text>
        <Text style={styles.summaryCount}>{filtered.filter(t => t.amount < 0).length} operación(es)</Text>
      </View>

      <FlatList
        data={filtered}
        keyExtractor={item => item.id}
        renderItem={renderTransaction}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.secondary} />}
        ListHeaderComponent={
          <View>
            <FlatList
              data={CATEGORIES}
              horizontal
              showsHorizontalScrollIndicator={false}
              keyExtractor={c => c}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={[styles.categoryChip, selectedCategory === item && styles.categoryChipActive]}
                  onPress={() => setSelectedCategory(item)}
                >
                  <Text style={[styles.categoryChipText, selectedCategory === item && styles.categoryChipTextActive]}>{item}</Text>
                </TouchableOpacity>
              )}
              contentContainerStyle={styles.categoryList}
            />
          </View>
        }
        ListEmptyComponent={
          isLoading ? <LoadingSpinner /> : <EmptyState title="Sin transacciones" description="No se encontraron transacciones para esta tarjeta" />
        }
        contentContainerStyle={{ paddingBottom: 20 }}
      />
    </View>
  );
};

const makeStyles = (colors: Record<string, string>) => StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: colors.primary, padding: 16, paddingTop: Platform.OS === 'ios' ? 50 : 16 },
  backText: { color: '#FFFFFF', fontSize: 18, width: 60 },
  headerTitle: { color: '#FFFFFF', fontSize: 16, fontWeight: '700' },
  headerSub: { color: 'rgba(255,255,255,0.7)', fontSize: 12 },
  summaryCard: { backgroundColor: colors.primary, padding: 20, alignItems: 'center', paddingBottom: 24 },
  summaryLabel: { color: 'rgba(255,255,255,0.7)', fontSize: 13 },
  summaryAmount: { color: '#FFFFFF', fontSize: 32, fontWeight: '700', marginTop: 4 },
  summaryCount: { color: 'rgba(255,255,255,0.7)', fontSize: 12, marginTop: 4 },
  categoryList: { paddingHorizontal: 16, paddingVertical: 12, gap: 8 },
  categoryChip: { paddingHorizontal: 14, paddingVertical: 7, borderRadius: 20, backgroundColor: colors.card, marginRight: 8, borderWidth: 1, borderColor: colors.border },
  categoryChipActive: { backgroundColor: colors.secondary, borderColor: colors.secondary },
  categoryChipText: { color: colors.subtext, fontSize: 13, fontWeight: '500' },
  categoryChipTextActive: { color: '#FFFFFF' },
  txItem: { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.card, marginHorizontal: 16, marginBottom: 8, borderRadius: 10, padding: 14 },
  txIconWrap: { width: 42, height: 42, borderRadius: 21, backgroundColor: colors.bg, alignItems: 'center', justifyContent: 'center', marginRight: 12 },
  txIcon: { fontSize: 20 },
  txInfo: { flex: 1 },
  txMerchant: { fontSize: 14, fontWeight: '600', color: colors.text },
  txMeta: { fontSize: 12, color: colors.subtext, marginTop: 2 },
  pendingBadge: { fontSize: 11, color: '#FF9800', marginTop: 2 },
  txAmount: { fontSize: 14, fontWeight: '700' },
});

export default CardTransactionsScreen;
