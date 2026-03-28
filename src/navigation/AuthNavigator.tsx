import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import type { AuthStackParamList } from '@/types';

// ── Placeholder screens (replaced when actual screens are created) ────────────
import { View, Text } from 'react-native';

const LoginScreen = () => (
  <View style={{ flex: 1 }}>
    <Text>Login</Text>
  </View>
);
const TwoFactorScreen = () => (
  <View style={{ flex: 1 }}>
    <Text>TwoFactor</Text>
  </View>
);
const BiometricScreen = () => (
  <View style={{ flex: 1 }}>
    <Text>Biometric</Text>
  </View>
);
const PinSetupScreen = () => (
  <View style={{ flex: 1 }}>
    <Text>PinSetup</Text>
  </View>
);
const PinEntryScreen = () => (
  <View style={{ flex: 1 }}>
    <Text>PinEntry</Text>
  </View>
);

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
      <Stack.Screen name="PinSetup" component={PinSetupScreen} />
      <Stack.Screen name="PinEntry" component={PinEntryScreen} />
    </Stack.Navigator>
  );
};

export default AuthNavigator;
