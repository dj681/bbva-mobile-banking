import React, { useCallback, useMemo } from 'react';
import {
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { Button } from '@/components/common/Button';
import { EmptyState } from '@/components/common/EmptyState';
import { useNotifications } from '@/hooks/useNotifications';
import { useTheme } from '@/hooks/useTheme';
import type { Notification } from '@/types';
import { formatRelativeDate } from '@/utils';

const NOTIFICATION_ICONS: Record<Notification['type'], { icon: keyof typeof Ionicons.glyphMap; color: string }> = {
  transaction: { icon: 'swap-horizontal-outline', color: '#00A8E8' },
  security: { icon: 'shield-outline', color: '#F44336' },
  promotion: { icon: 'pricetag-outline', color: '#FF9800' },
  info: { icon: 'information-circle-outline', color: '#2196F3' },
};

export const NotificationsScreen: React.FC = () => {
  const { colors, spacing, borderRadius } = useTheme();
  const { notifications, unreadCount, markRead, markAllRead } = useNotifications();

  const sorted = useMemo(
    () =>
      [...notifications].sort((a, b) => {
        if (a.isRead !== b.isRead) return a.isRead ? 1 : -1;
        return new Date(b.date).getTime() - new Date(a.date).getTime();
      }),
    [notifications],
  );

  const styles = makeStyles(colors, spacing, borderRadius);

  const renderItem = useCallback(
    ({ item }: { item: Notification }) => {
      const iconCfg = NOTIFICATION_ICONS[item.type] ?? NOTIFICATION_ICONS.info;
      return (
        <TouchableOpacity
          style={[styles.item, !item.isRead && styles.itemUnread]}
          onPress={() => markRead(item.id)}
          activeOpacity={0.7}
        >
          <View style={[styles.iconWrapper, { backgroundColor: iconCfg.color + '22' }]}>
            <Ionicons name={iconCfg.icon} size={22} color={iconCfg.color} />
          </View>
          <View style={styles.itemContent}>
            <View style={styles.itemHeader}>
              <Text style={[styles.itemTitle, !item.isRead && styles.itemTitleUnread]} numberOfLines={1}>
                {item.title}
              </Text>
              <Text style={styles.itemTime}>{formatRelativeDate(item.date)}</Text>
            </View>
            <Text style={styles.itemMessage} numberOfLines={2}>
              {item.message}
            </Text>
          </View>
          {!item.isRead && <View style={styles.unreadDot} />}
        </TouchableOpacity>
      );
    },
    [markRead, styles],
  );

  const ListHeader = (
    <View style={styles.listHeader}>
      <Text style={styles.subtitle}>
        {unreadCount > 0
          ? `${unreadCount} non lue${unreadCount > 1 ? 's' : ''}`
          : 'Tout est lu'}
      </Text>
    </View>
  );

  return (
    <View style={styles.container}>
      {/* Screen Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Notifications</Text>
        {unreadCount > 0 && (
          <TouchableOpacity onPress={markAllRead}>
            <Text style={styles.markAllText}>Tout lire</Text>
          </TouchableOpacity>
        )}
      </View>

      <FlatList
        data={sorted}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        ListHeaderComponent={ListHeader}
        ListEmptyComponent={
          <EmptyState
            title="Aucune notification"
            message="Vous n'avez pas encore de notifications."
            icon="notifications-off-outline"
          />
        }
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
};

const makeStyles = (
  colors: ReturnType<typeof useTheme>['colors'],
  spacing: ReturnType<typeof useTheme>['spacing'],
  borderRadius: ReturnType<typeof useTheme>['borderRadius'],
) =>
  StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background },
    header: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      backgroundColor: colors.header,
      paddingHorizontal: spacing.md,
      paddingTop: spacing.xl,
      paddingBottom: spacing.lg,
    },
    headerTitle: { fontSize: 22, fontWeight: '700', color: '#FFFFFF' },
    markAllText: { fontSize: 14, color: 'rgba(255,255,255,0.85)', fontWeight: '600' },
    listHeader: {
      paddingHorizontal: spacing.md,
      paddingVertical: spacing.sm,
    },
    subtitle: { fontSize: 13, color: colors.textSecondary },
    listContent: { paddingBottom: spacing.xxxl },
    item: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      paddingHorizontal: spacing.md,
      paddingVertical: spacing.md,
      backgroundColor: colors.surface,
      borderBottomWidth: StyleSheet.hairlineWidth,
      borderBottomColor: colors.divider,
    },
    itemUnread: { backgroundColor: colors.infoBackground },
    iconWrapper: {
      width: 44,
      height: 44,
      borderRadius: 22,
      alignItems: 'center',
      justifyContent: 'center',
      marginRight: spacing.sm,
      flexShrink: 0,
    },
    itemContent: { flex: 1 },
    itemHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: spacing.xs,
    },
    itemTitle: {
      fontSize: 14,
      fontWeight: '500',
      color: colors.text,
      flex: 1,
      marginRight: spacing.xs,
    },
    itemTitleUnread: { fontWeight: '700' },
    itemTime: { fontSize: 11, color: colors.textSecondary, flexShrink: 0 },
    itemMessage: { fontSize: 13, color: colors.textSecondary, lineHeight: 18 },
    unreadDot: {
      width: 8,
      height: 8,
      borderRadius: 4,
      backgroundColor: colors.primary,
      marginLeft: spacing.xs,
      marginTop: spacing.xs,
      flexShrink: 0,
    },
  });

export default NotificationsScreen;
