import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  TextInputProps,
  TouchableOpacity,
  StyleSheet,
  Animated,
  ViewStyle,
  TextStyle,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING, BORDER_RADIUS, FONT_SIZE, FONT_FAMILY, FONT_WEIGHT } from '@/constants';

type InputVariant = 'outlined' | 'filled';

interface InputProps extends Omit<TextInputProps, 'style'> {
  label?: string;
  placeholder?: string;
  error?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  secureTextEntry?: boolean;
  variant?: InputVariant;
  disabled?: boolean;
  multiline?: boolean;
  showCharCount?: boolean;
  maxLength?: number;
  containerStyle?: ViewStyle;
  inputStyle?: TextStyle;
  value?: string;
  onChangeText?: (text: string) => void;
}

export const Input: React.FC<InputProps> = ({
  label,
  placeholder,
  error,
  leftIcon,
  rightIcon,
  secureTextEntry = false,
  variant = 'outlined',
  disabled = false,
  multiline = false,
  showCharCount = false,
  maxLength,
  containerStyle,
  inputStyle,
  value = '',
  onChangeText,
  ...rest
}) => {
  const [isFocused, setIsFocused] = useState(false);
  const [isSecure, setIsSecure] = useState(secureTextEntry);
  const labelAnim = useRef(new Animated.Value(value ? 1 : 0)).current;

  const handleFocus = () => {
    setIsFocused(true);
    Animated.timing(labelAnim, {
      toValue: 1,
      duration: 150,
      useNativeDriver: false,
    }).start();
  };

  const handleBlur = () => {
    setIsFocused(false);
    if (!value) {
      Animated.timing(labelAnim, {
        toValue: 0,
        duration: 150,
        useNativeDriver: false,
      }).start();
    }
  };

  const borderColor = error
    ? COLORS.error
    : isFocused
    ? COLORS.secondary
    : COLORS.gray400;

  const filledBg = disabled ? COLORS.gray200 : COLORS.gray100;

  const wrapperStyle: ViewStyle[] = [
    styles.inputWrapper,
    variant === 'outlined'
      ? { ...styles.outlined, borderColor }
      : { ...styles.filled, backgroundColor: filledBg, borderBottomColor: borderColor },
    isFocused && variant === 'outlined' && styles.outlinedFocused,
    multiline && styles.multilineWrapper,
    disabled && styles.disabled,
  ].filter(Boolean) as ViewStyle[];

  const floatingLabel = label && variant === 'outlined';
  const labelTop = labelAnim.interpolate({ inputRange: [0, 1], outputRange: [14, -8] });
  const labelFontSize = labelAnim.interpolate({ inputRange: [0, 1], outputRange: [FONT_SIZE.base, FONT_SIZE.xs] });
  const labelColor = error ? COLORS.error : isFocused ? COLORS.secondary : COLORS.gray500;

  return (
    <View style={[styles.container, containerStyle]}>
      <View style={wrapperStyle}>
        {floatingLabel && (
          <Animated.Text
            style={[
              styles.floatingLabel,
              { top: labelTop, fontSize: labelFontSize, color: labelColor },
            ]}
          >
            {label}
          </Animated.Text>
        )}
        {!floatingLabel && label && (
          <Text style={[styles.staticLabel, error ? styles.errorLabel : undefined]}>{label}</Text>
        )}
        <View style={styles.row}>
          {leftIcon && <View style={styles.leftIcon}>{leftIcon}</View>}
          <TextInput
            style={[
              styles.input,
              floatingLabel ? styles.inputWithFloatingLabel : null,
              multiline ? styles.multilineInput : null,
              leftIcon ? styles.inputWithLeftIcon : null,
              (rightIcon || secureTextEntry) ? styles.inputWithRightIcon : null,
              disabled ? styles.inputDisabled : null,
              inputStyle ?? null,
            ]}
            placeholder={isFocused || !floatingLabel ? placeholder : undefined}
            placeholderTextColor={COLORS.gray400}
            value={value}
            onChangeText={onChangeText}
            onFocus={handleFocus}
            onBlur={handleBlur}
            secureTextEntry={isSecure}
            editable={!disabled}
            multiline={multiline}
            maxLength={maxLength}
            accessibilityLabel={label}
            accessibilityHint={placeholder}
            {...rest}
          />
          {secureTextEntry && (
            <TouchableOpacity
              style={styles.rightIcon}
              onPress={() => setIsSecure(prev => !prev)}
              accessibilityLabel={isSecure ? 'Show password' : 'Hide password'}
            >
              <Ionicons
                name={isSecure ? 'eye-off-outline' : 'eye-outline'}
                size={20}
                color={COLORS.gray500}
              />
            </TouchableOpacity>
          )}
          {!secureTextEntry && rightIcon && (
            <View style={styles.rightIcon}>{rightIcon}</View>
          )}
        </View>
      </View>

      <View style={styles.footer}>
        {error ? (
          <Text style={styles.errorText} accessibilityLiveRegion="polite">
            {error}
          </Text>
        ) : (
          <View />
        )}
        {showCharCount && maxLength !== undefined && (
          <Text style={styles.charCount}>
            {value.length}/{maxLength}
          </Text>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: SPACING.xs,
  },
  staticLabel: {
    fontFamily: FONT_FAMILY.medium,
    fontSize: FONT_SIZE.sm,
    color: COLORS.gray700,
    marginBottom: SPACING.xs,
    fontWeight: FONT_WEIGHT.medium as TextStyle['fontWeight'],
  },
  errorLabel: {
    color: COLORS.error,
  },
  floatingLabel: {
    position: 'absolute',
    left: SPACING.md,
    backgroundColor: COLORS.white,
    paddingHorizontal: SPACING.xxs,
    zIndex: 1,
    fontFamily: FONT_FAMILY.regular,
  },
  inputWrapper: {
    borderRadius: BORDER_RADIUS.md,
    position: 'relative',
  },
  outlined: {
    borderWidth: 1.5,
    borderColor: COLORS.gray400,
    backgroundColor: COLORS.white,
  },
  outlinedFocused: {
    borderWidth: 2,
  },
  filled: {
    borderBottomWidth: 2,
    borderTopLeftRadius: BORDER_RADIUS.sm,
    borderTopRightRadius: BORDER_RADIUS.sm,
  },
  multilineWrapper: {
    minHeight: 100,
  },
  disabled: {
    opacity: 0.6,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  leftIcon: {
    paddingLeft: SPACING.md,
    justifyContent: 'center',
    alignItems: 'center',
  },
  rightIcon: {
    paddingRight: SPACING.md,
    justifyContent: 'center',
    alignItems: 'center',
  },
  input: {
    flex: 1,
    fontFamily: FONT_FAMILY.regular,
    fontSize: FONT_SIZE.base,
    color: COLORS.gray900,
    paddingHorizontal: SPACING.md,
    paddingVertical: Platform.OS === 'ios' ? SPACING.md : SPACING.sm,
    minHeight: 48,
  },
  inputWithFloatingLabel: {
    paddingTop: SPACING.lg,
    paddingBottom: SPACING.sm,
  },
  inputWithLeftIcon: {
    paddingLeft: SPACING.sm,
  },
  inputWithRightIcon: {
    paddingRight: SPACING.sm,
  },
  multilineInput: {
    minHeight: 100,
    textAlignVertical: 'top',
    paddingTop: SPACING.md,
  },
  inputDisabled: {
    color: COLORS.gray500,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: SPACING.xxs,
    paddingHorizontal: SPACING.xs,
  },
  errorText: {
    fontFamily: FONT_FAMILY.regular,
    fontSize: FONT_SIZE.xs,
    color: COLORS.error,
    flex: 1,
  },
  charCount: {
    fontFamily: FONT_FAMILY.regular,
    fontSize: FONT_SIZE.xs,
    color: COLORS.gray500,
  },
});
