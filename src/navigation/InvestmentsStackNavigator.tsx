import React from 'react';
import { View, Text } from 'react-native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import type { InvestmentsStackParamList } from '@/types';

// ── Placeholder screens (replaced when actual screens are created) ────────────
const PortfolioScreen = () => (
  <View style={{ flex: 1 }}>
    <Text>Portfolio</Text>
  </View>
);
const InvestmentDetailsScreen = () => (
  <View style={{ flex: 1 }}>
    <Text>InvestmentDetails</Text>
  </View>
);
const BuySellScreen = () => (
  <View style={{ flex: 1 }}>
    <Text>BuySell</Text>
  </View>
);
const SavingsPlansScreen = () => (
  <View style={{ flex: 1 }}>
    <Text>SavingsPlans</Text>
  </View>
);

const Stack = createNativeStackNavigator<InvestmentsStackParamList>();

const InvestmentsStackNavigator: React.FC = () => {
  return (
    <Stack.Navigator
      initialRouteName="Portfolio"
      screenOptions={{
        headerShown: false,
        animation: 'slide_from_right',
      }}
    >
      <Stack.Screen name="Portfolio" component={PortfolioScreen} />
      <Stack.Screen name="InvestmentDetails" component={InvestmentDetailsScreen} />
      <Stack.Screen name="BuySell" component={BuySellScreen} />
      <Stack.Screen name="SavingsPlans" component={SavingsPlansScreen} />
    </Stack.Navigator>
  );
};

export default InvestmentsStackNavigator;
