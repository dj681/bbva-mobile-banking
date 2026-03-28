import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Switch,
  Platform,
  Alert,
} from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { useCards } from '@/hooks/useCards';
import { useTheme } from '@/hooks/useTheme';
import { CreditCard } from '@/components/banking/CreditCard';
import { Badge } from '@/components/common/Badge';
import { Button } from '@/components/common/Button';
import { Modal } from '@/components/common/Modal';
import { Input } from '@/components/common/Input';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { Divider } from '@/components/common/Divider';
import { formatCurrency } from '@/utils/formatters';
import type { CardsStackParamList } from '@/types';

type Route = RouteProp<CardsStackParamList, 'CardDetails'>;

export const CardDetailsScreen: React.FC = () => {
  const navigation = useNavigation();
  const route = useRoute<Route>();
  const { cardId } = route.params;
  const { theme } = useTheme();
  const { cards, blockCard, unblockCard, isLoading } = useCards();

  const card = cards.find(c => c.id === cardId);

  const [blockModalVisible, setBlockModalVisible] = useState(false);
  const [pinModalVisible, setPinModalVisible] = useState(false);
  const [reportModalVisible, setReportModalVisible] = useState(false);
  const [onlineEnabled, setOnlineEnabled] = useState(card?.onlinePaymentEnabled ?? true);
  const [intlEnabled, setIntlEnabled] = useState(card?.internationalEnabled ?? true);
  const [contactlessEnabled, setContactlessEnabled] = useState(card?.contactlessEnabled ?? true);
  const [dailyLimit, setDailyLimit] = useState(String(card?.dailyLimit ?? 1000));
  const [monthlyLimit, setMonthlyLimit] = useState(String(card?.spendingLimit ?? 5000));

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

  if (!card) return <LoadingSpinner />;

  const isBlocked = card.status === 'blocked';

  const handleToggleBlock = async () => {
    setBlockModalVisible(false);
    if (isBlocked) await unblockCard(cardId);
    else await blockCard(cardId);
  };

  const statusLabel = (s: string) => s === 'active' ? 'Active' : s === 'blocked' ? 'Bloquée' : s === 'expired' ? 'Expirée' : 'En attente';
  const statusVariant = (s: string): 'success' | 'error' | 'warning' | 'info' => s === 'active' ? 'success' : s === 'blocked' ? 'error' : s === 'expired' ? 'warning' : 'info';

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}><Text style={styles.backText}>‹ Retour</Text></TouchableOpacity>
        <Text style={styles.headerTitle}>Détails de la carte</Text>
        <View style={{ width: 60 }} />
      </View>
      <ScrollView contentContainerStyle={{ paddingBottom: 40 }}>
        <View style={styles.cardWrapper}>
          <CreditCard card={card} />
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Informations</Text>
          <View style={styles.infoRow}><Text style={styles.infoKey}>Numéro</Text><Text style={styles.infoVal}>{card.cardNumber}</Text></View>
          <Divider />
          <View style={styles.infoRow}><Text style={styles.infoKey}>Expiration</Text><Text style={styles.infoVal}>{card.expiryDate}</Text></View>
          <Divider />
          <View style={styles.infoRow}><Text style={styles.infoKey}>Titulaire</Text><Text style={styles.infoVal}>{card.holderName}</Text></View>
          <Divider />
          <View style={styles.infoRow}><Text style={styles.infoKey}>Statut</Text><Badge label={statusLabel(card.status)} variant={statusVariant(card.status)} /></View>
          {card.creditLimit && (
            <>
              <Divider />
              <View style={styles.infoRow}><Text style={styles.infoKey}>Limite crédit</Text><Text style={styles.infoVal}>{formatCurrency(card.creditLimit, 'EUR')}</Text></View>
              <Divider />
              <View style={styles.infoRow}><Text style={styles.infoKey}>Crédit disponible</Text><Text style={[styles.infoVal, { color: colors.success }]}>{formatCurrency(card.availableCredit ?? 0, 'EUR')}</Text></View>
            </>
          )}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Statut de la carte</Text>
          <TouchableOpacity style={[styles.blockBtn, isBlocked ? styles.unblockBtn : styles.blockBtnRed]} onPress={() => setBlockModalVisible(true)}>
            <Text style={styles.blockBtnText}>{isBlocked ? '🔓 Débloquer la carte' : '🔒 Bloquer la carte'}</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Limites de paiement</Text>
          <Input label="Plafond journalier (EUR)" value={dailyLimit} onChangeText={setDailyLimit} keyboardType="number-pad" />
          <Input label="Plafond mensuel (EUR)" value={monthlyLimit} onChangeText={setMonthlyLimit} keyboardType="number-pad" />
          <View style={styles.switchRow}><Text style={styles.switchLabel}>Paiement en ligne</Text><Switch value={onlineEnabled} onValueChange={setOnlineEnabled} trackColor={{ true: colors.secondary }} /></View>
          <View style={styles.switchRow}><Text style={styles.switchLabel}>Paiement international</Text><Switch value={intlEnabled} onValueChange={setIntlEnabled} trackColor={{ true: colors.secondary }} /></View>
          <View style={styles.switchRow}><Text style={styles.switchLabel}>Paiement sans contact</Text><Switch value={contactlessEnabled} onValueChange={setContactlessEnabled} trackColor={{ true: colors.secondary }} /></View>
          <Button title="Enregistrer les limites" onPress={() => {}} style={{ marginTop: 8 }} />
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Sécurité</Text>
          <TouchableOpacity style={styles.securityBtn} onPress={() => setPinModalVisible(true)}>
            <Text style={styles.securityIcon}>🔑</Text>
            <Text style={styles.securityLabel}>Modifier le code PIN</Text>
            <Text style={styles.chevron}>›</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.securityBtn} onPress={() => {}}>
            <Text style={styles.securityIcon}>💳</Text>
            <Text style={styles.securityLabel}>Voir le numéro virtuel</Text>
            <Text style={styles.chevron}>›</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.securityBtn, { borderColor: colors.error }]} onPress={() => setReportModalVisible(true)}>
            <Text style={styles.securityIcon}>🚨</Text>
            <Text style={[styles.securityLabel, { color: colors.error }]}>Signaler perte / vol</Text>
            <Text style={[styles.chevron, { color: colors.error }]}>›</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      <Modal visible={blockModalVisible} onClose={() => setBlockModalVisible(false)} title={isBlocked ? 'Débloquer la carte' : 'Bloquer la carte'}>
        <Text style={{ color: colors.text, marginBottom: 16, textAlign: 'center' }}>
          {isBlocked ? 'Êtes-vous sûr de vouloir débloquer cette carte ?' : 'Êtes-vous sûr de vouloir bloquer cette carte ? Aucune transaction ne sera possible.'}
        </Text>
        <Button title={isBlocked ? 'Débloquer' : 'Bloquer'} onPress={handleToggleBlock} disabled={isLoading} />
        <Button title="Annuler" onPress={() => setBlockModalVisible(false)} variant="outline" style={{ marginTop: 8 }} />
      </Modal>

      <Modal visible={pinModalVisible} onClose={() => setPinModalVisible(false)} title="Modifier le code PIN">
        <Input label="Ancien code PIN" secureTextEntry keyboardType="number-pad" maxLength={4} value="" onChangeText={() => {}} />
        <Input label="Nouveau code PIN" secureTextEntry keyboardType="number-pad" maxLength={4} value="" onChangeText={() => {}} />
        <Input label="Confirmer le nouveau PIN" secureTextEntry keyboardType="number-pad" maxLength={4} value="" onChangeText={() => {}} />
        <Button title="Changer le PIN" onPress={() => setPinModalVisible(false)} style={{ marginTop: 8 }} />
      </Modal>

      <Modal visible={reportModalVisible} onClose={() => setReportModalVisible(false)} title="Signaler perte / vol">
        <Text style={{ color: colors.text, textAlign: 'center', marginBottom: 16 }}>Votre carte sera immédiatement bloquée et un conseiller vous contactera dans les plus brefs délais.</Text>
        <Button title="Confirmer le signalement" onPress={() => { handleToggleBlock(); setReportModalVisible(false); }} />
        <Button title="Annuler" onPress={() => setReportModalVisible(false)} variant="outline" style={{ marginTop: 8 }} />
      </Modal>

      {isLoading && <LoadingSpinner />}
    </View>
  );
};

const makeStyles = (colors: Record<string, string>) => StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: colors.primary, padding: 16, paddingTop: Platform.OS === 'ios' ? 50 : 16 },
  backText: { color: '#FFFFFF', fontSize: 18, width: 60 },
  headerTitle: { color: '#FFFFFF', fontSize: 18, fontWeight: '700' },
  cardWrapper: { padding: 16, alignItems: 'center' },
  section: { backgroundColor: colors.card, margin: 16, marginBottom: 0, borderRadius: 12, padding: 16 },
  sectionTitle: { fontSize: 16, fontWeight: '700', color: colors.text, marginBottom: 12 },
  infoRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 10 },
  infoKey: { color: colors.subtext, fontSize: 14 },
  infoVal: { color: colors.text, fontSize: 14, fontWeight: '600' },
  blockBtn: { borderRadius: 10, padding: 14, alignItems: 'center', borderWidth: 1 },
  blockBtnRed: { backgroundColor: colors.error + '15', borderColor: colors.error },
  unblockBtn: { backgroundColor: colors.success + '15', borderColor: colors.success },
  blockBtnText: { fontWeight: '700', fontSize: 15, color: colors.text },
  switchRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: colors.border },
  switchLabel: { color: colors.text, fontSize: 14 },
  securityBtn: { flexDirection: 'row', alignItems: 'center', paddingVertical: 12, borderWidth: 1, borderColor: colors.border, borderRadius: 10, paddingHorizontal: 12, marginBottom: 8 },
  securityIcon: { fontSize: 20, marginRight: 12 },
  securityLabel: { flex: 1, color: colors.text, fontSize: 14 },
  chevron: { color: colors.subtext, fontSize: 18 },
});

export default CardDetailsScreen;
