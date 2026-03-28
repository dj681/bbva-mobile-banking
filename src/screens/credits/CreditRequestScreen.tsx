import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Platform,
  KeyboardAvoidingView,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useTheme } from '@/hooks/useTheme';
import { Button } from '@/components/common/Button';
import { Input } from '@/components/common/Input';
import { Card } from '@/components/common/Card';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { formatCurrency } from '@/utils/formatters';

type CreditTypeKey = 'personal' | 'mortgage' | 'auto' | 'student';

const STEPS = ['Type & Montant', 'Informations', 'Documents', 'Récapitulatif'];

const CREDIT_TYPES = [
  { key: 'personal' as CreditTypeKey, label: 'Personnel', icon: '💼', desc: 'Pour tous vos projets personnels' },
  { key: 'mortgage' as CreditTypeKey, label: 'Immobilier', icon: '🏠', desc: 'Achat ou travaux immobiliers' },
  { key: 'auto' as CreditTypeKey, label: 'Auto', icon: '🚗', desc: 'Financement véhicule' },
  { key: 'student' as CreditTypeKey, label: 'Étudiant', icon: '🎓', desc: 'Études et formation' },
];

const DOCUMENTS = [
  { id: '1', label: "Pièce d'identité", icon: '🪪', uploaded: false },
  { id: '2', label: 'Justificatif de domicile', icon: '🏠', uploaded: false },
  { id: '3', label: '3 derniers bulletins de salaire', icon: '📄', uploaded: false },
  { id: '4', label: '2 derniers avis d\'imposition', icon: '📋', uploaded: false },
  { id: '5', label: 'RIB bancaire', icon: '🏦', uploaded: false },
];

interface FormData {
  creditType: CreditTypeKey | '';
  amount: string;
  duration: string;
  profession: string;
  employer: string;
  income: string;
  otherIncome: string;
  purpose: string;
}

export const CreditRequestScreen: React.FC = () => {
  const navigation = useNavigation();
  const { theme } = useTheme();

  const [step, setStep] = useState(0);
  const [form, setForm] = useState<FormData>({
    creditType: '',
    amount: '',
    duration: '',
    profession: '',
    employer: '',
    income: '',
    otherIncome: '',
    purpose: '',
  });
  const [documents, setDocuments] = useState(DOCUMENTS);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

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

  const updateForm = (key: keyof FormData, value: string) => setForm(f => ({ ...f, [key]: value }));

  const validateStep = (): boolean => {
    const errs: Record<string, string> = {};
    if (step === 0) {
      if (!form.creditType) errs.creditType = 'Veuillez sélectionner un type de crédit';
      if (!form.amount || parseFloat(form.amount) < 1000) errs.amount = 'Montant minimum : 1 000€';
      if (!form.duration || parseInt(form.duration) < 6) errs.duration = 'Durée minimum : 6 mois';
    }
    if (step === 1) {
      if (!form.profession.trim()) errs.profession = 'La profession est requise';
      if (!form.income.trim()) errs.income = 'Le revenu mensuel est requis';
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleNext = async () => {
    if (!validateStep()) return;
    if (step < 3) { setStep(s => s + 1); return; }
    setIsLoading(true);
    await new Promise(r => setTimeout(r, 2000));
    setIsLoading(false);
    setSubmitted(true);
  };

  const toggleDocument = (id: string) => {
    setDocuments(docs => docs.map(d => d.id === id ? { ...d, uploaded: !d.uploaded } : d));
  };

  const selectedType = CREDIT_TYPES.find(t => t.key === form.creditType);

  if (submitted) {
    return (
      <View style={[styles.container, styles.successContainer]}>
        <Text style={styles.successIcon}>✅</Text>
        <Text style={styles.successTitle}>Demande envoyée !</Text>
        <Text style={styles.successMessage}>Votre demande de crédit a été soumise avec succès. Un conseiller BBVA vous contactera dans les 48h ouvrables.</Text>
        <Text style={styles.successRef}>Référence : BBVA-{Date.now().toString().slice(-8)}</Text>
        <Button title="Retour à l'accueil" onPress={() => navigation.goBack()} style={{ marginTop: 24 }} />
      </View>
    );
  }

  const renderStep0 = () => (
    <View>
      <Text style={styles.stepTitle}>Type de crédit et montant</Text>
      <View style={styles.typeGrid}>
        {CREDIT_TYPES.map(t => (
          <TouchableOpacity key={t.key} style={[styles.typeCard, form.creditType === t.key && styles.typeCardActive]} onPress={() => updateForm('creditType', t.key)}>
            <Text style={styles.typeIcon}>{t.icon}</Text>
            <Text style={[styles.typeLabel, form.creditType === t.key && styles.typeLabelActive]}>{t.label}</Text>
            <Text style={styles.typeDesc}>{t.desc}</Text>
          </TouchableOpacity>
        ))}
      </View>
      {errors.creditType && <Text style={styles.errorText}>{errors.creditType}</Text>}
      <Input label="Montant souhaité (EUR)" value={form.amount} onChangeText={v => updateForm('amount', v)} keyboardType="decimal-pad" placeholder="Ex: 10000" error={errors.amount} />
      <Input label="Durée souhaitée (mois)" value={form.duration} onChangeText={v => updateForm('duration', v)} keyboardType="number-pad" placeholder="Ex: 48" error={errors.duration} />
      <Input label="Objet du crédit" value={form.purpose} onChangeText={v => updateForm('purpose', v)} placeholder="Ex: Achat véhicule" />
    </View>
  );

  const renderStep1 = () => (
    <View>
      <Text style={styles.stepTitle}>Informations personnelles</Text>
      <Input label="Profession" value={form.profession} onChangeText={v => updateForm('profession', v)} placeholder="Ex: Ingénieur" error={errors.profession} />
      <Input label="Employeur" value={form.employer} onChangeText={v => updateForm('employer', v)} placeholder="Ex: BBVA France" />
      <Input label="Revenu mensuel net (EUR)" value={form.income} onChangeText={v => updateForm('income', v)} keyboardType="decimal-pad" placeholder="Ex: 3500" error={errors.income} />
      <Input label="Autres revenus mensuels (EUR)" value={form.otherIncome} onChangeText={v => updateForm('otherIncome', v)} keyboardType="decimal-pad" placeholder="Ex: 0" />
    </View>
  );

  const renderStep2 = () => (
    <View>
      <Text style={styles.stepTitle}>Documents requis</Text>
      <Text style={styles.docSubtitle}>Veuillez préparer les documents suivants. Vous pourrez les envoyer par e-mail à votre conseiller.</Text>
      {documents.map(doc => (
        <TouchableOpacity key={doc.id} style={[styles.docRow, doc.uploaded && styles.docRowUploaded]} onPress={() => toggleDocument(doc.id)}>
          <Text style={styles.docIcon}>{doc.icon}</Text>
          <Text style={styles.docLabel}>{doc.label}</Text>
          <Text style={doc.uploaded ? styles.docCheck : styles.docUpload}>{doc.uploaded ? '✓' : '↑'}</Text>
        </TouchableOpacity>
      ))}
      <Text style={styles.docNote}>📎 Formats acceptés : PDF, JPEG, PNG (max 10 Mo par fichier)</Text>
    </View>
  );

  const renderStep3 = () => (
    <View>
      <Text style={styles.stepTitle}>Récapitulatif de la demande</Text>
      <Card style={styles.summaryCard}>
        <View style={styles.summaryRow}><Text style={styles.summaryKey}>Type</Text><Text style={styles.summaryVal}>{selectedType?.label}</Text></View>
        <View style={styles.summaryRow}><Text style={styles.summaryKey}>Montant</Text><Text style={styles.summaryVal}>{formatCurrency(parseFloat(form.amount) || 0, 'EUR')}</Text></View>
        <View style={styles.summaryRow}><Text style={styles.summaryKey}>Durée</Text><Text style={styles.summaryVal}>{form.duration} mois</Text></View>
        {form.purpose ? <View style={styles.summaryRow}><Text style={styles.summaryKey}>Objet</Text><Text style={styles.summaryVal}>{form.purpose}</Text></View> : null}
        <View style={styles.summaryRow}><Text style={styles.summaryKey}>Profession</Text><Text style={styles.summaryVal}>{form.profession}</Text></View>
        <View style={styles.summaryRow}><Text style={styles.summaryKey}>Revenu mensuel</Text><Text style={styles.summaryVal}>{formatCurrency(parseFloat(form.income) || 0, 'EUR')}</Text></View>
        <View style={styles.summaryRow}><Text style={styles.summaryKey}>Documents</Text><Text style={styles.summaryVal}>{documents.filter(d => d.uploaded).length}/{documents.length} fournis</Text></View>
      </Card>
      <View style={styles.termsBox}>
        <Text style={styles.termsText}>En soumettant cette demande, vous acceptez que BBVA traite vos données personnelles conformément à la réglementation RGPD. Cette demande est soumise à une étude de votre dossier.</Text>
      </View>
    </View>
  );

  return (
    <KeyboardAvoidingView style={{ flex: 1, backgroundColor: colors.bg }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => step > 0 ? setStep(s => s - 1) : navigation.goBack()}><Text style={styles.backText}>‹ Retour</Text></TouchableOpacity>
        <Text style={styles.headerTitle}>Demande de crédit</Text>
        <Text style={styles.stepCount}>{step + 1}/{STEPS.length}</Text>
      </View>
      <View style={styles.progressBar}>
        <View style={[styles.progressFill, { width: `${((step + 1) / STEPS.length) * 100}%` as any }]} />
      </View>
      <View style={styles.stepLabels}>
        {STEPS.map((label, i) => (
          <Text key={i} style={[styles.stepLabel, i === step && styles.stepLabelActive]}>{label}</Text>
        ))}
      </View>
      <ScrollView style={styles.content} contentContainerStyle={{ paddingBottom: 100 }}>
        {step === 0 && renderStep0()}
        {step === 1 && renderStep1()}
        {step === 2 && renderStep2()}
        {step === 3 && renderStep3()}
      </ScrollView>
      <View style={styles.footer}>
        <Button title={step === 3 ? (isLoading ? 'Envoi en cours...' : 'Soumettre la demande') : 'Continuer'} onPress={handleNext} disabled={isLoading} />
      </View>
      {isLoading && <LoadingSpinner />}
    </KeyboardAvoidingView>
  );
};

const makeStyles = (colors: Record<string, string>) => StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: colors.primary, padding: 16, paddingTop: Platform.OS === 'ios' ? 50 : 16 },
  backText: { color: '#FFFFFF', fontSize: 18, width: 60 },
  headerTitle: { color: '#FFFFFF', fontSize: 18, fontWeight: '700' },
  stepCount: { color: '#FFFFFF', fontSize: 14, width: 40, textAlign: 'right' },
  progressBar: { height: 4, backgroundColor: colors.border },
  progressFill: { height: 4, backgroundColor: colors.secondary },
  stepLabels: { flexDirection: 'row', justifyContent: 'space-around', backgroundColor: colors.card, paddingVertical: 6 },
  stepLabel: { fontSize: 10, color: colors.subtext },
  stepLabelActive: { color: colors.secondary, fontWeight: '700' },
  content: { flex: 1, padding: 16 },
  stepTitle: { fontSize: 20, fontWeight: '700', color: colors.text, marginBottom: 16 },
  typeGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 12 },
  typeCard: { width: '47%', padding: 14, borderRadius: 12, backgroundColor: colors.card, borderWidth: 2, borderColor: 'transparent', alignItems: 'center' },
  typeCardActive: { borderColor: colors.secondary },
  typeIcon: { fontSize: 28, marginBottom: 6 },
  typeLabel: { fontSize: 14, fontWeight: '700', color: colors.text },
  typeLabelActive: { color: colors.secondary },
  typeDesc: { fontSize: 11, color: colors.subtext, textAlign: 'center', marginTop: 4 },
  errorText: { color: colors.error, fontSize: 12, marginBottom: 8 },
  docSubtitle: { color: colors.subtext, fontSize: 13, marginBottom: 12 },
  docRow: { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.card, borderRadius: 10, padding: 14, marginBottom: 8, borderWidth: 1, borderColor: colors.border },
  docRowUploaded: { borderColor: colors.success },
  docIcon: { fontSize: 22, marginRight: 12 },
  docLabel: { flex: 1, color: colors.text, fontSize: 14 },
  docCheck: { color: colors.success, fontSize: 18, fontWeight: '700' },
  docUpload: { color: colors.secondary, fontSize: 18 },
  docNote: { color: colors.subtext, fontSize: 12, marginTop: 8 },
  summaryCard: { padding: 16, marginBottom: 16 },
  summaryRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: colors.border },
  summaryKey: { color: colors.subtext, fontSize: 14 },
  summaryVal: { color: colors.text, fontSize: 14, fontWeight: '600' },
  termsBox: { backgroundColor: colors.card, borderRadius: 10, padding: 14 },
  termsText: { color: colors.subtext, fontSize: 12, lineHeight: 18 },
  footer: { padding: 16, backgroundColor: colors.card, borderTopWidth: 1, borderTopColor: colors.border },
  successContainer: { alignItems: 'center', justifyContent: 'center', padding: 32 },
  successIcon: { fontSize: 64 },
  successTitle: { fontSize: 24, fontWeight: '700', color: colors.text, marginTop: 16 },
  successMessage: { color: colors.subtext, fontSize: 15, textAlign: 'center', marginTop: 12, lineHeight: 22 },
  successRef: { color: colors.secondary, fontSize: 13, marginTop: 16, fontWeight: '600' },
});

export default CreditRequestScreen;
