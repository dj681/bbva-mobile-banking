import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ViewStyle } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING, BORDER_RADIUS, FONT_SIZE, FONT_FAMILY } from '@/constants';
import type { Investment } from '@/types';

interface InvestmentItemProps {
  investment: Investment;
  onPress?: (investment: Investment) => void;
  style?: ViewStyle;
}

function formatCurrency(amount: number, currency: string): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

export const InvestmentItem: React.FC<InvestmentItemProps> = ({
  investment,
  onPress,
  style,
}) => {
  const gainLoss = investment.gainLoss;
  const gainLossPercent = investment.gainLossPercent;
  const isPositive = gainLoss >= 0;
  const trendColor = isPositive ? COLORS.success : COLORS.error;
  const trendIcon: keyof typeof Ionicons.glyphMap = isPositive
    ? 'trending-up-outline'
    : 'trending-down-outline';

  return (
    <TouchableOpacity
      style={[styles.container, style]}
      onPress={() => onPress?.(investment)}
      activeOpacity={0.75}
      accessibilityRole="button"
      accessibilityLabel={`${investment.name}, current value ${formatCurrency(investment.currentValue, investment.currency)}`}
    >
      {/* Symbol badge */}
      <View style={styles.symbolBadge}>
        <Text style={styles.symbolText} numberOfLines={1}>
          {(investment.symbol ?? investment.name.slice(0, 3)).toUpperCase()}
        </Text>
      </View>

      {/* Info */}
      <View style={styles.info}>
        <Text style={styles.name} numberOfLines={1}>
          {investment.name}
        </Text>
        <Text style={styles.type} numberOfLines={1}>
          {investment.type} · {investment.quantity} units
        </Text>
      </View>

      {/* Price & change */}
      <View style={styles.priceBlock}>
        <Text style={styles.currentValue}>
          {formatCurrency(investment.currentValue, investment.currency)}
        </Text>
        <View style={styles.gainRow}>
          <Ionicons name={trendIcon} size={12} color={trendColor} />
          <Text style={[styles.gainText, { color: trendColor }]}>
            {isPositive ? '+' : ''}
            {gainLossPercent.toFixed(2)}%
          </Text>
        </View>
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
  symbolBadge: {
    width: 48,
    height: 48,
    borderRadius: BORDER_RADIUS.md,
    backgroundColor: `${COLORS.primary}14`,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: SPACING.md,
  },
  symbolText: {
    fontFamily: FONT_FAMILY.bold,
    fontSize: FONT_SIZE.xs,
    color: COLORS.primary,
    letterSpacing: 0.5,
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
  type: {
    fontFamily: FONT_FAMILY.regular,
    fontSize: FONT_SIZE.xs,
    color: COLORS.gray500,
    textTransform: 'capitalize',
  },
  priceBlock: {
    alignItems: 'flex-end',
  },
  currentValue: {
    fontFamily: FONT_FAMILY.bold,
    fontSize: FONT_SIZE.md,
    color: COLORS.gray900,
    marginBottom: 2,
  },
  gainRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  gainText: {
    fontFamily: FONT_FAMILY.medium,
    fontSize: FONT_SIZE.xs,
  },
});
