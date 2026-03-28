import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import type { AuthStackParamList } from '@/types';

import LoginScreen from '@/screens/auth/LoginScreen';
import TwoFactorScreen from '@/screens/auth/TwoFactorScreen';
import BiometricScreen from '@/screens/auth/BiometricScreen';
import PinScreen from '@/screens/auth/PinScreen';

const Stack = createNativeStackNavigator<AuthStackParamList>();

const AuthNavigator: React.FC = () => {
  return (
    <Stack.Navigator
      initialRouteName="Login"
      screenOptions={{
        headerShown: false,
        animation: 'slide_from_right',
      }}
    >
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="TwoFactor" component={TwoFactorScreen} />
      <Stack.Screen name="Biometric" component={BiometricScreen} />
      <Stack.Screen name="PinSetup" component={PinScreen} />
      <Stack.Screen name="PinEntry" component={PinScreen} />
    </Stack.Navigator>
  );
};

export default AuthNavigator;
