import React from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING, FONT_SIZE, FONT_FAMILY, FONT_WEIGHT } from '@/constants';
import { Button } from './Button';

interface ActionButton {
  label: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'outline';
}

interface EmptyStateProps {
  icon?: keyof typeof Ionicons.glyphMap;
  title: string;
  message?: string;
  actionButton?: ActionButton;
  style?: ViewStyle;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon = 'document-outline',
  title,
  message,
  actionButton,
  style,
}) => {
  return (
    <View style={[styles.container, style]}>
      <View style={styles.iconWrapper}>
        <Ionicons name={icon} size={64} color={COLORS.gray300} />
      </View>
      <Text style={styles.title}>{title}</Text>
      {message && <Text style={styles.message}>{message}</Text>}
      {actionButton && (
        <Button
          variant={actionButton.variant ?? 'primary'}
          label={actionButton.label}
          onPress={actionButton.onPress}
          style={styles.button}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: SPACING.xxxl,
    paddingVertical: SPACING.section,
  },
  iconWrapper: {
    marginBottom: SPACING.lg,
  },
  title: {
    fontFamily: FONT_FAMILY.bold,
    fontWeight: FONT_WEIGHT.bold as any,
    fontSize: FONT_SIZE.xl,
    color: COLORS.gray700,
    textAlign: 'center',
    marginBottom: SPACING.sm,
  },
  message: {
    fontFamily: FONT_FAMILY.regular,
    fontSize: FONT_SIZE.md,
    color: COLORS.gray500,
    textAlign: 'center',
    lineHeight: FONT_SIZE.md * 1.6,
    marginBottom: SPACING.md,
  },
  button: {
    marginTop: SPACING.md,
    minWidth: 160,
  },
});
