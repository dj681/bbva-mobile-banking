import React from 'react';
import { View, Text } from 'react-native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import type { HomeStackParamList } from '@/types';

// ── Placeholder screens (replaced when actual screens are created) ────────────
const DashboardScreen = () => (
  <View style={{ flex: 1 }}>
    <Text>Dashboard</Text>
  </View>
);
const NotificationsScreen = () => (
  <View style={{ flex: 1 }}>
    <Text>Notifications</Text>
  </View>
);
const TransferFlowScreen = () => (
  <View style={{ flex: 1 }}>
    <Text>TransferFlow</Text>
  </View>
);
const PaymentFlowScreen = () => (
  <View style={{ flex: 1 }}>
    <Text>PaymentFlow</Text>
  </View>
);
const SupportScreen = () => (
  <View style={{ flex: 1 }}>
    <Text>Support</Text>
  </View>
);

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
      <Stack.Screen name="TransferFlow" component={TransferFlowScreen} />
      <Stack.Screen name="PaymentFlow" component={PaymentFlowScreen} />
      <Stack.Screen name="Support" component={SupportScreen} />
    </Stack.Navigator>
  );
};

export default HomeStackNavigator;
