import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Modal,
  Pressable,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import GradientText from '../components/GradientText';
import { InventoryScreenCss } from '../assets/css/components';
import { AccountScreenCss } from '../assets/css/ScreensCss';

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
import colors from '../theme/colors';

export default function Account({ navigation }) {
  const [logoutModalVisible, setLogoutModalVisible] = useState(false);
  const [successModalVisible, setSuccessModalVisible] = useState(false);

  // ✅ Logout function
  const handleLogout = async () => {
    try {
      await AsyncStorage.removeItem("APP_JWT_TOKEN");
      setSuccessModalVisible(true); // show success modal

      // Auto-close success modal after 2 seconds
      setTimeout(() => {
        setSuccessModalVisible(false);
        navigation.replace("Login");
      }, 2000);

    } catch (err) {
      console.error("Logout error:", err);
      alert("Failed to log out. Please try again.");
    }
  };

  return (
    <ScrollView style={AccountScreenCss.container}>
      <GradientText text="Account" style={InventoryScreenCss.title} />

      {/* Options List */}
      <View style={AccountScreenCss.card}>
        {/* Profile */}
        <TouchableOpacity style={AccountScreenCss.item} onPress={() => navigation.navigate('ProfileScreen')}>
          <UserIcon size={28} color="#2196F3" />
          <View style={AccountScreenCss.textBox}>
            <Text style={AccountScreenCss.itemTitle}>Profile</Text>
            <Text style={AccountScreenCss.itemDesc}>Update personal information</Text>
          </View>
        </TouchableOpacity>

        <View style={{ justifyContent: 'center', alignItems: 'center', paddingVertical: 10 }}>
          <View style={{ width: '80%', height: 1, backgroundColor: colors.primary }} />
        </View>

        {/* Feedback */}
        <TouchableOpacity style={AccountScreenCss.item} onPress={() => navigation.navigate('FeedbackScreen')}>
          <ChatBubbleOvalLeftEllipsisIcon size={28} color="#4CAF50" />
          <View style={AccountScreenCss.textBox}>
            <Text style={AccountScreenCss.itemTitle}>Feedback</Text>
            <Text style={AccountScreenCss.itemDesc}>Your favourite exports</Text>
          </View>
        </TouchableOpacity>

        <View style={{ justifyContent: 'center', alignItems: 'center', paddingVertical: 10 }}>
          <View style={{ width: '80%', height: 1, backgroundColor: colors.primary }} />
        </View>

        {/* Policies */}
        <TouchableOpacity style={AccountScreenCss.item} onPress={() => navigation.navigate('TermsScreen')}>
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
        <TouchableOpacity style={AccountScreenCss.item} onPress={() => navigation.navigate('HelpAndSupportScreen')}>
          <QuestionMarkCircleIcon size={28} color="#00BCD4" />
          <View style={AccountScreenCss.textBox}>
            <Text style={AccountScreenCss.itemTitle}>Help & support</Text>
            <Text style={AccountScreenCss.itemDesc}>Reach out to us in case you have a question</Text>
          </View>
        </TouchableOpacity>
      </View>

      {/* Logout Button */}
      <TouchableOpacity
        style={AccountScreenCss.logoutBtn}
        onPress={() => setLogoutModalVisible(true)}
      >
        <Text style={AccountScreenCss.logoutText}>Log out</Text>
      </TouchableOpacity>

      {/* Custom Logout Modal */}
      <Modal
        transparent={true}
        animationType="fade"
        visible={logoutModalVisible}
        onRequestClose={() => setLogoutModalVisible(false)}
      >
        <View style={{
          flex:1,
          backgroundColor:'rgba(0,0,0,0.5)',
          justifyContent:'center',
          alignItems:'center'
        }}>
          <View style={{
            width:'80%',
            backgroundColor:'white',
            borderRadius:10,
            padding:20,
            alignItems:'center',
          }}>
            <Text style={{ fontSize:18, fontWeight:'bold', marginBottom:15 }}>Confirm Logout</Text>
            <Text style={{ fontSize:16, color:'#555', marginBottom:25, textAlign:'center' }}>
              Are you sure you want to log out?
            </Text>

            <View style={{ flexDirection:'row', justifyContent:'space-between', width:'100%' }}>
              <Pressable
                style={{
                  flex:1,
                  marginRight:10,
                  paddingVertical:10,
                  borderRadius:5,
                  backgroundColor:'#ccc',
                  alignItems:'center'
                }}
                onPress={() => setLogoutModalVisible(false)}
              >
                <Text style={{ fontWeight:'bold' }}>Cancel</Text>
              </Pressable>

              <Pressable
                style={{
                  flex:1,
                  marginLeft:10,
                  paddingVertical:10,
                  borderRadius:5,
                  backgroundColor:'#f44336',
                  alignItems:'center'
                }}
                onPress={() => {
                  setLogoutModalVisible(false);
                  handleLogout();
                }}
              >
                <Text style={{ fontWeight:'bold', color:'white' }}>Log out</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>

      {/* Styled Success Modal */}
      <Modal
        transparent={true}
        animationType="fade"
        visible={successModalVisible}
        onRequestClose={() => setSuccessModalVisible(false)}
      >
        <View style={{
          flex:1,
          backgroundColor:'rgba(0,0,0,0.5)',
          justifyContent:'center',
          alignItems:'center'
        }}>
          <View style={{
            width:'80%',
            backgroundColor:'white',
            borderRadius:10,
            padding:25,
            alignItems:'center',
          }}>
            <Text style={{ fontSize:20, fontWeight:'bold', color: '#4CAF50', marginBottom:15 }}>
              ✅ Success
            </Text>
            <Text style={{ fontSize:16, color:'#555', textAlign:'center' }}>
              You have logged out successfully!
            </Text>
          </View>
        </View>
      </Modal>

      {/* App Version */}
      <Text style={AccountScreenCss.version}>App version 1.0.0.0</Text>
    </ScrollView>
  );
}
