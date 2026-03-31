import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  FlatList,
  RefreshControl,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { AccountCard } from '@/components/banking/AccountCard';
import { BalanceSummary } from '@/components/banking/BalanceSummary';
import { Badge } from '@/components/common/Badge';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { EmptyState } from '@/components/common/EmptyState';
import { Divider } from '@/components/common/Divider';
import { useAccounts } from '@/hooks/useAccounts';
import { useTheme } from '@/hooks/useTheme';
import { useTranslation } from '@/hooks/useTranslation';
import { useAppDispatch } from '@/store';
import { fetchAccounts } from '@/store/slices';
import type { Account, AccountsStackParamList } from '@/types';
import { formatCurrency, formatIBAN } from '@/utils';

type AccountsListNavProp = NativeStackNavigationProp<AccountsStackParamList, 'AccountsList'>;

export const AccountsListScreen: React.FC = () => {
  const navigation = useNavigation<AccountsListNavProp>();
  const dispatch = useAppDispatch();
  const { colors, spacing, borderRadius } = useTheme();
  const { t } = useTranslation();
  const { accounts, isLoading, selectAccount } = useAccounts();

  const accountTypeLabels: Record<string, string> = {
    checking: t('accountTypeChecking'),
    savings: t('accountTypeSavings'),
    investment: t('accountTypeInvestment'),
    credit: t('accountTypeCredit'),
  };

  const [refreshing, setRefreshing] = useState(false);

  const totalBalance = useMemo(
    () => accounts.reduce((sum, a) => sum + a.balance, 0),
    [accounts],
  );

  const availableBalance = useMemo(
    () => accounts.reduce((sum, a) => sum + a.availableBalance, 0),
    [accounts],
  );

  const load = useCallback(async () => {
    await dispatch(fetchAccounts());
  }, [dispatch]);

  useEffect(() => {
    load();
  }, []);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await load();
    setRefreshing(false);
  }, [load]);

  const handleAccountPress = useCallback(
    (account: Account) => {
      selectAccount(account.id);
      navigation.navigate('AccountDetails', { accountId: account.id });
    },
    [navigation, selectAccount],
  );

  const styles = makeStyles(colors, spacing, borderRadius);

  const renderAccountItem = useCallback(
    ({ item, index }: { item: Account; index: number }) => (
      <View style={styles.cardWrapper}>
        <AccountCard
          account={item}
          onPress={handleAccountPress}
          style={styles.accountCard}
        />
        <View style={styles.accountMeta}>
          <View style={styles.metaRow}>
            <Badge
              label={accountTypeLabels[item.type] ?? item.type}
              variant={
                item.type === 'checking'
                  ? 'info'
                  : item.type === 'savings'
                  ? 'success'
                  : item.type === 'credit'
                  ? 'error'
                  : 'default'
              }
            />
            {item.isDefault && (
              <Badge label={t('defaultAccount')} variant="warning" style={styles.defaultBadge} />
            )}
          </View>
          <Text style={styles.ibanText}>
            IBAN: {formatIBAN(item.iban).replace(/(.{4}\s){3}/, '•••• •••• •••• ')
              .substring(0, 22)}…
          </Text>
        </View>
        {index < accounts.length - 1 && <Divider style={styles.divider} />}
      </View>
    ),
    [accounts.length, handleAccountPress, styles],
  );

  const ListHeader = (
    <View style={styles.header}>
      <Text style={styles.headerTitle}>{t('myAccounts2')}</Text>
      <View style={styles.summaryContainer}>
        <BalanceSummary
          totalBalance={totalBalance}
          availableBalance={availableBalance}
          currency="EUR"
        />
      </View>
      <Text style={styles.accountCount}>
        {accounts.length} {t('accountsCountUnit')}
      </Text>
    </View>
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
        data={accounts}
        keyExtractor={(item) => item.id}
        renderItem={renderAccountItem}
        ListHeaderComponent={ListHeader}
        ListEmptyComponent={
          <EmptyState
            title={t('noAccounts')}
            message={t('noAccountsMsg')}
            icon="wallet-outline"
          />
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
      backgroundColor: colors.header,
      paddingHorizontal: spacing.md,
      paddingTop: spacing.xl,
      paddingBottom: spacing.lg,
    },
    headerTitle: {
      fontSize: 24,
      fontWeight: '700',
      color: '#FFFFFF',
      marginBottom: spacing.md,
    },
    summaryContainer: {
      marginBottom: spacing.md,
    },
    accountCount: {
      fontSize: 13,
      color: 'rgba(255,255,255,0.75)',
    },
    cardWrapper: {
      paddingHorizontal: spacing.md,
      paddingTop: spacing.md,
    },
    accountCard: {
      marginBottom: spacing.sm,
    },
    accountMeta: {
      paddingHorizontal: spacing.xs,
      marginBottom: spacing.sm,
    },
    metaRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.xs,
      marginBottom: spacing.xs,
    },
    defaultBadge: {
      marginLeft: spacing.xs,
    },
    ibanText: {
      fontSize: 12,
      color: colors.textSecondary,
      fontFamily: 'monospace',
    },
    divider: {
      marginTop: spacing.xs,
    },
  });

export default AccountsListScreen;
