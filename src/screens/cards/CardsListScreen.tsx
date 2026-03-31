import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Dimensions,
  Platform,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useCards } from '@/hooks/useCards';
import { useTheme } from '@/hooks/useTheme';
import { useTranslation } from '@/hooks/useTranslation';
import { CreditCard } from '@/components/banking/CreditCard';
import { TransactionItem } from '@/components/banking/TransactionItem';
import { Badge } from '@/components/common/Badge';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { EmptyState } from '@/components/common/EmptyState';
import { Button } from '@/components/common/Button';
import { formatCurrency } from '@/utils/formatters';
import type { CardsStackParamList, Card } from '@/types';

const { width } = Dimensions.get('window');

type Nav = NativeStackNavigationProp<CardsStackParamList, 'CardsList'>;

const MOCK_TRANSACTIONS: Array<{
  id: string;
  cardId: string;
  amount: number;
  currency: string;
  merchant: string;
  category: string;
  date: string;
  status: 'completed' | 'pending' | 'failed';
  type: 'purchase' | 'withdrawal' | 'refund';
  isPending: boolean;
}> = [];

export const CardsListScreen: React.FC = () => {
  const navigation = useNavigation<Nav>();
  const { theme } = useTheme();
  const { t } = useTranslation();
  const { cards, selectedCard, selectCard, isLoading, error } = useCards();
  const [currentIndex, setCurrentIndex] = useState(0);

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
    if (cards.length > 0 && !selectedCard) {
      const virtualCard = cards.find((c) => c.isVirtual);
      selectCard((virtualCard ?? cards[0]).id);
    }
  }, [cards]);

  const styles = makeStyles(colors);

  const statusLabel = (s: string) =>
    s === 'active' ? t('cardStatusActive') :
    s === 'blocked' ? t('cardStatusBlocked') :
    s === 'expired' ? t('cardStatusExpired') :
    t('cardStatusPending');
  const statusVariant = (s: string): 'success' | 'error' | 'warning' | 'info' => s === 'active' ? 'success' : s === 'blocked' ? 'error' : s === 'expired' ? 'warning' : 'info';

  if (isLoading) return <LoadingSpinner />;
  if (error) return (
    <View style={[styles.container, styles.centered]}>
      <Text style={styles.errorText}>{error}</Text>
    </View>
  );

  const card = selectedCard || cards[0];

  const quickActions = [
    { label: card?.status === 'active' ? t('cardBlock') : t('cardUnblock'), icon: card?.status === 'active' ? '🔒' : '🔓', screen: 'CardDetails' },
    { label: t('cardLimits'), icon: '⚙️', screen: 'CardDetails' },
    { label: t('security'), icon: '🛠️', screen: 'CardSettings' },
    { label: t('cardMoves'), icon: '📋', screen: 'CardTransactions' },
  ];

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>{t('myCards')}</Text>
        <TouchableOpacity onPress={() => {}}>
          <Text style={styles.addBtn}>＋</Text>
        </TouchableOpacity>
      </View>
      <ScrollView showsVerticalScrollIndicator={false}>
        {cards.length === 0 ? (
          <EmptyState title={t('noCards')} description={t('noCardsMsg')} />
        ) : (
          <>
            <ScrollView horizontal pagingEnabled showsHorizontalScrollIndicator={false}
              onMomentumScrollEnd={(e) => {
                const idx = Math.round(e.nativeEvent.contentOffset.x / (width - 32));
                setCurrentIndex(idx);
                if (cards[idx]) selectCard(cards[idx].id);
              }}
              contentContainerStyle={styles.carousel}
            >
              {cards.map((c) => (
                <View key={c.id} style={styles.carouselItem}>
                  <CreditCard card={c} />
                </View>
              ))}
            </ScrollView>
            <View style={styles.dotRow}>
              {cards.map((_, i) => <View key={i} style={[styles.dot, i === currentIndex && styles.dotActive]} />)}
            </View>

            {card && (
              <View style={styles.cardDetails}>
                <View style={styles.detailRow}><Text style={styles.detailKey}>{t('cardNumber')}</Text><Text style={styles.detailVal}>{card.cardNumber}</Text></View>
                <View style={styles.detailRow}><Text style={styles.detailKey}>{t('cardExpiry')}</Text><Text style={styles.detailVal}>{card.expiryDate}</Text></View>
                <View style={styles.detailRow}><Text style={styles.detailKey}>{t('cardType')}</Text><Text style={styles.detailVal}>{card.isVirtual ? t('cardVirtual') : t('cardPhysical')}</Text></View>
                <View style={styles.detailRow}><Text style={styles.detailKey}>{t('cardStatus')}</Text><Badge label={statusLabel(card.status)} variant={statusVariant(card.status)} /></View>
                {card.creditLimit && (
                  <View style={styles.detailRow}><Text style={styles.detailKey}>{t('creditLimit')}</Text><Text style={styles.detailVal}>{formatCurrency(card.creditLimit, 'EUR')}</Text></View>
                )}
                <View style={styles.detailRow}><Text style={styles.detailKey}>{t('dailyLimit')}</Text><Text style={styles.detailVal}>{formatCurrency(card.dailyLimit, 'EUR')}</Text></View>
              </View>
            )}

            <View style={styles.actionsRow}>
              {quickActions.map(a => (
                <TouchableOpacity key={a.label} style={styles.actionBtn} onPress={() => navigation.navigate(a.screen as any, { cardId: card?.id })}>
                  <Text style={styles.actionIcon}>{a.icon}</Text>
                  <Text style={styles.actionLabel}>{a.label}</Text>
                </TouchableOpacity>
              ))}
            </View>

            <View style={styles.transactionsSection}>
              <View style={styles.txHeader}>
                <Text style={styles.txTitle}>{t('latestOperations')}</Text>
                <TouchableOpacity onPress={() => navigation.navigate('CardTransactions', { cardId: card?.id })}>
                  <Text style={styles.txSeeAll}>Ver todo</Text>
                </TouchableOpacity>
              </View>
              {MOCK_TRANSACTIONS.slice(0, 5).map(tx => (
                <View key={tx.id} style={styles.txRow}>
                  <View style={styles.txMerchant}>
                    <Text style={styles.txMerchantName}>{tx.merchant}</Text>
                    <Text style={styles.txCategory}>{tx.category}</Text>
                  </View>
                  <View style={{ alignItems: 'flex-end' }}>
                    <Text style={[styles.txAmount, { color: tx.amount < 0 ? colors.error : colors.success }]}>{tx.amount > 0 ? '+' : ''}{formatCurrency(tx.amount, tx.currency)}</Text>
                    {tx.isPending && <Text style={styles.txPending}>{t('pendingStatus')}</Text>}
                  </View>
                </View>
              ))}
              <Button label={t('seeAllMovements')} onPress={() => navigation.navigate('CardTransactions', { cardId: card?.id })} variant="outline" style={{ marginTop: 8 }} />
            </View>
          </>
        )}
      </ScrollView>
    </View>
  );
};

const makeStyles = (colors: Record<string, string>) => StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  centered: { alignItems: 'center', justifyContent: 'center' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: colors.primary, padding: 16, paddingTop: Platform.OS === 'ios' ? 50 : 16 },
  headerTitle: { color: '#FFFFFF', fontSize: 20, fontWeight: '700' },
  addBtn: { color: '#FFFFFF', fontSize: 24, fontWeight: '300' },
  carousel: { paddingHorizontal: 16, paddingTop: 16 },
  carouselItem: { width: width - 32, marginRight: 0 },
  dotRow: { flexDirection: 'row', justifyContent: 'center', paddingVertical: 10, gap: 6 },
  dot: { width: 8, height: 8, borderRadius: 4, backgroundColor: colors.border },
  dotActive: { backgroundColor: colors.secondary, width: 20 },
  cardDetails: { backgroundColor: colors.card, margin: 16, borderRadius: 12, padding: 16 },
  detailRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: colors.border },
  detailKey: { color: colors.subtext, fontSize: 14 },
  detailVal: { color: colors.text, fontSize: 14, fontWeight: '600' },
  actionsRow: { flexDirection: 'row', justifyContent: 'space-around', backgroundColor: colors.card, marginHorizontal: 16, marginBottom: 16, borderRadius: 12, padding: 16 },
  actionBtn: { alignItems: 'center' },
  actionIcon: { fontSize: 24 },
  actionLabel: { color: colors.text, fontSize: 11, marginTop: 4, fontWeight: '500' },
  transactionsSection: { backgroundColor: colors.card, margin: 16, borderRadius: 12, padding: 16 },
  txHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12 },
  txTitle: { fontSize: 16, fontWeight: '700', color: colors.text },
  txSeeAll: { color: colors.secondary, fontSize: 14 },
  txRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: colors.border },
  txMerchant: {},
  txMerchantName: { fontSize: 14, fontWeight: '600', color: colors.text },
  txCategory: { fontSize: 12, color: colors.subtext },
  txAmount: { fontSize: 14, fontWeight: '700' },
  txPending: { fontSize: 11, color: '#FF9800', marginTop: 2 },
  errorText: { color: colors.error, fontSize: 14 },
});

export default CardsListScreen;
