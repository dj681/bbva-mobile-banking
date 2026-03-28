import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  Animated,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RouteProp } from '@react-navigation/native';

import { useAppDispatch, useAppSelector } from '@/store';
import { verifyTwoFactor, setAuthError } from '@/store/slices';
import { useTheme } from '@/hooks/useTheme';
import type { AuthStackParamList } from '@/types';

type TwoFactorNavProp = NativeStackNavigationProp<AuthStackParamList, 'TwoFactor'>;
type TwoFactorRouteProp = RouteProp<AuthStackParamList, 'TwoFactor'>;

const CODE_LENGTH = 6;
const COUNTDOWN_SECONDS = 120;

const TwoFactorScreen: React.FC = () => {
  const navigation = useNavigation<TwoFactorNavProp>();
  const route = useRoute<TwoFactorRouteProp>();
  const dispatch = useAppDispatch();
  const { colors } = useTheme();

  const { method, maskedContact } = route.params;

  const isLoading = useAppSelector((state) => state.auth.isLoading);
  const error = useAppSelector((state) => state.auth.error);
  const token = useAppSelector((state) => state.auth.token);

  const [code, setCode] = useState<string[]>(Array(CODE_LENGTH).fill(''));
  const [countdown, setCountdown] = useState(COUNTDOWN_SECONDS);
  const [canResend, setCanResend] = useState(false);

  const inputRefs = useRef<Array<TextInput | null>>(Array(CODE_LENGTH).fill(null));
  const shakeAnim = useRef(new Animated.Value(0)).current;
  const errorOpacity = useRef(new Animated.Value(0)).current;

  // Countdown timer
  useEffect(() => {
    if (countdown <= 0) {
      setCanResend(true);
      return;
    }
    const interval = setInterval(() => {
      setCountdown((c) => {
        if (c <= 1) {
          setCanResend(true);
          return 0;
        }
        return c - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [countdown]);

  // Focus first input on mount
  useEffect(() => {
    const t = setTimeout(() => inputRefs.current[0]?.focus(), 400);
    return () => clearTimeout(t);
  }, []);

  // Error animation
  useEffect(() => {
    if (error) {
      Animated.parallel([
        Animated.timing(errorOpacity, { toValue: 1, duration: 200, useNativeDriver: true }),
        Animated.sequence([
          Animated.timing(shakeAnim, { toValue: 12, duration: 70, useNativeDriver: true }),
          Animated.timing(shakeAnim, { toValue: -12, duration: 70, useNativeDriver: true }),
          Animated.timing(shakeAnim, { toValue: 8, duration: 60, useNativeDriver: true }),
          Animated.timing(shakeAnim, { toValue: -8, duration: 60, useNativeDriver: true }),
          Animated.timing(shakeAnim, { toValue: 0, duration: 60, useNativeDriver: true }),
        ]),
      ]).start();
    }
  }, [error, errorOpacity, shakeAnim]);

  const handleCodeChange = useCallback(
    (text: string, index: number) => {
      const digit = text.replace(/[^0-9]/g, '').slice(-1);
      const newCode = [...code];
      newCode[index] = digit;
      setCode(newCode);
      dispatch(setAuthError(null));

      if (digit && index < CODE_LENGTH - 1) {
        inputRefs.current[index + 1]?.focus();
      }

      // Auto-verify when all digits filled
      if (digit && newCode.filter(Boolean).length === CODE_LENGTH) {
        const fullCode = newCode.join('');
        handleVerify(fullCode);
      }
    },
    [code, dispatch],
  );

  const handleKeyPress = useCallback(
    (key: string, index: number) => {
      if (key === 'Backspace') {
        const newCode = [...code];
        if (newCode[index]) {
          newCode[index] = '';
          setCode(newCode);
        } else if (index > 0) {
          newCode[index - 1] = '';
          setCode(newCode);
          inputRefs.current[index - 1]?.focus();
        }
      }
    },
    [code],
  );

  const handleVerify = useCallback(
    async (codeStr?: string) => {
      const fullCode = codeStr ?? code.join('');
      if (fullCode.length < CODE_LENGTH) {
        dispatch(setAuthError('Veuillez saisir le code à 6 chiffres complet.'));
        return;
      }
      dispatch(setAuthError(null));
      await dispatch(verifyTwoFactor({ code: fullCode, token: token ?? '' }));
    },
    [code, token, dispatch],
  );

  const handleResend = useCallback(() => {
    setCode(Array(CODE_LENGTH).fill(''));
    setCountdown(COUNTDOWN_SECONDS);
    setCanResend(false);
    dispatch(setAuthError(null));
    inputRefs.current[0]?.focus();
    // In a real app, trigger resend API call here
  }, [dispatch]);

  const formatCountdown = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  const methodLabel = method === 'sms' ? 'SMS' : 'e-mail';
  const methodIcon = method === 'sms' ? 'phone-portrait-outline' : 'mail-outline';

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
        {/* Back button */}
        <TouchableOpacity
          style={[styles.backButton, { backgroundColor: colors.surfaceVariant }]}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={22} color={colors.text} />
        </TouchableOpacity>

        {/* Icon */}
        <View style={[styles.iconCircle, { backgroundColor: `${colors.secondary}18` }]}>
          <Ionicons name="shield-checkmark-outline" size={48} color={colors.secondary} />
        </View>

        <Text style={[styles.title, { color: colors.text }]}>Vérification en deux étapes</Text>
        <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
          Un code de vérification a été envoyé par{' '}
          <Text style={{ fontWeight: '600' }}>{methodLabel}</Text> au
        </Text>

        {/* Masked contact */}
        <View style={[styles.contactBadge, { backgroundColor: colors.surfaceVariant }]}>
          <Ionicons name={methodIcon as any} size={16} color={colors.secondary} />
          <Text style={[styles.contactText, { color: colors.text }]}>{maskedContact}</Text>
        </View>

        {/* OTP Inputs */}
        <Animated.View
          style={[styles.otpContainer, { transform: [{ translateX: shakeAnim }] }]}
        >
          {code.map((digit, i) => (
            <TextInput
              key={i}
              ref={(ref) => { inputRefs.current[i] = ref; }}
              style={[
                styles.otpCell,
                {
                  backgroundColor: colors.inputBackground,
                  borderColor: digit ? colors.secondary : colors.inputBorder,
                  color: colors.text,
                  borderWidth: digit ? 2 : 1.5,
                },
              ]}
              value={digit}
              onChangeText={(t) => handleCodeChange(t, i)}
              onKeyPress={({ nativeEvent }) => handleKeyPress(nativeEvent.key, i)}
              keyboardType="number-pad"
              maxLength={1}
              selectTextOnFocus
              textAlign="center"
              caretHidden
            />
          ))}
        </Animated.View>

        {/* Error */}
        <Animated.View style={[styles.errorBox, { opacity: errorOpacity }]}>
          {error ? (
            <View style={[styles.errorInner, { backgroundColor: `${colors.error}12`, borderColor: colors.error }]}>
              <Ionicons name="alert-circle-outline" size={15} color={colors.error} />
              <Text style={[styles.errorText, { color: colors.error }]}>{error}</Text>
            </View>
          ) : null}
        </Animated.View>

        {/* Countdown / Resend */}
        <View style={styles.resendRow}>
          {!canResend ? (
            <View style={styles.countdownRow}>
              <Ionicons name="time-outline" size={16} color={colors.textSecondary} />
              <Text style={[styles.countdownText, { color: colors.textSecondary }]}>
                Nouveau code disponible dans{' '}
                <Text style={{ color: colors.secondary, fontWeight: '700' }}>
                  {formatCountdown(countdown)}
                </Text>
              </Text>
            </View>
          ) : (
            <TouchableOpacity onPress={handleResend} style={styles.resendButton}>
              <Ionicons name="refresh-outline" size={16} color={colors.secondary} />
              <Text style={[styles.resendText, { color: colors.secondary }]}>
                Renvoyer le code
              </Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Verify button */}
        <TouchableOpacity
          style={[
            styles.verifyButton,
            {
              backgroundColor:
                code.filter(Boolean).length === CODE_LENGTH && !isLoading
                  ? colors.primary
                  : colors.textDisabled,
            },
          ]}
          onPress={() => handleVerify()}
          disabled={code.filter(Boolean).length < CODE_LENGTH || isLoading}
          activeOpacity={0.85}
        >
          {isLoading ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <>
              <Text style={styles.verifyButtonText}>Vérifier</Text>
              <Ionicons name="checkmark-circle-outline" size={20} color="#FFFFFF" />
            </>
          )}
        </TouchableOpacity>

        <Text style={[styles.helpText, { color: colors.textSecondary }]}>
          Vous n'avez pas reçu le code ? Vérifiez vos {methodLabel === 'SMS' ? 'messages' : 'courriers indésirables'}.
        </Text>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

import { ActivityIndicator } from 'react-native';

const styles = StyleSheet.create({
  flex: {
    flex: 1,
  },
  scroll: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingTop: 56,
    paddingBottom: 40,
    alignItems: 'center',
  },
  backButton: {
    alignSelf: 'flex-start',
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 32,
  },
  iconCircle: {
    width: 96,
    height: 96,
    borderRadius: 48,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 12,
    fontFamily: 'Roboto_700Bold',
  },
  subtitle: {
    fontSize: 15,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 16,
    fontFamily: 'Roboto_400Regular',
  },
  contactBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    marginBottom: 32,
  },
  contactText: {
    fontSize: 15,
    fontWeight: '600',
    fontFamily: 'Roboto_500Medium',
  },
  otpContainer: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 16,
  },
  otpCell: {
    width: 48,
    height: 58,
    borderRadius: 10,
    fontSize: 22,
    fontWeight: '700',
    fontFamily: 'Roboto_700Bold',
  },
  errorBox: {
    width: '100%',
    marginBottom: 8,
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
    fontFamily: 'Roboto_400Regular',
  },
  resendRow: {
    marginBottom: 28,
    alignItems: 'center',
  },
  countdownRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  countdownText: {
    fontSize: 13,
    fontFamily: 'Roboto_400Regular',
  },
  resendButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    padding: 8,
  },
  resendText: {
    fontSize: 14,
    fontWeight: '600',
    fontFamily: 'Roboto_500Medium',
  },
  verifyButton: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 12,
    gap: 8,
    marginBottom: 16,
  },
  verifyButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
    fontFamily: 'Roboto_700Bold',
  },
  helpText: {
    fontSize: 13,
    textAlign: 'center',
    lineHeight: 20,
    fontFamily: 'Roboto_400Regular',
    paddingHorizontal: 16,
  },
});

export default TwoFactorScreen;
