import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ViewStyle,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING, FONT_SIZE, FONT_FAMILY } from '@/constants';
import type { Transaction, TransactionStatus, TransactionType } from '@/types';
import { Badge } from '../common/Badge';

interface TransactionItemProps {
  transaction: Transaction;
  onPress?: (transaction: Transaction) => void;
  style?: ViewStyle;
}

const CATEGORY_CONFIG: Record<
  string,
  { icon: keyof typeof Ionicons.glyphMap; color: string }
> = {
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
  default: { icon: 'ellipsis-horizontal-outline', color: COLORS.gray500 },
};

const STATUS_BADGE_VARIANT: Record<TransactionStatus, 'success' | 'error' | 'warning' | 'info' | 'default'> = {
  completed: 'success',
  failed: 'error',
  pending: 'warning',
  cancelled: 'default',
};

function getRelativeDate(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffDays === 0) return 'Hoy';
  if (diffDays === 1) return 'Ayer';
  if (diffDays < 7) return `hace ${diffDays} d`;
  if (diffDays < 30) return `hace ${Math.floor(diffDays / 7)} sem`;
  return date.toLocaleDateString('es-ES', { month: 'short', day: 'numeric' });
}

function formatAmount(amount: number, currency: string, type: TransactionType): string {
  const formatted = new Intl.NumberFormat('es-ES', {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
  }).format(Math.abs(amount));

  const isCredit = type === 'credit';
  return isCredit ? `+${formatted}` : `-${formatted}`;
}

export const TransactionItem: React.FC<TransactionItemProps> = ({
  transaction,
  onPress,
  style,
}) => {
  const categoryKey = transaction.category?.toLowerCase() ?? 'default';
  const config = CATEGORY_CONFIG[categoryKey] ?? CATEGORY_CONFIG['default'];
  const isCredit = transaction.type === 'credit';
  const amountColor = isCredit ? COLORS.success : COLORS.gray900;

  return (
    <TouchableOpacity
      style={[styles.container, style]}
      onPress={() => onPress?.(transaction)}
      activeOpacity={0.75}
      accessibilityRole="button"
      accessibilityLabel={`${transaction.description}, ${formatAmount(transaction.amount, transaction.currency, transaction.type)}`}
    >
      {/* Category icon */}
      <View style={[styles.iconCircle, { backgroundColor: `${config.color}1A` }]}>
        <Ionicons name={config.icon} size={20} color={config.color} />
      </View>

      {/* Transaction info */}
      <View style={styles.info}>
        <Text style={styles.name} numberOfLines={1}>
          {transaction.merchant ?? transaction.description}
        </Text>
        <View style={styles.metaRow}>
          <Text style={styles.date}>{getRelativeDate(transaction.date)}</Text>
          {transaction.status !== 'completed' && (
            <Badge
              label={transaction.status}
              variant={STATUS_BADGE_VARIANT[transaction.status]}
              size="small"
              style={styles.badge}
            />
          )}
        </View>
      </View>

      {/* Amount */}
      <View style={styles.amountBlock}>
        <Text style={[styles.amount, { color: amountColor }]}>
          {formatAmount(transaction.amount, transaction.currency, transaction.type)}
        </Text>
        {transaction.notes && (
          <Ionicons name="document-text-outline" size={12} color={COLORS.gray400} style={styles.noteIcon} />
        )}
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.md,
    backgroundColor: COLORS.white,
  },
  iconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: SPACING.md,
  },
  info: {
    flex: 1,
    marginRight: SPACING.sm,
  },
  name: {
    fontFamily: FONT_FAMILY.medium,
    fontSize: FONT_SIZE.md,
    color: COLORS.gray900,
    marginBottom: 2,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
  },
  date: {
    fontFamily: FONT_FAMILY.regular,
    fontSize: FONT_SIZE.xs,
    color: COLORS.gray500,
  },
  badge: {
    marginLeft: SPACING.xs,
  },
  amountBlock: {
    alignItems: 'flex-end',
  },
  amount: {
    fontFamily: FONT_FAMILY.bold,
    fontSize: FONT_SIZE.md,
  },
  noteIcon: {
    marginTop: 2,
  },
});
