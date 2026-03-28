import React from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';
import { COLORS, SPACING, FONT_SIZE, FONT_FAMILY } from '@/constants';

interface DividerProps {
  label?: string;
  color?: string;
  thickness?: number;
  style?: ViewStyle;
  orientation?: 'horizontal' | 'vertical';
  spacing?: number;
}

export const Divider: React.FC<DividerProps> = ({
  label,
  color = COLORS.gray200,
  thickness = 1,
  style,
  orientation = 'horizontal',
  spacing = SPACING.md,
}) => {
  if (orientation === 'vertical') {
    return (
      <View
        style={[
          styles.vertical,
          { backgroundColor: color, width: thickness, marginHorizontal: spacing },
          style,
        ]}
      />
    );
  }

  if (label) {
    return (
      <View style={[styles.labeledRow, { marginVertical: spacing }, style]}>
        <View style={[styles.line, { backgroundColor: color, height: thickness }]} />
        <Text style={styles.labelText}>{label}</Text>
        <View style={[styles.line, { backgroundColor: color, height: thickness }]} />
      </View>
    );
  }

  return (
    <View
      style={[
        styles.horizontal,
        { backgroundColor: color, height: thickness, marginVertical: spacing },
        style,
      ]}
    />
  );
};

const styles = StyleSheet.create({
  horizontal: {
    width: '100%',
  },
  vertical: {
    alignSelf: 'stretch',
  },
  labeledRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  line: {
    flex: 1,
  },
  labelText: {
    fontFamily: FONT_FAMILY.medium,
    fontSize: FONT_SIZE.xs,
    color: COLORS.gray500,
    marginHorizontal: SPACING.sm,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
});
