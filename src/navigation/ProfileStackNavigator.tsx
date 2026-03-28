import React from 'react';
import { View, Text } from 'react-native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import type { ProfileStackParamList } from '@/types';

// ── Placeholder screens (replaced when actual screens are created) ────────────
const ProfileHomeScreen = () => (
  <View style={{ flex: 1 }}>
    <Text>ProfileHome</Text>
  </View>
);
const EditProfileScreen = () => (
  <View style={{ flex: 1 }}>
    <Text>EditProfile</Text>
  </View>
);
const ChangePasswordScreen = () => (
  <View style={{ flex: 1 }}>
    <Text>ChangePassword</Text>
  </View>
);
const SecuritySettingsScreen = () => (
  <View style={{ flex: 1 }}>
    <Text>SecuritySettings</Text>
  </View>
);
const NotificationSettingsScreen = () => (
  <View style={{ flex: 1 }}>
    <Text>NotificationSettings</Text>
  </View>
);
const LanguageScreen = () => (
  <View style={{ flex: 1 }}>
    <Text>Language</Text>
  </View>
);
const AboutScreen = () => (
  <View style={{ flex: 1 }}>
    <Text>About</Text>
  </View>
);
const SupportScreen = () => (
  <View style={{ flex: 1 }}>
    <Text>Support</Text>
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
      <Stack.Screen name="Language" component={LanguageScreen} />
      <Stack.Screen name="About" component={AboutScreen} />
      <Stack.Screen name="Support" component={SupportScreen} />
    </Stack.Navigator>
  );
};

export default ProfileStackNavigator;
