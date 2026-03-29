import React, { useState } from 'react';
import {
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

import { Input } from '@/components/common/Input';
import { Button } from '@/components/common/Button';
import { useTheme } from '@/hooks/useTheme';
import type { ProfileStackParamList } from '@/types';

type ChangePasswordNavProp = NativeStackNavigationProp<ProfileStackParamList, 'ChangePassword'>;

interface PasswordStrength {
  score: number;
  label: string;
  color: string;
}

function evaluateStrength(password: string): PasswordStrength {
  let score = 0;
  if (password.length >= 8) score++;
  if (/[A-Z]/.test(password)) score++;
  if (/[0-9]/.test(password)) score++;
  if (/[^A-Za-z0-9]/.test(password)) score++;
  if (password.length >= 12) score++;

  if (score <= 1) return { score, label: 'Muy débil', color: '#F44336' };
  if (score === 2) return { score, label: 'Débil', color: '#FF9800' };
  if (score === 3) return { score, label: 'Media', color: '#FFC107' };
  if (score === 4) return { score, label: 'Fuerte', color: '#4CAF50' };
  return { score, label: 'Muy fuerte', color: '#2E7D32' };
}

interface Requirement {
  label: string;
  met: (pw: string) => boolean;
}

const REQUIREMENTS: Requirement[] = [
  { label: 'Al menos 8 caracteres', met: (pw) => pw.length >= 8 },
  { label: 'Una letra mayúscula', met: (pw) => /[A-Z]/.test(pw) },
  { label: 'Un número', met: (pw) => /[0-9]/.test(pw) },
  { label: 'Un carácter especial (!@#$%...)', met: (pw) => /[^A-Za-z0-9]/.test(pw) },
];

const ChangePasswordScreen: React.FC = () => {
  const navigation = useNavigation<ChangePasswordNavProp>();
  const { colors, spacing, borderRadius } = useTheme();

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const strength = evaluateStrength(newPassword);

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};
    if (!currentPassword) newErrors.currentPassword = 'La contraseña actual es obligatoria';
    if (!newPassword) {
      newErrors.newPassword = 'La nueva contraseña es obligatoria';
    } else if (newPassword.length < 8) {
      newErrors.newPassword = 'La contraseña debe tener al menos 8 caracteres';
    }
    if (!confirmPassword) {
      newErrors.confirmPassword = 'Por favor, confirme la contraseña';
    } else if (confirmPassword !== newPassword) {
      newErrors.confirmPassword = 'Las contraseñas no coinciden';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    setLoading(true);
    try {
      await new Promise<void>((resolve) => setTimeout(resolve, 1200));
      setSuccess(true);
    } finally {
      setLoading(false);
    }
  };

  const styles = makeStyles(colors, spacing, borderRadius);

  if (success) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color={colors.headerText} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Cambiar contraseña</Text>
          <View style={styles.headerPlaceholder} />
        </View>
        <View style={styles.successContainer}>
          <View style={styles.successIcon}>
            <Ionicons name="checkmark-circle" size={72} color="#4CAF50" />
          </View>
          <Text style={styles.successTitle}>¡Contraseña cambiada!</Text>
          <Text style={styles.successSubtitle}>
            Su contraseña se ha actualizado correctamente. Ahora puede
            iniciar sesión con su nueva contraseña.
          </Text>
          <Button
            label="Volver al perfil"
            variant="primary"
            fullWidth
            onPress={() => navigation.goBack()}
            style={styles.successBtn}
          />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={colors.headerText} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Cambiar contraseña</Text>
        <View style={styles.headerPlaceholder} />
      </View>

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          style={styles.container}
          contentContainerStyle={styles.contentContainer}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.infoBox}>
            <Ionicons name="shield-checkmark-outline" size={20} color="#003366" />
            <Text style={styles.infoText}>
              Elija una contraseña segura que no utilice en otros sitios.
            </Text>
          </View>

          <View style={styles.formCard}>
            <Input
              label="Contraseña actual"
              value={currentPassword}
              onChangeText={(v) => {
                setCurrentPassword(v);
                setErrors((e) => ({ ...e, currentPassword: '' }));
              }}
              error={errors.currentPassword}
              secureTextEntry
              returnKeyType="next"
            />

            <Input
              label="Nueva contraseña"
              value={newPassword}
              onChangeText={(v) => {
                setNewPassword(v);
                setErrors((e) => ({ ...e, newPassword: '' }));
              }}
              error={errors.newPassword}
              secureTextEntry
              returnKeyType="next"
            />

            {/* Strength indicator */}
            {newPassword.length > 0 && (
              <View style={styles.strengthContainer}>
                <View style={styles.strengthBars}>
                  {[1, 2, 3, 4, 5].map((i) => (
                    <View
                      key={i}
                      style={[
                        styles.strengthBar,
                        {
                          backgroundColor:
                            i <= strength.score ? strength.color : colors.border,
                        },
                      ]}
                    />
                  ))}
                </View>
                <Text style={[styles.strengthLabel, { color: strength.color }]}>
                  {strength.label}
                </Text>
              </View>
            )}

            <Input
              label="Confirmar la nueva contraseña"
              value={confirmPassword}
              onChangeText={(v) => {
                setConfirmPassword(v);
                setErrors((e) => ({ ...e, confirmPassword: '' }));
              }}
              error={errors.confirmPassword}
              secureTextEntry
              returnKeyType="done"
            />
          </View>

          {/* Requirements */}
          <View style={styles.requirementsCard}>
            <Text style={styles.requirementsTitle}>Requisitos de la contraseña</Text>
            {REQUIREMENTS.map((req) => {
              const met = req.met(newPassword);
              return (
                <View key={req.label} style={styles.requirementRow}>
                  <Ionicons
                    name={met ? 'checkmark-circle' : 'ellipse-outline'}
                    size={18}
                    color={met ? '#4CAF50' : colors.textSecondary}
                  />
                  <Text
                    style={[
                      styles.requirementText,
                      met && styles.requirementMet,
                    ]}
                  >
                    {req.label}
                  </Text>
                </View>
              );
            })}
          </View>

          <Button
            label="Cambiar contraseña"
            variant="primary"
            fullWidth
            loading={loading}
            onPress={handleSubmit}
            style={styles.submitButton}
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
      padding: spacing.md,
      paddingBottom: spacing.xxxl,
    },
    infoBox: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      backgroundColor: '#E3F2FD',
      borderRadius: borderRadius.md,
      padding: spacing.md,
      gap: spacing.sm,
      marginBottom: spacing.md,
    },
    infoText: {
      flex: 1,
      fontSize: 13,
      color: '#003366',
      lineHeight: 18,
    },
    formCard: {
      backgroundColor: colors.surface,
      borderRadius: borderRadius.lg,
      padding: spacing.md,
      marginBottom: spacing.md,
    },
    strengthContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      marginTop: -spacing.sm,
      marginBottom: spacing.md,
      gap: spacing.sm,
    },
    strengthBars: {
      flexDirection: 'row',
      flex: 1,
      gap: 4,
    },
    strengthBar: {
      flex: 1,
      height: 4,
      borderRadius: 2,
    },
    strengthLabel: {
      fontSize: 12,
      fontWeight: '600',
      minWidth: 60,
    },
    requirementsCard: {
      backgroundColor: colors.surface,
      borderRadius: borderRadius.lg,
      padding: spacing.md,
      marginBottom: spacing.md,
    },
    requirementsTitle: {
      fontSize: 13,
      fontWeight: '700',
      color: colors.text,
      marginBottom: spacing.sm,
    },
    requirementRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.sm,
      marginBottom: spacing.xs,
    },
    requirementText: {
      fontSize: 13,
      color: colors.textSecondary,
    },
    requirementMet: {
      color: '#4CAF50',
    },
    submitButton: {
      marginTop: spacing.sm,
    },
    successContainer: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      padding: spacing.xl,
    },
    successIcon: {
      marginBottom: spacing.lg,
    },
    successTitle: {
      fontSize: 22,
      fontWeight: '700',
      color: colors.text,
      marginBottom: spacing.md,
    },
    successSubtitle: {
      fontSize: 15,
      color: colors.textSecondary,
      textAlign: 'center',
      lineHeight: 22,
      marginBottom: spacing.xl,
    },
    successBtn: {
      marginTop: spacing.md,
    },
  });

export default ChangePasswordScreen;
