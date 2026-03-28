import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  FlatList,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RouteProp } from '@react-navigation/native';

import { AccountCard } from '@/components/banking/AccountCard';
import { TransactionItem } from '@/components/banking/TransactionItem';
import { SearchBar } from '@/components/common/SearchBar';
import { Badge } from '@/components/common/Badge';
import { Card } from '@/components/common/Card';
import { Button } from '@/components/common/Button';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { EmptyState } from '@/components/common/EmptyState';
import { Divider } from '@/components/common/Divider';
import { useAccounts } from '@/hooks/useAccounts';
import { useTheme } from '@/hooks/useTheme';
import { useAppDispatch } from '@/store';
import { fetchTransactions } from '@/store/slices';
import type { Account, Transaction, AccountsStackParamList } from '@/types';
import { formatCurrency, formatIBAN, formatDate } from '@/utils';

type AccountDetailsNavProp = NativeStackNavigationProp<AccountsStackParamList, 'AccountDetails'>;
type AccountDetailsRouteProp = RouteProp<AccountsStackParamList, 'AccountDetails'>;

type TabKey = 'transactions' | 'info';

export const AccountDetailsScreen: React.FC = () => {
  const navigation = useNavigation<AccountDetailsNavProp>();
  const route = useRoute<AccountDetailsRouteProp>();
  const { accountId } = route.params;
  const dispatch = useAppDispatch();
  const { colors, spacing, borderRadius } = useTheme();
  const {
    accounts,
    transactions,
    isLoading,
    selectAccount,
    fetchTransactionsList,
    searchTransactions,
  } = useAccounts();

  const [activeTab, setActiveTab] = useState<TabKey>('transactions');
  const [searchQuery, setSearchQuery] = useState('');
  const [refreshing, setRefreshing] = useState(false);
  const [page, setPage] = useState(1);
  const [loadingMore, setLoadingMore] = useState(false);

  const account = useMemo(
    () => accounts.find((a) => a.id === accountId) ?? null,
    [accounts, accountId],
  );

  useEffect(() => {
    selectAccount(accountId);
    fetchTransactionsList(accountId);
  }, [accountId]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchTransactionsList(accountId);
    setRefreshing(false);
  }, [accountId, fetchTransactionsList]);

  const handleSearch = useCallback(
    (q: string) => {
      setSearchQuery(q);
      searchTransactions(q);
    },
    [searchTransactions],
  );

  const handleLoadMore = useCallback(async () => {
    if (loadingMore) return;
    setLoadingMore(true);
    await dispatch(fetchTransactions({ accountId, page: page + 1 }));
    setPage((p) => p + 1);
    setLoadingMore(false);
  }, [dispatch, accountId, page, loadingMore]);

  const styles = makeStyles(colors, spacing, borderRadius);

  const renderTransaction = useCallback(
    ({ item }: { item: Transaction }) => (
      <TransactionItem
        transaction={item}
        onPress={() =>
          navigation.navigate('TransactionDetails', {
            transactionId: item.id,
            accountId,
          })
        }
      />
    ),
    [navigation, accountId],
  );

  const TabBar = (
    <View style={styles.tabBar}>
      {(['transactions', 'info'] as TabKey[]).map((tab) => (
        <TouchableOpacity
          key={tab}
          style={[styles.tab, activeTab === tab && styles.tabActive]}
          onPress={() => setActiveTab(tab)}
        >
          <Text style={[styles.tabText, activeTab === tab && styles.tabTextActive]}>
            {tab === 'transactions' ? 'Transactions' : 'Infos du compte'}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );

  const AccountInfoContent = account ? (
    <View style={styles.infoContainer}>
      {[
        { label: 'Titulaire', value: account.name },
        { label: 'Numéro de compte', value: account.accountNumber },
        { label: 'IBAN', value: formatIBAN(account.iban) },
        { label: 'BIC / SWIFT', value: 'BBVAESMMXXX' },
        {
          label: 'Type de compte',
          value:
            account.type === 'checking'
              ? 'Compte courant'
              : account.type === 'savings'
              ? 'Compte épargne'
              : account.type === 'investment'
              ? 'Compte investissement'
              : 'Compte crédit',
        },
        { label: 'Devise', value: account.currency },
        { label: "Date d'ouverture", value: formatDate(account.createdAt) },
        ...(account.interestRate !== undefined
          ? [{ label: "Taux d'intérêt", value: `${account.interestRate}%` }]
          : []),
      ].map(({ label, value }) => (
        <View key={label} style={styles.infoRow}>
          <Text style={styles.infoLabel}>{label}</Text>
          <Text style={styles.infoValue} selectable>
            {value}
          </Text>
        </View>
      ))}
    </View>
  ) : null;

  const ListHeader = account ? (
    <View>
      {/* Account card */}
      <View style={styles.accountCardContainer}>
        <AccountCard account={account} />
      </View>

      {/* Balance details */}
      <View style={styles.balanceDetails}>
        <View style={styles.balanceItem}>
          <Text style={styles.balanceLabel}>Solde total</Text>
          <Text style={styles.balanceValue}>{formatCurrency(account.balance, account.currency)}</Text>
        </View>
        <Divider vertical style={styles.balanceDivider} />
        <View style={styles.balanceItem}>
          <Text style={styles.balanceLabel}>Disponible</Text>
          <Text style={[styles.balanceValue, { color: colors.success }]}>
            {formatCurrency(account.availableBalance, account.currency)}
          </Text>
        </View>
        <Divider vertical style={styles.balanceDivider} />
        <View style={styles.balanceItem}>
          <Text style={styles.balanceLabel}>Réservé</Text>
          <Text style={[styles.balanceValue, { color: colors.warning }]}>
            {formatCurrency(account.balance - account.availableBalance, account.currency)}
          </Text>
        </View>
      </View>

      {/* Quick Actions */}
      <View style={styles.quickActions}>
        {[
          { icon: 'swap-horizontal-outline' as const, label: 'Virement', onPress: () => {} },
          { icon: 'receipt-outline' as const, label: 'Payer', onPress: () => {} },
          { icon: 'document-text-outline' as const, label: 'Relevé', onPress: () => {} },
        ].map((action) => (
          <TouchableOpacity
            key={action.label}
            style={styles.quickAction}
            onPress={action.onPress}
          >
            <View style={styles.quickActionIcon}>
              <Ionicons name={action.icon} size={22} color={colors.primary} />
            </View>
            <Text style={styles.quickActionLabel}>{action.label}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Tabs */}
      {TabBar}

      {/* Search bar for transactions tab */}
      {activeTab === 'transactions' && (
        <View style={styles.searchContainer}>
          <SearchBar
            value={searchQuery}
            onChangeText={handleSearch}
            placeholder="Rechercher une transaction..."
          />
        </View>
      )}
    </View>
  ) : null;

  if (!account && !isLoading) {
    return (
      <View style={[styles.container, styles.centered]}>
        <EmptyState
          title="Compte introuvable"
          message="Ce compte n'existe pas ou a été supprimé."
          icon="alert-circle-outline"
        />
      </View>
    );
  }

  if (activeTab === 'info') {
    return (
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {ListHeader}
        {AccountInfoContent}
      </ScrollView>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={transactions}
        keyExtractor={(item) => item.id}
        renderItem={renderTransaction}
        ListHeaderComponent={ListHeader}
        ListEmptyComponent={
          isLoading ? (
            <LoadingSpinner />
          ) : (
            <EmptyState
              title="Aucune transaction"
              message="Aucune transaction trouvée pour ce compte."
              icon="receipt-outline"
            />
          )
        }
        ListFooterComponent={loadingMore ? <LoadingSpinner /> : null}
        contentContainerStyle={styles.listContent}
        onEndReached={handleLoadMore}
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
    </View>
  );
};

const makeStyles = (
  colors: ReturnType<typeof useTheme>['colors'],
  spacing: ReturnType<typeof useTheme>['spacing'],
  borderRadius: ReturnType<typeof useTheme>['borderRadius'],
) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    centered: {
      justifyContent: 'center',
      alignItems: 'center',
    },
    scrollContent: {
      paddingBottom: spacing.xxxl,
    },
    listContent: {
      paddingBottom: spacing.xxxl,
    },
    accountCardContainer: {
      margin: spacing.md,
    },
    balanceDetails: {
      flexDirection: 'row',
      backgroundColor: colors.card,
      marginHorizontal: spacing.md,
      borderRadius: borderRadius.lg,
      padding: spacing.md,
      borderWidth: 1,
      borderColor: colors.cardBorder,
      marginBottom: spacing.md,
    },
    balanceItem: {
      flex: 1,
      alignItems: 'center',
    },
    balanceDivider: {
      height: '100%',
    },
    balanceLabel: {
      fontSize: 11,
      color: colors.textSecondary,
      marginBottom: spacing.xs,
      textAlign: 'center',
    },
    balanceValue: {
      fontSize: 14,
      fontWeight: '700',
      color: colors.text,
      textAlign: 'center',
    },
    quickActions: {
      flexDirection: 'row',
      justifyContent: 'space-around',
      paddingHorizontal: spacing.md,
      marginBottom: spacing.md,
    },
    quickAction: {
      alignItems: 'center',
    },
    quickActionIcon: {
      width: 52,
      height: 52,
      borderRadius: 26,
      backgroundColor: colors.surface,
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: spacing.xs,
      borderWidth: 1,
      borderColor: colors.border,
    },
    quickActionLabel: {
      fontSize: 12,
      color: colors.text,
      fontWeight: '500',
    },
    tabBar: {
      flexDirection: 'row',
      backgroundColor: colors.surface,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    tab: {
      flex: 1,
      paddingVertical: spacing.md,
      alignItems: 'center',
    },
    tabActive: {
      borderBottomWidth: 2,
      borderBottomColor: colors.primary,
    },
    tabText: {
      fontSize: 14,
      color: colors.textSecondary,
      fontWeight: '500',
    },
    tabTextActive: {
      color: colors.primary,
      fontWeight: '700',
    },
    searchContainer: {
      paddingHorizontal: spacing.md,
      paddingVertical: spacing.sm,
      backgroundColor: colors.surface,
    },
    infoContainer: {
      marginHorizontal: spacing.md,
      marginTop: spacing.md,
      backgroundColor: colors.card,
      borderRadius: borderRadius.lg,
      borderWidth: 1,
      borderColor: colors.cardBorder,
      overflow: 'hidden',
    },
    infoRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
      paddingHorizontal: spacing.md,
      paddingVertical: spacing.sm + 2,
      borderBottomWidth: StyleSheet.hairlineWidth,
      borderBottomColor: colors.divider,
    },
    infoLabel: {
      fontSize: 13,
      color: colors.textSecondary,
      flex: 1,
    },
    infoValue: {
      fontSize: 13,
      color: colors.text,
      fontWeight: '500',
      flex: 2,
      textAlign: 'right',
    },
  });

export default AccountDetailsScreen;
