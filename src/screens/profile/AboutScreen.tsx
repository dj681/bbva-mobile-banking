import React from 'react';
import {
  Linking,
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

import { Divider } from '@/components/common/Divider';
import { useTheme } from '@/hooks/useTheme';
import type { ProfileStackParamList } from '@/types';

type AboutNavProp = NativeStackNavigationProp<ProfileStackParamList, 'About'>;

interface InfoRow {
  label: string;
  value: string;
}

interface LinkItem {
  id: string;
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
}

const APP_INFO: InfoRow[] = [
  { label: 'Versión de la aplicación', value: '1.0.0' },
  { label: 'Versión de la API', value: '2.0.0' },
  { label: 'Última actualización', value: '15 de enero de 2025' },
  { label: 'Plataforma', value: 'iOS & Android' },
];

const LINKS: LinkItem[] = [
  { id: 'privacy', label: 'Política de privacidad', icon: 'shield-outline' },
  { id: 'terms', label: 'Condiciones de uso', icon: 'document-text-outline' },
  { id: 'legal', label: 'Aviso legal', icon: 'newspaper-outline' },
  { id: 'licenses', label: 'Licencias de código abierto', icon: 'code-slash-outline' },
];

const SOCIAL = [
  { id: 'twitter', icon: 'logo-twitter' as keyof typeof Ionicons.glyphMap, label: 'Twitter' },
  { id: 'facebook', icon: 'logo-facebook' as keyof typeof Ionicons.glyphMap, label: 'Facebook' },
  { id: 'linkedin', icon: 'logo-linkedin' as keyof typeof Ionicons.glyphMap, label: 'LinkedIn' },
  { id: 'instagram', icon: 'logo-instagram' as keyof typeof Ionicons.glyphMap, label: 'Instagram' },
];

const AboutScreen: React.FC = () => {
  const navigation = useNavigation<AboutNavProp>();
  const { colors, spacing, borderRadius } = useTheme();

  const styles = makeStyles(colors, spacing, borderRadius);

  const handleLinkPress = (id: string) => {
    const urls: Record<string, string> = {
      privacy: 'https://www.bbva.com/privacy',
      terms: 'https://www.bbva.com/terms',
      legal: 'https://www.bbva.com/legal',
      licenses: 'https://www.bbva.com/licenses',
    };
    const url = urls[id];
    if (url) Linking.openURL(url).catch(() => {});
  };

  const handleSocialPress = (id: string) => {
    const urls: Record<string, string> = {
      twitter: 'https://twitter.com/bbva',
      facebook: 'https://facebook.com/bbva',
      linkedin: 'https://linkedin.com/company/bbva',
      instagram: 'https://instagram.com/bbva',
    };
    const url = urls[id];
    if (url) Linking.openURL(url).catch(() => {});
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={colors.headerText} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Acerca de</Text>
        <View style={styles.headerPlaceholder} />
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.contentContainer}
      >
        {/* Brand hero */}
        <View style={styles.heroSection}>
          <View style={styles.logoBadge}>
            <Text style={styles.logoText}>BBVA</Text>
          </View>
          <Text style={styles.appName}>BBVA Mobile Banking</Text>
          <Text style={styles.appTagline}>Su banco, siempre con usted</Text>
          <Text style={styles.appDescription}>
            BBVA Mobile Banking le ofrece una experiencia bancaria completa y segura
            desde su smartphone. Gestione sus cuentas, realice transferencias,
            siga sus inversiones y mucho más.
          </Text>
        </View>

        {/* App info */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>INFORMACIÓN</Text>
          {APP_INFO.map((row, index) => (
            <React.Fragment key={row.label}>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>{row.label}</Text>
                <Text style={styles.infoValue}>{row.value}</Text>
              </View>
              {index < APP_INFO.length - 1 && <Divider />}
            </React.Fragment>
          ))}
        </View>

        {/* Links */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>INFORMACIÓN LEGAL</Text>
          {LINKS.map((link, index) => (
            <React.Fragment key={link.id}>
              <TouchableOpacity
                style={styles.linkRow}
                onPress={() => handleLinkPress(link.id)}
                activeOpacity={0.7}
              >
                <Ionicons name={link.icon} size={18} color={colors.primary} />
                <Text style={styles.linkLabel}>{link.label}</Text>
                <Ionicons name="open-outline" size={14} color={colors.textSecondary} />
              </TouchableOpacity>
              {index < LINKS.length - 1 && <Divider style={styles.linkDivider} />}
            </React.Fragment>
          ))}
        </View>

        {/* Social */}
        <View style={styles.socialSection}>
          <Text style={styles.socialTitle}>Síguenos</Text>
          <View style={styles.socialRow}>
            {SOCIAL.map((item) => (
              <TouchableOpacity
                key={item.id}
                style={styles.socialBtn}
                onPress={() => handleSocialPress(item.id)}
                activeOpacity={0.75}
                accessibilityLabel={item.label}
              >
                <Ionicons name={item.icon} size={22} color={colors.primary} />
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Copyright */}
        <View style={styles.copyrightSection}>
          <Text style={styles.copyrightText}>© 2024 BBVA. Todos los derechos reservados.</Text>
          <Text style={styles.copyrightSubtext}>
            BBVA es una marca registrada de Banco Bilbao Vizcaya Argentaria, S.A.
          </Text>
        </View>
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
      fontSize: 18,
      fontWeight: '700',
      color: colors.headerText,
      textAlign: 'center',
    },
    headerPlaceholder: {
      width: 32,
    },
    contentContainer: {
      paddingBottom: spacing.xxxl,
    },
    heroSection: {
      alignItems: 'center',
      paddingVertical: spacing.xl,
      paddingHorizontal: spacing.xl,
      backgroundColor: colors.surface,
      marginBottom: spacing.md,
    },
    logoBadge: {
      width: 80,
      height: 80,
      borderRadius: borderRadius.xl,
      backgroundColor: '#003366',
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: spacing.md,
      shadowColor: '#003366',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.3,
      shadowRadius: 8,
      elevation: 6,
    },
    logoText: {
      fontSize: 22,
      fontWeight: '900',
      color: '#FFFFFF',
      letterSpacing: 2,
    },
    appName: {
      fontSize: 20,
      fontWeight: '700',
      color: colors.text,
      marginBottom: spacing.xs,
    },
    appTagline: {
      fontSize: 13,
      color: '#00A8E8',
      fontWeight: '600',
      marginBottom: spacing.md,
    },
    appDescription: {
      fontSize: 14,
      color: colors.textSecondary,
      textAlign: 'center',
      lineHeight: 21,
    },
    card: {
      backgroundColor: colors.surface,
      marginHorizontal: spacing.md,
      marginBottom: spacing.md,
      borderRadius: borderRadius.lg,
      overflow: 'hidden',
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.06,
      shadowRadius: 4,
      elevation: 2,
    },
    cardTitle: {
      fontSize: 11,
      fontWeight: '700',
      color: colors.textSecondary,
      letterSpacing: 1.2,
      paddingHorizontal: spacing.md,
      paddingVertical: spacing.sm + 2,
    },
    infoRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: spacing.md,
      paddingVertical: spacing.md,
    },
    infoLabel: {
      fontSize: 14,
      color: colors.text,
      fontWeight: '500',
    },
    infoValue: {
      fontSize: 14,
      color: colors.textSecondary,
    },
    linkRow: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: spacing.md,
      paddingVertical: spacing.md,
      gap: spacing.md,
    },
    linkLabel: {
      flex: 1,
      fontSize: 14,
      color: colors.text,
      fontWeight: '500',
    },
    linkDivider: {
      marginLeft: spacing.md + 18 + spacing.md,
    },
    socialSection: {
      alignItems: 'center',
      marginHorizontal: spacing.md,
      marginBottom: spacing.md,
      paddingVertical: spacing.lg,
      backgroundColor: colors.surface,
      borderRadius: borderRadius.lg,
    },
    socialTitle: {
      fontSize: 13,
      fontWeight: '600',
      color: colors.textSecondary,
      marginBottom: spacing.md,
    },
    socialRow: {
      flexDirection: 'row',
      gap: spacing.lg,
    },
    socialBtn: {
      width: 48,
      height: 48,
      borderRadius: 24,
      backgroundColor: colors.background,
      alignItems: 'center',
      justifyContent: 'center',
    },
    copyrightSection: {
      alignItems: 'center',
      paddingHorizontal: spacing.xl,
      paddingVertical: spacing.lg,
    },
    copyrightText: {
      fontSize: 13,
      color: colors.textSecondary,
      fontWeight: '600',
      marginBottom: spacing.xs,
    },
    copyrightSubtext: {
      fontSize: 11,
      color: colors.textSecondary,
      textAlign: 'center',
      lineHeight: 16,
    },
  });

export default AboutScreen;
