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
  Modal,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { useAppDispatch, useAppSelector } from '@/store';
import { setAuthError, setLanguage } from '@/store/slices';
import { useAuth } from '@/hooks/useAuth';
import { useTheme } from '@/hooks/useTheme';
import { useTranslation } from '@/hooks/useTranslation';
import type { AuthStackParamList } from '@/types';

interface LangOption {
  code: string;
  nativeName: string;
  flag: string;
}

const LOGIN_LANGUAGES: LangOption[] = [
  { code: 'en', nativeName: 'English', flag: '🇬🇧' },
  { code: 'es', nativeName: 'Español', flag: '🇪🇸' },
  { code: 'fi', nativeName: 'Suomi', flag: '🇫🇮' },
  { code: 'de', nativeName: 'Deutsch', flag: '🇩🇪' },
  { code: 'no', nativeName: 'Norsk', flag: '🇳🇴' },
  { code: 'it', nativeName: 'Italiano', flag: '🇮🇹' },
  { code: 'pt', nativeName: 'Português', flag: '🇵🇹' },
  { code: 'el', nativeName: 'Ελληνικά', flag: '🇬🇷' },
  { code: 'sk', nativeName: 'Slovenčina', flag: '🇸🇰' },
];

type LoginNavProp = NativeStackNavigationProp<AuthStackParamList, 'Login'>;

const LoginScreen: React.FC = () => {
  const navigation = useNavigation<LoginNavProp>();
  const dispatch = useAppDispatch();
  const { colors } = useTheme();
  const { t } = useTranslation();
  const currentLanguage = useAppSelector((s) => s.ui.language);
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
  const [langPickerVisible, setLangPickerVisible] = useState(false);

  const currentLangOption = LOGIN_LANGUAGES.find((l) => l.code === currentLanguage);

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
      dispatch(setAuthError(t('errorEmptyFields')));
      return;
    }
    await login(email.trim(), password);
  }, [email, password, login, dispatch, t]);

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
      {/* Language Picker Modal */}
      <Modal
        visible={langPickerVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setLangPickerVisible(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setLangPickerVisible(false)}
        >
          <View style={[styles.langPickerContainer, { backgroundColor: colors.surface }]}>
            <Text style={[styles.langPickerTitle, { color: colors.text }]}>
              {t('selectLanguage')}
            </Text>
            {LOGIN_LANGUAGES.map((lang) => (
              <TouchableOpacity
                key={lang.code}
                style={[
                  styles.langPickerRow,
                  currentLanguage === lang.code && { backgroundColor: colors.inputBackground },
                ]}
                onPress={() => {
                  dispatch(setLanguage(lang.code));
                  setLangPickerVisible(false);
                }}
                activeOpacity={0.7}
              >
                <Text style={styles.langPickerFlag}>{lang.flag}</Text>
                <Text style={[styles.langPickerName, { color: colors.text }]}>{lang.nativeName}</Text>
                {currentLanguage === lang.code && (
                  <Ionicons name="checkmark" size={18} color={colors.primary} />
                )}
              </TouchableOpacity>
            ))}
          </View>
        </TouchableOpacity>
      </Modal>

      <ScrollView
        contentContainerStyle={styles.scroll}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={[styles.header, { backgroundColor: colors.primary }]}>
          {/* Language picker button – top right */}
          <TouchableOpacity
            style={styles.langButton}
            onPress={() => setLangPickerVisible(true)}
            activeOpacity={0.8}
          >
            <Text style={styles.langButtonFlag}>{currentLangOption?.flag ?? '🌐'}</Text>
            <Text style={styles.langButtonCode}>{currentLanguage.toUpperCase()}</Text>
          </TouchableOpacity>

          <View style={styles.logoWrapper}>
            <Text style={styles.logoText}>BBVA</Text>
          </View>
          <Text style={styles.headerTitle}>{t('welcome')}</Text>
          <Text style={styles.headerSubtitle}>{t('welcomeSubtitle')}</Text>
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
            <Text style={[styles.label, { color: colors.text }]}>{t('email')}</Text>
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
                placeholder={t('emailPlaceholder')}
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
            <Text style={[styles.label, { color: colors.text }]}>{t('password')}</Text>
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
                placeholder={t('passwordPlaceholder')}
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
                {t('rememberMe')}
              </Text>
            </View>
            <TouchableOpacity onPress={() => {}}>
              <Text style={[styles.forgotText, { color: colors.secondary }]}>
                {t('forgotPassword')}
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
                <Text style={styles.loginButtonText}>{t('signIn')}</Text>
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
                {t('biometricAccess')}
              </Text>
            </TouchableOpacity>
          )}

        </Animated.View>

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
  langButton: {
    position: 'absolute',
    top: 16,
    right: 16,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 20,
    gap: 4,
    zIndex: 10,
  },
  langButtonFlag: {
    fontSize: 16,
  },
  langButtonCode: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
    fontFamily: 'Roboto-Bold',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.45)',
    justifyContent: 'flex-start',
    alignItems: 'flex-end',
    paddingTop: 80,
    paddingRight: 16,
  },
  langPickerContainer: {
    borderRadius: 14,
    paddingVertical: 8,
    minWidth: 200,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
  },
  langPickerTitle: {
    fontSize: 11,
    fontFamily: 'Roboto-Medium',
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    paddingHorizontal: 16,
    paddingVertical: 8,
    opacity: 0.6,
  },
  langPickerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    gap: 10,
  },
  langPickerFlag: {
    fontSize: 22,
  },
  langPickerName: {
    flex: 1,
    fontSize: 15,
    fontFamily: 'Roboto-Regular',
  },
});

export default LoginScreen;
