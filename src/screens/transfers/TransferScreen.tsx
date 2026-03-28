import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  Switch,
  FlatList,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useAccounts } from '@/hooks/useAccounts';
import { useTransfer } from '@/hooks/useTransfer';
import { useTheme } from '@/hooks/useTheme';
import { Button } from '@/components/common/Button';
import { Input } from '@/components/common/Input';
import { Card } from '@/components/common/Card';
import { Modal } from '@/components/common/Modal';
import { Avatar } from '@/components/common/Avatar';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { Divider } from '@/components/common/Divider';
import { formatCurrency } from '@/utils/formatters';
import { validateIBAN, validateAmount } from '@/utils/validators';
import type { Account, Beneficiary, Transfer } from '@/types';

const STEPS = ['Compte source', 'Destinataire', 'Montant', 'Confirmation'];

type TransferTypeOption = 'internal' | 'scheduled' | 'recurring';
type RecurringInterval = 'weekly' | 'monthly' | 'quarterly';
type DestinationTab = 'accounts' | 'beneficiaries' | 'new';

export const TransferScreen: React.FC = () => {
  const navigation = useNavigation();
  const { theme } = useTheme();
  const { accounts } = useAccounts();
  const { isLoading, executeTransfer, fetchBeneficiaries, addBeneficiary, beneficiaries } = useTransfer();

  const [step, setStep] = useState(0);
  const [fromAccount, setFromAccount] = useState<Account | null>(null);
  const [toAccount, setToAccount] = useState<Account | null>(null);
  const [selectedBeneficiary, setSelectedBeneficiary] = useState<Beneficiary | null>(null);
  const [destinationTab, setDestinationTab] = useState<DestinationTab>('accounts');
  const [newIban, setNewIban] = useState('');
  const [newName, setNewName] = useState('');
  const [addToFavorites, setAddToFavorites] = useState(false);
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [transferType, setTransferType] = useState<TransferTypeOption>('internal');
  const [scheduledDate, setScheduledDate] = useState('');
  const [recurringInterval, setRecurringInterval] = useState<RecurringInterval>('monthly');
  const [pinModalVisible, setPinModalVisible] = useState(false);
  const [pin, setPin] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});

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

  useEffect(() => {
    fetchBeneficiaries();
  }, [fetchBeneficiaries]);

  const validateStep = useCallback((): boolean => {
    const errs: Record<string, string> = {};
    if (step === 0 && !fromAccount) errs.fromAccount = 'Veuillez sélectionner un compte source';
    if (step === 1) {
      if (destinationTab === 'accounts' && !toAccount) errs.toAccount = 'Veuillez sélectionner un compte';
      if (destinationTab === 'beneficiaries' && !selectedBeneficiary) errs.beneficiary = 'Veuillez sélectionner un bénéficiaire';
      if (destinationTab === 'new') {
        if (!newName.trim()) errs.newName = 'Le nom est requis';
        if (!validateIBAN(newIban)) errs.newIban = 'IBAN invalide';
      }
    }
    if (step === 2) {
      if (!validateAmount(amount)) errs.amount = 'Montant invalide';
      if (!description.trim()) errs.description = 'Le motif est requis';
      if (transferType === 'scheduled' && !scheduledDate) errs.scheduledDate = 'La date est requise';
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  }, [step, fromAccount, toAccount, selectedBeneficiary, destinationTab, newIban, newName, amount, description, transferType, scheduledDate]);

  const handleNext = () => {
    if (!validateStep()) return;
    if (step < 3) setStep(s => s + 1);
    else setPinModalVisible(true);
  };

  const handleBack = () => {
    if (step > 0) setStep(s => s - 1);
    else navigation.goBack();
  };

  const handleConfirm = async () => {
    if (pin.length < 4) return;
    setPinModalVisible(false);

    let recipientIban: string | undefined;
    let recipientName: string | undefined;
    let beneficiaryId: string | undefined;
    let toAccountId: string | undefined;

    if (destinationTab === 'accounts' && toAccount) {
      toAccountId = toAccount.id;
      recipientName = toAccount.name;
      recipientIban = toAccount.iban;
    } else if (destinationTab === 'beneficiaries' && selectedBeneficiary) {
      beneficiaryId = selectedBeneficiary.id;
      recipientIban = selectedBeneficiary.iban;
      recipientName = selectedBeneficiary.name;
    } else {
      recipientIban = newIban;
      recipientName = newName;
      if (addToFavorites) {
        await addBeneficiary({ name: newName, iban: newIban, bank: 'Externe', isFavorite: true });
      }
    }

    const transfer: Transfer = {
      fromAccountId: fromAccount!.id,
      toAccountId,
      beneficiaryId,
      recipientIban,
      recipientName,
      amount: parseFloat(amount),
      currency: 'EUR',
      description,
      type: transferType === 'scheduled' ? 'scheduled' : destinationTab === 'new' ? 'external' : 'internal',
      scheduledDate: transferType === 'scheduled' ? scheduledDate : undefined,
      isRecurring: transferType === 'recurring',
      recurringInterval: transferType === 'recurring' ? recurringInterval : undefined,
    };

    const success = await executeTransfer(transfer);
    if (success) navigation.goBack();
  };

  const styles = makeStyles(colors);

  const renderStepIndicator = () => (
    <View style={styles.stepIndicator}>
      {STEPS.map((label, i) => (
        <React.Fragment key={i}>
          <View style={styles.stepItem}>
            <View style={[styles.stepDot, i <= step && styles.stepDotActive]}>
              <Text style={[styles.stepDotText, i <= step && styles.stepDotTextActive]}>{i + 1}</Text>
            </View>
            <Text style={[styles.stepLabel, i === step && styles.stepLabelActive]}>{label}</Text>
          </View>
          {i < STEPS.length - 1 && <View style={[styles.stepLine, i < step && styles.stepLineActive]} />}
        </React.Fragment>
      ))}
    </View>
  );

  const renderStep0 = () => (
    <View>
      <Text style={styles.stepTitle}>Depuis quel compte ?</Text>
      {accounts.map(acc => (
        <TouchableOpacity key={acc.id} onPress={() => setFromAccount(acc)} style={[styles.accountRow, fromAccount?.id === acc.id && styles.accountRowSelected]}>
          <View style={styles.accountInfo}>
            <Text style={styles.accountName}>{acc.name}</Text>
            <Text style={styles.accountIban}>{acc.iban}</Text>
          </View>
          <Text style={styles.accountBalance}>{formatCurrency(acc.balance, acc.currency)}</Text>
        </TouchableOpacity>
      ))}
      {errors.fromAccount && <Text style={styles.errorText}>{errors.fromAccount}</Text>}
    </View>
  );

  const renderStep1 = () => (
    <View>
      <Text style={styles.stepTitle}>Vers quel compte / bénéficiaire ?</Text>
      <View style={styles.tabRow}>
        {(['accounts', 'beneficiaries', 'new'] as DestinationTab[]).map(tab => (
          <TouchableOpacity key={tab} style={[styles.tab, destinationTab === tab && styles.tabActive]} onPress={() => setDestinationTab(tab)}>
            <Text style={[styles.tabText, destinationTab === tab && styles.tabTextActive]}>
              {tab === 'accounts' ? 'Mes comptes' : tab === 'beneficiaries' ? 'Bénéficiaires' : 'Nouveau'}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
      {destinationTab === 'accounts' && (
        <View>
          {accounts.filter(a => a.id !== fromAccount?.id).map(acc => (
            <TouchableOpacity key={acc.id} onPress={() => setToAccount(acc)} style={[styles.accountRow, toAccount?.id === acc.id && styles.accountRowSelected]}>
              <View>
                <Text style={styles.accountName}>{acc.name}</Text>
                <Text style={styles.accountIban}>{acc.iban}</Text>
              </View>
              <Text style={styles.accountBalance}>{formatCurrency(acc.balance, acc.currency)}</Text>
            </TouchableOpacity>
          ))}
          {errors.toAccount && <Text style={styles.errorText}>{errors.toAccount}</Text>}
        </View>
      )}
      {destinationTab === 'beneficiaries' && (
        <View>
          {beneficiaries.map(b => (
            <TouchableOpacity key={b.id} onPress={() => setSelectedBeneficiary(b)} style={[styles.accountRow, selectedBeneficiary?.id === b.id && styles.accountRowSelected]}>
              <Avatar name={b.name} imageUrl={b.avatar} size={40} />
              <View style={{ marginLeft: 12, flex: 1 }}>
                <Text style={styles.accountName}>{b.alias || b.name}</Text>
                <Text style={styles.accountIban}>{b.iban}</Text>
              </View>
            </TouchableOpacity>
          ))}
          {errors.beneficiary && <Text style={styles.errorText}>{errors.beneficiary}</Text>}
        </View>
      )}
      {destinationTab === 'new' && (
        <View>
          <Input label="Nom du bénéficiaire" value={newName} onChangeText={setNewName} placeholder="Jean Dupont" error={errors.newName} />
          <Input label="IBAN" value={newIban} onChangeText={setNewIban} placeholder="FR76..." autoCapitalize="characters" error={errors.newIban} />
          <View style={styles.toggleRow}>
            <Text style={styles.toggleLabel}>Ajouter aux favoris</Text>
            <Switch value={addToFavorites} onValueChange={setAddToFavorites} trackColor={{ true: colors.secondary }} />
          </View>
        </View>
      )}
    </View>
  );

  const renderStep2 = () => (
    <View>
      <Text style={styles.stepTitle}>Montant et détails</Text>
      <View style={styles.amountContainer}>
        <Input label="Montant (EUR)" value={amount} onChangeText={setAmount} keyboardType="decimal-pad" placeholder="0.00" error={errors.amount} />
      </View>
      <Input label="Motif du virement" value={description} onChangeText={setDescription} placeholder="Ex: Loyer mars 2024" error={errors.description} />
      <Text style={styles.sectionLabel}>Type de virement</Text>
      <View style={styles.typeRow}>
        {([['internal', 'Immédiat'], ['scheduled', 'Programmé'], ['recurring', 'Récurrent']] as [TransferTypeOption, string][]).map(([val, label]) => (
          <TouchableOpacity key={val} style={[styles.typeBtn, transferType === val && styles.typeBtnActive]} onPress={() => setTransferType(val)}>
            <Text style={[styles.typeBtnText, transferType === val && styles.typeBtnTextActive]}>{label}</Text>
          </TouchableOpacity>
        ))}
      </View>
      {transferType === 'scheduled' && (
        <Input label="Date d'exécution (YYYY-MM-DD)" value={scheduledDate} onChangeText={setScheduledDate} placeholder="2024-04-01" error={errors.scheduledDate} />
      )}
      {transferType === 'recurring' && (
        <View>
          <Text style={styles.sectionLabel}>Fréquence</Text>
          <View style={styles.typeRow}>
            {([['weekly', 'Hebdomadaire'], ['monthly', 'Mensuel'], ['quarterly', 'Trimestriel']] as [RecurringInterval, string][]).map(([val, label]) => (
              <TouchableOpacity key={val} style={[styles.typeBtn, recurringInterval === val && styles.typeBtnActive]} onPress={() => setRecurringInterval(val)}>
                <Text style={[styles.typeBtnText, recurringInterval === val && styles.typeBtnTextActive]}>{label}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      )}
    </View>
  );

  const renderStep3 = () => {
    const dest = destinationTab === 'accounts' ? toAccount?.name : destinationTab === 'beneficiaries' ? selectedBeneficiary?.name : newName;
    const iban = destinationTab === 'accounts' ? toAccount?.iban : destinationTab === 'beneficiaries' ? selectedBeneficiary?.iban : newIban;
    return (
      <View>
        <Text style={styles.stepTitle}>Confirmation du virement</Text>
        <Card style={styles.summaryCard}>
          <View style={styles.summaryRow}><Text style={styles.summaryKey}>Depuis</Text><Text style={styles.summaryVal}>{fromAccount?.name}</Text></View>
          <Divider />
          <View style={styles.summaryRow}><Text style={styles.summaryKey}>Vers</Text><Text style={styles.summaryVal}>{dest}</Text></View>
          <View style={styles.summaryRow}><Text style={styles.summaryKey}>IBAN</Text><Text style={styles.summaryVal}>{iban}</Text></View>
          <Divider />
          <View style={styles.summaryRow}><Text style={styles.summaryKey}>Montant</Text><Text style={[styles.summaryVal, styles.summaryAmount]}>{formatCurrency(parseFloat(amount) || 0, 'EUR')}</Text></View>
          <View style={styles.summaryRow}><Text style={styles.summaryKey}>Motif</Text><Text style={styles.summaryVal}>{description}</Text></View>
          <View style={styles.summaryRow}><Text style={styles.summaryKey}>Type</Text><Text style={styles.summaryVal}>{transferType === 'internal' ? 'Immédiat' : transferType === 'scheduled' ? `Programmé – ${scheduledDate}` : `Récurrent (${recurringInterval})`}</Text></View>
        </Card>
        <View style={styles.termsBox}>
          <Text style={styles.termsText}>En confirmant ce virement, vous acceptez les conditions générales de BBVA. Le virement sera exécuté conformément aux délais réglementaires en vigueur.</Text>
        </View>
      </View>
    );
  };

  return (
    <KeyboardAvoidingView style={{ flex: 1, backgroundColor: colors.bg }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <View style={styles.header}>
        <TouchableOpacity onPress={handleBack} style={styles.backBtn}>
          <Text style={styles.backBtnText}>‹ Retour</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Virement</Text>
        <Text style={styles.stepCount}>{step + 1}/{STEPS.length}</Text>
      </View>
      {renderStepIndicator()}
      <ScrollView style={styles.content} contentContainerStyle={{ paddingBottom: 100 }}>
        {step === 0 && renderStep0()}
        {step === 1 && renderStep1()}
        {step === 2 && renderStep2()}
        {step === 3 && renderStep3()}
      </ScrollView>
      <View style={styles.footer}>
        <Button title={step === 3 ? 'Confirmer' : 'Suivant'} onPress={handleNext} disabled={isLoading} style={styles.nextBtn} />
      </View>

      <Modal visible={pinModalVisible} onClose={() => setPinModalVisible(false)} title="Saisir votre code PIN">
        <Text style={styles.pinLabel}>Confirmez le virement avec votre code PIN</Text>
        <Input label="Code PIN" value={pin} onChangeText={setPin} secureTextEntry keyboardType="number-pad" maxLength={6} />
        <Button title={isLoading ? 'Traitement...' : 'Valider'} onPress={handleConfirm} disabled={isLoading || pin.length < 4} />
      </Modal>

      {isLoading && <LoadingSpinner />}
    </KeyboardAvoidingView>
  );
};

const makeStyles = (colors: Record<string, string>) => StyleSheet.create({
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 16, backgroundColor: colors.primary, paddingTop: Platform.OS === 'ios' ? 50 : 16 },
  backBtn: { padding: 4 },
  backBtnText: { color: '#FFFFFF', fontSize: 18 },
  headerTitle: { color: '#FFFFFF', fontSize: 18, fontWeight: '700' },
  stepCount: { color: '#FFFFFF', fontSize: 14 },
  stepIndicator: { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.card, paddingHorizontal: 12, paddingVertical: 12, justifyContent: 'center' },
  stepItem: { alignItems: 'center', width: 60 },
  stepDot: { width: 28, height: 28, borderRadius: 14, backgroundColor: colors.border, alignItems: 'center', justifyContent: 'center' },
  stepDotActive: { backgroundColor: colors.secondary },
  stepDotText: { color: colors.subtext, fontWeight: '700', fontSize: 12 },
  stepDotTextActive: { color: '#FFFFFF' },
  stepLabel: { color: colors.subtext, fontSize: 9, marginTop: 2, textAlign: 'center' },
  stepLabelActive: { color: colors.secondary, fontWeight: '700' },
  stepLine: { flex: 1, height: 2, backgroundColor: colors.border, marginBottom: 14 },
  stepLineActive: { backgroundColor: colors.secondary },
  content: { flex: 1, padding: 16 },
  stepTitle: { fontSize: 20, fontWeight: '700', color: colors.text, marginBottom: 16 },
  accountRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 14, backgroundColor: colors.card, borderRadius: 10, marginBottom: 8, borderWidth: 2, borderColor: 'transparent' },
  accountRowSelected: { borderColor: colors.secondary },
  accountInfo: { flex: 1 },
  accountName: { fontSize: 15, fontWeight: '600', color: colors.text },
  accountIban: { fontSize: 12, color: colors.subtext, marginTop: 2 },
  accountBalance: { fontSize: 15, fontWeight: '700', color: colors.primary },
  tabRow: { flexDirection: 'row', backgroundColor: colors.card, borderRadius: 10, marginBottom: 14, padding: 4 },
  tab: { flex: 1, paddingVertical: 8, alignItems: 'center', borderRadius: 8 },
  tabActive: { backgroundColor: colors.secondary },
  tabText: { color: colors.subtext, fontWeight: '600' },
  tabTextActive: { color: '#FFFFFF' },
  toggleRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 12, backgroundColor: colors.card, padding: 14, borderRadius: 10 },
  toggleLabel: { color: colors.text, fontSize: 15 },
  amountContainer: { marginBottom: 8 },
  sectionLabel: { fontSize: 14, color: colors.subtext, marginTop: 12, marginBottom: 8 },
  typeRow: { flexDirection: 'row', gap: 8 },
  typeBtn: { flex: 1, paddingVertical: 10, borderRadius: 8, backgroundColor: colors.card, alignItems: 'center', borderWidth: 1, borderColor: colors.border },
  typeBtnActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  typeBtnText: { color: colors.subtext, fontWeight: '600' },
  typeBtnTextActive: { color: '#FFFFFF' },
  summaryCard: { padding: 16, marginBottom: 16 },
  summaryRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 8 },
  summaryKey: { color: colors.subtext, fontSize: 14 },
  summaryVal: { color: colors.text, fontSize: 14, fontWeight: '500', maxWidth: '60%', textAlign: 'right' },
  summaryAmount: { color: colors.primary, fontWeight: '700', fontSize: 18 },
  termsBox: { backgroundColor: colors.card, borderRadius: 10, padding: 14 },
  termsText: { color: colors.subtext, fontSize: 12, lineHeight: 18 },
  footer: { padding: 16, backgroundColor: colors.card, borderTopWidth: 1, borderTopColor: colors.border },
  nextBtn: { width: '100%' },
  errorText: { color: colors.error, fontSize: 12, marginTop: 4 },
  pinLabel: { color: colors.text, marginBottom: 12, textAlign: 'center' },
});

export default TransferScreen;
