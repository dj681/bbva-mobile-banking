import React from 'react';
import {
  ActivityIndicator,
  StyleSheet,
  Text,
  TouchableOpacity,
  TouchableOpacityProps,
  View,
  ViewStyle,
  TextStyle,
} from 'react-native';
import { COLORS, SPACING, BORDER_RADIUS, FONT_SIZE, FONT_FAMILY, FONT_WEIGHT } from '@/constants';

type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'text' | 'danger';
type ButtonSize = 'small' | 'medium' | 'large';

interface ButtonProps extends Omit<TouchableOpacityProps, 'style'> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  label: string;
  loading?: boolean;
  disabled?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  fullWidth?: boolean;
  style?: ViewStyle;
  labelStyle?: TextStyle;
}

export const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'medium',
  label,
  loading = false,
  disabled = false,
  leftIcon,
  rightIcon,
  fullWidth = false,
  style,
  labelStyle,
  onPress,
  ...rest
}) => {
  const isDisabled = disabled || loading;

  const containerStyle: ViewStyle[] = [
    styles.base,
    styles[`variant_${variant}`],
    styles[`size_${size}`],
    fullWidth && styles.fullWidth,
    isDisabled && styles[`variant_${variant}_disabled`],
    style as ViewStyle,
  ].filter(Boolean) as ViewStyle[];

  const textStyle: TextStyle[] = [
    styles.label,
    styles[`label_${variant}`],
    styles[`labelSize_${size}`],
    isDisabled && styles[`label_${variant}_disabled`],
    labelStyle as TextStyle,
  ].filter(Boolean) as TextStyle[];

  const spinnerColor =
    variant === 'outline' || variant === 'text'
      ? COLORS.primary
      : variant === 'danger'
      ? COLORS.white
      : COLORS.white;

  return (
    <TouchableOpacity
      style={containerStyle}
      onPress={onPress}
      disabled={isDisabled}
      activeOpacity={0.75}
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ disabled: isDisabled, busy: loading }}
      {...rest}
    >
      {loading ? (
        <ActivityIndicator
          color={spinnerColor}
          size={size === 'small' ? 'small' : 'small'}
        />
      ) : (
        <View style={styles.content}>
          {leftIcon && <View style={styles.iconLeft}>{leftIcon}</View>}
          <Text style={textStyle} numberOfLines={1}>
            {label}
          </Text>
          {rightIcon && <View style={styles.iconRight}>{rightIcon}</View>}
        </View>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  base: {
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: BORDER_RADIUS.md,
    overflow: 'hidden',
  },
  fullWidth: {
    width: '100%',
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  label: {
    fontFamily: FONT_FAMILY.medium,
    fontWeight: FONT_WEIGHT.medium as TextStyle['fontWeight'],
    letterSpacing: 0.5,
  },
  iconLeft: {
    marginRight: SPACING.xs,
  },
  iconRight: {
    marginLeft: SPACING.xs,
  },

  // Variant styles
  variant_primary: {
    backgroundColor: COLORS.primary,
  },
  variant_secondary: {
    backgroundColor: COLORS.secondary,
  },
  variant_outline: {
    backgroundColor: COLORS.transparent,
    borderWidth: 1.5,
    borderColor: COLORS.primary,
  },
  variant_text: {
    backgroundColor: COLORS.transparent,
  },
  variant_danger: {
    backgroundColor: COLORS.error,
  },

  // Disabled states
  variant_primary_disabled: {
    backgroundColor: COLORS.gray300,
  },
  variant_secondary_disabled: {
    backgroundColor: COLORS.gray300,
  },
  variant_outline_disabled: {
    borderColor: COLORS.gray300,
    backgroundColor: COLORS.transparent,
  },
  variant_text_disabled: {
    backgroundColor: COLORS.transparent,
  },
  variant_danger_disabled: {
    backgroundColor: COLORS.gray300,
  },

  // Label variant styles
  label_primary: {
    color: COLORS.white,
  },
  label_secondary: {
    color: COLORS.white,
  },
  label_outline: {
    color: COLORS.primary,
  },
  label_text: {
    color: COLORS.primary,
  },
  label_danger: {
    color: COLORS.white,
  },
  label_primary_disabled: {
    color: COLORS.gray500,
  },
  label_secondary_disabled: {
    color: COLORS.gray500,
  },
  label_outline_disabled: {
    color: COLORS.gray400,
  },
  label_text_disabled: {
    color: COLORS.gray400,
  },
  label_danger_disabled: {
    color: COLORS.gray500,
  },

  // Size styles
  size_small: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs,
    minHeight: 32,
  },
  size_medium: {
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.sm + 2,
    minHeight: 44,
  },
  size_large: {
    paddingHorizontal: SPACING.xl,
    paddingVertical: SPACING.md,
    minHeight: 52,
  },

  // Label size styles
  labelSize_small: {
    fontSize: FONT_SIZE.sm,
  },
  labelSize_medium: {
    fontSize: FONT_SIZE.md,
  },
  labelSize_large: {
    fontSize: FONT_SIZE.base,
  },
});
