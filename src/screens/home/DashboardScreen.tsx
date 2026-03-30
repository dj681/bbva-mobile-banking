import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
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
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { AccountCard } from '@/components/banking/AccountCard';
import { BalanceSummary } from '@/components/banking/BalanceSummary';
import { QuickActions } from '@/components/banking/QuickActions';
import { TransactionItem } from '@/components/banking/TransactionItem';
import { InvestmentItem } from '@/components/banking/InvestmentItem';
import { Avatar } from '@/components/common/Avatar';
import { Badge } from '@/components/common/Badge';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { EmptyState } from '@/components/common/EmptyState';
import { Divider } from '@/components/common/Divider';
import { useAuth } from '@/hooks/useAuth';
import { useAccounts } from '@/hooks/useAccounts';
import { useNotifications } from '@/hooks/useNotifications';
import { useTheme } from '@/hooks/useTheme';
import { useTranslation } from '@/hooks/useTranslation';
import { useAppDispatch, useAppSelector } from '@/store';
import { fetchAccounts, fetchTransactions } from '@/store/slices';
import type { Account, Transaction, HomeStackParamList, AccountsStackParamList } from '@/types';
import { formatCurrency } from '@/utils';

type DashboardNavProp = NativeStackNavigationProp<HomeStackParamList, 'Dashboard'>;

const MOCK_INVESTMENTS = [
  { id: '1', name: 'CAC 40', ticker: 'CAC', price: 7842.5, change: 1.23, changePercent: 1.23 },
  { id: '2', name: 'BNP Paribas', ticker: 'BNP', price: 64.32, change: -0.48, changePercent: -0.74 },
  { id: '3', name: 'Total Energies', ticker: 'TTE', price: 58.9, change: 0.92, changePercent: 1.58 },
];

export const DashboardScreen: React.FC = () => {
  const navigation = useNavigation<DashboardNavProp>();
  const dispatch = useAppDispatch();
  const { colors, spacing, borderRadius } = useTheme();
  const { t } = useTranslation();
  const { user } = useAuth();
  const { accounts, transactions, isLoading, fetchTransactionsList, selectAccount } = useAccounts();
  const { unreadCount } = useNotifications();

  const getGreeting = useCallback((): string => {
    const hour = new Date().getHours();
    if (hour < 12) return t('goodMorning');
    if (hour < 18) return t('goodAfternoon');
    return t('goodEvening');
  }, [t]);

  const [refreshing, setRefreshing] = useState(false);

  const defaultAccount = useMemo(
    () => accounts.find((a) => a.isDefault) ?? accounts[0] ?? null,
    [accounts],
  );

  const recentTransactions = useMemo<Transaction[]>(() => {
    const all = Object.values(
      useAppSelector.toString ? [] : [],
    );
    // Gather from all accounts
    return transactions.slice(0, 5);
  }, [transactions]);

  const totalBalance = useMemo(
    () => accounts.reduce((sum, a) => sum + a.balance, 0),
    [accounts],
  );

  const availableBalance = useMemo(
    () => accounts.reduce((sum, a) => sum + a.availableBalance, 0),
    [accounts],
  );

  const loadData = useCallback(async () => {
    await dispatch(fetchAccounts());
    if (defaultAccount) {
      await fetchTransactionsList(defaultAccount.id);
    }
  }, [dispatch, defaultAccount, fetchTransactionsList]);

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    if (defaultAccount) {
      selectAccount(defaultAccount.id);
      fetchTransactionsList(defaultAccount.id);
    }
  }, [defaultAccount?.id]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  }, [loadData]);

  const quickActions = [
    {
      id: 'transfer',
      label: t('transfer'),
      icon: 'swap-horizontal-outline' as const,
      onPress: () => navigation.navigate('TransferFlow'),
    },
    {
      id: 'pay',
      label: t('pay'),
      icon: 'receipt-outline' as const,
      onPress: () => navigation.navigate('PaymentFlow'),
    },
    {
      id: 'cards',
      label: t('cards'),
      icon: 'card-outline' as const,
      onPress: () => {},
    },
    {
      id: 'credits',
      label: t('credits'),
      icon: 'cash-outline' as const,
      onPress: () => {},
    },
    {
      id: 'invest',
      label: t('investments'),
      icon: 'trending-up-outline' as const,
      onPress: () => {},
    },
  ];

  const styles = makeStyles(colors, spacing, borderRadius);

  const renderAccountCard = useCallback(
    ({ item }: { item: Account }) => (
      <AccountCard
        account={item}
        compact
        style={styles.accountCard}
        onPress={(acc) => {
          selectAccount(acc.id);
        }}
      />
    ),
    [selectAccount, styles.accountCard],
  );

  const renderTransaction = useCallback(
    ({ item }: { item: Transaction }) => (
      <TransactionItem
        transaction={item}
        onPress={() => {}}
      />
    ),
    [],
  );

  const renderInvestmentRow = useCallback(
    (inv: (typeof MOCK_INVESTMENTS)[0]) => (
      <View key={inv.id} style={styles.investmentRow}>
        <Text style={styles.investmentName}>{inv.name}</Text>
        <Text style={styles.investmentTicker}>{inv.ticker}</Text>
        <View style={styles.investmentRight}>
          <Text style={styles.investmentPrice}>{formatCurrency(inv.price, 'EUR')}</Text>
          <Text
            style={[
              styles.investmentChange,
              { color: inv.change >= 0 ? colors.success : colors.error },
            ]}
          >
            {inv.change >= 0 ? '+' : ''}
            {inv.changePercent.toFixed(2)}%
          </Text>
        </View>
      </View>
    ),
    [styles, colors],
  );

  const ListHeader = useMemo(
    () => (
      <View>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <Avatar
              name={user ? `${user.firstName} ${user.lastName}` : 'U'}
              uri={user?.avatar}
              size={40}
            />
            <View style={styles.greetingContainer}>
              <Text style={styles.greetingText}>{getGreeting()},</Text>
              <Text style={styles.nameText}>{user?.firstName ?? 'Usuario'} !</Text>
            </View>
          </View>
          <TouchableOpacity
            style={styles.bellButton}
            onPress={() => navigation.navigate('Notifications')}
            accessibilityLabel="Notifications"
          >
            <Ionicons name="notifications-outline" size={24} color={colors.headerText} />
            {unreadCount > 0 && (
              <Badge
                label={String(unreadCount)}
                variant="error"
                style={styles.notifBadge}
              />
            )}
          </TouchableOpacity>
        </View>

        {/* Balance Summary */}
        <View style={styles.balanceContainer}>
          <BalanceSummary
            totalBalance={totalBalance}
            availableBalance={availableBalance}
            currency="EUR"
          />
        </View>

        {/* Accounts Horizontal Scroll */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t('myAccounts')}</Text>
          {isLoading && accounts.length === 0 ? (
            <LoadingSpinner />
          ) : (
            <FlatList
              data={accounts}
              horizontal
              keyExtractor={(item) => item.id}
              renderItem={renderAccountCard}
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.accountsList}
            />
          )}
        </View>

        {/* Quick Actions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t('quickActions')}</Text>
          <QuickActions actions={quickActions} />
        </View>

        {/* Recent Transactions Header */}
        <View style={[styles.section, styles.sectionHeader]}>
          <Text style={styles.sectionTitle}>{t('recentTransactions')}</Text>
          <TouchableOpacity onPress={() => {}}>
            <Text style={styles.seeAllText}>{t('seeAll')}</Text>
          </TouchableOpacity>
        </View>
      </View>
    ),
    [
      user,
      unreadCount,
      totalBalance,
      availableBalance,
      accounts,
      isLoading,
      colors,
      styles,
      renderAccountCard,
      quickActions,
      navigation,
      getGreeting,
      t,
    ],
  );

  const ListFooter = useMemo(
    () => (
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>{t('markets')}</Text>
        <View style={styles.marketCard}>
          {MOCK_INVESTMENTS.map(renderInvestmentRow)}
        </View>
      </View>
    ),
    [styles, renderInvestmentRow, t],
  );

  if (isLoading && accounts.length === 0) {
    return (
      <View style={[styles.container, styles.centered]}>
        <LoadingSpinner />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={recentTransactions}
        keyExtractor={(item) => item.id}
        renderItem={renderTransaction}
        ListHeaderComponent={ListHeader}
        ListFooterComponent={ListFooter}
        ListEmptyComponent={
          !isLoading ? (
            <EmptyState
              title={t('noTransactions')}
              message={t('noTransactionsMsg')}
              icon="receipt-outline"
            />
          ) : null
        }
        contentContainerStyle={styles.listContent}
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
    listContent: {
      paddingBottom: spacing.xxxl,
    },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      backgroundColor: colors.header,
      paddingHorizontal: spacing.md,
      paddingTop: spacing.xl,
      paddingBottom: spacing.lg,
    },
    headerLeft: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.sm,
    },
    greetingContainer: {
      marginLeft: spacing.sm,
    },
    greetingText: {
      color: colors.headerText,
      fontSize: 14,
      opacity: 0.85,
    },
    nameText: {
      color: colors.headerText,
      fontSize: 18,
      fontWeight: '700',
    },
    bellButton: {
      position: 'relative',
      padding: spacing.xs,
    },
    notifBadge: {
      position: 'absolute',
      top: -4,
      right: -4,
    },
    balanceContainer: {
      margin: spacing.md,
    },
    section: {
      paddingHorizontal: spacing.md,
      marginBottom: spacing.md,
    },
    sectionHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    sectionTitle: {
      fontSize: 16,
      fontWeight: '700',
      color: colors.text,
      marginBottom: spacing.sm,
    },
    seeAllText: {
      fontSize: 14,
      color: colors.secondary,
      fontWeight: '600',
      marginBottom: spacing.sm,
    },
    accountsList: {
      paddingRight: spacing.md,
    },
    accountCard: {
      marginRight: spacing.sm,
      width: 240,
    },
    marketCard: {
      backgroundColor: colors.card,
      borderRadius: borderRadius.lg,
      padding: spacing.md,
      borderWidth: 1,
      borderColor: colors.cardBorder,
    },
    investmentRow: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: spacing.sm,
      borderBottomWidth: StyleSheet.hairlineWidth,
      borderBottomColor: colors.divider,
    },
    investmentName: {
      flex: 1,
      fontSize: 14,
      fontWeight: '600',
      color: colors.text,
    },
    investmentTicker: {
      fontSize: 12,
      color: colors.textSecondary,
      marginRight: spacing.md,
    },
    investmentRight: {
      alignItems: 'flex-end',
    },
    investmentPrice: {
      fontSize: 14,
      fontWeight: '700',
      color: colors.text,
    },
    investmentChange: {
      fontSize: 12,
      fontWeight: '600',
    },
  });

export default DashboardScreen;
