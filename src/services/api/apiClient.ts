import axios, {
  AxiosInstance,
  AxiosRequestConfig,
  AxiosResponse,
  InternalAxiosRequestConfig,
} from 'axios';
import { store } from '../../store';
import { logout, setToken, setRefreshToken } from '../../store/slices/authSlice';
import { refreshTokenApi } from './authApi';

const BASE_URL =
  process.env.EXPO_PUBLIC_API_URL ?? 'https://api.bbva-mobile-mock.dev/v1';

const APP_VERSION = '1.0.0';
const PLATFORM = 'mobile';
const TIMEOUT_MS = 30000;

interface QueueItem {
  resolve: (value: string) => void;
  reject: (reason?: unknown) => void;
}

let isRefreshing = false;
let failedQueue: QueueItem[] = [];

function processQueue(error: unknown, token: string | null = null): void {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token as string);
    }
  });
  failedQueue = [];
}

export const apiClient: AxiosInstance = axios.create({
  baseURL: BASE_URL,
  timeout: TIMEOUT_MS,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
    'X-App-Version': APP_VERSION,
    'X-Platform': PLATFORM,
  },
});

// ── Request interceptor ──────────────────────────────────────────────────────

apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const state = store.getState();
    const token = state.auth?.token;
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error),
);

// ── Response interceptor ─────────────────────────────────────────────────────

apiClient.interceptors.response.use(
  (response: AxiosResponse) => response,
  async (error) => {
    const originalRequest: AxiosRequestConfig & { _retry?: boolean } =
      error.config ?? {};

    if (!error.response) {
      // Network error
      return Promise.reject({
        code: 'NETWORK_ERROR',
        message: 'Impossible de contacter le serveur. Vérifiez votre connexion.',
      });
    }

    const { status } = error.response;

    // ── 401 – try token refresh ───────────────────────────────────────────
    if (status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        return new Promise<string>((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            if (originalRequest.headers) {
              originalRequest.headers.Authorization = `Bearer ${token}`;
            }
            return apiClient(originalRequest);
          })
          .catch((err) => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const state = store.getState();
        const refreshToken = state.auth?.refreshToken;

        if (!refreshToken) {
          store.dispatch(logout());
          return Promise.reject(error);
        }

        const { token: newToken, refreshToken: newRefreshToken } =
          await refreshTokenApi(refreshToken);

        store.dispatch(setToken(newToken));
        store.dispatch(setRefreshToken(newRefreshToken));
        processQueue(null, newToken);

        if (originalRequest.headers) {
          originalRequest.headers.Authorization = `Bearer ${newToken}`;
        }

        return apiClient(originalRequest);
      } catch (refreshError) {
        processQueue(refreshError, null);
        store.dispatch(logout());
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    // ── 403 – forbidden ───────────────────────────────────────────────────
    if (status === 403) {
      return Promise.reject({
        code: 'FORBIDDEN',
        message: "Vous n'avez pas les permissions nécessaires.",
      });
    }

    // ── 500+ – server error ───────────────────────────────────────────────
    if (status >= 500) {
      return Promise.reject({
        code: 'SERVER_ERROR',
        message: 'Une erreur serveur est survenue. Réessayez ultérieurement.',
      });
    }

    return Promise.reject(error);
  },
);

export default apiClient;
