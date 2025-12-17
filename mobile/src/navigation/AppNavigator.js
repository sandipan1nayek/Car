import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { useAuth } from '../context/AuthContext';

// Auth Screens
import LoginScreen from '../screens/auth/LoginScreen';
import SignupScreen from '../screens/auth/SignupScreen';

// Customer Screens
import HomeScreen from '../screens/customer/HomeScreen';
import WalletScreen from '../screens/customer/WalletScreen';
import ProfileScreen from '../screens/customer/ProfileScreen';

// Driver Screens
import DriverDashboardScreen from '../screens/driver/DriverDashboardScreen';

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

// Auth Stack
function AuthStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="Signup" component={SignupScreen} />
    </Stack.Navigator>
  );
}

// Customer Tabs
function CustomerTabs() {
  const { isDriver } = useAuth();

  return (
    <Tab.Navigator
      screenOptions={{
        tabBarActiveTintColor: '#000',
        tabBarInactiveTintColor: '#666',
      }}
    >
      <Tab.Screen
        name="Home"
        component={HomeScreen}
        options={{
          tabBarLabel: 'Home',
          headerTitle: 'Book a Ride',
        }}
      />
      
      {isDriver && (
        <Tab.Screen
          name="Driver"
          component={DriverDashboardScreen}
          options={{
            tabBarLabel: 'Driver',
            headerTitle: 'Driver Dashboard',
          }}
        />
      )}
      
      <Tab.Screen
        name="Wallet"
        component={WalletScreen}
        options={{
          tabBarLabel: 'Wallet',
          headerTitle: 'My Wallet',
        }}
      />
      
      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{
          tabBarLabel: 'Profile',
          headerTitle: 'My Profile',
        }}
      />
    </Tab.Navigator>
  );
}

// Main App Navigator
export default function AppNavigator() {
  const { user, loading } = useAuth();

  if (loading) {
    return null; // Or a loading screen
  }

  return (
    <NavigationContainer>
      {user ? <CustomerTabs /> : <AuthStack />}
    </NavigationContainer>
  );
}
