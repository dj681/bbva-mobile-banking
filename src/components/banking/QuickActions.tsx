import React from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  ViewStyle,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING, BORDER_RADIUS, FONT_SIZE, FONT_FAMILY } from '@/constants';

interface QuickAction {
  id: string;
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
  onPress: () => void;
  badge?: number;
  disabled?: boolean;
}

interface QuickActionsProps {
  actions?: QuickAction[];
  style?: ViewStyle;
}

const DEFAULT_ACTIONS: Omit<QuickAction, 'onPress'>[] = [
  { id: 'transfer', label: 'Transferir', icon: 'swap-horizontal-outline' },
  { id: 'pay', label: 'Pagar', icon: 'receipt-outline' },
  { id: 'cards', label: 'Tarjetas', icon: 'card-outline' },
  { id: 'credits', label: 'Créditos', icon: 'cash-outline' },
  { id: 'invest', label: 'Invertir', icon: 'trending-up-outline' },
  { id: 'more', label: 'Más', icon: 'grid-outline' },
];

export const QuickActions: React.FC<QuickActionsProps> = ({ actions, style }) => {
  const items: QuickAction[] = actions ?? DEFAULT_ACTIONS.map(a => ({ ...a, onPress: () => undefined }));

  return (
    <View style={[styles.container, style]}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        decelerationRate="fast"
      >
        {items.map(action => (
          <TouchableOpacity
            key={action.id}
            style={[styles.item, action.disabled && styles.itemDisabled]}
            onPress={action.onPress}
            disabled={action.disabled}
            accessibilityRole="button"
            accessibilityLabel={action.label}
            accessibilityState={{ disabled: action.disabled }}
            activeOpacity={0.75}
          >
            <View style={styles.iconWrapper}>
              <Ionicons name={action.icon} size={22} color={COLORS.primary} />
              {action.badge !== undefined && action.badge > 0 && (
                <View style={styles.badge}>
                  <Text style={styles.badgeText}>
                    {action.badge > 99 ? '99+' : action.badge}
                  </Text>
                </View>
              )}
            </View>
            <Text style={styles.label} numberOfLines={1}>
              {action.label}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.white,
    borderRadius: BORDER_RADIUS.xl,
    paddingVertical: SPACING.md,
  },
  scrollContent: {
    paddingHorizontal: SPACING.md,
    gap: SPACING.sm,
  },
  item: {
    alignItems: 'center',
    width: 72,
    gap: SPACING.xs,
  },
  itemDisabled: {
    opacity: 0.4,
  },
  iconWrapper: {
    width: 52,
    height: 52,
    borderRadius: BORDER_RADIUS.lg,
    backgroundColor: `${COLORS.primary}12`,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  badge: {
    position: 'absolute',
    top: -4,
    right: -4,
    backgroundColor: COLORS.error,
    borderRadius: BORDER_RADIUS.full,
    minWidth: 18,
    height: 18,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 3,
    borderWidth: 1.5,
    borderColor: COLORS.white,
  },
  badgeText: {
    fontFamily: FONT_FAMILY.bold,
    fontSize: FONT_SIZE.xxxs,
    color: COLORS.white,
  },
  label: {
    fontFamily: FONT_FAMILY.medium,
    fontSize: FONT_SIZE.xs,
    color: COLORS.gray700,
    textAlign: 'center',
  },
});
