import React, { useState } from 'react';
import {
  FlatList,
  SafeAreaView,
  StyleSheet,
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
import { setLanguage } from '@/store/slices';
import type { ProfileStackParamList } from '@/types';

type LanguageNavProp = NativeStackNavigationProp<ProfileStackParamList, 'Language'>;

interface LanguageOption {
  code: string;
  nativeName: string;
  localName: string;
  flag: string;
}

const LANGUAGES: LanguageOption[] = [
  { code: 'fr', nativeName: 'Français', localName: 'French', flag: '🇫🇷' },
  { code: 'en', nativeName: 'English', localName: 'English', flag: '🇬🇧' },
  { code: 'es', nativeName: 'Español', localName: 'Spanish', flag: '🇪🇸' },
  { code: 'de', nativeName: 'Deutsch', localName: 'German', flag: '🇩🇪' },
  { code: 'pt', nativeName: 'Português', localName: 'Portuguese', flag: '🇵🇹' },
  { code: 'ar', nativeName: 'العربية', localName: 'Arabic', flag: '🇸🇦' },
];

const LanguageScreen: React.FC = () => {
  const navigation = useNavigation<LanguageNavProp>();
  const { colors, spacing, borderRadius } = useTheme();
  const dispatch = useAppDispatch();
  const currentLanguage = useAppSelector((s) => s.ui.language);

  const [selectedCode, setSelectedCode] = useState(currentLanguage);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const handleSave = async () => {
    if (selectedCode === currentLanguage) {
      navigation.goBack();
      return;
    }
    setSaving(true);
    await new Promise<void>((r) => setTimeout(r, 600));
    dispatch(setLanguage(selectedCode));
    setSaving(false);
    setSaved(true);
    setTimeout(() => {
      setSaved(false);
      navigation.goBack();
    }, 1500);
  };

  const styles = makeStyles(colors, spacing, borderRadius);

  const renderItem = ({ item, index }: { item: LanguageOption; index: number }) => {
    const isSelected = selectedCode === item.code;
    return (
      <>
        <TouchableOpacity
          style={[styles.languageRow, isSelected && styles.languageRowSelected]}
          onPress={() => setSelectedCode(item.code)}
          activeOpacity={0.7}
        >
          <Text style={styles.flagEmoji}>{item.flag}</Text>
          <View style={styles.languageInfo}>
            <Text style={[styles.nativeName, isSelected && styles.nativeNameSelected]}>
              {item.nativeName}
            </Text>
            <Text style={styles.localName}>{item.localName}</Text>
          </View>
          <View
            style={[styles.radioOuter, isSelected && styles.radioOuterSelected]}
          >
            {isSelected && <View style={styles.radioInner} />}
          </View>
        </TouchableOpacity>
        {index < LANGUAGES.length - 1 && <Divider style={styles.itemDivider} />}
      </>
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={colors.headerText} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Langue</Text>
        <View style={styles.headerPlaceholder} />
      </View>

      {saved && (
        <View style={styles.savedBanner}>
          <Ionicons name="checkmark-circle" size={18} color="#FFFFFF" />
          <Text style={styles.savedText}>Langue mise à jour</Text>
        </View>
      )}

      <FlatList
        data={LANGUAGES}
        keyExtractor={(item) => item.code}
        renderItem={renderItem}
        style={styles.list}
        contentContainerStyle={styles.listContent}
        ItemSeparatorComponent={null}
        ListHeaderComponent={
          <Text style={styles.hint}>
            Choisissez la langue d'affichage de l'application.
          </Text>
        }
        ListFooterComponent={
          <Button
            label="Sauvegarder"
            variant="primary"
            fullWidth
            loading={saving}
            onPress={handleSave}
            style={styles.saveButton}
          />
        }
      />
    </SafeAreaView>
  );
};

const makeStyles = (colors: any, spacing: any, _borderRadius: any) =>
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
    savedBanner: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: '#4CAF50',
      padding: spacing.md,
      gap: spacing.sm,
    },
    savedText: {
      color: '#FFFFFF',
      fontSize: 14,
      fontWeight: '600',
    },
    list: {
      flex: 1,
    },
    listContent: {
      padding: spacing.md,
      paddingBottom: spacing.xxxl,
    },
    hint: {
      fontSize: 13,
      color: colors.textSecondary,
      marginBottom: spacing.md,
      lineHeight: 18,
    },
    languageRow: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: colors.surface,
      paddingHorizontal: spacing.md,
      paddingVertical: spacing.md + 2,
      borderRadius: 0,
    },
    languageRowSelected: {
      backgroundColor: colors.isDarkMode ? '#0D2040' : '#EBF4FF',
    },
    flagEmoji: {
      fontSize: 28,
      marginRight: spacing.md,
    },
    languageInfo: {
      flex: 1,
    },
    nativeName: {
      fontSize: 16,
      fontWeight: '600',
      color: colors.text,
    },
    nativeNameSelected: {
      color: colors.primary,
    },
    localName: {
      fontSize: 12,
      color: colors.textSecondary,
      marginTop: 2,
    },
    radioOuter: {
      width: 22,
      height: 22,
      borderRadius: 11,
      borderWidth: 2,
      borderColor: colors.border,
      alignItems: 'center',
      justifyContent: 'center',
    },
    radioOuterSelected: {
      borderColor: colors.primary,
    },
    radioInner: {
      width: 12,
      height: 12,
      borderRadius: 6,
      backgroundColor: colors.primary,
    },
    itemDivider: {
      marginLeft: 60,
    },
    saveButton: {
      marginTop: spacing.xl,
    },
  });

export default LanguageScreen;
