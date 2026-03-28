import React from 'react';
import { View, Text } from 'react-native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import type { CardsStackParamList } from '@/types';

// ── Placeholder screens (replaced when actual screens are created) ────────────
const CardsListScreen = () => (
  <View style={{ flex: 1 }}>
    <Text>CardsList</Text>
  </View>
);
const CardDetailsScreen = () => (
  <View style={{ flex: 1 }}>
    <Text>CardDetails</Text>
  </View>
);
const CardSettingsScreen = () => (
  <View style={{ flex: 1 }}>
    <Text>CardSettings</Text>
  </View>
);
const CardTransactionsScreen = () => (
  <View style={{ flex: 1 }}>
    <Text>CardTransactions</Text>
  </View>
);

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
      <Stack.Screen name="CardSettings" component={CardSettingsScreen} />
      <Stack.Screen name="CardTransactions" component={CardTransactionsScreen} />
    </Stack.Navigator>
  );
};

export default CardsStackNavigator;
