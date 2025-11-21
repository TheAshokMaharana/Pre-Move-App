// src/navigation/BottomTabs.jsx
import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import colors from '../theme/colors';

// Import Heroicons
import {
  HomeIcon,
  DocumentTextIcon,
  CubeIcon,
  TagIcon,
  UserIcon,
} from 'react-native-heroicons/outline';

import HomeScreen from '../screens/HomeScreen';
import RelocRequest from '../screens/RelocRequest';
import CustomerLeads from '../screens/CustomerLeads';
import Inventory from '../screens/Inventory';
import Quote from '../screens/CustomerScreen';
import Account from '../screens/Account';
import AddItem from '../screens/AddItem';
import { StyleSheet, View } from 'react-native';
import AddressBar from '../components/AddressBar';
import Googleplace from '../screens/GooglePlacesInput';
import CustomerTrackingScreen from '../screens/CustomerTrackingScreen';
import ManageLogin from '../screens/ManagerScreens/ManagerLoginScreen';
import Header from '../components/Header';
import GooglePlacesInput from '../screens/GooglePlacesInput';

const Tab = createBottomTabNavigator();

const BottomTabs = () => (
  <View style={{ height: '100%' }}>
    {/* <AddressBar /> */}
    <Header />
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.muted,
        tabBarStyle: {
          height: 70, // 👈 Increase height here
          paddingBottom: 10, // adjust for spacing
          paddingTop: 5,
          // borderTopLeftRadius: 30,
          // borderTopRightRadius: 30,
        },
        tabBarIcon: ({ color, size }) => {
          const iconSize = size ?? 22;
          const iconsMap = {
            Home: <HomeIcon color={color} size={iconSize} />,
            'Reloc Req': <DocumentTextIcon color={color} size={iconSize} />,
            Leads: <CubeIcon color={color} size={iconSize} />,
            Quote: <TagIcon color={color} size={iconSize} />,
            Account: <UserIcon color={color} size={iconSize} />,
          };
          return iconsMap[route.name] || null;
        },
      })}
    >
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen
        name="Reloc Req"
        children={() => (
          <RelocRequest apiKey="AIzaSyD7NldCv3iPs3JbtuGOyuH3Y9m8cWfFQkI" />
        )}
      />
      <Tab.Screen name="Leads" component={CustomerLeads} />
      {/* <Tab.Screen name="CustomerTrackingScreen" component={CustomerTrackingScreen} /> */}
      {/* <Tab.Screen name="Inventory" component={Inventory} /> */}
      {/* <Tab.Screen name="Quote" component={Quote} /> */}
      {/* <Tab.Screen
        name="Quote"
        children={() => (
          <GooglePlacesInput apiKey="AIzaSyD7NldCv3iPs3JbtuGOyuH3Y9m8cWfFQkI" />
        )}
      /> */}
      {/* <Tab.Screen
        name="Quote"
        children={() => <GooglePlacesInput apiKey="b9195fa64c6025a6b934d12710a68e45" /> }
      /> */}
      <Tab.Screen name="Account" component={Account} />
    </Tab.Navigator>
  </View>
);

const styles = StyleSheet.create({
  addressBar: {
    position: 'absolute',
    Top: 0,
    left: 0,
    right: 0,
    backgroundColor: 'transparent',
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
  },
});
export default BottomTabs;
