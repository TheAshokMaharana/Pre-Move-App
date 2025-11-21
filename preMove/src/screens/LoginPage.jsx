import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Image,
  Modal,
} from 'react-native';
import { LoginScreenCss } from '../assets/css/ScreensCss';
import GradientBackground from '../components/GradientBackground';
import colors from '../theme/colors';
import { api } from '../utils/baseurl';

export default function LoginScreen({ navigation }) {
  const [phone, setPhone] = useState('');
  const [modalVisible, setModalVisible] = useState(false);
  const [modalMessage, setModalMessage] = useState('');
  const [isError, setIsError] = useState(false);

  const showModal = (message, error = false, delay = 1500, callback) => {
    setModalMessage(message);
    setIsError(error);
    setModalVisible(true);

    setTimeout(() => {
      setModalVisible(false);
      if (callback) callback();
    }, delay);
  };

  const handleSendCode = async () => {
    if (phone.length < 10) {
      showModal('Enter valid phone number', true);
      return;
    }

    try {
      const { data } = await api.post('send-otp', { phone });
      console.log('Send OTP response:', data);

      if (data.success) {
        showModal('OTP sent successfully!', false, 1000, () => {
          navigation.navigate('Otp', { phone });
        });
      } else {
        showModal(data.error || 'Failed to send OTP', true);
      }
    } catch (err) {
      console.error('❌ Send OTP Error:', err.response?.data || err.message);
      showModal('Server not reachable', true);
    }
  };

  return (
    <View style={LoginScreenCss.container}>
      <View style={LoginScreenCss.imageContainer}>
        <Image
          source={require('../assets/images/componylogo.png')}
          style={LoginScreenCss.logo}
        />
      </View>
      <GradientBackground style={LoginScreenCss.loginContainer}>
        <View
          style={{
            width: '100%',
            height: '60%',
            justifyContent: 'start',
            alignItems: 'center',
          }}
        >
          <Text style={LoginScreenCss.title}>Login to continue</Text>
          <View style={LoginScreenCss.inputContainer}>
            <Text style={LoginScreenCss.countryCode}>+91</Text>
            <TextInput
              style={LoginScreenCss.input}
              placeholder="Enter Phone Number"
              keyboardType="phone-pad"
              value={phone}
              onChangeText={setPhone}
              maxLength={10}
              placeholderTextColor={colors.muted}
            />
          </View>
          <Text style={LoginScreenCss.subtitle}>
            We will send an OTP to confirm your number
          </Text>
          <TouchableOpacity
            style={LoginScreenCss.button}
            onPress={handleSendCode}
          >
            <Text style={LoginScreenCss.buttonText}>Get verification code</Text>
          </TouchableOpacity>
        </View>
        <View>
          <TouchableOpacity
            onPress={() => navigation.navigate('ManagerLogin')}
            style={{
              paddingVertical: 10,
              paddingHorizontal: 20,
              borderWidth: 1,
              borderColor: colors.white,
              borderRadius: 8,
            }}
          >
            <Text style={{ color: colors.white }}>Manager Login</Text>
          </TouchableOpacity>
        </View>
      </GradientBackground>

      {/* ✅ Custom Modal */}
      <Modal transparent={true} animationType="fade" visible={modalVisible}>
        <View
          style={{
            flex: 1,
            backgroundColor: 'rgba(0,0,0,0.5)',
            justifyContent: 'center',
            alignItems: 'center',
          }}
        >
          <View
            style={{
              width: '80%',
              backgroundColor: 'white',
              borderRadius: 10,
              padding: 25,
              alignItems: 'center',
            }}
          >
            <Text
              style={{
                fontSize: 18,
                fontWeight: 'bold',
                color: isError ? '#f44336' : '#4CAF50',
                marginBottom: 15,
              }}
            >
              {isError ? 'Error' : 'Success'}
            </Text>
            <Text style={{ fontSize: 16, color: '#555', textAlign: 'center' }}>
              {modalMessage}
            </Text>
          </View>
        </View>
      </Modal>
    </View>
  );
}
 