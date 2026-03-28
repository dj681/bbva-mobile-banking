import React from 'react';
import { View, Text } from 'react-native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import type { AccountsStackParamList } from '@/types';

// ── Placeholder screens (replaced when actual screens are created) ────────────
const AccountsListScreen = () => (
  <View style={{ flex: 1 }}>
    <Text>AccountsList</Text>
  </View>
);
const AccountDetailsScreen = () => (
  <View style={{ flex: 1 }}>
    <Text>AccountDetails</Text>
  </View>
);
const TransactionDetailsScreen = () => (
  <View style={{ flex: 1 }}>
    <Text>TransactionDetails</Text>
  </View>
);
const TransactionHistoryScreen = () => (
  <View style={{ flex: 1 }}>
    <Text>TransactionHistory</Text>
  </View>
);

const Stack = createNativeStackNavigator<AccountsStackParamList>();

const AccountsStackNavigator: React.FC = () => {
  return (
    <Stack.Navigator
      initialRouteName="AccountsList"
      screenOptions={{
        headerShown: false,
        animation: 'slide_from_right',
      }}
    >
      <Stack.Screen name="AccountsList" component={AccountsListScreen} />
      <Stack.Screen name="AccountDetails" component={AccountDetailsScreen} />
      <Stack.Screen name="TransactionDetails" component={TransactionDetailsScreen} />
      <Stack.Screen name="TransactionHistory" component={TransactionHistoryScreen} />
    </Stack.Navigator>
  );
};

export default AccountsStackNavigator;
