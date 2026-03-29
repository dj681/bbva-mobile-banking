import React, { useState } from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
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
import { Input } from '@/components/common/Input';
import { Button } from '@/components/common/Button';
import { useAuth } from '@/hooks/useAuth';
import { useTheme } from '@/hooks/useTheme';
import type { ProfileStackParamList } from '@/types';

type EditProfileNavProp = NativeStackNavigationProp<ProfileStackParamList, 'EditProfile'>;

interface FormData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  birthDate: string;
  address: string;
  postalCode: string;
  city: string;
}

interface FormErrors {
  firstName?: string;
  lastName?: string;
  phone?: string;
  birthDate?: string;
  postalCode?: string;
  city?: string;
}

const EditProfileScreen: React.FC = () => {
  const navigation = useNavigation<EditProfileNavProp>();
  const { colors, spacing, borderRadius } = useTheme();
  const { user } = useAuth();

  const [form, setForm] = useState<FormData>({
    firstName: user?.firstName ?? '',
    lastName: user?.lastName ?? '',
    email: user?.email ?? '',
    phone: user?.phone ?? '',
    birthDate: user?.birthDate ?? '',
    address: user?.address ?? '',
    postalCode: user?.postalCode ?? '',
    city: user?.city ?? '',
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [saving, setSaving] = useState(false);
  const [successVisible, setSuccessVisible] = useState(false);

  const updateField = (key: keyof FormData) => (value: string) => {
    setForm((prev) => ({ ...prev, [key]: value }));
    if (errors[key as keyof FormErrors]) {
      setErrors((prev) => ({ ...prev, [key]: undefined }));
    }
  };

  const validate = (): boolean => {
    const newErrors: FormErrors = {};
    if (!form.firstName.trim()) newErrors.firstName = 'El nombre es obligatorio';
    if (!form.lastName.trim()) newErrors.lastName = 'Los apellidos son obligatorios';
    if (form.phone && !/^[\d\s+()-]{8,}$/.test(form.phone)) {
      newErrors.phone = 'Número de teléfono no válido';
    }
    if (form.postalCode && !/^\d{5}$/.test(form.postalCode)) {
      newErrors.postalCode = 'Código postal no válido (5 dígitos)';
    }
    if (form.city && form.city.trim().length < 2) {
      newErrors.city = 'Ciudad no válida';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    if (!validate()) return;
    setSaving(true);
    try {
      // Simulate API call
      await new Promise<void>((resolve) => setTimeout(resolve, 1000));
      setSuccessVisible(true);
      setTimeout(() => setSuccessVisible(false), 3000);
    } finally {
      setSaving(false);
    }
  };

  const styles = makeStyles(colors, spacing, borderRadius);
  const fullName = `${form.firstName} ${form.lastName}`.trim() || 'Usuario';

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backButton}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Ionicons name="arrow-back" size={24} color={colors.headerText} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Editar perfil</Text>
        <View style={styles.headerPlaceholder} />
      </View>

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          style={styles.container}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.contentContainer}
          keyboardShouldPersistTaps="handled"
        >
          {/* Success toast */}
          {successVisible && (
            <View style={styles.successToast}>
              <Ionicons name="checkmark-circle" size={20} color="#FFFFFF" />
              <Text style={styles.successToastText}>Perfil actualizado correctamente</Text>
            </View>
          )}

          {/* Avatar section */}
          <View style={styles.avatarSection}>
            <View style={styles.avatarWrapper}>
              <Avatar name={fullName} size="xlarge" />
              <TouchableOpacity
                style={styles.avatarEditBtn}
                onPress={() => Alert.alert('Foto de perfil', 'Función próximamente disponible')}
                activeOpacity={0.8}
              >
                <Ionicons name="camera" size={16} color="#FFFFFF" />
              </TouchableOpacity>
            </View>
            <Text style={styles.avatarHint}>Pulse para cambiar la foto</Text>
          </View>

          {/* Form */}
          <View style={styles.formSection}>
            <Text style={styles.sectionLabel}>INFORMACIÓN PERSONAL</Text>

            <Input
              label="Nombre"
              value={form.firstName}
              onChangeText={updateField('firstName')}
              error={errors.firstName}
              autoCapitalize="words"
              returnKeyType="next"
            />
            <Input
              label="Apellidos"
              value={form.lastName}
              onChangeText={updateField('lastName')}
              error={errors.lastName}
              autoCapitalize="words"
              returnKeyType="next"
            />
            <View style={styles.readOnlyContainer}>
              <Input
                label="Correo electrónico"
                value={form.email}
                onChangeText={() => {}}
                editable={false}
                keyboardType="email-address"
              />
              <View style={styles.readOnlyBadge}>
                <Ionicons name="lock-closed" size={12} color={colors.textSecondary} />
                <Text style={styles.readOnlyText}>
                  La dirección de correo electrónico no se puede modificar aquí. Contacte con el soporte.
                </Text>
              </View>
            </View>

            <Input
              label="Número de teléfono"
              value={form.phone}
              onChangeText={updateField('phone')}
              error={errors.phone}
              keyboardType="phone-pad"
              returnKeyType="next"
            />
            <Input
              label="Fecha de nacimiento"
              value={form.birthDate}
              onChangeText={updateField('birthDate')}
              error={errors.birthDate}
              placeholder="DD/MM/AAAA"
              returnKeyType="next"
            />
          </View>

          <View style={styles.formSection}>
            <Text style={styles.sectionLabel}>DIRECCIÓN</Text>

            <Input
              label="Dirección"
              value={form.address}
              onChangeText={updateField('address')}
              multiline
              numberOfLines={2}
              returnKeyType="next"
            />
            <Input
              label="Código postal"
              value={form.postalCode}
              onChangeText={updateField('postalCode')}
              error={errors.postalCode}
              keyboardType="numeric"
              maxLength={5}
              returnKeyType="next"
            />
            <Input
              label="Ciudad"
              value={form.city}
              onChangeText={updateField('city')}
              error={errors.city}
              autoCapitalize="words"
              returnKeyType="done"
            />
          </View>

          <Button
            label="Sauvegarder"
            variant="primary"
            fullWidth
            loading={saving}
            onPress={handleSave}
            style={styles.saveButton}
          />
        </ScrollView>
      </KeyboardAvoidingView>
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
      paddingBottom: spacing.xxxl,
    },
    successToast: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: '#4CAF50',
      margin: spacing.md,
      padding: spacing.md,
      borderRadius: borderRadius.md,
      gap: spacing.sm,
    },
    successToastText: {
      color: '#FFFFFF',
      fontSize: 14,
      fontWeight: '600',
      flex: 1,
    },
    avatarSection: {
      alignItems: 'center',
      paddingVertical: spacing.xl,
      backgroundColor: colors.surface,
      marginBottom: spacing.md,
    },
    avatarWrapper: {
      position: 'relative',
    },
    avatarEditBtn: {
      position: 'absolute',
      bottom: 0,
      right: 0,
      width: 32,
      height: 32,
      borderRadius: 16,
      backgroundColor: '#003366',
      alignItems: 'center',
      justifyContent: 'center',
      borderWidth: 2,
      borderColor: colors.background,
    },
    avatarHint: {
      marginTop: spacing.sm,
      fontSize: 12,
      color: colors.textSecondary,
    },
    formSection: {
      backgroundColor: colors.surface,
      marginHorizontal: spacing.md,
      marginBottom: spacing.md,
      borderRadius: borderRadius.lg,
      padding: spacing.md,
    },
    sectionLabel: {
      fontSize: 11,
      fontWeight: '700',
      color: colors.textSecondary,
      letterSpacing: 1.2,
      marginBottom: spacing.md,
    },
    readOnlyContainer: {
      marginBottom: spacing.sm,
    },
    readOnlyBadge: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      gap: spacing.xs,
      paddingHorizontal: spacing.xs,
      marginTop: -spacing.sm,
      marginBottom: spacing.sm,
    },
    readOnlyText: {
      fontSize: 11,
      color: colors.textSecondary,
      flex: 1,
      lineHeight: 16,
    },
    saveButton: {
      marginHorizontal: spacing.md,
      marginTop: spacing.sm,
    },
  });

export default EditProfileScreen;
