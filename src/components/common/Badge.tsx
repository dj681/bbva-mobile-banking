import React from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';
import { COLORS, SPACING, BORDER_RADIUS, FONT_SIZE, FONT_FAMILY } from '@/constants';

type BadgeVariant = 'success' | 'error' | 'warning' | 'info' | 'default';
type BadgeSize = 'small' | 'medium';

interface BadgeProps {
  label: string;
  variant?: BadgeVariant;
  size?: BadgeSize;
  icon?: React.ReactNode;
  style?: ViewStyle;
}

const VARIANT_COLORS: Record<BadgeVariant, { bg: string; text: string; border: string }> = {
  success: { bg: '#E8F5E9', text: COLORS.success, border: '#C8E6C9' },
  error: { bg: '#FFEBEE', text: COLORS.error, border: '#FFCDD2' },
  warning: { bg: '#FFF3E0', text: COLORS.warning, border: '#FFE0B2' },
  info: { bg: '#E3F2FD', text: COLORS.info, border: '#BBDEFB' },
  default: { bg: COLORS.gray200, text: COLORS.gray700, border: COLORS.gray300 },
};

export const Badge: React.FC<BadgeProps> = ({
  label,
  variant = 'default',
  size = 'medium',
  icon,
  style,
}) => {
  const colors = VARIANT_COLORS[variant];

  return (
    <View
      style={[
        styles.container,
        styles[`size_${size}`],
        { backgroundColor: colors.bg, borderColor: colors.border },
        style,
      ]}
      accessibilityLabel={label}
      accessibilityRole="text"
    >
      {icon && <View style={styles.icon}>{icon}</View>}
      <Text
        style={[styles.label, styles[`labelSize_${size}`], { color: colors.text }]}
        numberOfLines={1}
      >
        {label}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: BORDER_RADIUS.full,
    borderWidth: 1,
    alignSelf: 'flex-start',
  },
  icon: {
    marginRight: SPACING.xxs,
  },

  // Size variants
  size_small: {
    paddingHorizontal: SPACING.sm,
    paddingVertical: 2,
  },
  size_medium: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs,
  },

  // Label sizes
  label: {
    fontFamily: FONT_FAMILY.medium,
    fontWeight: '500',
  },
  labelSize_small: {
    fontSize: FONT_SIZE.xxs,
  },
  labelSize_medium: {
    fontSize: FONT_SIZE.xs,
  },
});
