import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { CardStyleInterpolators } from '@react-navigation/stack';

// Navigations
import BottomTabs from './navigation/BottomTabs'; // Customer Tabs
import ManagerBottomTabs from './navigation/ManagerBottomTab'; // Manager Tabs

// Screens
import SplashScreen from './screens/SplashScreen';
import Additem from './screens/AddInventory';
import LoginPage from './screens/LoginPage';
import OtpScreen from './screens/OtpScreen';
import ManagerLoginScreen from './screens/ManagerScreens/ManagerLoginScreen';
import ManagerOtpScreen from './screens/ManagerScreens/ManagerOtpScreen';
import CustomerInventoryScreen from './screens/ManagerScreens/CustomerInventoryScreen';
import Inventory from './screens/Inventory';
import CustomerInventrory from './screens/ManagerScreens/CustomerLeadsScreen';
import InventoryScreen from './screens/ManagerScreens/InventoryScreen';
import ReviewInventory from './screens/ReviewInventory';
import CustomerLeads from './screens/CustomerLeads';
import FeedbackScreen from './screens/FeedbackScreen';
import HelpAndSupportScreen from './screens/HelpAndSupportScreen';
import ProfileScreen from './screens/ProfileScreen';
import TermsScreen from './screens/TermsScreen';
import ScheduleVisit from './screens/ScheduleVisitScreen';
import ManagerProfileScreen from './screens/ManagerScreens/ManagerProfileScreen';
import LeadVideosScreen from './screens/ManagerScreens/LeadVideosScreen';
import ManagerLivelocation from './screens/ManagerScreens/ManagerLivelocation';
import CustomerLeadsScreen from './screens/ManagerScreens/CustomerLeadsScreen';
import CustomerTrackingScreen from './screens/CustomerTrackingScreen';

const Stack = createNativeStackNavigator();

const AppNavigator = () => (
  <NavigationContainer>
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {/* Splash */}
      <Stack.Screen name="Splash" component={SplashScreen} />

      {/* Customer Auth */}
      <Stack.Screen name="Login" component={LoginPage} />
      <Stack.Screen name="Otp" component={OtpScreen} />

      {/* Customer Home */}
      <Stack.Screen
        name="HomePage"
        component={BottomTabs}
        options={{
          cardStyleInterpolator: CardStyleInterpolators.forVerticalIOS,
        }}
      />
      {/* Customer Screen */}
      <Stack.Screen name="Inventory" component={Inventory} />
      <Stack.Screen name="CustomerLead" component={CustomerLeads} />
      <Stack.Screen name="ProfileScreen" component={ProfileScreen} />
      <Stack.Screen name="FeedbackScreen" component={FeedbackScreen} />
      <Stack.Screen name="TermsScreen" component={TermsScreen} />
      <Stack.Screen name="ScheduleVisit" component={ScheduleVisit} />
      <Stack.Screen
        name="HelpAndSupportScreen"
        component={HelpAndSupportScreen}
      />
      
      {/* Manager Auth */}
      <Stack.Screen name="ManagerLogin" component={ManagerLoginScreen} />
      <Stack.Screen name="ManagerOtpScreen" component={ManagerOtpScreen} />
      <Stack.Screen
        name="ManagerProfileScreen"
        component={ManagerProfileScreen}
      />
      <Stack.Screen
        name="CustomerInventoryScreen"
        component={CustomerInventoryScreen}
      />
      <Stack.Screen name="CustomerLeadsScreen" component={CustomerLeadsScreen} />
      <Stack.Screen name="InventoryScreen" component={InventoryScreen} />
      <Stack.Screen name="LeadVideosScreen" component={LeadVideosScreen} />
      {/* Manager Home */}
      <Stack.Screen
        name="ManagerHomePage"
        component={ManagerBottomTabs}
        options={{
          cardStyleInterpolator: CardStyleInterpolators.forVerticalIOS,
        }}
      />

      {/* Common */}
      <Stack.Screen name="AddItem" component={Additem} />
      <Stack.Screen name="ReviewInventory" component={ReviewInventory} />
      <Stack.Screen name="ManagerLivelocation" component={ManagerLivelocation} />
      <Stack.Screen name="CustomerTrackingScreen" component={CustomerTrackingScreen} />
    </Stack.Navigator>
  </NavigationContainer>
);

export default AppNavigator;
