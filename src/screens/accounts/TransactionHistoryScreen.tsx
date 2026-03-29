import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  FlatList,
  RefreshControl,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';
import type { RouteProp } from '@react-navigation/native';

import { TransactionItem } from '@/components/banking/TransactionItem';
import { SearchBar } from '@/components/common/SearchBar';
import { Badge } from '@/components/common/Badge';
import { Button } from '@/components/common/Button';
import { Modal } from '@/components/common/Modal';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { EmptyState } from '@/components/common/EmptyState';
import { useAccounts } from '@/hooks/useAccounts';
import { useTheme } from '@/hooks/useTheme';
import { useAppDispatch } from '@/store';
import { fetchTransactions } from '@/store/slices';
import type { AccountsStackParamList, Transaction, TransactionType } from '@/types';
import { formatDate } from '@/utils';

type TransactionHistoryRouteProp = RouteProp<AccountsStackParamList, 'TransactionHistory'>;

type FilterChip = 'all' | TransactionType;

const FILTER_CHIPS: { key: FilterChip; label: string }[] = [
  { key: 'all', label: 'Todos' },
  { key: 'credit', label: 'Créditos' },
  { key: 'debit', label: 'Débitos' },
  { key: 'transfer', label: 'Transferencias' },
];

function groupByDate(transactions: Transaction[]): { date: string; data: Transaction[] }[] {
  const map = new Map<string, Transaction[]>();
  for (const t of transactions) {
    const key = formatDate(t.date, 'dd/MM/yyyy');
    if (!map.has(key)) map.set(key, []);
    map.get(key)!.push(t);
  }
  return Array.from(map.entries()).map(([date, data]) => ({ date, data }));
}

export const TransactionHistoryScreen: React.FC = () => {
  const route = useRoute<TransactionHistoryRouteProp>();
  const { accountId } = route.params;
  const dispatch = useAppDispatch();
  const { colors, spacing, borderRadius } = useTheme();
  const { transactions, isLoading, fetchTransactionsList, filterTransactions, searchTransactions } =
    useAccounts();

  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState<FilterChip>('all');
  const [refreshing, setRefreshing] = useState(false);
  const [page, setPage] = useState(1);
  const [loadingMore, setLoadingMore] = useState(false);
  const [exportModalVisible, setExportModalVisible] = useState(false);

  useEffect(() => {
    fetchTransactionsList(accountId);
  }, [accountId]);

  const filtered = useMemo(() => {
    let result = transactions;
    if (activeFilter !== 'all') {
      result = result.filter((t) => t.type === activeFilter);
    }
    return result;
  }, [transactions, activeFilter]);

  const grouped = useMemo(() => groupByDate(filtered), [filtered]);

  // Flatten grouped data for FlatList
  type ListItem =
    | { kind: 'header'; date: string; id: string }
    | { kind: 'transaction'; transaction: Transaction; id: string };

  const flatData = useMemo<ListItem[]>(() => {
    const items: ListItem[] = [];
    for (const group of grouped) {
      items.push({ kind: 'header', date: group.date, id: `header-${group.date}` });
      for (const t of group.data) {
        items.push({ kind: 'transaction', transaction: t, id: t.id });
      }
    }
    return items;
  }, [grouped]);

  const handleSearch = useCallback(
    (q: string) => {
      setSearchQuery(q);
      searchTransactions(q);
    },
    [searchTransactions],
  );

  const handleFilterPress = useCallback(
    (key: FilterChip) => {
      setActiveFilter(key);
      if (key === 'all') {
        filterTransactions({});
      } else {
        filterTransactions({ type: key });
      }
    },
    [filterTransactions],
  );

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchTransactionsList(accountId);
    setRefreshing(false);
  }, [accountId, fetchTransactionsList]);

  const onLoadMore = useCallback(async () => {
    if (loadingMore) return;
    setLoadingMore(true);
    await dispatch(fetchTransactions({ accountId, page: page + 1 }));
    setPage((p) => p + 1);
    setLoadingMore(false);
  }, [dispatch, accountId, page, loadingMore]);

  const styles = makeStyles(colors, spacing, borderRadius);

  const renderItem = useCallback(
    ({ item }: { item: ListItem }) => {
      if (item.kind === 'header') {
        return (
          <View style={styles.dateHeader}>
            <Text style={styles.dateHeaderText}>{item.date}</Text>
          </View>
        );
      }
      return <TransactionItem transaction={item.transaction} onPress={() => {}} />;
    },
    [styles],
  );

  const ListHeader = (
    <View>
      {/* Search */}
      <View style={styles.searchContainer}>
        <SearchBar
          value={searchQuery}
          onChangeText={handleSearch}
          placeholder="Buscar..."
        />
      </View>

      {/* Filter Chips */}
      <View style={styles.chips}>
        {FILTER_CHIPS.map((chip) => (
          <TouchableOpacity
            key={chip.key}
            style={[styles.chip, activeFilter === chip.key && styles.chipActive]}
            onPress={() => handleFilterPress(chip.key)}
          >
            <Text style={[styles.chipText, activeFilter === chip.key && styles.chipTextActive]}>
              {chip.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      {/* Header Actions */}
      <View style={styles.headerActions}>
        <Text style={styles.resultCount}>{filtered.length} transaction(s)</Text>
        <TouchableOpacity
          style={styles.exportButton}
          onPress={() => setExportModalVisible(true)}
        >
          <Ionicons name="download-outline" size={18} color={colors.primary} />
          <Text style={styles.exportText}>Exportar</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={flatData}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        ListHeaderComponent={ListHeader}
        ListEmptyComponent={
          isLoading ? (
            <LoadingSpinner />
          ) : (
            <EmptyState
              title="Sin transacciones"
              message="No hay resultados para los criterios seleccionados."
              icon="search-outline"
            />
          )
        }
        ListFooterComponent={loadingMore ? <LoadingSpinner /> : null}
        contentContainerStyle={styles.listContent}
        onEndReached={onLoadMore}
        onEndReachedThreshold={0.3}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={colors.primary}
            colors={[colors.primary]}
          />
        }
        showsVerticalScrollIndicator={false}
      />

      {/* Export Modal */}
      <Modal
        visible={exportModalVisible}
        onClose={() => setExportModalVisible(false)}
        title="Exportar transacciones"
      >
        <View style={styles.exportModalContent}>
          {['PDF', 'CSV', 'Excel'].map((format) => (
            <TouchableOpacity
              key={format}
              style={styles.exportOption}
              onPress={() => setExportModalVisible(false)}
            >
              <Ionicons
                name={format === 'PDF' ? 'document-outline' : 'grid-outline'}
                size={22}
                color={colors.primary}
              />
              <Text style={styles.exportOptionText}>Exportar en {format}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </Modal>
    </View>
  );
};

const makeStyles = (
  colors: ReturnType<typeof useTheme>['colors'],
  spacing: ReturnType<typeof useTheme>['spacing'],
  borderRadius: ReturnType<typeof useTheme>['borderRadius'],
) =>
  StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background },
    headerActions: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingHorizontal: spacing.md,
      paddingVertical: spacing.sm,
      backgroundColor: colors.surface,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    resultCount: { fontSize: 13, color: colors.textSecondary },
    exportButton: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs },
    exportText: { fontSize: 13, color: colors.primary, fontWeight: '600' },
    searchContainer: { padding: spacing.md, backgroundColor: colors.surface },
    chips: {
      flexDirection: 'row',
      paddingHorizontal: spacing.md,
      paddingBottom: spacing.sm,
      backgroundColor: colors.surface,
      gap: spacing.xs,
    },
    chip: {
      paddingHorizontal: spacing.md,
      paddingVertical: spacing.xs + 2,
      borderRadius: borderRadius.full,
      backgroundColor: colors.surfaceVariant,
      borderWidth: 1,
      borderColor: colors.border,
    },
    chipActive: { backgroundColor: colors.primary, borderColor: colors.primary },
    chipText: { fontSize: 13, color: colors.textSecondary, fontWeight: '500' },
    chipTextActive: { color: '#FFFFFF', fontWeight: '700' },
    listContent: { paddingBottom: spacing.xxxl },
    dateHeader: {
      paddingHorizontal: spacing.md,
      paddingVertical: spacing.xs + 2,
      backgroundColor: colors.surfaceVariant,
    },
    dateHeaderText: { fontSize: 12, fontWeight: '700', color: colors.textSecondary, textTransform: 'uppercase' },
    exportModalContent: { paddingVertical: spacing.sm },
    exportOption: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.md,
      paddingVertical: spacing.md,
      paddingHorizontal: spacing.md,
      borderBottomWidth: StyleSheet.hairlineWidth,
      borderBottomColor: colors.divider,
    },
    exportOptionText: { fontSize: 15, color: colors.text, fontWeight: '500' },
  });

export default TransactionHistoryScreen;
