import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import type { CreditsStackParamList } from '@/types';

import CreditsListScreen from '@/screens/credits/CreditsListScreen';
import CreditDetailsScreen from '@/screens/credits/CreditDetailsScreen';
import CreditSimulatorScreen from '@/screens/credits/CreditSimulatorScreen';
import CreditRequestScreen from '@/screens/credits/CreditRequestScreen';

const Stack = createNativeStackNavigator<CreditsStackParamList>();

const CreditsStackNavigator: React.FC = () => {
  return (
    <Stack.Navigator
      initialRouteName="CreditsList"
      screenOptions={{
        headerShown: false,
        animation: 'slide_from_right',
      }}
    >
      <Stack.Screen name="CreditsList" component={CreditsListScreen} />
      <Stack.Screen name="CreditDetails" component={CreditDetailsScreen} />
      <Stack.Screen name="CreditSimulator" component={CreditSimulatorScreen} />
      <Stack.Screen name="CreditRequest" component={CreditRequestScreen} />
    </Stack.Navigator>
  );
};

export default CreditsStackNavigator;
