import React from 'react';
import { View, Text } from 'react-native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import type { ProfileStackParamList } from '@/types';
import ProfileHomeScreen from '@/screens/profile/ProfileHomeScreen';
import EditProfileScreen from '@/screens/profile/EditProfileScreen';
import ChangePasswordScreen from '@/screens/profile/ChangePasswordScreen';
import SecuritySettingsScreen from '@/screens/profile/SecuritySettingsScreen';
import NotificationSettingsScreen from '@/screens/profile/NotificationSettingsScreen';
import LanguageScreen from '@/screens/profile/LanguageScreen';
import AboutScreen from '@/screens/profile/AboutScreen';
import SupportScreen from '@/screens/profile/SupportScreen';

// Placeholder for DeviceManagement (not part of this task)
const DeviceManagementScreen = () => (
  <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
    <Text>Gestion des appareils</Text>
  </View>
);

const Stack = createNativeStackNavigator<ProfileStackParamList>();

const ProfileStackNavigator: React.FC = () => {
  return (
    <Stack.Navigator
      initialRouteName="ProfileHome"
      screenOptions={{
        headerShown: false,
        animation: 'slide_from_right',
      }}
    >
      <Stack.Screen name="ProfileHome" component={ProfileHomeScreen} />
      <Stack.Screen name="EditProfile" component={EditProfileScreen} />
      <Stack.Screen name="ChangePassword" component={ChangePasswordScreen} />
      <Stack.Screen name="SecuritySettings" component={SecuritySettingsScreen} />
      <Stack.Screen name="NotificationSettings" component={NotificationSettingsScreen} />
      <Stack.Screen name="DeviceManagement" component={DeviceManagementScreen} />
      <Stack.Screen name="Language" component={LanguageScreen} />
      <Stack.Screen name="About" component={AboutScreen} />
      <Stack.Screen name="Support" component={SupportScreen} />
    </Stack.Navigator>
  );
};

export default ProfileStackNavigator;
