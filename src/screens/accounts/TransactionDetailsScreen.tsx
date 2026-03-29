import React, { useCallback, useState } from 'react';
import {
  ScrollView,
  Share,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';
import type { RouteProp } from '@react-navigation/native';

import { Badge } from '@/components/common/Badge';
import { Card } from '@/components/common/Card';
import { Button } from '@/components/common/Button';
import { useAccounts } from '@/hooks/useAccounts';
import { useTheme } from '@/hooks/useTheme';
import type { AccountsStackParamList, Transaction, TransactionStatus } from '@/types';
import { formatCurrency, formatDate } from '@/utils';

type TransactionDetailsRouteProp = RouteProp<AccountsStackParamList, 'TransactionDetails'>;

const STATUS_LABELS: Record<TransactionStatus, string> = {
  completed: 'Completada',
  pending: 'Pendiente',
  failed: 'Fallida',
  cancelled: 'Cancelada',
};

const STATUS_VARIANT: Record<TransactionStatus, 'success' | 'warning' | 'error' | 'default'> = {
  completed: 'success',
  pending: 'warning',
  failed: 'error',
  cancelled: 'default',
};

const CATEGORY_ICONS: Record<string, { icon: keyof typeof Ionicons.glyphMap; color: string }> = {
  food: { icon: 'fast-food-outline', color: '#FF5722' },
  transport: { icon: 'car-outline', color: '#2196F3' },
  shopping: { icon: 'bag-outline', color: '#9C27B0' },
  entertainment: { icon: 'film-outline', color: '#E91E63' },
  health: { icon: 'medkit-outline', color: '#4CAF50' },
  utilities: { icon: 'flash-outline', color: '#FF9800' },
  transfer: { icon: 'swap-horizontal-outline', color: '#00A8E8' },
  payment: { icon: 'receipt-outline', color: '#607D8B' },
  salary: { icon: 'briefcase-outline', color: '#4CAF50' },
  investment: { icon: 'trending-up-outline', color: '#3F51B5' },
  default: { icon: 'ellipsis-horizontal-outline', color: '#9E9E9E' },
};

export const TransactionDetailsScreen: React.FC = () => {
  const route = useRoute<TransactionDetailsRouteProp>();
  const { transactionId, accountId } = route.params;
  const { colors, spacing, borderRadius } = useTheme();
  const { transactions } = useAccounts();

  const transaction = transactions.find((t) => t.id === transactionId) ?? null;
  const [notes, setNotes] = useState(transaction?.notes ?? '');
  const [editingNotes, setEditingNotes] = useState(false);

  const styles = makeStyles(colors, spacing, borderRadius);

  const handleShare = useCallback(async () => {
    if (!transaction) return;
    await Share.share({
      message: `Transaction BBVA\n${transaction.description}\nMontant: ${formatCurrency(
        transaction.amount,
        transaction.currency,
      )}\nDate: ${formatDate(transaction.date, 'dd/MM/yyyy HH:mm')}\nReferencia: ${transaction.reference}`,
    });
  }, [transaction]);

  if (!transaction) {
    return (
      <View style={[styles.container, styles.centered]}>
        <Ionicons name="alert-circle-outline" size={48} color={colors.error} />
        <Text style={styles.errorText}>Transacción no encontrada</Text>
      </View>
    );
  }

  const catConfig = CATEGORY_ICONS[transaction.category] ?? CATEGORY_ICONS.default;
  const isCredit = transaction.type === 'credit';
  const amountColor = isCredit ? colors.success : colors.error;
  const amountPrefix = isCredit ? '+' : '-';

  const fields: { label: string; value: string; mono?: boolean }[] = [
    { label: 'Fecha y hora', value: formatDate(transaction.date, "dd/MM/yyyy 'a las' HH:mm") },
    {
      label: 'Tipo',
      value:
        transaction.type === 'credit'
          ? 'Crédito'
          : transaction.type === 'debit'
          ? 'Débito'
          : transaction.type === 'transfer'
          ? 'Transferencia'
          : 'Pago',
    },
    { label: 'Categoría', value: transaction.category },
    { label: 'Referencia', value: transaction.reference, mono: true },
    { label: 'Descripción', value: transaction.description },
    ...(transaction.counterpartName
      ? [
          {
            label:
              transaction.type === 'credit' ? 'Remitente' : 'Destinatario',
            value: transaction.counterpartName,
          },
        ]
      : []),
    ...(transaction.counterpartIban
      ? [{ label: 'IBAN de la contraparte', value: transaction.counterpartIban, mono: true }]
      : []),
  ];

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      {/* Icon + Amount */}
      <View style={styles.heroSection}>
        <View style={[styles.categoryCircle, { backgroundColor: catConfig.color + '22' }]}>
          <Ionicons name={catConfig.icon} size={40} color={catConfig.color} />
        </View>
        <Text style={[styles.amount, { color: amountColor }]}>
          {amountPrefix}
          {formatCurrency(Math.abs(transaction.amount), transaction.currency)}
        </Text>
        <Text style={styles.description}>{transaction.description}</Text>
        <Badge
          label={STATUS_LABELS[transaction.status]}
          variant={STATUS_VARIANT[transaction.status]}
          style={styles.statusBadge}
        />
      </View>

      {/* Details Card */}
      <View style={styles.detailsCard}>
        {fields.map(({ label, value, mono }) => (
          <View key={label} style={styles.detailRow}>
            <Text style={styles.detailLabel}>{label}</Text>
            <Text style={[styles.detailValue, mono && styles.monoText]} selectable>
              {value}
            </Text>
          </View>
        ))}
      </View>

      {/* Notes */}
      <View style={styles.notesCard}>
        <View style={styles.notesHeader}>
          <Text style={styles.notesTitle}>Notas</Text>
          <TouchableOpacity onPress={() => setEditingNotes((e) => !e)}>
            <Ionicons
              name={editingNotes ? 'checkmark-outline' : 'pencil-outline'}
              size={18}
              color={colors.primary}
            />
          </TouchableOpacity>
        </View>
        {editingNotes ? (
          <TextInput
            style={styles.notesInput}
            value={notes}
            onChangeText={setNotes}
            placeholder="Añadir una nota..."
            placeholderTextColor={colors.placeholder}
            multiline
            autoFocus
          />
        ) : (
          <Text style={styles.notesText}>
            {notes || 'Sin notas. Pulse el lápiz para añadir una.'}
          </Text>
        )}
      </View>

      {/* Share Button */}
      <Button
        title="Compartir / Exportar"
        onPress={handleShare}
        variant="outline"
        icon="share-outline"
        style={styles.shareButton}
      />
    </ScrollView>
  );
};

const makeStyles = (
  colors: ReturnType<typeof useTheme>['colors'],
  spacing: ReturnType<typeof useTheme>['spacing'],
  borderRadius: ReturnType<typeof useTheme>['borderRadius'],
) =>
  StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background },
    centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    content: { paddingBottom: spacing.xxxl },
    errorText: { fontSize: 16, color: colors.error, marginTop: spacing.md },
    heroSection: {
      alignItems: 'center',
      backgroundColor: colors.surface,
      paddingVertical: spacing.xl,
      paddingHorizontal: spacing.md,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    categoryCircle: {
      width: 80,
      height: 80,
      borderRadius: 40,
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: spacing.md,
    },
    amount: { fontSize: 32, fontWeight: '800', marginBottom: spacing.xs },
    description: { fontSize: 15, color: colors.textSecondary, textAlign: 'center', marginBottom: spacing.sm },
    statusBadge: { marginTop: spacing.xs },
    detailsCard: {
      margin: spacing.md,
      backgroundColor: colors.card,
      borderRadius: borderRadius.lg,
      borderWidth: 1,
      borderColor: colors.cardBorder,
      overflow: 'hidden',
    },
    detailRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
      paddingHorizontal: spacing.md,
      paddingVertical: spacing.sm + 2,
      borderBottomWidth: StyleSheet.hairlineWidth,
      borderBottomColor: colors.divider,
    },
    detailLabel: { fontSize: 13, color: colors.textSecondary, flex: 1 },
    detailValue: { fontSize: 13, color: colors.text, fontWeight: '500', flex: 2, textAlign: 'right' },
    monoText: { fontFamily: 'monospace', fontSize: 12 },
    notesCard: {
      marginHorizontal: spacing.md,
      marginBottom: spacing.md,
      backgroundColor: colors.card,
      borderRadius: borderRadius.lg,
      borderWidth: 1,
      borderColor: colors.cardBorder,
      padding: spacing.md,
    },
    notesHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.sm },
    notesTitle: { fontSize: 14, fontWeight: '700', color: colors.text },
    notesInput: {
      fontSize: 13,
      color: colors.text,
      borderWidth: 1,
      borderColor: colors.borderFocus,
      borderRadius: borderRadius.md,
      padding: spacing.sm,
      minHeight: 80,
      textAlignVertical: 'top',
    },
    notesText: { fontSize: 13, color: colors.textSecondary, lineHeight: 20 },
    shareButton: { marginHorizontal: spacing.md },
  });

export default TransactionDetailsScreen;
