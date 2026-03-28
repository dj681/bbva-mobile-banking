import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Animated,
  Switch,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { useAppDispatch } from '@/store';
import { setAuthError } from '@/store/slices';
import { useAuth } from '@/hooks/useAuth';
import { useTheme } from '@/hooks/useTheme';
import type { AuthStackParamList } from '@/types';

type LoginNavProp = NativeStackNavigationProp<AuthStackParamList, 'Login'>;

const LoginScreen: React.FC = () => {
  const navigation = useNavigation<LoginNavProp>();
  const dispatch = useAppDispatch();
  const { colors } = useTheme();
  const {
    login,
    biometricLogin,
    checkBiometricAvailability,
    isLoading,
    error,
    twoFactorPending,
    isBiometricEnabled,
  } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [biometricAvailable, setBiometricAvailable] = useState(false);

  const errorOpacity = useRef(new Animated.Value(0)).current;
  const shakeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    checkBiometricAvailability().then(setBiometricAvailable);
  }, [checkBiometricAvailability]);

  useEffect(() => {
    if (twoFactorPending) {
      navigation.navigate('TwoFactor', {
        method: 'sms',
        maskedContact: '+33 ** ** ** 42',
      });
    }
  }, [twoFactorPending, navigation]);

  useEffect(() => {
    if (error) {
      Animated.sequence([
        Animated.timing(errorOpacity, { toValue: 1, duration: 200, useNativeDriver: true }),
        Animated.sequence([
          Animated.timing(shakeAnim, { toValue: 10, duration: 80, useNativeDriver: true }),
          Animated.timing(shakeAnim, { toValue: -10, duration: 80, useNativeDriver: true }),
          Animated.timing(shakeAnim, { toValue: 6, duration: 60, useNativeDriver: true }),
          Animated.timing(shakeAnim, { toValue: -6, duration: 60, useNativeDriver: true }),
          Animated.timing(shakeAnim, { toValue: 0, duration: 60, useNativeDriver: true }),
        ]),
      ]).start();
    } else {
      Animated.timing(errorOpacity, { toValue: 0, duration: 200, useNativeDriver: true }).start();
    }
  }, [error, errorOpacity, shakeAnim]);

  const handleLogin = useCallback(async () => {
    dispatch(setAuthError(null));
    if (!email.trim() || !password.trim()) {
      dispatch(setAuthError('Veuillez saisir votre e-mail et votre mot de passe.'));
      return;
    }
    await login(email.trim(), password);
  }, [email, password, login, dispatch]);

  const handleBiometric = useCallback(async () => {
    dispatch(setAuthError(null));
    await biometricLogin();
  }, [biometricLogin, dispatch]);

  const [emailFocused, setEmailFocused] = useState(false);
  const [passFocused, setPassFocused] = useState(false);

  return (
    <KeyboardAvoidingView
      style={[styles.flex, { backgroundColor: colors.background }]}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView
        contentContainerStyle={styles.scroll}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={[styles.header, { backgroundColor: colors.primary }]}>
          <View style={styles.logoWrapper}>
            <Text style={styles.logoText}>BBVA</Text>
          </View>
          <Text style={styles.headerTitle}>Bienvenue</Text>
          <Text style={styles.headerSubtitle}>Connectez-vous à votre espace bancaire</Text>
        </View>

        {/* Form */}
        <Animated.View
          style={[
            styles.form,
            { backgroundColor: colors.surface, transform: [{ translateX: shakeAnim }] },
          ]}
        >
          {/* Error */}
          <Animated.View style={[styles.errorBox, { opacity: errorOpacity }]}>
            {error ? (
              <View
                style={[styles.errorInner, { backgroundColor: `${colors.error}15`, borderColor: colors.error }]}
              >
                <Ionicons name="alert-circle" size={16} color={colors.error} />
                <Text style={[styles.errorText, { color: colors.error }]}>{error}</Text>
              </View>
            ) : null}
          </Animated.View>

          {/* Email */}
          <View style={styles.fieldGroup}>
            <Text style={[styles.label, { color: colors.text }]}>Adresse e-mail</Text>
            <View
              style={[
                styles.inputRow,
                { backgroundColor: colors.inputBackground, borderColor: emailFocused ? colors.borderFocus : colors.inputBorder },
              ]}
            >
              <Ionicons name="mail-outline" size={20} color={emailFocused ? colors.secondary : colors.icon} />
              <TextInput
                style={[styles.textInput, { color: colors.text }]}
                value={email}
                onChangeText={setEmail}
                onFocus={() => setEmailFocused(true)}
                onBlur={() => setEmailFocused(false)}
                placeholder="exemple@bbva.fr"
                placeholderTextColor={colors.placeholder}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
                returnKeyType="next"
                textContentType="emailAddress"
                autoComplete="email"
              />
            </View>
          </View>

          {/* Password */}
          <View style={styles.fieldGroup}>
            <Text style={[styles.label, { color: colors.text }]}>Mot de passe</Text>
            <View
              style={[
                styles.inputRow,
                { backgroundColor: colors.inputBackground, borderColor: passFocused ? colors.borderFocus : colors.inputBorder },
              ]}
            >
              <Ionicons name="lock-closed-outline" size={20} color={passFocused ? colors.secondary : colors.icon} />
              <TextInput
                style={[styles.textInput, { color: colors.text }]}
                value={password}
                onChangeText={setPassword}
                onFocus={() => setPassFocused(true)}
                onBlur={() => setPassFocused(false)}
                placeholder="Votre mot de passe"
                placeholderTextColor={colors.placeholder}
                secureTextEntry={!showPassword}
                returnKeyType="done"
                onSubmitEditing={handleLogin}
                textContentType="password"
                autoComplete="current-password"
              />
              <TouchableOpacity onPress={() => setShowPassword((v) => !v)} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
                <Ionicons
                  name={showPassword ? 'eye-off-outline' : 'eye-outline'}
                  size={20}
                  color={colors.icon}
                />
              </TouchableOpacity>
            </View>
          </View>

          {/* Remember me + Forgot password */}
          <View style={styles.rowBetween}>
            <View style={styles.rememberRow}>
              <Switch
                value={rememberMe}
                onValueChange={setRememberMe}
                trackColor={{ false: colors.border, true: colors.secondary }}
                thumbColor={rememberMe ? colors.primary : colors.surface}
              />
              <Text style={[styles.rememberText, { color: colors.textSecondary }]}>
                Se souvenir de moi
              </Text>
            </View>
            <TouchableOpacity onPress={() => {}}>
              <Text style={[styles.forgotText, { color: colors.secondary }]}>
                Mot de passe oublié ?
              </Text>
            </TouchableOpacity>
          </View>

          {/* Login button */}
          <TouchableOpacity
            style={[
              styles.loginButton,
              { backgroundColor: isLoading ? colors.textDisabled : colors.primary },
            ]}
            onPress={handleLogin}
            disabled={isLoading}
            activeOpacity={0.85}
          >
            {isLoading ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <>
                <Text style={styles.loginButtonText}>Se connecter</Text>
                <Ionicons name="arrow-forward" size={20} color="#FFFFFF" />
              </>
            )}
          </TouchableOpacity>

          {/* Biometric */}
          {biometricAvailable && isBiometricEnabled && (
            <TouchableOpacity
              style={[styles.biometricButton, { borderColor: colors.border }]}
              onPress={handleBiometric}
              activeOpacity={0.8}
            >
              <Ionicons name="finger-print-outline" size={24} color={colors.primary} />
              <Text style={[styles.biometricText, { color: colors.primary }]}>
                Connexion biométrique
              </Text>
            </TouchableOpacity>
          )}

          {/* Demo hint */}
          <View style={[styles.demoHint, { backgroundColor: `${colors.info}12`, borderColor: `${colors.info}30` }]}>
            <Ionicons name="information-circle-outline" size={16} color={colors.info} />
            <Text style={[styles.demoText, { color: colors.textSecondary }]}>
              Démo : saisissez n'importe quel e-mail et mot de passe
            </Text>
          </View>
        </Animated.View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={[styles.footerText, { color: colors.textSecondary }]}>
            © 2024 BBVA — Tous droits réservés
          </Text>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

// Inline TextInput import to avoid circular import issues
import { TextInput, ActivityIndicator } from 'react-native';

const styles = StyleSheet.create({
  flex: {
    flex: 1,
  },
  scroll: {
    flexGrow: 1,
  },
  header: {
    paddingTop: 64,
    paddingBottom: 40,
    paddingHorizontal: 24,
    alignItems: 'center',
  },
  logoWrapper: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.4)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  logoText: {
    fontSize: 26,
    fontWeight: '900',
    color: '#FFFFFF',
    letterSpacing: 3,
    fontFamily: 'Roboto-Black',
  },
  headerTitle: {
    fontSize: 26,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 6,
    fontFamily: 'Roboto-Bold',
  },
  headerSubtitle: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.8)',
    textAlign: 'center',
    fontFamily: 'Roboto-Regular',
  },
  form: {
    marginHorizontal: 16,
    marginTop: -20,
    borderRadius: 16,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 5,
  },
  errorBox: {
    marginBottom: 8,
    overflow: 'hidden',
  },
  errorInner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
  },
  errorText: {
    flex: 1,
    fontSize: 13,
    fontFamily: 'Roboto-Regular',
  },
  fieldGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 8,
    fontFamily: 'Roboto-Medium',
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1.5,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    gap: 10,
  },
  textInput: {
    flex: 1,
    fontSize: 15,
    fontFamily: 'Roboto-Regular',
    padding: 0,
  },
  rowBetween: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  rememberRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  rememberText: {
    fontSize: 13,
    fontFamily: 'Roboto-Regular',
  },
  forgotText: {
    fontSize: 13,
    fontWeight: '600',
    fontFamily: 'Roboto-Medium',
  },
  loginButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 12,
    gap: 8,
    marginBottom: 12,
  },
  loginButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
    fontFamily: 'Roboto-Bold',
  },
  biometricButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 12,
    borderWidth: 1.5,
    gap: 8,
    marginBottom: 16,
  },
  biometricText: {
    fontSize: 15,
    fontWeight: '600',
    fontFamily: 'Roboto-Medium',
  },
  demoHint: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
  },
  demoText: {
    flex: 1,
    fontSize: 12,
    fontFamily: 'Roboto-Regular',
  },
  footer: {
    padding: 24,
    alignItems: 'center',
  },
  footerText: {
    fontSize: 11,
    fontFamily: 'Roboto-Regular',
  },
});

export default LoginScreen;
