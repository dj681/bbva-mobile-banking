import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Vibration,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RouteProp } from '@react-navigation/native';

import { useAppDispatch, useAppSelector } from '@/store';
import { setPin, setAuthError } from '@/store/slices';
import { useAuth } from '@/hooks/useAuth';
import { useTheme } from '@/hooks/useTheme';
import type { AuthStackParamList } from '@/types';

type PinNavProp = NativeStackNavigationProp<AuthStackParamList>;
type PinEntryRouteProp = RouteProp<AuthStackParamList, 'PinEntry'>;
type PinSetupRouteProp = RouteProp<AuthStackParamList, 'PinSetup'>;

const PIN_LENGTH = 6;

const PAD_KEYS = [
  '1', '2', '3',
  '4', '5', '6',
  '7', '8', '9',
  'bio', '0', 'del',
];

type PinMode = 'setup' | 'login' | 'transaction' | 'settings';

const PinScreen: React.FC = () => {
  const navigation = useNavigation<PinNavProp>();
  const route = useRoute<PinEntryRouteProp | PinSetupRouteProp>();
  const dispatch = useAppDispatch();
  const { colors } = useTheme();
  const { verifyPin, biometricLogin, isBiometricEnabled, checkBiometricAvailability } = useAuth();

  const error = useAppSelector((state) => state.auth.error);

  // Determine mode from route name
  const mode: PinMode =
    route.name === 'PinSetup'
      ? 'setup'
      : ((route as PinEntryRouteProp).params?.purpose ?? 'login');

  const [pin, setPinValue] = useState('');
  const [confirmPin, setConfirmPin] = useState('');
  const [isConfirmStep, setIsConfirmStep] = useState(false);
  const [biometricAvailable, setBiometricAvailable] = useState(false);
  const [attempts, setAttempts] = useState(0);

  const shakeAnim = useRef(new Animated.Value(0)).current;
  const dotScale = useRef(Array.from({ length: PIN_LENGTH }, () => new Animated.Value(1))).current;
  const successOpacity = useRef(new Animated.Value(0)).current;
  const headerOpacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(headerOpacity, { toValue: 1, duration: 500, useNativeDriver: true }).start();
    checkBiometricAvailability().then(setBiometricAvailable);
  }, [checkBiometricAvailability, headerOpacity]);

  const shake = useCallback(() => {
    if (Platform.OS !== 'web') {
      Vibration.vibrate(300);
    }
    Animated.sequence([
      Animated.timing(shakeAnim, { toValue: 14, duration: 70, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: -14, duration: 70, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: 10, duration: 60, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: -10, duration: 60, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: 0, duration: 60, useNativeDriver: true }),
    ]).start();
  }, [shakeAnim]);

  const animateDot = useCallback(
    (index: number) => {
      Animated.sequence([
        Animated.spring(dotScale[index], {
          toValue: 1.4,
          tension: 200,
          friction: 5,
          useNativeDriver: true,
        }),
        Animated.spring(dotScale[index], {
          toValue: 1,
          tension: 200,
          friction: 8,
          useNativeDriver: true,
        }),
      ]).start();
    },
    [dotScale],
  );

  const handleSuccess = useCallback(() => {
    Animated.timing(successOpacity, { toValue: 1, duration: 300, useNativeDriver: true }).start();
  }, [successOpacity]);

  const processPin = useCallback(
    async (currentPin: string) => {
      if (mode === 'setup') {
        if (!isConfirmStep) {
          // First entry — move to confirm
          setIsConfirmStep(true);
          setConfirmPin(currentPin);
          setPinValue('');
          dispatch(setAuthError(null));
        } else {
          // Second entry — confirm match
          if (currentPin === confirmPin) {
            dispatch(setPin(currentPin));
            handleSuccess();
            setTimeout(() => navigation.navigate('Login'), 1000);
          } else {
            shake();
            setAttempts((a) => a + 1);
            dispatch(setAuthError('Los códigos PIN no coinciden. Por favor, inténtelo de nuevo.'));
            setPinValue('');
            setIsConfirmStep(false);
            setConfirmPin('');
          }
        }
      } else {
        // Verify mode: login, transaction, settings
        const valid = verifyPin(currentPin);
        if (valid) {
          dispatch(setAuthError(null));
          handleSuccess();
          setTimeout(() => {
            if (mode === 'login') {
              navigation.navigate('Login');
            } else {
              navigation.goBack();
            }
          }, 800);
        } else {
          shake();
          const newAttempts = attempts + 1;
          setAttempts(newAttempts);
          const remaining = 5 - newAttempts;
          if (remaining <= 0) {
            dispatch(setAuthError('Demasiados intentos incorrectos. Por favor, contacte con el soporte.'));
          } else {
            dispatch(setAuthError(`Código PIN incorrecto. Quedan ${remaining} intento${remaining !== 1 ? 's' : ''}.`));
          }
          setPinValue('');
        }
      }
    },
    [mode, isConfirmStep, confirmPin, verifyPin, attempts, dispatch, handleSuccess, shake, navigation],
  );

  const handleKeyPress = useCallback(
    (key: string) => {
      if (key === 'del') {
        if (pin.length > 0) {
          setPinValue((p) => p.slice(0, -1));
          dispatch(setAuthError(null));
        }
        return;
      }

      if (key === 'bio') {
        biometricLogin();
        return;
      }

      if (pin.length >= PIN_LENGTH) return;

      const newPin = pin + key;
      setPinValue(newPin);
      animateDot(newPin.length - 1);

      if (newPin.length === PIN_LENGTH) {
        // Small delay so user can see last dot fill
        setTimeout(() => processPin(newPin), 150);
      }
    },
    [pin, animateDot, processPin, dispatch, biometricLogin],
  );

  const titleText = () => {
    if (mode === 'setup') {
      return isConfirmStep ? 'Confirme su\ncódigo PIN' : 'Cree su\ncódigo PIN';
    }
    if (mode === 'transaction') return 'Confirme la\ntransacción';
    if (mode === 'settings') return 'Confirme su\nidentidad';
    return 'Introduzca su\ncódigo PIN';
  };

  const subtitleText = () => {
    if (mode === 'setup') {
      return isConfirmStep
        ? `Vuelva a introducir los ${PIN_LENGTH} dígitos para confirmar`
        : `Elija ${PIN_LENGTH} dígitos para su código PIN`;
    }
    return 'Introduzca su código PIN para continuar';
  };

  const purposeIcon = () => {
    if (mode === 'transaction') return 'swap-horizontal-outline';
    if (mode === 'setup') return 'keypad-outline';
    if (mode === 'settings') return 'settings-outline';
    return 'lock-closed-outline';
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Back button */}
      <TouchableOpacity
        style={[styles.backButton, { backgroundColor: colors.surfaceVariant }]}
        onPress={() => navigation.goBack()}
      >
        <Ionicons name="arrow-back" size={22} color={colors.text} />
      </TouchableOpacity>

      {/* Header */}
      <Animated.View style={[styles.header, { opacity: headerOpacity }]}>
        <View style={[styles.purposeIcon, { backgroundColor: `${colors.primary}15` }]}>
          <Ionicons name={purposeIcon() as any} size={36} color={colors.primary} />
        </View>

        <Text style={[styles.title, { color: colors.text }]}>{titleText()}</Text>
        <Text style={[styles.subtitle, { color: colors.textSecondary }]}>{subtitleText()}</Text>

        {/* Setup progress indicator */}
        {mode === 'setup' && (
          <View style={styles.stepsRow}>
            <View style={[styles.step, { backgroundColor: colors.secondary }]} />
            <View
              style={[
                styles.step,
                { backgroundColor: isConfirmStep ? colors.secondary : colors.border },
              ]}
            />
          </View>
        )}
      </Animated.View>

      {/* PIN dots */}
      <Animated.View
        style={[styles.dotsRow, { transform: [{ translateX: shakeAnim }] }]}
      >
        {Array.from({ length: PIN_LENGTH }).map((_, i) => {
          const filled = i < pin.length;
          return (
            <Animated.View
              key={i}
              style={[
                styles.dot,
                {
                  backgroundColor: filled ? colors.primary : 'transparent',
                  borderColor: filled ? colors.primary : colors.border,
                  transform: [{ scale: dotScale[i] }],
                },
              ]}
            />
          );
        })}
      </Animated.View>

      {/* Error message */}
      {error ? (
        <View
          style={[
            styles.errorBox,
            { backgroundColor: `${colors.error}10`, borderColor: colors.error },
          ]}
        >
          <Ionicons name="alert-circle-outline" size={15} color={colors.error} />
          <Text style={[styles.errorText, { color: colors.error }]}>{error}</Text>
        </View>
      ) : (
        <View style={styles.errorPlaceholder} />
      )}

      {/* Numeric keypad */}
      <View style={styles.keypad}>
        {PAD_KEYS.map((key) => {
          if (key === 'bio') {
            if (!biometricAvailable || !isBiometricEnabled || mode === 'setup') {
              return <View key={key} style={styles.keyEmpty} />;
            }
            return (
              <TouchableOpacity
                key={key}
                style={[styles.keySpecial, { backgroundColor: colors.surfaceVariant }]}
                onPress={() => handleKeyPress(key)}
                activeOpacity={0.7}
              >
                <Ionicons name="finger-print-outline" size={26} color={colors.primary} />
              </TouchableOpacity>
            );
          }

          if (key === 'del') {
            return (
              <TouchableOpacity
                key={key}
                style={[styles.keySpecial, { backgroundColor: colors.surfaceVariant }]}
                onPress={() => handleKeyPress(key)}
                activeOpacity={0.7}
              >
                <Ionicons name="backspace-outline" size={24} color={colors.text} />
              </TouchableOpacity>
            );
          }

          return (
            <TouchableOpacity
              key={key}
              style={[styles.keyNumber, { backgroundColor: colors.surface }]}
              onPress={() => handleKeyPress(key)}
              activeOpacity={0.7}
            >
              <Text style={[styles.keyText, { color: colors.text }]}>{key}</Text>
              {/* Sub-letters for dial-pad feel */}
              {keySubText[key] ? (
                <Text style={[styles.keySubText, { color: colors.textDisabled }]}>
                  {keySubText[key]}
                </Text>
              ) : null}
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Bottom actions */}
      <View style={styles.bottomActions}>
        {mode !== 'setup' && (
          <TouchableOpacity
            onPress={() => navigation.navigate('Login')}
            style={styles.cancelLink}
          >
            <Text style={[styles.cancelText, { color: colors.textSecondary }]}>Cancelar</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};

const keySubText: Record<string, string> = {
  '2': 'ABC',
  '3': 'DEF',
  '4': 'GHI',
  '5': 'JKL',
  '6': 'MNO',
  '7': 'PQRS',
  '8': 'TUV',
  '9': 'WXYZ',
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 56,
    alignItems: 'center',
  },
  backButton: {
    position: 'absolute',
    top: 56,
    left: 24,
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
  },
  header: {
    alignItems: 'center',
    paddingHorizontal: 32,
    paddingTop: 32,
    marginBottom: 32,
  },
  purposeIcon: {
    width: 76,
    height: 76,
    borderRadius: 38,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 8,
    lineHeight: 32,
    fontFamily: 'Roboto-Bold',
  },
  subtitle: {
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
    fontFamily: 'Roboto-Regular',
  },
  stepsRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 16,
  },
  step: {
    width: 32,
    height: 4,
    borderRadius: 2,
  },
  dotsRow: {
    flexDirection: 'row',
    gap: 14,
    marginBottom: 16,
  },
  dot: {
    width: 16,
    height: 16,
    borderRadius: 8,
    borderWidth: 2,
  },
  errorBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 1,
    marginHorizontal: 32,
    marginBottom: 12,
  },
  errorText: {
    flex: 1,
    fontSize: 13,
    fontFamily: 'Roboto-Regular',
  },
  errorPlaceholder: {
    height: 38,
    marginBottom: 12,
  },
  keypad: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 12,
    paddingHorizontal: 32,
    maxWidth: 320,
  },
  keyNumber: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 3,
    elevation: 2,
  },
  keySpecial: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  keyEmpty: {
    width: 80,
    height: 80,
  },
  keyText: {
    fontSize: 26,
    fontWeight: '500',
    fontFamily: 'Roboto-Medium',
  },
  keySubText: {
    fontSize: 10,
    letterSpacing: 1,
    marginTop: 1,
    fontFamily: 'Roboto-Regular',
  },
  bottomActions: {
    marginTop: 20,
    alignItems: 'center',
  },
  cancelLink: {
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  cancelText: {
    fontSize: 14,
    fontFamily: 'Roboto-Regular',
  },
});

export default PinScreen;
