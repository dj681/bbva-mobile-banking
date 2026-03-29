import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import type { AuthState, User } from '../../types';
import { loginApi, verifyTwoFactorApi, logoutApi, MOCK_USER } from '../../services/api/authApi';

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

interface LoginCredentials {
  email: string;
  password: string;
}

interface LoginResponse {
  user: User;
  token: string;
  refreshToken: string;
  sessionExpiry: string;
  twoFactorRequired: boolean;
}

interface TwoFactorPayload {
  code: string;
  token: string;
}

interface TwoFactorResponse {
  user: User;
  token: string;
  refreshToken: string;
  sessionExpiry: string;
}

interface BiometricLoginResponse {
  user: User;
  token: string;
  refreshToken: string;
  sessionExpiry: string;
}

export const loginUser = createAsyncThunk<LoginResponse, LoginCredentials>(
  'auth/loginUser',
  async (credentials, { rejectWithValue }) => {
    try {
      const result = await loginApi(credentials.email, credentials.password);
      const sessionExpiry = new Date(Date.now() + 30 * 60 * 1000).toISOString();
      return {
        user: result.user,
        token: result.token,
        refreshToken: result.refreshToken,
        sessionExpiry,
        twoFactorRequired: false,
      } as LoginResponse;
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Erreur de connexion.');
    }
  },
);

export const verifyTwoFactor = createAsyncThunk<TwoFactorResponse, TwoFactorPayload>(
  'auth/verifyTwoFactor',
  async (payload, { rejectWithValue }) => {
    try {
      const result = await verifyTwoFactorApi(payload.code);
      const sessionExpiry = new Date(Date.now() + 30 * 60 * 1000).toISOString();
      return {
        user: MOCK_USER,
        token: result.token,
        refreshToken: '',
        sessionExpiry,
      } as TwoFactorResponse;
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Vérification échouée.');
    }
  },
);

export const biometricLogin = createAsyncThunk<BiometricLoginResponse, string>(
  'auth/biometricLogin',
  async (_biometricToken, { rejectWithValue }) => {
    return rejectWithValue('Authentification biométrique non supportée dans cette démo.');
  },
);

export const logoutUser = createAsyncThunk<void, void>(
  'auth/logoutUser',
  async () => {
    await logoutApi();
  },
);

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setUser(state, action: PayloadAction<User>) {
      state.user = action.payload;
    },
    setToken(state, action: PayloadAction<string>) {
      state.token = action.payload;
    },
    setRefreshToken(state, action: PayloadAction<string>) {
      state.refreshToken = action.payload;
    },
    logout(state) {
      state.user = null;
      state.token = null;
      state.refreshToken = null;
      state.isAuthenticated = false;
      state.sessionExpiry = null;
      state.twoFactorPending = false;
      state.error = null;
    },
    setLoading(state, action: PayloadAction<boolean>) {
      state.isLoading = action.payload;
    },
    setError(state, action: PayloadAction<string | null>) {
      state.error = action.payload;
    },
    enableBiometric(state) {
      state.isBiometricEnabled = true;
    },
    disableBiometric(state) {
      state.isBiometricEnabled = false;
    },
    setPin(state, action: PayloadAction<string>) {
      state.pin = action.payload;
      state.isPinEnabled = true;
    },
    clearPin(state) {
      state.pin = null;
      state.isPinEnabled = false;
    },
    setSessionExpiry(state, action: PayloadAction<string>) {
      state.sessionExpiry = action.payload;
    },
    setTwoFactorPending(state, action: PayloadAction<boolean>) {
      state.twoFactorPending = action.payload;
    },
  },
  extraReducers: (builder) => {
    // loginUser
    builder
      .addCase(loginUser.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.isLoading = false;
        if (action.payload.twoFactorRequired) {
          state.twoFactorPending = true;
          state.token = action.payload.token;
        } else {
          state.user = action.payload.user;
          state.token = action.payload.token;
          state.refreshToken = action.payload.refreshToken;
          state.sessionExpiry = action.payload.sessionExpiry;
          state.isAuthenticated = true;
          state.twoFactorPending = false;
        }
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // verifyTwoFactor
    builder
      .addCase(verifyTwoFactor.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(verifyTwoFactor.fulfilled, (state, action) => {
        state.isLoading = false;
        state.user = action.payload.user;
        state.token = action.payload.token;
        state.refreshToken = action.payload.refreshToken;
        state.sessionExpiry = action.payload.sessionExpiry;
        state.isAuthenticated = true;
        state.twoFactorPending = false;
      })
      .addCase(verifyTwoFactor.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // biometricLogin
    builder
      .addCase(biometricLogin.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(biometricLogin.fulfilled, (state, action) => {
        state.isLoading = false;
        state.user = action.payload.user;
        state.token = action.payload.token;
        state.refreshToken = action.payload.refreshToken;
        state.sessionExpiry = action.payload.sessionExpiry;
        state.isAuthenticated = true;
      })
      .addCase(biometricLogin.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // logoutUser
    builder
      .addCase(logoutUser.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(logoutUser.fulfilled, (state) => {
        Object.assign(state, { ...initialState });
      })
      .addCase(logoutUser.rejected, (state) => {
        // Clear session locally regardless of server-side failure
        Object.assign(state, { ...initialState });
      });
  },
});

export const {
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
} = authSlice.actions;

export default authSlice.reducer;
