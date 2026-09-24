import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import HomeScreen from './src/screens/HomeScreen';
import LoginScreen from './src/screens/LoginScreen';
import ListingDetailScreen from './src/screens/ListingDetailScreen';
import SignupScreen from './src/screens/SignupScreen';
import LandlordDashboardScreen from './src/screens/LandlordDashboardScreen';
import ChatScreen from './src/screens/ChatScreen';
import ChatListScreen from './src/screens/ChatListScreen';

const Stack = createNativeStackNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Home">
        <Stack.Screen name="Home" component={HomeScreen} options={{ title: 'MyStay', headerShown: false }} />
        <Stack.Screen name="ListingDetail" component={ListingDetailScreen} options={{ title: 'Details' }} />
        <Stack.Screen name="Login" component={LoginScreen} options={{ title: 'Login', headerShown: false }} />
        <Stack.Screen name="Signup" component={SignupScreen} options={{ title: 'Sign Up', headerShown: false }} />
        <Stack.Screen name="LandlordDashboard" component={LandlordDashboardScreen} options={{ title: 'Dashboard', headerShown: false }} />
        <Stack.Screen name="Chat" component={ChatScreen} options={{ title: 'Chat', headerShown: false }} />
        <Stack.Screen name="ChatList" component={ChatListScreen} options={{ title: 'Conversations', headerShown: false }} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
