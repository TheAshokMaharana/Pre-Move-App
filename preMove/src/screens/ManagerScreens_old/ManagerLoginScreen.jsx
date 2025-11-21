import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Image, Alert } from 'react-native';
import { LoginScreenCss } from '../../assets/css/ScreensCss';
import GradientBackground from '../../components/GradientBackground';
import colors from '../../theme/colors';
import { api } from '../../utils/baseurl';

export default function ManagerLoginScreen({ navigation }) {
  const [phone, setPhone] = useState('');

  const handleSendCode = async () => {
    if (phone.length < 10) return Alert.alert('Error', 'Enter valid phone number');

    try {
      const response = await api('manager/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone }),
      });

      const data = await response.json();
      if (data.success) {
        navigation.navigate('ManagerOtpScreen', { phone });
      } else {
        Alert.alert('Error', data.error || 'Failed to send OTP');
      }
    } catch (err) {
      Alert.alert('Error', 'Server not reachable');
    }
  };

  return (
    <View style={LoginScreenCss.container}>
      <View style={LoginScreenCss.imageContainer}>
        <Image
          source={require('../../assets/images/componylogo.png')}
          style={LoginScreenCss.logo}
        />
      </View>
      <GradientBackground style={LoginScreenCss.loginContainer}>
        <View style={{ width: '100%', height: '60%', justifyContent: 'start', alignItems: 'center' }}>
          <Text style={LoginScreenCss.title}>Manager Login</Text>
          <View style={LoginScreenCss.inputContainer}>
            <Text style={LoginScreenCss.countryCode}>+91</Text>
            <TextInput
              style={LoginScreenCss.input}
              placeholder="Enter Manager Phone Number"
              keyboardType="phone-pad"
              value={phone}
              onChangeText={setPhone}
              maxLength={10}
              placeholderTextColor={colors.muted}
            />
          </View>
          <Text style={LoginScreenCss.subtitle}>
            OTP will be sent to your registered number
          </Text>
          <TouchableOpacity style={LoginScreenCss.button} onPress={handleSendCode}>
            <Text style={LoginScreenCss.buttonText}>Get verification code</Text>
          </TouchableOpacity>
        </View>
      </GradientBackground>
    </View>
  );
}
