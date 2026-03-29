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

const ALLOWED_EMAIL = 'jdiazrodriguez266@gmail.com';

export const MOCK_USER: User = {
  id: 'usr-001-jdiaz',
  firstName: 'Jorge',
  lastName: 'Diaz Rodriguez',
  email: ALLOWED_EMAIL,
  phone: '',
  avatar: `https://ui-avatars.com/api/?name=J+Diaz&background=004481&color=fff`,
  createdAt: '2019-03-15T09:00:00.000Z',
  lastLogin: new Date().toISOString(),
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
 * Mock login — only accepts jdiazrodriguez266@gmail.com; any non-empty password is valid.
 */
export const loginApi = async (
  email: string,
  _password: string,
): Promise<LoginResult> => {
  await delay(MOCK_DELAY);
  if (email.trim().toLowerCase() !== ALLOWED_EMAIL) {
    throw new Error('Adresse e-mail non autorisée.');
  }
  return {
    token: buildToken(MOCK_USER.id, 30),
    refreshToken: buildToken(`${MOCK_USER.id}-refresh`, 43200), // 30 days
    user: MOCK_USER,
  };
};

/**
 * Mock 2FA OTP verification — any 6-digit code is accepted.
 */
export const verifyTwoFactorApi = async (
  otp: string,
): Promise<{ token: string }> => {
  await delay(MOCK_DELAY);
  if (!/^\d{6}$/.test(otp)) {
    throw new Error('Code OTP invalide. Veuillez saisir 6 chiffres.');
  }
  return { token: buildToken(MOCK_USER.id, 30) };
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
