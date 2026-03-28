import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as LocalAuthentication from 'expo-local-authentication';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { useAppDispatch, useAppSelector } from '@/store';
import { biometricLogin, setAuthError } from '@/store/slices';
import { useTheme } from '@/hooks/useTheme';
import type { AuthStackParamList } from '@/types';

type BiometricNavProp = NativeStackNavigationProp<AuthStackParamList, 'Biometric'>;

type BiometricType = 'fingerprint' | 'face' | 'iris' | 'unknown';

const BiometricScreen: React.FC = () => {
  const navigation = useNavigation<BiometricNavProp>();
  const dispatch = useAppDispatch();
  const { colors } = useTheme();

  const error = useAppSelector((state) => state.auth.error);
  const isLoading = useAppSelector((state) => state.auth.isLoading);

  const [biometricType, setBiometricType] = useState<BiometricType>('unknown');
  const [authStatus, setAuthStatus] = useState<'idle' | 'scanning' | 'success' | 'failed'>('idle');

  const pulseAnim = useRef(new Animated.Value(1)).current;
  const successScale = useRef(new Animated.Value(0)).current;
  const successOpacity = useRef(new Animated.Value(0)).current;
  const iconOpacity = useRef(new Animated.Value(0)).current;
  const ringAnim = useRef(new Animated.Value(1)).current;

  // Detect biometric type
  useEffect(() => {
    LocalAuthentication.supportedAuthenticationTypesAsync().then((types) => {
      if (types.includes(LocalAuthentication.AuthenticationType.FACIAL_RECOGNITION)) {
        setBiometricType('face');
      } else if (types.includes(LocalAuthentication.AuthenticationType.FINGERPRINT)) {
        setBiometricType('fingerprint');
      } else {
        setBiometricType('unknown');
      }
    });
  }, []);

  // Entrance animation
  useEffect(() => {
    Animated.timing(iconOpacity, { toValue: 1, duration: 600, useNativeDriver: true }).start();
  }, [iconOpacity]);

  // Pulse animation when scanning
  useEffect(() => {
    if (authStatus === 'scanning') {
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, { toValue: 1.15, duration: 700, useNativeDriver: true }),
          Animated.timing(pulseAnim, { toValue: 1, duration: 700, useNativeDriver: true }),
        ]),
      ).start();

      Animated.loop(
        Animated.sequence([
          Animated.timing(ringAnim, { toValue: 1.4, duration: 900, useNativeDriver: true }),
          Animated.timing(ringAnim, { toValue: 1, duration: 100, useNativeDriver: true }),
        ]),
      ).start();
    } else {
      pulseAnim.stopAnimation(() => {
        Animated.timing(pulseAnim, { toValue: 1, duration: 200, useNativeDriver: true }).start();
      });
    }
  }, [authStatus, pulseAnim, ringAnim]);

  // Success animation
  const playSuccessAnimation = useCallback(() => {
    Animated.parallel([
      Animated.spring(successScale, { toValue: 1, tension: 80, friction: 7, useNativeDriver: true }),
      Animated.timing(successOpacity, { toValue: 1, duration: 300, useNativeDriver: true }),
    ]).start(() => {
      setTimeout(() => {
        // Navigation is handled by auth state changes, but add explicit nav for PinEntry
      }, 800);
    });
  }, [successScale, successOpacity]);

  const triggerBiometric = useCallback(async () => {
    dispatch(setAuthError(null));
    setAuthStatus('scanning');

    try {
      const result = await LocalAuthentication.authenticateAsync({
        promptMessage: 'Connexion à BBVA',
        fallbackLabel: 'Utiliser le code PIN',
        cancelLabel: 'Annuler',
        disableDeviceFallback: false,
      });

      if (result.success) {
        setAuthStatus('success');
        playSuccessAnimation();
        await dispatch(biometricLogin('biometric-device-token'));
      } else {
        setAuthStatus('failed');
        const msg =
          result.error === 'user_cancel'
            ? 'Authentification annulée.'
            : 'Échec de l\'authentification biométrique. Veuillez réessayer.';
        dispatch(setAuthError(msg));
      }
    } catch {
      setAuthStatus('failed');
      dispatch(setAuthError('Une erreur inattendue s\'est produite.'));
    }
  }, [dispatch, playSuccessAnimation]);

  // Auto-trigger on mount
  useEffect(() => {
    const t = setTimeout(() => triggerBiometric(), 600);
    return () => clearTimeout(t);
  }, [triggerBiometric]);

  const biometricIcon =
    biometricType === 'face'
      ? 'scan-outline'
      : biometricType === 'fingerprint'
      ? 'finger-print-outline'
      : 'shield-outline';

  const biometricLabel =
    biometricType === 'face'
      ? 'Face ID'
      : biometricType === 'fingerprint'
      ? 'Empreinte digitale'
      : 'Biométrie';

  const statusColor =
    authStatus === 'success'
      ? colors.success
      : authStatus === 'failed'
      ? colors.error
      : colors.secondary;

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Back */}
      <TouchableOpacity
        style={[styles.backButton, { backgroundColor: colors.surfaceVariant }]}
        onPress={() => navigation.goBack()}
      >
        <Ionicons name="arrow-back" size={22} color={colors.text} />
      </TouchableOpacity>

      <View style={styles.content}>
        {/* BBVA logo */}
        <View style={[styles.logoRow, { backgroundColor: colors.primary }]}>
          <Text style={styles.logoText}>BBVA</Text>
        </View>

        <Text style={[styles.title, { color: colors.text }]}>
          Authentification{'\n'}biométrique
        </Text>
        <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
          {biometricLabel} — {authStatus === 'scanning' ? 'Scan en cours…' : authStatus === 'success' ? 'Identité confirmée !' : authStatus === 'failed' ? 'Échec d\'authentification' : 'Appuyez pour vous authentifier'}
        </Text>

        {/* Biometric icon area */}
        <View style={styles.iconArea}>
          {/* Outer ring */}
          <Animated.View
            style={[
              styles.outerRing,
              {
                borderColor: `${statusColor}30`,
                transform: [{ scale: ringAnim }],
                opacity: authStatus === 'scanning' ? 0.8 : 0,
              },
            ]}
          />

          {/* Main button */}
          <Animated.View
            style={[
              styles.biometricCircle,
              {
                backgroundColor:
                  authStatus === 'success'
                    ? `${colors.success}20`
                    : authStatus === 'failed'
                    ? `${colors.error}15`
                    : `${colors.secondary}15`,
                borderColor: statusColor,
                transform: [{ scale: pulseAnim }],
                opacity: iconOpacity,
              },
            ]}
          >
            <Ionicons
              name={authStatus === 'success' ? 'checkmark-circle' : (biometricIcon as any)}
              size={64}
              color={statusColor}
            />
          </Animated.View>

          {/* Success overlay */}
          <Animated.View
            style={[
              styles.successOverlay,
              {
                opacity: successOpacity,
                transform: [{ scale: successScale }],
              },
            ]}
          >
            <View style={[styles.successBadge, { backgroundColor: colors.success }]}>
              <Ionicons name="checkmark" size={28} color="#FFFFFF" />
            </View>
          </Animated.View>
        </View>

        {/* Error */}
        {error && authStatus === 'failed' && (
          <View
            style={[
              styles.errorBox,
              { backgroundColor: `${colors.error}10`, borderColor: colors.error },
            ]}
          >
            <Ionicons name="alert-circle-outline" size={16} color={colors.error} />
            <Text style={[styles.errorText, { color: colors.error }]}>{error}</Text>
          </View>
        )}
      </View>

      {/* Actions */}
      <View style={styles.actions}>
        {/* Try again */}
        {(authStatus === 'failed' || authStatus === 'idle') && !isLoading && (
          <TouchableOpacity
            style={[styles.tryAgainButton, { backgroundColor: colors.primary }]}
            onPress={triggerBiometric}
            activeOpacity={0.85}
          >
            <Ionicons name={biometricIcon as any} size={20} color="#FFFFFF" />
            <Text style={styles.tryAgainText}>Réessayer</Text>
          </TouchableOpacity>
        )}

        {/* Use PIN instead */}
        <TouchableOpacity
          style={[styles.pinButton, { borderColor: colors.border }]}
          onPress={() => navigation.navigate('PinEntry', { purpose: 'login' })}
          activeOpacity={0.8}
        >
          <Ionicons name="keypad-outline" size={18} color={colors.textSecondary} />
          <Text style={[styles.pinButtonText, { color: colors.textSecondary }]}>
            Utiliser le code PIN
          </Text>
        </TouchableOpacity>

        {/* Back to login */}
        <TouchableOpacity
          style={styles.loginLink}
          onPress={() => navigation.navigate('Login')}
        >
          <Text style={[styles.loginLinkText, { color: colors.secondary }]}>
            Retour à la connexion
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 56,
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
  content: {
    flex: 1,
    alignItems: 'center',
    paddingTop: 64,
    paddingHorizontal: 24,
  },
  logoRow: {
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 8,
    marginBottom: 32,
  },
  logoText: {
    fontSize: 22,
    fontWeight: '900',
    color: '#FFFFFF',
    letterSpacing: 3,
    fontFamily: 'Roboto_900Black',
  },
  title: {
    fontSize: 26,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 12,
    lineHeight: 34,
    fontFamily: 'Roboto_700Bold',
  },
  subtitle: {
    fontSize: 15,
    textAlign: 'center',
    marginBottom: 48,
    lineHeight: 22,
    fontFamily: 'Roboto_400Regular',
  },
  iconArea: {
    width: 180,
    height: 180,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 32,
  },
  outerRing: {
    position: 'absolute',
    width: 170,
    height: 170,
    borderRadius: 85,
    borderWidth: 2,
  },
  biometricCircle: {
    width: 130,
    height: 130,
    borderRadius: 65,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  successOverlay: {
    position: 'absolute',
    bottom: 8,
    right: 8,
  },
  successBadge: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  errorBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    padding: 14,
    borderRadius: 10,
    borderWidth: 1,
    marginTop: 8,
    width: '100%',
  },
  errorText: {
    flex: 1,
    fontSize: 13,
    fontFamily: 'Roboto_400Regular',
  },
  actions: {
    paddingHorizontal: 24,
    paddingBottom: 40,
    gap: 12,
  },
  tryAgainButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 12,
    gap: 8,
  },
  tryAgainText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
    fontFamily: 'Roboto_700Bold',
  },
  pinButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 12,
    borderWidth: 1.5,
    gap: 8,
  },
  pinButtonText: {
    fontSize: 15,
    fontWeight: '500',
    fontFamily: 'Roboto_500Medium',
  },
  loginLink: {
    alignItems: 'center',
    paddingVertical: 8,
  },
  loginLinkText: {
    fontSize: 14,
    fontWeight: '600',
    fontFamily: 'Roboto_500Medium',
  },
});

export default BiometricScreen;
