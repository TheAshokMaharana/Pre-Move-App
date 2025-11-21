import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { View } from 'react-native';
import colors from '../theme/colors';

// Heroicons
import {
  HomeIcon,
  ClipboardDocumentCheckIcon,
  UserGroupIcon,
  DocumentArrowDownIcon,
  ChartBarIcon,
  UserCircleIcon,
} from 'react-native-heroicons/outline';

// Manager Screens
import ManagerHomeScreen from '../screens/ManagerScreens/ManagerScreen';
import CustomerList from '../screens/ManagerScreens/All_Customer.jsx';
import ManagerProfile from '../screens/ManagerScreens/ManagerProfile.jsx';
import Reports from '../screens/ManagerScreens/Reports';
import ManagerLivelocation from '../screens/ManagerScreens/ManagerLivelocation.jsx';
import Header from '../components/Header.jsx';
import ManagerVisitRequests from '../screens/ManagerScreens/ManagerVisitRequests.jsx';
import GooglePlacesInput from '../screens/GooglePlacesInput.jsx';

const Tab = createBottomTabNavigator();

const ManagerBottomTab = () => (
  <View style={{ height: '100%' }}>
    <Header />
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.muted,
        tabBarStyle: {
          height: 70,
          paddingBottom: 10,
          paddingTop: 5,
        },
        tabBarIcon: ({ color, size }) => {
          const iconSize = size ?? 22;
          const iconsMap = {
            Home: <HomeIcon color={color} size={iconSize} />,
            Approvals: (
              <ClipboardDocumentCheckIcon color={color} size={iconSize} />
            ),
            Customers: <UserGroupIcon color={color} size={iconSize} />,
            "All Visits": <ChartBarIcon color={color} size={iconSize} />,
            Profile: <UserCircleIcon color={color} size={iconSize} />,
          };
          return iconsMap[route.name] || null;
        },
      })}
    >
      <Tab.Screen name="Home" component={ManagerVisitRequests} />
      {/* <Tab.Screen name="Home" component={ManagerHomeScreen} /> */}
      {/* <Tab.Screen name="Approvals" component={ManagerVisitRequests} /> */}
      <Tab.Screen name="Customers" component={CustomerList} />
      <Tab.Screen name="All Visits" component={Reports} />
      <Tab.Screen name="Profile" component={ManagerProfile} />
      {/* <Tab.Screen
        name="Quote"
        children={() => <GooglePlacesInput apiKey="AIzaSyD7NldCv3iPs3JbtuGOyuH3Y9m8cWfFQkI" /> }
      /> */}
    </Tab.Navigator>
  </View>
);

export default ManagerBottomTab;
