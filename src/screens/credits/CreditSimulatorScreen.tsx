import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Platform,
  TextInput,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useTheme } from '@/hooks/useTheme';
import { Button } from '@/components/common/Button';
import { Divider } from '@/components/common/Divider';
import { formatCurrency } from '@/utils/formatters';
import type { CreditsStackParamList, AmortizationEntry } from '@/types';

type Nav = NativeStackNavigationProp<CreditsStackParamList, 'CreditSimulator'>;

type CreditTypeKey = 'personal' | 'mortgage' | 'auto' | 'student';

const CREDIT_TYPES: { key: CreditTypeKey; label: string; icon: string; rate: number }[] = [
  { key: 'personal', label: 'Personal', icon: '💼', rate: 4.9 },
  { key: 'mortgage', label: 'Hipotecario', icon: '🏠', rate: 2.15 },
  { key: 'auto', label: 'Vehículo', icon: '🚗', rate: 3.5 },
  { key: 'student', label: 'Estudiantil', icon: '🎓', rate: 1.5 },
];

const computeMonthlyPayment = (principal: number, annualRate: number, months: number): number => {
  if (annualRate === 0) return principal / months;
  const r = annualRate / 100 / 12;
  return (principal * r * Math.pow(1 + r, months)) / (Math.pow(1 + r, months) - 1);
};

const generateSchedule = (principal: number, rate: number, months: number): AmortizationEntry[] => {
  const entries: AmortizationEntry[] = [];
  const monthlyRate = rate / 100 / 12;
  let balance = principal;
  const payment = computeMonthlyPayment(principal, rate, months);
  const start = new Date();
  for (let i = 0; i < months && balance > 0.01; i++) {
    const interest = balance * monthlyRate;
    const principalPart = payment - interest;
    balance = Math.max(0, balance - principalPart);
    const d = new Date(start);
    d.setMonth(d.getMonth() + i + 1);
    entries.push({ month: i + 1, payment, principal: principalPart, interest, balance, date: d.toISOString().split('T')[0] });
  }
  return entries;
};

export const CreditSimulatorScreen: React.FC = () => {
  const navigation = useNavigation<Nav>();
  const { theme } = useTheme();

  const [creditType, setCreditType] = useState<CreditTypeKey>('personal');
  const [amount, setAmount] = useState('10000');
  const [duration, setDuration] = useState('48');
  const [showSchedule, setShowSchedule] = useState(false);

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

  const selectedType = CREDIT_TYPES.find(t => t.key === creditType)!;
  const principal = Math.max(1000, Math.min(100000, parseFloat(amount) || 0));
  const months = Math.max(6, Math.min(360, parseInt(duration) || 0));
  const rate = selectedType.rate;

  const monthly = useMemo(() => computeMonthlyPayment(principal, rate, months), [principal, rate, months]);
  const totalPayment = useMemo(() => monthly * months, [monthly, months]);
  const totalInterest = useMemo(() => totalPayment - principal, [totalPayment, principal]);
  const teg = useMemo(() => (rate * 1.08).toFixed(2), [rate]);
  const schedule = useMemo(() => generateSchedule(principal, rate, months), [principal, rate, months]);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}><Text style={styles.backText}>‹ Volver</Text></TouchableOpacity>
        <Text style={styles.headerTitle}>Simulador de crédito</Text>
        <View style={{ width: 60 }} />
      </View>
      <ScrollView contentContainerStyle={{ paddingBottom: 40 }}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Tipo de crédito</Text>
          <View style={styles.typeRow}>
            {CREDIT_TYPES.map(t => (
              <TouchableOpacity key={t.key} style={[styles.typeCard, creditType === t.key && styles.typeCardActive]} onPress={() => setCreditType(t.key)}>
                <Text style={styles.typeIcon}>{t.icon}</Text>
                <Text style={[styles.typeLabel, creditType === t.key && styles.typeLabelActive]}>{t.label}</Text>
                <Text style={styles.typeRate}>{t.rate}%</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Importe deseado</Text>
          <View style={styles.inputRow}>
            <TextInput
              style={styles.sliderInput}
              value={amount}
              onChangeText={setAmount}
              keyboardType="decimal-pad"
              placeholder="10000"
              placeholderTextColor={colors.subtext}
            />
            <Text style={styles.inputUnit}>EUR</Text>
          </View>
          <View style={styles.rangeRow}><Text style={styles.rangeText}>Mín: 1.000 €</Text><Text style={styles.rangeText}>Máx: 100.000 €</Text></View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Plazo</Text>
          <View style={styles.inputRow}>
            <TextInput
              style={styles.sliderInput}
              value={duration}
              onChangeText={setDuration}
              keyboardType="number-pad"
              placeholder="48"
              placeholderTextColor={colors.subtext}
            />
            <Text style={styles.inputUnit}>meses</Text>
          </View>
          <View style={styles.rangeRow}><Text style={styles.rangeText}>Mín: 6 meses</Text><Text style={styles.rangeText}>Máx: 360 meses</Text></View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Tipo de interés</Text>
          <View style={styles.rateBox}>
            <Text style={styles.rateValue}>{rate}% / año</Text>
            <Text style={styles.rateNote}>Tipo fijo según el tipo de crédito</Text>
          </View>
        </View>

        <View style={styles.resultsCard}>
          <Text style={styles.resultsTitle}>Resultado de la simulación</Text>
          <View style={styles.resultMain}>
            <Text style={styles.resultMainLabel}>Cuota</Text>
            <Text style={styles.resultMainAmount}>{formatCurrency(monthly, 'EUR')}</Text>
            <Text style={styles.resultMainSub}>en {months} meses</Text>
          </View>
          <Divider />
          <View style={styles.resultRow}><Text style={styles.resultKey}>Coste total del crédito</Text><Text style={styles.resultVal}>{formatCurrency(totalPayment, 'EUR')}</Text></View>
          <View style={styles.resultRow}><Text style={styles.resultKey}>Total de intereses</Text><Text style={[styles.resultVal, { color: colors.error }]}>{formatCurrency(totalInterest, 'EUR')}</Text></View>
          <View style={styles.resultRow}><Text style={styles.resultKey}>Importe prestado</Text><Text style={styles.resultVal}>{formatCurrency(principal, 'EUR')}</Text></View>
          <View style={styles.resultRow}><Text style={styles.resultKey}>TAE</Text><Text style={[styles.resultVal, { color: colors.secondary }]}>{teg}%</Text></View>
        </View>

        <TouchableOpacity style={styles.scheduleToggle} onPress={() => setShowSchedule(s => !s)}>
          <Text style={styles.scheduleToggleText}>{showSchedule ? '▲ Ocultar tabla' : '▼ Mostrar tabla de amortización'}</Text>
        </TouchableOpacity>

        {showSchedule && (
          <View style={styles.tableContainer}>
            <View style={styles.tableHeader}>
              <Text style={[styles.tcell, styles.th, { flex: 0.5 }]}>M.</Text>
              <Text style={[styles.tcell, styles.th]}>Cuota</Text>
              <Text style={[styles.tcell, styles.th]}>Capital</Text>
              <Text style={[styles.tcell, styles.th]}>Int.</Text>
              <Text style={[styles.tcell, styles.th]}>Saldo</Text>
            </View>
            {schedule.slice(0, 24).map(r => (
              <View key={r.month} style={[styles.trow, r.month % 2 === 0 && { backgroundColor: colors.bg }]}>
                <Text style={[styles.tcell, { flex: 0.5 }]}>{r.month}</Text>
                <Text style={styles.tcell}>{formatCurrency(r.payment, 'EUR')}</Text>
                <Text style={[styles.tcell, { color: colors.success }]}>{formatCurrency(r.principal, 'EUR')}</Text>
                <Text style={[styles.tcell, { color: colors.error }]}>{formatCurrency(r.interest, 'EUR')}</Text>
                <Text style={styles.tcell}>{formatCurrency(r.balance, 'EUR')}</Text>
              </View>
            ))}
            {schedule.length > 24 && <Text style={styles.moreRows}>+ {schedule.length - 24} filas adicionales</Text>}
          </View>
        )}

        <View style={styles.footer}>
          <Button title="📄 Solicitar crédito" onPress={() => navigation.navigate('CreditRequest')} />
        </View>
      </ScrollView>
    </View>
  );
};

const makeStyles = (colors: Record<string, string>) => StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: colors.primary, padding: 16, paddingTop: Platform.OS === 'ios' ? 50 : 16 },
  backText: { color: '#FFFFFF', fontSize: 18, width: 60 },
  headerTitle: { color: '#FFFFFF', fontSize: 18, fontWeight: '700' },
  section: { backgroundColor: colors.card, margin: 16, marginBottom: 0, borderRadius: 12, padding: 16 },
  sectionTitle: { fontSize: 15, fontWeight: '700', color: colors.text, marginBottom: 12 },
  typeRow: { flexDirection: 'row', gap: 8 },
  typeCard: { flex: 1, alignItems: 'center', padding: 10, borderRadius: 10, backgroundColor: colors.bg, borderWidth: 1.5, borderColor: colors.border },
  typeCardActive: { borderColor: colors.secondary, backgroundColor: colors.secondary + '15' },
  typeIcon: { fontSize: 22 },
  typeLabel: { fontSize: 11, color: colors.subtext, marginTop: 4, fontWeight: '600' },
  typeLabelActive: { color: colors.secondary },
  typeRate: { fontSize: 11, color: colors.subtext, marginTop: 2 },
  inputRow: { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.bg, borderRadius: 10, paddingHorizontal: 14, borderWidth: 1, borderColor: colors.border },
  sliderInput: { flex: 1, paddingVertical: 12, fontSize: 22, fontWeight: '700', color: colors.text },
  inputUnit: { color: colors.subtext, fontSize: 16, fontWeight: '600' },
  rangeRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 6 },
  rangeText: { color: colors.subtext, fontSize: 11 },
  rateBox: { backgroundColor: colors.primary, borderRadius: 10, padding: 14, alignItems: 'center' },
  rateValue: { color: '#FFFFFF', fontSize: 24, fontWeight: '700' },
  rateNote: { color: 'rgba(255,255,255,0.7)', fontSize: 12, marginTop: 4 },
  resultsCard: { backgroundColor: colors.card, margin: 16, borderRadius: 12, padding: 16 },
  resultsTitle: { fontSize: 16, fontWeight: '700', color: colors.text, marginBottom: 16 },
  resultMain: { alignItems: 'center', marginBottom: 16 },
  resultMainLabel: { color: colors.subtext, fontSize: 14 },
  resultMainAmount: { color: colors.primary, fontSize: 40, fontWeight: '700', marginTop: 4 },
  resultMainSub: { color: colors.subtext, fontSize: 13 },
  resultRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 8 },
  resultKey: { color: colors.subtext, fontSize: 14 },
  resultVal: { color: colors.text, fontSize: 14, fontWeight: '600' },
  scheduleToggle: { marginHorizontal: 16, marginTop: 12, alignItems: 'center' },
  scheduleToggleText: { color: colors.secondary, fontSize: 14, fontWeight: '600' },
  tableContainer: { marginHorizontal: 16, marginTop: 8, backgroundColor: colors.card, borderRadius: 12, overflow: 'hidden' },
  tableHeader: { flexDirection: 'row', backgroundColor: colors.primary, paddingVertical: 8 },
  th: { color: '#FFFFFF', fontWeight: '700' },
  trow: { flexDirection: 'row', paddingVertical: 6, borderBottomWidth: 1, borderBottomColor: colors.border, backgroundColor: colors.card },
  tcell: { flex: 1, fontSize: 10, color: colors.text, textAlign: 'center' },
  moreRows: { color: colors.subtext, textAlign: 'center', padding: 12, fontSize: 12 },
  footer: { margin: 16 },
});

export default CreditSimulatorScreen;
