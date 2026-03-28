import { useCallback, useEffect, useState } from 'react';
import { Appearance, ColorSchemeName } from 'react-native';

import { useAppDispatch, useAppSelector } from '@/store';
import { setTheme } from '@/store/slices';
import { LIGHT_THEME_COLORS, DARK_THEME_COLORS } from '@/constants/colors';
import { FONT_FAMILY, FONT_SIZE, TYPOGRAPHY } from '@/constants/fonts';
import { SPACING, BORDER_RADIUS, ICON_SIZES } from '@/constants/sizes';
import type { ThemeMode } from '@/types';

interface UseThemeReturn {
  colors: typeof LIGHT_THEME_COLORS | typeof DARK_THEME_COLORS;
  fonts: typeof FONT_FAMILY;
  fontSizes: typeof FONT_SIZE;
  typography: typeof TYPOGRAPHY;
  spacing: typeof SPACING;
  borderRadius: typeof BORDER_RADIUS;
  iconSizes: typeof ICON_SIZES;
  isDarkMode: boolean;
  currentTheme: ThemeMode;
  toggleTheme: () => void;
  setThemeMode: (mode: ThemeMode) => void;
}

export const useTheme = (): UseThemeReturn => {
  const dispatch = useAppDispatch();
  const themeMode = useAppSelector((state) => state.ui.theme);

  // Track the device color scheme so we can react when it changes
  const [deviceScheme, setDeviceScheme] = useState<ColorSchemeName>(
    Appearance.getColorScheme(),
  );

  useEffect(() => {
    const subscription = Appearance.addChangeListener(({ colorScheme }) => {
      setDeviceScheme(colorScheme);
    });
    return () => subscription.remove();
  }, []);

  // Resolve 'system' → actual dark/light based on device preference
  const isDarkMode: boolean =
    themeMode === 'dark' || (themeMode === 'system' && deviceScheme === 'dark');

  const colors: typeof LIGHT_THEME_COLORS | typeof DARK_THEME_COLORS =
    isDarkMode ? DARK_THEME_COLORS : LIGHT_THEME_COLORS;

  const toggleTheme = useCallback(() => {
    const next: ThemeMode =
      themeMode === 'light' ? 'dark' : themeMode === 'dark' ? 'system' : 'light';
    dispatch(setTheme(next));
  }, [dispatch, themeMode]);

  const setThemeMode = useCallback(
    (mode: ThemeMode) => {
      dispatch(setTheme(mode));
    },
    [dispatch],
  );

  return {
    colors,
    fonts: FONT_FAMILY,
    fontSizes: FONT_SIZE,
    typography: TYPOGRAPHY,
    spacing: SPACING,
    borderRadius: BORDER_RADIUS,
    iconSizes: ICON_SIZES,
    isDarkMode,
    currentTheme: themeMode,
    toggleTheme,
    setThemeMode,
  };
};

export default useTheme;
