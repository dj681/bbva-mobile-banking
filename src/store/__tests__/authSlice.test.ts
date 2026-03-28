import authReducer, {
  setUser,
  setToken,
  setRefreshToken,
  logout,
  setLoading,
  setError,
  enableBiometric,
  disableBiometric,
  setPin,
  clearPin,
  setSessionExpiry,
  setTwoFactorPending,
  loginUser,
  verifyTwoFactor,
  biometricLogin,
  logoutUser,
} from '../slices/authSlice';
import type { AuthState, User } from '../../types';

const mockUser: User = {
  id: 'u1',
  firstName: 'Jean',
  lastName: 'Dupont',
  email: 'jean.dupont@example.com',
  phone: '0612345678',
  createdAt: '2024-01-01T00:00:00Z',
  lastLogin: '2024-06-01T10:00:00Z',
};

const initialState: AuthState = {
  user: null,
  token: null,
  refreshToken: null,
  isAuthenticated: false,
  isLoading: false,
  isBiometricEnabled: false,
  isPinEnabled: false,
  pin: null,
  error: null,
  sessionExpiry: null,
  twoFactorPending: false,
};

describe('authSlice — synchronous actions', () => {
  it('returns the initial state when called with undefined', () => {
    expect(authReducer(undefined, { type: '@@INIT' })).toEqual(initialState);
  });

  it('setUser updates the user in state', () => {
    const state = authReducer(initialState, setUser(mockUser));
    expect(state.user).toEqual(mockUser);
  });

  it('setToken updates the token', () => {
    const state = authReducer(initialState, setToken('abc123'));
    expect(state.token).toBe('abc123');
  });

  it('setRefreshToken updates the refresh token', () => {
    const state = authReducer(initialState, setRefreshToken('refresh-xyz'));
    expect(state.refreshToken).toBe('refresh-xyz');
  });

  it('logout resets the state to initial', () => {
    const loggedInState: AuthState = {
      ...initialState,
      user: mockUser,
      token: 'tok',
      isAuthenticated: true,
    };
    const state = authReducer(loggedInState, logout());
    expect(state.isAuthenticated).toBe(false);
    expect(state.user).toBeNull();
    expect(state.token).toBeNull();
  });

  it('setLoading sets isLoading', () => {
    const state = authReducer(initialState, setLoading(true));
    expect(state.isLoading).toBe(true);
    const state2 = authReducer(state, setLoading(false));
    expect(state2.isLoading).toBe(false);
  });

  it('setError stores an error message', () => {
    const state = authReducer(initialState, setError('Something went wrong'));
    expect(state.error).toBe('Something went wrong');
  });

  it('setError clears the error when passed null', () => {
    const errState = authReducer(initialState, setError('Error'));
    const state = authReducer(errState, setError(null));
    expect(state.error).toBeNull();
  });

  it('enableBiometric sets isBiometricEnabled to true', () => {
    const state = authReducer(initialState, enableBiometric());
    expect(state.isBiometricEnabled).toBe(true);
  });

  it('disableBiometric sets isBiometricEnabled to false', () => {
    const biometricState = authReducer(initialState, enableBiometric());
    const state = authReducer(biometricState, disableBiometric());
    expect(state.isBiometricEnabled).toBe(false);
  });

  it('setPin stores the pin and enables PIN', () => {
    const state = authReducer(initialState, setPin('1234'));
    expect(state.pin).toBe('1234');
    expect(state.isPinEnabled).toBe(true);
  });

  it('clearPin removes the pin and disables PIN', () => {
    const pinState = authReducer(initialState, setPin('1234'));
    const state = authReducer(pinState, clearPin());
    expect(state.pin).toBeNull();
    expect(state.isPinEnabled).toBe(false);
  });

  it('setSessionExpiry stores the expiry timestamp', () => {
    const expiry = '2024-12-31T23:59:59Z';
    const state = authReducer(initialState, setSessionExpiry(expiry));
    expect(state.sessionExpiry).toBe(expiry);
  });

  it('setTwoFactorPending toggles the flag', () => {
    const state = authReducer(initialState, setTwoFactorPending(true));
    expect(state.twoFactorPending).toBe(true);
    const state2 = authReducer(state, setTwoFactorPending(false));
    expect(state2.twoFactorPending).toBe(false);
  });
});

describe('authSlice — loginUser async thunk', () => {
  it('sets isLoading=true and clears error on pending', () => {
    const state = authReducer(
      { ...initialState, error: 'Previous error' },
      { type: loginUser.pending.type },
    );
    expect(state.isLoading).toBe(true);
    expect(state.error).toBeNull();
  });

  it('authenticates the user on fulfilled (no 2FA)', () => {
    const payload = {
      user: mockUser,
      token: 'tok',
      refreshToken: 'rtok',
      sessionExpiry: '2024-12-31T00:00:00Z',
      twoFactorRequired: false,
    };
    const state = authReducer(initialState, {
      type: loginUser.fulfilled.type,
      payload,
    });
    expect(state.isLoading).toBe(false);
    expect(state.isAuthenticated).toBe(true);
    expect(state.user).toEqual(mockUser);
    expect(state.twoFactorPending).toBe(false);
  });

  it('sets twoFactorPending when 2FA is required', () => {
    const payload = {
      user: mockUser,
      token: 'tok',
      refreshToken: 'rtok',
      sessionExpiry: '2024-12-31T00:00:00Z',
      twoFactorRequired: true,
    };
    const state = authReducer(initialState, {
      type: loginUser.fulfilled.type,
      payload,
    });
    expect(state.twoFactorPending).toBe(true);
    expect(state.isAuthenticated).toBe(false);
  });

  it('stores the error and clears isLoading on rejected', () => {
    const state = authReducer(initialState, {
      type: loginUser.rejected.type,
      payload: 'Invalid credentials',
    });
    expect(state.isLoading).toBe(false);
    expect(state.error).toBe('Invalid credentials');
  });
});

describe('authSlice — verifyTwoFactor async thunk', () => {
  it('sets isLoading=true on pending', () => {
    const state = authReducer(initialState, { type: verifyTwoFactor.pending.type });
    expect(state.isLoading).toBe(true);
  });

  it('authenticates and clears twoFactorPending on fulfilled', () => {
    const pendingState: AuthState = { ...initialState, twoFactorPending: true };
    const payload = {
      user: mockUser,
      token: 'tok2',
      refreshToken: 'rtok2',
      sessionExpiry: '2024-12-31T00:00:00Z',
    };
    const state = authReducer(pendingState, {
      type: verifyTwoFactor.fulfilled.type,
      payload,
    });
    expect(state.isAuthenticated).toBe(true);
    expect(state.twoFactorPending).toBe(false);
    expect(state.user).toEqual(mockUser);
  });

  it('stores the error on rejected', () => {
    const state = authReducer(initialState, {
      type: verifyTwoFactor.rejected.type,
      payload: 'Invalid code',
    });
    expect(state.error).toBe('Invalid code');
  });
});

describe('authSlice — biometricLogin async thunk', () => {
  it('sets isLoading=true on pending', () => {
    const state = authReducer(initialState, { type: biometricLogin.pending.type });
    expect(state.isLoading).toBe(true);
  });

  it('authenticates on fulfilled', () => {
    const payload = {
      user: mockUser,
      token: 'bio-tok',
      refreshToken: 'bio-rtok',
      sessionExpiry: '2024-12-31T00:00:00Z',
    };
    const state = authReducer(initialState, {
      type: biometricLogin.fulfilled.type,
      payload,
    });
    expect(state.isAuthenticated).toBe(true);
    expect(state.isLoading).toBe(false);
  });

  it('stores error on rejected', () => {
    const state = authReducer(initialState, {
      type: biometricLogin.rejected.type,
      payload: 'Biometric failed',
    });
    expect(state.error).toBe('Biometric failed');
  });
});

describe('authSlice — logoutUser async thunk', () => {
  const loggedInState: AuthState = {
    ...initialState,
    user: mockUser,
    token: 'tok',
    isAuthenticated: true,
  };

  it('sets isLoading=true on pending', () => {
    const state = authReducer(loggedInState, { type: logoutUser.pending.type });
    expect(state.isLoading).toBe(true);
  });

  it('resets to initial state on fulfilled', () => {
    const state = authReducer(loggedInState, { type: logoutUser.fulfilled.type });
    expect(state.isAuthenticated).toBe(false);
    expect(state.user).toBeNull();
    expect(state.token).toBeNull();
  });

  it('resets to initial state even on rejected (local logout)', () => {
    const state = authReducer(loggedInState, { type: logoutUser.rejected.type });
    expect(state.isAuthenticated).toBe(false);
    expect(state.user).toBeNull();
  });
});
