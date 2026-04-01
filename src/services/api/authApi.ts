import type { User } from '../../types';

const MOCK_DELAY = 800;

const delay = (ms: number) => new Promise<void>((resolve) => setTimeout(resolve, ms));

// Pure-JS Base64 helpers — btoa/atob are browser globals unavailable in
// React Native's Hermes engine, which causes "property 'btoa' doesn't exist".
const BASE64_CHARS =
  'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=';

function base64Encode(input: string): string {
  let output = '';
  let i = 0;
  while (i < input.length) {
    const chr1 = input.charCodeAt(i++);
    const chr2 = input.charCodeAt(i++);
    const chr3 = input.charCodeAt(i++);
    const enc1 = chr1 >> 2;
    const enc2 = ((chr1 & 3) << 4) | (chr2 >> 4);
    const enc3 = isNaN(chr2) ? 64 : ((chr2 & 15) << 2) | (chr3 >> 6);
    const enc4 = isNaN(chr3) ? 64 : chr3 & 63;
    output +=
      BASE64_CHARS.charAt(enc1) +
      BASE64_CHARS.charAt(enc2) +
      BASE64_CHARS.charAt(enc3) +
      BASE64_CHARS.charAt(enc4);
  }
  return output;
}

function base64Decode(input: string): string {
  let output = '';
  let i = 0;
  const sanitized = input.replace(/[^A-Za-z0-9+/=]/g, '');
  while (i < sanitized.length) {
    const enc1 = BASE64_CHARS.indexOf(sanitized.charAt(i++));
    const enc2 = BASE64_CHARS.indexOf(sanitized.charAt(i++));
    const enc3 = BASE64_CHARS.indexOf(sanitized.charAt(i++));
    const enc4 = BASE64_CHARS.indexOf(sanitized.charAt(i++));
    const chr1 = (enc1 << 2) | (enc2 >> 4);
    const chr2 = ((enc2 & 15) << 4) | (enc3 >> 2);
    const chr3 = ((enc3 & 3) << 6) | enc4;
    output += String.fromCharCode(chr1);
    if (enc3 !== 64) output += String.fromCharCode(chr2);
    if (enc4 !== 64) output += String.fromCharCode(chr3);
  }
  return output;
}

// Deterministic JWT-like token builder (not real JWT, for mock purposes only)
function buildToken(subject: string, expiresInMinutes: number): string {
  const header = base64Encode(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
  const payload = base64Encode(
    JSON.stringify({
      sub: subject,
      iat: Math.floor(Date.now() / 1000),
      exp: Math.floor(Date.now() / 1000) + expiresInMinutes * 60,
      iss: 'bbva-mobile-mock',
    }),
  );
  const signature = base64Encode(`mock-sig-${subject}-${Date.now()}`);
  return `${header}.${payload}.${signature}`;
}

/** Default password used to pre-fill demo login forms. Any non-empty value is accepted. */
export const DEMO_PASSWORD = 'demo1234';

export const MOCK_USER: User = {
  id: 'usr-001-jdiaz',
  firstName: 'José Antonio',
  lastName: 'Díaz Rodríguez',
  email: 'jdiazrodriguez266@gmail.com',
  phone: '642663110',
  avatar: `https://ui-avatars.com/api/?name=JA+Diaz&background=004481&color=fff`,
  createdAt: '2019-03-15T09:00:00.000Z',
  lastLogin: new Date().toISOString(),
  birthDate: '09.12.1966',
  address: 'Calle Piedras 3, Matagorda, El Ejido',
  postalCode: '04715',
  city: 'Almería',
};

export const MOCK_USER_FRANCESCO: User = {
  id: 'usr-002-fjoy',
  firstName: 'Francesco',
  lastName: 'Joy',
  email: 'bellostudio10@hotmail.com',
  phone: '600000000',
  avatar: `https://ui-avatars.com/api/?name=FJ&background=004481&color=fff`,
  createdAt: '2021-06-01T09:00:00.000Z',
  lastLogin: new Date().toISOString(),
};

export const MOCK_USER_KALLE: User = {
  id: 'usr-003-khuikko',
  firstName: 'Kalle',
  lastName: 'Huikko',
  email: 'kalle.huikko@havi.fi',
  phone: '0405051855',
  avatar: `https://ui-avatars.com/api/?name=KH&background=004481&color=fff`,
  createdAt: '2024-01-01T09:00:00.000Z',
  lastLogin: new Date().toISOString(),
};

export const MOCK_USER_FILOMENA: User = {
  id: 'usr-004-filomena',
  firstName: 'Ribeiro',
  lastName: 'Filomena',
  email: 'filemenajesuscostaribeiro@gmail.com',
  phone: '0917556587',
  avatar: `https://ui-avatars.com/api/?name=RF&background=004481&color=fff`,
  createdAt: '2026-04-01T09:00:00.000Z',
  lastLogin: new Date().toISOString(),
  address: 'Rua primeiro de Maio 615 Primeiro Esquerdo Alfena',
};

/** Map of lowercase username → mock user. */
export const MOCK_USERS: Record<string, User> = {
  'josé': MOCK_USER,
  'jose': MOCK_USER,
  'francesco': MOCK_USER_FRANCESCO,
  'kalle': MOCK_USER_KALLE,
  'filomena': MOCK_USER_FILOMENA,
};

// ── Active-user tracker ───────────────────────────────────────────────────────
// Used by other mock API modules to serve per-user data without requiring
// Redux state access inside pure API functions.
// NOTE: This module-level variable is safe for this single-session mock
// environment; it must not be used in real multi-user or concurrent scenarios.
let _activeUserId: string = MOCK_USER.id;

export function setActiveUserId(id: string): void {
  _activeUserId = id;
}

export function getActiveUserId(): string {
  return _activeUserId;
}

export interface LoginResult {
  token: string;
  refreshToken: string;
  user: User;
}

export interface RefreshResult {
  token: string;
  refreshToken: string;
}

/**
 * Mock login — accepts username "josé" (or "jose") or "francesco";
 * any non-empty password is valid.
 */
export const loginApi = async (
  username: string,
  _password: string,
): Promise<LoginResult> => {
  await delay(MOCK_DELAY);
  const user = MOCK_USERS[username.trim().toLowerCase()];
  if (!user) {
    throw new Error('Username not recognized.');
  }
  setActiveUserId(user.id);
  return {
    token: buildToken(user.id, 30),
    refreshToken: buildToken(`${user.id}-refresh`, 43200), // 30 days
    user,
  };
};

/**
 * Mock 2FA OTP verification — any 6-digit code is accepted.
 * Decodes the token subject to return the matching mock user.
 */
export const verifyTwoFactorApi = async (
  otp: string,
  pendingToken?: string,
): Promise<{ token: string; user: User }> => {
  await delay(MOCK_DELAY);
  if (!/^\d{6}$/.test(otp)) {
    throw new Error('Invalid OTP code. Please enter 6 digits.');
  }
  let user: User = MOCK_USER;
  if (pendingToken) {
    const parts = pendingToken.split('.');
    if (parts.length === 3) {
      const payload = JSON.parse(base64Decode(parts[1])) as { sub: string };
      const found = Object.values(MOCK_USERS).find((u) => u.id === payload.sub);
      if (!found) {
        throw new Error('Session expired. Please sign in again.');
      }
      user = found;
    }
  }
  setActiveUserId(user.id);
  return { token: buildToken(user.id, 30), user };
};

/**
 * Mock token refresh.
 */
export const refreshTokenApi = async (
  _refreshToken: string,
): Promise<RefreshResult> => {
  await delay(300);
  return {
    token: buildToken(MOCK_USER.id, 30),
    refreshToken: buildToken(`${MOCK_USER.id}-refresh`, 43200),
  };
};

/**
 * Mock logout — always resolves.
 */
export const logoutApi = async (): Promise<void> => {
  await delay(300);
  setActiveUserId(MOCK_USER.id);
};
