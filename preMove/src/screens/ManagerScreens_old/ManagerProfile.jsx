import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Alert,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import GradientText from '../../components/GradientText';
import { InventoryScreenCss } from '../../assets/css/components';
import { AccountScreenCss } from '../../assets/css/ScreensCss';

// ✅ Heroicons
import {
  UserIcon,
  MapPinIcon,
  QuestionMarkCircleIcon,
} from 'react-native-heroicons/outline';
import {
  ChatBubbleOvalLeftEllipsisIcon,
  DocumentTextIcon,
} from 'react-native-heroicons/solid';
import colors from '../../theme/colors';

export default function ManagerProfile({ navigation }) {

  // ✅ Logout function
  const handleLogout = async () => {
    try {
      await AsyncStorage.removeItem('APP_JWT_TOKEN');
      // await AsyncStorage.removeItem('USER_PHONE'); // optional, if storing phone
      Alert.alert('Success', 'Logged out successfully!');
      navigation.replace('Login');
    } catch (err) {
      console.error('Logout error:', err);
      Alert.alert('Error', 'Failed to log out. Please try again.');
    }
  };

  return (
    <ScrollView style={AccountScreenCss.container}>
      <GradientText text="Account" style={InventoryScreenCss.title} />

      {/* Options List */}
      <View style={AccountScreenCss.card}>
        {/* Profile */}
        <TouchableOpacity style={AccountScreenCss.item}>
          <UserIcon size={28} color="#2196F3" />
          <View style={AccountScreenCss.textBox}>
            <Text style={AccountScreenCss.itemTitle}>Profile</Text>
            <Text style={AccountScreenCss.itemDesc}>
              Update personal information
            </Text>
          </View>
        </TouchableOpacity>

        <View style={{ justifyContent: 'center', alignItems: 'center', paddingVertical: 10 }}>
          <View style={{ width: '80%', height: 1, backgroundColor: colors.primary }} />
        </View>

        {/* Feedback */}
        <TouchableOpacity style={AccountScreenCss.item}>
          <ChatBubbleOvalLeftEllipsisIcon size={28} color="#4CAF50" />
          <View style={AccountScreenCss.textBox}>
            <Text style={AccountScreenCss.itemTitle}>Feedback</Text>
            <Text style={AccountScreenCss.itemDesc}>Your favourite exports</Text>
          </View>
        </TouchableOpacity>

        <View style={{ justifyContent: 'center', alignItems: 'center', paddingVertical: 10 }}>
          <View style={{ width: '80%', height: 1, backgroundColor: colors.primary }} />
        </View>

        {/* Addresses */}
        <TouchableOpacity style={AccountScreenCss.item}>
          <MapPinIcon size={28} color="#3F51B5" />
          <View style={AccountScreenCss.textBox}>
            <Text style={AccountScreenCss.itemTitle}>Addresses</Text>
            <Text style={AccountScreenCss.itemDesc}>Update personal information</Text>
          </View>
        </TouchableOpacity>

        <View style={{ justifyContent: 'center', alignItems: 'center', paddingVertical: 10 }}>
          <View style={{ width: '80%', height: 1, backgroundColor: colors.primary }} />
        </View>

        {/* Policies */}
        <TouchableOpacity style={AccountScreenCss.item}>
          <DocumentTextIcon size={28} color="#009688" />
          <View style={AccountScreenCss.textBox}>
            <Text style={AccountScreenCss.itemTitle}>Policies</Text>
            <Text style={AccountScreenCss.itemDesc}>Terms of use, Privacy policy and others</Text>
          </View>
        </TouchableOpacity>

        <View style={{ justifyContent: 'center', alignItems: 'center', paddingVertical: 10 }}>
          <View style={{ width: '80%', height: 1, backgroundColor: colors.primary }} />
        </View>

        {/* Help & Support */}
        <TouchableOpacity style={AccountScreenCss.item}>
          <QuestionMarkCircleIcon size={28} color="#00BCD4" />
          <View style={AccountScreenCss.textBox}>
            <Text style={AccountScreenCss.itemTitle}>Help & support</Text>
            <Text style={AccountScreenCss.itemDesc}>Reach out to us in case you have a question</Text>
          </View>
        </TouchableOpacity>
      </View>

      {/* Logout Button */}
      <TouchableOpacity style={AccountScreenCss.logoutBtn} onPress={handleLogout}>
        <Text style={AccountScreenCss.logoutText}>Log out</Text>
      </TouchableOpacity>

      {/* App Version */}
      <Text style={AccountScreenCss.version}>App version 1.0.0.0</Text>
    </ScrollView>
  );
}
