import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ViewStyle } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING, BORDER_RADIUS, FONT_SIZE, FONT_FAMILY, FONT_WEIGHT } from '@/constants';

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
  return new Intl.NumberFormat('en-US', {
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

  return (
    <View style={[styles.container, style]}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.sectionLabel}>Total Balance</Text>
        <TouchableOpacity
          onPress={() => setHidden(h => !h)}
          accessibilityLabel={hidden ? 'Show balance' : 'Hide balance'}
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

      {/* Main balance */}
      <View style={styles.balanceRow}>
        <Text style={styles.currencySymbol}>{currency}</Text>
        <Text style={styles.totalBalance} accessibilityLabel={`Total balance: ${formatCurrency(totalBalance, currency, hidden)}`}>
          {formatCurrency(totalBalance, currency, hidden)}
        </Text>
      </View>

      {/* Trend */}
      {trendPercent !== undefined && (
        <View style={styles.trendRow}>
          <Ionicons name={trendIcon} size={14} color={trendColor} />
          <Text style={[styles.trendText, { color: trendColor }]}>
            {trend !== 'neutral' ? `${trend === 'up' ? '+' : '-'}${Math.abs(trendPercent).toFixed(2)}%` : 'No change'}
          </Text>
          <Text style={styles.trendPeriod}> this month</Text>
        </View>
      )}

      {/* Available balance */}
      <View style={styles.divider} />
      <View style={styles.availableRow}>
        <Text style={styles.availableLabel}>Available balance</Text>
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
