import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Text } from 'react-native';
import { COLORS } from './src/theme/tokens';

// Screens
import { HomeScreen } from './src/screens/HomeScreen';
import { SendMoneyScreen } from './src/screens/SendMoneyScreen';
import { InvestScreen } from './src/screens/InvestScreen';
import { TransactionsScreen } from './src/screens/TransactionsScreen';
import { ProfileScreen } from './src/screens/ProfileScreen';
import { AskAIScreen } from './src/screens/AskAIScreen';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: COLORS.actionGreen,
        tabBarInactiveTintColor: COLORS.textMuted,
        tabBarStyle: {
          backgroundColor: COLORS.white,
          borderTopColor: COLORS.borderColor,
          height: 60,
          paddingBottom: 8,
          paddingTop: 6,
        },
      }}
    >
      <Tab.Screen
        name="HomeTab"
        component={HomeScreen}
        options={{
          tabBarLabel: 'Home',
          tabBarIcon: ({ color }) => <Text style={{ fontSize: 18, color }}>🏠</Text>,
        }}
      />
      <Tab.Screen
        name="PaymentsTab"
        component={SendMoneyScreen}
        options={{
          tabBarLabel: 'Payments',
          tabBarIcon: ({ color }) => <Text style={{ fontSize: 18, color }}>💳</Text>,
        }}
      />
      <Tab.Screen
        name="InvestTab"
        component={InvestScreen}
        options={{
          tabBarLabel: 'Invest',
          tabBarIcon: ({ color }) => <Text style={{ fontSize: 18, color }}>📈</Text>,
        }}
      />
      <Tab.Screen
        name="AskAITab"
        component={AskAIScreen}
        options={{
          tabBarLabel: 'Ask AI',
          tabBarIcon: ({ color }) => <Text style={{ fontSize: 18, color }}>✨</Text>,
        }}
      />
      <Tab.Screen
        name="ProfileTab"
        component={ProfileScreen}
        options={{
          tabBarLabel: 'Profile',
          tabBarIcon: ({ color }) => <Text style={{ fontSize: 18, color }}>👤</Text>,
        }}
      />
    </Tab.Navigator>
  );
}

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator
        screenOptions={{
          headerStyle: { backgroundColor: COLORS.deepEmerald },
          headerTintColor: COLORS.white,
          headerTitleStyle: { fontWeight: 'bold' },
        }}
      >
        <Stack.Screen name="MainTabs" component={MainTabs} options={{ headerShown: false }} />
        <Stack.Screen name="SendMoney" component={SendMoneyScreen} options={{ title: 'Send Money' }} />
        <Stack.Screen name="Transactions" component={TransactionsScreen} options={{ title: 'Transaction History' }} />
        <Stack.Screen name="AddMoney" component={SendMoneyScreen} options={{ title: 'Add Money' }} />
        <Stack.Screen name="RequestMoney" component={SendMoneyScreen} options={{ title: 'Request & Receive' }} />
        <Stack.Screen name="Notifications" component={TransactionsScreen} options={{ title: 'Notifications' }} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
