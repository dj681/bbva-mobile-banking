import type { User } from '../../types';

const MOCK_DELAY = 800;

const delay = (ms: number) => new Promise<void>((resolve) => setTimeout(resolve, ms));

// Deterministic JWT-like token builder (not real JWT, for mock purposes only)
function buildToken(subject: string, expiresInMinutes: number): string {
  const header = btoa(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
  const payload = btoa(
    JSON.stringify({
      sub: subject,
      iat: Math.floor(Date.now() / 1000),
      exp: Math.floor(Date.now() / 1000) + expiresInMinutes * 60,
      iss: 'bbva-mobile-mock',
    }),
  );
  const signature = btoa(`mock-sig-${subject}-${Date.now()}`);
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

/** Map of lowercase email → mock user, for multi-profile support. */
export const MOCK_USERS: Record<string, User> = {
  [MOCK_USER.email.toLowerCase()]: MOCK_USER,
  [MOCK_USER_FRANCESCO.email.toLowerCase()]: MOCK_USER_FRANCESCO,
};

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
 * Mock login — accepts jdiazrodriguez266@gmail.com or bellostudio10@hotmail.com;
 * any non-empty password is valid.
 */
export const loginApi = async (
  email: string,
  _password: string,
): Promise<LoginResult> => {
  await delay(MOCK_DELAY);
  const user = MOCK_USERS[email.trim().toLowerCase()];
  if (!user) {
    throw new Error('Adresse e-mail non autorisée.');
  }
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
    throw new Error('Code OTP invalide. Veuillez saisir 6 chiffres.');
  }
  let user: User = MOCK_USER;
  if (pendingToken) {
    const parts = pendingToken.split('.');
    if (parts.length === 3) {
      const payload = JSON.parse(atob(parts[1])) as { sub: string };
      const found = Object.values(MOCK_USERS).find((u) => u.id === payload.sub);
      if (!found) {
        throw new Error('Session expirée. Veuillez vous reconnecter.');
      }
      user = found;
    }
  }
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
};
