import React from 'react';
import { StyleSheet } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';

import { useAppSelector } from '@/store';
import type { MainTabParamList } from '@/types';
import { COLORS, LIGHT_THEME_COLORS, DARK_THEME_COLORS } from '@/constants/colors';
import { BOTTOM_TAB, SPACING } from '@/constants/sizes';
import { FONT_SIZE } from '@/constants/fonts';

import HomeStackNavigator from './HomeStackNavigator';
import AccountsStackNavigator from './AccountsStackNavigator';
import CardsStackNavigator from './CardsStackNavigator';
import CreditsStackNavigator from './CreditsStackNavigator';
import InvestmentsStackNavigator from './InvestmentsStackNavigator';
import ProfileStackNavigator from './ProfileStackNavigator';

type IoniconsName = React.ComponentProps<typeof Ionicons>['name'];

const Tab = createBottomTabNavigator<MainTabParamList>();

interface TabIconProps {
  focused: boolean;
  color: string;
  size: number;
  name: IoniconsName;
  outlineName: IoniconsName;
}

const TabIcon: React.FC<TabIconProps> = ({ focused, color, size, name, outlineName }) => (
  <Ionicons name={focused ? name : outlineName} size={size} color={color} />
);

const MainNavigator: React.FC = () => {
  const theme = useAppSelector((state) => state.ui.theme);
  const unreadCount = useAppSelector((state) => state.ui.unreadNotificationsCount);
  const isAuthenticated = useAppSelector((state) => state.auth.isAuthenticated);

  if (!isAuthenticated) {
    return null;
  }

  const isDark = theme === 'dark';
  const themeColors = isDark ? DARK_THEME_COLORS : LIGHT_THEME_COLORS;

  return (
    <Tab.Navigator
      initialRouteName="HomeTab"
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: themeColors.tabBar,
          borderTopColor: themeColors.border,
          borderTopWidth: StyleSheet.hairlineWidth,
          height: BOTTOM_TAB.height,
          paddingBottom: SPACING.xs,
          paddingTop: SPACING.xs,
        },
        tabBarActiveTintColor: themeColors.tabBarActive,
        tabBarInactiveTintColor: themeColors.tabBarInactive,
        tabBarLabelStyle: {
          fontSize: FONT_SIZE.xxs,
        },
      }}
    >
      <Tab.Screen
        name="HomeTab"
        component={HomeStackNavigator}
        options={{
          tabBarLabel: 'Inicio',
          tabBarBadge: unreadCount > 0 ? unreadCount : undefined,
          tabBarBadgeStyle: { backgroundColor: COLORS.error },
          tabBarIcon: ({ focused, color, size }) => (
            <TabIcon
              focused={focused}
              color={color}
              size={size}
              name="home"
              outlineName="home-outline"
            />
          ),
        }}
      />
      <Tab.Screen
        name="AccountsTab"
        component={AccountsStackNavigator}
        options={{
          tabBarLabel: 'Cuentas',
          tabBarIcon: ({ focused, color, size }) => (
            <TabIcon
              focused={focused}
              color={color}
              size={size}
              name="business"
              outlineName="business-outline"
            />
          ),
        }}
      />
      <Tab.Screen
        name="CardsTab"
        component={CardsStackNavigator}
        options={{
          tabBarLabel: 'Tarjetas',
          tabBarIcon: ({ focused, color, size }) => (
            <TabIcon
              focused={focused}
              color={color}
              size={size}
              name="card"
              outlineName="card-outline"
            />
          ),
        }}
      />
      <Tab.Screen
        name="CreditsTab"
        component={CreditsStackNavigator}
        options={{
          tabBarLabel: 'Créditos',
          tabBarIcon: ({ focused, color, size }) => (
            <TabIcon
              focused={focused}
              color={color}
              size={size}
              name="cash"
              outlineName="cash-outline"
            />
          ),
        }}
      />
      <Tab.Screen
        name="InvestmentsTab"
        component={InvestmentsStackNavigator}
        options={{
          tabBarLabel: 'Invertir',
          tabBarIcon: ({ focused, color, size }) => (
            <TabIcon
              focused={focused}
              color={color}
              size={size}
              name="trending-up"
              outlineName="trending-up-outline"
            />
          ),
        }}
      />
      <Tab.Screen
        name="ProfileTab"
        component={ProfileStackNavigator}
        options={{
          tabBarLabel: 'Perfil',
          tabBarIcon: ({ focused, color, size }) => (
            <TabIcon
              focused={focused}
              color={color}
              size={size}
              name="person"
              outlineName="person-outline"
            />
          ),
        }}
      />
    </Tab.Navigator>
  );
};


export default MainNavigator;
