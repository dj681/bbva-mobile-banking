import React, { useCallback, useEffect, useState } from 'react';
import { StyleSheet } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import * as SplashScreen from 'expo-splash-screen';
import * as Font from 'expo-font';
import {
  Roboto_100Thin,
  Roboto_300Light,
  Roboto_400Regular,
  Roboto_500Medium,
  Roboto_700Bold,
  Roboto_900Black,
  Roboto_100Thin_Italic,
  Roboto_300Light_Italic,
  Roboto_400Regular_Italic,
  Roboto_500Medium_Italic,
  Roboto_700Bold_Italic,
  Roboto_900Black_Italic,
} from '@expo-google-fonts/roboto';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { Provider as PaperProvider, MD3DarkTheme, MD3LightTheme } from 'react-native-paper';
import { Provider as ReduxProvider } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import Toast from 'react-native-toast-message';

import { store, persistor } from './src/store';
import { setLanguage } from './src/store/slices';
import { COLORS } from './src/constants';
import RootNavigator from './src/navigation/RootNavigator';

// Keep the splash screen visible while resources load
SplashScreen.preventAutoHideAsync();

const paperLightTheme = {
  ...MD3LightTheme,
  colors: {
    ...MD3LightTheme.colors,
    primary: COLORS.primary,
    secondary: COLORS.secondary,
    background: COLORS.gray100,
    surface: COLORS.white,
    error: COLORS.error,
    onPrimary: COLORS.white,
    onSecondary: COLORS.white,
    onBackground: COLORS.gray900,
    onSurface: COLORS.gray900,
  },
};

const paperDarkTheme = {
  ...MD3DarkTheme,
  colors: {
    ...MD3DarkTheme.colors,
    primary: COLORS.secondary,
    secondary: COLORS.primary,
    background: COLORS.gray900,
    surface: COLORS.gray800,
    error: COLORS.error,
    onPrimary: COLORS.white,
    onSecondary: COLORS.white,
    onBackground: COLORS.white,
    onSurface: COLORS.white,
  },
};

export default function App(): React.JSX.Element | null {
  const [appReady, setAppReady] = useState(false);
  const [isDarkMode] = useState(false);

  useEffect(() => {
    async function prepare(): Promise<void> {
      try {
        await Font.loadAsync({
          'Roboto-Thin': Roboto_100Thin,
          'Roboto-Light': Roboto_300Light,
          'Roboto-Regular': Roboto_400Regular,
          'Roboto-Medium': Roboto_500Medium,
          'Roboto-Bold': Roboto_700Bold,
          'Roboto-Black': Roboto_900Black,
          'Roboto-ThinItalic': Roboto_100Thin_Italic,
          'Roboto-LightItalic': Roboto_300Light_Italic,
          'Roboto-Italic': Roboto_400Regular_Italic,
          'Roboto-MediumItalic': Roboto_500Medium_Italic,
          'Roboto-BoldItalic': Roboto_700Bold_Italic,
          'Roboto-BlackItalic': Roboto_900Black_Italic,
        });
      } catch {
        // Non-fatal: app continues with system fonts if custom fonts fail to load
      } finally {
        setAppReady(true);
      }
    }

    prepare();
  }, []);

  const onLayoutRootView = useCallback(async () => {
    if (appReady) {
      await SplashScreen.hideAsync();
    }
  }, [appReady]);

  if (!appReady) {
    return null;
  }

  const paperTheme = isDarkMode ? paperDarkTheme : paperLightTheme;

  return (
    <GestureHandlerRootView style={styles.container} onLayout={onLayoutRootView}>
      <ReduxProvider store={store}>
        <PersistGate
          loading={null}
          persistor={persistor}
          onBeforeLift={() => {
            store.dispatch(setLanguage('es'));
          }}
        >
          <SafeAreaProvider>
            <PaperProvider theme={paperTheme}>
              <StatusBar style={isDarkMode ? 'light' : 'dark'} />
              <RootNavigator />
              <Toast />
            </PaperProvider>
          </SafeAreaProvider>
        </PersistGate>
      </ReduxProvider>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
