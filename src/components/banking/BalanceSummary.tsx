import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ViewStyle } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING, BORDER_RADIUS, FONT_SIZE, FONT_FAMILY, FONT_WEIGHT } from '@/constants';

/** Fixed EUR → USD conversion rate used for the secondary balance display */
const EUR_TO_USD = 1.08;

interface BalanceSummaryProps {
  totalBalance: number;
  availableBalance: number;
  currency?: string;
  trend?: 'up' | 'down' | 'neutral';
  trendPercent?: number;
  style?: ViewStyle;
}

function formatCurrency(amount: number, currency: string, hidden: boolean): string {
  if (hidden) return '••••••';
  return new Intl.NumberFormat('es-ES', {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
  }).format(amount);
}

export const BalanceSummary: React.FC<BalanceSummaryProps> = ({
  totalBalance,
  availableBalance,
  currency = 'USD',
  trend = 'neutral',
  trendPercent,
  style,
}) => {
  const [hidden, setHidden] = useState(false);

  const trendColor =
    trend === 'up' ? COLORS.success : trend === 'down' ? COLORS.error : COLORS.gray500;

  const trendIcon: keyof typeof Ionicons.glyphMap =
    trend === 'up'
      ? 'trending-up-outline'
      : trend === 'down'
      ? 'trending-down-outline'
      : 'remove-outline';

  const usdBalance = totalBalance * EUR_TO_USD;

  return (
    <View style={[styles.container, style]}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.sectionLabel}>Saldo total</Text>
        <TouchableOpacity
          onPress={() => setHidden(h => !h)}
          accessibilityLabel={hidden ? 'Mostrar saldo' : 'Ocultar saldo'}
          accessibilityRole="button"
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <Ionicons
            name={hidden ? 'eye-off-outline' : 'eye-outline'}
            size={20}
            color={COLORS.gray500}
          />
        </TouchableOpacity>
      </View>

      {/* Main balance (EUR) */}
      <View style={styles.balanceRow}>
        <Text style={styles.currencySymbol}>{currency}</Text>
        <Text style={styles.totalBalance} accessibilityLabel={`Saldo total: ${formatCurrency(totalBalance, currency, hidden)}`}>
          {formatCurrency(totalBalance, currency, hidden)}
        </Text>
      </View>

      {/* Secondary balance (USD) */}
      <View style={styles.usdRow}>
        <Ionicons name="swap-horizontal-outline" size={13} color={COLORS.gray500} />
        <Text style={styles.usdLabel}>
          {hidden ? '••••••' : formatCurrency(usdBalance, 'USD', false)}
        </Text>
      </View>

      {/* Trend */}
      {trendPercent !== undefined && (
        <View style={styles.trendRow}>
          <Ionicons name={trendIcon} size={14} color={trendColor} />
          <Text style={[styles.trendText, { color: trendColor }]}>
            {trend !== 'neutral' ? `${trend === 'up' ? '+' : '-'}${Math.abs(trendPercent).toFixed(2)}%` : 'Sin cambios'}
          </Text>
          <Text style={styles.trendPeriod}> este mes</Text>
        </View>
      )}

      {/* Available balance */}
      <View style={styles.divider} />
      <View style={styles.availableRow}>
        <Text style={styles.availableLabel}>Saldo disponible</Text>
        <Text style={styles.availableAmount}>
          {formatCurrency(availableBalance, currency, hidden)}
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.white,
    borderRadius: BORDER_RADIUS.xl,
    padding: SPACING.lg,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  sectionLabel: {
    fontFamily: FONT_FAMILY.regular,
    fontSize: FONT_SIZE.sm,
    color: COLORS.gray500,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  balanceRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: SPACING.xs,
  },
  currencySymbol: {
    fontFamily: FONT_FAMILY.medium,
    fontSize: FONT_SIZE.md,
    color: COLORS.gray500,
    marginTop: 6,
  },
  totalBalance: {
    fontFamily: FONT_FAMILY.bold,
    fontWeight: FONT_WEIGHT.bold as any,
    fontSize: FONT_SIZE.display1,
    color: COLORS.gray900,
    includeFontPadding: false,
  },
  usdRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: SPACING.xs,
  },
  usdLabel: {
    fontFamily: FONT_FAMILY.regular,
    fontSize: FONT_SIZE.sm,
    color: COLORS.gray500,
  },
  trendRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: SPACING.xs,
    gap: 3,
  },
  trendText: {
    fontFamily: FONT_FAMILY.medium,
    fontSize: FONT_SIZE.sm,
  },
  trendPeriod: {
    fontFamily: FONT_FAMILY.regular,
    fontSize: FONT_SIZE.sm,
    color: COLORS.gray500,
  },
  divider: {
    height: 1,
    backgroundColor: COLORS.gray200,
    marginVertical: SPACING.md,
  },
  availableRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  availableLabel: {
    fontFamily: FONT_FAMILY.regular,
    fontSize: FONT_SIZE.md,
    color: COLORS.gray600,
  },
  availableAmount: {
    fontFamily: FONT_FAMILY.bold,
    fontSize: FONT_SIZE.lg,
    color: COLORS.primary,
    fontWeight: FONT_WEIGHT.bold as any,
  },
});
