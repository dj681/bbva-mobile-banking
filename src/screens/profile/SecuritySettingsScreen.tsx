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
import { Modal } from '@/components/common/Modal';
import { useAuth } from '@/hooks/useAuth';
import { useTheme } from '@/hooks/useTheme';
import type { ProfileStackParamList } from '@/types';

type SecurityNavProp = NativeStackNavigationProp<ProfileStackParamList, 'SecuritySettings'>;

interface ConnectionEntry {
  id: string;
  device: string;
  date: string;
  location: string;
  isCurrent: boolean;
}

const MOCK_CONNECTIONS: ConnectionEntry[] = [
  {
    id: '1',
    device: 'iPhone 15 Pro',
    date: 'Hoy, 09:42',
    location: 'Paris, France',
    isCurrent: true,
  },
  {
    id: '2',
    device: 'MacBook Pro',
    date: 'Ayer, 18:15',
    location: 'Paris, France',
    isCurrent: false,
  },
  {
    id: '3',
    device: 'iPhone 15 Pro',
    date: '12 Jan 2025, 08:30',
    location: 'Lyon, France',
    isCurrent: false,
  },
];

const TIMEOUT_OPTIONS = [
  { label: '5 minutos', value: 5 },
  { label: '10 minutos', value: 10 },
  { label: '15 minutos', value: 15 },
  { label: '30 minutos', value: 30 },
];

const SecuritySettingsScreen: React.FC = () => {
  const navigation = useNavigation<SecurityNavProp>();
  const { colors, spacing, borderRadius } = useTheme();
  const { isBiometricEnabled, isPinEnabled } = useAuth();

  const [biometricEnabled, setBiometricEnabled] = useState(isBiometricEnabled);
  const [pinEnabled, setPinEnabled] = useState(isPinEnabled);
  const [sessionTimeout, setSessionTimeout] = useState(15);
  const [transactionAlerts, setTransactionAlerts] = useState(true);
  const [loginAlerts, setLoginAlerts] = useState(true);
  const [suspiciousAlerts, setSuspiciousAlerts] = useState(true);
  const [timeoutModalVisible, setTimeoutModalVisible] = useState(false);
  const [logoutAllModalVisible, setLogoutAllModalVisible] = useState(false);
  const [savingLogout, setSavingLogout] = useState(false);

  const handleLogoutAll = async () => {
    setSavingLogout(true);
    await new Promise<void>((r) => setTimeout(r, 1000));
    setSavingLogout(false);
    setLogoutAllModalVisible(false);
  };

  const styles = makeStyles(colors, spacing, borderRadius);

  const renderSectionHeader = (title: string, icon: keyof typeof Ionicons.glyphMap) => (
    <View style={styles.sectionHeader}>
      <Ionicons name={icon} size={18} color={colors.primary} />
      <Text style={styles.sectionTitle}>{title}</Text>
    </View>
  );

  const renderToggleRow = (
    label: string,
    value: boolean,
    onToggle: (v: boolean) => void,
    subtitle?: string,
  ) => (
    <View style={styles.toggleRow}>
      <View style={styles.toggleLeft}>
        <Text style={styles.toggleLabel}>{label}</Text>
        {subtitle && <Text style={styles.toggleSubtitle}>{subtitle}</Text>}
      </View>
      <Switch
        value={value}
        onValueChange={onToggle}
        trackColor={{ false: colors.border, true: colors.primary }}
        thumbColor="#FFFFFF"
      />
    </View>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={colors.headerText} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Seguridad</Text>
        <View style={styles.headerPlaceholder} />
      </View>

      <ScrollView
        style={styles.container}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.contentContainer}
      >
        {/* Biometric */}
        <View style={styles.card}>
          {renderSectionHeader('Biometría', 'finger-print-outline')}
          <Divider />
          {renderToggleRow(
            'Face ID / Huella dactilar',
            biometricEnabled,
            setBiometricEnabled,
            biometricEnabled ? 'Activado — acceso rápido disponible' : 'Desactivado',
          )}
          <View style={styles.statusRow}>
            <View
              style={[
                styles.statusDot,
                { backgroundColor: biometricEnabled ? '#4CAF50' : colors.border },
              ]}
            />
            <Text style={styles.statusText}>
              {biometricEnabled
                ? 'La biometría está configurada y activa'
                : 'La biometría está desactivada'}
            </Text>
          </View>
        </View>

        {/* PIN */}
        <View style={styles.card}>
          {renderSectionHeader('Código PIN', 'keypad-outline')}
          <Divider />
          {renderToggleRow('Activar código PIN', pinEnabled, setPinEnabled)}
          {pinEnabled && (
            <>
              <Divider />
              <TouchableOpacity
                style={styles.actionRow}
                onPress={() => navigation.navigate('ChangePassword')}
                activeOpacity={0.7}
              >
                <Text style={styles.actionLabel}>Cambiar PIN</Text>
                <Ionicons name="chevron-forward" size={16} color={colors.textSecondary} />
              </TouchableOpacity>
            </>
          )}
        </View>

        {/* Session */}
        <View style={styles.card}>
          {renderSectionHeader('Sesión', 'time-outline')}
          <Divider />
          <TouchableOpacity
            style={styles.actionRow}
            onPress={() => setTimeoutModalVisible(true)}
            activeOpacity={0.7}
          >
            <View style={styles.actionLeft}>
              <Text style={styles.actionLabel}>Expiración de sesión</Text>
              <Text style={styles.actionValue}>
                {TIMEOUT_OPTIONS.find((o) => o.value === sessionTimeout)?.label}
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={16} color={colors.textSecondary} />
          </TouchableOpacity>
          <Divider />
          <TouchableOpacity
            style={styles.actionRow}
            onPress={() => setLogoutAllModalVisible(true)}
            activeOpacity={0.7}
          >
            <Text style={[styles.actionLabel, { color: colors.error }]}>
              Cerrar sesión en todos los dispositivos
            </Text>
            <Ionicons name="chevron-forward" size={16} color={colors.error} />
          </TouchableOpacity>
        </View>

        {/* Security alerts */}
        <View style={styles.card}>
          {renderSectionHeader('Alertas de seguridad', 'notifications-outline')}
          <Divider />
          {renderToggleRow(
            'Alertas de transacción',
            transactionAlerts,
            setTransactionAlerts,
            'Notificación por cada transacción',
          )}
          <Divider />
          {renderToggleRow(
            'Alertas de acceso',
            loginAlerts,
            setLoginAlerts,
            'Notificación por cada acceso',
          )}
          <Divider />
          {renderToggleRow(
            'Actividad sospechosa',
            suspiciousAlerts,
            setSuspiciousAlerts,
            'Notificación ante actividad anómala',
          )}
        </View>

        {/* Connection history */}
        <View style={styles.card}>
          {renderSectionHeader('Historial de accesos', 'list-outline')}
          <Divider />
          {MOCK_CONNECTIONS.map((conn, index) => (
            <React.Fragment key={conn.id}>
              <View style={styles.connectionRow}>
                <View style={styles.connectionIcon}>
                  <Ionicons
                    name={conn.device.includes('Mac') ? 'laptop-outline' : 'phone-portrait-outline'}
                    size={20}
                    color={conn.isCurrent ? colors.primary : colors.icon}
                  />
                </View>
                <View style={styles.connectionInfo}>
                  <View style={styles.connectionTitleRow}>
                    <Text style={styles.connectionDevice}>{conn.device}</Text>
                    {conn.isCurrent && (
                      <View style={styles.currentBadge}>
                        <Text style={styles.currentBadgeText}>Actual</Text>
                      </View>
                    )}
                  </View>
                  <Text style={styles.connectionDate}>{conn.date}</Text>
                  <Text style={styles.connectionLocation}>
                    <Ionicons name="location-outline" size={11} color={colors.textSecondary} />{' '}
                    {conn.location}
                  </Text>
                </View>
              </View>
              {index < MOCK_CONNECTIONS.length - 1 && <Divider />}
            </React.Fragment>
          ))}
        </View>
      </ScrollView>

      {/* Timeout selector modal */}
      <Modal
        visible={timeoutModalVisible}
        title="Expiración de sesión"
        onClose={() => setTimeoutModalVisible(false)}
      >
        {TIMEOUT_OPTIONS.map((opt) => (
          <TouchableOpacity
            key={opt.value}
            style={[
              styles.optionRow,
              sessionTimeout === opt.value && styles.optionRowSelected,
            ]}
            onPress={() => {
              setSessionTimeout(opt.value);
              setTimeoutModalVisible(false);
            }}
            activeOpacity={0.7}
          >
            <Text
              style={[
                styles.optionLabel,
                sessionTimeout === opt.value && styles.optionLabelSelected,
              ]}
            >
              {opt.label}
            </Text>
            {sessionTimeout === opt.value && (
              <Ionicons name="checkmark" size={20} color={colors.primary} />
            )}
          </TouchableOpacity>
        ))}
      </Modal>

      {/* Logout all modal */}
      <Modal
        visible={logoutAllModalVisible}
        title="Cerrar sesión en todos los dispositivos"
        onClose={() => setLogoutAllModalVisible(false)}
      >
        <Text style={styles.modalBody}>
          Esta acción cerrará la sesión en todos los dispositivos asociados a su cuenta, incluidos
          cet appareil.
        </Text>
        <View style={styles.modalActions}>
          <Button
            label="Cancelar"
            variant="outline"
            onPress={() => setLogoutAllModalVisible(false)}
            style={styles.modalBtn}
          />
          <Button
            label="Déconnecter"
            variant="danger"
            loading={savingLogout}
            onPress={handleLogoutAll}
            style={styles.modalBtn}
          />
        </View>
      </Modal>
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
      fontSize: 18,
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
    sectionHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: spacing.md,
      paddingVertical: spacing.md,
      gap: spacing.sm,
    },
    sectionTitle: {
      fontSize: 15,
      fontWeight: '700',
      color: colors.text,
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
      fontSize: 15,
      color: colors.text,
      fontWeight: '500',
    },
    toggleSubtitle: {
      fontSize: 12,
      color: colors.textSecondary,
      marginTop: 2,
    },
    statusRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.sm,
      paddingHorizontal: spacing.md,
      paddingBottom: spacing.md,
    },
    statusDot: {
      width: 8,
      height: 8,
      borderRadius: 4,
    },
    statusText: {
      fontSize: 12,
      color: colors.textSecondary,
    },
    actionRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: spacing.md,
      paddingVertical: spacing.md,
      minHeight: 52,
    },
    actionLeft: {
      flex: 1,
    },
    actionLabel: {
      fontSize: 15,
      color: colors.text,
      fontWeight: '500',
    },
    actionValue: {
      fontSize: 12,
      color: colors.textSecondary,
      marginTop: 2,
    },
    connectionRow: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      paddingHorizontal: spacing.md,
      paddingVertical: spacing.md,
      gap: spacing.md,
    },
    connectionIcon: {
      width: 40,
      height: 40,
      borderRadius: 20,
      backgroundColor: colors.background,
      alignItems: 'center',
      justifyContent: 'center',
    },
    connectionInfo: {
      flex: 1,
    },
    connectionTitleRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.sm,
      marginBottom: 2,
    },
    connectionDevice: {
      fontSize: 14,
      fontWeight: '600',
      color: colors.text,
    },
    currentBadge: {
      backgroundColor: '#E3F2FD',
      borderRadius: 4,
      paddingHorizontal: spacing.xs,
      paddingVertical: 1,
    },
    currentBadgeText: {
      fontSize: 10,
      color: '#003366',
      fontWeight: '700',
    },
    connectionDate: {
      fontSize: 12,
      color: colors.textSecondary,
    },
    connectionLocation: {
      fontSize: 12,
      color: colors.textSecondary,
      marginTop: 2,
    },
    optionRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingVertical: spacing.md,
      paddingHorizontal: spacing.xs,
      borderRadius: borderRadius.sm,
      marginBottom: spacing.xs,
    },
    optionRowSelected: {
      backgroundColor: colors.background,
    },
    optionLabel: {
      fontSize: 15,
      color: colors.text,
    },
    optionLabelSelected: {
      color: colors.primary,
      fontWeight: '600',
    },
    modalBody: {
      fontSize: 15,
      color: colors.text,
      lineHeight: 22,
      marginBottom: spacing.lg,
    },
    modalActions: {
      flexDirection: 'row',
      gap: spacing.md,
    },
    modalBtn: {
      flex: 1,
    },
  });

export default SecuritySettingsScreen;
