import { useCallback } from 'react';
import * as LocalAuthentication from 'expo-local-authentication';

import { useAppDispatch, useAppSelector } from '@/store';
import {
  loginUser,
  logoutUser,
  biometricLogin as biometricLoginThunk,
  setAuthError,
  setBiometricAvailable,
} from '@/store/slices';
import type { User } from '@/types';

interface UseAuthReturn {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  isBiometricEnabled: boolean;
  isPinEnabled: boolean;
  twoFactorPending: boolean;
  error: string | null;
  login: (username: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  biometricLogin: () => Promise<void>;
  checkBiometricAvailability: () => Promise<boolean>;
  verifyPin: (pin: string) => boolean;
}

export const useAuth = (): UseAuthReturn => {
  const dispatch = useAppDispatch();

  const user = useAppSelector((state) => state.auth.user);
  const isAuthenticated = useAppSelector((state) => state.auth.isAuthenticated);
  const isLoading = useAppSelector((state) => state.auth.isLoading);
  const isBiometricEnabled = useAppSelector((state) => state.auth.isBiometricEnabled);
  const isPinEnabled = useAppSelector((state) => state.auth.isPinEnabled);
  const twoFactorPending = useAppSelector((state) => state.auth.twoFactorPending);
  const error = useAppSelector((state) => state.auth.error);
  const storedPin = useAppSelector((state) => state.auth.pin);

  const login = useCallback(
    async (username: string, password: string): Promise<void> => {
      await dispatch(loginUser({ username, password }));
    },
    [dispatch],
  );

  const logout = useCallback(async (): Promise<void> => {
    await dispatch(logoutUser());
  }, [dispatch]);

  const checkBiometricAvailability = useCallback(async (): Promise<boolean> => {
    try {
      const compatible = await LocalAuthentication.hasHardwareAsync();
      const enrolled = await LocalAuthentication.isEnrolledAsync();
      const available = compatible && enrolled;
      dispatch(setBiometricAvailable(available));
      return available;
    } catch {
      dispatch(setBiometricAvailable(false));
      return false;
    }
  }, [dispatch]);

  const biometricLogin = useCallback(async (): Promise<void> => {
    try {
      const available = await checkBiometricAvailability();
      if (!available) {
        dispatch(setAuthError('Biometric authentication is not available on this device.'));
        return;
      }

      const result = await LocalAuthentication.authenticateAsync({
        promptMessage: 'Sign in to BBVA',
        fallbackLabel: 'Use PIN',
        disableDeviceFallback: false,
        cancelLabel: 'Cancel',
      });

      if (!result.success) {
        dispatch(setAuthError('Biometric authentication failed. Please try again.'));
        return;
      }

      // Use a device-bound token derived from the stored refresh token or a fixed key
      await dispatch(biometricLoginThunk('biometric-device-token'));
    } catch {
      dispatch(setAuthError('An unexpected error occurred during biometric authentication.'));
    }
  }, [dispatch, checkBiometricAvailability]);

  const verifyPin = useCallback(
    (pin: string): boolean => {
      if (!storedPin || !isPinEnabled) return false;
      return pin === storedPin;
    },
    [storedPin, isPinEnabled],
  );

  return {
    user,
    isAuthenticated,
    isLoading,
    isBiometricEnabled,
    isPinEnabled,
    twoFactorPending,
    error,
    login,
    logout,
    biometricLogin,
    checkBiometricAvailability,
    verifyPin,
  };
};

export default useAuth;
