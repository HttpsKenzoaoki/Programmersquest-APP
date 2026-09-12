import { NavigationContainer, DefaultTheme } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { StyleSheet, Text, View } from 'react-native';
import { useAuthStore } from '../store/useAuthStore';
import { LoginScreen } from '../screens/LoginScreen';
import { RegisterScreen } from '../screens/RegisterScreen';
import { HomeScreen } from '../screens/HomeScreen';
import { TrailScreen } from '../screens/TrailScreen';
import { LessonScreen } from '../screens/LessonScreen';
import { LeaguesScreen } from '../screens/LeaguesScreen';
import { ProfileScreen } from '../screens/ProfileScreen';
import { ContactScreen } from '../screens/ContactScreen';
import { AuditScreen } from '../screens/AuditScreen';
import { colors, spacing } from '../theme';

const RootStack = createNativeStackNavigator();
const AuthStack = createNativeStackNavigator();
const HomeStack = createNativeStackNavigator();
const Tabs = createBottomTabNavigator();

const theme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    background: colors.bg,
    card: colors.surface,
    text: colors.text,
    border: colors.border,
    primary: colors.primary,
  },
};

function AuthNavigator() {
  return (
    <AuthStack.Navigator screenOptions={{ headerShown: false }}>
      <AuthStack.Screen name="Login" component={LoginScreen} />
      <AuthStack.Screen name="Register" component={RegisterScreen} />
    </AuthStack.Navigator>
  );
}

function HomeNavigator() {
  return (
    <HomeStack.Navigator screenOptions={{ headerShown: false }}>
      <HomeStack.Screen name="Home" component={HomeScreen} />
      <HomeStack.Screen name="Trail" component={TrailScreen} />
      <HomeStack.Screen name="Lesson" component={LessonScreen} />
      <HomeStack.Screen name="Audit" component={AuditScreen} />
    </HomeStack.Navigator>
  );
}

const TAB_ICONS = {
  HomeTab: { icon: '🔮', label: 'Aprender' },
  LeaguesTab: { icon: '🏆', label: 'Ligas' },
  ProfileTab: { icon: '👤', label: 'Perfil' },
};

function TabIcon({ name, focused }) {
  const conf = TAB_ICONS[name];
  return (
    <View style={styles.tabIconWrap}>
      <Text style={[styles.tabIcon, !focused && styles.tabIconIdle]}>{conf.icon}</Text>
      <Text style={[styles.tabLabel, !focused && styles.tabLabelIdle]}>{conf.label}</Text>
    </View>
  );
}

function MainTabs() {
  return (
    <Tabs.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarStyle: styles.tabBar,
        tabBarActiveTintColor: colors.primaryLight,
        tabBarInactiveTintColor: colors.textFaint,
        tabBarIcon: ({ focused }) => <TabIcon name={route.name} focused={focused} />,
        tabBarShowLabel: false,
      })}>
      <Tabs.Screen name="HomeTab" component={HomeNavigator} />
      <Tabs.Screen name="LeaguesTab" component={LeaguesScreen} />
      <Tabs.Screen name="ProfileTab" component={ProfileScreen} />
    </Tabs.Navigator>
  );
}

export function RootNavigator() {
  const user = useAuthStore((s) => s.user);
  const initialized = useAuthStore((s) => s.initialized);

  if (!initialized) return null;

  return (
    <NavigationContainer theme={theme}>
      <RootStack.Navigator screenOptions={{ headerShown: false }}>
        {user ? (
          <>
            <RootStack.Screen name="Main" component={MainTabs} />
            <RootStack.Screen name="Audit" component={AuditScreen} />
            <RootStack.Screen
              name="Contact"
              component={ContactScreen}
              options={{ presentation: 'modal' }}
            />
          </>
        ) : (
          <RootStack.Screen name="Auth" component={AuthNavigator} />
        )}
      </RootStack.Navigator>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    backgroundColor: colors.surface,
    borderTopColor: colors.border,
    height: 76,
    paddingBottom: spacing.md,
    paddingTop: spacing.sm,
  },
  tabIconWrap: { alignItems: 'center', justifyContent: 'center', gap: 2 },
  tabIcon: { fontSize: 22 },
  tabIconIdle: { opacity: 0.45 },
  tabLabel: { fontSize: 11, fontWeight: '700', color: colors.primaryLight },
  tabLabelIdle: { color: colors.textFaint, fontWeight: '600' },
});
