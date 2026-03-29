import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ViewStyle,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING, BORDER_RADIUS, FONT_SIZE, FONT_FAMILY, FONT_WEIGHT } from '@/constants';
import type { Account, AccountType } from '@/types';

interface AccountCardProps {
  account: Account;
  onPress?: (account: Account) => void;
  style?: ViewStyle;
  compact?: boolean;
}

const TYPE_CONFIG: Record<
  AccountType,
  { label: string; icon: keyof typeof Ionicons.glyphMap; gradientTop: string; gradientBottom: string }
> = {
  checking: {
    label: 'Corriente',
    icon: 'card-outline',
    gradientTop: '#004B9A',
    gradientBottom: '#002F6C',
  },
  savings: {
    label: 'Ahorro',
    icon: 'wallet-outline',
    gradientTop: '#0071CE',
    gradientBottom: '#003E88',
  },
  investment: {
    label: 'Inversión',
    icon: 'trending-up-outline',
    gradientTop: '#00A8E8',
    gradientBottom: '#006BAA',
  },
  credit: {
    label: 'Crédito',
    icon: 'logo-usd',
    gradientTop: '#1A237E',
    gradientBottom: '#0D0D5C',
  },
};

function maskAccountNumber(number: string): string {
  const last4 = number.slice(-4);
  return `•••• ${last4}`;
}

function formatAmount(amount: number, currency: string): string {
  return new Intl.NumberFormat('es-ES', {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
  }).format(amount);
}

export const AccountCard: React.FC<AccountCardProps> = ({
  account,
  onPress,
  style,
  compact = false,
}) => {
  const config = TYPE_CONFIG[account.type];

  const handlePress = () => onPress?.(account);

  return (
    <TouchableOpacity
      style={[styles.card, style]}
      onPress={handlePress}
      activeOpacity={0.9}
      accessibilityRole="button"
      accessibilityLabel={`${account.name}, saldo ${formatAmount(account.balance, account.currency)}`}
    >
      {/* Gradient simulation using layered views */}
      <View style={[StyleSheet.absoluteFill, { backgroundColor: config.gradientTop }]} />
      <View
        style={[
          StyleSheet.absoluteFill,
          styles.gradientOverlay,
          { backgroundColor: config.gradientBottom },
        ]}
      />
      {/* Decorative circles */}
      <View style={styles.circleTopRight} />
      <View style={styles.circleBottomLeft} />

      <View style={styles.content}>
        {/* Header row */}
        <View style={styles.headerRow}>
          <View style={styles.typePill}>
            <Ionicons name={config.icon} size={12} color={COLORS.secondary} />
            <Text style={styles.typeLabel}>{config.label}</Text>
          </View>
          {!account.isActive && (
            <View style={styles.inactivePill}>
              <Text style={styles.inactiveLabel}>Inactiva</Text>
            </View>
          )}
        </View>

        {/* Account name */}
        <Text style={styles.accountName} numberOfLines={1}>
          {account.name}
        </Text>

        {/* Account number */}
        <Text style={styles.accountNumber}>{maskAccountNumber(account.accountNumber)}</Text>

        {!compact && (
          <View style={styles.balanceRow}>
            <View>
              <Text style={styles.balanceLabel}>Saldo</Text>
              <Text style={styles.balanceAmount}>
                {formatAmount(account.balance, account.currency)}
              </Text>
            </View>
            <View style={styles.availableBlock}>
              <Text style={styles.balanceLabel}>Disponible</Text>
              <Text style={styles.availableAmount}>
                {formatAmount(account.availableBalance, account.currency)}
              </Text>
            </View>
          </View>
        )}

        {compact && (
          <Text style={styles.balanceAmount}>
            {formatAmount(account.balance, account.currency)}
          </Text>
        )}
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    borderRadius: BORDER_RADIUS.xl,
    overflow: 'hidden',
    minHeight: 160,
    ...Platform.select({
      ios: {
        shadowColor: COLORS.primary,
        shadowOpacity: 0.3,
        shadowRadius: 12,
        shadowOffset: { width: 0, height: 6 },
      },
      android: { elevation: 6 },
    }),
  },
  gradientOverlay: {
    opacity: 0.6,
    top: '40%',
  },
  circleTopRight: {
    position: 'absolute',
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: 'rgba(255,255,255,0.06)',
    top: -40,
    right: -30,
  },
  circleBottomLeft: {
    position: 'absolute',
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: 'rgba(255,255,255,0.04)',
    bottom: -30,
    left: -20,
  },
  content: {
    padding: SPACING.lg,
    flex: 1,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: SPACING.md,
  },
  typePill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: BORDER_RADIUS.full,
    paddingHorizontal: SPACING.sm,
    paddingVertical: 3,
    gap: 4,
  },
  typeLabel: {
    fontFamily: FONT_FAMILY.medium,
    fontSize: FONT_SIZE.xxs,
    color: COLORS.white,
    letterSpacing: 0.5,
  },
  inactivePill: {
    backgroundColor: 'rgba(244,67,54,0.3)',
    borderRadius: BORDER_RADIUS.full,
    paddingHorizontal: SPACING.sm,
    paddingVertical: 2,
  },
  inactiveLabel: {
    fontFamily: FONT_FAMILY.medium,
    fontSize: FONT_SIZE.xxs,
    color: '#FFCDD2',
  },
  accountName: {
    fontFamily: FONT_FAMILY.bold,
    fontWeight: FONT_WEIGHT.bold as any,
    fontSize: FONT_SIZE.lg,
    color: COLORS.white,
    marginBottom: SPACING.xxs,
  },
  accountNumber: {
    fontFamily: FONT_FAMILY.regular,
    fontSize: FONT_SIZE.sm,
    color: 'rgba(255,255,255,0.7)',
    marginBottom: SPACING.md,
    letterSpacing: 1,
  },
  balanceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
  },
  availableBlock: {
    alignItems: 'flex-end',
  },
  balanceLabel: {
    fontFamily: FONT_FAMILY.regular,
    fontSize: FONT_SIZE.xxs,
    color: 'rgba(255,255,255,0.6)',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 2,
  },
  balanceAmount: {
    fontFamily: FONT_FAMILY.bold,
    fontWeight: FONT_WEIGHT.bold as any,
    fontSize: FONT_SIZE.xxl,
    color: COLORS.white,
  },
  availableAmount: {
    fontFamily: FONT_FAMILY.medium,
    fontSize: FONT_SIZE.md,
    color: 'rgba(255,255,255,0.85)',
  },
});
