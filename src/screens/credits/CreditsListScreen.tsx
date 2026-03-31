import React, { useEffect, useMemo } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Platform,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useTheme } from '@/hooks/useTheme';
import { useTranslation } from '@/hooks/useTranslation';
import { useAppDispatch, useAppSelector } from '@/store';
import { fetchCredits } from '@/store/slices';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { EmptyState } from '@/components/common/EmptyState';
import { Button } from '@/components/common/Button';
import { Badge } from '@/components/common/Badge';
import { formatCurrency, formatDate } from '@/utils/formatters';
import type { CreditsStackParamList, Credit } from '@/types';

type Nav = NativeStackNavigationProp<CreditsStackParamList, 'CreditsList'>;

const typeIcon = (type: string) => ({ mortgage: '🏠', auto: '🚗', personal: '💼', business: '🏢', student: '🎓' }[type] || '💳');

export const CreditsListScreen: React.FC = () => {
  const dispatch = useAppDispatch();
  const navigation = useNavigation<Nav>();
  const { theme } = useTheme();
  const { t } = useTranslation();
  const { credits, isLoading } = useAppSelector((state) => state.credits);

  const typeLabel = (type: string) => ({
    mortgage: t('creditTypeMortgage'),
    auto: t('creditTypeAuto'),
    personal: t('creditTypePersonal'),
    business: t('creditTypeBusiness'),
    student: t('creditTypeStudent'),
  }[type] || type);

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

  useEffect(() => {
    dispatch(fetchCredits());
  }, [dispatch]);

  const totalDebt = useMemo(() => credits.reduce((s, c) => s + c.remainingAmount, 0), [credits]);
  const nextPayment = useMemo(() => credits.reduce((s, c) => s + c.nextPaymentAmount, 0), [credits]);

  if (isLoading && credits.length === 0) {
    return <LoadingSpinner />;
  }

  const renderCredit = ({ item }: { item: Credit }) => {
    const progress = ((item.originalAmount - item.remainingAmount) / item.originalAmount) * 100;
    return (
      <TouchableOpacity style={styles.creditCard} onPress={() => navigation.navigate('CreditDetails', { creditId: item.id })}>
        <View style={styles.creditHeader}>
          <View style={styles.creditIconWrap}>
            <Text style={styles.creditIcon}>{typeIcon(item.type)}</Text>
          </View>
          <View style={styles.creditInfo}>
            <Text style={styles.creditName} numberOfLines={2}>{item.name}</Text>
            <Text style={styles.creditType}>{typeLabel(item.type)} • {item.interestRate}%</Text>
          </View>
          <Badge label={item.status === 'closed' ? t('creditStatusClosed') : t('creditStatusActive')} variant={item.status === 'closed' ? 'info' : 'success'} />
        </View>
        <View style={styles.progressRow}>
          <View style={styles.progressBg}>
            <View style={[styles.progressFill, { width: `${progress}%` as any }]} />
          </View>
          <Text style={styles.progressText}>{Math.round(progress)}%</Text>
        </View>
        <View style={styles.creditMetrics}>
          <View style={styles.metric}><Text style={styles.metricLabel}>{t('txStatusPending')}</Text><Text style={styles.metricVal}>{formatCurrency(item.remainingAmount, item.currency)}</Text></View>
          <View style={styles.metric}><Text style={styles.metricLabel}>{t('installment')}</Text><Text style={styles.metricVal}>{formatCurrency(item.monthlyPayment, item.currency)}</Text></View>
          <View style={styles.metric}><Text style={styles.metricLabel}>{t('nextPayment')}</Text><Text style={styles.metricVal}>{formatDate(item.nextPaymentDate)}</Text></View>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>{t('myCredits')}</Text>
      </View>
      <FlatList
        data={credits}
        keyExtractor={c => c.id}
        renderItem={renderCredit}
        ListHeaderComponent={
          <View style={styles.summaryCard}>
            <Text style={styles.summaryTitle}>{t('creditSummaryTitle')}</Text>
            <View style={styles.summaryRow}>
              <View style={styles.summaryItem}>
                <Text style={styles.summaryLabel}>{t('totalPendingBalance')}</Text>
                <Text style={styles.summaryVal}>{formatCurrency(totalDebt, 'EUR')}</Text>
              </View>
              <View style={styles.summaryDivider} />
              <View style={styles.summaryItem}>
                <Text style={styles.summaryLabel}>{t('nextDueDate')}</Text>
                <Text style={styles.summaryVal}>{formatCurrency(nextPayment, 'EUR')}</Text>
              </View>
            </View>
          </View>
        }
        ListEmptyComponent={<EmptyState title={t('noCredits')} description={t('noCreditsMsg')} />}
        ListFooterComponent={
          <View style={styles.actionBtns}>
            <Button title={t('simulateCredit')} onPress={() => navigation.navigate('CreditSimulator')} variant="outline" style={styles.actionBtn} />
            <Button title={t('requestCredit')} onPress={() => navigation.navigate('CreditRequest')} style={styles.actionBtn} />
          </View>
        }
        contentContainerStyle={{ paddingBottom: 40 }}
      />
    </View>
  );
};

const makeStyles = (colors: Record<string, string>) => StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  header: { backgroundColor: colors.primary, padding: 16, paddingTop: Platform.OS === 'ios' ? 50 : 16 },
  headerTitle: { color: '#FFFFFF', fontSize: 20, fontWeight: '700' },
  summaryCard: { backgroundColor: colors.primary, margin: 16, borderRadius: 14, padding: 16 },
  summaryTitle: { color: 'rgba(255,255,255,0.8)', fontSize: 13, marginBottom: 12 },
  summaryRow: { flexDirection: 'row', alignItems: 'center' },
  summaryItem: { flex: 1, alignItems: 'center' },
  summaryLabel: { color: 'rgba(255,255,255,0.7)', fontSize: 12 },
  summaryVal: { color: '#FFFFFF', fontSize: 20, fontWeight: '700', marginTop: 4 },
  summaryDivider: { width: 1, height: 40, backgroundColor: 'rgba(255,255,255,0.3)' },
  creditCard: { backgroundColor: colors.card, marginHorizontal: 16, marginBottom: 12, borderRadius: 14, padding: 16 },
  creditHeader: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 12 },
  creditIconWrap: { width: 44, height: 44, borderRadius: 22, backgroundColor: colors.bg, alignItems: 'center', justifyContent: 'center', marginRight: 12 },
  creditIcon: { fontSize: 22 },
  creditInfo: { flex: 1 },
  creditName: { fontSize: 14, fontWeight: '600', color: colors.text },
  creditType: { fontSize: 12, color: colors.subtext, marginTop: 2 },
  progressRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  progressBg: { flex: 1, height: 6, backgroundColor: colors.border, borderRadius: 3, marginRight: 8 },
  progressFill: { height: 6, backgroundColor: colors.secondary, borderRadius: 3 },
  progressText: { fontSize: 12, color: colors.secondary, fontWeight: '700', width: 35, textAlign: 'right' },
  creditMetrics: { flexDirection: 'row', justifyContent: 'space-between' },
  metric: { alignItems: 'center' },
  metricLabel: { fontSize: 11, color: colors.subtext },
  metricVal: { fontSize: 13, fontWeight: '600', color: colors.text, marginTop: 2 },
  actionBtns: { marginHorizontal: 16, marginTop: 8, gap: 10 },
  actionBtn: { marginBottom: 0 },
});

export default CreditsListScreen;
