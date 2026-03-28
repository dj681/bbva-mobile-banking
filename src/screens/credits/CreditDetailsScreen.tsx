import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Platform,
  FlatList,
} from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { useTheme } from '@/hooks/useTheme';
import { Button } from '@/components/common/Button';
import { Modal } from '@/components/common/Modal';
import { Input } from '@/components/common/Input';
import { Divider } from '@/components/common/Divider';
import { Badge } from '@/components/common/Badge';
import { formatCurrency, formatDate } from '@/utils/formatters';
import type { CreditsStackParamList, Credit, AmortizationEntry } from '@/types';

type Route = RouteProp<CreditsStackParamList, 'CreditDetails'>;

const MOCK_CREDITS: Record<string, Credit> = {
  '1': { id: '1', type: 'mortgage', status: 'active', name: 'Crédit Immobilier Résidence Principale', originalAmount: 250000, remainingAmount: 187500, monthlyPayment: 1245, interestRate: 2.15, startDate: '2020-01-15', endDate: '2040-01-15', nextPaymentDate: '2024-04-01', nextPaymentAmount: 1245, totalPaid: 62500, currency: 'EUR' },
  '2': { id: '2', type: 'auto', status: 'active', name: 'Crédit Auto Renault Clio', originalAmount: 18000, remainingAmount: 9600, monthlyPayment: 350, interestRate: 3.5, startDate: '2022-06-01', endDate: '2026-06-01', nextPaymentDate: '2024-04-01', nextPaymentAmount: 350, totalPaid: 8400, currency: 'EUR' },
  '3': { id: '3', type: 'personal', status: 'active', name: 'Prêt Personnel Travaux', originalAmount: 15000, remainingAmount: 4500, monthlyPayment: 280, interestRate: 4.9, startDate: '2021-09-01', endDate: '2025-09-01', nextPaymentDate: '2024-04-01', nextPaymentAmount: 280, totalPaid: 10500, currency: 'EUR' },
};

const generateAmortization = (credit: Credit): AmortizationEntry[] => {
  const entries: AmortizationEntry[] = [];
  const monthlyRate = credit.interestRate / 100 / 12;
  let balance = credit.remainingAmount;
  const payment = credit.monthlyPayment;
  const startDate = new Date(credit.nextPaymentDate);
  for (let i = 0; i < Math.min(12, 120); i++) {
    const interest = balance * monthlyRate;
    const principal = payment - interest;
    balance = Math.max(0, balance - principal);
    const date = new Date(startDate);
    date.setMonth(date.getMonth() + i);
    entries.push({ month: i + 1, payment, principal, interest, balance, date: date.toISOString().split('T')[0] });
    if (balance === 0) break;
  }
  return entries;
};

const MOCK_PAYMENTS = [
  { id: '1', date: '2024-03-01', amount: 1245, status: 'completed' },
  { id: '2', date: '2024-02-01', amount: 1245, status: 'completed' },
  { id: '3', date: '2024-01-01', amount: 1245, status: 'completed' },
  { id: '4', date: '2023-12-01', amount: 1245, status: 'completed' },
];

export const CreditDetailsScreen: React.FC = () => {
  const navigation = useNavigation();
  const route = useRoute<Route>();
  const { creditId } = route.params;
  const { theme } = useTheme();

  const credit = MOCK_CREDITS[creditId];
  const [activeTab, setActiveTab] = useState<'amortization' | 'payments'>('amortization');
  const [earlyPaymentModal, setEarlyPaymentModal] = useState(false);
  const [earlyAmount, setEarlyAmount] = useState('');

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

  if (!credit) return null;

  const progress = ((credit.originalAmount - credit.remainingAmount) / credit.originalAmount) * 100;
  const amortization = generateAmortization(credit);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}><Text style={styles.backText}>‹ Retour</Text></TouchableOpacity>
        <Text style={styles.headerTitle}>Détails du crédit</Text>
        <TouchableOpacity><Text style={styles.downloadBtn}>⬇</Text></TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={{ paddingBottom: 40 }}>
        <View style={styles.overviewCard}>
          <Text style={styles.overviewName}>{credit.name}</Text>
          <Text style={styles.overviewAmount}>{formatCurrency(credit.remainingAmount, credit.currency)}</Text>
          <Text style={styles.overviewLabel}>Restant à rembourser</Text>
          <View style={styles.progressBg}>
            <View style={[styles.progressFill, { width: `${progress}%` as any }]} />
          </View>
          <Text style={styles.progressText}>{Math.round(progress)}% remboursé</Text>
        </View>

        <View style={styles.metricsGrid}>
          <View style={styles.metricCard}>
            <Text style={styles.metricIcon}>💰</Text>
            <Text style={styles.metricLabel}>Montant initial</Text>
            <Text style={styles.metricVal}>{formatCurrency(credit.originalAmount, credit.currency)}</Text>
          </View>
          <View style={styles.metricCard}>
            <Text style={styles.metricIcon}>✅</Text>
            <Text style={styles.metricLabel}>Déjà remboursé</Text>
            <Text style={[styles.metricVal, { color: colors.success }]}>{formatCurrency(credit.totalPaid, credit.currency)}</Text>
          </View>
          <View style={styles.metricCard}>
            <Text style={styles.metricIcon}>📅</Text>
            <Text style={styles.metricLabel}>Prochain paiement</Text>
            <Text style={styles.metricVal}>{formatDate(credit.nextPaymentDate)}</Text>
          </View>
          <View style={styles.metricCard}>
            <Text style={styles.metricIcon}>📊</Text>
            <Text style={styles.metricLabel}>Taux d'intérêt</Text>
            <Text style={styles.metricVal}>{credit.interestRate}%</Text>
          </View>
        </View>

        <View style={styles.nextPaymentCard}>
          <Text style={styles.nextLabel}>Prochaine mensualité</Text>
          <Text style={styles.nextAmount}>{formatCurrency(credit.nextPaymentAmount, credit.currency)}</Text>
          <Text style={styles.nextDate}>le {formatDate(credit.nextPaymentDate)}</Text>
        </View>

        <View style={styles.tabRow}>
          {([['amortization', 'Amortissement'], ['payments', 'Paiements']] as ['amortization' | 'payments', string][]).map(([tab, label]) => (
            <TouchableOpacity key={tab} style={[styles.tabBtn, activeTab === tab && styles.tabBtnActive]} onPress={() => setActiveTab(tab)}>
              <Text style={[styles.tabBtnText, activeTab === tab && styles.tabBtnTextActive]}>{label}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {activeTab === 'amortization' && (
          <View style={styles.tableContainer}>
            <View style={styles.tableHeader}>
              <Text style={[styles.tableCell, styles.tableHeaderText, { flex: 0.5 }]}>Mois</Text>
              <Text style={[styles.tableCell, styles.tableHeaderText]}>Mensualité</Text>
              <Text style={[styles.tableCell, styles.tableHeaderText]}>Capital</Text>
              <Text style={[styles.tableCell, styles.tableHeaderText]}>Intérêts</Text>
              <Text style={[styles.tableCell, styles.tableHeaderText]}>Solde</Text>
            </View>
            {amortization.map(row => (
              <View key={row.month} style={[styles.tableRow, row.month % 2 === 0 && styles.tableRowAlt]}>
                <Text style={[styles.tableCell, { flex: 0.5 }]}>{row.month}</Text>
                <Text style={styles.tableCell}>{formatCurrency(row.payment, 'EUR')}</Text>
                <Text style={[styles.tableCell, { color: colors.success }]}>{formatCurrency(row.principal, 'EUR')}</Text>
                <Text style={[styles.tableCell, { color: colors.error }]}>{formatCurrency(row.interest, 'EUR')}</Text>
                <Text style={styles.tableCell}>{formatCurrency(row.balance, 'EUR')}</Text>
              </View>
            ))}
          </View>
        )}

        {activeTab === 'payments' && (
          <View style={styles.paymentsContainer}>
            {MOCK_PAYMENTS.map(p => (
              <View key={p.id} style={styles.paymentRow}>
                <View>
                  <Text style={styles.paymentDate}>{formatDate(p.date)}</Text>
                  <Text style={styles.paymentRef}>Échéance #{p.id}</Text>
                </View>
                <View style={{ alignItems: 'flex-end' }}>
                  <Text style={styles.paymentAmount}>{formatCurrency(p.amount, 'EUR')}</Text>
                  <Badge label="Payé" variant="success" />
                </View>
              </View>
            ))}
          </View>
        )}

        <View style={styles.actions}>
          <Button title="💸 Paiement anticipé" onPress={() => setEarlyPaymentModal(true)} variant="outline" />
        </View>
      </ScrollView>

      <Modal visible={earlyPaymentModal} onClose={() => setEarlyPaymentModal(false)} title="Remboursement anticipé">
        <Text style={{ color: colors.subtext, marginBottom: 12, textAlign: 'center' }}>Entrez le montant que vous souhaitez rembourser par anticipation.</Text>
        <Input label="Montant (EUR)" value={earlyAmount} onChangeText={setEarlyAmount} keyboardType="decimal-pad" placeholder="0.00" />
        <Text style={{ color: colors.subtext, fontSize: 12, marginTop: 8 }}>Des indemnités de remboursement anticipé peuvent s'appliquer selon votre contrat.</Text>
        <Button title="Valider" onPress={() => setEarlyPaymentModal(false)} style={{ marginTop: 12 }} />
        <Button title="Annuler" onPress={() => setEarlyPaymentModal(false)} variant="outline" style={{ marginTop: 8 }} />
      </Modal>
    </View>
  );
};

const makeStyles = (colors: Record<string, string>) => StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: colors.primary, padding: 16, paddingTop: Platform.OS === 'ios' ? 50 : 16 },
  backText: { color: '#FFFFFF', fontSize: 18, width: 60 },
  headerTitle: { color: '#FFFFFF', fontSize: 18, fontWeight: '700' },
  downloadBtn: { color: '#FFFFFF', fontSize: 20, width: 40, textAlign: 'right' },
  overviewCard: { backgroundColor: colors.primary, padding: 24, alignItems: 'center' },
  overviewName: { color: 'rgba(255,255,255,0.8)', fontSize: 14, textAlign: 'center', marginBottom: 8 },
  overviewAmount: { color: '#FFFFFF', fontSize: 36, fontWeight: '700' },
  overviewLabel: { color: 'rgba(255,255,255,0.7)', fontSize: 13, marginTop: 4, marginBottom: 16 },
  progressBg: { width: '80%', height: 8, backgroundColor: 'rgba(255,255,255,0.3)', borderRadius: 4, overflow: 'hidden' },
  progressFill: { height: 8, backgroundColor: '#00A8E8', borderRadius: 4 },
  progressText: { color: '#FFFFFF', fontSize: 12, marginTop: 6 },
  metricsGrid: { flexDirection: 'row', flexWrap: 'wrap', padding: 8, gap: 8, margin: 8 },
  metricCard: { flex: 1, minWidth: '45%', backgroundColor: colors.card, borderRadius: 12, padding: 14, alignItems: 'center' },
  metricIcon: { fontSize: 22, marginBottom: 6 },
  metricLabel: { color: colors.subtext, fontSize: 11, textAlign: 'center' },
  metricVal: { color: colors.text, fontSize: 13, fontWeight: '700', marginTop: 4, textAlign: 'center' },
  nextPaymentCard: { backgroundColor: colors.secondary + '20', marginHorizontal: 16, borderRadius: 12, padding: 16, alignItems: 'center', borderWidth: 1, borderColor: colors.secondary + '40', marginBottom: 16 },
  nextLabel: { color: colors.subtext, fontSize: 13 },
  nextAmount: { color: colors.primary, fontSize: 26, fontWeight: '700', marginTop: 4 },
  nextDate: { color: colors.subtext, fontSize: 13, marginTop: 4 },
  tabRow: { flexDirection: 'row', backgroundColor: colors.card, marginHorizontal: 16, borderRadius: 10, padding: 4, marginBottom: 16 },
  tabBtn: { flex: 1, paddingVertical: 8, alignItems: 'center', borderRadius: 8 },
  tabBtnActive: { backgroundColor: colors.secondary },
  tabBtnText: { color: colors.subtext, fontWeight: '600' },
  tabBtnTextActive: { color: '#FFFFFF' },
  tableContainer: { marginHorizontal: 16, backgroundColor: colors.card, borderRadius: 12, overflow: 'hidden' },
  tableHeader: { flexDirection: 'row', backgroundColor: colors.primary, paddingVertical: 10 },
  tableHeaderText: { color: '#FFFFFF', fontWeight: '700', fontSize: 11 },
  tableRow: { flexDirection: 'row', paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: colors.border },
  tableRowAlt: { backgroundColor: colors.bg },
  tableCell: { flex: 1, fontSize: 10, color: colors.text, textAlign: 'center', paddingHorizontal: 2 },
  paymentsContainer: { marginHorizontal: 16, backgroundColor: colors.card, borderRadius: 12, padding: 16 },
  paymentRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: colors.border },
  paymentDate: { fontSize: 14, fontWeight: '600', color: colors.text },
  paymentRef: { fontSize: 12, color: colors.subtext },
  paymentAmount: { fontSize: 15, fontWeight: '700', color: colors.primary },
  actions: { margin: 16 },
});

export default CreditDetailsScreen;
