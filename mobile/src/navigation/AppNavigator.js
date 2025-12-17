import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext';

// Auth Screens
import LoginScreen from '../screens/auth/LoginScreen';
import SignupScreen from '../screens/auth/SignupScreen';

// Customer Screens
import HomeScreen from '../screens/customer/HomeScreen';
import RidesScreen from '../screens/customer/RidesScreen';
import WalletScreen from '../screens/customer/WalletScreen';
import ProfileScreen from '../screens/customer/ProfileScreen';
import ChatScreen from '../screens/customer/ChatScreen';
import ManagerDashboardScreen from '../screens/customer/ManagerDashboardScreen';
import AdminDashboardScreen from '../screens/customer/AdminDashboardScreen';
import DriverApplicationScreen from '../screens/customer/DriverApplicationScreen';

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
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="home" size={size} color={color} />
          ),
        }}
      />
      
      <Tab.Screen
        name="Rides"
        component={RidesScreen}
        options={{
          tabBarLabel: 'Rides',
          headerTitle: 'My Rides',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="car" size={size} color={color} />
          ),
        }}
      />
      
      {isDriver && (
        <Tab.Screen
          name="Driver"
          component={DriverDashboardScreen}
          options={{
            tabBarLabel: 'Driver',
            headerTitle: 'Driver Dashboard',
            tabBarIcon: ({ color, size }) => (
              <Ionicons name="car" size={size} color={color} />
            ),
          }}
        />
      )}
      
      <Tab.Screen
        name="Wallet"
        component={WalletScreen}
        options={{
          tabBarLabel: 'Wallet',
          headerTitle: 'My Wallet',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="wallet" size={size} color={color} />
          ),
        }}
      />
      
      <Tab.Screen
        name="Chat"
        component={ChatScreen}
        options={{
          tabBarLabel: 'Support',
          headerTitle: 'Customer Support',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="chatbubbles" size={size} color={color} />
          ),
        }}
      />
      
      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{
          tabBarLabel: 'Profile',
          headerTitle: 'My Profile',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="person" size={size} color={color} />
          ),
        }}
      />
    </Tab.Navigator>
  );
}

// Main App Stack (includes tabs and modal screens)
function MainAppStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="MainTabs" component={CustomerTabs} />
      <Stack.Screen 
        name="DriverApplication" 
        component={DriverApplicationScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen 
        name="ManagerDashboard" 
        component={ManagerDashboardScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen 
        name="AdminDashboard" 
        component={AdminDashboardScreen}
        options={{ headerShown: false }}
      />
    </Stack.Navigator>
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
      {user ? <MainAppStack /> : <AuthStack />}
    </NavigationContainer>
  );
}
