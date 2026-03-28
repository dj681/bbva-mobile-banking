import React, { useCallback, useEffect, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import * as SplashScreen from 'expo-splash-screen';
import * as Font from 'expo-font';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { Provider as PaperProvider, MD3DarkTheme, MD3LightTheme } from 'react-native-paper';
import { Provider as ReduxProvider } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';
import { NavigationContainer, DarkTheme as NavDarkTheme, DefaultTheme as NavLightTheme } from '@react-navigation/native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import Toast from 'react-native-toast-message';

import { store, persistor } from './src/store';
import { COLORS } from './src/constants';

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

const navLightTheme = {
  ...NavLightTheme,
  colors: {
    ...NavLightTheme.colors,
    primary: COLORS.primary,
    background: COLORS.gray100,
    card: COLORS.white,
    text: COLORS.gray900,
    border: COLORS.gray300,
    notification: COLORS.error,
  },
};

const navDarkTheme = {
  ...NavDarkTheme,
  colors: {
    ...NavDarkTheme.colors,
    primary: COLORS.secondary,
    background: COLORS.gray900,
    card: COLORS.gray800,
    text: COLORS.white,
    border: COLORS.gray700,
    notification: COLORS.error,
  },
};

export default function App(): React.JSX.Element | null {
  const [appReady, setAppReady] = useState(false);
  const [isDarkMode] = useState(false);

  useEffect(() => {
    async function prepare(): Promise<void> {
      try {
        await Font.loadAsync({
          'Roboto-Thin': require('./assets/fonts/Roboto-Thin.ttf'),
          'Roboto-Light': require('./assets/fonts/Roboto-Light.ttf'),
          'Roboto-Regular': require('./assets/fonts/Roboto-Regular.ttf'),
          'Roboto-Medium': require('./assets/fonts/Roboto-Medium.ttf'),
          'Roboto-Bold': require('./assets/fonts/Roboto-Bold.ttf'),
          'Roboto-Black': require('./assets/fonts/Roboto-Black.ttf'),
          'Roboto-ThinItalic': require('./assets/fonts/Roboto-ThinItalic.ttf'),
          'Roboto-LightItalic': require('./assets/fonts/Roboto-LightItalic.ttf'),
          'Roboto-Italic': require('./assets/fonts/Roboto-Italic.ttf'),
          'Roboto-MediumItalic': require('./assets/fonts/Roboto-MediumItalic.ttf'),
          'Roboto-BoldItalic': require('./assets/fonts/Roboto-BoldItalic.ttf'),
          'Roboto-BlackItalic': require('./assets/fonts/Roboto-BlackItalic.ttf'),
        });
      } catch (error) {
        // Non-fatal: app continues with system fonts if custom fonts fail to load
        console.warn('Font loading failed, falling back to system fonts:', error);
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
  const navTheme = isDarkMode ? navDarkTheme : navLightTheme;

  return (
    <GestureHandlerRootView style={styles.container}>
      <ReduxProvider store={store}>
        <PersistGate loading={null} persistor={persistor}>
          <SafeAreaProvider>
            <PaperProvider theme={paperTheme}>
              <NavigationContainer theme={navTheme} onReady={onLayoutRootView}>
                <StatusBar style={isDarkMode ? 'light' : 'dark'} />
                {/* RootNavigator will be imported from src/navigation once created */}
                <View style={styles.placeholder} onLayout={onLayoutRootView} />
              </NavigationContainer>
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
  placeholder: {
    flex: 1,
    backgroundColor: COLORS.primary,
  },
});
