import { useCallback, useEffect, useRef } from 'react';
import * as ExpoNotifications from 'expo-notifications';

import { useAppDispatch, useAppSelector } from '@/store';
import {
  addNotification,
  markNotificationRead,
  markAllNotificationsRead,
  setNotificationsEnabled,
} from '@/store/slices';
import type { Notification } from '@/types';

// Configure how notifications behave while the app is foregrounded
ExpoNotifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

interface UseNotificationsReturn {
  notifications: Notification[];
  unreadCount: number;
  notificationsEnabled: boolean;
  markRead: (id: string) => void;
  markAllRead: () => void;
  requestPermissions: () => Promise<boolean>;
}

export const useNotifications = (): UseNotificationsReturn => {
  const dispatch = useAppDispatch();

  const notifications = useAppSelector((state) => state.ui.notifications);
  const unreadCount = useAppSelector((state) => state.ui.unreadNotificationsCount);
  const notificationsEnabled = useAppSelector((state) => state.ui.notificationsEnabled);

  // Stable refs so listeners registered in useEffect don't capture stale dispatch
  const dispatchRef = useRef(dispatch);
  dispatchRef.current = dispatch;

  const requestPermissions = useCallback(async (): Promise<boolean> => {
    const { status: existingStatus } =
      await ExpoNotifications.getPermissionsAsync();

    let finalStatus = existingStatus;
    if (existingStatus !== 'granted') {
      const { status } = await ExpoNotifications.requestPermissionsAsync();
      finalStatus = status;
    }

    const granted = finalStatus === 'granted';
    dispatch(setNotificationsEnabled(granted));
    return granted;
  }, [dispatch]);

  useEffect(() => {
    // Request permissions on mount if not yet decided
    if (notificationsEnabled) {
      requestPermissions().catch(() => {
        // Permission request errors are non-fatal
      });
    }

    // Listen for notifications received while the app is foregrounded
    const foregroundSubscription =
      ExpoNotifications.addNotificationReceivedListener((notification) => {
        const { title, body, data } = notification.request.content;

        const newNotification: Notification = {
          id: notification.request.identifier,
          type: (data?.type as Notification['type']) ?? 'info',
          title: title ?? 'BBVA',
          message: body ?? '',
          date: new Date().toISOString(),
          isRead: false,
          actionUrl: data?.actionUrl as string | undefined,
          icon: data?.icon as string | undefined,
        };

        dispatchRef.current(addNotification(newNotification));
      });

    // Listen for the user tapping a notification
    const responseSubscription =
      ExpoNotifications.addNotificationResponseReceivedListener((response) => {
        const id = response.notification.request.identifier;
        dispatchRef.current(markNotificationRead(id));
      });

    return () => {
      foregroundSubscription.remove();
      responseSubscription.remove();
    };
  }, [notificationsEnabled, requestPermissions]);

  const markRead = useCallback(
    (id: string) => {
      dispatch(markNotificationRead(id));
    },
    [dispatch],
  );

  const markAllRead = useCallback(() => {
    dispatch(markAllNotificationsRead());
  }, [dispatch]);

  return {
    notifications,
    unreadCount,
    notificationsEnabled,
    markRead,
    markAllRead,
    requestPermissions,
  };
};

export default useNotifications;
