import React, { useEffect } from 'react';
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
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { EmptyState } from '@/components/common/EmptyState';
import { Button } from '@/components/common/Button';
import { Badge } from '@/components/common/Badge';
import { formatCurrency, formatDate } from '@/utils/formatters';
import type { CreditsStackParamList, Credit } from '@/types';

type Nav = NativeStackNavigationProp<CreditsStackParamList, 'CreditsList'>;

const MOCK_CREDITS: Credit[] = [
  { id: '1', type: 'mortgage', status: 'active', name: 'Crédit Immobilier Résidence Principale', originalAmount: 250000, remainingAmount: 187500, monthlyPayment: 1245, interestRate: 2.15, startDate: '2020-01-15', endDate: '2040-01-15', nextPaymentDate: '2024-04-01', nextPaymentAmount: 1245, totalPaid: 62500, currency: 'EUR' },
  { id: '2', type: 'auto', status: 'active', name: 'Crédit Auto Renault Clio', originalAmount: 18000, remainingAmount: 9600, monthlyPayment: 350, interestRate: 3.5, startDate: '2022-06-01', endDate: '2026-06-01', nextPaymentDate: '2024-04-01', nextPaymentAmount: 350, totalPaid: 8400, currency: 'EUR' },
  { id: '3', type: 'personal', status: 'active', name: 'Prêt Personnel Travaux', originalAmount: 15000, remainingAmount: 4500, monthlyPayment: 280, interestRate: 4.9, startDate: '2021-09-01', endDate: '2025-09-01', nextPaymentDate: '2024-04-01', nextPaymentAmount: 280, totalPaid: 10500, currency: 'EUR' },
];

const typeIcon = (type: string) => ({ mortgage: '🏠', auto: '🚗', personal: '💼', business: '🏢', student: '🎓' }[type] || '💳');
const typeLabel = (type: string) => ({ mortgage: 'Immobilier', auto: 'Auto', personal: 'Personnel', business: 'Professionnel', student: 'Étudiant' }[type] || type);

export const CreditsListScreen: React.FC = () => {
  const navigation = useNavigation<Nav>();
  const { theme } = useTheme();

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

  const totalDebt = MOCK_CREDITS.reduce((s, c) => s + c.remainingAmount, 0);
  const nextPayment = MOCK_CREDITS.reduce((s, c) => s + c.nextPaymentAmount, 0);

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
          <Badge label="Actif" variant="success" />
        </View>
        <View style={styles.progressRow}>
          <View style={styles.progressBg}>
            <View style={[styles.progressFill, { width: `${progress}%` as any }]} />
          </View>
          <Text style={styles.progressText}>{Math.round(progress)}%</Text>
        </View>
        <View style={styles.creditMetrics}>
          <View style={styles.metric}><Text style={styles.metricLabel}>Restant</Text><Text style={styles.metricVal}>{formatCurrency(item.remainingAmount, item.currency)}</Text></View>
          <View style={styles.metric}><Text style={styles.metricLabel}>Mensualité</Text><Text style={styles.metricVal}>{formatCurrency(item.monthlyPayment, item.currency)}</Text></View>
          <View style={styles.metric}><Text style={styles.metricLabel}>Prochain</Text><Text style={styles.metricVal}>{formatDate(item.nextPaymentDate)}</Text></View>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Mes Crédits</Text>
      </View>
      <FlatList
        data={MOCK_CREDITS}
        keyExtractor={c => c.id}
        renderItem={renderCredit}
        ListHeaderComponent={
          <View style={styles.summaryCard}>
            <Text style={styles.summaryTitle}>Résumé de mes crédits</Text>
            <View style={styles.summaryRow}>
              <View style={styles.summaryItem}>
                <Text style={styles.summaryLabel}>Encours total</Text>
                <Text style={styles.summaryVal}>{formatCurrency(totalDebt, 'EUR')}</Text>
              </View>
              <View style={styles.summaryDivider} />
              <View style={styles.summaryItem}>
                <Text style={styles.summaryLabel}>Prochaine échéance</Text>
                <Text style={styles.summaryVal}>{formatCurrency(nextPayment, 'EUR')}</Text>
              </View>
            </View>
          </View>
        }
        ListEmptyComponent={<EmptyState title="Aucun crédit" description="Vous n'avez pas de crédit en cours" />}
        ListFooterComponent={
          <View style={styles.actionBtns}>
            <Button title="🧮 Simuler un crédit" onPress={() => navigation.navigate('CreditSimulator')} variant="outline" style={styles.actionBtn} />
            <Button title="📄 Demander un crédit" onPress={() => navigation.navigate('CreditRequest')} style={styles.actionBtn} />
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
