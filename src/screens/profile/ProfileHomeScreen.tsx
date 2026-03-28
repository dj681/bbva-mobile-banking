import React, { useState } from 'react';
import {
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { Avatar } from '@/components/common/Avatar';
import { Modal } from '@/components/common/Modal';
import { Divider } from '@/components/common/Divider';
import { Button } from '@/components/common/Button';
import { useAuth } from '@/hooks/useAuth';
import { useTheme } from '@/hooks/useTheme';
import { useAppSelector } from '@/store';
import type { ProfileStackParamList } from '@/types';

type ProfileNavProp = NativeStackNavigationProp<ProfileStackParamList, 'ProfileHome'>;

function maskPhone(phone: string): string {
  if (!phone) return '';
  const last2 = phone.slice(-2);
  const prefix = phone.slice(0, 3);
  return `${prefix} ** ** ** ** ${last2}`;
}

interface MenuItem {
  id: string;
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
  value?: string;
  badge?: string;
  screen?: keyof ProfileStackParamList;
  danger?: boolean;
}

interface MenuSection {
  title: string;
  items: MenuItem[];
}

const ProfileHomeScreen: React.FC = () => {
  const navigation = useNavigation<ProfileNavProp>();
  const { colors, spacing, borderRadius } = useTheme();
  const { user, logout } = useAuth();
  const language = useAppSelector((s) => s.ui.language);
  const theme = useAppSelector((s) => s.ui.theme);
  const [logoutModalVisible, setLogoutModalVisible] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);

  const languageLabel =
    language === 'fr'
      ? 'Français'
      : language === 'en'
      ? 'English'
      : language === 'es'
      ? 'Español'
      : language === 'de'
      ? 'Deutsch'
      : language === 'pt'
      ? 'Português'
      : language === 'ar'
      ? 'العربية'
      : language;

  const themeLabel =
    theme === 'dark' ? 'Sombre' : theme === 'system' ? 'Système' : 'Clair';

  const sections: MenuSection[] = [
    {
      title: 'COMPTE',
      items: [
        {
          id: 'edit-profile',
          label: 'Modifier le profil',
          icon: 'person-outline',
          screen: 'EditProfile',
        },
        {
          id: 'change-password',
          label: 'Changer le mot de passe',
          icon: 'lock-closed-outline',
          screen: 'ChangePassword',
        },
      ],
    },
    {
      title: 'SÉCURITÉ',
      items: [
        {
          id: 'security',
          label: 'Sécurité',
          icon: 'shield-checkmark-outline',
          screen: 'SecuritySettings',
        },
        {
          id: 'devices',
          label: 'Gestion des appareils',
          icon: 'phone-portrait-outline',
          badge: '2 appareils',
          screen: 'DeviceManagement',
        },
      ],
    },
    {
      title: 'PRÉFÉRENCES',
      items: [
        {
          id: 'notifications',
          label: 'Notifications',
          icon: 'notifications-outline',
          screen: 'NotificationSettings',
        },
        {
          id: 'language',
          label: 'Langue',
          icon: 'globe-outline',
          value: languageLabel,
          screen: 'Language',
        },
        {
          id: 'appearance',
          label: 'Apparence',
          icon: 'moon-outline',
          value: themeLabel,
          screen: undefined,
        },
        {
          id: 'privacy',
          label: 'Confidentialité',
          icon: 'eye-outline',
          screen: undefined,
        },
      ],
    },
    {
      title: 'INFORMATIONS',
      items: [
        {
          id: 'about',
          label: 'À propos',
          icon: 'information-circle-outline',
          screen: 'About',
        },
        {
          id: 'terms',
          label: "Conditions d'utilisation",
          icon: 'document-text-outline',
          screen: undefined,
        },
        {
          id: 'support',
          label: 'Support client',
          icon: 'headset-outline',
          screen: 'Support',
        },
      ],
    },
  ];

  const handleMenuPress = (item: MenuItem) => {
    if (item.screen) {
      navigation.navigate(item.screen as any);
    }
  };

  const handleLogout = async () => {
    setLoggingOut(true);
    try {
      await logout();
    } finally {
      setLoggingOut(false);
      setLogoutModalVisible(false);
    }
  };

  const fullName = user ? `${user.firstName} ${user.lastName}` : 'Utilisateur';

  const styles = makeStyles(colors, spacing, borderRadius);

  const renderMenuItem = ({ item }: { item: MenuItem }) => (
    <TouchableOpacity
      style={styles.menuItem}
      onPress={() => handleMenuPress(item)}
      activeOpacity={0.7}
    >
      <View style={styles.menuItemLeft}>
        <View style={styles.menuIconContainer}>
          <Ionicons name={item.icon} size={20} color={colors.primary} />
        </View>
        <Text style={styles.menuItemLabel}>{item.label}</Text>
      </View>
      <View style={styles.menuItemRight}>
        {item.value && <Text style={styles.menuItemValue}>{item.value}</Text>}
        {item.badge && (
          <View style={styles.badge}>
            <Text style={styles.badgeText}>{item.badge}</Text>
          </View>
        )}
        <Ionicons name="chevron-forward" size={16} color={colors.textSecondary} />
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Mon Profil</Text>
      </View>

      <ScrollView
        style={styles.container}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.contentContainer}
      >
        {/* User info card */}
        <View style={styles.userCard}>
          <Avatar name={fullName} size="xlarge" />
          <View style={styles.userInfo}>
            <Text style={styles.userName}>{fullName}</Text>
            <Text style={styles.userEmail}>{user?.email ?? ''}</Text>
            <Text style={styles.userPhone}>{maskPhone(user?.phone ?? '')}</Text>
          </View>
          <TouchableOpacity
            style={styles.editButton}
            onPress={() => navigation.navigate('EditProfile')}
            activeOpacity={0.8}
          >
            <Text style={styles.editButtonText}>Modifier le profil</Text>
          </TouchableOpacity>
        </View>

        {/* Menu sections */}
        {sections.map((section) => (
          <View key={section.title} style={styles.section}>
            <Text style={styles.sectionTitle}>{section.title}</Text>
            <View style={styles.sectionCard}>
              {section.items.map((item, index) => (
                <React.Fragment key={item.id}>
                  {renderMenuItem({ item })}
                  {index < section.items.length - 1 && (
                    <Divider style={styles.itemDivider} />
                  )}
                </React.Fragment>
              ))}
            </View>
          </View>
        ))}

        {/* Logout */}
        <View style={styles.section}>
          <View style={styles.sectionCard}>
            <TouchableOpacity
              style={styles.menuItem}
              onPress={() => setLogoutModalVisible(true)}
              activeOpacity={0.7}
            >
              <View style={styles.menuItemLeft}>
                <View style={[styles.menuIconContainer, styles.dangerIconContainer]}>
                  <Ionicons name="log-out-outline" size={20} color={colors.error} />
                </View>
                <Text style={styles.dangerLabel}>Déconnexion</Text>
              </View>
              <Ionicons name="chevron-forward" size={16} color={colors.error} />
            </TouchableOpacity>
          </View>
        </View>

        <Text style={styles.versionText}>Version 1.0.0</Text>
      </ScrollView>

      {/* Logout confirmation modal */}
      <Modal
        visible={logoutModalVisible}
        title="Déconnexion"
        onClose={() => setLogoutModalVisible(false)}
      >
        <Text style={styles.modalBody}>
          Êtes-vous sûr de vouloir vous déconnecter de votre compte BBVA ?
        </Text>
        <View style={styles.modalActions}>
          <Button
            label="Annuler"
            variant="outline"
            onPress={() => setLogoutModalVisible(false)}
            style={styles.modalBtn}
          />
          <Button
            label="Déconnexion"
            variant="danger"
            loading={loggingOut}
            onPress={handleLogout}
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
      paddingHorizontal: spacing.md,
      paddingVertical: spacing.md,
      paddingTop: spacing.lg,
    },
    headerTitle: {
      fontSize: 20,
      fontWeight: '700',
      color: colors.headerText,
    },
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    contentContainer: {
      paddingBottom: spacing.xxxl,
    },
    userCard: {
      backgroundColor: colors.surface,
      margin: spacing.md,
      borderRadius: borderRadius.xl,
      padding: spacing.lg,
      alignItems: 'center',
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.08,
      shadowRadius: 8,
      elevation: 3,
    },
    userInfo: {
      alignItems: 'center',
      marginTop: spacing.md,
    },
    userName: {
      fontSize: 20,
      fontWeight: '700',
      color: colors.text,
      marginBottom: spacing.xs,
    },
    userEmail: {
      fontSize: 14,
      color: colors.textSecondary,
      marginBottom: spacing.xs,
    },
    userPhone: {
      fontSize: 14,
      color: colors.textSecondary,
    },
    editButton: {
      marginTop: spacing.md,
      paddingHorizontal: spacing.lg,
      paddingVertical: spacing.sm,
      borderRadius: borderRadius.full,
      borderWidth: 1.5,
      borderColor: colors.primary,
    },
    editButtonText: {
      fontSize: 14,
      fontWeight: '600',
      color: colors.primary,
    },
    section: {
      marginHorizontal: spacing.md,
      marginBottom: spacing.md,
    },
    sectionTitle: {
      fontSize: 11,
      fontWeight: '700',
      color: colors.textSecondary,
      letterSpacing: 1.2,
      marginBottom: spacing.sm,
      marginLeft: spacing.xs,
    },
    sectionCard: {
      backgroundColor: colors.surface,
      borderRadius: borderRadius.lg,
      overflow: 'hidden',
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.06,
      shadowRadius: 4,
      elevation: 2,
    },
    menuItem: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: spacing.md,
      paddingVertical: spacing.md,
      minHeight: 52,
    },
    menuItemLeft: {
      flexDirection: 'row',
      alignItems: 'center',
      flex: 1,
    },
    menuIconContainer: {
      width: 36,
      height: 36,
      borderRadius: borderRadius.md,
      backgroundColor: colors.background,
      alignItems: 'center',
      justifyContent: 'center',
      marginRight: spacing.md,
    },
    dangerIconContainer: {
      backgroundColor: '#FFF0F0',
    },
    menuItemLabel: {
      fontSize: 15,
      color: colors.text,
      fontWeight: '500',
      flex: 1,
    },
    menuItemRight: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.xs,
    },
    menuItemValue: {
      fontSize: 13,
      color: colors.textSecondary,
      marginRight: spacing.xs,
    },
    badge: {
      backgroundColor: colors.primary,
      borderRadius: borderRadius.full,
      paddingHorizontal: spacing.sm,
      paddingVertical: 2,
      marginRight: spacing.xs,
    },
    badgeText: {
      fontSize: 11,
      color: '#FFFFFF',
      fontWeight: '600',
    },
    itemDivider: {
      marginLeft: 52 + spacing.md * 2,
    },
    dangerLabel: {
      fontSize: 15,
      color: colors.error,
      fontWeight: '600',
      flex: 1,
    },
    versionText: {
      textAlign: 'center',
      fontSize: 12,
      color: colors.textSecondary,
      marginBottom: spacing.md,
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

export default ProfileHomeScreen;
