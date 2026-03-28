import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import type { AccountsStackParamList } from '@/types';

import AccountsListScreen from '@/screens/accounts/AccountsListScreen';
import AccountDetailsScreen from '@/screens/accounts/AccountDetailsScreen';
import TransactionDetailsScreen from '@/screens/accounts/TransactionDetailsScreen';
import TransactionHistoryScreen from '@/screens/accounts/TransactionHistoryScreen';

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
