import React, { useState } from 'react';
import {
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { Button } from '@/components/common/Button';
import { Divider } from '@/components/common/Divider';
import { useTheme } from '@/hooks/useTheme';
import { useAppDispatch, useAppSelector } from '@/store';
import { setNotificationsEnabled } from '@/store/slices';
import type { ProfileStackParamList } from '@/types';

type NotificationNavProp = NativeStackNavigationProp<
  ProfileStackParamList,
  'NotificationSettings'
>;

interface NotificationToggle {
  id: string;
  label: string;
  subtitle: string;
}

interface NotificationSection {
  title: string;
  icon: keyof typeof Ionicons.glyphMap;
  items: NotificationToggle[];
}

const SECTIONS: NotificationSection[] = [
  {
    title: 'TRANSACCIONES',
    icon: 'swap-horizontal-outline',
    items: [
      { id: 'debits', label: 'Débitos', subtitle: 'Transacciones salientes' },
      { id: 'credits', label: 'Créditos', subtitle: 'Transacciones entrantes' },
      { id: 'transfers', label: 'Transferencias recibidas', subtitle: 'Notificación al recibirlas' },
    ],
  },
  {
    title: 'SEGURIDAD',
    icon: 'shield-outline',
    items: [
      {
        id: 'suspicious_login',
        label: 'Accesos sospechosos',
        subtitle: 'Actividad inusual detectada',
      },
      {
        id: 'new_device',
        label: 'Nuevo dispositivo',
        subtitle: 'Acceso desde un nuevo dispositivo',
      },
      {
        id: 'password_change',
        label: 'Cambio de contraseña',
        subtitle: 'Modificación de contraseña',
      },
    ],
  },
  {
    title: 'CUENTAS',
    icon: 'wallet-outline',
    items: [
      {
        id: 'low_balance',
        label: 'Saldo insuficiente',
        subtitle: 'Alerta de saldo bajo',
      },
      {
        id: 'credit_payment',
        label: 'Próximo pago de crédito',
        subtitle: 'Recordatorio antes del vencimiento',
      },
      {
        id: 'statement',
        label: 'Extracto disponible',
        subtitle: 'Nuevo extracto mensual',
      },
    ],
  },
  {
    title: 'MARKETING',
    icon: 'megaphone-outline',
    items: [
      {
        id: 'offers',
        label: 'Ofertas y promociones',
        subtitle: 'Ofertas personalizadas de BBVA',
      },
      {
        id: 'features',
        label: 'Nuevas funciones',
        subtitle: 'Actualizaciones de la aplicación',
      },
    ],
  },
];

type TogglesState = Record<string, boolean>;

const buildDefaultToggles = (): TogglesState => {
  const state: TogglesState = {};
  SECTIONS.forEach((section) => {
    section.items.forEach((item) => {
      state[item.id] = section.title !== 'MARKETING';
    });
  });
  return state;
};

const NotificationSettingsScreen: React.FC = () => {
  const navigation = useNavigation<NotificationNavProp>();
  const { colors, spacing, borderRadius } = useTheme();
  const dispatch = useAppDispatch();
  const masterEnabled = useAppSelector((s) => s.ui.notificationsEnabled);

  const [toggles, setToggles] = useState<TogglesState>(buildDefaultToggles);
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);

  const toggleItem = (id: string) => {
    setToggles((prev) => ({ ...prev, [id]: !prev[id] }));
    setSaved(false);
  };

  const handleMasterToggle = (value: boolean) => {
    dispatch(setNotificationsEnabled(value));
    setSaved(false);
  };

  const handleSave = async () => {
    setSaving(true);
    await new Promise<void>((r) => setTimeout(r, 800));
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  const styles = makeStyles(colors, spacing, borderRadius);

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={colors.headerText} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Configuración de notificaciones</Text>
        <View style={styles.headerPlaceholder} />
      </View>

      <ScrollView
        style={styles.container}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.contentContainer}
      >
        {/* Saved confirmation */}
        {saved && (
          <View style={styles.savedBanner}>
            <Ionicons name="checkmark-circle" size={18} color="#FFFFFF" />
            <Text style={styles.savedBannerText}>Preferencias guardadas</Text>
          </View>
        )}

        {/* Master toggle */}
        <View style={styles.masterCard}>
          <View style={styles.masterLeft}>
            <View style={styles.masterIconContainer}>
              <Ionicons name="notifications" size={24} color={colors.primary} />
            </View>
            <View>
              <Text style={styles.masterLabel}>Activar notificaciones</Text>
              <Text style={styles.masterSubtitle}>
                {masterEnabled ? 'Notificaciones activadas' : 'Todas las notificaciones desactivadas'}
              </Text>
            </View>
          </View>
          <Switch
            value={masterEnabled}
            onValueChange={handleMasterToggle}
            trackColor={{ false: colors.border, true: colors.primary }}
            thumbColor="#FFFFFF"
          />
        </View>

        {/* Sections */}
        {SECTIONS.map((section) => (
          <View key={section.title} style={[styles.card, !masterEnabled && styles.cardDisabled]}>
            <View style={styles.cardHeader}>
              <Ionicons name={section.icon} size={16} color={colors.primary} />
              <Text style={styles.cardHeaderTitle}>{section.title}</Text>
            </View>
            <Divider />
            {section.items.map((item, index) => (
              <React.Fragment key={item.id}>
                <View style={styles.toggleRow}>
                  <View style={styles.toggleLeft}>
                    <Text style={[styles.toggleLabel, !masterEnabled && styles.disabledText]}>
                      {item.label}
                    </Text>
                    <Text style={styles.toggleSubtitle}>{item.subtitle}</Text>
                  </View>
                  <Switch
                    value={masterEnabled ? toggles[item.id] : false}
                    onValueChange={() => { if (masterEnabled) toggleItem(item.id); }}
                    trackColor={{ false: colors.border, true: colors.primary }}
                    thumbColor="#FFFFFF"
                    disabled={!masterEnabled}
                  />
                </View>
                {index < section.items.length - 1 && (
                  <Divider style={styles.itemDivider} />
                )}
              </React.Fragment>
            ))}
          </View>
        ))}

        <Button
          label="Guardar preferencias"
          variant="primary"
          fullWidth
          loading={saving}
          onPress={handleSave}
          style={styles.saveButton}
        />
      </ScrollView>
    </SafeAreaView>
  );
};

const makeStyles = (colors: any, spacing: any, borderRadius: any) =>
  StyleSheet.create({
    safeArea: {
      flex: 1,
      backgroundColor: colors.background,
    },
    header: {
      backgroundColor: colors.header,
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: spacing.md,
      paddingVertical: spacing.md,
      paddingTop: spacing.lg,
    },
    backButton: {
      padding: spacing.xs,
    },
    headerTitle: {
      flex: 1,
      fontSize: 17,
      fontWeight: '700',
      color: colors.headerText,
      textAlign: 'center',
    },
    headerPlaceholder: {
      width: 32,
    },
    container: {
      flex: 1,
    },
    contentContainer: {
      padding: spacing.md,
      paddingBottom: spacing.xxxl,
      gap: spacing.md,
    },
    savedBanner: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: '#4CAF50',
      borderRadius: borderRadius.md,
      padding: spacing.md,
      gap: spacing.sm,
    },
    savedBannerText: {
      color: '#FFFFFF',
      fontSize: 14,
      fontWeight: '600',
    },
    masterCard: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      backgroundColor: colors.surface,
      borderRadius: borderRadius.lg,
      padding: spacing.md,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.06,
      shadowRadius: 4,
      elevation: 2,
    },
    masterLeft: {
      flexDirection: 'row',
      alignItems: 'center',
      flex: 1,
      gap: spacing.md,
    },
    masterIconContainer: {
      width: 44,
      height: 44,
      borderRadius: 22,
      backgroundColor: colors.background,
      alignItems: 'center',
      justifyContent: 'center',
    },
    masterLabel: {
      fontSize: 15,
      fontWeight: '700',
      color: colors.text,
    },
    masterSubtitle: {
      fontSize: 12,
      color: colors.textSecondary,
      marginTop: 2,
    },
    card: {
      backgroundColor: colors.surface,
      borderRadius: borderRadius.lg,
      overflow: 'hidden',
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.06,
      shadowRadius: 4,
      elevation: 2,
    },
    cardDisabled: {
      opacity: 0.6,
    },
    cardHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.sm,
      paddingHorizontal: spacing.md,
      paddingVertical: spacing.sm + 2,
    },
    cardHeaderTitle: {
      fontSize: 11,
      fontWeight: '700',
      color: colors.textSecondary,
      letterSpacing: 1.2,
    },
    toggleRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: spacing.md,
      paddingVertical: spacing.md,
    },
    toggleLeft: {
      flex: 1,
      marginRight: spacing.md,
    },
    toggleLabel: {
      fontSize: 14,
      fontWeight: '500',
      color: colors.text,
    },
    disabledText: {
      color: colors.textDisabled,
    },
    toggleSubtitle: {
      fontSize: 12,
      color: colors.textSecondary,
      marginTop: 2,
    },
    itemDivider: {
      marginLeft: spacing.md,
    },
    saveButton: {
      marginTop: spacing.sm,
    },
  });

export default NotificationSettingsScreen;
