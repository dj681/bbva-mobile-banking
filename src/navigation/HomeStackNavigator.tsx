import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import type { HomeStackParamList } from '@/types';

import DashboardScreen from '@/screens/home/DashboardScreen';
import NotificationsScreen from '@/screens/home/NotificationsScreen';
import TransferScreen from '@/screens/transfers/TransferScreen';
import PaymentScreen from '@/screens/transfers/PaymentScreen';
import SupportScreen from '@/screens/profile/SupportScreen';

const Stack = createNativeStackNavigator<HomeStackParamList>();

const HomeStackNavigator: React.FC = () => {
  return (
    <Stack.Navigator
      initialRouteName="Dashboard"
      screenOptions={{
        headerShown: false,
        animation: 'slide_from_right',
      }}
    >
      <Stack.Screen name="Dashboard" component={DashboardScreen} />
      <Stack.Screen name="Notifications" component={NotificationsScreen} />
      <Stack.Screen name="TransferFlow" component={TransferScreen} />
      <Stack.Screen name="PaymentFlow" component={PaymentScreen} />
      <Stack.Screen name="Support" component={SupportScreen} />
    </Stack.Navigator>
  );
};

export default HomeStackNavigator;
