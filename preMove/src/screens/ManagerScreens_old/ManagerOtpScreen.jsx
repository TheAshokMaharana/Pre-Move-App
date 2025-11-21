import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
  Image,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { OTPScreenCss } from '../../assets/css/ScreensCss';
import { api } from '../../utils/baseurl';

export default function ManagerOtpScreen({ route, navigation }) {
  const phone = route.params?.phone;
  const [otp, setOtp] = useState('');
  const [timer, setTimer] = useState(60);
  const [isResendDisabled, setIsResendDisabled] = useState(true);

  useEffect(() => {
    let interval;
    if (isResendDisabled && timer > 0) {
      interval = setInterval(() => setTimer(prev => prev - 1), 1000);
    } else if (timer === 0) {
      setIsResendDisabled(false);
    }
    return () => clearInterval(interval);
  }, [timer, isResendDisabled]);

  const handleVerifyOtp = async () => {
    if (!otp || otp.length < 4) {
      Alert.alert('Error', 'Enter valid OTP');
      return;
    }

    try {
      const response = await api.get(
        'manager/verify-otp',
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ phone, otp }),
        },
      );

      const data = await response.json();
      if (data.success && data.token) {
        await AsyncStorage.multiSet([
          [
            'APP_JWT_TOKEN',
            JSON.stringify({ token: data.token, expiry: data.expiry }),
          ],
          ['USER_PHONE', phone],
          ['USER_TYPE', 'manager'], // ✅ Fixed
          ['USER_ID', data.user.id.toString()],
          ['USER_DETAILS', JSON.stringify(data.user)],
        ]);

        console.log('Manager AsyncStorage saved ✅');
        navigation.replace('ManagerHomePage');
      } else {
        Alert.alert('Error', data.error || 'Invalid OTP');
      }
    } catch (err) {
      Alert.alert('Error', 'Server not reachable');
      console.error(err);
    }
  };

  const handleResendOtp = async () => {
    setIsResendDisabled(true);
    setTimer(60);

    try {
      const response = await api.get(
        'manager/send-otp',
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ phone }),
        },
      );

      const data = await response.json();
      if (data.success) {
        Alert.alert('Success', 'OTP resent successfully!');
      } else {
        Alert.alert('Error', data.error || 'Failed to resend OTP');
      }
    } catch (err) {
      Alert.alert('Error', 'Server not reachable');
      console.error(err);
    }
  };

  return (
    <View style={OTPScreenCss.container}>
      <Image
        source={require('../../assets/images/componylogo.png')}
        style={OTPScreenCss.logo}
      />
      <LinearGradient
        colors={['#00b894', '#0984e3']}
        style={OTPScreenCss.gradientBox}
      >
        <Text style={OTPScreenCss.otpTitle}>Enter OTP</Text>

        <TextInput
          style={OTPScreenCss.input}
          placeholder="----"
          keyboardType="number-pad"
          value={otp}
          onChangeText={setOtp}
          maxLength={6}
        />

        <TouchableOpacity disabled={isResendDisabled} onPress={handleResendOtp}>
          <Text
            style={[
              OTPScreenCss.resend,
              { color: isResendDisabled ? 'white' : 'yellow' },
            ]}
          >
            {isResendDisabled ? `Resend OTP in ${timer}s` : 'Resend OTP'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity style={OTPScreenCss.button} onPress={handleVerifyOtp}>
          <Text style={OTPScreenCss.buttonText}>Login</Text>
        </TouchableOpacity>
      </LinearGradient>
    </View>
  );
}
