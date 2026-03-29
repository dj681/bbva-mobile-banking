import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  Platform,
  KeyboardAvoidingView,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useAccounts } from '@/hooks/useAccounts';
import { useTheme } from '@/hooks/useTheme';
import { Button } from '@/components/common/Button';
import { Input } from '@/components/common/Input';
import { Card } from '@/components/common/Card';
import { Modal } from '@/components/common/Modal';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { EmptyState } from '@/components/common/EmptyState';
import { formatCurrency, formatDate } from '@/utils/formatters';

type PaymentTab = 'bills' | 'topup' | 'services';

interface Biller {
  id: string;
  name: string;
  category: string;
  icon: string;
}

interface RecentPayment {
  id: string;
  biller: string;
  amount: number;
  date: string;
  reference: string;
  status: 'completed' | 'pending' | 'failed';
}

const BILLERS: Biller[] = [
  { id: '1', name: 'EDF', category: 'Énergie', icon: '⚡' },
  { id: '2', name: 'Free', category: 'Télécom', icon: '📡' },
  { id: '3', name: 'Orange', category: 'Télécom', icon: '📱' },
  { id: '4', name: 'SFR', category: 'Télécom', icon: '📶' },
  { id: '5', name: 'Vinci Autoroutes', category: 'Transportee', icon: '🛣️' },
  { id: '6', name: 'Bouygues', category: 'Télécom', icon: '📲' },
  { id: '7', name: 'Engie', category: 'Énergie', icon: '🔥' },
  { id: '8', name: 'Veolia', category: 'Eau', icon: '💧' },
];

const TOP_UP_OPERATORS = [
  { id: '1', name: 'Orange', icon: '📱' },
  { id: '2', name: 'SFR', icon: '📶' },
  { id: '3', name: 'Free Mobile', icon: '📡' },
  { id: '4', name: 'Bouygues', icon: '📲' },
  { id: '5', name: 'La Poste Mobile', icon: '✉️' },
];

const MOCK_RECENT: RecentPayment[] = [
  { id: '1', biller: 'EDF', amount: 89.5, date: '2024-03-15', reference: 'EDF-2024-001', status: 'completed' },
  { id: '2', biller: 'Free', amount: 29.99, date: '2024-03-10', reference: 'FREE-2024-002', status: 'completed' },
  { id: '3', biller: 'Orange', amount: 49.0, date: '2024-03-05', reference: 'ORA-2024-003', status: 'completed' },
];

export const PaymentScreen: React.FC = () => {
  const navigation = useNavigation();
  const { theme } = useTheme();
  const { accounts } = useAccounts();

  const [activeTab, setActiveTab] = useState<PaymentTab>('bills');
  const [selectedBiller, setSelectedBiller] = useState<Biller | null>(null);
  const [reference, setReference] = useState('');
  const [amount, setAmount] = useState('');
  const [selectedAccountId, setSelectedAccountId] = useState('');
  const [paymentDate, setPaymentDate] = useState('');
  const [pinModalVisible, setPinModalVisible] = useState(false);
  const [pin, setPin] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [phoneNumber, setPhoneNumber] = useState('');
  const [selectedOperator, setSelectedOperator] = useState<{ id: string; name: string; icon: string } | null>(null);
  const [topUpAmount, setTopUpAmount] = useState('');

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

  const validate = () => {
    const errs: Record<string, string> = {};
    if (activeTab === 'bills') {
      if (!selectedBiller) errs.biller = 'Por favor, seleccione un organismo';
      if (!reference.trim()) errs.reference = 'La referencia es obligatoria';
      if (!amount || parseFloat(amount) <= 0) errs.amount = 'Importe no válido';
      if (!selectedAccountId) errs.account = 'Por favor, seleccione una cuenta';
    }
    if (activeTab === 'topup') {
      if (!selectedOperator) errs.operator = 'Por favor, seleccione un operador';
      if (!phoneNumber.trim()) errs.phone = 'El número es obligatorio';
      if (!topUpAmount || parseFloat(topUpAmount) <= 0) errs.topUpAmount = 'Importe no válido';
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handlePay = () => {
    if (!validate()) return;
    setPinModalVisible(true);
  };

  const handleConfirmPayment = async () => {
    if (pin.length < 4) return;
    setPinModalVisible(false);
    setIsLoading(true);
    await new Promise(r => setTimeout(r, 1500));
    setIsLoading(false);
    setSelectedBiller(null);
    setReference('');
    setAmount('');
  };

  const statusColor = (s: string) => s === 'completed' ? colors.success : s === 'pending' ? '#FF9800' : colors.error;

  const renderBillsTab = () => (
    <View>
      <Text style={styles.sectionTitle}>Seleccionar un organismo</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 16 }}>
        {BILLERS.map(b => (
          <TouchableOpacity key={b.id} style={[styles.billerCard, selectedBiller?.id === b.id && styles.billerCardActive]} onPress={() => setSelectedBiller(b)}>
            <Text style={styles.billerIcon}>{b.icon}</Text>
            <Text style={styles.billerName}>{b.name}</Text>
            <Text style={styles.billerCategory}>{b.category}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
      {errors.biller && <Text style={styles.errorText}>{errors.biller}</Text>}
      <Input label="Número de contrato / referencia" value={reference} onChangeText={setReference} placeholder="Ej: 123456789" error={errors.reference} />
      <Input label="Importe (EUR)" value={amount} onChangeText={setAmount} keyboardType="decimal-pad" placeholder="0,00" error={errors.amount} />
      <Text style={styles.sectionTitle}>Cuenta a debitar</Text>
      {accounts.map(acc => (
        <TouchableOpacity key={acc.id} onPress={() => setSelectedAccountId(acc.id)} style={[styles.accountRow, selectedAccountId === acc.id && styles.accountRowActive]}>
          <View><Text style={styles.accountName}>{acc.name}</Text><Text style={styles.accountSub}>{formatCurrency(acc.balance, acc.currency)}</Text></View>
          {selectedAccountId === acc.id && <Text style={{ color: colors.secondary, fontSize: 18 }}>✓</Text>}
        </TouchableOpacity>
      ))}
      {errors.account && <Text style={styles.errorText}>{errors.account}</Text>}
      <Input label="Fecha de pago (opcional)" value={paymentDate} onChangeText={setPaymentDate} placeholder="AAAA-MM-DD" />
    </View>
  );

  const renderTopUpTab = () => (
    <View>
      <Text style={styles.sectionTitle}>Seleccionar un operador</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 16 }}>
        {TOP_UP_OPERATORS.map(op => (
          <TouchableOpacity key={op.id} style={[styles.billerCard, selectedOperator?.id === op.id && styles.billerCardActive]} onPress={() => setSelectedOperator(op)}>
            <Text style={styles.billerIcon}>{op.icon}</Text>
            <Text style={styles.billerName}>{op.name}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
      {errors.operator && <Text style={styles.errorText}>{errors.operator}</Text>}
      <Input label="Número de teléfono" value={phoneNumber} onChangeText={setPhoneNumber} keyboardType="phone-pad" placeholder="6XX XXX XXX" error={errors.phone} />
      <Input label="Importe de recarga (EUR)" value={topUpAmount} onChangeText={setTopUpAmount} keyboardType="decimal-pad" placeholder="10, 20, 50..." error={errors.topUpAmount} />
    </View>
  );

  const renderServicesTab = () => (
    <View style={styles.centered}>
      <Text style={styles.comingSoon}>🔧</Text>
      <Text style={styles.comingSoonText}>Servicios disponibles próximamente</Text>
      <Text style={styles.comingSoonSub}>Pago de impuestos, multas, peajes y mucho más</Text>
    </View>
  );

  const renderRecentPayments = () => (
    <View style={{ marginTop: 24 }}>
      <Text style={styles.sectionTitle}>Pagos recientes</Text>
      {MOCK_RECENT.length === 0 ? (
        <EmptyState title="Sin pagos" description="Sus pagos aparecerán aquí" />
      ) : (
        MOCK_RECENT.map(p => (
          <Card key={p.id} style={styles.recentCard}>
            <View style={styles.recentRow}>
              <View>
                <Text style={styles.recentBiller}>{p.biller}</Text>
                <Text style={styles.recentRef}>{p.reference}</Text>
                <Text style={styles.recentDate}>{formatDate(p.date)}</Text>
              </View>
              <View style={{ alignItems: 'flex-end' }}>
                <Text style={styles.recentAmount}>{formatCurrency(p.amount, 'EUR')}</Text>
                <View style={[styles.statusBadge, { backgroundColor: statusColor(p.status) + '22' }]}>
                  <Text style={[styles.statusText, { color: statusColor(p.status) }]}>{p.status === 'completed' ? 'Realizado' : p.status === 'pending' ? 'En proceso' : 'Fallido'}</Text>
                </View>
              </View>
            </View>
          </Card>
        ))
      )}
    </View>
  );

  return (
    <KeyboardAvoidingView style={{ flex: 1, backgroundColor: colors.bg }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}><Text style={styles.backText}>‹ Volver</Text></TouchableOpacity>
        <Text style={styles.headerTitle}>Pagos</Text>
        <TouchableOpacity style={styles.qrBtn}><Text style={styles.qrIcon}>⊡</Text></TouchableOpacity>
      </View>
      <View style={styles.tabBar}>
        {([['bills', 'Facturas'], ['topup', 'Recargas'], ['services', 'Servicios']] as [PaymentTab, string][]).map(([tab, label]) => (
          <TouchableOpacity key={tab} style={[styles.tabItem, activeTab === tab && styles.tabItemActive]} onPress={() => setActiveTab(tab)}>
            <Text style={[styles.tabLabel, activeTab === tab && styles.tabLabelActive]}>{label}</Text>
          </TouchableOpacity>
        ))}
      </View>
      <ScrollView style={styles.content} contentContainerStyle={{ paddingBottom: 100 }}>
        {activeTab === 'bills' && renderBillsTab()}
        {activeTab === 'topup' && renderTopUpTab()}
        {activeTab === 'services' && renderServicesTab()}
        {activeTab !== 'services' && renderRecentPayments()}
      </ScrollView>
      {activeTab !== 'services' && (
        <View style={styles.footer}>
          <Button title="Pagar" onPress={handlePay} disabled={isLoading} />
        </View>
      )}
      <Modal visible={pinModalVisible} onClose={() => setPinModalVisible(false)} title="Código PIN">
        <Text style={{ color: colors.text, marginBottom: 12, textAlign: 'center' }}>Confirme el pago con su código PIN</Text>
        <Input label="Code PIN" value={pin} onChangeText={setPin} secureTextEntry keyboardType="number-pad" maxLength={6} />
        <Button title={isLoading ? 'Procesando...' : 'Valider'} onPress={handleConfirmPayment} disabled={isLoading || pin.length < 4} />
      </Modal>
      {isLoading && <LoadingSpinner />}
    </KeyboardAvoidingView>
  );
};

const makeStyles = (colors: Record<string, string>) => StyleSheet.create({
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: colors.primary, padding: 16, paddingTop: Platform.OS === 'ios' ? 50 : 16 },
  backText: { color: '#FFFFFF', fontSize: 18 },
  headerTitle: { color: '#FFFFFF', fontSize: 18, fontWeight: '700' },
  qrBtn: { padding: 4 },
  qrIcon: { color: '#FFFFFF', fontSize: 22 },
  tabBar: { flexDirection: 'row', backgroundColor: colors.card, borderBottomWidth: 1, borderBottomColor: colors.border },
  tabItem: { flex: 1, paddingVertical: 12, alignItems: 'center', borderBottomWidth: 3, borderBottomColor: 'transparent' },
  tabItemActive: { borderBottomColor: colors.secondary },
  tabLabel: { color: colors.subtext, fontWeight: '600' },
  tabLabelActive: { color: colors.secondary },
  content: { flex: 1, padding: 16 },
  sectionTitle: { fontSize: 15, fontWeight: '700', color: colors.text, marginBottom: 10, marginTop: 4 },
  billerCard: { width: 80, alignItems: 'center', padding: 10, backgroundColor: colors.card, borderRadius: 12, marginRight: 10, borderWidth: 2, borderColor: 'transparent' },
  billerCardActive: { borderColor: colors.secondary },
  billerIcon: { fontSize: 24 },
  billerName: { fontSize: 11, fontWeight: '600', color: colors.text, marginTop: 4, textAlign: 'center' },
  billerCategory: { fontSize: 9, color: colors.subtext, textAlign: 'center' },
  accountRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 12, backgroundColor: colors.card, borderRadius: 10, marginBottom: 8, borderWidth: 1.5, borderColor: 'transparent' },
  accountRowActive: { borderColor: colors.secondary },
  accountName: { fontSize: 14, fontWeight: '600', color: colors.text },
  accountSub: { fontSize: 12, color: colors.subtext },
  errorText: { color: colors.error, fontSize: 12, marginBottom: 8 },
  recentCard: { padding: 12, marginBottom: 8 },
  recentRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  recentBiller: { fontSize: 14, fontWeight: '600', color: colors.text },
  recentRef: { fontSize: 12, color: colors.subtext },
  recentDate: { fontSize: 11, color: colors.subtext },
  recentAmount: { fontSize: 15, fontWeight: '700', color: colors.primary },
  statusBadge: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: 8, marginTop: 4 },
  statusText: { fontSize: 11, fontWeight: '600' },
  footer: { padding: 16, backgroundColor: colors.card, borderTopWidth: 1, borderTopColor: colors.border },
  centered: { alignItems: 'center', paddingTop: 40 },
  comingSoon: { fontSize: 48 },
  comingSoonText: { color: colors.text, fontSize: 18, fontWeight: '700', marginTop: 12 },
  comingSoonSub: { color: colors.subtext, fontSize: 14, textAlign: 'center', marginTop: 8 },
});

export default PaymentScreen;
