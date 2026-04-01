import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import type { UIState, ThemeMode, Notification } from '../../types';

const initialState: UIState = {
  theme: 'system',
  language: 'tr',
  isOnline: true,
  notifications: [],
  unreadNotificationsCount: 0,
  isLoading: false,
  alertMessage: null,
  alertType: null,
  biometricAvailable: false,
  notificationsEnabled: true,
};

const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    setTheme(state, action: PayloadAction<ThemeMode>) {
      state.theme = action.payload;
    },
    setLanguage(state, action: PayloadAction<string>) {
      state.language = action.payload;
    },
    setOnlineStatus(state, action: PayloadAction<boolean>) {
      state.isOnline = action.payload;
    },
    addNotification(state, action: PayloadAction<Notification>) {
      state.notifications.unshift(action.payload);
      if (!action.payload.isRead) {
        state.unreadNotificationsCount += 1;
      }
    },
    markNotificationRead(state, action: PayloadAction<string>) {
      const notification = state.notifications.find((n) => n.id === action.payload);
      if (notification && !notification.isRead) {
        notification.isRead = true;
        state.unreadNotificationsCount = Math.max(0, state.unreadNotificationsCount - 1);
      }
    },
    markAllNotificationsRead(state) {
      state.notifications.forEach((n) => {
        n.isRead = true;
      });
      state.unreadNotificationsCount = 0;
    },
    setLoading(state, action: PayloadAction<boolean>) {
      state.isLoading = action.payload;
    },
    showAlert(
      state,
      action: PayloadAction<{
        message: string;
        type: 'success' | 'error' | 'warning' | 'info';
      }>,
    ) {
      state.alertMessage = action.payload.message;
      state.alertType = action.payload.type;
    },
    hideAlert(state) {
      state.alertMessage = null;
      state.alertType = null;
    },
    setBiometricAvailable(state, action: PayloadAction<boolean>) {
      state.biometricAvailable = action.payload;
    },
    setNotificationsEnabled(state, action: PayloadAction<boolean>) {
      state.notificationsEnabled = action.payload;
    },
  },
});

export const {
  setTheme,
  setLanguage,
  setOnlineStatus,
  addNotification,
  markNotificationRead,
  markAllNotificationsRead,
  setLoading,
  showAlert,
  hideAlert,
  setBiometricAvailable,
  setNotificationsEnabled,
} = uiSlice.actions;

export default uiSlice.reducer;
