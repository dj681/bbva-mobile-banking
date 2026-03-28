import * as SecureStore from 'expo-secure-store';
import AsyncStorage from '@react-native-async-storage/async-storage';

const KEYS = {
  TOKEN: 'bbva_auth_token',
  REFRESH_TOKEN: 'bbva_refresh_token',
  PIN: 'bbva_user_pin',
  BIOMETRIC_ENABLED: 'bbva_biometric_enabled',
  USER_PREFERENCES: 'bbva_user_preferences',
} as const;

// ── Auth tokens ──────────────────────────────────────────────────────────────

export async function saveToken(token: string): Promise<void> {
  await SecureStore.setItemAsync(KEYS.TOKEN, token);
}

export async function getToken(): Promise<string | null> {
  return SecureStore.getItemAsync(KEYS.TOKEN);
}

export async function removeToken(): Promise<void> {
  await SecureStore.deleteItemAsync(KEYS.TOKEN);
}

export async function saveRefreshToken(token: string): Promise<void> {
  await SecureStore.setItemAsync(KEYS.REFRESH_TOKEN, token);
}

export async function getRefreshToken(): Promise<string | null> {
  return SecureStore.getItemAsync(KEYS.REFRESH_TOKEN);
}

export async function removeRefreshToken(): Promise<void> {
  await SecureStore.deleteItemAsync(KEYS.REFRESH_TOKEN);
}

// ── PIN ───────────────────────────────────────────────────────────────────────

export async function savePin(pin: string): Promise<void> {
  await SecureStore.setItemAsync(KEYS.PIN, pin);
}

export async function getPin(): Promise<string | null> {
  return SecureStore.getItemAsync(KEYS.PIN);
}

export async function removePin(): Promise<void> {
  await SecureStore.deleteItemAsync(KEYS.PIN);
}

// ── Biometric ─────────────────────────────────────────────────────────────────

export async function saveBiometricEnabled(enabled: boolean): Promise<void> {
  await AsyncStorage.setItem(KEYS.BIOMETRIC_ENABLED, JSON.stringify(enabled));
}

export async function getBiometricEnabled(): Promise<boolean> {
  const value = await AsyncStorage.getItem(KEYS.BIOMETRIC_ENABLED);
  if (value === null) return false;
  try {
    return JSON.parse(value) as boolean;
  } catch {
    return false;
  }
}

// ── User preferences ──────────────────────────────────────────────────────────

export async function saveUserPreferences(prefs: object): Promise<void> {
  await AsyncStorage.setItem(KEYS.USER_PREFERENCES, JSON.stringify(prefs));
}

export async function getUserPreferences(): Promise<object | null> {
  const value = await AsyncStorage.getItem(KEYS.USER_PREFERENCES);
  if (value === null) return null;
  try {
    return JSON.parse(value) as object;
  } catch {
    return null;
  }
}

// ── Clear all ─────────────────────────────────────────────────────────────────

/**
 * Remove all sensitive data from SecureStore and AsyncStorage.
 * Call this on logout or account deletion.
 */
export async function clearAllSecureData(): Promise<void> {
  await Promise.all([
    SecureStore.deleteItemAsync(KEYS.TOKEN),
    SecureStore.deleteItemAsync(KEYS.REFRESH_TOKEN),
    SecureStore.deleteItemAsync(KEYS.PIN),
    AsyncStorage.removeItem(KEYS.BIOMETRIC_ENABLED),
    AsyncStorage.removeItem(KEYS.USER_PREFERENCES),
  ]);
}
