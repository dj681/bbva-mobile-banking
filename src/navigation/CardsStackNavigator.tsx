import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import type { CardsStackParamList } from '@/types';

import CardsListScreen from '@/screens/cards/CardsListScreen';
import CardDetailsScreen from '@/screens/cards/CardDetailsScreen';
import CardTransactionsScreen from '@/screens/cards/CardTransactionsScreen';

const Stack = createNativeStackNavigator<CardsStackParamList>();

const CardsStackNavigator: React.FC = () => {
  return (
    <Stack.Navigator
      initialRouteName="CardsList"
      screenOptions={{
        headerShown: false,
        animation: 'slide_from_right',
      }}
    >
      <Stack.Screen name="CardsList" component={CardsListScreen} />
      <Stack.Screen name="CardDetails" component={CardDetailsScreen} />
      <Stack.Screen name="CardSettings" component={CardDetailsScreen} />
      <Stack.Screen name="CardTransactions" component={CardTransactionsScreen} />
    </Stack.Navigator>
  );
};

export default CardsStackNavigator;
