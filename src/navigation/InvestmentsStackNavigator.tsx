import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import type { InvestmentsStackParamList } from '@/types';

import PortfolioScreen from '@/screens/investments/PortfolioScreen';
import InvestmentDetailsScreen from '@/screens/investments/InvestmentDetailsScreen';
import BuySellScreen from '@/screens/investments/BuySellScreen';
import SavingsPlansScreen from '@/screens/investments/SavingsPlansScreen';

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
