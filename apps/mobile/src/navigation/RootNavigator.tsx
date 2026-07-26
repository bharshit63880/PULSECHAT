import { Ionicons } from '@expo/vector-icons';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { NavigationContainer, DefaultTheme } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { ActivityIndicator, StyleSheet, View } from 'react-native';

import { ScreenContainer } from '@/components/common/ScreenContainer';
import { useAuthBootstrap } from '@/features/auth/use-auth-bootstrap';
import { ChatsScreen } from '@/screens/ChatsScreen';
import { ChatThreadScreen } from '@/screens/ChatThreadScreen';
import { DevicesScreen } from '@/screens/DevicesScreen';
import { LoginScreen } from '@/screens/LoginScreen';
import { RegisterScreen } from '@/screens/RegisterScreen';
import { SettingsScreen } from '@/screens/SettingsScreen';
import { VerifyEmailScreen } from '@/screens/VerifyEmailScreen';
import { useAuthStore } from '@/store/auth-store';
import { palette } from '@/styles/theme';

import type { MainTabParamList, RootStackParamList } from './types';

const Stack = createNativeStackNavigator<RootStackParamList>();
const Tabs = createBottomTabNavigator<MainTabParamList>();

const navTheme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    background: palette.background,
    card: palette.surface,
    primary: palette.accent,
    text: palette.ink,
    border: palette.line
  }
};

const MainTabs = () => (
  <Tabs.Navigator
    screenOptions={({ route }) => ({
      headerShown: false,
      tabBarActiveTintColor: palette.accent,
      tabBarInactiveTintColor: palette.muted,
      tabBarStyle: {
        backgroundColor: palette.surface,
        borderTopColor: palette.line,
        height: 68,
        paddingBottom: 8,
        paddingTop: 8
      },
      tabBarIcon: ({ color, size }) => {
        const iconName =
          route.name === 'Chats' ? 'chatbubble-ellipses' : route.name === 'Devices' ? 'shield-checkmark' : 'settings';
        return <Ionicons name={iconName} size={size} color={color} />;
      }
    })}
  >
    <Tabs.Screen name="Chats" component={ChatsScreen} />
    <Tabs.Screen name="Devices" component={DevicesScreen} />
    <Tabs.Screen name="Settings" component={SettingsScreen} />
  </Tabs.Navigator>
);

export const RootNavigator = () => {
  const { isBootstrapping } = useAuthBootstrap();
  const status = useAuthStore((state) => state.status);
  const user = useAuthStore((state) => state.user);

  if (isBootstrapping || status === 'booting') {
    return (
      <ScreenContainer>
        <View style={styles.loader}>
          <ActivityIndicator size="large" color={palette.accent} />
        </View>
      </ScreenContainer>
    );
  }

  return (
    <NavigationContainer theme={navTheme}>
      <Stack.Navigator>
        {status !== 'signed-in' ? (
          <>
            <Stack.Screen name="Login" component={LoginScreen} options={{ headerShown: false }} />
            <Stack.Screen name="Register" component={RegisterScreen} options={{ headerShown: false }} />
          </>
        ) : !user?.isEmailVerified ? (
          <Stack.Screen name="VerifyEmail" component={VerifyEmailScreen} options={{ headerShown: false }} />
        ) : (
          <>
            <Stack.Screen name="MainTabs" component={MainTabs} options={{ headerShown: false }} />
            <Stack.Screen
              name="ChatThread"
              component={ChatThreadScreen}
              options={({ route }) => ({
                title: route.params.title,
                headerTintColor: palette.ink,
                headerStyle: { backgroundColor: palette.background },
                headerShadowVisible: false
              })}
            />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
};

const styles = StyleSheet.create({
  loader: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center'
  }
});
