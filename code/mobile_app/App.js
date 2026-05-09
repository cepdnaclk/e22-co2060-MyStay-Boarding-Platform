import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import HomeScreen from './src/screens/HomeScreen';
import LoginScreen from './src/screens/LoginScreen';
import ListingDetailScreen from './src/screens/ListingDetailScreen';

const Stack = createNativeStackNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Home">
        <Stack.Screen name="Home" component={HomeScreen} options={{ title: 'MyStay' }} />
        <Stack.Screen name="ListingDetail" component={ListingDetailScreen} options={{ title: 'Details' }} />
        <Stack.Screen name="Login" component={LoginScreen} options={{ title: 'Login' }} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
